
import { useCallback, useMemo } from "react"
import { format, isBefore, addMonths, getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import type { TimelineItem, AllocationItem } from "../actions/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useTimelineProfitability(
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  allocations: AllocationItem[],
  year: number,
  allProjectRevenues: TimelineItem[] = [],
  allProjectVariableCosts: TimelineItem[] = [],
  allProjectAllocations: AllocationItem[] = []
) {
  const { getOverheadPercentage } = useProjectSettings()
  // Use useLocalStorage hook directly instead of manually accessing localStorage
  const [showDecimalsValue] = useLocalStorage<boolean>("showDecimals", true)
  
  // Calculate accumulated profit up to a specific month
  const calculateAccumulatedProfitUpToMonth = useCallback((targetMonth: Date) => {
    const targetMonthStr = format(targetMonth, "yyyy-MM")
    const currentMonthDate = new Date(targetMonthStr);
    
    // Include all revenues from previous years and current year up to target month
    const accumulatedRevenues = [
      ...allProjectRevenues,
      ...revenues
    ]
      .filter(r => {
        const revDate = new Date(r.month);
        return isBefore(revDate, addMonths(currentMonthDate, 1)) || 
               revDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    // Include all variable costs from previous years and current year up to target month
    const accumulatedVariableCosts = [
      ...allProjectVariableCosts,
      ...variableCosts
    ]
      .filter(c => {
        const costDate = new Date(c.month);
        return isBefore(costDate, addMonths(currentMonthDate, 1)) || 
               costDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    // Include all allocation costs from previous years and current year up to target month
    const accumulatedAllocCosts = [
      ...allProjectAllocations,
      ...allocations
    ]
      .filter(a => {
        const allocDate = new Date(a.month);
        return isBefore(allocDate, addMonths(currentMonthDate, 1)) || 
               allocDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    // Calculate overhead based on costs grouped by year
    let accumulatedOverheadCosts = 0;
    const costsByYear = new Map<number, { varCosts: number, salaryCosts: number }>();
    
    // Process variable costs by year
    [...allProjectVariableCosts, ...variableCosts]
      .filter(c => {
        const costDate = new Date(c.month);
        return isBefore(costDate, addMonths(currentMonthDate, 1)) || 
               costDate.getTime() === currentMonthDate.getTime();
      })
      .forEach(cost => {
        const costYear = getYear(new Date(cost.month));
        if (!costsByYear.has(costYear)) {
          costsByYear.set(costYear, { varCosts: 0, salaryCosts: 0 });
        }
        const yearData = costsByYear.get(costYear)!;
        yearData.varCosts += Number(cost.amount);
        costsByYear.set(costYear, yearData);
      });
    
    // Process allocation costs by year
    [...allProjectAllocations, ...allocations]
      .filter(a => {
        const allocDate = new Date(a.month);
        return isBefore(allocDate, addMonths(currentMonthDate, 1)) || 
               allocDate.getTime() === currentMonthDate.getTime();
      })
      .forEach(allocation => {
        const allocYear = getYear(new Date(allocation.month));
        if (!costsByYear.has(allocYear)) {
          costsByYear.set(allocYear, { varCosts: 0, salaryCosts: 0 });
        }
        const yearData = costsByYear.get(allocYear)!;
        yearData.salaryCosts += Number(allocation.salary_cost);
        costsByYear.set(allocYear, yearData);
      });
    
    // Apply the appropriate overhead percentage for each year
    costsByYear.forEach((costs, yearNum) => {
      const yearOverheadPercentage = getOverheadPercentage(yearNum);
      const yearTotalCosts = costs.varCosts + costs.salaryCosts;
      accumulatedOverheadCosts += (yearTotalCosts * yearOverheadPercentage) / 100;
    });

    // Return exact value with all decimals
    return accumulatedRevenues - accumulatedVariableCosts - accumulatedOverheadCosts - accumulatedAllocCosts;
  }, [revenues, variableCosts, allocations, year, getOverheadPercentage, 
      allProjectRevenues, allProjectVariableCosts, allProjectAllocations])

  return {
    calculateAccumulatedProfitUpToMonth,
    showDecimals: showDecimalsValue
  }
}
