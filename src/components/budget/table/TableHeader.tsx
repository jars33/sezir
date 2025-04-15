
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Company } from "@/types/budget";
import { AddCompanyDialog } from "@/components/budget/AddCompanyDialog";

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
  onAddCompany
}) => {
  const { t } = useTranslation();
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [isAddingCompany, setIsAddingCompany] = useState<boolean>(false);
  
  // Automatically enter edit mode for empty company names
  React.useEffect(() => {
    const emptyCompany = companies.find(company => company.name === "");
    if (emptyCompany && onUpdateCompanyName) {
      setEditingCompanyId(emptyCompany.id);
    }
  }, [companies, onUpdateCompanyName]);
  
  const handleEditCompanyName = (companyId: string, currentName: string) => {
    if (onUpdateCompanyName) {
      setEditingCompanyId(companyId);
    }
  };
  
  const handleUpdateCompanyName = (companyId: string, newName: string) => {
    if (onUpdateCompanyName && newName.trim() !== "") {
      onUpdateCompanyName(companyId, newName);
      setEditingCompanyId(null);
    }
  };

  return (
    <TableRow>
      <TableHead className="w-12 border border-border">{t('budget.itemCode')}</TableHead>
      <TableHead className="w-64 border border-border">{t('budget.itemDescription')}</TableHead>
      
      {companies.map((company, index) => (
        <TableHead 
          key={company.id} 
          className="w-32 border border-border bg-primary/10 text-center"
        >
          <div className="flex justify-between items-center">
            {editingCompanyId === company.id ? (
              <AddCompanyDialog
                initialName={company.name}
                onAddCompany={(name) => handleUpdateCompanyName(company.id, name)}
                onDialogClose={() => setEditingCompanyId(null)}
                isEditMode={true}
                isOpen={true}
              />
            ) : (
              <>
                <span 
                  className="flex-grow cursor-pointer"
                  onClick={() => onUpdateCompanyName && handleEditCompanyName(company.id, company.name)}
                >
                  {company.name || t('budget.clickToEdit')}
                </span>
                
                <div className="flex items-center">
                  {/* Remove edit icon as per user request */}
                  
                  {/* Remove company button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={() => onRemoveCompany(company.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {/* Add company button shown only on the last company */}
                  {index === companies.length - 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 mr-1"
                      onClick={() => setIsAddingCompany(true)}
                      title={t('budget.addCompany')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Show add company dialog when adding */}
          {index === companies.length - 1 && isAddingCompany && (
            <AddCompanyDialog
              onAddCompany={(name) => {
                onAddCompany(name);
                setIsAddingCompany(false);
              }}
              onDialogClose={() => setIsAddingCompany(false)}
              isOpen={true}
            />
          )}
        </TableHead>
      ))}

      {/* Show add company button in a new column if there are no companies */}
      {companies.length === 0 && (
        <TableHead className="w-32 border border-border bg-primary/10 text-center">
          <Button 
            variant="ghost"
            size="sm"
            className="w-full h-8"
            onClick={() => setIsAddingCompany(true)}
          >
            <X className="h-4 w-4 mr-1" />
            {t('budget.addCompany')}
          </Button>
          
          {isAddingCompany && (
            <AddCompanyDialog
              onAddCompany={(name) => {
                onAddCompany(name);
                setIsAddingCompany(false);
              }}
              onDialogClose={() => setIsAddingCompany(false)}
              isOpen={true}
            />
          )}
        </TableHead>
      )}

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
