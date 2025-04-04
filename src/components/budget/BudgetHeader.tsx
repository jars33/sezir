
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Download, Upload } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/supabase/project-service";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  number: string;
}

interface BudgetHeaderProps {
  onBack: () => void;
  onSave: (name: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetName?: string;
  projectId?: string;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onBack,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetName = "",
  projectId
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(budgetName);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projectsData = await projectService.getAllProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedProjectId);
    }
  };

  const selectedProject = projects.find(p => p.id === projectId || p.id === selectedProjectId);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isNew ? (
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <Input
              placeholder={t('budget.enterBudgetName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:w-60"
            />
            
            {isLoadingProjects ? (
              <Skeleton className="h-10 w-60" />
            ) : (
              <Select 
                value={selectedProjectId} 
                onValueChange={(value) => setSelectedProjectId(value)}
              >
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue placeholder={t('budget.selectProject')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none')}</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.number} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold">{budgetName}</h2>
            {selectedProject && (
              <span className="text-sm text-muted-foreground">
                {t('budget.linkedToProject')} #{selectedProject.number} - {selectedProject.name}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isNew && (
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
        )}
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          {t('common.export')}
        </Button>
        <Button variant="outline" onClick={onImport}>
          <Upload className="h-4 w-4 mr-2" />
          {t('common.import')}
        </Button>
      </div>
    </div>
  );
};
