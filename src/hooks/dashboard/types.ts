
// Type definitions for Dashboard data
export interface DashboardFilters {
  year?: number;
  teamId?: string | null;
}

export interface DashboardMetrics {
  activeProjects: number;
  teamMembers: number;
  avgProjectProfitability: number;
  resourceUtilization: number;
  chartData: any[];
  projectMargins: any[];
  utilizationProfitabilityData: any[];
  forecastData: any[];
  costBreakdown: any[];
  cashFlowData: any[];
  yearComparisonData: any[];
}

export interface TeamMemberSalary {
  team_member_id: string;
  team_member_name: string;
  month: string;
  amount: number;
}
