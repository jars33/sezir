
import { useMemo } from "react";
import { format, addMonths, getYear, isBefore } from "date-fns";
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
  allProjectRevenues?: TimelineItem[];
  allProjectVariableCosts?: TimelineItem[];
  allProjectAllocations?: AllocationItem[];
}

export function useTimelineTableData({
  startDate,
  revenues,
  variableCosts,
  allocations,
  calculateAccumulatedProfitUpToMonth,
  year,
  allProjectRevenues = [],
  allProjectVariableCosts = [],
  allProjectAllocations = []
}: UseTimelineTableDataParams) {
  const { getOverheadPercentage } = useProjectSettings();
  
  // Generate array of months for the year
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));
  }, [startDate]);
  
  // Calculate data for each month
  const monthlyData = useMemo(() => months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    
    // Calculate monthly values
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
    const monthOverheadCosts = ((monthVariableCosts + monthAllocations) * overheadPercentage) / 100;
    
    const totalCosts = monthVariableCosts + monthAllocations + monthOverheadCosts;
    
    const monthlyProfit = monthRevenues - totalCosts;
    
    const monthlyProfitPercentage = monthRevenues > 0 ? (monthlyProfit / monthRevenues) * 100 : 0;
    
    // Calculate accumulated values, including previous years
    // For accumulated values, we need to consider all entries from previous years + current year up to this month
    const currentMonthDate = new Date(monthStr);
    
    // Calculate accumulated revenues
    const accumulatedRevenues = [
      ...allProjectRevenues,  // Include all revenues from all years
      ...revenues             // Ensure current year's revenues are included (may overlap with allProjectRevenues)
    ]
      .filter(r => {
        const revDate = new Date(r.month);
        return isBefore(revDate, addMonths(currentMonthDate, 1)) || 
               revDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    // Calculate accumulated variable costs
    const accumulatedVariableCosts = [
      ...allProjectVariableCosts,  // Include all variable costs from all years
      ...variableCosts             // Ensure current year's costs are included
    ]
      .filter(c => {
        const costDate = new Date(c.month);
        return isBefore(costDate, addMonths(currentMonthDate, 1)) || 
               costDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    // Calculate accumulated allocation costs
    const accumulatedAllocCosts = [
      ...allProjectAllocations,  // Include all allocations from all years
      ...allocations             // Ensure current year's allocations are included
    ]
      .filter(a => {
        const allocDate = new Date(a.month);
        return isBefore(allocDate, addMonths(currentMonthDate, 1)) || 
               allocDate.getTime() === currentMonthDate.getTime();
      })
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    // Calculate accumulated overhead based on accumulated costs
    let accumulatedOverheadCosts = 0;
    
    // Group costs by year for proper overhead calculation
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
    
    // Calculate overhead costs for each year based on that year's overhead percentage
    costsByYear.forEach((costs, yearNum) => {
      const yearOverheadPercentage = getOverheadPercentage(yearNum);
      const yearTotalCosts = costs.varCosts + costs.salaryCosts;
      accumulatedOverheadCosts += (yearTotalCosts * yearOverheadPercentage) / 100;
    });
    
    // Total accumulated costs
    const accumulatedTotalCosts = accumulatedVariableCosts + accumulatedAllocCosts + accumulatedOverheadCosts;
    
    // Use the provided accumulated profit calculation function
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
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
  }), [months, revenues, variableCosts, allocations, getOverheadPercentage, year, calculateAccumulatedProfitUpToMonth, 
       allProjectRevenues, allProjectVariableCosts, allProjectAllocations]);

  return {
    months,
    monthlyData
  };
}
