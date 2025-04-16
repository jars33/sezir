
import { useRef, useEffect } from "react";
import { AllocationData } from "./types";
import { MonthAllocations } from "./MonthAllocations";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";

interface AllocationsGridProps {
  months: Date[];
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function AllocationsGrid({ months, allocations, onAllocationClick }: AllocationsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerContainer, setScrollLeft } = useSynchronizedScroll();
  
  // Register the container for synchronized scrolling
  useEffect(() => {
    registerContainer(containerRef.current);
  }, [registerContainer]);
  
  // Handle scroll event to update the shared scroll position
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  return (
    <div 
      className="overflow-auto w-full sync-scroll"
      ref={containerRef}
      onScroll={handleScroll}
    >
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
    </div>
  );
}
