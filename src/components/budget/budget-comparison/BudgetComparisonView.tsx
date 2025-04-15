
import React from "react";
import { useTranslation } from "react-i18next";
import { BudgetDetails } from "@/components/budget/BudgetDetails";
import { BudgetComparisonItem, Company, BudgetComparison } from "@/types/budget";
import { toast } from "sonner";

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
  onDeleteBudgetItem: (id: string) => void;
  onSave: (description: string, projectId?: string) => Promise<void>;
  onUpdateProject: (budgetId: string, newProjectId: string) => Promise<boolean>;
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
  onDeleteBudgetItem,
  onSave,
  onUpdateProject,
  onReorderItems
}) => {
  const { t } = useTranslation();
  
  const handleExportToCSV = () => {
    console.log("Exporting to CSV...");
    toast.success(t('common.exported'));
  };

  const handleImportFromCSV = () => {
    console.log("Importing from CSV...");
    toast.info(t('common.importing'));
  };
  
  const handleUpdateProject = async (newProjectId: string) => {
    if (!currentBudgetId) return;
    
    const updated = await onUpdateProject(currentBudgetId, newProjectId);
    if (updated) {
      toast.success(t('budget.projectUpdated'));
    } else {
      toast.error(t('budget.errorUpdatingProject'));
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
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
        onDeleteItem={onDeleteBudgetItem}
        onSave={onSave}
        onExport={handleExportToCSV}
        onImport={handleImportFromCSV}
        isNew={!currentBudgetId}
        budgetDescription={!currentBudgetId ? "" : budgets.find(b => b.id === currentBudgetId)?.description}
        projectId={projectId || budgets.find(b => b.id === currentBudgetId)?.projectId}
        onUpdateProject={handleUpdateProject}
        onReorderItems={onReorderItems}
      />
    </div>
  );
};
