
import { getYear } from "date-fns"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface TimelineCalculationsResult {
  totalRevenues: number
  totalVariableCosts: number
  totalOverheadCosts: number
  totalProfit: number
}

export function useTimelineCalculations(
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  overheadCosts: TimelineItem[],
  currentYear: number
): TimelineCalculationsResult {
  const totalRevenues = revenues?.reduce((sum, r) => {
    const year = getYear(new Date(r.month))
    return year === currentYear ? sum + Number(r.amount) : sum
  }, 0) || 0

  const totalVariableCosts = variableCosts?.reduce((sum, c) => {
    const year = getYear(new Date(c.month))
    return year === currentYear ? sum + Number(c.amount) : sum
  }, 0) || 0

  const totalOverheadCosts = overheadCosts?.reduce((sum, c) => {
    const year = getYear(new Date(c.month))
    return year === currentYear ? sum + Number(c.amount) : sum
  }, 0) || 0

  const totalProfit = totalRevenues - totalVariableCosts - totalOverheadCosts

  return {
    totalRevenues,
    totalVariableCosts,
    totalOverheadCosts,
    totalProfit,
  }
}
