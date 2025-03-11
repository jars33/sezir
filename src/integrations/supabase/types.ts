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
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_archived: boolean
          is_deleted: boolean
          is_read: boolean
          is_starred: boolean
          preview: string
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          is_read?: boolean
          is_starred?: boolean
          preview: string
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          is_read?: boolean
          is_starred?: boolean
          preview?: string
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
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
      employee_type: "contract" | "external"
      project_status: "planned" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
