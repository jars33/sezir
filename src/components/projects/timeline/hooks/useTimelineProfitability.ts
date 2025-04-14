
import { useCallback } from "react"
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
  const [showDecimals] = useLocalStorage<boolean>("showDecimals", true)
  
  // Calculate accumulated profit up to a specific month
  const calculateAccumulatedProfitUpToMonth = useCallback((targetMonth: Date) => {
    const targetMonthStr = format(targetMonth, "yyyy-MM")
    
    const accumulatedRevenues = revenues
      ?.filter(r => r.month <= targetMonthStr)
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0

    const accumulatedVariableCosts = variableCosts
      ?.filter(c => c.month <= targetMonthStr)
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0

    const overheadPercentage = getOverheadPercentage(year)
    
    // Calculate overhead costs without rounding
    const accumulatedOverheadCosts = (accumulatedVariableCosts * overheadPercentage) / 100

    const accumulatedSalaryCosts = allocations
      ?.filter(a => a.month <= targetMonthStr)
      .reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0

    // Return exact value with all decimals
    return accumulatedRevenues - accumulatedVariableCosts - accumulatedOverheadCosts - accumulatedSalaryCosts
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  return {
    calculateAccumulatedProfitUpToMonth
  }
}
