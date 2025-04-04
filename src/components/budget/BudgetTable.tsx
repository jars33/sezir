
import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
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
  onUpdateCompanyName
}) => {
  const { t } = useTranslation();
  
  if (companies.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('budget.noCompaniesAdded')}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Table className="min-w-full border-collapse">
      <UITableHeader className="bg-muted sticky top-0 z-10">
        <BudgetTableHeader 
          companies={companies}
          onRemoveCompany={onRemoveCompany}
          onUpdateCompanyName={onUpdateCompanyName}
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
              />
            ))}

            {items.length > 0 && (
              <TotalsRow items={items} companies={companies} />
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};
