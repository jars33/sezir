
import React from "react"
import { format, parseISO } from "date-fns"
import { ProjectVariableCostDialog } from "../../costs/ProjectVariableCostDialog"
import { DeleteCostDialog } from "../../costs/DeleteCostDialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import type { TimelineItem } from "./types"

interface VariableCostActionsProps {
  projectId: string
  addVariableCostDate: Date | null
  selectedVariableCost: TimelineItem | null
  deleteVariableCost: TimelineItem | null
  setAddVariableCostDate: (date: Date | null) => void
  setSelectedVariableCost: (cost: TimelineItem | null) => void
  setDeleteVariableCost: (cost: TimelineItem | null) => void
  onVariableCostUpdate?: () => Promise<void>
}

export function VariableCostActions({
  projectId,
  addVariableCostDate,
  selectedVariableCost,
  deleteVariableCost,
  setAddVariableCostDate,
  setSelectedVariableCost,
  setDeleteVariableCost,
  onVariableCostUpdate,
}: VariableCostActionsProps) {
  const handleVariableCostSuccess = async () => {
    setAddVariableCostDate(null)
    setSelectedVariableCost(null)
    setDeleteVariableCost(null)
    
    if (onVariableCostUpdate) {
      await onVariableCostUpdate()
    }
  }

  // Format the month correctly for the display in the dialog
  const getFormattedMonth = (dateString: string) => {
    if (dateString.length > 7) {
      try {
        return format(parseISO(dateString), 'yyyy-MM')
      } catch (e) {
        console.error("Error parsing date:", e)
        return dateString.substring(0, 7)
      }
    }
    return dateString
  }

  const handleAddVariableCost = async (values: { month: string; amount: string; description: string }) => {
    try {
      const { error } = await supabase
        .from("project_variable_costs")
        .insert({
          project_id: projectId,
          month: values.month + "-01",
          amount: Number(values.amount),
          description: values.description
        })

      if (error) throw error
      
      toast.success("Variable cost added successfully")
      await handleVariableCostSuccess()
    } catch (error) {
      console.error("Error adding variable cost:", error)
      toast.error("Failed to add variable cost")
    }
  }

  const handleUpdateVariableCost = async (values: { month: string; amount: string; description: string }) => {
    try {
      if (!selectedVariableCost) return

      const { error } = await supabase
        .from("project_variable_costs")
        .update({
          month: values.month + "-01",
          amount: Number(values.amount),
          description: values.description
        })
        .eq('id', selectedVariableCost.id)

      if (error) throw error
      
      toast.success("Variable cost updated successfully")
      await handleVariableCostSuccess()
    } catch (error) {
      console.error("Error updating variable cost:", error)
      toast.error("Failed to update variable cost")
    }
  }

  return (
    <>
      <ProjectVariableCostDialog
        open={addVariableCostDate !== null}
        onOpenChange={() => setAddVariableCostDate(null)}
        projectId={projectId}
        onSubmit={handleAddVariableCost}
        defaultValues={{
          month: addVariableCostDate ? format(addVariableCostDate, 'yyyy-MM') : '',
          amount: '',
          description: ''
        }}
      />

      {selectedVariableCost && (
        <ProjectVariableCostDialog
          open={selectedVariableCost !== null}
          onOpenChange={() => setSelectedVariableCost(null)}
          projectId={projectId}
          onSubmit={handleUpdateVariableCost}
          defaultValues={{
            month: getFormattedMonth(selectedVariableCost.month),
            amount: selectedVariableCost.amount.toString(),
            description: selectedVariableCost.description || '',
          }}
          showDelete={true}
          onDelete={() => {
            setDeleteVariableCost(selectedVariableCost)
            setSelectedVariableCost(null)
          }}
        />
      )}

      {deleteVariableCost && (
        <DeleteCostDialog
          open={deleteVariableCost !== null}
          onOpenChange={() => setDeleteVariableCost(null)}
          onConfirm={handleVariableCostSuccess}
          type="variable"
          projectId={projectId}
        />
      )}
    </>
  )
}
