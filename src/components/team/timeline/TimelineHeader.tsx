
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamMember } from "@/types/team-member"

interface TimelineHeaderProps {
  member: TeamMember
  onAddAllocation: () => void
}

export function TimelineHeader({ member, onAddAllocation }: TimelineHeaderProps) {
  const navigate = useNavigate()

  const handleMemberNameClick = () => {
    navigate(`/team/${member.id}`)
  }

  return (
    <CardHeader className="flex flex-row items-center justify-between py-3">
      <CardTitle 
        className="text-lg cursor-pointer hover:text-primary transition-colors" 
        onClick={handleMemberNameClick}
      >
        {member.name}
      </CardTitle>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddAllocation}
        className="hover:bg-primary hover:text-primary-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Allocation
      </Button>
    </CardHeader>
  )
}
