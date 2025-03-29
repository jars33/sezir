
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface UserAccount {
  id: string;
  name: string;
  project_id: string;
  url: string;
  anon_key: string;
  is_current: boolean;
  created_at: string;
}

export const userAccountsService = {
  /**
   * Get all user accounts
   */
  async getUserAccounts(): Promise<UserAccount[]> {
    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching user accounts:", error);
      return [];
    }
  },

  /**
   * Get the current user account
   */
  async getCurrentAccount(): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching current account:", error);
      return null;
    }
  },

  /**
   * Switch to a different account
   */
  async switchAccount(accountId: string): Promise<boolean> {
    try {
      // First, set all accounts to not current
      const { error: resetError } = await supabase
        .from("user_accounts")
        .update({ is_current: false })
        .neq("id", "none"); // Update all accounts

      if (resetError) throw resetError;

      // Then set the selected account as current
      const { error: updateError } = await supabase
        .from("user_accounts")
        .update({ is_current: true })
        .eq("id", accountId);

      if (updateError) throw updateError;

      // Reload the page to apply the new Supabase connection
      window.location.reload();
      return true;
    } catch (error: any) {
      console.error("Error switching accounts:", error);
      toast({
        variant: "destructive",
        title: "Error switching accounts",
        description: error.message || "An error occurred while switching accounts"
      });
      return false;
    }
  },

  /**
   * Add a new account
   */
  async addAccount(account: Omit<UserAccount, "id" | "created_at" | "is_current">): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .insert({
          ...account,
          is_current: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error adding account:", error);
      toast({
        variant: "destructive",
        title: "Error adding account",
        description: error.message || "An error occurred while adding the account"
      });
      return null;
    }
  }
};
