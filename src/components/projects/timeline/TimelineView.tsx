import { Card, CardContent } from "@/components/ui/card"
import { TimelineHeader } from "./TimelineHeader"
import { TimelineMonth } from "./TimelineMonth"
import { TimelineActions } from "./TimelineActions"
import { TimelineSummary } from "./TimelineSummary"
import { useTimelineCalculations } from "./TimelineCalculations"
import { useTimelineData } from "./useTimelineData"
import { useProjectYear } from "@/hooks/use-project-year"
import { ProjectAllocationDialog } from "../allocations/ProjectAllocationDialog"
import { useState, useCallback, useMemo } from "react"
import { addMonths, format, startOfMonth, setMonth } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import { useProjectSettings } from "@/hooks/use-project-settings"
import type { TimelineItem, AllocationItem } from "./actions/types"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface TimelineViewProps {
  projectId: string
}

export function TimelineView({ projectId }: TimelineViewProps) {
  const { year, setYear } = useProjectYear()
  const [startDate, setStartDate] = useState(() => {
    return startOfMonth(setMonth(new Date(year, 0), 0))
  })

  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null)
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const { getOverheadPercentage, settings } = useProjectSettings()
  const { toast } = useToast()

  const { revenues, variableCosts, overheadCosts, allocations, isLoading, refetchTimelineData } = useTimelineData(projectId)

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

  const handleVariableCostUpdate = async () => {
    queryClient.invalidateQueries({ queryKey: ["project-variable-costs", projectId] })
    queryClient.invalidateQueries({ queryKey: ["project-revenues", projectId] })
    await refetchTimelineData()
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
      
      await refetchTimelineData()
    } catch (error: any) {
      console.error("Error managing allocation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const calculateAccumulatedProfitUpToMonth = useCallback((targetMonth: Date) => {
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
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  const handleRevenueSeleсtion = (revenue: TimelineItem) => {
    if (revenue.isNew) {
      setAddRevenueDate(new Date(revenue.month))
    } else {
      setSelectedRevenue(revenue)
    }
  }

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => addMonths(startDate, i)), [startDate])

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProfit={totalProfitCalc}
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
              {months.map((month) => (
                <TimelineMonth
                  key={month.getTime()}
                  month={month}
                  revenues={revenues?.filter(r => r.month.startsWith(format(month, "yyyy-MM"))) || []}
                  variableCosts={variableCosts?.filter(c => c.month.startsWith(format(month, "yyyy-MM"))) || []}
                  overheadCosts={overheadCosts?.filter(c => c.month.startsWith(format(month, "yyyy-MM"))) || []}
                  allocations={allocations?.filter(a => a.month.startsWith(format(month, "yyyy-MM"))) || []}
                  onSelectRevenue={handleRevenueSeleсtion}
                  onSelectVariableCost={setSelectedVariableCost}
                  onSelectOverheadCost={() => {}}
                  onSelectAllocation={(allocation) => {
                    setSelectedAllocation(allocation)
                    setAllocationDialogOpen(true)
                  }}
                  accumulatedProfit={calculateAccumulatedProfitUpToMonth(month)}
                />
              ))}
            </div>
          </div>
        </div>

        <TimelineActions
          projectId={projectId}
          addRevenueDate={addRevenueDate}
          addVariableCostDate={addVariableCostDate}
          selectedRevenue={selectedRevenue}
          selectedVariableCost={selectedVariableCost}
          deleteRevenue={deleteRevenue}
          deleteVariableCost={deleteVariableCost}
          setAddRevenueDate={setAddRevenueDate}
          setAddVariableCostDate={setAddVariableCostDate}
          setSelectedRevenue={setSelectedRevenue}
          setSelectedVariableCost={setSelectedVariableCost}
          setDeleteRevenue={setDeleteRevenue}
          setDeleteVariableCost={setDeleteVariableCost}
          onVariableCostUpdate={handleVariableCostUpdate}
        />

        <ProjectAllocationDialog
          projectId={projectId}
          open={allocationDialogOpen}
          onOpenChange={setAllocationDialogOpen}
          onSubmit={handleAllocationSubmit}
          teamMembers={[]}
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
