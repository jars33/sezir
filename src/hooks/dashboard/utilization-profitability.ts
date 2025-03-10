
import { isWithinInterval, getYear } from "date-fns"

// Calculate utilization vs profitability data points
export function calculateUtilizationProfitability(
  projects: any[],
  allocations: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  yearStart: Date,
  yearEnd: Date
) {
  // First, calculate project-wise utilization
  const projectUtilization = new Map()
  const projectAllocationCosts = new Map()
  
  // Initialize project allocation costs
  projects?.forEach(project => {
    projectAllocationCosts.set(project.id, 0)
  })
  
  allocations?.forEach(allocation => {
    const allocDate = new Date(allocation.month)
    if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
      const projectId = allocation.project_assignments.project.id
      
      if (!projectUtilization.has(projectId)) {
        projectUtilization.set(projectId, {
          totalAllocation: 0,
          dataPoints: 0,
          projectName: '',
          utilization: 0
        })
      }
      
      const projectData = projectUtilization.get(projectId)
      projectData.totalAllocation += allocation.allocation_percentage
      projectData.dataPoints++
      
      // Get project name from allocations data
      if (!projectData.projectName) {
        projectData.projectName = allocation.project_assignments.project.name || 
          `Project ${allocation.project_assignments.project.number}`
      }
      
      projectUtilization.set(projectId, projectData)
      
      // Also add allocation cost to the project's allocation costs
      if (allocation.salary_cost) {
        const currentCost = projectAllocationCosts.get(projectId) || 0
        projectAllocationCosts.set(projectId, currentCost + Number(allocation.salary_cost))
      }
    }
  })
  
  // Calculate average utilization per project
  projectUtilization.forEach((data, projectId) => {
    if (data.dataPoints > 0) {
      data.utilization = Math.round(data.totalAllocation / data.dataPoints)
    }
  })
  
  // Now calculate profitability per project
  const projectProfitability = new Map()
  
  // Initialize with all projects that have utilization data
  projectUtilization.forEach((data, projectId) => {
    projectProfitability.set(projectId, {
      projectId,
      projectName: data.projectName,
      revenue: 0,
      cost: 0,
      profitability: 0,
      utilization: data.utilization
    })
  })
  
  // Add revenues
  projectRevenues?.forEach(rev => {
    const revYear = getYear(new Date(rev.month))
    if (revYear === yearStart.getFullYear() && projectProfitability.has(rev.project_id)) {
      const project = projectProfitability.get(rev.project_id)
      project.revenue += Number(rev.amount)
      projectProfitability.set(rev.project_id, project)
    }
  })
  
  // Add variable costs
  variableCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === yearStart.getFullYear() && projectProfitability.has(cost.project_id)) {
      const project = projectProfitability.get(cost.project_id)
      project.cost += Number(cost.amount)
      projectProfitability.set(cost.project_id, project)
    }
  })
  
  // Add overhead costs
  overheadCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === yearStart.getFullYear() && projectProfitability.has(cost.project_id)) {
      const project = projectProfitability.get(cost.project_id)
      project.cost += Number(cost.amount)
      projectProfitability.set(cost.project_id, project)
    }
  })
  
  // Add allocation costs
  projectProfitability.forEach((data, projectId) => {
    const allocationCost = projectAllocationCosts.get(projectId) || 0
    data.cost += allocationCost
    projectProfitability.set(projectId, data)
  })
  
  // Calculate profitability and prepare final data
  const utilizationProfitabilityData = []
  
  projectProfitability.forEach((data) => {
    // Only include if there's any financial data
    if (data.revenue > 0 || data.cost > 0) {
      // Calculate profitability as percentage
      if (data.cost > 0) {
        data.profitability = ((data.revenue - data.cost) / data.cost) * 100
      } else if (data.revenue > 0) {
        data.profitability = 100 // 100% profit if revenue but no costs
      } else {
        data.profitability = 0
      }
      
      utilizationProfitabilityData.push({
        projectId: data.projectId,
        projectName: data.projectName,
        utilization: data.utilization,
        profitability: Math.round(data.profitability)
      })
    }
  })
  
  return utilizationProfitabilityData
}
