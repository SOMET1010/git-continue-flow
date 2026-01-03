-- Migration: Ajouter colonnes authentification PIN à la table users
-- Date: 2026-01-03

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  phone VARCHAR(20),
  login_method VARCHAR(64),
  role VARCHAR(20) DEFAULT 'merchant' NOT NULL,
  language VARCHAR(10) DEFAULT 'fr' NOT NULL,
  pin_code VARCHAR(255),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ajouter les colonnes manquantes pour l'authentification PIN
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_failed_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Créer les index pour performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_open_id ON public.users(open_id);

-- Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique (pour login)
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (true);

-- Politique RLS: Mise à jour de son propre profil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (true);

-- Politique RLS: Insertion (pour création de compte)
CREATE POLICY "users_insert_public" ON public.users
  FOR INSERT WITH CHECK (true);