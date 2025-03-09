
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
  projectMargins: ProjectMargin[];
  utilizationProfitabilityData: UtilizationProfitabilityItem[];
  forecastData: ForecastDataItem[];
  costBreakdown: CostBreakdownItem[];
  cashFlowData: CashFlowItem[];
  yearComparisonData: YearComparisonItem[];
}

export interface ChartDataItem {
  month: string;
  revenue: number;
  cost: number;
  profit?: number;
}

export interface ProjectMargin {
  projectId: string;
  projectName: string;
  margin: number;
  revenue: number;
  cost: number;
}

export interface UtilizationProfitabilityItem {
  projectId: string;
  projectName: string;
  utilization: number;
  profitability: number;
}

export interface ForecastDataItem {
  month: string;
  actualRevenue?: number;
  actualCost?: number;
  projectedRevenue?: number;
  projectedCost?: number;
}

export interface CostBreakdownItem {
  category: string;
  value: number;
  percentage: number;
}

export interface CashFlowItem {
  month: string;
  revenue: number;
  variableCosts: number;
  overheadCosts: number;
  salaryCosts: number;
  netCashFlow: number;
}

export interface YearComparisonItem {
  month: string;
  currentYearRevenue: number;
  previousYearRevenue: number;
  currentYearProfit: number;
  previousYearProfit: number;
}
