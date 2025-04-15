
import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
import { AddItemRow } from "./table/AddItemRow";
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
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
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
  
  // Handler for adding an item to a category
  const handleAddItemToCategory = (parentCode: string) => {
    // Open a prompt to get the item description
    const description = prompt(t('budget.enterItemDescription'));
    if (description && description.trim()) {
      onAddBudgetItem(parentCode, description.trim(), false);
    }
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
        {items.length === 0 ? (
          <tr>
            <td colSpan={6 + companies.length} className="text-center py-8">
              {t('budget.noItemsAdded')}
            </td>
          </tr>
        ) : (
          <>
            {items.map((item) => (
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
            ))}

            {items.length > 0 && (
              <TotalsRow items={items} companies={companies} />
            )}
          </>
        )}
        
        <AddItemRow 
          items={items}
          companiesCount={companies.length}
          onAddItem={onAddBudgetItem}
        />
      </TableBody>
    </Table>
  );
};
