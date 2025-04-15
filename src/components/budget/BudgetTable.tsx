import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader as UITableHeader, TableBody } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { TableHeader as BudgetTableHeader } from "./table/TableHeader";
import { BudgetItemRow } from "./table/BudgetItemRow";
import { TotalsRow } from "./table/TotalsRow";
import { InlineItemCreation } from "./table/InlineItemCreation";
import { calculateCategoryTotals, recalculateItemCodes } from "./table/categoryCalculations";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  onAddCategory?: () => void;
  onAddItem?: (description: string, parentCode?: string) => void;
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
  onReorderItems,
  onAddCategory,
  onAddItem
}) => {
  const { t } = useTranslation();
  const [inlineAddingParentCode, setInlineAddingParentCode] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const handleAddItemToCategory = (parentCode: string) => {
    setInlineAddingParentCode(parentCode);
  };
  
  const handleInlineItemAdd = (description: string) => {
    if (inlineAddingParentCode && description.trim() && onAddItem) {
      onAddItem(description, inlineAddingParentCode);
      setInlineAddingParentCode(null);
    }
  };

  const handleAddCategory = () => {
    if (onAddCategory) {
      onAddCategory();
    } else {
      setIsAddingCategory(true);
    }
  };

  const handleCategoryAdd = (description: string) => {
    if (description.trim() && onAddItem) {
      onAddItem(description);
      setIsAddingCategory(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || (destination.index === source.index)) {
      return;
    }
    
    const draggedItem = items.find(item => item.id === draggableId);
    if (!draggedItem) return;
    
    const reorderedItems = Array.from(items);
    
    if (draggedItem.isCategory) {
      const categoryCode = draggedItem.code;
      const categoryItems = items.filter(item => {
        if (item.id === draggableId) return true;
        
        if (!item.code.includes('.')) return false;
        
        const [parentCode] = item.code.split('.');
        return parentCode === categoryCode;
      });
      
      const itemIndices = categoryItems.map(item => 
        items.findIndex(i => i.id === item.id)
      ).sort((a, b) => b - a);
      
      const withoutCategoryItems = [...reorderedItems];
      itemIndices.forEach(index => {
        withoutCategoryItems.splice(index, 1);
      });
      
      const insertPosition = destination.index > source.index 
        ? destination.index - categoryItems.length + 1 
        : destination.index;
      
      withoutCategoryItems.splice(insertPosition, 0, ...categoryItems);
      
      const updatedItems = recalculateItemCodes(withoutCategoryItems);
      
      if (onReorderItems) {
        onReorderItems(updatedItems);
      }
    } else {
      const [removed] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, removed);
      
      const updatedItems = recalculateItemCodes(reorderedItems);
      
      if (onReorderItems) {
        onReorderItems(updatedItems);
      }
    }
  };
  
  const renderTableContent = () => {
    if (items.length === 0 && !isAddingCategory) {
      return (
        <tr>
          <td colSpan={5 + companies.length} className="text-center py-8">
            {t('budget.noItemsAdded')}
          </td>
        </tr>
      );
    }
    
    return (
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

        {isAddingCategory && (
          <InlineItemCreation
            key="new-category"
            isCategory={true}
            companiesCount={companies.length}
            onAddItem={handleCategoryAdd}
            onCancel={() => setIsAddingCategory(false)}
          />
        )}
        <TotalsRow key="totals" items={items} companies={companies} />
      </>
    );
  };

  const renderAddCategoryButton = () => (
    <div className="flex justify-end mt-4">
      <Button 
        onClick={handleAddCategory}
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {t('budget.addCategory')}
      </Button>
    </div>
  );
  
  return (
    <div className="space-y-4">
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
                {renderTableContent()}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>

      {renderAddCategoryButton()}
    </div>
  );
};
