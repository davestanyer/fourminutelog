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
  }
}