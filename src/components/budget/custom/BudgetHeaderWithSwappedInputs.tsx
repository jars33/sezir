
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Download, Upload } from "lucide-react";

interface BudgetHeaderWithSwappedInputsProps {
  onBack: () => void;
  onSave: (description: string, projectId?: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetDescription?: string;
  projectId?: string;
}

export const BudgetHeaderWithSwappedInputs: React.FC<BudgetHeaderWithSwappedInputsProps> = ({
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
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");

  const handleSave = () => {
    onSave(description, selectedProjectId || undefined);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:justify-between">
      <Button
        variant="ghost"
        onClick={onBack}
        className="self-start"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')}
      </Button>

      <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        {/* Company dropdown first (swapped from original position) */}
        <Select
          value={selectedProjectId}
          onValueChange={setSelectedProjectId}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="1 - Auchan Matosinhos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Auchan Matosinhos</SelectItem>
            <SelectItem value="2">2 - Continente Maia</SelectItem>
            <SelectItem value="3">3 - Pingo Doce Gondomar</SelectItem>
          </SelectContent>
        </Select>

        {/* Description input second (swapped from original position) */}
        <Input
          placeholder={t('budget.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full md:w-[240px]"
        />
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          title={t('common.export')}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onImport}
          title={t('common.import')}
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};
