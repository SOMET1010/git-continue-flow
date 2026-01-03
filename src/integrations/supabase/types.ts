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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_code: string | null
          created_at: string
          id: number
          is_active: boolean | null
          total_enrollments: number | null
          user_id: number
          zone: string | null
        }
        Insert: {
          agent_code?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          total_enrollments?: number | null
          user_id: number
          zone?: string | null
        }
        Update: {
          agent_code?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          total_enrollments?: number | null
          user_id?: number
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_stock: {
        Row: {
          created_at: string
          id: number
          last_restocked: string | null
          merchant_id: number
          min_threshold: number | null
          product_id: number
          quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_restocked?: string | null
          merchant_id: number
          min_threshold?: number | null
          product_id: number
          quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          last_restocked?: string | null
          merchant_id?: number
          min_threshold?: number | null
          product_id?: number
          quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_stock_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          activity_type: string | null
          business_name: string | null
          cmu_expiry: string | null
          cmu_number: string | null
          cnps_expiry: string | null
          cnps_number: string | null
          created_at: string
          enrolled_at: string | null
          enrolled_by: number | null
          id: number
          is_active: boolean | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          market_id: number | null
          merchant_number: string | null
          rsti_expiry: string | null
          rsti_number: string | null
          suta_score: number | null
          updated_at: string
          user_id: number
        }
        Insert: {
          activity_type?: string | null
          business_name?: string | null
          cmu_expiry?: string | null
          cmu_number?: string | null
          cnps_expiry?: string | null
          cnps_number?: string | null
          created_at?: string
          enrolled_at?: string | null
          enrolled_by?: number | null
          id?: number
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          market_id?: number | null
          merchant_number?: string | null
          rsti_expiry?: string | null
          rsti_number?: string | null
          suta_score?: number | null
          updated_at?: string
          user_id: number
        }
        Update: {
          activity_type?: string | null
          business_name?: string | null
          cmu_expiry?: string | null
          cmu_number?: string | null
          cnps_expiry?: string | null
          cnps_number?: string | null
          created_at?: string
          enrolled_at?: string | null
          enrolled_by?: number | null
          id?: number
          is_active?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          market_id?: number | null
          merchant_number?: string | null
          rsti_expiry?: string | null
          rsti_number?: string | null
          suta_score?: number | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          name_dioula: string | null
          pictogram_url: string | null
          unit: string
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_dioula?: string | null
          pictogram_url?: string | null
          unit?: string
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_dioula?: string | null
          pictogram_url?: string | null
          unit?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          id: number
          is_synced: boolean | null
          merchant_id: number
          payment_method: string | null
          product_id: number | null
          product_name: string | null
          quantity: number
          sale_date: string
          total_amount: number
          unit_price: number
          voice_input: boolean | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_synced?: boolean | null
          merchant_id: number
          payment_method?: string | null
          product_id?: number | null
          product_name?: string | null
          quantity: number
          sale_date?: string
          total_amount: number
          unit_price: number
          voice_input?: boolean | null
        }
        Update: {
          created_at?: string
          id?: number
          is_synced?: boolean | null
          merchant_id?: number
          payment_method?: string | null
          product_id?: number | null
          product_name?: string | null
          quantity?: number
          sale_date?: string
          total_amount?: number
          unit_price?: number
          voice_input?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number | null
          deadline: string | null
          id: number
          is_completed: boolean | null
          merchant_id: number
          name: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: number
          is_completed?: boolean | null
          merchant_id: number
          name: string
          target_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: number
          is_completed?: boolean | null
          merchant_id?: number
          name?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: number
          is_active: boolean
          language: string
          last_signed_in: string
          login_method: string | null
          name: string | null
          open_id: string
          phone: string | null
          phone_verified: boolean | null
          pin_code: string | null
          pin_failed_attempts: number | null
          pin_locked_until: string | null
          profile_photo_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          language?: string
          last_signed_in?: string
          login_method?: string | null
          name?: string | null
          open_id: string
          phone?: string | null
          phone_verified?: boolean | null
          pin_code?: string | null
          pin_failed_attempts?: number | null
          pin_locked_until?: string | null
          profile_photo_url?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          language?: string
          last_signed_in?: string
          login_method?: string | null
          name?: string | null
          open_id?: string
          phone?: string | null
          phone_verified?: boolean | null
          pin_code?: string | null
          pin_failed_attempts?: number | null
          pin_locked_until?: string | null
          profile_photo_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agent" | "merchant" | "cooperative"
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
    Enums: {
      app_role: ["admin", "agent", "merchant", "cooperative"],
    },
  },
} as const
