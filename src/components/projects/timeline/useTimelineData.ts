
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
}

export function useTimelineData(projectId: string) {
  const { data: revenues } = useQuery({
    queryKey: ["project-revenues", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_revenues")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load revenues")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const { data: variableCosts } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load variable costs")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const { data: overheadCosts } = useQuery({
    queryKey: ["project-overhead-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_overhead_costs")
        .select("*")
        .eq("project_id", projectId)

      if (error) {
        toast.error("Failed to load overhead costs")
        throw error
      }

      return data as TimelineItem[]
    },
  })

  const { data: allocations } = useQuery({
    queryKey: ["project-allocations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments (
            team_members (
              name
            )
          )
        `)
        .eq("project_assignments.project_id", projectId)

      if (error) {
        toast.error("Failed to load allocations")
        throw error
      }

      return (data || []).map(allocation => ({
        id: allocation.id,
        month: allocation.month,
        allocation_percentage: allocation.allocation_percentage,
        team_member_name: allocation.project_assignments.team_members.name
      })) as AllocationItem[]
    },
  })

  return {
    revenues: revenues || [],
    variableCosts: variableCosts || [],
    overheadCosts: overheadCosts || [],
    allocations: allocations || [],
  }
}
