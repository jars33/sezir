
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { Input } from "@/components/ui/input";
import { PriceCell } from "./PriceCell";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  onUpdateCompanyName
}) => {
  const { t } = useTranslation();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState<string>("");
  
  const handleEditDescription = (itemId: string, currentDescription: string) => {
    setEditingItemId(itemId);
    setEditingDescription(currentDescription);
  };
  
  const handleSaveDescription = (itemId: string) => {
    onUpdateDescription(itemId, editingDescription);
    setEditingItemId(null);
  };
  
  const handleCancelEdit = () => {
    setEditingItemId(null);
  };
  
  const handleEditCompanyName = (companyId: string, currentName: string) => {
    if (onUpdateCompanyName) {
      setEditingCompanyId(companyId);
      setEditingCompanyName(currentName);
    }
  };
  
  const handleSaveCompanyName = (companyId: string) => {
    if (onUpdateCompanyName && editingCompanyName.trim() !== "") {
      onUpdateCompanyName(companyId, editingCompanyName);
    }
    setEditingCompanyId(null);
  };
  
  const handleCancelCompanyEdit = () => {
    setEditingCompanyId(null);
  };
  
  if (companies.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('budget.noCompaniesAdded')}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Table className="min-w-full border-collapse">
      <TableHeader className="bg-muted sticky top-0 z-10">
        <TableRow>
          <TableHead className="w-12 border border-border">{t('budget.itemCode')}</TableHead>
          <TableHead className="w-64 border border-border">{t('budget.itemDescription')}</TableHead>
          
          {companies.map((company) => (
            <TableHead key={company.id} className="w-32 border border-border bg-primary/10 text-center">
              <div className="flex justify-between items-center">
                {editingCompanyId === company.id ? (
                  <div className="flex items-center justify-between w-full pr-1">
                    <Input
                      value={editingCompanyName}
                      onChange={(e) => setEditingCompanyName(e.target.value)}
                      className="w-full h-6 py-0 px-1 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCompanyName(company.id);
                        if (e.key === 'Escape') handleCancelCompanyEdit();
                      }}
                    />
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => handleSaveCompanyName(company.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={handleCancelCompanyEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span 
                      className="flex-grow cursor-pointer"
                      onClick={() => onUpdateCompanyName && handleEditCompanyName(company.id, company.name)}
                    >
                      {company.name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => onRemoveCompany(company.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </TableHead>
          ))}

          <TableHead className="w-28 border border-border bg-secondary/10 text-center">
            {t('budget.lowestPrice')}
          </TableHead>
          <TableHead className="w-28 border border-border bg-secondary/10 text-center">
            {t('budget.avgPrice')}
          </TableHead>
          <TableHead className="w-28 border border-border bg-secondary/10 text-center">
            {t('budget.observations')}
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6 + companies.length} className="text-center py-8">
              {t('budget.noItemsAdded')}
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const isCategoryWithValues = item.isCategory && categoryTotals[item.id];
            const isEditing = editingItemId === item.id;
            
            // Calculate lowest and average prices for category totals
            let categoryLowestPrice = 0;
            let categoryAveragePrice = 0;
            
            if (isCategoryWithValues) {
              const totals = categoryTotals[item.id];
              const priceValues = Object.values(totals).filter(p => p > 0);
              
              if (priceValues.length > 0) {
                categoryLowestPrice = Math.min(...priceValues);
                categoryAveragePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
              }
            }
            
            return (
              <TableRow key={item.id} className={item.isCategory ? "bg-muted/50 font-bold" : ""}>
                <TableCell className="border border-border text-center">
                  {item.code}
                </TableCell>
                <TableCell className="border border-border font-medium">
                  <div className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <Textarea 
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          className="min-h-[30px] py-1 text-base"
                          rows={2}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              handleSaveDescription(item.id);
                            }
                            if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveDescription(item.id)}
                            className="h-7 w-7"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-7 w-7"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`${item.isCategory ? "ml-0" : "ml-4"} cursor-pointer flex-grow`}
                          onClick={() => handleEditDescription(item.id, item.description)}
                        >
                          {item.description}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>

                {companies.map((company) => {
                  const price = item.prices[company.id] || 0;
                  const categoryTotal = isCategoryWithValues ? categoryTotals[item.id][company.id] || 0 : 0;
                  
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
                  {isCategoryWithValues && categoryLowestPrice > 0 
                    ? formatCurrency(categoryLowestPrice)
                    : item.lowestPrice > 0 
                      ? formatCurrency(item.lowestPrice) 
                      : ""}
                </TableCell>
                <TableCell className="border border-border text-right">
                  {isCategoryWithValues && categoryAveragePrice > 0
                    ? formatCurrency(categoryAveragePrice)
                    : item.averagePrice > 0 
                      ? formatCurrency(item.averagePrice) 
                      : ""}
                </TableCell>
                <TableCell className="border border-border">
                  <Input
                    value={item.observations || ""}
                    onChange={(e) => onUpdateObservation(item.id, e.target.value)}
                    className="w-full"
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}

        {items.length > 0 && (
          <TableRow className="bg-muted font-bold">
            <TableCell className="border border-border" colSpan={2}>
              {t('common.total')}
            </TableCell>
            
            {companies.map((company) => {
              const total = items
                .filter(item => !item.isCategory)
                .reduce((sum, item) => sum + (item.prices[company.id] || 0), 0);
              
              return (
                <TableCell key={`total-${company.id}`} className="border border-border text-right font-bold">
                  {formatCurrency(total)}
                </TableCell>
              );
            })}

            <TableCell className="border border-border"></TableCell>
            <TableCell className="border border-border"></TableCell>
            <TableCell className="border border-border"></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
