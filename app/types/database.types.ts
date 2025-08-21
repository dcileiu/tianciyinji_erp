// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}

// Export all types from the main database file
export * from './database' 