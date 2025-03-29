
import { useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { format } from "date-fns"
import { revenueService, variableCostService, allocationService } from "@/services/supabase"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
  isNew?: boolean
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
  salary_cost: number
  team_member_id: string
  project_assignment_id: string
}

export function useTimelineData(projectId: string) {
  const queryClient = useQueryClient()
  const { getOverheadPercentage } = useProjectSettings()
  
  const { 
    data: revenues,
    isLoading: isRevenuesLoading,
    refetch: refetchRevenues 
  } = useQuery({
    queryKey: ["project-revenues", projectId],
    queryFn: async () => {
      try {
        const data = await revenueService.getProjectRevenues(projectId);
        return data as TimelineItem[];
      } catch (error) {
        toast.error("Failed to load revenues");
        throw error;
      }
    },
  })

  const { 
    data: variableCosts,
    isLoading: isVariableCostsLoading,
    refetch: refetchVariableCosts 
  } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      try {
        const data = await variableCostService.getProjectVariableCosts(projectId);
        return data as TimelineItem[];
      } catch (error) {
        toast.error("Failed to load variable costs");
        throw error;
      }
    },
  })

  const { 
    data: allocations,
    isLoading: isAllocationsLoading,
    refetch: refetchAllocations 
  } = useQuery({
    queryKey: ["project-allocations", projectId, "with-salaries"],
    queryFn: async () => {
      try {
        const data = await allocationService.getProjectAllocations(projectId);
        return data as AllocationItem[];
      } catch (error) {
        toast.error("Failed to load allocations");
        throw error;
      }
    },
  })

  // Combined refetch function - ensure we properly refresh all data
  const refetchTimelineData = async () => {
    // First invalidate all relevant queries
    queryClient.invalidateQueries({ queryKey: ["project-revenues", projectId] })
    queryClient.invalidateQueries({ queryKey: ["project-variable-costs", projectId] })
    queryClient.invalidateQueries({ queryKey: ["project-allocations", projectId, "with-salaries"] })
    
    // Then explicitly refetch each query
    await Promise.all([
      refetchRevenues(),
      refetchVariableCosts(),
      refetchAllocations()
    ])
  }

  // Combined loading state
  const isLoading = isRevenuesLoading || isVariableCostsLoading || isAllocationsLoading

  return {
    revenues: revenues || [],
    variableCosts: variableCosts || [],
    allocations: allocations || [],
    isLoading,
    refetchTimelineData
  }
}
