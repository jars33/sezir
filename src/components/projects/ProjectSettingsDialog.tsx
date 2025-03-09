
import { useState } from "react";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectSettings } from "@/hooks/use-project-settings";
import { toast } from "sonner";

// Define form schema for project settings
const projectSettingsSchema = z.object({
  overheadPercentage: z.coerce
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100"),
});

type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;

export function ProjectSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { getOverheadPercentage, updateOverheadPercentage } = useProjectSettings();
  
  // Get available years (current year and 4 years in the future)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  // Initialize form with current settings for the selected year
  const form = useForm<ProjectSettingsFormValues>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      overheadPercentage: getOverheadPercentage(selectedYear),
    },
  });
  
  // Update form when year changes
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    form.setValue("overheadPercentage", getOverheadPercentage(year));
  };
  
  const onSubmit = (data: ProjectSettingsFormValues) => {
    updateOverheadPercentage(selectedYear, data.overheadPercentage);
    toast.success(`Overhead percentage for ${selectedYear} updated to ${data.overheadPercentage}%`);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure global project settings like overhead percentages per year.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <FormLabel>Year</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {years.map(year => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => handleYearChange(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="overheadPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overhead Percentage for {selectedYear}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This percentage will be applied to all projects started in {selectedYear}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
