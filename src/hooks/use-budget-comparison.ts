
import { useState, useEffect } from "react";
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useBudgetItems } from "./budget/use-budget-items";
import { useBudgetCompanies } from "./budget/use-budget-companies";
import { useBudgetData } from "./budget/use-budget-data";
import { useBudgetSampleData } from "./budget/use-budget-sample-data";

export function useBudgetComparison() {
  const { t } = useTranslation();
  const { createSampleCompanies, createSampleItems } = useBudgetSampleData();
  const { 
    companies, 
    setCompanies, 
    addCompany, 
    removeCompany 
  } = useBudgetCompanies([]);
  const { 
    budgetItems, 
    setBudgetItems, 
    updateItem, 
    updateItemObservation, 
    addBudgetItem,
    updateItemsForCompanyRemoval
  } = useBudgetItems([]);
  const { 
    budgets,
    currentBudgetId,
    isLoading,
    saveBudget: saveToDatabase,
    loadBudget: loadFromDatabase,
    setCurrentBudgetId
  } = useBudgetData();
  
  // Initialize with sample companies when creating a new budget
  useEffect(() => {
    if (!currentBudgetId && companies.length === 0) {
      // Add default companies for a new budget
      setCompanies(createSampleCompanies());
      
      // Start with empty items list rather than sample items
      setBudgetItems(createSampleItems());
    }
  }, [currentBudgetId, companies.length]);
  
  // Handle company removal - also need to remove company prices from items
  const handleRemoveCompany = (companyId: string) => {
    removeCompany(companyId);
    updateItemsForCompanyRemoval(companyId);
  };
  
  const saveBudget = async (name: string) => {
    return saveToDatabase(name, {
      companies,
      items: budgetItems
    });
  };
  
  const loadBudget = async (budgetId: string) => {
    const data = await loadFromDatabase(budgetId);
    
    if (data) {
      setCompanies(data.companies);
      setBudgetItems(data.items);
    }
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
    addBudgetItem,
    saveBudget,
    loadBudget,
    setCurrentBudgetId
  };
}
