
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddCompanyDialogProps {
  onAddCompany: (name: string) => void;
  onDialogClose?: () => void;
  isOpen?: boolean;
  initialName?: string;
  isEditMode?: boolean;
}

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({ 
  onAddCompany, 
  onDialogClose, 
  isOpen: externalOpen, 
  initialName = "", 
  isEditMode = false 
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(externalOpen || false);
  const [companyName, setCompanyName] = useState(initialName);
  
  // Update state when external open state changes
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);
  
  // Update company name when initialName changes
  useEffect(() => {
    setCompanyName(initialName);
  }, [initialName]);
  
  const handleAddCompany = () => {
    if (companyName.trim()) {
      onAddCompany(companyName.trim());
      setOpen(false);
      setCompanyName("");
    }
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onDialogClose) {
      onDialogClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!externalOpen && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            {t('budget.addCompany')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('budget.editCompany') : t('budget.addNewCompany')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="companyName" className="text-right">
              {t('common.name')}
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCompany();
                if (e.key === 'Escape') handleOpenChange(false);
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddCompany} disabled={!companyName.trim()}>
            {isEditMode ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
