export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      career_roadmaps: {
        Row: {
          created_at: string
          duration_months: number | null
          id: string
          job_title: string | null
          milestones: Json | null
          status: string | null
          target_job: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_months?: number | null
          id?: string
          job_title?: string | null
          milestones?: Json | null
          status?: string | null
          target_job?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_months?: number | null
          id?: string
          job_title?: string | null
          milestones?: Json | null
          status?: string | null
          target_job?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_strategies: {
        Row: {
          created_at: string
          expertise: string | null
          frequency: string | null
          goals: string | null
          id: string
          industry: string | null
          strategy: Json
          target_audience: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expertise?: string | null
          frequency?: string | null
          goals?: string | null
          id?: string
          industry?: string | null
          strategy: Json
          target_audience: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expertise?: string | null
          frequency?: string | null
          goals?: string | null
          id?: string
          industry?: string | null
          strategy?: Json
          target_audience?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      networking_strategies: {
        Row: {
          created_at: string
          current_job: string
          goals: string | null
          id: string
          industry: string | null
          networking_style: string | null
          strategy: Json
          target_contacts: string | null
          target_job: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_job: string
          goals?: string | null
          id?: string
          industry?: string | null
          networking_style?: string | null
          strategy: Json
          target_contacts?: string | null
          target_job?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_job?: string
          goals?: string | null
          id?: string
          industry?: string | null
          networking_style?: string | null
          strategy?: Json
          target_contacts?: string | null
          target_job?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_branding_strategies: {
        Row: {
          core_values: string[] | null
          created_at: string
          id: string
          industry: string | null
          job_title: string
          strategy: Json
          strengths: string[] | null
          target_audience: string | null
          target_role: string | null
          unique_experiences: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          core_values?: string[] | null
          created_at?: string
          id?: string
          industry?: string | null
          job_title: string
          strategy: Json
          strengths?: string[] | null
          target_audience?: string | null
          target_role?: string | null
          unique_experiences?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          core_values?: string[] | null
          created_at?: string
          id?: string
          industry?: string | null
          job_title?: string
          strategy?: Json
          strengths?: string[] | null
          target_audience?: string | null
          target_role?: string | null
          unique_experiences?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          experience_years: number | null
          full_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          target_job: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          target_job?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          target_job?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
