
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/components/team/timeline/useProjectsData";

export type ProjectStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface ProjectCreate {
  number: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  team_id: string | null;
  user_id: string;
}

export interface ProjectUpdate {
  number?: string;
  name?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus;
  team_id?: string | null;
}

export const projectService = {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, number")
      .order("number");

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new project
   */
  async createProject(project: ProjectCreate): Promise<any> {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a project
   */
  async updateProject(id: string, project: ProjectUpdate): Promise<any> {
    const { data, error } = await supabase
      .from("projects")
      .update(project)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
