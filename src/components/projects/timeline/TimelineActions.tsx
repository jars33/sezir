
import React, { useState } from "react"
import { RevenueActions } from "./actions/RevenueActions"
import { VariableCostActions } from "./actions/VariableCostActions"
import { CostActionsManager } from "./actions/CostActionsManager"
import type { TimelineActionsProps, CostActionItem } from "./actions/types"

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
  const [selectedCostAction, setSelectedCostAction] = useState<CostActionItem | null>(null);

  return (
    <>
      <RevenueActions
        addRevenueDate={addRevenueDate}
        selectedRevenue={selectedRevenue}
        deleteRevenue={deleteRevenue}
        setAddRevenueDate={setAddRevenueDate}
        setSelectedRevenue={setSelectedRevenue}
        setDeleteRevenue={setDeleteRevenue}
      />
      
      <VariableCostActions
        addVariableCostDate={addVariableCostDate}
        selectedVariableCost={selectedVariableCost}
        deleteVariableCost={deleteVariableCost}
        setAddVariableCostDate={setAddVariableCostDate}
        setSelectedVariableCost={setSelectedVariableCost}
        setDeleteVariableCost={setDeleteVariableCost}
        onVariableCostUpdate={onVariableCostUpdate}
      />
      
      <CostActionsManager
        selectedCostAction={selectedCostAction}
        setSelectedCostAction={setSelectedCostAction}
        setSelectedVariableCost={setSelectedVariableCost}
        setDeleteVariableCost={setDeleteVariableCost}
      />
    </>
  )
}
