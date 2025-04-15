import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { PriceCell } from "../PriceCell";
import { ItemDescriptionCell } from "./ItemDescriptionCell";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface BudgetItemRowProps {
  item: BudgetComparisonItem;
  companies: Company[];
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateDescription: (itemId: string, description: string) => void;
  onAddItemToCategory: (parentCode: string) => void;
  categoryTotals?: Record<string, number>;
}

export const BudgetItemRow: React.FC<BudgetItemRowProps> = ({
  item,
  companies,
  onUpdateItem,
  onUpdateObservation,
  onDeleteItem,
  onUpdateDescription,
  onAddItemToCategory,
  categoryTotals
}) => {
  const isCategoryWithValues = item.isCategory && categoryTotals;
  
  return (
    <TableRow className={`${item.isCategory ? "bg-muted/50 font-bold" : "hover:bg-muted/20"}`}>
      <TableCell className="border border-border text-center">
        {item.code}
      </TableCell>
      <TableCell className="border border-border font-medium">
        <ItemDescriptionCell
          description={item.description}
          isCategory={item.isCategory}
          onUpdate={(description) => onUpdateDescription(item.id, description)}
          onDelete={() => onDeleteItem(item.id)}
          onAddItem={onAddItemToCategory}
          parentCode={item.code}
        />
      </TableCell>

      {companies.map((company) => {
        const price = item.prices[company.id] || 0;
        const categoryTotal = isCategoryWithValues ? categoryTotals?.[company.id] || 0 : 0;
        
        return (
          <TableCell key={`${item.id}-${company.id}`} className="border border-border p-0">
            {isCategoryWithValues && categoryTotal > 0 ? (
              <div className="text-right p-2 bg-secondary/5">
                {formatCurrency(categoryTotal)}
              </div>
            ) : (
              <PriceCell 
                price={price} 
                average={item.averagePrice}
                stdDev={item.standardDeviation || 0}
                onChange={(value) => onUpdateItem(item.id, company.id, value)}
                isCategory={item.isCategory}
              />
            )}
          </TableCell>
        );
      })}

      <TableCell className="border border-border text-right">
        {isCategoryWithValues && categoryTotals?.lowestPrice && categoryTotals.lowestPrice > 0 
          ? formatCurrency(categoryTotals.lowestPrice)
          : item.lowestPrice > 0 
            ? formatCurrency(item.lowestPrice) 
            : ""}
      </TableCell>
      <TableCell className="border border-border text-right">
        {isCategoryWithValues && categoryTotals?.averagePrice && categoryTotals.averagePrice > 0
          ? formatCurrency(categoryTotals.averagePrice)
          : item.averagePrice > 0
            ? formatCurrency(item.averagePrice)
            : ""}
      </TableCell>
      <TableCell className="border border-border">
        <Textarea
          value={item.observations || ""}
          onChange={(e) => onUpdateObservation(item.id, e.target.value)}
          className="w-full min-h-[80px] max-h-[200px] resize-y border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </TableCell>
    </TableRow>
  );
};
