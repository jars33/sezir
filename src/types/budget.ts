
export interface Company {
  id: string;
  name: string;
}

export interface BudgetComparisonItem {
  id: string;
  code: string;
  description: string;
  isCategory: boolean;
  prices: Record<string, number>;
  observations?: string;
  lowestPrice: number;
  middlePrice: number;
  averagePrice: number;
}

export interface BudgetState {
  companies: Company[];
  items: BudgetComparisonItem[];
}
