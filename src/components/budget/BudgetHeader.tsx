
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, Check, Download, Save, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/supabase/project-service";
import { toast } from "sonner";

interface BudgetHeaderProps {
  onBack: () => void;
  onSave: (description: string, projectId?: string) => void;
  onExport?: () => void;
  onImport?: () => void;
  isNew?: boolean;
  budgetDescription?: string;
  projectId?: string;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onBack,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetDescription = "",
  projectId
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState(budgetDescription);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "none");
  const [isSaving, setIsSaving] = useState(false);
  const [showCheckMark, setShowCheckMark] = useState(false);
  
  // Fetch projects from the API
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const data = await projectService.getAllProjects();
      return data;
    },
  });
  
  const handleSave = async () => {
    if (!description) {
      toast.warning(t('budget.descriptionRequired'));
      return;
    }
    
    setIsSaving(true);
    setShowCheckMark(true);
    
    toast.loading(t('budget.saving'), { id: "saving-budget" });
    
    try {
      const projectIdToSave = selectedProjectId === "none" ? undefined : selectedProjectId;
      await onSave(description, projectIdToSave);
      toast.dismiss("saving-budget");
      toast.success(t('budget.savedSuccessfully'));
      
      // Reset the icon back to Save after 2 seconds
      setTimeout(() => {
        setShowCheckMark(false);
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      toast.dismiss("saving-budget");
      toast.error(t('budget.errorSaving'));
      console.error("Error saving budget:", error);
      setShowCheckMark(false);
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} title={t('common.back')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Select 
            value={selectedProjectId} 
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder={t('budget.selectProject')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('budget.noProject')}</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.number} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder={t('budget.enterBudgetDescription')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-w-[200px]"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!description || isSaving}
            className="whitespace-nowrap"
          >
            {showCheckMark ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
          
          {onExport && (
            <Button 
              variant="outline" 
              onClick={onExport}
              title={t('common.export')}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {onImport && (
            <Button 
              variant="outline" 
              onClick={onImport}
              title={t('common.import')}
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {!description && (
        <div className="flex items-center gap-2 text-yellow-600 text-sm mt-1">
          <AlertTriangle className="h-4 w-4" />
          {t('budget.descriptionRequired')}
        </div>
      )}
    </div>
  );
};
