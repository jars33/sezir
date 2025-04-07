export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budget_companies: {
        Row: {
          budget_comparison_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          budget_comparison_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          budget_comparison_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_companies_budget_comparison_id_fkey"
            columns: ["budget_comparison_id"]
            isOneToOne: false
            referencedRelation: "budget_comparisons"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_comparisons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_comparisons_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_comparison_id: string | null
          code: string
          created_at: string
          description: string
          id: string
          item_type: Database["public"]["Enums"]["budget_item_type"]
          observations: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          budget_comparison_id?: string | null
          code: string
          created_at?: string
          description: string
          id?: string
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          observations?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          budget_comparison_id?: string | null
          code?: string
          created_at?: string
          description?: string
          id?: string
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          observations?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_comparison_id_fkey"
            columns: ["budget_comparison_id"]
            isOneToOne: false
            referencedRelation: "budget_comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_prices: {
        Row: {
          budget_item_id: string
          company_id: string
          created_at: string
          id: string
          price: number
          updated_at: string
        }
        Insert: {
          budget_item_id: string
          company_id: string
          created_at?: string
          id?: string
          price?: number
          updated_at?: string
        }
        Update: {
          budget_item_id?: string
          company_id?: string
          created_at?: string
          id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_prices_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "budget_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          project_id: string
          start_date: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          project_id: string
          start_date: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          project_id?: string
          start_date?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      project_member_allocations: {
        Row: {
          allocation_percentage: number
          created_at: string
          id: string
          month: string
          project_assignment_id: string
          updated_at: string
        }
        Insert: {
          allocation_percentage: number
          created_at?: string
          id?: string
          month: string
          project_assignment_id: string
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number
          created_at?: string
          id?: string
          month?: string
          project_assignment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_member_allocations_project_assignment_id_fkey"
            columns: ["project_assignment_id"]
            isOneToOne: false
            referencedRelation: "project_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      project_overhead_settings: {
        Row: {
          created_at: string
          id: string
          percentage: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          percentage?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          percentage?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      project_revenues: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          project_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          month: string
          project_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_revenues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_variable_costs: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          month: string
          project_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          month: string
          project_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          month?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_variable_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          number: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          number: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          number?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_history: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date?: string | null
          id?: string
          start_date: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_history_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          company_email: string | null
          company_phone: string | null
          created_at: string
          end_date: string | null
          id: string
          left_company: boolean
          name: string
          personal_email: string | null
          personal_phone: string | null
          start_date: string
          type: Database["public"]["Enums"]["employee_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_email?: string | null
          company_phone?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          left_company?: boolean
          name: string
          personal_email?: string | null
          personal_phone?: string | null
          start_date: string
          type: Database["public"]["Enums"]["employee_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_email?: string | null
          company_phone?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          left_company?: boolean
          name?: string
          personal_email?: string | null
          personal_phone?: string | null
          start_date?: string
          type?: Database["public"]["Enums"]["employee_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          team_id: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          parent_team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          parent_team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          parent_team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_salary_and_update_previous: {
        Args: {
          p_team_member_id: string
          p_amount: number
          p_start_date: string
          p_end_date?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      budget_item_type: "category" | "item"
      employee_type: "contract" | "external"
      project_status: "planned" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      budget_item_type: ["category", "item"],
      employee_type: ["contract", "external"],
      project_status: ["planned", "in_progress", "completed", "cancelled"],
    },
  },
} as const
