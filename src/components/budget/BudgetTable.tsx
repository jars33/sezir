
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
import { InlineItemCreation } from "./table/InlineItemCreation";
import { calculateCategoryTotals } from "./table/categoryCalculations";
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
  onReorderItems
}) => {
  const { t } = useTranslation();
  const [inlineAddingParentCode, setInlineAddingParentCode] = useState<string | null>(null);
  
  // Handler for adding an item to a category - opens inline editor
  const handleAddItemToCategory = (parentCode: string) => {
    setInlineAddingParentCode(parentCode);
  };
  
  // Handle adding item from inline editor
  const handleInlineItemAdd = (description: string) => {
    if (inlineAddingParentCode && description.trim()) {
      setInlineAddingParentCode(null);
    }
  };

  // Handle drag end event
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // Dropped outside the list or no movement
    if (!destination || (destination.index === source.index)) {
      return;
    }
    
    // Create reordered array
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);
    
    // Update item codes based on their new order
    const updatedItems = updateItemCodes(reorderedItems);
    
    // Pass the reordered items back to parent
    if (onReorderItems) {
      onReorderItems(updatedItems);
    }
  };

  // Helper function to update item codes after reordering
  const updateItemCodes = (reorderedItems: BudgetComparisonItem[]): BudgetComparisonItem[] => {
    // First, separate items by their level (top-level vs. children)
    const topLevelItems: BudgetComparisonItem[] = [];
    const childrenByParentCode: Record<string, BudgetComparisonItem[]> = {};
    
    reorderedItems.forEach(item => {
      if (!item.code.includes('.')) {
        topLevelItems.push(item);
      } else {
        const [parentCode] = item.code.split('.');
        if (!childrenByParentCode[parentCode]) {
          childrenByParentCode[parentCode] = [];
        }
        childrenByParentCode[parentCode].push(item);
      }
    });
    
    // Reorder top-level items first
    const result: BudgetComparisonItem[] = [];
    topLevelItems.forEach((item, index) => {
      const oldCode = item.code;
      const newCode = String(index + 1);
      
      // Add the top-level item with updated code
      result.push({
        ...item,
        code: newCode
      });
      
      // Add its children with updated codes
      if (childrenByParentCode[oldCode]) {
        childrenByParentCode[oldCode].forEach((child, childIndex) => {
          const childSuffix = child.code.split('.').slice(1).join('.');
          result.push({
            ...child,
            code: `${newCode}.${childSuffix}`
          });
        });
      }
    });
    
    return result;
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
    
    // Regular rows are now handled by the Droppable
    return null;
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5 + companies.length} className="text-center py-8">
                    {t('budget.noItemsAdded')}
                  </td>
                </tr>
              ) : (
                <>
                  {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <BudgetItemRow
                        item={item}
                        companies={companies}
                        onUpdateItem={onUpdateItem}
                        onUpdateObservation={onUpdateObservation}
                        onDeleteItem={onDeleteItem}
                        onUpdateDescription={onUpdateDescription}
                        categoryTotals={categoryTotals[item.id]}
                        onAddItemToCategory={handleAddItemToCategory}
                        index={index}
                      />
                      {inlineAddingParentCode === item.code && (
                        <InlineItemCreation
                          key={`inline-${item.code}`}
                          parentCode={item.code}
                          companiesCount={companies.length}
                          onAddItem={handleInlineItemAdd}
                          onCancel={() => setInlineAddingParentCode(null)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
              {provided.placeholder}
              <TotalsRow key="totals" items={items} companies={companies} />
            </TableBody>
          )}
        </Droppable>
      </Table>
    </DragDropContext>
  );
};
