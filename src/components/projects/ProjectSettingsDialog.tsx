
import { useState, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const projectSettingsSchema = z.object({
  overheadPercentage: z.coerce
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100")
    .refine(
      (value) => {
        // Check if the decimal part is valid (0, 0.5, or 0.0)
        const decimalPart = value % 1;
        return decimalPart === 0 || decimalPart === 0.5 || decimalPart === 0.1;
      },
      {
        message: "Decimal values must be in increments of 0.1 or 0.5",
      }
    ),
});

type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;

export function ProjectSettingsDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { getOverheadPercentage, updateOverheadPercentage, loading } = useProjectSettings();
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  const form = useForm<ProjectSettingsFormValues>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      overheadPercentage: getOverheadPercentage(selectedYear),
    },
  });
  
  const updateFormValues = useCallback(() => {
    if (!loading) {
      const currentValue = getOverheadPercentage(selectedYear);
      form.setValue("overheadPercentage", currentValue);
    }
  }, [selectedYear, loading, form, getOverheadPercentage]);
  
  useEffect(() => {
    updateFormValues();
  }, [selectedYear, loading, updateFormValues, open]);
  
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateFormValues();
  };
  
  const onSubmit = async (data: ProjectSettingsFormValues) => {
    await updateOverheadPercentage(selectedYear, data.overheadPercentage);
    toast.success(`Overhead percentage for ${selectedYear} updated to ${data.overheadPercentage}%`);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title={t('project.settings')}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('project.settings')}</DialogTitle>
          <DialogDescription>
            {t('project.configureSettings')}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-sm font-medium">{t('project.year')}</div>
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
                      <FormLabel>{t('project.overheadPercentage')} {selectedYear}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('project.overheadDescription')} {selectedYear}.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">{t('project.saveSettings')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
