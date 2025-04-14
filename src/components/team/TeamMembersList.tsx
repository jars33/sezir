
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TeamMembershipDialog } from "@/components/team/TeamMembershipDialog"
import { useTranslation } from "react-i18next"
import { teamsService } from "@/services/supabase/teams-service"

interface TeamMembersListProps {
  teamId: string
}

export function TeamMembersList({ teamId }: TeamMembersListProps) {
  const { t } = useTranslation()

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId || teamId === "new") return []
      return await teamsService.getTeamMemberships(teamId)
    },
    enabled: !!teamId && teamId !== "new",
  })

  if (teamId === "new") {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('team.title')}</h2>
        <TeamMembershipDialog 
          teamId={teamId} 
          trigger={
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          } 
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('team.name')}</TableHead>
            <TableHead>{t('team.role')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers?.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell>
                {membership.team_member?.name || t('team.unknownMember')}
              </TableCell>
              <TableCell className="capitalize">{membership.role}</TableCell>
            </TableRow>
          ))}
          {!isLoading && (!teamMembers || teamMembers.length === 0) && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                {t('team.noTeamMembers')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
