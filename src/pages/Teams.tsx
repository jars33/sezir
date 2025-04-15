
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { OrganizationChart } from "@/components/team/OrganizationChart"
import { useToast } from "@/hooks/use-toast"
import type { Team, TeamNode } from "@/types/team"
import { useTranslation } from "react-i18next"

export default function Teams() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })

  const { data: teams, refetch: refetchTeams } = useQuery({
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

      // Update query to correctly join team member data
      const { data: memberships, error: membershipsError } = await supabase
        .from("team_memberships")
        .select(`
          id,
          team_id,
          team_member_id,
          role,
          team_members:team_member_id(id, name)
        `)

      if (membershipsError) {
        console.error("Error fetching team memberships:", membershipsError)
        throw membershipsError
      }

      // Build team hierarchy
      const buildTeamTree = (
        teamList: Team[],
        parentId: string | null = null
      ): TeamNode[] => {
        return teamList
          .filter(team => team.parent_team_id === parentId)
          .map(team => {
            const teamMemberships = memberships?.filter(
              m => m.team_id === team.id
            ) || []
            
            // Find the manager
            const managerMembership = teamMemberships.find(
              m => team.manager_id === m.team_member_id
            );
            
            const manager = managerMembership?.team_members || 
              (team.manager_id ? { id: team.manager_id, name: "Unknown Manager" } : undefined);

            return {
              id: team.id,
              name: team.name,
              manager: manager,
              children: buildTeamTree(teamList, team.id),
              members: teamMemberships.map(m => ({
                id: m.team_member_id,
                name: m.team_members?.name || "Unknown Member",
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
