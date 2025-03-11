
import React from "react"
import { CostActionsDialog } from "../../costs/CostActionsDialog"
import type { CostActionItem, TimelineItem } from "./types"

interface CostActionsManagerProps {
  selectedCostAction: CostActionItem | null
  setSelectedCostAction: (action: CostActionItem | null) => void
  setSelectedVariableCost: (cost: TimelineItem | null) => void
  setDeleteVariableCost: (cost: TimelineItem | null) => void
}

export function CostActionsManager({
  selectedCostAction,
  setSelectedCostAction,
  setSelectedVariableCost,
  setDeleteVariableCost,
}: CostActionsManagerProps) {
  if (!selectedCostAction) return null;
  
  return (
    <CostActionsDialog
      open={selectedCostAction !== null}
      onOpenChange={() => setSelectedCostAction(null)}
      onEdit={() => {
        setSelectedVariableCost({
          id: selectedCostAction.id,
          month: selectedCostAction.month,
          amount: selectedCostAction.amount,
          description: selectedCostAction.description
        });
        setSelectedCostAction(null);
      }}
      onDelete={() => {
        setDeleteVariableCost({
          id: selectedCostAction.id,
          month: selectedCostAction.month,
          amount: selectedCostAction.amount,
          description: selectedCostAction.description
        });
        setSelectedCostAction(null);
      }}
      type={selectedCostAction.type}
      amount={selectedCostAction.amount}
      month={selectedCostAction.month}
      description={selectedCostAction.description}
    />
  )
}
