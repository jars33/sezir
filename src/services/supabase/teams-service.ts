
import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
}

export const teamsService = {
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name")
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
  }
};
