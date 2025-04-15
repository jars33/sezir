
import React, { useState, useEffect, useRef } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

interface InlineItemCreationProps {
  parentCode?: string;
  companiesCount: number;
  onAddItem: (description: string) => void;
  onCancel: () => void;
  isCategory?: boolean;
}

export const InlineItemCreation: React.FC<InlineItemCreationProps> = ({ 
  parentCode, 
  companiesCount, 
  onAddItem,
  onCancel,
  isCategory = false
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && description.trim()) {
      onAddItem(description.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (description.trim()) {
      onAddItem(description.trim());
    }
  };

  const displayCode = isCategory ? "X" : `${parentCode}.X`;

  return (
    <TableRow className={`${isCategory ? "bg-muted/50" : "bg-muted/5 border-l-2 border-l-primary"}`}>
      <TableCell className="border border-border text-center text-xs text-muted-foreground">
        {displayCode}
      </TableCell>
      <TableCell className="border border-border">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('budget.description')}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="px-2"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onCancel}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      
      {/* Empty cells for companies and other columns */}
      <TableCell colSpan={companiesCount} className="border border-border"></TableCell>
      <TableCell colSpan={2} className="border border-border"></TableCell>
      <TableCell className="border border-border"></TableCell>
    </TableRow>
  );
};
