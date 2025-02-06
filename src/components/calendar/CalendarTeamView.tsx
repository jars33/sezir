
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { isSameDay } from "date-fns"

type TeamMember = {
  id: string
  name: string
  type: "contract" | "external"
  start_date: string
  end_date: string | null
  left_company: boolean
}

interface CalendarTeamViewProps {
  date: Date
  teamMembers: TeamMember[]
}

export function CalendarTeamView({ date, teamMembers }: CalendarTeamViewProps) {
  const typeColors = {
    contract: "bg-purple-100 text-purple-800",
    external: "bg-orange-100 text-orange-800",
  }

  const filteredMembers = teamMembers.filter((member) => {
    if (!member.start_date) return false
    return isSameDay(new Date(member.start_date), date)
  })

  if (filteredMembers.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No team members starting on this date.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredMembers.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{member.name}</p>
              {member.left_company && (
                <p className="text-sm text-red-600">No longer with company</p>
              )}
            </div>
            <Badge variant="secondary" className={typeColors[member.type]}>
              {member.type}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
