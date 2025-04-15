
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBudgetComparison } from "@/hooks/use-budget-comparison";
import { budgetComparisonService } from "@/services/supabase/budget-comparison-service";
import { BudgetComparisonListView } from "@/components/budget/budget-comparison/BudgetComparisonListView";
import { BudgetComparisonView } from "@/components/budget/budget-comparison/BudgetComparisonView";
import { useSaveBudgetHandler } from "@/components/budget/budget-comparison/SaveBudgetHandler";
import { useCategoryTotals } from "@/components/budget/budget-comparison/useCategoryTotals";

const BudgetComparison = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [showNewBudget, setShowNewBudget] = useState(false);
  
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
    updateItemDescription,
    updateCompanyName,
    addBudgetItem,
    deleteBudgetItem,
    saveBudget,
    loadBudget,
    setCurrentBudgetId,
    updateBudgetProject,
    setBudgets
  } = useBudgetComparison(projectId);

  const categoryTotals = useCategoryTotals(budgetItems);
  
  // Setup save handler
  const { handleSave } = useSaveBudgetHandler({
    onSave: saveBudget,
    onSuccess: (budgetId) => {
      setShowNewBudget(false);
      setCurrentBudgetId(budgetId);
    }
  });
  
  // Navigation handlers
  const handleBack = () => {
    if (currentBudgetId) {
      setCurrentBudgetId(undefined);
    } else {
      setShowNewBudget(false);
      if (projectId) {
        navigate(`/projects/${projectId}`);
      }
    }
  };
  
  const handleCreateNew = () => {
    setShowNewBudget(true);
    setCurrentBudgetId(undefined);
  };
  
  const handleSelectBudget = (id: string) => {
    loadBudget(id);
  };
  
  // Budget deletion handler
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const success = await budgetComparisonService.deleteBudgetComparison(budgetId);
      if (success) {
        setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== budgetId));
        
        if (currentBudgetId === budgetId) {
          setCurrentBudgetId(undefined);
        }
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Determine view to show
  if (!showNewBudget && !currentBudgetId) {
    return (
      <BudgetComparisonListView
        budgets={budgets}
        isLoading={isLoading}
        onCreateNew={handleCreateNew}
        onSelectBudget={handleSelectBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    );
  }

  return (
    <BudgetComparisonView
      budgetItems={budgetItems}
      companies={companies}
      categoryTotals={categoryTotals}
      budgets={budgets}
      currentBudgetId={currentBudgetId}
      projectId={projectId}
      onBack={handleBack}
      onAddCompany={addCompany}
      onRemoveCompany={removeCompany}
      onUpdateItem={updateItem}
      onUpdateObservation={updateItemObservation}
      onUpdateDescription={updateItemDescription}
      onUpdateCompanyName={updateCompanyName}
      onAddBudgetItem={addBudgetItem}
      onDeleteBudgetItem={deleteBudgetItem}
      onSave={handleSave}
      onUpdateProject={updateBudgetProject}
    />
  );
};

export default BudgetComparison;
