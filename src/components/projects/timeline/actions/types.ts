
export interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
  isNew?: boolean
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
  description?: string;
}

export interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
  salary_cost: number
  team_member_id: string
  project_assignment_id: string
}
