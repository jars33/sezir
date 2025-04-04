
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { Company } from "@/types/budget";

interface TableHeaderProps {
  companies: Company[];
  onRemoveCompany: (id: string) => void;
  onUpdateCompanyName?: (companyId: string, name: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  companies,
  onRemoveCompany,
  onUpdateCompanyName
}) => {
  const { t } = useTranslation();
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState<string>("");
  
  const handleEditCompanyName = (companyId: string, currentName: string) => {
    if (onUpdateCompanyName) {
      setEditingCompanyId(companyId);
      setEditingCompanyName(currentName);
    }
  };
  
  const handleSaveCompanyName = (companyId: string) => {
    if (onUpdateCompanyName && editingCompanyName.trim() !== "") {
      onUpdateCompanyName(companyId, editingCompanyName);
    }
    setEditingCompanyId(null);
  };
  
  const handleCancelCompanyEdit = () => {
    setEditingCompanyId(null);
  };

  return (
    <TableRow>
      <TableHead className="w-12 border border-border">{t('budget.itemCode')}</TableHead>
      <TableHead className="w-64 border border-border">{t('budget.itemDescription')}</TableHead>
      
      {companies.map((company) => (
        <TableHead key={company.id} className="w-32 border border-border bg-primary/10 text-center">
          <div className="flex justify-between items-center">
            {editingCompanyId === company.id ? (
              <div className="flex items-center justify-between w-full pr-1">
                <Input
                  value={editingCompanyName}
                  onChange={(e) => setEditingCompanyName(e.target.value)}
                  className="w-full h-6 py-0 px-1 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCompanyName(company.id);
                    if (e.key === 'Escape') handleCancelCompanyEdit();
                  }}
                />
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={() => handleSaveCompanyName(company.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={handleCancelCompanyEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span 
                  className="flex-grow cursor-pointer"
                  onClick={() => onUpdateCompanyName && handleEditCompanyName(company.id, company.name)}
                >
                  {company.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => onRemoveCompany(company.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </TableHead>
      ))}

      <TableHead className="w-28 border border-border bg-secondary/10 text-center">
        {t('budget.lowestPrice')}
      </TableHead>
      <TableHead className="w-28 border border-border bg-secondary/10 text-center">
        {t('budget.avgPrice')}
      </TableHead>
      <TableHead className="w-28 border border-border bg-secondary/10 text-center">
        {t('budget.observations')}
      </TableHead>
    </TableRow>
  );
};
