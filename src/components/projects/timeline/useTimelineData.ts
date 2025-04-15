
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
  
  // Fetch all project revenues
  const { 
    data: allProjectRevenues,
    isLoading: isAllRevenuesLoading 
  } = useQuery({
    queryKey: ["all-project-revenues", projectId],
    queryFn: async () => {
      try {
        const data = await revenueService.getProjectRevenues(projectId);
        return data as TimelineItem[];
      } catch (error) {
        toast.error("Failed to load all revenues");
        throw error;
      }
    },
  })

  // Fetch all project variable costs
  const { 
    data: allProjectVariableCosts,
    isLoading: isAllVariableCostsLoading 
  } = useQuery({
    queryKey: ["all-project-variable-costs", projectId],
    queryFn: async () => {
      try {
        const data = await variableCostService.getProjectVariableCosts(projectId);
        return data as TimelineItem[];
      } catch (error) {
        toast.error("Failed to load all variable costs");
        throw error;
      }
    },
  })

  // Fetch all project allocations
  const { 
    data: allProjectAllocations,
    isLoading: isAllAllocationsLoading 
  } = useQuery({
    queryKey: ["all-project-allocations", projectId],
    queryFn: async () => {
      try {
        const data = await allocationService.getProjectAllocations(projectId);
        return data as AllocationItem[];
      } catch (error) {
        toast.error("Failed to load all allocations");
        throw error;
      }
    },
  })
  
  // Filtered revenues for current year
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

  // Filtered variable costs for current year
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

  // Filtered allocations for current year
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
    queryClient.invalidateQueries({ queryKey: ["all-project-revenues", projectId] })
    queryClient.invalidateQueries({ queryKey: ["all-project-variable-costs", projectId] })
    queryClient.invalidateQueries({ queryKey: ["all-project-allocations", projectId] })
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
  const isLoading = isRevenuesLoading || 
                    isVariableCostsLoading || 
                    isAllocationsLoading ||
                    isAllRevenuesLoading ||
                    isAllVariableCostsLoading ||
                    isAllAllocationsLoading

  return {
    revenues: revenues || [],
    variableCosts: variableCosts || [],
    allocations: allocations || [],
    // Add all project data
    allProjectRevenues: allProjectRevenues || [],
    allProjectVariableCosts: allProjectVariableCosts || [],
    allProjectAllocations: allProjectAllocations || [],
    isLoading,
    refetchTimelineData
  }
}
