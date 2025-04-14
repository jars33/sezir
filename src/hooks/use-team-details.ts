
import { useQuery } from "@tanstack/react-query"
import { teamsService } from "@/services/supabase/teams-service"
import { supabase } from "@/integrations/supabase/client"

export function useTeamDetails(id: string | undefined) {
  // Get team details
  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      if (!id || id === "new") return null
      return await teamsService.getTeam(id)
    },
  })

  // Get projects associated with the team
  const { data: linkedProjects } = useQuery({
    queryKey: ["team-projects", id],
    queryFn: async () => {
      if (!id || id === "new") return []
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, number")
        .eq("team_id", id)

      if (error) throw error
      return data || []
    },
    enabled: !!id && id !== "new",
  })

  return {
    team,
    isTeamLoading,
    linkedProjects
  }
}
