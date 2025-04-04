
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet } from "lucide-react";
import { BudgetComparison } from "@/types/budget";
import { projectService } from "@/services/supabase/project-service";

interface BudgetListProps {
  budgets: BudgetComparison[];
  onCreateNew: () => void;
  onSelectBudget: (id: string) => void;
  isLoading: boolean;
}

interface ProjectMap {
  [key: string]: string;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  onCreateNew,
  onSelectBudget,
  isLoading
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [projects, setProjects] = useState<ProjectMap>({});
  
  // Load projects to map project IDs to names
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const allProjects = await projectService.getAllProjects();
        const projectMap: ProjectMap = {};
        allProjects.forEach(project => {
          projectMap[project.id] = `${project.number} - ${project.name}`;
        });
        setProjects(projectMap);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };
    
    loadProjects();
  }, []);
  
  const filteredBudgets = searchTerm 
    ? budgets.filter(budget => 
        (budget.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (budget.projectId && projects[budget.projectId] && 
         projects[budget.projectId].toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <TableHead>{t('common.description')}</TableHead>
                  <TableHead>{t('common.project')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onSelectBudget(budget.id)}>
                    <TableCell className="font-medium">{budget.description || "-"}</TableCell>
                    <TableCell>{budget.projectId ? projects[budget.projectId] || "-" : "-"}</TableCell>
                    <TableCell>{new Date(budget.createdAt).toLocaleDateString()}</TableCell>
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
