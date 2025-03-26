
import { DashboardFilters } from "./types"

/**
 * Parse and prepare dashboard filters with defaults
 */
export const useDashboardFilters = (filters: DashboardFilters = {}) => {
  // Use provided year or default to current year
  const selectedYear = filters.year || new Date().getFullYear()
  const teamId = filters.teamId || null
  const yearStart = new Date(selectedYear, 0, 1) // January 1st
  const yearEnd = new Date(selectedYear, 11, 31) // December 31st

  return {
    selectedYear,
    teamId,
    yearStart,
    yearEnd
  }
}
