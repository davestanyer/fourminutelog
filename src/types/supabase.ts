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
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          emoji: string
          color: string
          tag: string
        }
        Insert: {
          id?: string
          name: string
          emoji: string
          color: string
          tag: string
        }
        Update: {
          id?: string
          name?: string
          emoji?: string
          color?: string
          tag?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          avatar: string
        }
        Insert: {
          id?: string
          name: string
          avatar: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string
        }
      }
    }
  }
}