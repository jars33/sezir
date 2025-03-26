
import { DashboardFilters, DashboardMetrics } from "./dashboard/types"
import { useDashboardData } from "./dashboard/use-dashboard-data"
import { useMetricsCalculator } from "./dashboard/use-metrics-calculator"

/**
 * Main hook for dashboard metrics
 * Fetches data and calculates metrics based on provided filters
 */
export function useDashboardMetrics(filters: DashboardFilters = {}) {
  // Get data and loading state
  const { data, filters: parsedFilters, isLoading } = useDashboardData(filters)
  
  // Calculate metrics
  const metrics = useMetricsCalculator(data, parsedFilters, isLoading)
  
  return {
    metrics,
    isLoading
  }
}
