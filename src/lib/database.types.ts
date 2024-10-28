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
      activity_cards: {
        Row: {
          id: string
          user_id: string
          date: string
          last_updated: string
          what_i_did: Json[]
          what_broke: string[]
          how_i_fixed: string[]
          tasks_for_tomorrow: string[]
          admin_time: number
          meeting_time: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          last_updated: string
          what_i_did?: Json[]
          what_broke?: string[]
          how_i_fixed?: string[]
          tasks_for_tomorrow?: string[]
          admin_time?: number
          meeting_time?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          last_updated?: string
          what_i_did?: Json[]
          what_broke?: string[]
          how_i_fixed?: string[]
          tasks_for_tomorrow?: string[]
          admin_time?: number
          meeting_time?: number
          created_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          emoji: string
          color: string
          tag: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          emoji: string
          color: string
          tag: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          emoji?: string
          color?: string
          tag?: string
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          name: string
          avatar: string
          default_client_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          avatar: string
          default_client_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          avatar?: string
          default_client_id?: string | null
          created_at?: string | null
        }
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
  }
}