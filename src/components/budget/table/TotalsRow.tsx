
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { calculatePriceStats } from "@/services/supabase/budget-utils/price-calculator";

interface TotalsRowProps {
  items: BudgetComparisonItem[];
  companies: Company[];
}

export const TotalsRow: React.FC<TotalsRowProps> = ({ items, companies }) => {
  const { t } = useTranslation();
  
  // Calculate totals per company
  const companyTotals: Record<string, number> = {};
  
  // Only include non-category items in totals
  const nonCategoryItems = items.filter(item => !item.isCategory);
  
  // Calculate totals for each company
  companies.forEach((company) => {
    const total = nonCategoryItems.reduce((sum, item) => 
      sum + (item.prices[company.id] || 0), 0);
    
    companyTotals[company.id] = total;
  });
  
  // Calculate lowest and average price across companies
  const totalsArray = Object.values(companyTotals).filter(total => total > 0);
  const { lowestPrice, averagePrice } = calculatePriceStats(totalsArray);

  return (
    <TableRow className="bg-muted font-bold">
      <TableCell className="border border-border" colSpan={2}>
        {t('common.total')}
      </TableCell>
      
      {companies.map((company) => (
        <TableCell 
          key={`total-${company.id}`} 
          className="border border-border text-right font-bold"
        >
          {formatCurrency(companyTotals[company.id] || 0)}
        </TableCell>
      ))}

      <TableCell className="border border-border text-right font-bold">
        {lowestPrice > 0 ? formatCurrency(lowestPrice) : ""}
      </TableCell>
      
      <TableCell className="border border-border text-right font-bold">
        {averagePrice > 0 ? formatCurrency(averagePrice) : ""}
      </TableCell>
      
      <TableCell className="border border-border"></TableCell>
    </TableRow>
  );
};
