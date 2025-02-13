
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { addMonths, format, startOfMonth, setMonth, getYear } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ProjectRevenueDialog } from "./revenues/ProjectRevenueDialog"
import { ProjectVariableCostDialog } from "./costs/ProjectVariableCostDialog"
import { ProjectOverheadCostDialog } from "./costs/ProjectOverheadCostDialog"
import { DeleteCostDialog } from "./costs/DeleteCostDialog"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { TimelineMonth } from "./timeline/TimelineMonth"
import { useTimelineData } from "./timeline/useTimelineData"

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
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [selectedOverheadCost, setSelectedOverheadCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [deleteOverheadCost, setDeleteOverheadCost] = useState<TimelineItem | null>(null)

  const { revenues, variableCosts, overheadCosts } = useTimelineData(projectId)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i))
  const currentYear = getYear(startDate)

  // Calculate total profit for the displayed year only
  const totalRevenues = revenues?.reduce((sum, r) => {
    const year = getYear(new Date(r.month))
    return year === currentYear ? sum + Number(r.amount) : sum
  }, 0) || 0

  const totalVariableCosts = variableCosts?.reduce((sum, c) => {
    const year = getYear(new Date(c.month))
    return year === currentYear ? sum + Number(c.amount) : sum
  }, 0) || 0

  const totalOverheadCosts = overheadCosts?.reduce((sum, c) => {
    const year = getYear(new Date(c.month))
    return year === currentYear ? sum + Number(c.amount) : sum
  }, 0) || 0

  const totalProfit = totalRevenues - totalVariableCosts - totalOverheadCosts

  const handlePreviousYear = () => {
    setStartDate(prev => addMonths(prev, -12))
  }

  const handleNextYear = () => {
    setStartDate(prev => addMonths(prev, 12))
  }

  const handleCreateRevenue = async (values: { month: string; amount: string }) => {
    try {
      const { error } = await supabase.from("project_revenues").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        },
      ])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue added successfully")
      setAddRevenueDate(null)
    } catch (error) {
      toast.error("Failed to add revenue")
    }
  }

  const handleCreateVariableCost = async (values: { month: string; amount: string; description: string }) => {
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

  const handleCreateOverheadCost = async (values: { month: string; amount: string }) => {
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

  const handleUpdateRevenue = async (values: { month: string; amount: string }) => {
    if (!selectedRevenue) return
    try {
      const { error } = await supabase
        .from("project_revenues")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        })
        .eq("id", selectedRevenue.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue updated successfully")
      setSelectedRevenue(null)
    } catch (error) {
      toast.error("Failed to update revenue")
    }
  }

  const handleUpdateVariableCost = async (values: { month: string; amount: string; description: string }) => {
    if (!selectedVariableCost) return
    try {
      const { error } = await supabase
        .from("project_variable_costs")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
          description: values.description,
        })
        .eq("id", selectedVariableCost.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      toast.success("Variable cost updated successfully")
      setSelectedVariableCost(null)
    } catch (error) {
      toast.error("Failed to update variable cost")
    }
  }

  const handleUpdateOverheadCost = async (values: { month: string; amount: string }) => {
    if (!selectedOverheadCost) return
    try {
      const { error } = await supabase
        .from("project_overhead_costs")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        })
        .eq("id", selectedOverheadCost.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      toast.success("Overhead cost updated successfully")
      setSelectedOverheadCost(null)
    } catch (error) {
      toast.error("Failed to update overhead cost")
    }
  }

  const handleDeleteRevenue = async () => {
    if (!deleteRevenue) return
    try {
      const { error } = await supabase
        .from("project_revenues")
        .delete()
        .eq("id", deleteRevenue.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue deleted successfully")
      setDeleteRevenue(null)
    } catch (error) {
      toast.error("Failed to delete revenue")
    }
  }

  const handleDeleteVariableCost = async () => {
    if (!deleteVariableCost) return
    try {
      const { error } = await supabase
        .from("project_variable_costs")
        .delete()
        .eq("id", deleteVariableCost.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      toast.success("Variable cost deleted successfully")
      setDeleteVariableCost(null)
    } catch (error) {
      toast.error("Failed to delete variable cost")
    }
  }

  const handleDeleteOverheadCost = async () => {
    if (!deleteOverheadCost) return
    try {
      const { error } = await supabase
        .from("project_overhead_costs")
        .delete()
        .eq("id", deleteOverheadCost.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      toast.success("Overhead cost deleted successfully")
      setDeleteOverheadCost(null)
    } catch (error) {
      toast.error("Failed to delete overhead cost")
    }
  }

  return (
    <Card>
      <TimelineHeader
        onAddRevenue={() => setAddRevenueDate(new Date())}
        onAddVariableCost={() => setAddVariableCostDate(new Date())}
        onAddOverheadCost={() => setAddOverheadCostDate(new Date())}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        totalProfit={totalProfit}
        startDate={startDate}
      />
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

            return (
              <TimelineMonth
                key={month.getTime()}
                month={month}
                revenues={monthRevenues}
                variableCosts={monthVariableCosts}
                overheadCosts={monthOverheadCosts}
                onSelectRevenue={setSelectedRevenue}
                onSelectVariableCost={setSelectedVariableCost}
                onSelectOverheadCost={setSelectedOverheadCost}
              />
            )
          })}
        </div>

        <ProjectRevenueDialog
          open={Boolean(addRevenueDate)}
          onOpenChange={(open) => !open && setAddRevenueDate(null)}
          onSubmit={handleCreateRevenue}
          defaultValues={
            addRevenueDate
              ? {
                  month: format(addRevenueDate, "yyyy-MM"),
                  amount: "",
                }
              : undefined
          }
        />

        <ProjectRevenueDialog
          open={Boolean(selectedRevenue)}
          onOpenChange={(open) => !open && setSelectedRevenue(null)}
          onSubmit={handleUpdateRevenue}
          defaultValues={
            selectedRevenue
              ? {
                  month: selectedRevenue.month.slice(0, 7),
                  amount: selectedRevenue.amount.toString(),
                }
              : undefined
          }
          showDelete
          onDelete={() => {
            setDeleteRevenue(selectedRevenue)
            setSelectedRevenue(null)
          }}
        />

        <ProjectVariableCostDialog
          open={Boolean(addVariableCostDate)}
          onOpenChange={(open) => !open && setAddVariableCostDate(null)}
          onSubmit={handleCreateVariableCost}
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

        <ProjectVariableCostDialog
          open={Boolean(selectedVariableCost)}
          onOpenChange={(open) => !open && setSelectedVariableCost(null)}
          onSubmit={handleUpdateVariableCost}
          defaultValues={
            selectedVariableCost
              ? {
                  month: selectedVariableCost.month.slice(0, 7),
                  amount: selectedVariableCost.amount.toString(),
                  description: selectedVariableCost.description || "",
                }
              : undefined
          }
          showDelete
          onDelete={() => {
            setDeleteVariableCost(selectedVariableCost)
            setSelectedVariableCost(null)
          }}
        />

        <ProjectOverheadCostDialog
          open={Boolean(addOverheadCostDate)}
          onOpenChange={(open) => !open && setAddOverheadCostDate(null)}
          onSubmit={handleCreateOverheadCost}
          defaultValues={
            addOverheadCostDate
              ? {
                  month: format(addOverheadCostDate, "yyyy-MM"),
                  amount: "",
                }
              : undefined
          }
        />

        <ProjectOverheadCostDialog
          open={Boolean(selectedOverheadCost)}
          onOpenChange={(open) => !open && setSelectedOverheadCost(null)}
          onSubmit={handleUpdateOverheadCost}
          defaultValues={
            selectedOverheadCost
              ? {
                  month: selectedOverheadCost.month.slice(0, 7),
                  amount: selectedOverheadCost.amount.toString(),
                }
              : undefined
          }
          showDelete
          onDelete={() => {
            setDeleteOverheadCost(selectedOverheadCost)
            setSelectedOverheadCost(null)
          }}
        />

        <DeleteCostDialog
          open={Boolean(deleteRevenue)}
          onOpenChange={(open) => !open && setDeleteRevenue(null)}
          onConfirm={handleDeleteRevenue}
          type="revenue"
        />

        <DeleteCostDialog
          open={Boolean(deleteVariableCost)}
          onOpenChange={(open) => !open && setDeleteVariableCost(null)}
          onConfirm={handleDeleteVariableCost}
          type="variable"
        />

        <DeleteCostDialog
          open={Boolean(deleteOverheadCost)}
          onOpenChange={(open) => !open && setDeleteOverheadCost(null)}
          onConfirm={handleDeleteOverheadCost}
          type="overhead"
        />
      </CardContent>
    </Card>
  )
}
