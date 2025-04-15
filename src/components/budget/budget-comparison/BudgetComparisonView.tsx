
import React from "react";
import { useTranslation } from "react-i18next";
import { BudgetDetails } from "../BudgetDetails";
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";

interface BudgetComparisonViewProps {
  budgetItems: BudgetComparisonItem[];
  companies: Company[];
  categoryTotals: Record<string, Record<string, number>>;
  budgets: BudgetComparison[];
  currentBudgetId?: string;
  projectId?: string;
  onBack: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onUpdateDescription: (itemId: string, description: string) => void;
  onUpdateCompanyName: (companyId: string, name: string) => void;
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  onDeleteBudgetItem: (id: string) => void;
  onSave: (description: string, projectId?: string) => void;
  onUpdateProject?: (budgetId: string, projectId: string) => void;
  onReorderItems?: (reorderedItems: BudgetComparisonItem[]) => void;
}

export const BudgetComparisonView: React.FC<BudgetComparisonViewProps> = ({
  budgetItems,
  companies,
  categoryTotals,
  budgets,
  currentBudgetId,
  projectId,
  onBack,
  onAddCompany,
  onRemoveCompany,
  onUpdateItem,
  onUpdateObservation,
  onUpdateDescription,
  onUpdateCompanyName,
  onAddBudgetItem,
  onDeleteBudgetItem,
  onSave,
  onUpdateProject,
  onReorderItems
}) => {
  const { t } = useTranslation();
  
  // Get budget description from current budget ID
  const currentBudget = budgets.find(b => b.id === currentBudgetId);
  const budgetDescription = currentBudget?.description || "";
  
  // Determine if this is a new budget
  const isNew = !currentBudgetId;
  
  // Export and import handlers (placeholders)
  const handleExport = () => {
    console.log('Export budget');
  };
  
  const handleImport = () => {
    console.log('Import budget');
  };

  // Handle budget project update
  const handleUpdateProject = (newProjectId: string) => {
    if (onUpdateProject && currentBudgetId) {
      onUpdateProject(currentBudgetId, newProjectId);
    }
  };
  
  return (
    <BudgetDetails
      items={budgetItems}
      companies={companies}
      categoryTotals={categoryTotals}
      onBack={onBack}
      onAddCompany={onAddCompany}
      onRemoveCompany={onRemoveCompany}
      onUpdateItem={onUpdateItem}
      onUpdateObservation={onUpdateObservation}
      onUpdateDescription={onUpdateDescription}
      onUpdateCompanyName={onUpdateCompanyName}
      onAddBudgetItem={onAddBudgetItem}
      onDeleteItem={onDeleteBudgetItem}
      onSave={onSave}
      onExport={handleExport}
      onImport={handleImport}
      isNew={isNew}
      budgetDescription={budgetDescription}
      projectId={projectId}
      onUpdateProject={handleUpdateProject}
      onReorderItems={onReorderItems}
    />
  );
};
