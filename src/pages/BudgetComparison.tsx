
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useBudgetComparison } from "@/hooks/use-budget-comparison";
import { BudgetList } from "@/components/budget/BudgetList";
import { BudgetDetails } from "@/components/budget/BudgetDetails";
import { toast } from "sonner";
import { budgetComparisonService } from "@/services/supabase/budget-comparison-service";

const BudgetComparison = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: projectId } = useParams();
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

  const [showNewBudget, setShowNewBudget] = useState(false);
  
  const handleSelectBudget = (id: string) => {
    loadBudget(id);
  };
  
  const handleCreateNew = () => {
    setShowNewBudget(true);
    // Reset current budget ID when creating a new budget
    setCurrentBudgetId(undefined);
  };
  
  const handleSave = async (description: string, selectedProjectId?: string) => {
    // If 'none' is selected, set to undefined
    const projectIdToSave = selectedProjectId === 'none' ? undefined : selectedProjectId;
    
    const budgetId = await saveBudget(description, projectIdToSave);
    if (budgetId) {
      setShowNewBudget(false);
      setCurrentBudgetId(budgetId);
      toast.success(t('budget.budgetSaved'));
    } else {
      toast.error(t('budget.errorSavingBudget'));
    }
  };

  const handleUpdateProject = async (newProjectId: string) => {
    if (!currentBudgetId) return;
    
    const updated = await updateBudgetProject(currentBudgetId, newProjectId);
    if (updated) {
      toast.success(t('budget.projectUpdated'));
    } else {
      toast.error(t('budget.errorUpdatingProject'));
    }
  };
  
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
  
  const handleExportToCSV = () => {
    // CSV export functionality would be implemented here
    console.log("Exporting to CSV...");
    toast.success(t('common.exported'));
  };

  const handleImportFromCSV = () => {
    // CSV import functionality would be implemented here
    console.log("Importing from CSV...");
    toast.info(t('common.importing'));
  };
  
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const success = await budgetComparisonService.deleteBudgetComparison(budgetId);
      if (success) {
        // Update the budgets list by removing the deleted budget
        setBudgets(currentBudgets => currentBudgets.filter(b => b.id !== budgetId));
        
        // If the currently selected budget is the one being deleted, reset it
        if (currentBudgetId === budgetId) {
          setCurrentBudgetId(undefined);
        }
        
        toast.success(t('budget.deletedSuccess'));
      } else {
        toast.error(t('budget.errorDeleting'));
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error(t('budget.errorDeleting'));
    }
  };
  
  // Calculate category totals
  const calculateCategoryTotals = () => {
    const categoryTotals: Record<string, Record<string, number>> = {};
    
    // Get all categories
    const categories = budgetItems.filter(item => item.isCategory);
    
    categories.forEach(category => {
      const childPrefix = category.code + ".";
      
      // Find all direct children of this category that aren't categories themselves
      const directChildren = budgetItems.filter(item => 
        !item.isCategory && 
        item.code.startsWith(childPrefix) &&
        !item.code.substring(childPrefix.length).includes(".")
      );
      
      // Calculate totals per company for this category
      const totals: Record<string, number> = {};
      
      directChildren.forEach(child => {
        Object.entries(child.prices).forEach(([companyId, price]) => {
          totals[companyId] = (totals[companyId] || 0) + price;
        });
      });
      
      categoryTotals[category.id] = totals;
    });
    
    return categoryTotals;
  };
  
  const categoryTotals = calculateCategoryTotals();

  // Show list if no budget is selected or creating a new one
  if (!showNewBudget && !currentBudgetId) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('budget.comparisonTitle')}</h1>
        <BudgetList 
          budgets={budgets}
          onCreateNew={handleCreateNew}
          onSelectBudget={handleSelectBudget}
          onDeleteBudget={handleDeleteBudget}
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
        categoryTotals={categoryTotals}
        onBack={handleBack}
        onAddCompany={addCompany}
        onRemoveCompany={removeCompany}
        onUpdateItem={updateItem}
        onUpdateObservation={updateItemObservation}
        onUpdateDescription={updateItemDescription}
        onUpdateCompanyName={updateCompanyName}
        onAddBudgetItem={addBudgetItem}
        onDeleteItem={deleteBudgetItem}
        onSave={handleSave}
        onExport={handleExportToCSV}
        onImport={handleImportFromCSV}
        isNew={!currentBudgetId}
        budgetDescription={!currentBudgetId ? "" : budgets.find(b => b.id === currentBudgetId)?.description}
        projectId={projectId || budgets.find(b => b.id === currentBudgetId)?.projectId}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
};

export default BudgetComparison;
