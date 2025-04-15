
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { BudgetHeader } from "./BudgetHeader";
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
  onDeleteItem: (id: string) => void;
  onSave: (description: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
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
  onUpdateDescription,
  onUpdateCompanyName,
  onDeleteItem,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetDescription = "",
  projectId,
  onUpdateProject
}) => {
  const { t } = useTranslation();

  const handleSave = (description: string, newProjectId?: string) => {
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
        <CardHeader>
          <CardTitle>{t('budget.companiesComparison')}</CardTitle>
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
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
