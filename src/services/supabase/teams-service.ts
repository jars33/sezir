
import { supabase } from "@/integrations/supabase/client";
import type { Team, TeamMembership } from "@/types/team";

export const teamsService = {
  /**
   * Get all teams
   */
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Team[];
  },

  /**
   * Get a team by ID
   */
  async getTeam(id: string): Promise<Team | null> {
    if (!id || id === 'new') return null;
    
    const { data, error } = await supabase
      .from("teams")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Team | null;
  },

  /**
   * Get team memberships with member details
   */
  async getTeamMemberships(teamId: string): Promise<any[]> {
    if (!teamId || teamId === 'new') return [];
    
    const { data, error } = await supabase
      .from("team_memberships")
      .select(`
        id,
        team_id,
        team_member_id,
        role,
        created_at,
        updated_at,
        team_member:team_member_id(id, name)
      `)
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching team memberships:", error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Get a mapping of team IDs to team names
   */
  async getTeamNames(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name");

    if (error) throw error;
    
    const teamNames: Record<string, string> = {};
    data?.forEach(team => {
      teamNames[team.id] = team.name;
    });
    
    return teamNames;
  },

  /**
   * Delete a team
   */
  async deleteTeam(id: string): Promise<void> {
    // First delete team memberships
    const { error: membershipError } = await supabase
      .from("team_memberships")
      .delete()
      .eq("team_id", id);
    
    if (membershipError) throw membershipError;
    
    // Then delete the team
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};
