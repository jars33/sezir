
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
  // Use useMemo to conditionally access localStorage only when component is mounted
  const showDecimalsValue = useMemo(() => {
    try {
      // Safe way to access localStorage that won't cause React initialization errors
      if (typeof window !== 'undefined') {
        const storedValue = window.localStorage.getItem("showDecimals")
        return storedValue ? JSON.parse(storedValue) : true
      }
      return true
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return true
    }
  }, [])
  
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
    
    // Calculate overhead costs based on variable costs AND salary costs
    const accumulatedOverheadCosts = ((accumulatedVariableCosts + accumulatedSalaryCosts) * overheadPercentage) / 100

    // Return exact value with all decimals
    return accumulatedRevenues - accumulatedVariableCosts - accumulatedOverheadCosts - accumulatedSalaryCosts
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  return {
    calculateAccumulatedProfitUpToMonth,
    showDecimals: showDecimalsValue
  }
}
