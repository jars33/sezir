
import React from "react";
import { TableRow, TableHead } from "@/components/ui/table";
import { Company } from "@/types/budget";
import { X, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableHeaderProps {
  companies: Company[];
  onRemoveCompany: (id: string) => void;
  onUpdateCompanyName?: (companyId: string, name: string) => void;
  onAddCompany: (name: string) => void;
  onAddCompanyAtIndex?: (name: string, index: number) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  companies,
  onRemoveCompany,
  onUpdateCompanyName,
  onAddCompany,
  onAddCompanyAtIndex,
}) => {
  const { t } = useTranslation();
  const [newCompanyName, setNewCompanyName] = React.useState("");
  const [editingCompanyId, setEditingCompanyId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [hoveredCompanyId, setHoveredCompanyId] = React.useState<string | null>(null);
  
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

  const handleAddAtIndex = (index: number) => {
    // Default company name with index
    const newName = `Company ${companies.length + 1}`;
    
    if (onAddCompanyAtIndex) {
      onAddCompanyAtIndex(newName, index);
    } else {
      // Fallback to regular add if index-based function not provided
      onAddCompany(newName);
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
      
      {companies.map((company, index) => {
        // Use a soft neutral gray background
        const bgColorClass = "bg-gray-50";
        
        return (
          <TableHead 
            key={company.id} 
            className={`border border-border text-center ${bgColorClass}`}
            onMouseEnter={() => setHoveredCompanyId(company.id)}
            onMouseLeave={() => setHoveredCompanyId(null)}
          >
            <div className="flex items-center justify-center gap-2 min-w-[100px]">
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
                <>
                  <div 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onUpdateCompanyName && startEditing(company)}
                  >
                    {company.name}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 p-0 opacity-0 transition-opacity ${
                        hoveredCompanyId === company.id ? "opacity-100" : ""
                      }`}
                      onClick={() => onRemoveCompany(company.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 p-0 opacity-0 transition-opacity ${
                        hoveredCompanyId === company.id ? "opacity-100" : ""
                      }`}
                      onClick={() => handleAddAtIndex(index + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TableHead>
        );
      })}
      
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
