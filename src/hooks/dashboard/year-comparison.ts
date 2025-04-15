
import { getYear } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData } from "@/utils/financial-calculations"

// Generate year-over-year comparison data
export function generateYearComparisonData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  overheadPercentage: number = 15
) {
  const yearComparisonData = []
  const currentYear = selectedYear
  const previousYear = selectedYear - 1
  
  // Get monthly data for current year
  const { monthlyData: currentYearData } = generateMonthlyFinancialData(
    currentYear, 
    projectRevenues, 
    variableCosts, 
    allocations, 
    overheadPercentage
  );
  
  // Get monthly data for previous year
  const { monthlyData: previousYearData } = generateMonthlyFinancialData(
    previousYear, 
    projectRevenues, 
    variableCosts, 
    allocations, 
    overheadPercentage
  );
  
  // For each month, map the data
  for (let i = 0; i < 12; i++) {
    const month = new Date(currentYear, i, 1);
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()];
    const monthName = i18next.t(`common.months.${monthKey}`);
    
    yearComparisonData.push({
      month: monthName,
      currentYearRevenue: currentYearData[i].revenue,
      previousYearRevenue: previousYearData[i].revenue,
      currentYearProfit: currentYearData[i].profit,
      previousYearProfit: previousYearData[i].profit
    });
  }

  return yearComparisonData;
}
