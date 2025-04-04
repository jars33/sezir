
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Upload, Save } from "lucide-react";

interface BudgetHeaderProps {
  onBack: () => void;
  onSave: (name: string) => void;
  onExport: () => void;
  onImport: () => void;
  isNew?: boolean;
  budgetName?: string;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  onBack,
  onSave,
  onExport,
  onImport,
  isNew = true,
  budgetName = ""
}) => {
  const { t } = useTranslation();
  const [newBudgetName, setNewBudgetName] = useState(budgetName);
  
  const handleSave = () => {
    if (newBudgetName.trim()) {
      onSave(newBudgetName.trim());
    }
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        
        {isNew && (
          <div className="flex items-center gap-2">
            <Input 
              placeholder={t('budget.enterBudgetName')} 
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleSave} disabled={!newBudgetName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        )}
        
        {!isNew && <h2 className="text-2xl font-bold">{budgetName}</h2>}
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          {t('common.export')}
        </Button>
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-2" />
          {t('common.import')}
        </Button>
      </div>
    </div>
  );
};
