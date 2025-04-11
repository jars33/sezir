
import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  manager_id?: string | null;
  parent_team_id?: string | null;
}

export const teamsService = {
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, description, manager_id, parent_team_id")
      .order("name");

    if (error) throw error;
    return data;
  },
  
  async getTeamNames(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name");

    if (error) throw error;

    return data.reduce((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {} as Record<string, string>);
  },

  async deleteTeam(id: string): Promise<void> {
    try {
      // First, unlink all projects from this team
      const { error: unlinkError } = await supabase
        .from("projects")
        .update({ team_id: null })
        .eq("team_id", id);
      
      if (unlinkError) throw unlinkError;

      // Delete team memberships
      const { error: membershipError } = await supabase
        .from("team_memberships")
        .delete()
        .eq("team_id", id);
      
      if (membershipError) throw membershipError;

      // Delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", id);
      
      if (teamError) throw teamError;
    } catch (error) {
      throw error;
    }
  }
};
