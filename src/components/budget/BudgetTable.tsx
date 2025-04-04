
import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { Input } from "@/components/ui/input";
import { PriceCell } from "./PriceCell";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BudgetTableProps {
  items: BudgetComparisonItem[];
  companies: Company[];
  categoryTotals: Record<string, Record<string, number>>;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onRemoveCompany: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({
  items,
  companies,
  categoryTotals,
  onUpdateItem,
  onUpdateObservation,
  onRemoveCompany,
  onDeleteItem
}) => {
  const { t } = useTranslation();
  
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
                {company.name}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => onRemoveCompany(company.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
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
          <TableHead className="w-10 border border-border bg-secondary/10 text-center">
            {t('common.actions')}
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7 + companies.length} className="text-center py-8">
              {t('budget.noItemsAdded')}
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const isCategoryWithValues = item.isCategory && categoryTotals[item.id];
            
            return (
              <TableRow key={item.id} className={item.isCategory ? "bg-muted/50 font-bold" : ""}>
                <TableCell className="border border-border text-center">
                  {item.code}
                </TableCell>
                <TableCell className="border border-border font-medium">
                  <div className="flex items-center gap-2">
                    <span className={item.isCategory ? "ml-0" : "ml-4"}>
                      {item.description}
                    </span>
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
                  {item.lowestPrice > 0 ? formatCurrency(item.lowestPrice) : ""}
                </TableCell>
                <TableCell className="border border-border text-right">
                  {item.averagePrice > 0 ? formatCurrency(item.averagePrice) : ""}
                </TableCell>
                <TableCell className="border border-border">
                  {!item.isCategory && (
                    <Input
                      value={item.observations || ""}
                      onChange={(e) => onUpdateObservation(item.id, e.target.value)}
                      className="w-full"
                    />
                  )}
                </TableCell>
                <TableCell className="border border-border p-0 text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('common.delete')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            <TableCell className="border border-border"></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
