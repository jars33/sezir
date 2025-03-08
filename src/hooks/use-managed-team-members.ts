
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import type { TeamMember } from "@/types/team-member"

export function useManagedTeamMembers() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: ["managed-team-members", userId],
    queryFn: async () => {
      if (!userId) return []
      
      // First get all teams the user manages
      const { data: managedTeams, error: teamsError } = await supabase
        .from("teams")
        .select("id")
        .eq("manager_id", userId)
      
      if (teamsError) throw teamsError
      
      // Also get teams where the user is a manager of a team member
      const { data: indirectTeams, error: indirectError } = await supabase
        .from("teams")
        .select("id")
        .in(
          "manager_id", 
          // Get all team memberships for the current user
          supabase
            .from("team_memberships")
            .select("team_member_id")
            .eq("team_id", supabase.from("teams").select("id"))
            .then(result => (result.data || []).map(m => m.team_member_id))
        )
      
      if (indirectError) throw indirectError
      
      // Combine direct and indirect managed team IDs
      const allManagedTeamIds = [
        ...(managedTeams || []).map(team => team.id),
        ...(indirectTeams || []).map(team => team.id)
      ]
      
      if (allManagedTeamIds.length === 0) return []
      
      // Get all team members that belong to these teams
      const { data: teamMemberships, error: membershipsError } = await supabase
        .from("team_memberships")
        .select("team_member_id")
        .in("team_id", allManagedTeamIds)
      
      if (membershipsError) throw membershipsError
      
      if (!teamMemberships || teamMemberships.length === 0) return []
      
      const teamMemberIds = teamMemberships.map(m => m.team_member_id)
      
      // Finally, get the actual team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .in("id", teamMemberIds)
        .order("name", { ascending: true })
      
      if (membersError) throw membersError
      
      return members as TeamMember[]
    },
    enabled: !!userId,
  })
}
