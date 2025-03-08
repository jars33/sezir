
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
      
      // Get own team memberships to find teams the user is part of
      const { data: ownMemberships, error: membershipsError } = await supabase
        .from("team_memberships")
        .select("team_id")
        .eq("team_member_id", userId)
      
      if (membershipsError) throw membershipsError
      
      // Combine teams the user manages and teams the user is part of
      const teamIds = [
        ...(managedTeams || []).map(team => team.id),
        ...(ownMemberships || []).map(membership => membership.team_id)
      ]
      
      // Get the user's own team member record
      const { data: selfTeamMember, error: selfError } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", userId)
        .single()
      
      if (selfError && selfError.code !== 'PGRST116') throw selfError // Ignore "No rows returned" error
      
      // Get team member ids from team memberships for the teams the user is in or manages
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
      
      // Add the user's own team member record to the list if it exists
      if (selfTeamMember) {
        memberIds.push(selfTeamMember.id)
      }
      
      // Get all members from the collected IDs (from teams user manages or is part of, plus self)
      let allMembers: TeamMember[] = []
      
      if (memberIds.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from("team_members")
          .select("*")
          .in("id", [...new Set(memberIds)]) // Deduplicate IDs
          .order("name", { ascending: true })
        
        if (membersError) throw membersError
        
        allMembers = [...(members || [])]
      }
      
      // Get users who don't have a team (not in any team memberships)
      const { data: nonTeamMembers, error: nonTeamError } = await supabase
        .from("team_members")
        .select("*")
        .not("id", "in", `(
          SELECT team_member_id FROM team_memberships
        )`)
        .order("name", { ascending: true })
      
      if (nonTeamError) throw nonTeamError
      
      // Combine all members, deduplicating by ID
      const combinedMembers = [
        ...allMembers,
        ...(nonTeamMembers || [])
      ]
      
      // Remove duplicates by ID
      const uniqueMembers = Array.from(
        new Map(combinedMembers.map(member => [member.id, member])).values()
      )
      
      return uniqueMembers as TeamMember[]
    },
    enabled: !!userId,
  })
}
