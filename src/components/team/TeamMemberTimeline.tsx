
import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TeamMemberAllocationDialog } from "./TeamMemberAllocationDialog"
import { MonthAllocation } from "./timeline/MonthAllocation"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { useAllocationData } from "./timeline/useAllocationData"
import { useAllocationSubmit } from "./timeline/useAllocationSubmit"
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll"
import type { TeamMember } from "@/types/team-member"
import { useTranslation } from "react-i18next"

interface TeamMemberTimelineProps {
  member: TeamMember
  selectedYear: number
  onEditMember: (member: TeamMember) => void
}

export function TeamMemberTimeline({ member, selectedYear, onEditMember }: TeamMemberTimelineProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const currentDate = new Date()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const { scrollLeft, setScrollLeft, registerContainer } = useSynchronizedScroll()
  
  const { allocations, refetch } = useAllocationData(member.id, selectedYear)
  const { handleAllocationSubmit } = useAllocationSubmit(member.id, refetch)

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(selectedYear, i, 1)
  })
  
  // Register the container for synchronized scrolling
  useEffect(() => {
    if (containerRef.current) {
      registerContainer(containerRef.current);
    }
  }, [registerContainer]);
  
  // Update the container's scroll position when the shared scrollLeft changes
  useEffect(() => {
    if (containerRef.current && containerRef.current.scrollLeft !== scrollLeft) {
      containerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setStartX(e.clientX)
    
    // Change cursor to grabbing
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing'
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    
    // Restore cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      
      // Restore cursor
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab'
      }
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    
    e.preventDefault()
    const x = e.clientX
    const distance = x - startX
    
    // When dragging, update the scroll position of all containers through context
    const newScrollPosition = containerRef.current.scrollLeft - distance;
    setScrollLeft(newScrollPosition);
    
    // Reset the start X to the current position for smooth continuous scrolling
    setStartX(x);
  }
  
  // Handle scroll event to update the shared scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging) return; // Ignore scroll events during drag
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  return (
    <Card className="mb-3">
      <TimelineHeader 
        member={member} 
        onAddAllocation={() => setIsDialogOpen(true)}
        onEditMember={onEditMember}
      />
      
      <CardContent className="pb-3 pt-0">
        <div 
          className="overflow-auto w-full"
          ref={containerRef}
          style={{ cursor: 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll}
        >
          <div className="min-w-[2400px]">
            <div className="grid grid-cols-[repeat(12,_1fr)] gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {months.map((month) => (
                <MonthAllocation 
                  key={month.getTime()}
                  month={month}
                  allocations={allocations || []}
                  currentDate={currentDate}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <TeamMemberAllocationDialog
        teamMemberId={member.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAllocationSubmit}
      />
    </Card>
  )
}
