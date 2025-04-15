import { useState, useEffect } from "react";
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useBudgetItems } from "./budget/use-budget-items";
import { useBudgetCompanies } from "./budget/use-budget-companies";
import { useBudgetData } from "./budget/use-budget-data";
import { useBudgetSampleData } from "./budget/use-budget-sample-data";

export function useBudgetComparison(projectId?: string) {
  const { t } = useTranslation();
  const { createSampleCompanies, createSampleItems } = useBudgetSampleData();
  const { 
    companies, 
    setCompanies, 
    addCompany, 
    removeCompany,
    updateCompanyName: updateCompanyNameInState
  } = useBudgetCompanies([]);
  const { 
    budgetItems, 
    setBudgetItems, 
    updateItem, 
    updateItemObservation,
    updateItemDescription,
    addBudgetItem,
    updateItemsForCompanyRemoval,
    deleteBudgetItem
  } = useBudgetItems([]);
  const { 
    budgets,
    setBudgets,
    currentBudgetId,
    isLoading,
    saveBudget: saveToDatabase,
    loadBudget: loadFromDatabase,
    setCurrentBudgetId,
    updateBudgetProject: updateProjectInDatabase,
    updateCompanyName: updateCompanyNameInDatabase
  } = useBudgetData(projectId);
  
  // Initialize with no companies for new budget
  useEffect(() => {
    if (!currentBudgetId && companies.length === 0) {
      // Initialize with no companies (changed from empty company)
      setCompanies([]);
      setBudgetItems([]);
    }
  }, [currentBudgetId, companies.length]);
  
  // Handle company removal - also need to remove company prices from items
  const handleRemoveCompany = (companyId: string) => {
    // Remove protection for the last company
    removeCompany(companyId);
    updateItemsForCompanyRemoval(companyId);
  };

  // Handle updating a company name
  const updateCompanyName = async (companyId: string, name: string) => {
    // First update in local state
    updateCompanyNameInState(companyId, name);
    
    // If there's a current budget, update in the database
    if (currentBudgetId) {
      const updated = await updateCompanyNameInDatabase(currentBudgetId, companyId, name);
      if (updated) {
        toast.success(t('budget.companyNameUpdated'));
      } else {
        toast.error(t('budget.errorUpdatingCompanyName'));
      }
    }
  };
  
  const saveBudget = async (description: string, selectedProjectId?: string) => {
    // Use the selected project ID if provided, otherwise use the one from the URL
    const projectIdToUse = selectedProjectId || projectId;
    console.log("Saving budget:", description, {companies, items: budgetItems}, "projectId:", projectIdToUse);
    
    // Make sure we have valid data to save
    if (companies.length === 0 && budgetItems.length === 0) {
      console.log("Creating a budget with no data");
    }
    
    return saveToDatabase(description, {
      companies,
      items: budgetItems
    }, projectIdToUse);
  };
  
  const loadBudget = async (budgetId: string) => {
    const data = await loadFromDatabase(budgetId);
    
    if (data) {
      setCompanies(data.companies);
      setBudgetItems(data.items);
    }
  };

  const updateBudgetProject = async (budgetId: string, newProjectId: string) => {
    const updated = await updateProjectInDatabase(budgetId, newProjectId);
    
    if (updated) {
      // Update the local budgets list with the new project ID
      const updatedBudgets = budgets.map(budget => {
        if (budget.id === budgetId) {
          return {
            ...budget,
            projectId: newProjectId || undefined
          };
        }
        return budget;
      });
      
      // No need to explicitly set the budgets state as it will be handled by the useBudgetData hook
    }
    
    return updated;
  };
  
  return {
    budgetItems,
    companies,
    budgets,
    isLoading,
    currentBudgetId,
    addCompany,
    removeCompany: handleRemoveCompany,
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
  };
}
