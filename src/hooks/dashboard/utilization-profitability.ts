
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
  if (!projects || !Array.isArray(projects)) {
    return []
  }

  // First, calculate project-wise utilization
  const projectUtilization = new Map()
  const projectAllocationCosts = new Map()
  
  // Initialize project allocation costs and structure
  projects.forEach(project => {
    if (project && project.id) {
      projectAllocationCosts.set(project.id, 0)
      projectUtilization.set(project.id, {
        totalAllocation: 0,
        dataPoints: 0,
        projectName: project.name || `Project ${project.number || 'Unknown'}`,
        utilization: 0
      })
    }
  })
  
  // Calculate allocations
  if (allocations && Array.isArray(allocations)) {
    allocations.forEach(allocation => {
      if (!allocation || !allocation.month) return

      const allocDate = new Date(allocation.month)
      if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
        const projectAssignments = allocation.project_assignments
        if (!projectAssignments) return
        
        const projectId = projectAssignments.project_id
        const project = projectAssignments.project

        // Ensure we have a valid project ID, either directly or through the project object
        const validProjectId = projectId || (project && project.id)
        
        if (validProjectId && projectUtilization.has(validProjectId)) {
          const projectData = projectUtilization.get(validProjectId)
          projectData.totalAllocation += allocation.allocation_percentage || 0
          projectData.dataPoints++
          projectUtilization.set(validProjectId, projectData)
          
          // Add allocation cost
          if (allocation.salary_cost) {
            const currentCost = projectAllocationCosts.get(validProjectId) || 0
            projectAllocationCosts.set(validProjectId, currentCost + Number(allocation.salary_cost))
          }
        }
      }
    })
  }
  
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
  if (projectRevenues && Array.isArray(projectRevenues)) {
    projectRevenues.forEach(rev => {
      if (!rev || !rev.month || !rev.project_id) return

      const revDate = new Date(rev.month)
      if (isWithinInterval(revDate, { start: yearStart, end: yearEnd })) {
        const project = projectProfitability.get(rev.project_id)
        if (project) {
          project.revenue += Number(rev.amount || 0)
          projectProfitability.set(rev.project_id, project)
        }
      }
    })
  }
  
  // Add variable costs
  if (variableCosts && Array.isArray(variableCosts)) {
    variableCosts.forEach(cost => {
      if (!cost || !cost.month || !cost.project_id) return

      const costDate = new Date(cost.month)
      if (isWithinInterval(costDate, { start: yearStart, end: yearEnd })) {
        const project = projectProfitability.get(cost.project_id)
        if (project) {
          project.cost += Number(cost.amount || 0)
          projectProfitability.set(cost.project_id, project)
        }
      }
    })
  }
  
  // Add overhead costs
  if (overheadCosts && Array.isArray(overheadCosts)) {
    overheadCosts.forEach(cost => {
      if (!cost || !cost.month || !cost.project_id) return

      const costDate = new Date(cost.month)
      if (isWithinInterval(costDate, { start: yearStart, end: yearEnd })) {
        const project = projectProfitability.get(cost.project_id)
        if (project) {
          project.cost += Number(cost.amount || 0)
          projectProfitability.set(cost.project_id, project)
        }
      }
    })
  }
  
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
