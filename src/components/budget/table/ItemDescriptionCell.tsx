
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ItemDescriptionCellProps {
  description: string;
  isCategory: boolean;
  onUpdate: (description: string) => void;
  onDelete: () => void;
  onAddItem?: (parentCode: string) => void;
  parentCode?: string;
}

export const ItemDescriptionCell: React.FC<ItemDescriptionCellProps> = ({
  description,
  isCategory,
  onUpdate,
  onDelete,
  onAddItem,
  parentCode
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(description);
    }
  };

  const handleUpdate = () => {
    if (value.trim()) {
      onUpdate(value.trim());
      setIsEditing(false);
    }
  };

  const handleAddItem = () => {
    if (isCategory && onAddItem && parentCode) {
      onAddItem(parentCode);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="flex-1 p-1 border rounded"
          autoFocus
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
        />
        <Button variant="ghost" size="sm" onClick={() => {
          setIsEditing(false);
          setValue(description);
        }}>
          {t('common.cancel')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className={`${isCategory ? "font-medium" : ""} truncate`}>
        {description}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCategory && onAddItem && parentCode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddItem}
            className="h-6 w-6 p-0"
            title={t('budget.addItemToCategory')}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0"
          title={t('common.edit')}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0"
          title={t('common.delete')}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
