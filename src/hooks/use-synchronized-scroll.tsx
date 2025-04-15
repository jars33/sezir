
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
  
  // Register a container to be synchronized
  const registerContainer = (container: HTMLDivElement | null) => {
    if (container && !scrollContainers.current.includes(container)) {
      scrollContainers.current.push(container);
    }
  };

  // Synchronize all containers when scrollLeft changes
  useEffect(() => {
    scrollContainers.current.forEach(container => {
      if (container && container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
  }, [scrollLeft]);

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
