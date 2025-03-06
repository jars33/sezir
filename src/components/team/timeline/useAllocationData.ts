
import { useQuery } from "@tanstack/react-query"
import { format, startOfYear, endOfYear } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import type { AllocationData } from "./types"

export function useAllocationData(memberId: string, selectedYear: number) {
  const { data: allocations, refetch } = useQuery({
    queryKey: ["team-member-allocations", memberId, selectedYear],
    queryFn: async () => {
      const startDate = format(startOfYear(new Date(selectedYear, 0)), 'yyyy-MM-dd')
      const endDate = format(endOfYear(new Date(selectedYear, 0)), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            project:projects(
              id,
              name,
              number
            )
          )
        `)
        .eq("project_assignments.team_member_id", memberId)
        .gte("month", startDate)
        .lte("month", endDate)
        .order("month")

      if (error) throw error

      return data.map(allocation => ({
        id: allocation.id,
        month: allocation.month,
        allocation_percentage: allocation.allocation_percentage,
        project: allocation.project_assignments.project
      })) as AllocationData[]
    },
  })

  return { allocations, refetch }
}
