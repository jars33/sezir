
import { useMemo } from "react";
import { format, addMonths } from "date-fns";
import { useProjectSettings } from "@/hooks/use-project-settings";
import type { TimelineItem, AllocationItem } from "../actions/types";
import { generateMonthlyFinancialData } from "@/utils/financial-calculations";

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
  const overheadPercentage = getOverheadPercentage(year);
  
  // Generate array of months for the year
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));
  }, [startDate]);
  
  // Calculate data for each month
  const monthlyData = useMemo(() => {
    // Get monthly financial data using centralized function
    const { monthlyData: financialData } = generateMonthlyFinancialData(
      year, 
      revenues, 
      variableCosts, 
      allocations, 
      overheadPercentage
    );

    return months.map((month, index) => {
      const monthFinancials = financialData[index];
      const monthStr = format(month, "yyyy-MM");
      
      // Get monthly revenue and costs
      const monthRevenues = monthFinancials.revenue;
      const totalCosts = monthFinancials.totalCost;
      const monthlyProfit = monthFinancials.profit;
      
      // Calculate monthly profit percentage
      const monthlyProfitPercentage = monthRevenues > 0 ? (monthlyProfit / monthRevenues) * 100 : 0;
      
      // For accumulated values, we use the specialized function
      const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
      
      // Calculate accumulated revenue up to this month
      const accumulatedRevenues = months
        .filter(m => m <= month)
        .flatMap(m => {
          const mStr = format(m, "yyyy-MM");
          return revenues
            .filter(r => r.month.startsWith(mStr));
        })
        .reduce((s, r) => s + Number(r.amount), 0);
      
      // Calculate accumulated costs up to this month
      // This includes variable costs, salary costs, and overhead
      const accumulatedVariableCosts = months
        .filter(m => m <= month)
        .flatMap(m => {
          const mStr = format(m, "yyyy-MM");
          return variableCosts
            .filter(c => c.month.startsWith(mStr));
        })
        .reduce((s, c) => s + Number(c.amount), 0);
        
      // Calculate accumulated salary costs up to this month
      const accumulatedAllocCosts = months
        .filter(m => m <= month)
        .flatMap(m => {
          const mStr = format(m, "yyyy-MM");
          return allocations
            .filter(a => a.month.startsWith(mStr));
        })
        .reduce((s, a) => s + Number(a.salary_cost), 0);
        
      // Calculate accumulated base costs
      const accumulatedBaseCosts = accumulatedVariableCosts + accumulatedAllocCosts;
      
      // Calculate accumulated overhead costs
      const accumulatedOverheadCosts = (accumulatedBaseCosts * overheadPercentage) / 100;
      
      // Calculate total accumulated costs with overhead
      const accumulatedTotalCosts = accumulatedBaseCosts + accumulatedOverheadCosts;
      
      // Calculate accumulated profit percentage
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
    });
  }, [months, revenues, variableCosts, allocations, year, overheadPercentage, calculateAccumulatedProfitUpToMonth]);

  return {
    months,
    monthlyData
  };
}
