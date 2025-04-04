
import { useState, useEffect } from "react";
import { BudgetComparison } from "@/types/budget";
import { budgetComparisonService } from "@/services/supabase/budget-comparison-service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useBudgetData(projectId?: string) {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<BudgetComparison[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load budgets on first render
  useEffect(() => {
    const loadBudgets = async () => {
      setIsLoading(true);
      try {
        const data = await budgetComparisonService.getBudgetComparisons(projectId);
        setBudgets(data);
      } catch (error) {
        console.error("Failed to load budgets:", error);
        toast.error(t('budget.errorLoadingBudgets'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBudgets();
  }, [projectId, t]);
  
  const saveBudget = async (name: string, data: any, selectedProjectId?: string) => {
    try {
      setIsLoading(true);
      const budgetId = await budgetComparisonService.saveBudgetComparison(name, data, selectedProjectId);
      
      if (budgetId) {
        const newBudget: BudgetComparison = {
          id: budgetId,
          name,
          projectId: selectedProjectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setBudgets(prevBudgets => [newBudget, ...prevBudgets]);
        return budgetId;
      }
      return null;
    } catch (error) {
      console.error("Failed to save budget:", error);
      toast.error(t('budget.errorSavingBudget'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadBudget = async (budgetId: string) => {
    try {
      setIsLoading(true);
      const data = await budgetComparisonService.getBudgetComparison(budgetId);
      
      if (data) {
        setCurrentBudgetId(budgetId);
        return data;
      } else {
        toast.error(t('budget.errorLoadingBudget'));
        return null;
      }
    } catch (error) {
      console.error("Failed to load budget:", error);
      toast.error(t('budget.errorLoadingBudget'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    budgets,
    currentBudgetId,
    isLoading,
    saveBudget,
    loadBudget,
    setCurrentBudgetId
  };
}
