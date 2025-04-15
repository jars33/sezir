
import { getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
  salary_cost: number
}

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

  const totalRevenues = revenues?.reduce((sum, r) => {
    const year = getYear(new Date(r.month))
    return year === currentYear ? sum + Number(r.amount) : sum
  }, 0) || 0

  const totalVariableCosts = variableCosts?.reduce((sum, c) => {
    const year = getYear(new Date(c.month))
    return year === currentYear ? sum + Number(c.amount) : sum
  }, 0) || 0

  const totalSalaryCosts = allocations?.reduce((sum, a) => {
    const year = getYear(new Date(a.month))
    return year === currentYear ? sum + Number(a.salary_cost) : sum
  }, 0) || 0
  
  // Calculate overhead costs as a percentage of the variable costs AND allocation costs combined
  // Using precise decimal calculation
  const totalOverheadCosts = ((totalVariableCosts + totalSalaryCosts) * overheadPercentage) / 100

  const totalProfit = totalRevenues - totalVariableCosts - totalOverheadCosts - totalSalaryCosts

  return {
    totalRevenues,
    totalVariableCosts,
    totalOverheadCosts,
    totalSalaryCosts,
    totalProfit,
  }
}
