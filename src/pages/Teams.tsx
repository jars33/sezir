
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { OrganizationChart } from "@/components/team/OrganizationChart"
import { useToast } from "@/hooks/use-toast"
import type { Team, TeamMembership, TeamNode } from "@/types/team"
import type { TeamMember } from "@/types/team-member"
import { useTranslation } from "react-i18next"

export default function Teams() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data: teams, error } = await supabase
        .from("teams")
        .select("*")

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teams",
        })
        throw error
      }

      const { data: memberships, error: membershipsError } = await supabase
        .from("team_memberships")
        .select(`
          *,
          team_members (
            id,
            name
          )
        `)

      if (membershipsError) throw membershipsError

      // Build team hierarchy
      const buildTeamTree = (
        teamList: Team[],
        parentId: string | null = null
      ): TeamNode[] => {
        return teamList
          .filter(team => team.parent_team_id === parentId)
          .map(team => {
            const teamMemberships = (memberships || []).filter(
              m => m.team_id === team.id
            )
            
            const manager = teamMemberships.find(
              m => team.manager_id === m.team_member_id
            )?.team_members

            return {
              id: team.id,
              name: team.name,
              manager: manager ? {
                id: manager.id,
                name: manager.name,
              } : undefined,
              children: buildTeamTree(teamList, team.id),
              members: teamMemberships.map(m => ({
                id: m.team_member_id,
                name: m.team_members.name,
                role: m.role,
              })),
            }
          })
      }

      return buildTeamTree(teams || [])
    },
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('common.organization')}</h1>
        <Button onClick={() => navigate("/teams/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('team.newTeam')}
        </Button>
      </div>

      <OrganizationChart teams={teams || []} />
    </div>
  )
}
