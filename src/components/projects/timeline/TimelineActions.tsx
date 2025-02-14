
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { ProjectRevenueDialog } from "../revenues/ProjectRevenueDialog"
import { ProjectCostDialog } from "../costs/ProjectCostDialog"
import { DeleteCostDialog } from "../costs/DeleteCostDialog"

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

  const handleCreateCost = async (values: { type: "variable" | "overhead"; month: string; amount: string; description?: string }) => {
    try {
      if (values.type === "variable") {
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
      } else {
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
      }

      setAddVariableCostDate(null)
      setAddOverheadCostDate(null)
    } catch (error) {
      toast.error(`Failed to add ${values.type} cost`)
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

  const handleUpdateCost = async (values: { type: "variable" | "overhead"; month: string; amount: string; description?: string }) => {
    try {
      if (values.type === "variable" && selectedVariableCost) {
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
      } else if (values.type === "overhead" && selectedOverheadCost) {
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
      }
    } catch (error) {
      toast.error(`Failed to update ${values.type} cost`)
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

  const handleDeleteCost = async (type: "variable" | "overhead") => {
    try {
      if (type === "variable" && deleteVariableCost) {
        const { error } = await supabase
          .from("project_variable_costs")
          .delete()
          .eq("id", deleteVariableCost.id)

        if (error) throw error
        queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
        toast.success("Variable cost deleted successfully")
        setDeleteVariableCost(null)
      } else if (type === "overhead" && deleteOverheadCost) {
        const { error } = await supabase
          .from("project_overhead_costs")
          .delete()
          .eq("id", deleteOverheadCost.id)

        if (error) throw error
        queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
        toast.success("Overhead cost deleted successfully")
        setDeleteOverheadCost(null)
      }
    } catch (error) {
      toast.error(`Failed to delete ${type} cost`)
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

      <ProjectCostDialog
        open={Boolean(addVariableCostDate) || Boolean(addOverheadCostDate)}
        onOpenChange={(open) => {
          if (!open) {
            setAddVariableCostDate(null)
            setAddOverheadCostDate(null)
          }
        }}
        onSubmit={handleCreateCost}
        defaultValues={
          addVariableCostDate
            ? {
                type: "variable",
                month: format(addVariableCostDate, "yyyy-MM"),
                amount: "",
              }
            : addOverheadCostDate
            ? {
                type: "overhead",
                month: format(addOverheadCostDate, "yyyy-MM"),
                amount: "",
              }
            : undefined
        }
      />

      <ProjectCostDialog
        open={Boolean(selectedVariableCost) || Boolean(selectedOverheadCost)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVariableCost(null)
            setSelectedOverheadCost(null)
          }
        }}
        onSubmit={handleUpdateCost}
        defaultValues={
          selectedVariableCost
            ? {
                type: "variable",
                month: selectedVariableCost.month.slice(0, 7),
                amount: selectedVariableCost.amount.toString(),
                description: selectedVariableCost.description,
              }
            : selectedOverheadCost
            ? {
                type: "overhead",
                month: selectedOverheadCost.month.slice(0, 7),
                amount: selectedOverheadCost.amount.toString(),
              }
            : undefined
        }
        showDelete
        onDelete={() => {
          if (selectedVariableCost) {
            setDeleteVariableCost(selectedVariableCost)
            setSelectedVariableCost(null)
          } else if (selectedOverheadCost) {
            setDeleteOverheadCost(selectedOverheadCost)
            setSelectedOverheadCost(null)
          }
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
        onConfirm={() => handleDeleteCost("variable")}
        type="variable"
      />

      <DeleteCostDialog
        open={Boolean(deleteOverheadCost)}
        onOpenChange={(open) => !open && setDeleteOverheadCost(null)}
        onConfirm={() => handleDeleteCost("overhead")}
        type="overhead"
      />
    </>
  )
}
