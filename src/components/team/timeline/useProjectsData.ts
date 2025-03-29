
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/supabase";
import type { ProjectStatus } from "@/services/supabase/project-service";

export interface Project {
  id: string;
  name: string;
  number: string;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  team_id?: string | null;
  user_id?: string;
}

export function useProjectsData() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projectService.getAllProjects();
    },
  });
}
