
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface Project {
  id: string
  name: string
  number: string
}

export function useProjectsData() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, number")
        .order("number")

      if (error) throw error
      return data as Project[]
    },
  })
}
