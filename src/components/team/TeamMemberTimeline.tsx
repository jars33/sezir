
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
  const { registerContainer, setScrollLeft } = useSynchronizedScroll()
  
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
    if (containerRef.current) {
      // Container scroll position will be handled by the synchronizedScroll hook
    }
  }, []);
  
  // Handle scroll event to synchronize scrolling
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
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
