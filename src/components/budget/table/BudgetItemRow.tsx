
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { PriceCell } from "@/components/budget/PriceCell";
import { formatCurrency } from "@/lib/utils";
import { Draggable } from "react-beautiful-dnd";
import { ItemDescriptionCell } from "./ItemDescriptionCell";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTextColorClass } from "./categoryCalculations";

interface BudgetItemRowProps {
  item: BudgetComparisonItem;
  companies: Company[];
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateDescription: (itemId: string, description: string) => void;
  categoryTotals?: Record<string, number>;
  onAddItemToCategory?: (categoryCode: string) => void;
  index: number;
}

export const BudgetItemRow: React.FC<BudgetItemRowProps> = ({
  item,
  companies,
  onUpdateItem,
  onUpdateObservation,
  onDeleteItem,
  onUpdateDescription,
  categoryTotals,
  onAddItemToCategory,
  index
}) => {
  const handlePriceChange = (companyId: string, price: number) => {
    onUpdateItem(item.id, companyId, price);
  };
  
  const handleAddItem = () => {
    if (onAddItemToCategory) {
      onAddItemToCategory(item.code);
    }
  };
  
  // Find the lowest price among companies for this category if it's a category
  let lowestPrice = 0;
  let averagePrice = 0;
  
  if (item.isCategory && categoryTotals) {
    const validPrices = Object.values(categoryTotals).filter(p => typeof p === 'number' && p > 0);
    if (validPrices.length > 0) {
      lowestPrice = categoryTotals.lowestPrice || Math.min(...validPrices);
      averagePrice = categoryTotals.averagePrice || validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length;
    }
  }
  
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${item.isCategory ? "bg-muted/50" : ""}`}
        >
          <TableCell className="border border-border font-medium pl-6">
            {item.code}
          </TableCell>
          
          <ItemDescriptionCell
            item={item}
            onUpdateDescription={onUpdateDescription}
            onAddItemToCategory={item.isCategory ? handleAddItem : undefined}
          />
          
          {companies.map((company) => {
            const price = item.prices[company.id] || 0;
            
            if (item.isCategory && categoryTotals) {
              const categoryPrice = categoryTotals[company.id] || 0;
              const colorClass = getTextColorClass(categoryPrice, lowestPrice, averagePrice);
              
              return (
                <TableCell
                  key={`${item.id}-${company.id}`}
                  className={`border border-border text-right ${colorClass}`}
                >
                  {categoryPrice > 0 ? formatCurrency(categoryPrice) : ""}
                </TableCell>
              );
            }
            
            return (
              <TableCell key={`${item.id}-${company.id}`} className="border border-border p-0">
                <PriceCell
                  price={price}
                  average={item.averagePrice}
                  stdDev={item.standardDeviation || 0}
                  onChange={(value) => handlePriceChange(company.id, value)}
                  isCategory={item.isCategory}
                />
              </TableCell>
            );
          })}
          
          <TableCell className="border border-border text-right">
            {item.isCategory && lowestPrice > 0 
              ? <span className="text-green-600 font-bold">{formatCurrency(lowestPrice)}</span>
              : item.lowestPrice > 0 
                ? formatCurrency(item.lowestPrice)
                : ""
            }
          </TableCell>
          
          <TableCell className="border border-border text-right">
            {item.isCategory && averagePrice > 0
              ? formatCurrency(averagePrice)
              : item.averagePrice > 0
                ? formatCurrency(item.averagePrice)
                : ""
            }
          </TableCell>
          
          <TableCell className="border border-border">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              {item.isCategory && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleAddItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};
