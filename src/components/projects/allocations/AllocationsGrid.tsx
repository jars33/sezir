
import { useRef, useState, useCallback } from "react";
import { AllocationData } from "./types";
import { MonthAllocations } from "./MonthAllocations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AllocationsGridProps {
  months: Date[];
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function AllocationsGrid({ months, allocations, onAllocationClick }: AllocationsGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Mouse handlers for drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  return (
    <ScrollArea className="h-full w-full">
      <div 
        className="min-w-[2400px]"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
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
