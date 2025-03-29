
import { AllocationData } from "./types";
import { MonthAllocations } from "./MonthAllocations";

interface AllocationsGridProps {
  months: Date[];
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function AllocationsGrid({ months, allocations, onAllocationClick }: AllocationsGridProps) {
  return (
    <div className="min-w-[1200px]">
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
  );
}
