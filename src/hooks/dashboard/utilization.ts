
import { isWithinInterval } from "date-fns"

// Helper for calculating resource utilization
export function calculateResourceUtilization(
  allocations: any[],
  yearStart: Date,
  yearEnd: Date
) {
  // Group allocations by month and team member
  const monthlyUtilization = new Map()
  
  allocations?.forEach(allocation => {
    const allocDate = new Date(allocation.month)
    if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
      const monthKey = allocation.month.substr(0, 7) // YYYY-MM format
      const teamMemberId = allocation.project_assignments.team_member_id
      
      if (!monthlyUtilization.has(monthKey)) {
        monthlyUtilization.set(monthKey, new Map())
      }
      
      const memberMap = monthlyUtilization.get(monthKey)
      const currentAllocation = memberMap.get(teamMemberId) || 0
      memberMap.set(teamMemberId, currentAllocation + allocation.allocation_percentage)
    }
  })
  
  let totalUtilization = 0
  let utilizationDataPoints = 0
  
  monthlyUtilization.forEach(memberMap => {
    memberMap.forEach(allocation => {
      // Cap at 100% per person per month
      totalUtilization += Math.min(allocation, 100)
      utilizationDataPoints++
    })
  })
  
  const resourceUtilization = utilizationDataPoints > 0 
    ? Math.round(totalUtilization / utilizationDataPoints) 
    : 0

  return resourceUtilization
}
