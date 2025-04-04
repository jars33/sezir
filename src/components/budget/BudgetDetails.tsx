
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
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  onDeleteItem: (id: string) => void;
  onSave: (name: string, description: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetName?: string;
  budgetDescription?: string;
  projectId?: string;
  onUpdateProject?: (projectId: string) => void;
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
  onAddBudgetItem,
  onDeleteItem,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetName = "",
  budgetDescription = "",
  projectId,
  onUpdateProject
}) => {
  const { t } = useTranslation();

  // Handle save with potential project update
  const handleSave = (name: string, description: string, newProjectId?: string) => {
    // If this is an existing budget and the project changed, update it
    if (!isNew && newProjectId !== projectId && onUpdateProject) {
      onUpdateProject(newProjectId || "");
    }
    
    onSave(name, description, newProjectId);
  };

  return (
    <div className="space-y-6">
      <BudgetHeader
        onBack={onBack}
        onSave={handleSave}
        onExport={onExport}
        onImport={onImport}
        isNew={isNew}
        budgetName={budgetName}
        budgetDescription={budgetDescription}
        projectId={projectId}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('budget.companiesComparison')}</CardTitle>
          <BudgetActions
            onAddCompany={onAddCompany}
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
              onRemoveCompany={onRemoveCompany}
              onDeleteItem={onDeleteItem}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
