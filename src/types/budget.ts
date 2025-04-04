
export interface Company {
  id: string;
  name: string;
}

export interface BudgetComparisonItem {
  id: string;
  code: string;
  description: string;
  isCategory: boolean;
  parentId?: string;
  prices: Record<string, number>;
  observations?: string;
  lowestPrice: number;
  middlePrice: number;
  averagePrice: number;
  standardDeviation?: number;
}

export interface BudgetComparison {
  id: string;
  description?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetState {
  companies: Company[];
  items: BudgetComparisonItem[];
  currentBudgetId?: string;
  budgets: BudgetComparison[];
}
