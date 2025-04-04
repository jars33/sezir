
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, X } from "lucide-react";
import { useBudgetComparison } from "@/hooks/use-budget-comparison";
import { BudgetComparisonItem } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";

const BudgetComparison = () => {
  const { t } = useTranslation();
  const { budgetItems, addCompany, removeCompany, updateItem, companies } = useBudgetComparison();
  const [newCompanyName, setNewCompanyName] = useState("");

  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      addCompany(newCompanyName.trim());
      setNewCompanyName("");
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('budget.comparisonTitle')}</h1>
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
        <CardHeader>
          <CardTitle>{t('budget.companiesComparison')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4 gap-2">
            <Input 
              placeholder={t('budget.enterCompanyName')} 
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleAddCompany}>
              <Plus className="h-4 w-4 mr-2" />
              {t('budget.addCompany')}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader className="bg-muted sticky top-0">
                <TableRow>
                  <TableHead className="w-64 border border-border">{t('budget.itemDescription')}</TableHead>
                  <TableHead className="w-24 border border-border">{t('budget.itemCode')}</TableHead>
                  
                  {companies.map((company, index) => (
                    <React.Fragment key={company.id}>
                      <TableHead className="w-32 border border-border bg-primary/10 text-center">
                        <div className="flex justify-between items-center">
                          {company.name}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={() => removeCompany(company.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="w-28 border border-border bg-primary/10 text-center">
                        {t('budget.totalPrice')}
                      </TableHead>
                      <TableHead className="w-28 border border-border bg-primary/10 text-center">
                        {t('budget.priceVariance')}
                      </TableHead>
                    </React.Fragment>
                  ))}

                  <TableHead className="w-32 border border-border bg-secondary/10 text-center">
                    {t('budget.analysis')}
                  </TableHead>
                  <TableHead className="w-28 border border-border bg-secondary/10 text-center">
                    {t('budget.lowestPrice')}
                  </TableHead>
                  <TableHead className="w-28 border border-border bg-secondary/10 text-center">
                    {t('budget.middlePrice')}
                  </TableHead>
                  <TableHead className="w-28 border border-border bg-secondary/10 text-center">
                    {t('budget.observations')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {budgetItems.map((item) => (
                  <TableRow key={item.id} className={item.isCategory ? "bg-muted/50 font-bold" : ""}>
                    <TableCell className="border border-border font-medium">
                      <div className="flex items-center gap-2">
                        <span className={item.isCategory ? "ml-0" : "ml-4"}>
                          {item.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="border border-border text-center">
                      {item.code}
                    </TableCell>

                    {companies.map((company) => {
                      const price = item.prices[company.id] || 0;
                      const variance = item.averagePrice > 0 
                        ? ((price - item.averagePrice) / item.averagePrice * 100).toFixed(2)
                        : "0.00";
                      
                      return (
                        <React.Fragment key={`${item.id}-${company.id}`}>
                          <TableCell className="border border-border">
                            {!item.isCategory && (
                              <Input 
                                type="number"
                                value={price || ""}
                                onChange={(e) => updateItem(item.id, company.id, Number(e.target.value))}
                                className="text-right"
                              />
                            )}
                          </TableCell>
                          <TableCell className="border border-border text-right">
                            {price > 0 ? formatCurrency(price) : ""}
                          </TableCell>
                          <TableCell className={`border border-border text-right ${
                            Number(variance) > 0 ? "text-red-500" : Number(variance) < 0 ? "text-green-500" : ""
                          }`}>
                            {price > 0 ? `${variance}%` : ""}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}

                    <TableCell className="border border-border"></TableCell>
                    <TableCell className="border border-border text-right">
                      {item.lowestPrice > 0 ? formatCurrency(item.lowestPrice) : ""}
                    </TableCell>
                    <TableCell className="border border-border text-right">
                      {item.middlePrice > 0 ? formatCurrency(item.middlePrice) : ""}
                    </TableCell>
                    <TableCell className="border border-border">
                      {!item.isCategory && (
                        <Input
                          value={item.observations || ""}
                          onChange={(e) => {
                            // Implementation for handling observations
                          }}
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
                    const total = budgetItems
                      .filter(item => !item.isCategory)
                      .reduce((sum, item) => sum + (item.prices[company.id] || 0), 0);
                    const avgTotal = budgetItems
                      .filter(item => !item.isCategory)
                      .reduce((sum, item) => sum + item.averagePrice, 0);
                    const totalVariance = avgTotal > 0 
                      ? ((total - avgTotal) / avgTotal * 100).toFixed(2)
                      : "0.00";
                    
                    return (
                      <React.Fragment key={`total-${company.id}`}>
                        <TableCell className="border border-border"></TableCell>
                        <TableCell className="border border-border text-right font-bold">
                          {formatCurrency(total)}
                        </TableCell>
                        <TableCell className={`border border-border text-right ${
                          Number(totalVariance) > 0 ? "text-red-500" : Number(totalVariance) < 0 ? "text-green-500" : ""
                        }`}>
                          {`${totalVariance}%`}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}

                  <TableCell className="border border-border"></TableCell>
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

export default BudgetComparison;
