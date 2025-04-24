
import { 
  useTeamMembersQuery, 
  useProjectsQuery, 
  useProjectRevenuesQuery, 
  useVariableCostsQuery, 
  useOverheadCostsQuery,
  useAllocationsQuery,
  useTeamMemberSalariesQuery
} from "./queries"
import { DashboardFilters } from "./types"
import { useDashboardFilters } from "./use-filters"

/**
 * Hook to fetch all required dashboard data
 */
export const useDashboardData = (filters: DashboardFilters = {}) => {
  const { selectedYear, teamId, yearStart, yearEnd } = useDashboardFilters(filters)
  
  // Fetch data using the extracted query hooks
  const { data: teamMembers, isLoading: isTeamMembersLoading } = useTeamMembersQuery(teamId)
  
  const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery(selectedYear, teamId)
  
  const queryParams = { selectedYear, teamId, yearStart, yearEnd }
  
  const { data: projectRevenues, isLoading: isRevenuesLoading } = useProjectRevenuesQuery(queryParams)
  
  const { data: variableCosts, isLoading: isVariableCostsLoading } = useVariableCostsQuery(queryParams)
  
  const { data: overheadCosts, isLoading: isOverheadCostsLoading } = useOverheadCostsQuery(queryParams)
  
  const { data: allocations, isLoading: isAllocationsLoading } = useAllocationsQuery(queryParams)

  // New: Fetch full team member salaries
  const { data: teamMemberSalaries, isLoading: isTeamMemberSalariesLoading } = useTeamMemberSalariesQuery(queryParams)

  // Check if any data is still loading
  const isLoading = 
    isTeamMembersLoading || 
    isProjectsLoading || 
    isRevenuesLoading || 
    isVariableCostsLoading || 
    isOverheadCostsLoading ||
    isAllocationsLoading ||
    isTeamMemberSalariesLoading

  return {
    data: {
      teamMembers,
      projects,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations,
      teamMemberSalaries // Add the new data
    },
    filters: {
      selectedYear,
      teamId,
      yearStart,
      yearEnd
    },
    isLoading
  }
}
