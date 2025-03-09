
export interface DashboardFilters {
  year?: number;
  teamId?: string | null;
}

export interface DashboardMetrics {
  activeProjects: number;
  teamMembers: number;
  avgProjectProfitability: number;
  resourceUtilization: number;
  chartData: ChartDataItem[];
}

export interface ChartDataItem {
  month: string;
  revenue: number;
  cost: number;
  profit?: number;
}
