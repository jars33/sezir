
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet, Calendar } from "lucide-react";
import { BudgetComparison } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";

interface BudgetListProps {
  budgets: BudgetComparison[];
  onCreateNew: () => void;
  onSelectBudget: (id: string) => void;
  isLoading: boolean;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  onCreateNew,
  onSelectBudget,
  isLoading
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredBudgets = searchTerm 
    ? budgets.filter(budget => 
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (budget.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : budgets;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('budget.allBudgetComparisons')}</CardTitle>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('budget.createNew')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input 
            placeholder={t('common.search')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">{t('common.loading')}...</div>
        ) : filteredBudgets.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.description')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSelectBudget(budget.id)}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>{budget.description || "-"}</TableCell>
                    <TableCell>{new Date(budget.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        onSelectBudget(budget.id);
                      }}>
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? t('common.noResultsFound') : t('budget.noBudgetsYet')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
