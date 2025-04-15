
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBudgetComparison } from "@/hooks/use-budget-comparison";
import { budgetComparisonService } from "@/services/supabase/budget-comparison-service";
import { BudgetComparisonListView } from "@/components/budget/budget-comparison/BudgetComparisonListView";
import { BudgetComparisonView } from "@/components/budget/budget-comparison/BudgetComparisonView";
import { useSaveBudgetHandler } from "@/components/budget/budget-comparison/SaveBudgetHandler";
import { useCategoryTotals } from "@/components/budget/budget-comparison/useCategoryTotals";
import { toast } from "sonner";
import { BudgetComparisonItem } from "@/types/budget";

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
    deleteBudgetItem,
    saveBudget,
    loadBudget,
    setCurrentBudgetId,
    updateBudgetProject,
    setBudgets,
    setBudgetItems
  } = useBudgetComparison(projectId);

  const categoryTotals = useCategoryTotals(budgetItems);
  
  const { handleSave } = useSaveBudgetHandler({
    onSave: saveBudget,
    onSuccess: (budgetId) => {
      setShowNewBudget(false);
      setCurrentBudgetId(budgetId);
      toast.success("Budget saved successfully");
    }
  });
  
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
  
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const success = await budgetComparisonService.deleteBudgetComparison(budgetId);
      if (success) {
        setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== budgetId));
        toast.success("Budget deleted successfully");
        
        if (currentBudgetId === budgetId) {
          setCurrentBudgetId(undefined);
        }
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error("Failed to delete budget");
    }
  };

  const handleReorderItems = (reorderedItems: BudgetComparisonItem[]) => {
    setBudgetItems(reorderedItems);
    toast.success("Items reordered successfully");
  };

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
      onDeleteBudgetItem={deleteBudgetItem}
      onSave={handleSave}
      onUpdateProject={updateBudgetProject}
      onReorderItems={handleReorderItems}
    />
  );
};

export default BudgetComparison;
