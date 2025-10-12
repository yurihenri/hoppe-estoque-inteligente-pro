-- Correção do sistema de perfis - Parte 2: Corrigir tabela profiles

-- =======================
-- Remover políticas antigas da tabela profiles
-- =======================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Usuário pode atualizar próprio profile" ON profiles;
DROP POLICY IF EXISTS "Usuário pode ver próprio profile" ON profiles;

-- =======================
-- Remover coluna user_id redundante
-- =======================

ALTER TABLE profiles DROP COLUMN IF EXISTS user_id;

-- =======================
-- Criar políticas RLS corretas para profiles
-- =======================

-- Política de INSERT: Permite que um usuário crie seu próprio perfil
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Política de SELECT: Permite que um usuário veja seu próprio perfil
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Política de UPDATE: Permite que um usuário atualize seu próprio perfil
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =======================
-- Atualizar trigger para criar perfil automaticamente
-- =======================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_empresa_id uuid;
  user_name text;
  user_email text;
BEGIN
  -- Obter nome e email do usuário
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Criar uma empresa vinculada ao novo usuário
  INSERT INTO empresas (nome, created_at)
  VALUES ('Empresa de ' || user_email, now())
  RETURNING id INTO new_empresa_id;

  -- Criar o perfil vinculado ao usuário e empresa
  INSERT INTO profiles (id, nome, email, empresa_id, created_at)
  VALUES (
    NEW.id,
    user_name,
    user_email,
    new_empresa_id,
    now()
  );

  -- Associar o plano gratuito à empresa
  INSERT INTO subscriptions (empresa_id, plan_id, status, started_at, created_at)
  VALUES (
    new_empresa_id,
    (SELECT id FROM plans WHERE type = 'free' LIMIT 1),
    'active',
    now(),
    now()
  );

  RETURN NEW;
END;
$$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();