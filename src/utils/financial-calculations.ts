
import { getYear } from "date-fns";
import { TeamMemberSalary } from "@/hooks/dashboard/types";

/**
 * Types for financial calculation inputs
 */
export interface TimelineItem {
  id: string;
  month: string;
  amount: number;
  description?: string;
  project_id?: string;
}

export interface AllocationItem {
  id: string;
  month: string;
  allocation_percentage: number;
  team_member_name?: string;
  salary_cost: number;
  team_member_id?: string;
  project_assignment_id?: string;
  project_assignments?: {
    project?: {
      id: string;
    };
    team_member_id?: string;
  };
}

export interface FinancialSummaryResult {
  totalRevenues: number;
  totalVariableCosts: number;
  totalSalaryCosts: number;
  totalOverheadCosts: number;
  totalCosts: number;
  totalProfit: number;
}

/**
 * Calculate financial summary for specific data and year
 */
export function calculateFinancialSummary(
  revenues: TimelineItem[] = [],
  variableCosts: TimelineItem[] = [],
  allocations: AllocationItem[] = [],
  year: number,
  overheadPercentage: number
): FinancialSummaryResult {
  // Calculate total revenues for the year
  const totalRevenues = revenues.reduce((sum, r) => {
    const revYear = getYear(new Date(r.month));
    return revYear === year ? sum + Number(r.amount) : sum;
  }, 0);

  // Calculate total variable costs for the year
  const totalVariableCosts = variableCosts.reduce((sum, c) => {
    const costYear = getYear(new Date(c.month));
    return costYear === year ? sum + Number(c.amount) : sum;
  }, 0);

  // Calculate total salary costs for the year
  const totalSalaryCosts = allocations.reduce((sum, a) => {
    const allocYear = getYear(new Date(a.month));
    return allocYear === year ? sum + Number(a.salary_cost) : sum;
  }, 0);

  // Calculate base costs (variable costs + salary costs)
  const baseCosts = totalVariableCosts + totalSalaryCosts;

  // Calculate overhead costs using the percentage of base costs
  const totalOverheadCosts = (baseCosts * overheadPercentage) / 100;

  // Calculate total costs with overhead included
  const totalCosts = baseCosts + totalOverheadCosts;

  // Total profit is revenues minus total costs
  const totalProfit = totalRevenues - totalCosts;

  return {
    totalRevenues,
    totalVariableCosts,
    totalSalaryCosts,
    totalOverheadCosts,
    totalCosts,
    totalProfit,
  };
}

/**
 * NEW: Calculate financial summary for specific data and year using full team member salaries
 */
export function calculateFinancialSummaryWithFullSalaries(
  revenues: TimelineItem[] = [],
  variableCosts: TimelineItem[] = [],
  teamMemberSalaries: TeamMemberSalary[] = [],
  year: number,
  overheadPercentage: number
): FinancialSummaryResult {
  // Calculate total revenues for the year
  const totalRevenues = revenues.reduce((sum, r) => {
    const revYear = getYear(new Date(r.month));
    return revYear === year ? sum + Number(r.amount) : sum;
  }, 0);

  // Calculate total variable costs for the year
  const totalVariableCosts = variableCosts.reduce((sum, c) => {
    const costYear = getYear(new Date(c.month));
    return costYear === year ? sum + Number(c.amount) : sum;
  }, 0);

  // Calculate total salary costs for the year
  const totalSalaryCosts = teamMemberSalaries.reduce((sum, s) => {
    const salaryYear = getYear(new Date(s.month));
    return salaryYear === year ? sum + Number(s.amount) : sum;
  }, 0);

  // Calculate base costs (variable costs + full salary costs)
  const baseCosts = totalVariableCosts + totalSalaryCosts;

  // Calculate overhead costs using the percentage of base costs
  const totalOverheadCosts = (baseCosts * overheadPercentage) / 100;

  // Calculate total costs with overhead included
  const totalCosts = baseCosts + totalOverheadCosts;

  // Total profit is revenues minus total costs
  const totalProfit = totalRevenues - totalCosts;

  return {
    totalRevenues,
    totalVariableCosts,
    totalSalaryCosts,
    totalOverheadCosts,
    totalCosts,
    totalProfit,
  };
}

/**
 * Calculate financial summary by project
 */
export function calculateProjectFinancials(
  projects: any[] = [],
  revenues: TimelineItem[] = [],
  variableCosts: TimelineItem[] = [],
  allocations: AllocationItem[] = [],
  year: number,
  overheadPercentage: number
) {
  const projectFinancialsMap = new Map();

  // Initialize with all projects
  projects?.forEach(project => {
    projectFinancialsMap.set(project.id, {
      projectId: project.id,
      projectName: project.name || project.number,
      revenue: 0,
      variableCost: 0,
      salaryCost: 0,
      overheadCost: 0,
      totalCost: 0,
      profit: 0,
      margin: 0
    });
  });

  // Add revenues
  revenues?.forEach(rev => {
    const revYear = getYear(new Date(rev.month));
    if (revYear === year && rev.project_id && projectFinancialsMap.has(rev.project_id)) {
      const project = projectFinancialsMap.get(rev.project_id);
      project.revenue += Number(rev.amount);
      projectFinancialsMap.set(rev.project_id, project);
    }
  });

  // Add variable costs
  variableCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month));
    if (costYear === year && cost.project_id && projectFinancialsMap.has(cost.project_id)) {
      const project = projectFinancialsMap.get(cost.project_id);
      project.variableCost += Number(cost.amount);
      projectFinancialsMap.set(cost.project_id, project);
    }
  });

  // Add salary costs from allocations
  allocations?.forEach(allocation => {
    const allocYear = getYear(new Date(allocation.month));
    if (allocYear === year && allocation.project_assignments?.project?.id) {
      const projectId = allocation.project_assignments.project.id;
      if (projectFinancialsMap.has(projectId) && allocation.salary_cost) {
        const project = projectFinancialsMap.get(projectId);
        project.salaryCost += Number(allocation.salary_cost);
        projectFinancialsMap.set(projectId, project);
      }
    }
  });

  // Calculate margins and financial metrics for each project
  const projectFinancials = [];

  projectFinancialsMap.forEach(data => {
    // Calculate base costs
    const baseCosts = data.variableCost + data.salaryCost;

    // Calculate overhead costs
    const overheadCost = (baseCosts * overheadPercentage) / 100;
    data.overheadCost = overheadCost;

    // Calculate total costs
    data.totalCost = baseCosts + overheadCost;

    // Calculate profit
    data.profit = data.revenue - data.totalCost;

    // Calculate profit margin
    if (data.revenue > 0) {
      data.margin = (data.profit / data.revenue) * 100;
    } else if (data.totalCost > 0) {
      data.margin = -100; // -100% margin if no revenue but has costs
    }

    projectFinancials.push(data);
  });

  return projectFinancials;
}

/**
 * Calculate accumulated profit up to a specific month
 */
export function calculateAccumulatedProfitUpToMonth(
  targetMonth: Date,
  revenues: TimelineItem[],
  variableCosts: TimelineItem[],
  allocations: AllocationItem[],
  overheadPercentage: number
): number {
  const targetMonthStr = targetMonth.toISOString().substring(0, 7); // YYYY-MM

  // Calculate accumulated revenues
  const accumulatedRevenues = revenues
    ?.filter(r => r.month <= targetMonthStr)
    .reduce((sum, r) => sum + Number(r.amount), 0) || 0;

  // Calculate accumulated variable costs
  const accumulatedVariableCosts = variableCosts
    ?.filter(c => c.month <= targetMonthStr)
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Calculate accumulated salary costs
  const accumulatedSalaryCosts = allocations
    ?.filter(a => a.month <= targetMonthStr)
    .reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0;

  // Calculate base costs
  const baseCosts = accumulatedVariableCosts + accumulatedSalaryCosts;

  // Calculate overhead costs
  const overheadCosts = (baseCosts * overheadPercentage) / 100;

  // Calculate total costs with overhead
  const totalAccumulatedCosts = baseCosts + overheadCosts;

  // Return accumulated profit: revenues minus total costs
  return accumulatedRevenues - totalAccumulatedCosts;
}

/**
 * Generate monthly financial data for charts
 */
export function generateMonthlyFinancialData(
  year: number,
  revenues: TimelineItem[] = [],
  variableCosts: TimelineItem[] = [],
  allocations: AllocationItem[] = [],
  overheadPercentage: number
) {
  const months = [];
  const monthlyData = [];

  // Generate all months for the year
  for (let i = 0; i < 12; i++) {
    const month = new Date(year, i, 1);
    months.push(month);
    const monthStr = month.toISOString().substring(0, 7); // YYYY-MM

    // Calculate monthly revenue
    const monthRevenues = revenues
      .filter(r => r.month.startsWith(monthStr))
      .reduce((sum, r) => sum + Number(r.amount), 0);

    // Calculate monthly variable costs
    const monthVariableCosts = variableCosts
      .filter(c => c.month.startsWith(monthStr))
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // Calculate monthly salary costs
    const monthAllocations = allocations
      .filter(a => a.month.startsWith(monthStr))
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);

    // Calculate monthly base costs
    const baseCosts = monthVariableCosts + monthAllocations;

    // Calculate monthly overhead costs
    const overheadCosts = (baseCosts * overheadPercentage) / 100;

    // Calculate total monthly costs including overhead
    const totalCosts = baseCosts + overheadCosts;

    // Calculate monthly profit
    const monthlyProfit = monthRevenues - totalCosts;

    monthlyData.push({
      month,
      monthStr,
      revenue: monthRevenues,
      variableCost: monthVariableCosts,
      salaryCost: monthAllocations,
      overheadCost: overheadCosts,
      totalCost: totalCosts,
      profit: monthlyProfit
    });
  }

  return { months, monthlyData };
}

/**
 * NEW: Generate monthly financial data for charts using full team member salaries
 */
export function generateMonthlyFinancialDataWithFullSalaries(
  year: number,
  revenues: TimelineItem[] = [],
  variableCosts: TimelineItem[] = [],
  teamMemberSalaries: TeamMemberSalary[] = [],
  overheadPercentage: number
) {
  const months = [];
  const monthlyData = [];

  // Generate all months for the year
  for (let i = 0; i < 12; i++) {
    const month = new Date(year, i, 1);
    months.push(month);
    const monthStr = month.toISOString().substring(0, 7); // YYYY-MM

    // Calculate monthly revenue
    const monthRevenues = revenues
      .filter(r => r.month.startsWith(monthStr))
      .reduce((sum, r) => sum + Number(r.amount), 0);

    // Calculate monthly variable costs
    const monthVariableCosts = variableCosts
      .filter(c => c.month.startsWith(monthStr))
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // Calculate monthly full salary costs
    const monthSalaries = teamMemberSalaries
      .filter(s => s.month.startsWith(monthStr))
      .reduce((sum, s) => sum + Number(s.amount), 0);

    // Calculate monthly base costs
    const baseCosts = monthVariableCosts + monthSalaries;

    // Calculate monthly overhead costs
    const overheadCosts = (baseCosts * overheadPercentage) / 100;

    // Calculate total monthly costs including overhead
    const totalCosts = baseCosts + overheadCosts;

    // Calculate monthly profit
    const monthlyProfit = monthRevenues - totalCosts;

    monthlyData.push({
      month,
      monthStr,
      revenue: monthRevenues,
      variableCost: monthVariableCosts,
      salaryCost: monthSalaries,
      overheadCost: overheadCosts,
      totalCost: totalCosts,
      profit: monthlyProfit
    });
  }

  return { months, monthlyData };
}
