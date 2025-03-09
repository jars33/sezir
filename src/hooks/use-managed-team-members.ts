
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
      console.log("🔍 useManagedTeamMembers: Starting query with userId:", userId)
      if (!userId) {
        console.log("⚠️ No userId available, returning empty array")
        return []
      }
      
      try {
        // First get all teams the user manages
        const { data: managedTeams, error: teamsError } = await supabase
          .from("teams")
          .select("id")
          .eq("manager_id", userId)
        
        if (teamsError) {
          console.error("❌ Error fetching managed teams:", teamsError)
          throw teamsError
        }
        
        console.log("✅ Managed teams:", managedTeams?.length || 0, managedTeams)
        
        // Get own team memberships to find teams the user is part of
        const { data: ownMemberships, error: membershipsError } = await supabase
          .from("team_memberships")
          .select("team_id")
          .eq("team_member_id", userId)
        
        if (membershipsError) {
          console.error("❌ Error fetching own memberships:", membershipsError)
          throw membershipsError
        }
        
        console.log("✅ Own team memberships:", ownMemberships?.length || 0, ownMemberships)
        
        // Combine teams the user manages and teams the user is part of
        const teamIds = [
          ...(managedTeams || []).map(team => team.id),
          ...(ownMemberships || []).map(membership => membership.team_id)
        ]
        
        console.log("📋 Combined team IDs:", teamIds.length, teamIds)
        
        // First, check if the user has a team member record already
        const { data: userTeamMember, error: userTeamMemberError } = await supabase
          .from("team_members")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()
        
        if (userTeamMemberError && userTeamMemberError.code !== 'PGRST116') {
          console.error("❌ Error fetching user team member:", userTeamMemberError)
          throw userTeamMemberError
        }
        
        console.log("🧑 User's own team member record:", userTeamMember)
        
        // Get team member ids from team memberships for the teams the user is in or manages
        let teamMemberIds: string[] = []
        
        if (teamIds.length > 0) {
          const { data: teamMemberships, error: teamMembershipsError } = await supabase
            .from("team_memberships")
            .select("team_member_id")
            .in("team_id", teamIds)
          
          if (teamMembershipsError) {
            console.error("❌ Error fetching team memberships:", teamMembershipsError)
            throw teamMembershipsError
          }
          
          if (teamMemberships) {
            teamMemberIds = teamMemberships.map(m => m.team_member_id)
            console.log("👥 Team member IDs from memberships:", teamMemberIds.length, teamMemberIds)
          }
        } else {
          console.log("ℹ️ No teams found for user, skipping team memberships query")
        }
        
        // Get all members from the collected IDs (from teams user manages or is part of)
        let allMembers: TeamMember[] = []
        
        if (teamMemberIds.length > 0) {
          const { data: members, error: membersError } = await supabase
            .from("team_members")
            .select("*")
            .in("id", [...new Set(teamMemberIds)]) // Deduplicate IDs
            .order("name", { ascending: true })
          
          if (membersError) {
            console.error("❌ Error fetching team members:", membersError)
            throw membersError
          }
          
          allMembers = [...(members || [])]
          console.log("👥 Team members fetched:", allMembers.length, allMembers)
        } else {
          console.log("ℹ️ No team member IDs found, skipping team members query")
        }
        
        // Get users who don't have a team (not in any team memberships)
        const { data: nonTeamMembers, error: nonTeamError } = await supabase
          .from("team_members")
          .select("*")
          .not("id", "in", `(SELECT team_member_id FROM team_memberships)`)
          .order("name", { ascending: true })
        
        if (nonTeamError) {
          console.error("❌ Error fetching non-team members:", nonTeamError)
          throw nonTeamError
        }
        
        console.log("🧍 Non-team members:", nonTeamMembers?.length || 0, nonTeamMembers)
        
        // Add the user's own team member record if it exists and isn't already included
        let combinedMembers = [
          ...allMembers,
          ...(nonTeamMembers || [])
        ]
        
        console.log("📊 Combined members before adding user:", combinedMembers.length, combinedMembers)
        
        if (userTeamMember && !combinedMembers.some(member => member.id === userTeamMember.id)) {
          console.log("➕ Adding user's own team member record to results")
          combinedMembers.push(userTeamMember)
        } else if (userTeamMember) {
          console.log("ℹ️ User's team member record already included in results")
        } else {
          console.log("⚠️ No team member record found for current user")
        }
        
        // Remove duplicates by ID
        const uniqueMembers = Array.from(
          new Map(combinedMembers.map(member => [member.id, member])).values()
        )
        
        console.log("🏁 Final unique members count:", uniqueMembers.length)
        console.log("🏁 Final unique members:", uniqueMembers)
        
        return uniqueMembers as TeamMember[]
      } catch (error) {
        console.error("❌ Error in useManagedTeamMembers:", error)
        throw error
      }
    },
    enabled: !!userId,
  })
}
