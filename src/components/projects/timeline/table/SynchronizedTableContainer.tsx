
import { useRef, useEffect } from "react";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";

interface SynchronizedTableContainerProps {
  children: React.ReactNode;
}

export function SynchronizedTableContainer({ children }: SynchronizedTableContainerProps) {
  const { registerContainer, setScrollLeft } = useSynchronizedScroll();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tableContainerRef.current) {
      registerContainer(tableContainerRef.current);
    }
    
    return () => {
      if (tableContainerRef.current) {
        registerContainer(null);
      }
    };
  }, [registerContainer, children]);
  
  const handleScroll = () => {
    if (tableContainerRef.current) {
      setScrollLeft(tableContainerRef.current.scrollLeft);
    }
  };
  
  return (
    <div 
      className="overflow-x-auto border rounded-lg sync-scroll isolate" 
      ref={tableContainerRef}
      onScroll={handleScroll}
    >
      <div className="min-w-[2400px]">
        {children}
      </div>
    </div>
  );
}
