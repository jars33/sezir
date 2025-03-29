
import { useQuery } from "@tanstack/react-query"
import { format, startOfYear, endOfYear } from "date-fns"
import type { AllocationData } from "./types"
import { teamMemberAllocationsService } from "@/services/supabase"

export function useAllocationData(memberId: string, selectedYear: number) {
  const { data: allocations, refetch } = useQuery({
    queryKey: ["team-member-allocations", memberId, selectedYear],
    queryFn: async () => {
      const startDate = format(startOfYear(new Date(selectedYear, 0)), 'yyyy-MM-dd')
      const endDate = format(endOfYear(new Date(selectedYear, 0)), 'yyyy-MM-dd')

      return await teamMemberAllocationsService.getTeamMemberAllocations(memberId, startDate, endDate)
    },
  })

  return { allocations, refetch }
}
