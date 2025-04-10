
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet, Trash2 } from "lucide-react";
import { BudgetComparison } from "@/types/budget";
import { projectService } from "@/services/supabase/project-service";
import { DeleteBudgetDialog } from "./DeleteBudgetDialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface BudgetListProps {
  budgets: BudgetComparison[];
  onCreateNew: () => void;
  onSelectBudget: (id: string) => void;
  onDeleteBudget: (id: string) => Promise<void>;
  isLoading: boolean;
}

interface ProjectMap {
  [key: string]: string;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  onCreateNew,
  onSelectBudget,
  onDeleteBudget,
  isLoading
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [projects, setProjects] = useState<ProjectMap>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetComparison | null>(null);
  
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
  
  const handleDeleteClick = (e: React.MouseEvent, budget: BudgetComparison) => {
    e.stopPropagation();
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBudget) return;
    await onDeleteBudget(selectedBudget.id);
  };
  
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
                  <TableHead className="w-[100px] text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <ContextMenu key={budget.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-gray-50">
                        <TableCell
                          className="font-medium"
                          onClick={() => onSelectBudget(budget.id)}
                        >
                          {budget.description || "-"}
                        </TableCell>
                        <TableCell onClick={() => onSelectBudget(budget.id)}>
                          {budget.projectId ? projects[budget.projectId] || "-" : "-"}
                        </TableCell>
                        <TableCell onClick={() => onSelectBudget(budget.id)}>
                          {new Date(budget.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteClick(e, budget)}
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => onSelectBudget(budget.id)}>
                        {t('common.open')}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => {
                          setSelectedBudget(budget);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        {t('common.delete')}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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

      <DeleteBudgetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        description={selectedBudget?.description}
      />
    </Card>
  );
};
