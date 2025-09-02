export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          organization_id: string | null
          role: 'owner' | 'admin' | 'member' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          organization_id?: string | null
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          organization_id?: string | null
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          organization_id: string
          name: string
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          category_id: string | null
          status: 'active' | 'inactive' | 'trial'
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          category_id?: string | null
          status?: 'active' | 'inactive' | 'trial'
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          category_id?: string | null
          status?: 'active' | 'inactive' | 'trial'
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          vendor_id: string
          name: string
          description: string | null
          cost: number
          billing_cycle: 'monthly' | 'quarterly' | 'yearly'
          currency: string
          start_date: string
          next_renewal_date: string
          status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
          user_seats: number | null
          contract_url: string | null
          auto_renew: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_id: string
          name: string
          description?: string | null
          cost: number
          billing_cycle: 'monthly' | 'quarterly' | 'yearly'
          currency?: string
          start_date: string
          next_renewal_date: string
          status?: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
          user_seats?: number | null
          contract_url?: string | null
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_id?: string
          name?: string
          description?: string | null
          cost?: number
          billing_cycle?: 'monthly' | 'quarterly' | 'yearly'
          currency?: string
          start_date?: string
          next_renewal_date?: string
          status?: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired'
          user_seats?: number | null
          contract_url?: string | null
          auto_renew?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          vendor_id: string | null
          subscription_id: string | null
          name: string
          description: string | null
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vendor_id?: string | null
          subscription_id?: string | null
          name: string
          description?: string | null
          file_path: string
          file_size: number
          mime_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vendor_id?: string | null
          subscription_id?: string | null
          name?: string
          description?: string | null
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      renewals: {
        Row: {
          id: string
          subscription_id: string
          previous_cost: number
          new_cost: number
          previous_renewal_date: string
          new_renewal_date: string
          status: 'pending' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          previous_cost: number
          new_cost: number
          previous_renewal_date: string
          new_renewal_date: string
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          previous_cost?: number
          new_cost?: number
          previous_renewal_date?: string
          new_renewal_date?: string
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      vendor_summary: {
        Row: {
          id: string
          name: string
          status: string
          subscriptions_count: number
          total_cost: number
        }
      }
      upcoming_renewals: {
        Row: {
          id: string
          name: string
          vendor_name: string
          cost: number
          next_renewal_date: string
          days_until_renewal: number
        }
      }
    }
    Functions: {
      initialize_user_organization: {
        Args: {
          org_name: string
          user_full_name?: string
        }
        Returns: string
      }
      get_organization_spending: {
        Args: {
          org_id: string
        }
        Returns: {
          total_monthly_cost: number
          total_yearly_cost: number
          active_subscriptions: number
          total_vendors: number
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