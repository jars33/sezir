
import { useState, useEffect } from "react";
import { BudgetComparison, Company, BudgetComparisonItem } from "@/types/budget";
import { budgetComparisonService } from "@/services/supabase/budget-comparison-service";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

export function useBudgetData(projectId?: string) {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<BudgetComparison[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load budget list on initial render
  useEffect(() => {
    const loadBudgets = async () => {
      setIsLoading(true);
      try {
        const allBudgets = await budgetComparisonService.getBudgetComparisons(projectId);
        setBudgets(allBudgets);
      } catch (error) {
        console.error("Error loading budgets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBudgets();
  }, [projectId]);
  
  // Save or update a budget
  const saveBudget = async (
    name: string, 
    description: string,
    data: { companies: Company[]; items: BudgetComparisonItem[] },
    selectedProjectId?: string
  ): Promise<string | null> => {
    try {
      const budgetId = await budgetComparisonService.saveBudgetComparison(
        name,
        description,
        data,
        selectedProjectId,
        currentBudgetId
      );
      
      if (budgetId) {
        // If this is a new budget, add it to the list
        if (!currentBudgetId) {
          const now = new Date().toISOString();
          const newBudget: BudgetComparison = {
            id: budgetId,
            name,
            description,
            projectId: selectedProjectId,
            createdAt: now,
            updatedAt: now
          };
          
          setBudgets(prev => [...prev, newBudget]);
        } else {
          // Update existing budget in the list
          setBudgets(prev => prev.map(budget => {
            if (budget.id === budgetId) {
              return {
                ...budget,
                name,
                description,
                projectId: selectedProjectId,
                updatedAt: new Date().toISOString()
              };
            }
            return budget;
          }));
        }
        
        return budgetId;
      }
      return null;
    } catch (error) {
      console.error("Error saving budget:", error);
      return null;
    }
  };
  
  // Load a budget by ID
  const loadBudget = async (budgetId: string) => {
    try {
      setIsLoading(true);
      const budgetData = await budgetComparisonService.getBudgetComparison(budgetId);
      
      if (budgetData) {
        setCurrentBudgetId(budgetId);
        return budgetData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading budget:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update project ID for a budget
  const updateBudgetProject = async (budgetId: string, newProjectId: string) => {
    try {
      const updated = await budgetComparisonService.updateBudgetProject(budgetId, newProjectId);
      
      if (updated) {
        // Update the project ID in the budgets list
        setBudgets(prev => prev.map(budget => {
          if (budget.id === budgetId) {
            return {
              ...budget,
              projectId: newProjectId || undefined,
              updatedAt: new Date().toISOString()
            };
          }
          return budget;
        }));
      }
      
      return updated;
    } catch (error) {
      console.error("Error updating budget project:", error);
      return false;
    }
  };
  
  return {
    budgets,
    currentBudgetId,
    isLoading,
    saveBudget,
    loadBudget,
    setCurrentBudgetId,
    updateBudgetProject
  };
}
