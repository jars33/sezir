
import { useCallback, useMemo } from "react"
import { format } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useTimelineProfitability(
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  allocations: AllocationItem[],
  year: number
) {
  const { getOverheadPercentage } = useProjectSettings()
  // Use useLocalStorage hook directly instead of manually accessing localStorage
  const [showDecimalsValue] = useLocalStorage<boolean>("showDecimals", true)
  
  // Calculate accumulated profit up to a specific month
  const calculateAccumulatedProfitUpToMonth = useCallback((targetMonth: Date) => {
    const targetMonthStr = format(targetMonth, "yyyy-MM")
    
    // Calculate accumulated revenues
    const accumulatedRevenues = revenues
      ?.filter(r => r.month <= targetMonthStr)
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0

    // Calculate accumulated variable costs
    const accumulatedVariableCosts = variableCosts
      ?.filter(c => c.month <= targetMonthStr)
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0

    // Calculate accumulated salary costs
    const accumulatedSalaryCosts = allocations
      ?.filter(a => a.month <= targetMonthStr)
      .reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0

    const overheadPercentage = getOverheadPercentage(year)
    
    // Calculate base costs
    const baseCosts = accumulatedVariableCosts + accumulatedSalaryCosts
    
    // Calculate overhead costs
    const overheadCosts = (baseCosts * overheadPercentage) / 100
    
    // Calculate total costs with overhead
    const totalAccumulatedCosts = baseCosts + overheadCosts

    // Return accumulated profit: revenues minus total costs
    return accumulatedRevenues - totalAccumulatedCosts
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  return {
    calculateAccumulatedProfitUpToMonth,
    showDecimals: showDecimalsValue
  }
}
