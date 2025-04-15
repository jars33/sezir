
import { useMemo } from "react";
import { format, addMonths } from "date-fns";
import { useProjectSettings } from "@/hooks/use-project-settings";
import type { TimelineItem, AllocationItem } from "../actions/types";

interface MonthData {
  month: Date;
  monthlyCosts: number;
  monthlyRevenues: number;
  monthlyProfit: number;
  monthlyProfitPercentage: number;
  accumulatedCosts: number;
  accumulatedRevenues: number;
  accumulatedProfit: number;
  accumulatedProfitPercentage: number;
}

export interface UseTimelineTableDataParams {
  startDate: Date;
  revenues: TimelineItem[];
  variableCosts: TimelineItem[];
  allocations: AllocationItem[];
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number;
  year: number;
}

export function useTimelineTableData({
  startDate,
  revenues,
  variableCosts,
  allocations,
  calculateAccumulatedProfitUpToMonth,
  year
}: UseTimelineTableDataParams) {
  const { getOverheadPercentage } = useProjectSettings();
  
  // Generate array of months for the year
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));
  }, [startDate]);
  
  // Calculate data for each month
  const monthlyData = useMemo(() => months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    
    const monthRevenues = revenues
      .filter(r => r.month.startsWith(monthStr))
      .reduce((sum, r) => sum + Number(r.amount), 0);
      
    const monthVariableCosts = variableCosts
      .filter(c => c.month.startsWith(monthStr))
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    const monthAllocations = allocations
      .filter(a => a.month.startsWith(monthStr))
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    const overheadPercentage = getOverheadPercentage(year);
    
    // Fixed calculation: Base costs * (1 + overhead percentage/100)
    const baseCosts = monthVariableCosts + monthAllocations;
    const totalCosts = baseCosts * (1 + overheadPercentage / 100);
    
    const monthlyProfit = monthRevenues - totalCosts;
    
    const monthlyProfitPercentage = monthRevenues > 0 ? (monthlyProfit / monthRevenues) * 100 : 0;
    
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
    const accumulatedVariableCosts = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return variableCosts
          .filter(c => c.month.startsWith(mStr));
      })
      .reduce((s, c) => s + Number(c.amount), 0);
      
    const accumulatedAllocCosts = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return allocations
          .filter(a => a.month.startsWith(mStr));
      })
      .reduce((s, a) => s + Number(a.salary_cost), 0);
      
    // Calculate accumulated base costs and total costs with overhead
    const accumulatedBaseCosts = accumulatedVariableCosts + accumulatedAllocCosts;
    const accumulatedTotalCosts = accumulatedBaseCosts * (1 + overheadPercentage / 100);
    
    const accumulatedRevenues = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return revenues
          .filter(r => r.month.startsWith(mStr));
      })
      .reduce((s, r) => s + Number(r.amount), 0);
    
    const accumulatedProfitPercentage = accumulatedRevenues > 0 ? (accumulatedProfit / accumulatedRevenues) * 100 : 0;
    
    return {
      month,
      monthlyCosts: totalCosts,
      monthlyRevenues: monthRevenues,
      monthlyProfit,
      monthlyProfitPercentage,
      accumulatedCosts: accumulatedTotalCosts,
      accumulatedRevenues,
      accumulatedProfit,
      accumulatedProfitPercentage
    } as MonthData;
  }), [months, revenues, variableCosts, allocations, getOverheadPercentage, year, calculateAccumulatedProfitUpToMonth]);

  return {
    months,
    monthlyData
  };
}
