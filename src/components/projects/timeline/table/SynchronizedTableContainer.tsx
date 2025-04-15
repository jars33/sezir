
import { useRef, useEffect } from "react";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";

interface SynchronizedTableContainerProps {
  children: React.ReactNode;
}

export function SynchronizedTableContainer({ children }: SynchronizedTableContainerProps) {
  const { registerContainer, scrollLeft, setScrollLeft } = useSynchronizedScroll();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    registerContainer(tableContainerRef.current);
  }, [registerContainer]);
  
  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.scrollLeft !== scrollLeft) {
      tableContainerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);
  
  const handleScroll = () => {
    if (tableContainerRef.current) {
      setScrollLeft(tableContainerRef.current.scrollLeft);
    }
  };
  
  return (
    <div 
      className="overflow-x-auto border rounded-lg" 
      ref={tableContainerRef}
      onScroll={handleScroll}
    >
      <div style={{ minWidth: "2400px" }}>
        {children}
      </div>
    </div>
  );
}
