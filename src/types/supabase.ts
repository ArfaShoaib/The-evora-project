export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: 'customer' | 'admin';
          avatar_url: string | null;
          phone: string | null;
          address_line1: string | null;
          city: string | null;
          postal_code: string | null;
          alternate_email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          city?: string | null;
          postal_code?: string | null;
          alternate_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          city?: string | null;
          postal_code?: string | null;
          alternate_email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          description: string | null;
          parent_id: string | null;
          variation_fields: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          description?: string | null;
          parent_id?: string | null;
          variation_fields?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image_url?: string | null;
          description?: string | null;
          parent_id?: string | null;
          variation_fields?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          sale_price: number | null;
          sku: string;
          images: string[];
          thumbnail: string | null;
          status: 'draft' | 'published' | 'archived';
          stock: number;
          rating: number | null;
          review_count: number;
          is_new: boolean;
          is_best_seller: boolean;
          is_trending: boolean;
          colors: Json;
          sizes: string[];
          collection: string | null;
          collection_id: string | null;
          category: string | null;
          subcategory: string | null;
          variations: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          sale_price?: number | null;
          sku: string;
          images?: string[];
          thumbnail?: string | null;
          status?: 'draft' | 'published' | 'archived';
          stock?: number;
          rating?: number | null;
          review_count?: number;
          is_new?: boolean;
          is_best_seller?: boolean;
          is_trending?: boolean;
          colors?: Json;
          sizes?: string[];
          collection?: string | null;
          collection_id?: string | null;
          category?: string | null;
          subcategory?: string | null;
          variations?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          sale_price?: number | null;
          sku?: string;
          images?: string[];
          thumbnail?: string | null;
          status?: 'draft' | 'published' | 'archived';
          stock?: number;
          rating?: number | null;
          review_count?: number;
          is_new?: boolean;
          is_best_seller?: boolean;
          is_trending?: boolean;
          colors?: Json;
          sizes?: string[];
          collection?: string | null;
          collection_id?: string | null;
          category?: string | null;
          subcategory?: string | null;
          variations?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_collection_id_fkey';
            columns: ['collection_id'];
            isOneToOne: false;
            referencedRelation: 'collections';
            referencedColumns: ['id'];
          }
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string | null;
          color: string | null;
          color_hex: string | null;
          material: string | null;
          volume: string | null;
          fit: string | null;
          neckline: string | null;
          pattern: string | null;
          embroidery: string | null;
          sleeve_length: string | null;
          dupatta: string | null;
          dial_color: string | null;
          movement: string | null;
          target: string | null;
          fragrance_notes: string | null;
          attributes: Record<string, string> | null;
          image_url: string | null;
          stock: number;
          price_modifier: number;
          sku: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size?: string | null;
          color?: string | null;
          color_hex?: string | null;
          material?: string | null;
          volume?: string | null;
          fit?: string | null;
          neckline?: string | null;
          pattern?: string | null;
          embroidery?: string | null;
          sleeve_length?: string | null;
          dupatta?: string | null;
          dial_color?: string | null;
          movement?: string | null;
          target?: string | null;
          fragrance_notes?: string | null;
          attributes?: Record<string, string> | null;
          image_url?: string | null;
          stock?: number;
          price_modifier?: number;
          sku?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string | null;
          color?: string | null;
          color_hex?: string | null;
          material?: string | null;
          volume?: string | null;
          fit?: string | null;
          neckline?: string | null;
          pattern?: string | null;
          embroidery?: string | null;
          sleeve_length?: string | null;
          dupatta?: string | null;
          dial_color?: string | null;
          movement?: string | null;
          target?: string | null;
          fragrance_notes?: string | null;
          attributes?: Record<string, string> | null;
          image_url?: string | null;
          stock?: number;
          price_modifier?: number;
          sku?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_email: string | null;
          coupon_id: string | null;
          coupon_code: string | null;
          discount_amount: number;
          total_price: number;
          status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          shipping_address: Json;
          billing_address: Json | null;
          payment_method: string | null;
          courier_name: string | null;
          tracking_number: string | null;
          refund_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_email?: string | null;
          coupon_id?: string | null;
          coupon_code?: string | null;
          discount_amount?: number;
          total_price: number;
          status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          shipping_address: Json;
          billing_address?: Json | null;
          payment_method?: string | null;
          courier_name?: string | null;
          tracking_number?: string | null;
          refund_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_email?: string | null;
          coupon_id?: string | null;
          coupon_code?: string | null;
          discount_amount?: number;
          total_price?: number;
          status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          shipping_address?: Json;
          billing_address?: Json | null;
          payment_method?: string | null;
          courier_name?: string | null;
          tracking_number?: string | null;
          refund_status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_coupon_id_fkey';
            columns: ['coupon_id'];
            isOneToOne: false;
            referencedRelation: 'coupons';
            referencedColumns: ['id'];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          quantity?: number;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          review: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          review?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          review?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      refunds: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          amount: number;
          reason: string;
          status: string;
          admin_notes: string | null;
          rejection_reason: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          amount: number;
          reason: string;
          status?: string;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          amount?: number;
          reason?: string;
          status?: string;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'refunds_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'refunds_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'wishlists_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_order_value: number | null;
          is_active: boolean;
          usage_limit: number | null;
          used_count: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_order_value?: number | null;
          is_active?: boolean;
          usage_limit?: number | null;
          used_count?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          min_order_value?: number | null;
          is_active?: boolean;
          usage_limit?: number | null;
          used_count?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          id: string;
          section_key: string;
          content: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          content?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_key?: string;
          content?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      hero_banners: {
        Row: {
          id: string;
          image_url: string;
          heading: string;
          subheading: string | null;
          cta_text: string;
          collection_id: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          heading: string;
          subheading?: string | null;
          cta_text?: string;
          collection_id: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          heading?: string;
          subheading?: string | null;
          cta_text?: string;
          collection_id?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hero_banners_collection_id_fkey';
            columns: ['collection_id'];
            isOneToOne: false;
            referencedRelation: 'collections';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      delete_user: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}
