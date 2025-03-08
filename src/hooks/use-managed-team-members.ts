
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
      
      // Get own team memberships to find indirect teams
      const { data: ownMemberships, error: membershipsError } = await supabase
        .from("team_memberships")
        .select("team_id")
        .eq("team_member_id", userId)
      
      if (membershipsError) throw membershipsError
      
      // Get all team memberships for the user
      const teamIds = [
        ...(managedTeams || []).map(team => team.id),
        ...(ownMemberships || []).map(membership => membership.team_id)
      ]
      
      // Get yourself as a team member
      const { data: selfTeamMember, error: selfError } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", userId)
      
      if (selfError) throw selfError
      
      if (teamIds.length === 0 && (!selfTeamMember || selfTeamMember.length === 0)) {
        return []
      }
      
      // Get team member ids from team memberships
      let memberIds: string[] = []
      
      if (teamIds.length > 0) {
        const { data: teamMemberships, error: teamMembershipsError } = await supabase
          .from("team_memberships")
          .select("team_member_id")
          .in("team_id", teamIds)
        
        if (teamMembershipsError) throw teamMembershipsError
        
        if (teamMemberships) {
          memberIds = teamMemberships.map(m => m.team_member_id)
        }
      }
      
      // Add yourself to the list if you exist as a team member
      if (selfTeamMember && selfTeamMember.length > 0) {
        memberIds.push(selfTeamMember[0].id)
      }
      
      // No members found, return empty array
      if (memberIds.length === 0) {
        return []
      }
      
      // Finally, get the actual team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .in("id", [...new Set(memberIds)]) // Deduplicate IDs
        .order("name", { ascending: true })
      
      if (membersError) throw membersError
      
      // Add users who don't have a team (get all team members not in any team)
      const { data: nonTeamMembers, error: nonTeamError } = await supabase
        .from("team_members")
        .select("*")
        .not("id", "in", `(${
          supabase
            .from("team_memberships")
            .select("team_member_id")
            .then(result => (result.data || []).map(m => m.team_member_id).join(","))
        })`)
        .order("name", { ascending: true })
      
      if (nonTeamError) throw nonTeamError
      
      // Combine members with non-team members, deduplicating by ID
      const allMembers = [
        ...(members || []),
        ...(nonTeamMembers || [])
      ]
      
      // Remove duplicates by ID
      const uniqueMembers = Array.from(
        new Map(allMembers.map(member => [member.id, member])).values()
      )
      
      return uniqueMembers as TeamMember[]
    },
    enabled: !!userId,
  })
}
