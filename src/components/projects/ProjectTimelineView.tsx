import { useState, useMemo } from "react"
import { addMonths, format, startOfMonth, setMonth } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { useTimelineData } from "./timeline/useTimelineData"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { TimelineMonth } from "./timeline/TimelineMonth"
import { TimelineActions } from "./timeline/TimelineActions"
import { TimelineSummary } from "./timeline/TimelineSummary"
import { useTimelineCalculations } from "./timeline/TimelineCalculations"
import { useProjectYear } from "@/hooks/use-project-year"
import { ProjectAllocationDialog } from "./allocations/ProjectAllocationDialog"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useProjectSettings } from "@/hooks/use-project-settings"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
  salary_cost: number
  team_member_id: string
  project_assignment_id: string
}

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  const { year, setYear } = useProjectYear()
  const [startDate, setStartDate] = useState(() => {
    return startOfMonth(setMonth(new Date(year, 0), 0))
  })

  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [addOverheadCostDate, setAddOverheadCostDate] = useState<Date | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [selectedOverheadCost, setSelectedOverheadCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [deleteOverheadCost, setDeleteOverheadCost] = useState<TimelineItem | null>(null)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null)
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)

  const { toast } = useToast()
  const { getOverheadPercentage, settings } = useProjectSettings()

  const { revenues, variableCosts, overheadCosts, allocations } = useTimelineData(projectId)

  const totalProfit = useMemo(() => {
    const totalRevenues = revenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0
    const totalVariableCosts = variableCosts?.reduce((sum, c) => sum + Number(c.amount), 0) || 0
    
    const overheadPercentage = getOverheadPercentage(year)
    const totalOverheadCosts = (totalVariableCosts * overheadPercentage) / 100
    
    const totalSalaryCosts = allocations?.reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0
    const totalCosts = totalVariableCosts + totalOverheadCosts + totalSalaryCosts
    const profit = totalRevenues - totalCosts

    const rentability = totalCosts > 0 ? (profit / totalCosts) * 100 : 0
    return {
      amount: profit,
      rentability
    }
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage, settings])

  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name")
        .eq("left_company", false)
        .order("name")

      if (error) throw error
      return data
    },
  })

  const { totalProfit: totalProfitCalc } = useTimelineCalculations(
    revenues,
    variableCosts,
    overheadCosts,
    allocations,
    year
  )

  const handlePreviousYear = () => {
    const newYear = year - 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  const handleNextYear = () => {
    const newYear = year + 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  const handleAllocationSubmit = async (values: {
    teamMemberId: string
    month: Date
    allocation: string
  }) => {
    try {
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("project_id", projectId)
        .eq("team_member_id", values.teamMemberId)
        .maybeSingle()

      let assignmentId: string

      if (!existingAssignment) {
        const { data: newAssignment, error: createError } = await supabase
          .from("project_assignments")
          .insert({
            project_id: projectId,
            team_member_id: values.teamMemberId,
            start_date: format(values.month, "yyyy-MM-dd"),
          })
          .select("id")
          .single()

        if (createError) throw createError
        if (!newAssignment) throw new Error("Failed to create assignment")
        
        assignmentId = newAssignment.id
      } else {
        assignmentId = existingAssignment.id
      }

      const monthStr = format(startOfMonth(values.month), "yyyy-MM-dd")

      const { data: existingAllocation, error: checkError } = await supabase
        .from("project_member_allocations")
        .select("id")
        .eq("project_assignment_id", assignmentId)
        .eq("month", monthStr)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingAllocation) {
        const { error: updateError } = await supabase
          .from("project_member_allocations")
          .update({
            allocation_percentage: parseInt(values.allocation),
          })
          .eq("id", existingAllocation.id)

        if (updateError) throw updateError

        toast({
          title: "Success",
          description: "Team member allocation updated successfully",
        })
      } else {
        const { error: insertError } = await supabase
          .from("project_member_allocations")
          .insert({
            project_assignment_id: assignmentId,
            month: monthStr,
            allocation_percentage: parseInt(values.allocation),
          })

        if (insertError) throw insertError

        toast({
          title: "Success",
          description: "Team member allocation added successfully",
        })
      }

      setAllocationDialogOpen(false)
      setSelectedAllocation(null)
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const calculateAccumulatedProfitUpToMonth = (targetMonth: Date) => {
    const targetMonthStr = format(targetMonth, "yyyy-MM")
    
    const accumulatedRevenues = revenues
      ?.filter(r => r.month <= targetMonthStr)
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0

    const accumulatedVariableCosts = variableCosts
      ?.filter(c => c.month <= targetMonthStr)
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0

    const overheadPercentage = getOverheadPercentage(year)
    
    const accumulatedOverheadCosts = (accumulatedVariableCosts * overheadPercentage) / 100

    const accumulatedSalaryCosts = allocations
      ?.filter(a => a.month <= targetMonthStr)
      .reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0

    return accumulatedRevenues - accumulatedVariableCosts - accumulatedOverheadCosts - accumulatedSalaryCosts
  }

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onAddOverheadCost={() => {
          setSelectedAllocation(null)
          setAllocationDialogOpen(true)
        }}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProfit={totalProfit.amount}
        startDate={startDate}
      />
      <CardContent className="space-y-6">
        <TimelineSummary
          year={year}
          revenues={revenues}
          variableCosts={variableCosts}
          overheadCosts={overheadCosts}
          allocations={allocations}
        />
        
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {months.map((month) => {
                const monthStr = format(month, "yyyy-MM")
                const monthRevenues = revenues?.filter(
                  (r) => r.month.startsWith(monthStr)
                ) || []
                const monthVariableCosts = variableCosts?.filter(
                  (c) => c.month.startsWith(monthStr)
                ) || []
                const monthOverheadCosts = overheadCosts?.filter(
                  (c) => c.month.startsWith(monthStr)
                ) || []
                const monthAllocations = allocations?.filter(
                  (a) => a.month.startsWith(monthStr)
                ) || []

                return (
                  <TimelineMonth
                    key={month.getTime()}
                    month={month}
                    revenues={monthRevenues}
                    variableCosts={monthVariableCosts}
                    overheadCosts={monthOverheadCosts}
                    allocations={monthAllocations}
                    onSelectRevenue={setSelectedRevenue}
                    onSelectVariableCost={setSelectedVariableCost}
                    onSelectOverheadCost={setSelectedOverheadCost}
                    onSelectAllocation={(allocation) => {
                      setSelectedAllocation(allocation)
                      setAllocationDialogOpen(true)
                    }}
                    accumulatedProfit={calculateAccumulatedProfitUpToMonth(month)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <TimelineActions
          projectId={projectId}
          addRevenueDate={addRevenueDate}
          addVariableCostDate={addVariableCostDate}
          addOverheadCostDate={addOverheadCostDate}
          selectedRevenue={selectedRevenue}
          selectedVariableCost={selectedVariableCost}
          selectedOverheadCost={selectedOverheadCost}
          deleteRevenue={deleteRevenue}
          deleteVariableCost={deleteVariableCost}
          deleteOverheadCost={deleteOverheadCost}
          setAddRevenueDate={setAddRevenueDate}
          setAddVariableCostDate={setAddVariableCostDate}
          setAddOverheadCostDate={setAddOverheadCostDate}
          setSelectedRevenue={setSelectedRevenue}
          setSelectedVariableCost={setSelectedVariableCost}
          setSelectedOverheadCost={setSelectedOverheadCost}
          setDeleteRevenue={setDeleteRevenue}
          setDeleteVariableCost={setDeleteVariableCost}
          setDeleteOverheadCost={setDeleteOverheadCost}
        />

        <ProjectAllocationDialog
          projectId={projectId}
          open={allocationDialogOpen}
          onOpenChange={setAllocationDialogOpen}
          onSubmit={handleAllocationSubmit}
          teamMembers={teamMembers || []}
          initialAllocation={selectedAllocation ? {
            id: selectedAllocation.id,
            teamMemberId: selectedAllocation.team_member_id,
            month: new Date(selectedAllocation.month),
            allocation: selectedAllocation.allocation_percentage.toString(),
          } : undefined}
        />
      </CardContent>
    </Card>
  )
}
