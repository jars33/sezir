
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
  onBack: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  onSave: (name: string) => void;
  isNew?: boolean;
  budgetName?: string;
}

export const BudgetDetails: React.FC<BudgetDetailsProps> = ({
  items,
  companies,
  onBack,
  onAddCompany,
  onRemoveCompany,
  onUpdateItem,
  onUpdateObservation,
  onAddBudgetItem,
  onSave,
  isNew = true,
  budgetName = ""
}) => {
  const { t } = useTranslation();
  
  const handleExportToCSV = () => {
    // CSV export functionality would be implemented here
    console.log("Exporting to CSV...");
  };

  const handleImportFromCSV = () => {
    // CSV import functionality would be implemented here
    console.log("Importing from CSV...");
  };

  return (
    <div className="space-y-6">
      <BudgetHeader
        onBack={onBack}
        onSave={onSave}
        onExport={handleExportToCSV}
        onImport={handleImportFromCSV}
        isNew={isNew}
        budgetName={budgetName}
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
              onUpdateItem={onUpdateItem}
              onUpdateObservation={onUpdateObservation}
              onRemoveCompany={onRemoveCompany}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
