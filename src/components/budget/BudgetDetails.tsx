
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { BudgetHeader } from "./BudgetHeader";
import { BudgetActions } from "./BudgetActions";
import { BudgetTable } from "./BudgetTable";

interface BudgetDetailsProps {
  items: BudgetComparisonItem[];
  companies: Company[];
  categoryTotals: Record<string, Record<string, number>>;
  onBack: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onUpdateDescription: (itemId: string, description: string) => void;
  onUpdateCompanyName?: (companyId: string, name: string) => void;
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  onDeleteItem: (id: string) => void;
  onSave: (description: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetDescription?: string;
  projectId?: string;
  onUpdateProject?: (projectId: string) => void;
  onReorderItems?: (reorderedItems: BudgetComparisonItem[]) => void;
}

export const BudgetDetails: React.FC<BudgetDetailsProps> = ({
  items,
  companies,
  categoryTotals,
  onBack,
  onAddCompany,
  onRemoveCompany,
  onUpdateItem,
  onUpdateObservation,
  onUpdateDescription,
  onUpdateCompanyName,
  onAddBudgetItem,
  onDeleteItem,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetDescription = "",
  projectId,
  onUpdateProject,
  onReorderItems
}) => {
  const { t } = useTranslation();

  // Handle save with potential project update
  const handleSave = (description: string, newProjectId?: string) => {
    // If this is an existing budget and the project changed, update it
    if (!isNew && newProjectId !== projectId && onUpdateProject) {
      onUpdateProject(newProjectId || "");
    }
    
    onSave(description, newProjectId);
  };

  return (
    <div className="space-y-6">
      <BudgetHeader
        onBack={onBack}
        onSave={handleSave}
        onExport={onExport}
        onImport={onImport}
        isNew={isNew}
        budgetDescription={budgetDescription}
        projectId={projectId}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('budget.companiesComparison')}</CardTitle>
          <BudgetActions
            onAddBudgetItem={onAddBudgetItem}
            items={items}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <BudgetTable
              items={items}
              companies={companies}
              categoryTotals={categoryTotals}
              onUpdateItem={onUpdateItem}
              onUpdateObservation={onUpdateObservation}
              onUpdateDescription={onUpdateDescription}
              onUpdateCompanyName={onUpdateCompanyName}
              onRemoveCompany={onRemoveCompany}
              onDeleteItem={onDeleteItem}
              onAddCompany={onAddCompany}
              onAddBudgetItem={onAddBudgetItem}
              onReorderItems={onReorderItems}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
