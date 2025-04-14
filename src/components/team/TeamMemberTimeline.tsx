
import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TeamMemberAllocationDialog } from "./TeamMemberAllocationDialog"
import { MonthAllocation } from "./timeline/MonthAllocation"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { useAllocationData } from "./timeline/useAllocationData"
import { useAllocationSubmit } from "./timeline/useAllocationSubmit"
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
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const { allocations, refetch } = useAllocationData(member.id, selectedYear)
  const { handleAllocationSubmit } = useAllocationSubmit(member.id, refetch)

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(selectedYear, i, 1)
  })
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollLeft(containerRef.current.scrollLeft)
    
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
    containerRef.current.scrollLeft = scrollLeft - distance
  }

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
