
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AddBudgetItemDialog } from "./AddBudgetItemDialog";
import { AddCompanyDialog } from "./AddCompanyDialog";
import { BudgetComparisonItem } from "@/types/budget";

interface BudgetActionsProps {
  onAddCompany: (name: string) => void;
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  items: BudgetComparisonItem[];
}

export const BudgetActions: React.FC<BudgetActionsProps> = ({
  onAddCompany,
  onAddBudgetItem,
  items
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AddBudgetItemDialog 
          items={items}
          onAddItem={onAddBudgetItem}
        />
      </div>
      <AddCompanyDialog onAddCompany={onAddCompany} />
    </div>
  );
};
