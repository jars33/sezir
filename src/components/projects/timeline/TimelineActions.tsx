
import React, { useState } from "react"
import { CostActionsDialog } from "../costs/CostActionsDialog"
import { ProjectRevenueDialog } from "../revenues/ProjectRevenueDialog"
import { ProjectVariableCostDialog } from "../costs/ProjectVariableCostDialog"
import { DeleteCostDialog } from "../costs/DeleteCostDialog"

interface TimelineActionsProps {
  projectId: string
  addRevenueDate: Date | null
  addVariableCostDate: Date | null
  selectedRevenue: any | null
  selectedVariableCost: any | null
  deleteRevenue: any | null
  deleteVariableCost: any | null
  setAddRevenueDate: (date: Date | null) => void
  setAddVariableCostDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: any | null) => void
  setSelectedVariableCost: (cost: any | null) => void
  setDeleteRevenue: (revenue: any | null) => void
  setDeleteVariableCost: (cost: any | null) => void
  onVariableCostUpdate?: () => Promise<void>
}

export function TimelineActions({
  projectId,
  addRevenueDate,
  addVariableCostDate,
  selectedRevenue,
  selectedVariableCost,
  deleteRevenue,
  deleteVariableCost,
  setAddRevenueDate,
  setAddVariableCostDate,
  setSelectedRevenue,
  setSelectedVariableCost,
  setDeleteRevenue,
  setDeleteVariableCost,
  onVariableCostUpdate,
}: TimelineActionsProps) {
  const [selectedCostAction, setSelectedCostAction] = useState<{
    type: "variable";
    amount: number;
    month: string;
    id: string;
  } | null>(null);

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
      {/* Revenue Dialog */}
      <ProjectRevenueDialog
        open={addRevenueDate !== null}
        onOpenChange={() => setAddRevenueDate(null)}
        projectId={projectId}
        selectedDate={addRevenueDate}
        onSuccess={() => setAddRevenueDate(null)}
      />

      {/* Revenue Edit Dialog */}
      {selectedRevenue && (
        <ProjectRevenueDialog
          open={selectedRevenue !== null}
          onOpenChange={() => setSelectedRevenue(null)}
          projectId={projectId}
          selectedDate={selectedRevenue ? new Date(selectedRevenue.month) : null}
          initialValues={{
            id: selectedRevenue.id,
            amount: selectedRevenue.amount.toString(),
          }}
          onSuccess={() => setSelectedRevenue(null)}
        />
      )}

      {/* Variable Cost Dialog */}
      <ProjectVariableCostDialog
        open={addVariableCostDate !== null}
        onOpenChange={() => setAddVariableCostDate(null)}
        projectId={projectId}
        selectedDate={addVariableCostDate}
        onSuccess={handleVariableCostSuccess}
      />

      {/* Variable Cost Edit Dialog */}
      {selectedVariableCost && (
        <ProjectVariableCostDialog
          open={selectedVariableCost !== null}
          onOpenChange={() => setSelectedVariableCost(null)}
          projectId={projectId}
          selectedDate={selectedVariableCost ? new Date(selectedVariableCost.month) : null}
          initialValues={{
            id: selectedVariableCost.id,
            amount: selectedVariableCost.amount.toString(),
            description: selectedVariableCost.description || "",
          }}
          onSuccess={handleVariableCostSuccess}
        />
      )}

      {/* Delete Dialogs */}
      {deleteRevenue && (
        <DeleteCostDialog
          open={deleteRevenue !== null}
          onOpenChange={() => setDeleteRevenue(null)}
          onConfirm={() => setDeleteRevenue(null)}
          type="revenue"
        />
      )}

      {deleteVariableCost && (
        <DeleteCostDialog
          open={deleteVariableCost !== null}
          onOpenChange={() => setDeleteVariableCost(null)}
          onConfirm={handleVariableCostSuccess}
          type="variable"
        />
      )}
      
      {/* Cost Actions Dialog for actions on specific items */}
      {selectedCostAction && (
        <CostActionsDialog
          open={selectedCostAction !== null}
          onOpenChange={() => setSelectedCostAction(null)}
          onEdit={() => {
            setSelectedVariableCost({
              id: selectedCostAction.id,
              month: selectedCostAction.month,
              amount: selectedCostAction.amount,
            });
            setSelectedCostAction(null);
          }}
          onDelete={() => {
            setDeleteVariableCost({
              id: selectedCostAction.id,
            });
            setSelectedCostAction(null);
          }}
          type={selectedCostAction.type}
          amount={selectedCostAction.amount}
          month={selectedCostAction.month}
        />
      )}
    </>
  )
}
