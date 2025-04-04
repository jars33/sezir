
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BudgetComparisonItem } from "@/types/budget";

interface AddBudgetItemDialogProps {
  items: BudgetComparisonItem[];
  onAddItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  children: React.ReactNode;
}

export const AddBudgetItemDialog: React.FC<AddBudgetItemDialogProps> = ({ items, onAddItem, children }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isCategory, setIsCategory] = useState(false);
  const [selectedParentCode, setSelectedParentCode] = useState<string | null>(null);
  
  const categoryItems = items.filter(item => item.isCategory);
  
  const handleAddItem = () => {
    if (description.trim()) {
      onAddItem(selectedParentCode, description.trim(), isCategory);
      setOpen(false);
      setDescription("");
      setIsCategory(false);
      setSelectedParentCode(null);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('budget.addNewItem')}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t('common.description')}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isCategory" className="text-right">
              {t('budget.isCategory')}
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="isCategory"
                checked={isCategory}
                onCheckedChange={setIsCategory}
              />
              <span className="text-sm text-muted-foreground">
                {isCategory ? t('common.yes') : t('common.no')}
              </span>
            </div>
          </div>
          
          {!isCategory && categoryItems.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('budget.parentCategory')}
              </Label>
              <div className="col-span-3 border rounded max-h-60 overflow-hidden">
                <ScrollArea className="h-60 w-full">
                  <div className="p-2">
                    <div 
                      className={`p-2 cursor-pointer mb-1 rounded ${!selectedParentCode ? 'bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedParentCode(null)}
                    >
                      {t('common.none')}
                    </div>
                    {categoryItems.map(category => (
                      <div 
                        key={category.id}
                        className={`p-2 cursor-pointer mb-1 rounded ${selectedParentCode === category.code ? 'bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedParentCode(category.code)}
                      >
                        {category.code} - {category.description}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </SheetClose>
          <Button onClick={handleAddItem} disabled={!description.trim()}>
            {t('common.add')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
