import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Recette {
  id: string
  titre: string
  ingredients: string
  instructions: string
  categorie?: string
  date_creation: string
  created_at: string
}

export interface Invite {
  id: string
  nom: string
  created_at: string
}

export interface Repas {
  id: string
  date: string
  commentaire?: string
  created_at: string
}

export interface RepasWithDetails extends Repas {
  invites: Invite[]
  recettes: Recette[]
}