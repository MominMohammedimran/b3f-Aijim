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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          city: string
          country: string | null
          created_at: string | null
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string
          state: string
          updated_at: string | null
          user_id: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          country?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone: string
          state: string
          updated_at?: string | null
          user_id: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          country?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string
          state?: string
          updated_at?: string | null
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string | null
          id: number
          note: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          note?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          note?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          business_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          delivery_fee: number | null
          id: number
          min_order_amount: number | null
          site_description: string | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          id?: number
          min_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          id?: number
          min_order_amount?: number | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image: string | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image?: string | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          code: string | null
          color: string | null
          created_at: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string
          price: number
          product_id: string
          sizes: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name: string
          price: number
          product_id: string
          sizes?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          product_id?: string
          sizes?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_order_amount: number | null
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string
          valid_to: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      designs: {
        Row: {
          created_at: string | null
          design_data: Json | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          design_data?: Json | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          design_data?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      global_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          coupon_code: Json | null
          courier: Json | null
          created_at: string | null
          delivery_fee: number | null
          discount_applied: number | null
          id: string
          items: Json
          order_issue: Json | null
          order_number: string
          payment_details: string | null
          payment_issue: Json | null
          payment_method: string | null
          payment_status: string | null
          reward_points_earned: number | null
          reward_points_used: Json | null
          shipping_address: Json | null
          status: string | null
          status_note: string | null
          total: number
          trackingNote: string | null
          updated_at: string | null
          upi_input: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          coupon_code?: Json | null
          courier?: Json | null
          created_at?: string | null
          delivery_fee?: number | null
          discount_applied?: number | null
          id?: string
          items: Json
          order_issue?: Json | null
          order_number: string
          payment_details?: string | null
          payment_issue?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          reward_points_earned?: number | null
          reward_points_used?: Json | null
          shipping_address?: Json | null
          status?: string | null
          status_note?: string | null
          total: number
          trackingNote?: string | null
          updated_at?: string | null
          upi_input?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: Json | null
          courier?: Json | null
          created_at?: string | null
          delivery_fee?: number | null
          discount_applied?: number | null
          id?: string
          items?: Json
          order_issue?: Json | null
          order_number?: string
          payment_details?: string | null
          payment_issue?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          reward_points_earned?: number | null
          reward_points_used?: Json | null
          shipping_address?: Json | null
          status?: string | null
          status_note?: string | null
          total?: number
          trackingNote?: string | null
          updated_at?: string | null
          upi_input?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_issues: {
        Row: {
          admin_response: string | null
          admin_uploaded_image: string | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string
          phone_number: string | null
          reason: string
          screenshot_url: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          admin_response?: string | null
          admin_uploaded_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id: string
          phone_number?: string | null
          reason: string
          screenshot_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          admin_response?: string | null
          admin_uploaded_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string
          phone_number?: string | null
          reason?: string
          screenshot_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_email?: string
          user_name?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          created_at: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          image: string | null
          images: Json | null
          is_active: boolean | null
          name: string
          original_price: number
          price: number
          rating: number | null
          seo_keywords: Json | null
          sizes: Json | null
          slug: string
          stock: number | null
          tags: Json | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          category: string
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          images?: Json | null
          is_active?: boolean | null
          name: string
          original_price: number
          price: number
          rating?: number | null
          seo_keywords?: Json | null
          sizes?: Json | null
          slug: string
          stock?: number | null
          tags?: Json | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          category?: string
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image?: string | null
          images?: Json | null
          is_active?: boolean | null
          name?: string
          original_price?: number
          price?: number
          rating?: number | null
          seo_keywords?: Json | null
          sizes?: Json | null
          slug?: string
          stock?: number | null
          tags?: Json | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          device_token: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          referral_campaign: string | null
          referral_source: string | null
          reward_points: number | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          device_token?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          referral_campaign?: string | null
          referral_source?: string | null
          reward_points?: number | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          device_token?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          referral_campaign?: string | null
          referral_source?: string | null
          reward_points?: number | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          review_images: Json | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          review_images?: Json | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          review_images?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_settings: {
        Args: never
        Returns: {
          business_address: string
          contact_email: string
          contact_phone: string
          delivery_fee: number
          min_order_amount: number
          site_description: string
          site_name: string
        }[]
      }
      get_admin_user_by_email: {
        Args: { user_email: string }
        Returns: {
          email: string
          id: string
          permissions: Json
          role: string
        }[]
      }
      is_admin: { Args: { user_email: string }; Returns: boolean }
      update_admin_settings: {
        Args: {
          p_business_address: string
          p_contact_email: string
          p_contact_phone: string
          p_delivery_fee: number
          p_min_order_amount: number
          p_site_description: string
          p_site_name: string
        }
        Returns: undefined
      }
      update_payment_status: {
        Args: { order_id: string; status: string }
        Returns: boolean
      }
      update_user_reward_points: {
        Args: { points_to_add: number; user_id: string }
        Returns: undefined
      }
      validate_coupon:
        | {
            Args: { cart_total: number; coupon_code_input: string }
            Returns: {
              coupon_id: string
              discount_amount: number
              message: string
              valid: boolean
            }[]
          }
        | {
            Args: {
              cart_total: number
              coupon_code_input: string
              user_id_input?: string
            }
            Returns: {
              coupon_id: string
              discount_amount: number
              message: string
              valid: boolean
            }[]
          }
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
