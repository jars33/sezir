
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const authService = {
  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null }> {
    const { data } = await supabase.auth.getSession();
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
