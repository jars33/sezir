import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Company } from "@/types/budget";

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
  const [editingCompanyName, setEditingCompanyName] = useState<string>("");
  const [newCompanyName, setNewCompanyName] = useState<string>("");
  const [isAddingCompany, setIsAddingCompany] = useState<boolean>(false);
  
  // Automatically enter edit mode for empty company names
  React.useEffect(() => {
    const emptyCompany = companies.find(company => company.name === "");
    if (emptyCompany && onUpdateCompanyName) {
      setEditingCompanyId(emptyCompany.id);
      setEditingCompanyName("");
    }
  }, [companies]);
  
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

  const handleAddNewCompany = () => {
    if (newCompanyName.trim() !== "") {
      onAddCompany(newCompanyName);
      setNewCompanyName("");
      setIsAddingCompany(false);
    }
  };

  const handleCancelAddCompany = () => {
    setIsAddingCompany(false);
    setNewCompanyName("");
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
              <div className="flex items-center justify-between w-full pr-1">
                <Input
                  value={editingCompanyName}
                  onChange={(e) => setEditingCompanyName(e.target.value)}
                  className="w-full h-6 py-0 px-1 text-xs"
                  autoFocus
                  placeholder={t('budget.companyName')}
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
                  {company.name || t('budget.clickToEdit')}
                </span>
                
                <div className="flex items-center">
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
                      className="h-5 w-5 ml-1"
                      onClick={() => setIsAddingCompany(true)}
                      title={t('budget.addCompany')}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {/* Show add company form inline in the last company cell when adding */}
            {index === companies.length - 1 && isAddingCompany && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border p-2 z-10 rounded-b-md shadow-md">
                <div className="flex items-center justify-between w-full">
                  <Input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder={t('budget.companyName')}
                    className="w-full h-6 py-0 px-1 text-xs mr-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNewCompany();
                      if (e.key === 'Escape') handleCancelAddCompany();
                    }}
                  />
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={handleAddNewCompany}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={handleCancelAddCompany}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            <Plus className="h-4 w-4 mr-1" />
            {t('budget.addCompany')}
          </Button>
          
          {isAddingCompany && (
            <div className="absolute top-full left-0 right-0 bg-background border border-border p-2 z-10 rounded-b-md shadow-md">
              <div className="flex items-center justify-between w-full">
                <Input
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder={t('budget.companyName')}
                  className="w-full h-6 py-0 px-1 text-xs mr-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNewCompany();
                    if (e.key === 'Escape') handleCancelAddCompany();
                  }}
                />
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={handleAddNewCompany}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={handleCancelAddCompany}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
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
