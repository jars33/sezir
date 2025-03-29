
import { supabase } from "@/integrations/supabase/client";

// Renamed from TeamMember to ServiceTeamMember to avoid conflict
export interface ServiceTeamMember {
  id: string;
  name: string;
  [key: string]: any;
}

export const teamMembersService = {
  async getTeamMembers(): Promise<ServiceTeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name")
      .eq("left_company", false)
      .order("name");

    if (error) throw error;
    return data;
  }
};
