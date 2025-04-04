
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";

export interface BudgetComparisonData {
  companies: Company[];
  items: BudgetComparisonItem[];
  // We're removing name from this interface as requested
}

export interface PriceStatsCalculation {
  lowestPrice: number;
  middlePrice: number;
  averagePrice: number;
  standardDeviation: number;
}
