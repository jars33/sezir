
import React, { useState } from "react";
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
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span 
        onClick={() => setIsEditing(true)}
        className={`${isCategory ? "font-medium" : ""} truncate cursor-pointer hover:bg-gray-100 px-1 rounded`}
      >
        {description}
      </span>
      <div className="flex gap-1">
        {isCategory && onAddItem && parentCode && (
          <button 
            onClick={handleAddItem}
            className="h-6 w-6 p-0"
            title={t('budget.addItemToCategory')}
          >
            +
          </button>
        )}
        <button
          onClick={onDelete}
          className="h-6 w-6 p-0"
          title={t('common.delete')}
        >
          ×
        </button>
      </div>
    </div>
  );
};
