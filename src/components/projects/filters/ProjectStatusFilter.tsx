
import { useState } from "react";
import { CheckIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

interface ProjectStatusFilterProps {
  selectedStatuses: string[];
  onChange: (value: string[]) => void;
}

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

export function ProjectStatusFilter({ selectedStatuses, onChange }: ProjectStatusFilterProps) {
  const [open, setOpen] = useState(false);

  const statusOptions: StatusOption[] = [
    { value: "planned", label: "Planned", color: "bg-yellow-500" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
    { value: "completed", label: "Completed", color: "bg-green-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-gray-500" },
  ];

  const handleToggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const clearFilters = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <FilterIcon className="mr-2 h-3.5 w-3.5" />
          Status
          {selectedStatuses.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {selectedStatuses.length}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Status</div>
            {selectedStatuses.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-auto p-0 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <Toggle
                key={option.value}
                variant="outline"
                className="justify-start w-full"
                pressed={selectedStatuses.includes(option.value)}
                onPressedChange={() => handleToggleStatus(option.value)}
              >
                <div className={`h-3 w-3 mr-2 rounded-full ${option.color}`} />
                <span>{option.label}</span>
                {selectedStatuses.includes(option.value) && (
                  <CheckIcon className="ml-auto h-3.5 w-3.5" />
                )}
              </Toggle>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
