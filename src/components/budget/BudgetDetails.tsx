
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, ArrowLeft, Download, Upload, X, Save } from "lucide-react";
import { BudgetComparisonItem, Company } from "@/types/budget";
import { PriceCell } from "./PriceCell";
import { AddBudgetItemDialog } from "./AddBudgetItemDialog";
import { AddCompanyDialog } from "./AddCompanyDialog";
import { formatCurrency } from "@/lib/utils";

interface BudgetDetailsProps {
  items: BudgetComparisonItem[];
  companies: Company[];
  onBack: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onUpdateItem: (itemId: string, companyId: string, price: number) => void;
  onUpdateObservation: (itemId: string, observation: string) => void;
  onAddBudgetItem: (parentCode: string | null, description: string, isCategory: boolean) => void;
  onSave: (name: string) => void;
  isNew?: boolean;
  budgetName?: string;
}

export const BudgetDetails: React.FC<BudgetDetailsProps> = ({
  items,
  companies,
  onBack,
  onAddCompany,
  onRemoveCompany,
  onUpdateItem,
  onUpdateObservation,
  onAddBudgetItem,
  onSave,
  isNew = true,
  budgetName = ""
}) => {
  const { t } = useTranslation();
  const [newBudgetName, setNewBudgetName] = useState(budgetName);
  
  const handleSave = () => {
    if (newBudgetName.trim()) {
      onSave(newBudgetName.trim());
    }
  };
  
  const handleExportToCSV = () => {
    // CSV export functionality would be implemented here
    console.log("Exporting to CSV...");
  };

  const handleImportFromCSV = () => {
    // CSV import functionality would be implemented here
    console.log("Importing from CSV...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          
          {isNew && (
            <div className="flex items-center gap-2">
              <Input 
                placeholder={t('budget.enterBudgetName')} 
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSave} disabled={!newBudgetName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {t('common.save')}
              </Button>
            </div>
          )}
          
          {!isNew && <h2 className="text-2xl font-bold">{budgetName}</h2>}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportFromCSV}>
            <Upload className="h-4 w-4 mr-2" />
            {t('common.import')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('budget.companiesComparison')}</CardTitle>
          <AddCompanyDialog onAddCompany={onAddCompany} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <AddBudgetItemDialog 
              items={items}
              onAddItem={onAddBudgetItem}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-24 border border-border">{t('budget.itemCode')}</TableHead>
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
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
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
                      
                      return (
                        <TableCell key={`${item.id}-${company.id}`} className="border border-border p-0">
                          <PriceCell 
                            price={price} 
                            average={item.averagePrice}
                            stdDev={item.standardDeviation || 0}
                            onChange={(value) => onUpdateItem(item.id, company.id, value)}
                            isCategory={item.isCategory}
                          />
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
                  </TableRow>
                ))}

                {/* Total row */}
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
