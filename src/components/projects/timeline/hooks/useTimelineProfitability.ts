
import { useCallback } from "react"
import { format } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { calculateAccumulatedProfitUpToMonth as calculateProfit } from "@/utils/financial-calculations"

export function useTimelineProfitability(
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  allocations: AllocationItem[],
  year: number
) {
  const { getOverheadPercentage } = useProjectSettings()
  // Use useLocalStorage hook directly
  const [showDecimalsValue] = useLocalStorage<boolean>("showDecimals", true)
  
  // Calculate accumulated profit up to a specific month using shared utility
  const calculateAccumulatedProfitUpToMonth = useCallback((targetMonth: Date) => {
    const overheadPercentage = getOverheadPercentage(year)
    return calculateProfit(
      targetMonth, 
      revenues, 
      variableCosts, 
      allocations, 
      overheadPercentage
    )
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage])

  return {
    calculateAccumulatedProfitUpToMonth,
    showDecimals: showDecimalsValue
  }
}
