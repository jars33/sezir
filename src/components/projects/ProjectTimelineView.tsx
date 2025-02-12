
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addMonths, format, startOfMonth, setMonth } from "date-fns"
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ProjectRevenueDialog } from "./revenues/ProjectRevenueDialog"
import { ProjectVariableCostDialog } from "./costs/ProjectVariableCostDialog"
import { ProjectOverheadCostDialog } from "./costs/ProjectOverheadCostDialog"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  const queryClient = useQueryClient()
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return startOfMonth(setMonth(now, 0)) // Set to January of current year
  })
  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [addOverheadCostDate, setAddOverheadCostDate] = useState<Date | null>(null)

  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))

  const { data: revenues } = useQuery({
    queryKey: ["project-revenues", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_revenues")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load revenues")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const { data: variableCosts } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load variable costs")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const { data: overheadCosts } = useQuery({
    queryKey: ["project-overhead-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_overhead_costs")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load overhead costs")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const handlePreviousYear = () => {
    setStartDate(prev => addMonths(prev, -12))
  }

  const handleNextYear = () => {
    setStartDate(prev => addMonths(prev, 12))
  }

  const handleAddRevenue = async (values: { month: string; amount: string }) => {
    try {
      const { error } = await supabase.from("project_revenues").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        },
      ])

      if (error) throw error

      // Invalidate both queries to ensure timeline and revenue list update
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue added successfully")
      setAddRevenueDate(null)
    } catch (error) {
      toast.error("Failed to add revenue")
    }
  }

  const handleAddVariableCost = async (values: {
    month: string
    amount: string
    description: string
  }) => {
    try {
      const { error } = await supabase.from("project_variable_costs").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
          description: values.description,
        },
      ])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      toast.success("Variable cost added successfully")
      setAddVariableCostDate(null)
    } catch (error) {
      toast.error("Failed to add variable cost")
    }
  }

  const handleAddOverheadCost = async (values: { month: string; amount: string }) => {
    try {
      const { error } = await supabase.from("project_overhead_costs").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        },
      ])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      toast.success("Overhead cost added successfully")
      setAddOverheadCostDate(null)
    } catch (error) {
      toast.error("Failed to add overhead cost")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Project Timeline</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-green-50 hover:text-green-600"
                onClick={() => setAddRevenueDate(new Date())}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Revenue
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setAddVariableCostDate(new Date())}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Variable Cost
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-orange-50 hover:text-orange-600"
                onClick={() => setAddOverheadCostDate(new Date())}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Overhead Cost
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousYear}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextYear}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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

            // Calculate total revenue and costs
            const totalRevenue = monthRevenues.reduce((sum, r) => sum + Number(r.amount), 0)
            const totalVariableCosts = monthVariableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
            const totalOverheadCosts = monthOverheadCosts.reduce((sum, c) => sum + Number(c.amount), 0)
            const profit = totalRevenue - totalVariableCosts - totalOverheadCosts

            return (
              <div
                key={month.getTime()}
                className="bg-white p-2 min-h-[150px] space-y-2"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h3 className="text-sm font-medium">{format(month, "MMM yyyy")}</h3>
                </div>

                {monthRevenues?.map((revenue) => (
                  <div
                    key={revenue.id}
                    className="p-1.5 bg-green-50 border border-green-200 rounded text-sm"
                  >
                    ${revenue.amount.toFixed(2)}
                  </div>
                ))}

                {monthVariableCosts?.map((cost) => (
                  <div
                    key={cost.id}
                    className="p-1.5 bg-blue-50 border border-blue-200 rounded text-sm"
                  >
                    <div>${cost.amount.toFixed(2)}</div>
                    {cost.description && (
                      <div className="text-xs text-gray-600">{cost.description}</div>
                    )}
                  </div>
                ))}

                {monthOverheadCosts?.map((cost) => (
                  <div
                    key={cost.id}
                    className="p-1.5 bg-orange-50 border border-orange-200 rounded text-sm"
                  >
                    ${cost.amount.toFixed(2)}
                  </div>
                ))}

                {/* Profit line */}
                <div className={`mt-auto p-1.5 rounded text-sm font-medium ${
                  profit >= 0 
                    ? "bg-purple-50 border border-purple-200 text-purple-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  Profit: ${profit.toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>

        <ProjectRevenueDialog
          open={Boolean(addRevenueDate)}
          onOpenChange={(open) => !open && setAddRevenueDate(null)}
          onSubmit={handleAddRevenue}
          defaultValues={
            addRevenueDate
              ? {
                  month: format(addRevenueDate, "yyyy-MM"),
                  amount: "",
                }
              : undefined
          }
        />

        <ProjectVariableCostDialog
          open={Boolean(addVariableCostDate)}
          onOpenChange={(open) => !open && setAddVariableCostDate(null)}
          onSubmit={handleAddVariableCost}
          defaultValues={
            addVariableCostDate
              ? {
                  month: format(addVariableCostDate, "yyyy-MM"),
                  amount: "",
                  description: "",
                }
              : undefined
          }
        />

        <ProjectOverheadCostDialog
          open={Boolean(addOverheadCostDate)}
          onOpenChange={(open) => !open && setAddOverheadCostDate(null)}
          onSubmit={handleAddOverheadCost}
          defaultValues={
            addOverheadCostDate
              ? {
                  month: format(addOverheadCostDate, "yyyy-MM"),
                  amount: "",
                }
              : undefined
          }
        />
      </CardContent>
    </Card>
  )
}
