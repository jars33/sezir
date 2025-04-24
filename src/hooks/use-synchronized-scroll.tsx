
import { createContext, useContext, useState, useRef, useEffect } from "react";

interface SynchronizedScrollContextType {
  scrollLeft: number;
  setScrollLeft: (position: number) => void;
  registerContainer: (container: HTMLDivElement | null) => void;
  scrollContainers: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const SynchronizedScrollContext = createContext<SynchronizedScrollContextType | undefined>(undefined);

export function SynchronizedScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainers = useRef<(HTMLDivElement | null)[]>([]);
  const isScrolling = useRef(false);
  
  // Clean up stale references and register new containers
  const registerContainer = (container: HTMLDivElement | null) => {
    if (!container) {
      // When null is passed, clean up all non-existent nodes without adding anything
      scrollContainers.current = scrollContainers.current
        .filter(c => c && document.body.contains(c));
      return;
    }
    
    // Filter out null entries and non-existent nodes
    scrollContainers.current = scrollContainers.current
      .filter(c => c && document.body.contains(c));
    
    // Only add if not already in the array
    if (!scrollContainers.current.includes(container)) {
      scrollContainers.current.push(container);
      
      // Set initial scroll position for newly added containers
      if (scrollLeft > 0 && container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    }
  };

  // Synchronize all containers when scrollLeft changes
  useEffect(() => {
    // Prevent infinite scroll loops by checking if we're already scrolling
    if (isScrolling.current) return;
    
    isScrolling.current = true;
    
    scrollContainers.current.forEach(container => {
      if (container && container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
    
    // Reset the scrolling flag after a short delay
    setTimeout(() => {
      isScrolling.current = false;
    }, 50);
  }, [scrollLeft]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      scrollContainers.current = [];
    };
  }, []);

  return (
    <SynchronizedScrollContext.Provider value={{ scrollLeft, setScrollLeft, registerContainer, scrollContainers }}>
      {children}
    </SynchronizedScrollContext.Provider>
  );
}

export function useSynchronizedScroll() {
  const context = useContext(SynchronizedScrollContext);
  if (context === undefined) {
    throw new Error('useSynchronizedScroll must be used within a SynchronizedScrollProvider');
  }
  return context;
}
