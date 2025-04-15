
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { PriceCell } from "../PriceCell";
import { ItemDescriptionCell } from "./ItemDescriptionCell";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Draggable } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";

interface BudgetItemRowProps {
  item: BudgetComparisonItem;
  index: number;
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
  index,
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
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${item.isCategory ? "bg-muted/50 font-bold" : "hover:bg-muted/20"} ${
            snapshot.isDragging ? "opacity-70 bg-primary/10 border-2 border-primary" : ""
          }`}
        >
          <TableCell className="border border-border text-center flex items-center">
            <div 
              {...provided.dragHandleProps} 
              className="cursor-grab mr-1 p-1"
              title="Drag to reorder"
            >
              <GripVertical size={16} className="text-muted-foreground" />
            </div>
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
            <PriceCell 
              price={item.averagePrice} 
              average={item.averagePrice}
              stdDev={0}
              onChange={() => {}}
              readOnly={true}
            />
          </TableCell>
          <TableCell className="border border-border">
            <Textarea
              value={item.observations || ""}
              onChange={(e) => onUpdateObservation(item.id, e.target.value)}
              className="w-full min-h-[38px] resize-none border-0 focus-visible:ring-0 p-2"
              placeholder="Add observations..."
            />
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};
