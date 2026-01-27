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
      bills: {
        Row: {
          amount: number
          bill_type: string
          created_at: string
          created_by: string
          due_date: string
          id: string
          month: string
          status: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          bill_type: string
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          month: string
          status?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          bill_type?: string
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          month?: string
          status?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          resolved_at: string | null
          room_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          resolved_at?: string | null
          room_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          resolved_at?: string | null
          room_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_menus: {
        Row: {
          breakfast: Json | null
          created_at: string
          created_by: string
          date: string
          dinner: Json | null
          id: string
          lunch: Json | null
          snacks: Json | null
          updated_at: string
        }
        Insert: {
          breakfast?: Json | null
          created_at?: string
          created_by: string
          date?: string
          dinner?: Json | null
          id?: string
          lunch?: Json | null
          snacks?: Json | null
          updated_at?: string
        }
        Update: {
          breakfast?: Json | null
          created_at?: string
          created_by?: string
          date?: string
          dinner?: Json | null
          id?: string
          lunch?: Json | null
          snacks?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      food_poll_ratings: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_poll_ratings_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "food_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      food_poll_votes: {
        Row: {
          created_at: string
          id: string
          option: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "food_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      food_polls: {
        Row: {
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          is_active: boolean
          options: Json
          question: string
        }
        Insert: {
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options: Json
          question: string
        }
        Update: {
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          question?: string
        }
        Relationships: []
      }
      laundry_bookings: {
        Row: {
          booking_date: string
          created_at: string
          id: string
          machine: string
          status: string
          time_slot: string
          user_id: string
        }
        Insert: {
          booking_date?: string
          created_at?: string
          id?: string
          machine: string
          status?: string
          time_slot: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          id?: string
          machine?: string
          status?: string
          time_slot?: string
          user_id?: string
        }
        Relationships: []
      }
      lost_found_items: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          item_name: string
          location_found: string
          status: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          item_name: string
          location_found: string
          status?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          item_name?: string
          location_found?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          room_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          room_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          room_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          end_date: string
          id: string
          package_type: string
          payment_method: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string
          end_date: string
          id?: string
          package_type: string
          payment_method: string
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          end_date?: string
          id?: string
          package_type?: string
          payment_method?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          course: string | null
          created_at: string
          id: string
          mobile: string
          name: string
          occupation: string
          photo_url: string | null
          room_number: string | null
          updated_at: string
          user_id: string
          work_type: string | null
          year: string | null
        }
        Insert: {
          course?: string | null
          created_at?: string
          id?: string
          mobile: string
          name: string
          occupation: string
          photo_url?: string | null
          room_number?: string | null
          updated_at?: string
          user_id: string
          work_type?: string | null
          year?: string | null
        }
        Update: {
          course?: string | null
          created_at?: string
          id?: string
          mobile?: string
          name?: string
          occupation?: string
          photo_url?: string | null
          room_number?: string | null
          updated_at?: string
          user_id?: string
          work_type?: string | null
          year?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "head" | "guest"
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
      app_role: ["head", "guest"],
    },
  },
} as const
