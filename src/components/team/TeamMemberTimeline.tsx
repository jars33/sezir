
import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TeamMemberAllocationDialog } from "./TeamMemberAllocationDialog"
import { MonthAllocation } from "./timeline/MonthAllocation"
import { TimelineHeader } from "./timeline/TimelineHeader"
import { useAllocationData } from "./timeline/useAllocationData"
import { useAllocationSubmit } from "./timeline/useAllocationSubmit"
import type { TeamMember } from "@/types/team-member"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TeamMemberTimelineProps {
  member: TeamMember
  selectedYear: number
  onEditMember: (member: TeamMember) => void
}

export function TeamMemberTimeline({ member, selectedYear, onEditMember }: TeamMemberTimelineProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const currentDate = new Date()
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const { allocations, refetch } = useAllocationData(member.id, selectedYear)
  const { handleAllocationSubmit } = useAllocationSubmit(member.id, refetch)

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(selectedYear, i, 1)
  })
  
  // Mouse handlers for drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  return (
    <Card className="mb-3">
      <TimelineHeader 
        member={member} 
        onAddAllocation={() => setIsDialogOpen(true)}
        onEditMember={onEditMember}
      />
      
      <CardContent className="pb-3 pt-0">
        <ScrollArea className="h-full w-full">
          <div 
            className="min-w-[2400px]"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
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
        </ScrollArea>
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
