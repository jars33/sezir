
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCompanyDialogProps {
  onAddCompany: (name: string) => void;
}

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({ onAddCompany }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  
  const handleAddCompany = () => {
    if (companyName.trim()) {
      onAddCompany(companyName.trim());
      setOpen(false);
      setCompanyName("");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {t('budget.addCompany')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('budget.addNewCompany')}</DialogTitle>
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
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddCompany} disabled={!companyName.trim()}>
            {t('common.add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
