
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Download, Upload } from "lucide-react";

interface BudgetHeaderProps {
  onBack: () => void;
  onSave: (name: string) => void;
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

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {isNew ? (
          <Input
            placeholder={t('budget.enterBudgetName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full md:w-80"
          />
        ) : (
          <h2 className="text-2xl font-semibold">{budgetName}</h2>
        )}
        {projectId && (
          <span className="text-sm text-muted-foreground">
            {t('budget.linkedToProject')} #{projectId}
          </span>
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
