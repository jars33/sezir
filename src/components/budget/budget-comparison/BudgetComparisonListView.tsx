
import React from "react";
import { useTranslation } from "react-i18next";
import { BudgetList } from "@/components/budget/BudgetList";
import { BudgetComparison } from "@/types/budget";

interface BudgetComparisonListViewProps {
  budgets: BudgetComparison[];
  isLoading: boolean;
  onCreateNew: () => void;
  onSelectBudget: (id: string) => void;
  onDeleteBudget: (id: string) => Promise<void>;
}

export const BudgetComparisonListView: React.FC<BudgetComparisonListViewProps> = ({
  budgets,
  isLoading,
  onCreateNew,
  onSelectBudget,
  onDeleteBudget
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">{t('budget.comparisonTitle')}</h1>
      <BudgetList 
        budgets={budgets}
        onCreateNew={onCreateNew}
        onSelectBudget={onSelectBudget}
        onDeleteBudget={onDeleteBudget}
        isLoading={isLoading}
      />
    </div>
  );
};
