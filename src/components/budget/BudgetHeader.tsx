
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Download, Upload, Edit } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    // Update selected project id when projectId prop changes
    setSelectedProjectId(projectId);
  }, [projectId]);

  const handleSave = () => {
    // Use the project name as the budget name if no name is provided
    const budgetName = name || projects.find(p => p.id === selectedProjectId)?.name || "New Budget";
    onSave(budgetName, selectedProjectId);
    
    if (!isNew) {
      setIsEditing(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isNew ? (
          <div className="flex flex-col md:flex-row gap-3 w-full">
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
            {isEditing ? (
              <div className="mt-2">
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedProject ? (
                    <>
                      {t('budget.linkedToProject')} #{selectedProject.number} - {selectedProject.name}
                    </>
                  ) : (
                    t('budget.noLinkedProject')
                  )}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                  title={t('common.edit')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleSave} 
        >
          <Save className="h-4 w-4 mr-2" />
          {t('common.save')}
        </Button>
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
