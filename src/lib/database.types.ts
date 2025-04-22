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
        users: {
          Row: {
            id: string;
            full_name: string | null;
            role: "admin" | "user" | null;
            email: string | null;
            created_at: string | null;
          };
          Insert: {
            id: string;
            full_name?: string | null;
            role?: "admin" | "user" | null;
            email?: string | null;
            created_at?: string | null;
          };
          Update: {
            id?: string;
            full_name?: string | null;
            role?: "admin" | "user" | null;
            email?: string | null;
            created_at?: string | null;
          };
        };
  
        workspaces: {
          Row: {
            id: number;
            name: string;
            quantity: number;
            price: number;
            is_archived: boolean | null;
          };
          Insert: {
            id?: number;
            name: string;
            quantity?: number;
            price: number;
            is_archived?: boolean | null;
          };
          Update: {
            id?: number;
            name?: string;
            quantity?: number;
            price?: number;
            is_archived?: boolean | null;
          };
        };
  
        bookings: {
          Row: {
            id: number;
            user_id: string;
            workspace_id: number;
            status: string;
            start_time: string | null;
            end_time: string | null;
            guest_id: string | null;
            created_at: string | null;
            price: number | null;
          };
          Insert: {
            id?: number;
            user_id: string;
            workspace_id: number;
            status: string;
            start_time?: string | null;
            end_time?: string | null;
            guest_id?: string | null;
            created_at?: string | null;
            price?: number | null;
          };
          Update: {
            id?: number;
            user_id?: string;
            workspace_id?: number;
            status?: string;
            start_time?: string | null;
            end_time?: string | null;
            guest_id?: string | null;
            created_at?: string | null;
            price?: number | null;
          };
        };
  
        // Add other tables like booking_logs, guests if needed...
      };
    };
  }
  
