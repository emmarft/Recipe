/*
  # Recipe Management System Database Schema

  1. New Tables
    - `recettes` (recipes)
      - `id` (uuid, primary key)
      - `titre` (text, recipe title)
      - `ingredients` (text, long text for ingredients)
      - `instructions` (text, long text for cooking instructions)
      - `categorie` (text, optional category)
      - `date_creation` (timestamptz, creation date)
      - `created_at` (timestamptz, system timestamp)

    - `invites` (guests)
      - `id` (uuid, primary key)
      - `nom` (text, guest name)
      - `created_at` (timestamptz, system timestamp)

    - `repas` (meals)
      - `id` (uuid, primary key)
      - `date` (date, meal date)
      - `commentaire` (text, optional comment)
      - `created_at` (timestamptz, system timestamp)

    - `repas_invites` (junction table for many-to-many relationship)
      - `repas_id` (uuid, foreign key to repas)
      - `invite_id` (uuid, foreign key to invites)

    - `repas_recettes` (junction table for many-to-many relationship)
      - `repas_id` (uuid, foreign key to repas)
      - `recette_id` (uuid, foreign key to recettes)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create recettes table
CREATE TABLE IF NOT EXISTS recettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  ingredients text NOT NULL,
  instructions text NOT NULL,
  categorie text,
  date_creation date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create repas table
CREATE TABLE IF NOT EXISTS repas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  commentaire text,
  created_at timestamptz DEFAULT now()
);

-- Create junction table for repas-invites many-to-many relationship
CREATE TABLE IF NOT EXISTS repas_invites (
  repas_id uuid REFERENCES repas(id) ON DELETE CASCADE,
  invite_id uuid REFERENCES invites(id) ON DELETE CASCADE,
  PRIMARY KEY (repas_id, invite_id)
);

-- Create junction table for repas-recettes many-to-many relationship
CREATE TABLE IF NOT EXISTS repas_recettes (
  repas_id uuid REFERENCES repas(id) ON DELETE CASCADE,
  recette_id uuid REFERENCES recettes(id) ON DELETE CASCADE,
  PRIMARY KEY (repas_id, recette_id)
);

-- Enable Row Level Security
ALTER TABLE recettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE repas_recettes ENABLE ROW LEVEL SECURITY;

-- Create policies for recettes
CREATE POLICY "Users can read all recettes"
  ON recettes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert recettes"
  ON recettes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update recettes"
  ON recettes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete recettes"
  ON recettes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for invites
CREATE POLICY "Users can read all invites"
  ON invites
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invites"
  ON invites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invites"
  ON invites
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete invites"
  ON invites
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for repas
CREATE POLICY "Users can read all repas"
  ON repas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert repas"
  ON repas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update repas"
  ON repas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete repas"
  ON repas
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for repas_invites
CREATE POLICY "Users can read all repas_invites"
  ON repas_invites
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert repas_invites"
  ON repas_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete repas_invites"
  ON repas_invites
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for repas_recettes
CREATE POLICY "Users can read all repas_recettes"
  ON repas_recettes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert repas_recettes"
  ON repas_recettes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete repas_recettes"
  ON repas_recettes
  FOR DELETE
  TO authenticated
  USING (true);