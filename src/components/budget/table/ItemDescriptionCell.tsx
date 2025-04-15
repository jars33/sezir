
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableCell } from "@/components/ui/table";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemDescriptionCellProps {
  description: string;
  isCategory: boolean;
  onUpdate: (description: string) => void;
  onDelete: () => void;
  onAddItem?: () => void;
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
  const [isHovered, setIsHovered] = useState(false);

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
    if (isCategory && onAddItem) {
      onAddItem();
    }
  };

  return (
    <TableCell 
      className="border border-border relative w-96"  // Increased width to w-96 to provide more space
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            className="flex-1 p-1 border rounded"
            autoFocus
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={() => {
              setIsEditing(false);
              setValue(description);
            }}
            className="text-sm text-gray-500"
          >
            {t('common.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">  {/* Changed to gap-2 and flex to keep items inline */}
          <span 
            onClick={() => setIsEditing(true)}
            className={`${isCategory ? "font-medium" : ""} truncate cursor-pointer hover:bg-gray-100 px-1 rounded flex-1`}
          >
            {description}
          </span>
          
          <div className="flex items-center gap-1">  {/* Added flex container for buttons */}
            {isCategory && onAddItem && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 p-0 opacity-0 transition-opacity ${isHovered ? "opacity-100" : ""}`}
                onClick={handleAddItem}
                title={t('budget.addItemToCategory')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 p-0 opacity-0 transition-opacity ${isHovered ? "opacity-100" : ""}`}
              onClick={onDelete}
              title={t('common.delete')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </TableCell>
  );
};
