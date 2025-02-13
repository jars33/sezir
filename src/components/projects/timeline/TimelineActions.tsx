
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface TimelineActionsProps {
  projectId: string
  addRevenueDate: Date | null
  addVariableCostDate: Date | null
  addOverheadCostDate: Date | null
  selectedRevenue: TimelineItem | null
  selectedVariableCost: TimelineItem | null
  selectedOverheadCost: TimelineItem | null
  deleteRevenue: TimelineItem | null
  deleteVariableCost: TimelineItem | null
  deleteOverheadCost: TimelineItem | null
  setAddRevenueDate: (date: Date | null) => void
  setAddVariableCostDate: (date: Date | null) => void
  setAddOverheadCostDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: TimelineItem | null) => void
  setSelectedVariableCost: (cost: TimelineItem | null) => void
  setSelectedOverheadCost: (cost: TimelineItem | null) => void
  setDeleteRevenue: (revenue: TimelineItem | null) => void
  setDeleteVariableCost: (cost: TimelineItem | null) => void
  setDeleteOverheadCost: (cost: TimelineItem | null) => void
}

export function TimelineActions({
  projectId,
  addRevenueDate,
  addVariableCostDate,
  addOverheadCostDate,
  selectedRevenue,
  selectedVariableCost,
  selectedOverheadCost,
  deleteRevenue,
  deleteVariableCost,
  deleteOverheadCost,
  setAddRevenueDate,
  setAddVariableCostDate,
  setAddOverheadCostDate,
  setSelectedRevenue,
  setSelectedVariableCost,
  setSelectedOverheadCost,
  setDeleteRevenue,
  setDeleteVariableCost,
  setDeleteOverheadCost,
}: TimelineActionsProps) {
  const queryClient = useQueryClient()

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
    <>
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
    </>
  )
}
