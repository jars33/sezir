
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
import { InlineItemCreation } from "./table/InlineItemCreation";
import { calculateCategoryTotals } from "./table/categoryCalculations";

interface BudgetTableProps {
  items: BudgetComparisonItem[];
  companies: Company[];
  categoryTotals: Record<string, Record<string, number>>;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onRemoveCompany: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateDescription: (itemId: string, description: string) => void;
  onUpdateCompanyName?: (companyId: string, name: string) => void;
  onAddCompany: (name: string) => void;
  onAddBudgetItem?: (parentCode: string | null, description: string, isCategory: boolean) => void;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  companies,
  categoryTotals,
  onUpdateItem,
  onUpdateObservation,
  onRemoveCompany,
  onDeleteItem,
  onUpdateDescription,
  onUpdateCompanyName,
  onAddCompany,
  onAddBudgetItem
}) => {
  const { t } = useTranslation();
  const [inlineAddingParentCode, setInlineAddingParentCode] = useState<string | null>(null);
  
  // Handler for adding an item to a category - now opens inline editor
  const handleAddItemToCategory = (parentCode: string) => {
    setInlineAddingParentCode(parentCode);
  };
  
  // Handle adding item from inline editor
  const handleInlineItemAdd = (description: string) => {
    if (inlineAddingParentCode && description.trim() && onAddBudgetItem) {
      onAddBudgetItem(inlineAddingParentCode, description.trim(), false);
      setInlineAddingParentCode(null);
    }
  };
  
  // Generate table rows with inline editor inserted at the right position
  const tableRows = () => {
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={5 + companies.length} className="text-center py-8">
            {t('budget.noItemsAdded')}
          </td>
        </tr>
      );
    }
    
    const rows: JSX.Element[] = [];
    
    // Add each item row and insert inline editor if needed
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Add the regular item row
      rows.push(
        <BudgetItemRow 
          key={item.id}
          item={item}
          companies={companies}
          onUpdateItem={onUpdateItem}
          onUpdateObservation={onUpdateObservation}
          onDeleteItem={onDeleteItem}
          onUpdateDescription={onUpdateDescription}
          categoryTotals={categoryTotals[item.id]}
          onAddItemToCategory={handleAddItemToCategory}
        />
      );
      
      // Add inline editor if this is the category we're adding to
      if (inlineAddingParentCode === item.code) {
        rows.push(
          <InlineItemCreation
            key={`inline-${item.code}`}
            parentCode={item.code}
            companiesCount={companies.length}
            onAddItem={handleInlineItemAdd}
            onCancel={() => setInlineAddingParentCode(null)}
          />
        );
      }
    }
    
    // Add totals row
    rows.push(
      <TotalsRow key="totals" items={items} companies={companies} />
    );
    
    return rows;
  };
  
  return (
    <Table className="min-w-full border-collapse">
      <UITableHeader className="bg-muted sticky top-0 z-10">
        <BudgetTableHeader 
          companies={companies}
          onRemoveCompany={onRemoveCompany}
          onUpdateCompanyName={onUpdateCompanyName}
          onAddCompany={onAddCompany}
        />
      </UITableHeader>

      <TableBody>
        {tableRows()}
      </TableBody>
    </Table>
  );
};
