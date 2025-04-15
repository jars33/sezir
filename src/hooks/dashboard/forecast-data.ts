
import { format } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData } from "@/utils/financial-calculations"

export function generateForecastData(
  selectedYear: number,
  projectRevenues: any[] = [],
  projectVariableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocations: any[] = [],
  overheadPercentage: number = 15
) {
  // Use centralized financial calculations
  const { monthlyData } = generateMonthlyFinancialData(
    selectedYear, 
    projectRevenues, 
    projectVariableCosts, 
    allocations, 
    overheadPercentage
  );

  const forecastData = [];
  
  // Include all 12 months of the selected year
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1);
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()];
    const monthName = i18next.t(`common.months.${monthKey}`);
    
    forecastData.push({
      month: monthName,
      actualRevenue: monthlyData[i].revenue,
      actualCost: monthlyData[i].totalCost
    });
  }

  return forecastData;
}
