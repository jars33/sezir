
export interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

export interface TimelineActionsProps {
  projectId: string
  addRevenueDate: Date | null
  addVariableCostDate: Date | null
  selectedRevenue: TimelineItem | null
  selectedVariableCost: TimelineItem | null
  deleteRevenue: TimelineItem | null
  deleteVariableCost: TimelineItem | null
  setAddRevenueDate: (date: Date | null) => void
  setAddVariableCostDate: (date: Date | null) => void
  setSelectedRevenue: (revenue: TimelineItem | null) => void
  setSelectedVariableCost: (cost: TimelineItem | null) => void
  setDeleteRevenue: (revenue: TimelineItem | null) => void
  setDeleteVariableCost: (cost: TimelineItem | null) => void
  onVariableCostUpdate?: () => Promise<void>
}

export interface CostActionItem {
  type: "variable";
  amount: number;
  month: string;
  id: string;
}
