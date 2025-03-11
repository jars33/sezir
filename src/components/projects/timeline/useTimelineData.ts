
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { format } from "date-fns"

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

  const { 
    data: variableCosts,
    isLoading: isVariableCostsLoading,
    refetch: refetchVariableCosts 
  } = useQuery({
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

  const { 
    data: allocations,
    isLoading: isAllocationsLoading,
    refetch: refetchAllocations 
  } = useQuery({
    queryKey: ["project-allocations", projectId, "with-salaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignment_id,
          project_assignments!inner (
            id,
            team_members!inner (
              id,
              name
            )
          )
        `)
        .eq("project_assignments.project_id", projectId)

      if (error) {
        toast.error("Failed to load allocations")
        throw error
      }

      // For each allocation, get the valid salary for that month
      const allocationsWithSalaries = await Promise.all(
        (data || []).map(async (allocation) => {
          const { data: salaryData } = await supabase
            .from("salary_history")
            .select("amount")
            .eq("team_member_id", allocation.project_assignments.team_members.id)
            .lte("start_date", allocation.month)
            .or(`end_date.is.null,end_date.gte.${allocation.month}`)
            .order("start_date", { ascending: false })
            .maybeSingle()

          // If no salary data is found or there's an error, use 0 as the salary
          const monthlySalary = salaryData?.amount || 0
          const salary_cost = (monthlySalary * allocation.allocation_percentage) / 100

          return {
            id: allocation.id,
            month: allocation.month,
            allocation_percentage: allocation.allocation_percentage,
            team_member_name: allocation.project_assignments.team_members.name,
            team_member_id: allocation.project_assignments.team_members.id,
            project_assignment_id: allocation.project_assignment_id,
            salary_cost
          }
        })
      )

      return allocationsWithSalaries as AllocationItem[]
    },
  })

  // Calculate overhead costs based on variable costs and overhead percentage
  const overheadCosts = React.useMemo(() => {
    if (!variableCosts) return []
    
    // Group variable costs by month
    const costsByMonth = variableCosts.reduce<Record<string, number>>((acc, cost) => {
      const yearMonth = cost.month.substring(0, 7) // Format: YYYY-MM
      acc[yearMonth] = (acc[yearMonth] || 0) + Number(cost.amount)
      return acc
    }, {})
    
    // Create overhead costs for each month with variable costs
    return Object.entries(costsByMonth).map(([month, totalAmount]) => {
      const year = parseInt(month.split('-')[0])
      const percentage = getOverheadPercentage(year)
      const overheadAmount = (totalAmount * percentage) / 100
      
      return {
        id: `overhead-${month}`,
        month: `${month}-01`, // Set to first day of month for date formatting
        amount: overheadAmount,
        description: `${percentage}% overhead`,
        isCalculated: true // Mark as calculated so we know it's not from DB
      }
    })
  }, [variableCosts, getOverheadPercentage])

  // Combined refetch function
  const refetchTimelineData = async () => {
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
    overheadCosts,
    allocations: allocations || [],
    isLoading,
    refetchTimelineData
  }
}
