
import { useState, useEffect, useCallback } from "react";
import { userAccountsService, UserAccount } from "@/services/supabase/user-accounts-service";
import { useToast } from "@/components/ui/use-toast";

export function useAccounts() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userAccountsService.getUserAccounts();
      setAccounts(data);
      
      const current = data.find(account => account.is_current) || null;
      setCurrentAccount(current);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        variant: "destructive",
        title: "Error fetching accounts",
        description: "Unable to load your accounts."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const switchAccount = useCallback(async (accountId: string) => {
    const success = await userAccountsService.switchAccount(accountId);
    if (success) {
      const newCurrent = accounts.find(acc => acc.id === accountId) || null;
      setCurrentAccount(newCurrent);
    }
    return success;
  }, [accounts]);

  const addAccount = useCallback(async (account: Omit<UserAccount, "id" | "created_at" | "is_current">) => {
    const newAccount = await userAccountsService.addAccount(account);
    if (newAccount) {
      setAccounts(prev => [...prev, newAccount]);
      toast({
        title: "Account added",
        description: `${account.name} has been added to your accounts`
      });
    }
    return newAccount;
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    currentAccount,
    loading,
    fetchAccounts,
    switchAccount,
    addAccount
  };
}
