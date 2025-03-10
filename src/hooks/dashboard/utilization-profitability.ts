
import { isWithinInterval } from "date-fns"

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
  
  // Initialize project allocation costs and structure
  projects?.forEach(project => {
    projectAllocationCosts.set(project.id, 0)
    projectUtilization.set(project.id, {
      totalAllocation: 0,
      dataPoints: 0,
      projectName: project.name || `Project ${project.number}`,
      utilization: 0
    })
  })
  
  // Calculate allocations
  allocations?.forEach(allocation => {
    const allocDate = new Date(allocation.month)
    if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
      const projectId = allocation.project_assignments?.project_id

      if (projectId && projectUtilization.has(projectId)) {
        const projectData = projectUtilization.get(projectId)
        projectData.totalAllocation += allocation.allocation_percentage
        projectData.dataPoints++
        projectUtilization.set(projectId, projectData)
        
        // Add allocation cost
        if (allocation.salary_cost) {
          const currentCost = projectAllocationCosts.get(projectId) || 0
          projectAllocationCosts.set(projectId, currentCost + Number(allocation.salary_cost))
        }
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
    const revDate = new Date(rev.month)
    if (isWithinInterval(revDate, { start: yearStart, end: yearEnd })) {
      const project = projectProfitability.get(rev.project_id)
      if (project) {
        project.revenue += Number(rev.amount)
        projectProfitability.set(rev.project_id, project)
      }
    }
  })
  
  // Add variable costs
  variableCosts?.forEach(cost => {
    const costDate = new Date(cost.month)
    if (isWithinInterval(costDate, { start: yearStart, end: yearEnd })) {
      const project = projectProfitability.get(cost.project_id)
      if (project) {
        project.cost += Number(cost.amount)
        projectProfitability.set(cost.project_id, project)
      }
    }
  })
  
  // Add overhead costs
  overheadCosts?.forEach(cost => {
    const costDate = new Date(cost.month)
    if (isWithinInterval(costDate, { start: yearStart, end: yearEnd })) {
      const project = projectProfitability.get(cost.project_id)
      if (project) {
        project.cost += Number(cost.amount)
        projectProfitability.set(cost.project_id, project)
      }
    }
  })
  
  // Add allocation costs and calculate final profitability
  const utilizationProfitabilityData = []
  
  projectProfitability.forEach((data, projectId) => {
    // Add allocation costs
    data.cost += projectAllocationCosts.get(projectId) || 0
    
    // Calculate profitability
    if (data.cost > 0 || data.revenue > 0) {
      data.profitability = data.cost > 0 
        ? ((data.revenue - data.cost) / data.cost) * 100
        : (data.revenue > 0 ? 100 : 0)
      
      utilizationProfitabilityData.push({
        projectId,
        projectName: data.projectName,
        utilization: data.utilization,
        profitability: Math.round(data.profitability)
      })
    }
  })
  
  return utilizationProfitabilityData
}
