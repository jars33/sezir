
import React from "react"
import { format, parseISO } from "date-fns"
import { ProjectRevenueDialog } from "../../revenues/ProjectRevenueDialog"
import { DeleteCostDialog } from "../../costs/DeleteCostDialog"
import type { TimelineItem } from "./types"
import { revenueService } from "@/services/supabase"
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
      // Ensure we have a valid date format by appending day (01)
      const formattedMonth = `${month}-01` 
      
      await revenueService.createRevenue(
        projectId,
        formattedMonth,
        Number(amount)
      );

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
      // Ensure we have a valid date format by appending day (01)
      const formattedMonth = `${month}-01`
      
      await revenueService.updateRevenue(
        selectedRevenue.id,
        formattedMonth,
        Number(amount)
      );

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
      await revenueService.deleteRevenue(deleteRevenue.id);

      toast.success("Revenue deleted successfully")
      setDeleteRevenue(null)
      if (onVariableCostUpdate) await onVariableCostUpdate()
    } catch (error) {
      console.error("Error deleting revenue:", error)
      toast.error("Failed to delete revenue")
    }
  }

  // Format the month correctly for the display in the dialog
  const getFormattedMonth = (dateString: string) => {
    // If we have a full date format, extract just the year-month part
    if (dateString.length > 7) {
      try {
        return format(parseISO(dateString), 'yyyy-MM')
      } catch (e) {
        console.error("Error parsing date:", e)
        return dateString.substring(0, 7) // Fallback to first 7 chars
      }
    }
    return dateString
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
            month: getFormattedMonth(selectedRevenue.month),
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
