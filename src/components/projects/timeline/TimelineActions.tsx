
import React from "react"
import { CostActionsDialog } from "../costs/CostActionsDialog"
import { ProjectRevenueDialog } from "../revenues/ProjectRevenueDialog"
import { ProjectVariableCostDialog } from "../costs/ProjectVariableCostDialog"
import { ProjectOverheadCostDialog } from "../costs/ProjectOverheadCostDialog"
import { DeleteCostDialog } from "../costs/DeleteCostDialog"

interface TimelineActionsProps {
  projectId: string
  addRevenueDate: Date | null
  addVariableCostDate: Date | null
  addOverheadCostDate: Date | null
  selectedRevenue: any | null
  selectedVariableCost: any | null
  selectedOverheadCost: any | null
  deleteRevenue: any | null
  deleteVariableCost: any | null
  deleteOverheadCost: any | null
  setAddRevenueDate: (date: Date | null) => void
  setAddVariableCostDate: (date: Date | null) => void
  setAddOverheadCostDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: any | null) => void
  setSelectedVariableCost: (cost: any | null) => void
  setSelectedOverheadCost: (cost: any | null) => void
  setDeleteRevenue: (revenue: any | null) => void
  setDeleteVariableCost: (cost: any | null) => void
  setDeleteOverheadCost: (cost: any | null) => void
  onVariableCostUpdate?: () => Promise<void>
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
  onVariableCostUpdate,
}: TimelineActionsProps) {
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
        projectId={projectId}
        isOpen={addRevenueDate !== null}
        onClose={() => setAddRevenueDate(null)}
        selectedDate={addRevenueDate}
        onSuccess={() => setAddRevenueDate(null)}
      />

      {/* Revenue Edit Dialog */}
      {selectedRevenue && (
        <ProjectRevenueDialog
          projectId={projectId}
          isOpen={selectedRevenue !== null}
          onClose={() => setSelectedRevenue(null)}
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
        projectId={projectId}
        isOpen={addVariableCostDate !== null}
        onClose={() => setAddVariableCostDate(null)}
        selectedDate={addVariableCostDate}
        onSuccess={handleVariableCostSuccess}
      />

      {/* Variable Cost Edit Dialog */}
      {selectedVariableCost && (
        <ProjectVariableCostDialog
          projectId={projectId}
          isOpen={selectedVariableCost !== null}
          onClose={() => setSelectedVariableCost(null)}
          selectedDate={selectedVariableCost ? new Date(selectedVariableCost.month) : null}
          initialValues={{
            id: selectedVariableCost.id,
            amount: selectedVariableCost.amount.toString(),
            description: selectedVariableCost.description || "",
          }}
          onSuccess={handleVariableCostSuccess}
        />
      )}

      {/* Overhead Cost Dialog */}
      <ProjectOverheadCostDialog
        projectId={projectId}
        isOpen={addOverheadCostDate !== null}
        onClose={() => setAddOverheadCostDate(null)}
        selectedDate={addOverheadCostDate}
        onSuccess={() => setAddOverheadCostDate(null)}
      />

      {/* Overhead Cost Edit Dialog */}
      {selectedOverheadCost && (
        <ProjectOverheadCostDialog
          projectId={projectId}
          isOpen={selectedOverheadCost !== null}
          onClose={() => setSelectedOverheadCost(null)}
          selectedDate={selectedOverheadCost ? new Date(selectedOverheadCost.month) : null}
          initialValues={{
            id: selectedOverheadCost.id,
            amount: selectedOverheadCost.amount.toString(),
          }}
          onSuccess={() => setSelectedOverheadCost(null)}
        />
      )}

      {/* Delete Dialogs */}
      {deleteRevenue && (
        <DeleteCostDialog
          id={deleteRevenue.id}
          isOpen={deleteRevenue !== null}
          onClose={() => setDeleteRevenue(null)}
          type="revenue"
          onSuccess={() => setDeleteRevenue(null)}
        />
      )}

      {deleteVariableCost && (
        <DeleteCostDialog
          id={deleteVariableCost.id}
          isOpen={deleteVariableCost !== null}
          onClose={() => setDeleteVariableCost(null)}
          type="variable-cost"
          onSuccess={handleVariableCostSuccess}
        />
      )}

      {deleteOverheadCost && (
        <DeleteCostDialog
          id={deleteOverheadCost.id}
          isOpen={deleteOverheadCost !== null}
          onClose={() => setDeleteOverheadCost(null)}
          type="overhead-cost"
          onSuccess={() => setDeleteOverheadCost(null)}
        />
      )}
      
      {/* Cost Actions Dialog for actions on specific items */}
      <CostActionsDialog />
    </>
  )
}
