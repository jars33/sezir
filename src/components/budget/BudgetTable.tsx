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
  onAddCategory
}) => {
  const { t } = useTranslation();
  const [inlineAddingParentCode, setInlineAddingParentCode] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
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

  // Handle adding a new category
  const handleAddCategory = () => {
    setIsAddingCategory(true);
  };

  // Handle adding category from inline editor
  const handleCategoryAdd = (description: string) => {
    setIsAddingCategory(false);
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
    const updatedItems = recalculateItemCodes(reorderedItems);
    
    // Pass the reordered items back to parent
    if (onReorderItems) {
      onReorderItems(updatedItems);
    }
  };
  
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
                {items.length === 0 && !isAddingCategory ? (
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

                    {isAddingCategory && (
                      <InlineItemCreation
                        key="new-category"
                        isCategory={true}
                        companiesCount={companies.length}
                        onAddItem={handleCategoryAdd}
                        onCancel={() => setIsAddingCategory(false)}
                      />
                    )}
                    {provided.placeholder}
                    <TotalsRow key="totals" items={items} companies={companies} />
                  </>
                )}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>

      {/* Add category button below the table */}
      <div className="flex justify-end mt-4">
        <Button 
          onClick={onAddCategory}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('budget.addCategory')}
        </Button>
      </div>
    </div>
  );
};
