
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";

export interface BudgetComparisonData {
  companies: Company[];
  items: BudgetComparisonItem[];
}

export interface PriceStatsCalculation {
  lowestPrice: number;
  middlePrice: number;
  averagePrice: number;
  standardDeviation: number;
}
