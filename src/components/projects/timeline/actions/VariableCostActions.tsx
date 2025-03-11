import React from "react"
import { format } from "date-fns"
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
            month: selectedVariableCost ? selectedVariableCost.month : '',
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
