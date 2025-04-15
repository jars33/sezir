
import React from "react";
import { SynchronizedScrollProvider } from "@/hooks/use-synchronized-scroll";
import { TimelineMonth } from "../TimelineMonth";
import { TimelineDetailsTable } from "../TimelineDetailsTable";
import type { TimelineItem, AllocationItem } from "../actions/types";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";

interface TimelineMonthsGridProps {
  startDate: Date;
  revenues: TimelineItem[];
  variableCosts: TimelineItem[];
  allocations: AllocationItem[];
  onSelectRevenue: (revenue: TimelineItem) => void;
  onSelectVariableCost: (cost: TimelineItem) => void;
  onSelectAllocation: (allocation: AllocationItem) => void;
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number;
  year: number;
  showDecimals?: boolean;
  allProjectRevenues?: TimelineItem[];
  allProjectVariableCosts?: TimelineItem[];
  allProjectAllocations?: AllocationItem[];
}

export function TimelineMonthsGrid({
  startDate,
  revenues,
  variableCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectAllocation,
  calculateAccumulatedProfitUpToMonth,
  year,
  showDecimals = true,
  allProjectRevenues = [],
  allProjectVariableCosts = [],
  allProjectAllocations = []
}: TimelineMonthsGridProps) {
  const { register } = useSynchronizedScroll();
  
  // Register the scroll container
  const scrollProps = register("timeline-months-grid");
  
  return (
    <div className="space-y-6">
      <div 
        className="grid auto-cols-[180px] grid-flow-col gap-2 overflow-x-scroll scrollbar-hide"
        ref={scrollProps.ref}
        onScroll={scrollProps.onScroll}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(startDate);
          monthDate.setMonth(startDate.getMonth() + i);
          const accumulatedProfit = calculateAccumulatedProfitUpToMonth(monthDate);
          
          // Determine overhead costs for this month
          // This is a simplification - you might need to calculate this differently
          const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`;
          const monthRevenues = revenues.filter(r => r.month.startsWith(monthStr));
          const monthVarCosts = variableCosts.filter(c => c.month.startsWith(monthStr));
          const monthAllocations = allocations.filter(a => a.month.startsWith(monthStr));
          
          // Create empty overhead costs array - will be populated in TimelineMonth if needed
          const overheadCosts: any[] = [];
          
          return (
            <TimelineMonth
              key={i}
              month={monthDate}
              revenues={monthRevenues}
              variableCosts={monthVarCosts}
              overheadCosts={overheadCosts}
              allocations={monthAllocations}
              onSelectRevenue={onSelectRevenue}
              onSelectVariableCost={onSelectVariableCost}
              onSelectOverheadCost={(cost: any) => {/* Not implemented yet */}}
              onSelectAllocation={onSelectAllocation}
              accumulatedProfit={accumulatedProfit}
              showDecimals={showDecimals}
            />
          );
        })}
      </div>

      <TimelineDetailsTable
        startDate={startDate}
        revenues={revenues}
        variableCosts={variableCosts}
        allocations={allocations}
        calculateAccumulatedProfitUpToMonth={calculateAccumulatedProfitUpToMonth}
        year={year}
        allProjectRevenues={allProjectRevenues}
        allProjectVariableCosts={allProjectVariableCosts}
        allProjectAllocations={allProjectAllocations}
      />
    </div>
  );
}
