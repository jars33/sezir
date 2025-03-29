
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAccounts } from "@/hooks/use-accounts";
import { useTranslation } from "react-i18next";

const accountSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  project_id: z.string().min(1, { message: "Project ID is required" }),
  url: z.string().url({ message: "Please enter a valid URL" }),
  anon_key: z.string().min(1, { message: "Anon key is required" }),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAccount } = useAccounts();
  const { t } = useTranslation();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      project_id: "",
      url: "",
      anon_key: "",
    },
  });

  const onSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await addAccount(values);
      if (result) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('accounts.addNew')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounts.companyName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounts.projectId')}</FormLabel>
                  <FormControl>
                    <Input placeholder="abcdefghijklmnopqrst" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounts.supabaseUrl')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://abcdefghijklmnopqrst.supabase.co" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anon_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('accounts.anonKey')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="eyJhbGciOiJIUzI1..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
