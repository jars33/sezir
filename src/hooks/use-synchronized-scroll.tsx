
import { createContext, useContext, useState, useRef, useEffect } from "react";

interface SynchronizedScrollContextType {
  scrollLeft: number;
  setScrollLeft: (position: number) => void;
  registerContainer: (container: HTMLDivElement | null) => void;
  scrollContainers: React.MutableRefObject<(HTMLDivElement | null)[]>;
  register: (id: string) => { ref: (element: HTMLDivElement | null) => void; onScroll: React.UIEventHandler; };
}

const SynchronizedScrollContext = createContext<SynchronizedScrollContextType | undefined>(undefined);

export function SynchronizedScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainers = useRef<(HTMLDivElement | null)[]>([]);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Register a container to be synchronized
  const registerContainer = (container: HTMLDivElement | null) => {
    if (container && !scrollContainers.current.includes(container)) {
      scrollContainers.current.push(container);
    }
  };

  // Register a container with an ID for more controlled synchronization
  const register = (id: string) => {
    return {
      ref: (element: HTMLDivElement | null) => {
        if (element && containerRefs.current[id] !== element) {
          containerRefs.current[id] = element;
          scrollContainers.current.push(element);
        }
      },
      onScroll: (e: React.UIEvent) => {
        const target = e.currentTarget as HTMLDivElement;
        if (target.scrollLeft !== scrollLeft) {
          setScrollLeft(target.scrollLeft);
        }
      }
    };
  };

  // Synchronize all containers when scrollLeft changes
  useEffect(() => {
    scrollContainers.current.forEach(container => {
      if (container && container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
    
    // Also update containers registered with IDs
    Object.values(containerRefs.current).forEach(container => {
      if (container && container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
  }, [scrollLeft]);

  return (
    <SynchronizedScrollContext.Provider value={{ 
      scrollLeft, 
      setScrollLeft, 
      registerContainer, 
      scrollContainers,
      register 
    }}>
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
