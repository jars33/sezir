
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check } from "lucide-react";

interface ItemDescriptionCellProps {
  description: string;
  isCategory: boolean;
  onUpdate: (description: string) => void;
  onDelete: () => void;
}

export const ItemDescriptionCell: React.FC<ItemDescriptionCellProps> = ({
  description,
  isCategory,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingDescription, setEditingDescription] = useState(description);
  
  const handleEdit = () => {
    setEditingDescription(description);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onUpdate(editingDescription);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Textarea 
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            className="min-h-[30px] py-1 text-base"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSave();
              }
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="h-7 w-7"
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-7 w-7"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span 
            className={`${isCategory ? "ml-0" : "ml-4"} cursor-pointer flex-grow`}
            onClick={handleEdit}
          >
            {description}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onDelete}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </>
      )}
    </div>
  );
};
