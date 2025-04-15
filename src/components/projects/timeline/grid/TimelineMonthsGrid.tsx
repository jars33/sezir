
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
  
  return (
    <div className="space-y-6">
      <div 
        className="grid auto-cols-[180px] grid-flow-col gap-2 overflow-x-scroll scrollbar-hide"
        {...register("timeline-months-grid")}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(startDate);
          monthDate.setMonth(startDate.getMonth() + i);
          
          return (
            <TimelineMonth
              key={i}
              date={monthDate}
              revenues={revenues.filter(r => r.month.startsWith(`${year}-${String(i + 1).padStart(2, '0')}`))}
              variableCosts={variableCosts.filter(c => c.month.startsWith(`${year}-${String(i + 1).padStart(2, '0')}`))}
              allocations={allocations.filter(a => a.month.startsWith(`${year}-${String(i + 1).padStart(2, '0')}`))}
              onSelectRevenue={onSelectRevenue}
              onSelectVariableCost={onSelectVariableCost}
              onSelectAllocation={onSelectAllocation}
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
