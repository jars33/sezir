
import { getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { calculateFinancialSummary, TimelineItem, AllocationItem } from "@/utils/financial-calculations"

interface TimelineCalculationsResult {
  totalRevenues: number
  totalVariableCosts: number
  totalOverheadCosts: number
  totalSalaryCosts: number
  totalProfit: number
}

export function useTimelineCalculations(
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  allocations: AllocationItem[],
  currentYear: number
): TimelineCalculationsResult {
  // Get the overhead percentage from project settings
  const { getOverheadPercentage } = useProjectSettings()
  const overheadPercentage = getOverheadPercentage(currentYear)

  // Use the centralized calculation function
  const {
    totalRevenues,
    totalVariableCosts,
    totalSalaryCosts,
    totalOverheadCosts,
    totalProfit,
  } = calculateFinancialSummary(
    revenues, 
    variableCosts, 
    allocations, 
    currentYear, 
    overheadPercentage
  )

  return {
    totalRevenues,
    totalVariableCosts,
    totalOverheadCosts,
    totalSalaryCosts,
    totalProfit,
  }
}
