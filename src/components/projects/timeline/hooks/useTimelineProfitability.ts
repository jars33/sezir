
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
    
    const accumulatedRevenues = revenues
      ?.filter(r => r.month <= targetMonthStr)
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0

    const accumulatedVariableCosts = variableCosts
      ?.filter(c => c.month <= targetMonthStr)
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0

    const accumulatedSalaryCosts = allocations
      ?.filter(a => a.month <= targetMonthStr)
      .reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0

    const overheadPercentage = getOverheadPercentage(year)
    
    // Fixed: Calculate total costs with overhead using the correct formula:
    // (accumulatedVariableCosts + accumulatedSalaryCosts) * (1 + overheadPercentage/100)
    const baseCosts = accumulatedVariableCosts + accumulatedSalaryCosts
    const totalCostsWithOverhead = baseCosts * (1 + overheadPercentage / 100)

    // Return exact value with all decimals: revenue minus total costs with overhead
    return accumulatedRevenues - totalCostsWithOverhead
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  return {
    calculateAccumulatedProfitUpToMonth,
    showDecimals: showDecimalsValue
  }
}
