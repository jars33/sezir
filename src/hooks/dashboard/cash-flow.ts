
import { getYear } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData } from "@/utils/financial-calculations"

// Generate cash flow data
export function generateCashFlowData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  overheadPercentage: number = 15
) {
  // Use centralized financial calculations
  const { monthlyData } = generateMonthlyFinancialData(
    selectedYear, 
    projectRevenues, 
    variableCosts, 
    allocations, 
    overheadPercentage
  );

  const cashFlowData = [];
  
  // For the selected year, include all months
  const months = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1);
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()];
    const monthName = i18next.t(`common.months.${monthKey}`);
    months.push({ date: month, name: monthName });
    
    cashFlowData.push({
      month: monthName,
      revenue: monthlyData[i].revenue,
      variableCosts: monthlyData[i].variableCost,
      overheadCosts: monthlyData[i].overheadCost,
      salaryCosts: monthlyData[i].salaryCost,
      netCashFlow: monthlyData[i].profit
    });
  }

  return cashFlowData;
}
