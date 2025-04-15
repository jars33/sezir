
import React from "react";
import { TableRow, TableHead } from "@/components/ui/table";
import { Company } from "@/types/budget";
import { Trash2, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableHeaderProps {
  companies: Company[];
  onRemoveCompany: (id: string) => void;
  onUpdateCompanyName?: (companyId: string, name: string) => void;
  onAddCompany: (name: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  companies,
  onRemoveCompany,
  onUpdateCompanyName,
  onAddCompany,
}) => {
  const { t } = useTranslation();
  const [newCompanyName, setNewCompanyName] = React.useState("");
  const [editingCompanyId, setEditingCompanyId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  
  const handleAddCompany = () => {
    if (newCompanyName.trim()) {
      onAddCompany(newCompanyName.trim());
      setNewCompanyName("");
    }
  };
  
  const startEditing = (company: Company) => {
    setEditingCompanyId(company.id);
    setEditValue(company.name);
  };
  
  const submitEdit = () => {
    if (editingCompanyId && editValue.trim() && onUpdateCompanyName) {
      onUpdateCompanyName(editingCompanyId, editValue.trim());
      setEditingCompanyId(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitEdit();
    } else if (e.key === "Escape") {
      setEditingCompanyId(null);
    }
  };
  
  return (
    <TableRow>
      <TableHead className="border border-border w-24">
        {t('budget.itemCode')}
      </TableHead>
      
      <TableHead className="border border-border w-64">
        {t('budget.description')}
      </TableHead>
      
      {companies.map((company) => (
        <TableHead key={company.id} className="border border-border text-center relative">
          <div className="flex items-center justify-between min-w-[100px] pr-8">
            {editingCompanyId === company.id ? (
              <Input 
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={submitEdit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="min-w-24"
              />
            ) : (
              <div 
                className="w-full text-center cursor-pointer hover:text-primary transition-colors" 
                onClick={() => onUpdateCompanyName && startEditing(company)}
              >
                {company.name}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => onRemoveCompany(company.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableHead>
      ))}
      
      <TableHead className="border border-border text-center min-w-[100px]">
        {t('budget.lowestPrice')}
      </TableHead>
      
      <TableHead className="border border-border text-center min-w-[100px]">
        {t('budget.averagePrice')}
      </TableHead>
      
      <TableHead className="border border-border text-center min-w-[150px]">
        {t('budget.observations')}
      </TableHead>
    </TableRow>
  );
};
