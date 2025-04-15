
import { useRef, useEffect } from "react";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";

interface SynchronizedTableContainerProps {
  children: React.ReactNode;
}

export function SynchronizedTableContainer({ children }: SynchronizedTableContainerProps) {
  const { register } = useSynchronizedScroll();
  
  // Register this container with the synchronized scroll system
  const scrollProps = register("timeline-table-container");
  
  return (
    <div 
      className="overflow-x-auto border rounded-lg" 
      ref={scrollProps.ref}
      onScroll={scrollProps.onScroll}
    >
      <div style={{ minWidth: "2400px" }}>
        {children}
      </div>
    </div>
  );
}
