
import React from "react"
import { format } from "date-fns"
import { ProjectRevenueDialog } from "../../revenues/ProjectRevenueDialog"
import { DeleteCostDialog } from "../../costs/DeleteCostDialog"
import type { TimelineItem } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface RevenueActionsProps {
  projectId: string
  addRevenueDate: Date | null
  selectedRevenue: TimelineItem | null
  deleteRevenue: TimelineItem | null
  setAddRevenueDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: TimelineItem | null) => void
  setDeleteRevenue: (revenue: TimelineItem | null) => void
  onVariableCostUpdate?: () => Promise<void>
}

export function RevenueActions({
  projectId,
  addRevenueDate,
  selectedRevenue,
  deleteRevenue,
  setAddRevenueDate,
  setSelectedRevenue,
  setDeleteRevenue,
  onVariableCostUpdate,
}: RevenueActionsProps) {
  const handleAddRevenue = async ({ month, amount }: { month: string; amount: string }) => {
    try {
      const { error } = await supabase
        .from("project_revenues")
        .insert({
          project_id: projectId,
          month: month,
          amount: Number(amount),
        })

      if (error) throw error

      toast.success("Revenue added successfully")
      setAddRevenueDate(null)
      if (onVariableCostUpdate) await onVariableCostUpdate()
    } catch (error) {
      console.error("Error adding revenue:", error)
      toast.error("Failed to add revenue")
    }
  }

  const handleUpdateRevenue = async ({ month, amount }: { month: string; amount: string }) => {
    if (!selectedRevenue) return

    try {
      const { error } = await supabase
        .from("project_revenues")
        .update({
          month: month,
          amount: Number(amount),
        })
        .eq("id", selectedRevenue.id)

      if (error) throw error

      toast.success("Revenue updated successfully")
      setSelectedRevenue(null)
      if (onVariableCostUpdate) await onVariableCostUpdate()
    } catch (error) {
      console.error("Error updating revenue:", error)
      toast.error("Failed to update revenue")
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

      toast.success("Revenue deleted successfully")
      setDeleteRevenue(null)
      if (onVariableCostUpdate) await onVariableCostUpdate()
    } catch (error) {
      console.error("Error deleting revenue:", error)
      toast.error("Failed to delete revenue")
    }
  }

  return (
    <>
      <ProjectRevenueDialog
        open={addRevenueDate !== null}
        onOpenChange={() => setAddRevenueDate(null)}
        onSubmit={handleAddRevenue}
        defaultValues={{
          month: addRevenueDate ? format(addRevenueDate, 'yyyy-MM') : '',
          amount: ''
        }}
      />

      {selectedRevenue && (
        <ProjectRevenueDialog
          open={selectedRevenue !== null}
          onOpenChange={() => setSelectedRevenue(null)}
          onSubmit={handleUpdateRevenue}
          defaultValues={{
            month: selectedRevenue.month,
            amount: selectedRevenue.amount.toString(),
          }}
          showDelete={true}
          onDelete={() => {
            setDeleteRevenue(selectedRevenue)
            setSelectedRevenue(null)
          }}
        />
      )}

      <DeleteCostDialog
        open={deleteRevenue !== null}
        onOpenChange={() => setDeleteRevenue(null)}
        onConfirm={handleDeleteRevenue}
        type="revenue"
      />
    </>
  )
}
