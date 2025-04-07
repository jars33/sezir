
import { calculateProjectProfitability } from './profitability'
import { calculateResourceUtilization } from './utilization'
import { generateChartData, generateDashboardChartData } from './chart-data'
import { calculateProjectMargins } from './project-margins'
import { calculateUtilizationProfitability } from './utilization-profitability'
import { generateForecastData } from './forecast-data'
import { calculateCostBreakdown } from './cost-breakdown'
import { generateCashFlowData } from './cash-flow'
import { generateYearComparisonData } from './year-comparison'

// Import the updated useProjectSettings hook
import { useProjectSettings } from '../use-project-settings'

export {
  calculateProjectProfitability,
  calculateResourceUtilization,
  generateChartData,
  generateDashboardChartData,
  calculateProjectMargins,
  calculateUtilizationProfitability,
  generateForecastData,
  calculateCostBreakdown,
  generateCashFlowData,
  generateYearComparisonData,
  useProjectSettings
}
