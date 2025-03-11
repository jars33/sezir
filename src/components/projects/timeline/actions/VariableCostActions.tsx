
import React from "react"
import { format, parseISO } from "date-fns"
import { ProjectVariableCostDialog } from "../../costs/ProjectVariableCostDialog"
import { DeleteCostDialog } from "../../costs/DeleteCostDialog"
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
    
    // Call the onVariableCostUpdate callback if provided
    if (onVariableCostUpdate) {
      await onVariableCostUpdate()
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
      <ProjectVariableCostDialog
        open={addVariableCostDate !== null}
        onOpenChange={() => setAddVariableCostDate(null)}
        projectId={projectId}
        onSubmit={({ month, amount, description }) => {
          // Handle submission of variable cost
          handleVariableCostSuccess()
        }}
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
          onSubmit={({ month, amount, description }) => {
            // Handle update of variable cost
            handleVariableCostSuccess()
          }}
          defaultValues={{
            month: getFormattedMonth(selectedVariableCost.month),
            amount: selectedVariableCost ? selectedVariableCost.amount.toString() : '',
            description: selectedVariableCost ? selectedVariableCost.description || '' : '',
          }}
          showDelete={true}
          onDelete={() => {
            setDeleteVariableCost(selectedVariableCost);
            setSelectedVariableCost(null);
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
  );
}
