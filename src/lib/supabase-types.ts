export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_uid: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'admin' | 'manager' | 'staff';
          avatar_url: string | null;
          locale: string;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_uid: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: 'admin' | 'manager' | 'staff';
          avatar_url?: string | null;
          locale?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_uid?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: 'admin' | 'manager' | 'staff';
          avatar_url?: string | null;
          locale?: string;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_sales: {
        Row: {
          id: string;
          date: string;
          system_sales: string;
          actual_cash: string;
          difference: string;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          system_sales?: string;
          actual_cash?: string;
          difference?: string;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          system_sales?: string;
          actual_cash?: string;
          difference?: string;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          type: string;
          amount: string;
          date: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          type: string;
          amount: string;
          date: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          type?: string;
          amount?: string;
          date?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          phone: string | null;
          role: string;
          status: string;
          hired_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          phone?: string | null;
          role: string;
          status?: string;
          hired_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          name?: string;
          phone?: string | null;
          role?: string;
          status?: string;
          hired_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          check_in: string | null;
          check_out: string | null;
          date: string;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          check_in?: string | null;
          check_out?: string | null;
          date: string;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          check_in?: string | null;
          check_out?: string | null;
          date?: string;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consumables: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          unit: string;
          usage_rate: string | null;
          restock_level: number;
          supplier: string | null;
          last_restocked_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity?: number;
          unit?: string;
          usage_rate?: string | null;
          restock_level?: number;
          supplier?: string | null;
          last_restocked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          usage_rate?: string | null;
          restock_level?: number;
          supplier?: string | null;
          last_restocked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drinks_stock: {
        Row: {
          id: string;
          name: string;
          size: string | null;
          quantity: number;
          sold_per_day: number;
          supplier: string | null;
          last_updated: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          size?: string | null;
          quantity?: number;
          sold_per_day?: number;
          supplier?: string | null;
          last_updated?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          size?: string | null;
          quantity?: number;
          sold_per_day?: number;
          supplier?: string | null;
          last_updated?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          name: string;
          serial_number: string | null;
          category: string | null;
          cost: string;
          purchase_date: string | null;
          warranty_until: string | null;
          condition: string | null;
          notes: string | null;
          managed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          serial_number?: string | null;
          category?: string | null;
          cost?: string;
          purchase_date?: string | null;
          warranty_until?: string | null;
          condition?: string | null;
          notes?: string | null;
          managed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          serial_number?: string | null;
          category?: string | null;
          cost?: string;
          purchase_date?: string | null;
          warranty_until?: string | null;
          condition?: string | null;
          notes?: string | null;
          managed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_expenses: {
        Row: {
          id: string;
          customer_name: string | null;
          reason: string;
          order_reference: string | null;
          amount: string;
          date: string;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name?: string | null;
          reason: string;
          order_reference?: string | null;
          amount: string;
          date: string;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string | null;
          reason?: string;
          order_reference?: string | null;
          amount?: string;
          date?: string;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance: {
        Row: {
          id: string;
          item: string;
          cost: string;
          technician: string | null;
          maintenance_type: string | null;
          status: string;
          date: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item: string;
          cost: string;
          technician?: string | null;
          maintenance_type?: string | null;
          status?: string;
          date: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item?: string;
          cost?: string;
          technician?: string | null;
          maintenance_type?: string | null;
          status?: string;
          date?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      upgrades: {
        Row: {
          id: string;
          project_name: string;
          category: string | null;
          cost: string;
          description: string | null;
          status: string;
          date: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_name: string;
          category?: string | null;
          cost?: string;
          description?: string | null;
          status?: string;
          date: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_name?: string;
          category?: string | null;
          cost?: string;
          description?: string | null;
          status?: string;
          date?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string | null;
          title: string;
          message: string;
          category: string;
          priority: string;
          read_at: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id?: string | null;
          title: string;
          message: string;
          category?: string;
          priority?: string;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string | null;
          title?: string;
          message?: string;
          category?: string;
          priority?: string;
          read_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          table_name: string;
          record_id: string | null;
          operation: string;
          changed_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          table_name: string;
          record_id?: string | null;
          operation: string;
          changed_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          table_name?: string;
          record_id?: string | null;
          operation?: string;
          changed_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      fn_profit_loss_summary: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: {
          total_sales: string;
          total_expenses: string;
          total_customer_expenses: string;
          total_upgrade_expenses: string;
          total_maintenance_expenses: string;
          net_profit: string;
        }[];
      };
    };
  };
}
