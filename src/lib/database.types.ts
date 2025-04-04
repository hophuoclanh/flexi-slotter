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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
        }
      }
      workspaces: {
        Row: {
          id: number;
          name: string;
          capacity: number;
          quantity: number;
        }
        Insert: {
          id?: number;
          name: string;
          capacity: number;
          quantity?: number;
        }
        Update: {
          id?: number;
          name?: string;
          capacity?: number;
          quantity?: number;
        }
      }
      bookings: {
        Row: {
          id: number
          user_id: string
          workspace_id: number
          status: string
          start_time: string | null
          end_time: string | null
          no_show: boolean
        }
        Insert: {
          id?: number
          user_id: string
          workspace_id: number
          status: string
          start_time?: string | null
          end_time?: string | null
          no_show?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          workspace_id?: number
          status?: string
          start_time?: string | null
          end_time?: string | null
          no_show?: boolean
        }
      }
    }
  }
}
