
import { useState, useEffect } from "react";
import { BudgetComparisonData } from "@/services/supabase/budget-utils/types";
import { BudgetComparison } from "@/types/budget";
import { budgetDataService } from "@/services/supabase/budget-data-service";
import { budgetSaveService } from "@/services/supabase/budget-save-service";
import { budgetCompaniesService } from "@/services/supabase/budget-companies-service";

export function useBudgetData(projectId?: string) {
  const [budgets, setBudgets] = useState<BudgetComparison[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load budgets when the component mounts or project ID changes
  useEffect(() => {
    loadBudgets();
  }, [projectId]);
  
  const loadBudgets = async () => {
    setIsLoading(true);
    
    try {
      const data = await budgetDataService.getBudgetComparisons(projectId);
      setBudgets(data);
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadBudget = async (id: string) => {
    setIsLoading(true);
    setCurrentBudgetId(id);
    
    try {
      const data = await budgetDataService.getBudgetComparisonData(id);
      return data;
    } catch (error) {
      console.error("Error loading budget data:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveBudget = async (description: string, data: BudgetComparisonData, selectedProjectId?: string) => {
    setIsLoading(true);
    
    try {
      const budgetId = await budgetSaveService.saveBudgetComparison(
        description, 
        data, 
        selectedProjectId,
        currentBudgetId
      );
      
      if (budgetId) {
        // If this is a new budget, add it to the list
        if (!currentBudgetId) {
          const currentDate = new Date().toISOString();
          const newBudget: BudgetComparison = {
            id: budgetId,
            description,
            projectId: selectedProjectId,
            createdAt: currentDate,
            updatedAt: currentDate
          };
          
          setBudgets(prev => [...prev, newBudget]);
        } else {
          // Update the budget in the list
          const currentDate = new Date().toISOString();
          setBudgets(prev => prev.map(budget => 
            budget.id === budgetId
              ? { 
                  ...budget, 
                  description, 
                  projectId: selectedProjectId,
                  updatedAt: currentDate
                }
              : budget
          ));
        }
        
        setCurrentBudgetId(budgetId);
      }
      
      return budgetId;
    } catch (error) {
      console.error("Error saving budget:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateBudgetProject = async (budgetId: string, newProjectId: string) => {
    setIsLoading(true);
    
    try {
      const updated = await budgetDataService.updateBudgetProject(budgetId, newProjectId);
      
      if (updated) {
        const currentDate = new Date().toISOString();
        // Update the budget in the list
        setBudgets(prev => prev.map(budget => 
          budget.id === budgetId
            ? { 
                ...budget, 
                projectId: newProjectId || undefined,
                updatedAt: currentDate
              }
            : budget
        ));
      }
      
      return updated;
    } catch (error) {
      console.error("Error updating budget project:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyName = async (budgetId: string, companyId: string, name: string) => {
    try {
      const updated = await budgetCompaniesService.updateCompanyName(companyId, name);
      return updated;
    } catch (error) {
      console.error("Error updating company name:", error);
      return false;
    }
  };
  
  return {
    budgets,
    currentBudgetId,
    isLoading,
    loadBudget,
    saveBudget,
    setCurrentBudgetId,
    updateBudgetProject,
    updateCompanyName
  };
}
