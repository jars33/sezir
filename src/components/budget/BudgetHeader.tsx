
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  onSave: (name: string, description: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetName?: string;
  budgetDescription?: string;
  projectId?: string;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onBack,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetName = "",
  budgetDescription = "",
  projectId
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(budgetName);
  const [description, setDescription] = useState(budgetDescription);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

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
  
  useEffect(() => {
    // Update description state when budgetDescription prop changes
    setDescription(budgetDescription);
  }, [budgetDescription]);

  const handleSave = () => {
    // Use the project name as the budget name if no name is provided
    const budgetName = name || projects.find(p => p.id === selectedProjectId)?.name || "New Budget";
    onSave(budgetName, description, selectedProjectId);
    
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
        
        <div className="flex flex-col">
          {isNew || isEditing ? (
            <div className="flex flex-col space-y-2">
              <Input
                placeholder={t('budget.budgetName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full md:w-60"
              />
              <Textarea
                placeholder={t('budget.budgetDescription')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full md:w-60"
                rows={2}
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
                    <SelectItem value="none">{t('budget.noProject')}</SelectItem>
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
            <>
              <h2 className="text-2xl font-semibold">{budgetName}</h2>
              {budgetDescription && (
                <p className="text-sm text-muted-foreground mt-1">{budgetDescription}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
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
            </>
          )}
        </div>
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
