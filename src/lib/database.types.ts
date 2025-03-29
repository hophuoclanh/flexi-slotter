
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
          id: number
          name: string
          capacity: number
        }
        Insert: {
          id?: number
          name: string
          capacity: number
        }
        Update: {
          id?: number
          name?: string
          capacity?: number
        }
      }
      slots: {
        Row: {
          id: number
          slot_date: string
          slot_time: string
          workspace_id: number
          status: string
        }
        Insert: {
          id?: number
          slot_date: string
          slot_time: string
          workspace_id: number
          status: string
        }
        Update: {
          id?: number
          slot_date?: string
          slot_time?: string
          workspace_id?: number
          status?: string
        }
      }
      bookings: {
        Row: {
          id: number
          user_id: string
          workspace_id: number
          slot_id: number
          status: string
          check_in_time: string | null
          check_out_time: string | null
          no_show: boolean
        }
        Insert: {
          id?: number
          user_id: string
          workspace_id: number
          slot_id: number
          status: string
          check_in_time?: string | null
          check_out_time?: string | null
          no_show?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          workspace_id?: number
          slot_id?: number
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          no_show?: boolean
        }
      }
    }
  }
}
