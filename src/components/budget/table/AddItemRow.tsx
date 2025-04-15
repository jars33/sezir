
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderPlus } from "lucide-react";
import { BudgetComparisonItem } from "@/types/budget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddItemRowProps {
  items: BudgetComparisonItem[];
  companiesCount: number;
  onAddItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
}

export const AddItemRow: React.FC<AddItemRowProps> = ({ 
  items,
  companiesCount,
  onAddItem
}) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [isCategory, setIsCategory] = useState(false);
  const [parentCode, setParentCode] = useState<string | null>(null);

  const categoryItems = items.filter(item => item.isCategory);
  
  const handleAddItem = () => {
    if (description.trim()) {
      onAddItem(parentCode, description.trim(), isCategory);
      resetForm();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setDescription("");
    setIsCategory(false);
    setParentCode(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    } else if (e.key === 'Escape') {
      resetForm();
    }
  };

  if (!isAdding) {
    return (
      <TableRow className="h-12 hover:bg-muted/30">
        <TableCell colSpan={6 + companiesCount} className="text-center">
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsCategory(false);
                setIsAdding(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('budget.addItem')}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsCategory(true);
                setIsAdding(true);
              }}
            >
              <FolderPlus className="w-4 h-4 mr-1" />
              {t('budget.addCategory')}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-muted/10">
      <TableCell className="w-20 text-center">
        {/* Code cell - automatically filled */}
        <span className="text-xs text-muted-foreground">
          {t('budget.autoCode')}
        </span>
      </TableCell>
      <TableCell colSpan={1}>
        <div className="flex flex-col gap-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isCategory ? t('budget.categoryName') : t('budget.itemDescription')}
            autoFocus
            onKeyDown={handleKeyDown}
          />
          {!isCategory && categoryItems.length > 0 && (
            <Select 
              value={parentCode || "none"} 
              onValueChange={(value) => setParentCode(value === "none" ? null : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t('budget.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t('common.none')}
                </SelectItem>
                {categoryItems.map(category => (
                  <SelectItem key={category.id} value={category.code}>
                    {category.code} - {category.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </TableCell>

      {/* Skip company price cells */}
      <TableCell colSpan={companiesCount} className="text-center text-muted-foreground text-xs">
        {isCategory 
          ? t('budget.categoryPricesAdded') 
          : t('budget.pricesAddedLater')}
      </TableCell>

      {/* Skip stats cells */}
      <TableCell colSpan={2} className="text-center text-muted-foreground text-xs">
        {t('budget.statsCalculated')}
      </TableCell>

      {/* Actions cell */}
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button 
            size="sm"
            onClick={handleAddItem}
            disabled={!description.trim()}
          >
            {t('common.add')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetForm}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
