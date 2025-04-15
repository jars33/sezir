
import { useMemo } from "react";
import { format, addMonths, getYear, isBefore, parse, isAfter } from "date-fns";
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
    const currentMonth = new Date(monthStr);
    const nextMonth = addMonths(currentMonth, 1);
    
    // Calculate monthly values
    const monthRevenues = revenues
      .filter(r => {
        const revDate = new Date(r.month);
        return format(revDate, "yyyy-MM") === monthStr;
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);
      
    const monthVariableCosts = variableCosts
      .filter(c => {
        const costDate = new Date(c.month);
        return format(costDate, "yyyy-MM") === monthStr;
      })
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    const monthAllocations = allocations
      .filter(a => {
        const allocDate = new Date(a.month);
        return format(allocDate, "yyyy-MM") === monthStr;
      })
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    const overheadPercentage = getOverheadPercentage(year);
    const monthOverheadCosts = ((monthVariableCosts + monthAllocations) * overheadPercentage) / 100;
    
    const totalMonthlyCosts = monthVariableCosts + monthAllocations + monthOverheadCosts;
    
    const monthlyProfit = monthRevenues - totalMonthlyCosts;
    
    const monthlyProfitPercentage = monthRevenues > 0 ? (monthlyProfit / monthRevenues) * 100 : 0;
    
    // Calculate accumulated values including all previous months and years
    
    // Calculate accumulated revenues
    const accumulatedRevenues = [
      ...allProjectRevenues,  // All revenues from all years
      ...revenues             // Current year's revenues (may overlap with allProjectRevenues)
    ]
      .filter(r => {
        const revDate = new Date(r.month);
        // Include if date is before or equal to the end of current month
        return isBefore(revDate, nextMonth);
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    // Calculate accumulated variable costs
    const accumulatedVariableCosts = [
      ...allProjectVariableCosts,  // All variable costs from all years
      ...variableCosts             // Current year's costs (may overlap)
    ]
      .filter(c => {
        const costDate = new Date(c.month);
        // Include if date is before or equal to the end of current month
        return isBefore(costDate, nextMonth);
      })
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    // Calculate accumulated allocation costs
    const accumulatedAllocCosts = [
      ...allProjectAllocations,  // All allocations from all years
      ...allocations             // Current year's allocations (may overlap)
    ]
      .filter(a => {
        const allocDate = new Date(a.month);
        // Include if date is before or equal to the end of current month
        return isBefore(allocDate, nextMonth);
      })
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    // Calculate accumulated overhead costs by grouping costs by year for proper overhead percentage
    const costsByYear = new Map<number, { varCosts: number, salaryCosts: number }>();
    
    // Process variable costs grouped by year
    [...allProjectVariableCosts, ...variableCosts]
      .filter(c => isBefore(new Date(c.month), nextMonth))
      .forEach(cost => {
        const costYear = getYear(new Date(cost.month));
        if (!costsByYear.has(costYear)) {
          costsByYear.set(costYear, { varCosts: 0, salaryCosts: 0 });
        }
        const yearData = costsByYear.get(costYear)!;
        yearData.varCosts += Number(cost.amount);
      });
    
    // Process allocation costs grouped by year
    [...allProjectAllocations, ...allocations]
      .filter(a => isBefore(new Date(a.month), nextMonth))
      .forEach(allocation => {
        const allocYear = getYear(new Date(allocation.month));
        if (!costsByYear.has(allocYear)) {
          costsByYear.set(allocYear, { varCosts: 0, salaryCosts: 0 });
        }
        const yearData = costsByYear.get(allocYear)!;
        yearData.salaryCosts += Number(allocation.salary_cost);
      });
    
    // Apply appropriate overhead percentage to each year's costs
    let accumulatedOverheadCosts = 0;
    costsByYear.forEach((costs, yearNum) => {
      const yearOverheadPercentage = getOverheadPercentage(yearNum);
      const yearTotalCosts = costs.varCosts + costs.salaryCosts;
      accumulatedOverheadCosts += (yearTotalCosts * yearOverheadPercentage) / 100;
    });
    
    // Calculate total accumulated costs
    const accumulatedTotalCosts = accumulatedVariableCosts + accumulatedAllocCosts + accumulatedOverheadCosts;
    
    // Calculate accumulated profit using the provided function
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
    // Calculate accumulated profit percentage
    const accumulatedProfitPercentage = accumulatedRevenues > 0 
      ? (accumulatedProfit / accumulatedRevenues) * 100 
      : 0;
    
    return {
      month,
      monthlyCosts: totalMonthlyCosts,
      monthlyRevenues: monthRevenues,
      monthlyProfit,
      monthlyProfitPercentage,
      accumulatedCosts: accumulatedTotalCosts,
      accumulatedRevenues,
      accumulatedProfit,
      accumulatedProfitPercentage
    } as MonthData;
  }), [
    months, revenues, variableCosts, allocations, 
    getOverheadPercentage, year, calculateAccumulatedProfitUpToMonth,
    allProjectRevenues, allProjectVariableCosts, allProjectAllocations
  ]);

  return {
    months,
    monthlyData
  };
}
