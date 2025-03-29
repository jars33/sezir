
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/supabase";

export interface Project {
  id: string;
  name: string;
  number: string;
}

export function useProjectsData() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projectService.getAllProjects();
    },
  });
}
