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
  
  // Find the best price (minimum)
  const bestPrice = Math.min(...Object.values(companyTotals).filter(p => p > 0));
  
  // Function to determine text color based on price comparison
  const getTextColorClass = (price: number) => {
    if (price <= 0) return "";
    
    // If this is the lowest price, make it green
    if (price === bestPrice) return "text-green-600 font-bold";
    
    // If the price is higher than average, make it red
    if (price > averagePrice) return "text-red-600";
    
    // Otherwise, make it a neutral color
    return "text-amber-600";
  };

  return (
    <TableRow className="bg-muted font-bold">
      <TableCell className="border border-border" colSpan={2}>
        {t('common.total')}
      </TableCell>
      
      {companies.map((company) => {
        const total = companyTotals[company.id] || 0;
        const colorClass = getTextColorClass(total);
        
        return (
          <TableCell 
            key={`total-${company.id}`} 
            className={`border border-border text-right font-bold ${colorClass}`}
          >
            {formatCurrency(total)}
          </TableCell>
        );
      })}

      <TableCell className="border border-border text-right font-bold text-green-600">
        {lowestPrice > 0 ? formatCurrency(lowestPrice) : ""}
      </TableCell>
      
      <TableCell className="border border-border text-right font-bold">
        {averagePrice > 0 ? formatCurrency(averagePrice) : ""}
      </TableCell>
      
      <TableCell className="border border-border"></TableCell>
    </TableRow>
  );
};
