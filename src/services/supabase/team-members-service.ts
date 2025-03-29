
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  [key: string]: any;
}

export const teamMembersService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name")
      .eq("left_company", false)
      .order("name");

    if (error) throw error;
    return data;
  }
};
