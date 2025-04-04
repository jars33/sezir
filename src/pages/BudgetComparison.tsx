
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBudgetComparison } from "@/hooks/use-budget-comparison";
import { BudgetList } from "@/components/budget/BudgetList";
import { BudgetDetails } from "@/components/budget/BudgetDetails";
import { toast } from "sonner";

const BudgetComparison = () => {
  const { t } = useTranslation();
  const { 
    budgetItems, 
    companies, 
    budgets,
    isLoading,
    currentBudgetId, 
    addCompany, 
    removeCompany, 
    updateItem, 
    updateItemObservation,
    addBudgetItem,
    saveBudget,
    loadBudget,
    setCurrentBudgetId
  } = useBudgetComparison();

  const [showNewBudget, setShowNewBudget] = useState(false);
  
  const handleSelectBudget = (id: string) => {
    loadBudget(id);
  };
  
  const handleCreateNew = () => {
    setShowNewBudget(true);
  };
  
  const handleSave = async (name: string) => {
    const budgetId = await saveBudget(name);
    if (budgetId) {
      setShowNewBudget(false);
      setCurrentBudgetId(budgetId);
      toast.success(t('budget.budgetSaved'));
    } else {
      toast.error(t('budget.errorSavingBudget'));
    }
  };
  
  const handleBack = () => {
    if (currentBudgetId) {
      setCurrentBudgetId(undefined);
    } else {
      setShowNewBudget(false);
    }
  };

  // Show list if no budget is selected or creating a new one
  if (!showNewBudget && !currentBudgetId) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('budget.comparisonTitle')}</h1>
        <BudgetList 
          budgets={budgets}
          onCreateNew={handleCreateNew}
          onSelectBudget={handleSelectBudget}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Show details for selected budget or new budget
  return (
    <div className="container mx-auto py-6 space-y-6">
      <BudgetDetails 
        items={budgetItems}
        companies={companies}
        onBack={handleBack}
        onAddCompany={addCompany}
        onRemoveCompany={removeCompany}
        onUpdateItem={updateItem}
        onUpdateObservation={updateItemObservation}
        onAddBudgetItem={addBudgetItem}
        onSave={handleSave}
        isNew={showNewBudget}
        budgetName={showNewBudget ? "" : budgets.find(b => b.id === currentBudgetId)?.name}
      />
    </div>
  );
};

export default BudgetComparison;
