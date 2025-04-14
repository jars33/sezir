
import { AllocationData } from "./types";
import { MonthAllocations } from "./MonthAllocations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AllocationsGridProps {
  months: Date[];
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function AllocationsGrid({ months, allocations, onAllocationClick }: AllocationsGridProps) {
  return (
    <ScrollArea className="h-full">
      <div className="min-w-[2400px]">
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {months.map((month) => (
            <MonthAllocations
              key={month.getTime()}
              month={month}
              allocations={allocations || []}
              onAllocationClick={onAllocationClick}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
