
import { useRef, useState } from "react";
import { AllocationData } from "./types";
import { MonthAllocations } from "./MonthAllocations";

interface AllocationsGridProps {
  months: Date[];
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function AllocationsGrid({ months, allocations, onAllocationClick }: AllocationsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(containerRef.current.scrollLeft);
    
    // Change cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Restore cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Restore cursor
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.clientX;
    const distance = x - startX;
    containerRef.current.scrollLeft = scrollLeft - distance;
  };

  return (
    <div 
      className="overflow-auto w-full"
      ref={containerRef}
      style={{ cursor: 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
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
