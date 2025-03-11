
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"

export function useProjectPermissions(projectId: string, projectUserId?: string, projectTeamId?: string | null) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ["project-permission", projectId, session?.user.id, projectTeamId],
    enabled: !!session?.user.id && !!projectId,
    queryFn: async () => {
      // If project has no team_id, check if user is the creator
      if (!projectTeamId) {
        return projectUserId === session?.user.id
      }
      
      // Check if user is the creator of the project
      if (projectUserId === session?.user.id) {
        return true
      }

      // Get the team info with manager_id and parent_team_id
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("manager_id, parent_team_id")
        .eq("id", projectTeamId)
        .single()

      if (teamError) {
        console.error("Error checking team manager:", teamError)
        return false
      }

      // Check if user is the direct team manager
      if (teamData?.manager_id === session?.user.id) {
        return true
      }

      // If there's a parent team, check if user is the manager of the parent team
      if (teamData?.parent_team_id) {
        const { data: parentTeamData, error: parentTeamError } = await supabase
          .from("teams")
          .select("manager_id")
          .eq("id", teamData.parent_team_id)
          .single()

        if (!parentTeamError && parentTeamData?.manager_id === session?.user.id) {
          return true
        }
      }

      // Check if user is a member of the team
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_memberships")
        .select("id")
        .eq("team_id", projectTeamId)
        .eq("team_member_id", session?.user.id)
        .single()

      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error("Error checking team membership:", membershipError)
      }

      return !!membershipData
    }
  })
}
