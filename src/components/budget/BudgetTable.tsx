
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
import { AddItemRow } from "./table/AddItemRow";
import { InlineItemCreation } from "./table/InlineItemCreation";
import { calculateCategoryTotals, recalculateItemCodes } from "./table/categoryCalculations";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

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
  onReorderItems?: (reorderedItems: BudgetComparisonItem[]) => void;
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
  onAddBudgetItem,
  onReorderItems
}) => {
  const { t } = useTranslation();
  const [inlineAddingParentCode, setInlineAddingParentCode] = useState<string | null>(null);
  
  // Handler for adding an item to a category - now opens inline editor
  const handleAddItemToCategory = (parentCode: string) => {
    setInlineAddingParentCode(parentCode);
  };
  
  // Handle adding item from inline editor
  const handleInlineItemAdd = (description: string) => {
    if (inlineAddingParentCode && description.trim()) {
      onAddBudgetItem(inlineAddingParentCode, description.trim(), false);
      setInlineAddingParentCode(null);
    }
  };

  // Handle drag end event
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside droppable area or in same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Clone items array to avoid mutation
    const itemsCopy = [...items];
    
    // Remove the dragged item from its position
    const [draggedItem] = itemsCopy.splice(source.index, 1);
    
    // Insert it at the new position
    itemsCopy.splice(destination.index, 0, draggedItem);
    
    // Recalculate codes after reordering
    const recalculatedItems = recalculateItemCodes(itemsCopy);
    
    // Call parent handler with reordered items
    if (onReorderItems) {
      onReorderItems(recalculatedItems);
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
    items.forEach((item, index) => {
      // Add the regular item row
      rows.push(
        <BudgetItemRow 
          key={item.id}
          index={index}
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
    });
    
    // Add totals row
    rows.push(
      <TotalsRow key="totals" items={items} companies={companies} />
    );
    
    return rows;
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Table className="min-w-full border-collapse">
        <UITableHeader className="bg-muted sticky top-0 z-10">
          <BudgetTableHeader 
            companies={companies}
            onRemoveCompany={onRemoveCompany}
            onUpdateCompanyName={onUpdateCompanyName}
            onAddCompany={onAddCompany}
          />
        </UITableHeader>

        <Droppable droppableId="budget-items">
          {(provided) => (
            <TableBody
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tableRows()}
              {provided.placeholder}
              
              {/* Only show the add item row when not adding inline */}
              {!inlineAddingParentCode && (
                <AddItemRow 
                  items={items}
                  companiesCount={companies.length}
                  onAddItem={onAddBudgetItem}
                />
              )}
            </TableBody>
          )}
        </Droppable>
      </Table>
    </DragDropContext>
  );
};
