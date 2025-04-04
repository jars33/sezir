
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { BudgetComparisonItem, Company } from "@/types/budget";

interface TotalsRowProps {
  items: BudgetComparisonItem[];
  companies: Company[];
}

export const TotalsRow: React.FC<TotalsRowProps> = ({ items, companies }) => {
  const { t } = useTranslation();

  return (
    <TableRow className="bg-muted font-bold">
      <TableCell className="border border-border" colSpan={2}>
        {t('common.total')}
      </TableCell>
      
      {companies.map((company) => {
        const total = items
          .filter(item => !item.isCategory)
          .reduce((sum, item) => sum + (item.prices[company.id] || 0), 0);
        
        return (
          <TableCell key={`total-${company.id}`} className="border border-border text-right font-bold">
            {formatCurrency(total)}
          </TableCell>
        );
      })}

      <TableCell className="border border-border"></TableCell>
      <TableCell className="border border-border"></TableCell>
      <TableCell className="border border-border"></TableCell>
    </TableRow>
  );
};
