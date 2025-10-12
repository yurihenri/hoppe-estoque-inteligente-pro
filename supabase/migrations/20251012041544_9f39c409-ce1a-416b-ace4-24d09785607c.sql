-- Correção do sistema de perfis - Parte 1: Atualizar políticas dependentes

-- =======================
-- Atualizar políticas de produtos para usar profiles.id
-- =======================

DROP POLICY IF EXISTS "Usuário pode ver produtos da sua empresa" ON produtos;
DROP POLICY IF EXISTS "Usuário pode inserir produtos da sua empresa" ON produtos;
DROP POLICY IF EXISTS "Usuário pode atualizar produtos da sua empresa" ON produtos;

CREATE POLICY "Usuário pode ver produtos da sua empresa"
ON produtos
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = produtos.empresa_id
  )
);

CREATE POLICY "Usuário pode inserir produtos da sua empresa"
ON produtos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = produtos.empresa_id
  )
);

CREATE POLICY "Usuário pode atualizar produtos da sua empresa"
ON produtos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = produtos.empresa_id
  )
);

-- =======================
-- Atualizar políticas de categorias para usar profiles.id
-- =======================

DROP POLICY IF EXISTS "Usuário pode ver categorias da sua empresa" ON categorias;
DROP POLICY IF EXISTS "Usuário pode inserir categorias da sua empresa" ON categorias;
DROP POLICY IF EXISTS "Usuário pode atualizar categorias da sua empresa" ON categorias;
DROP POLICY IF EXISTS "Usuário pode excluir categorias da sua empresa" ON categorias;

CREATE POLICY "Usuário pode ver categorias da sua empresa"
ON categorias
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = categorias.empresa_id
  )
);

CREATE POLICY "Usuário pode inserir categorias da sua empresa"
ON categorias
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = categorias.empresa_id
  )
);

CREATE POLICY "Usuário pode atualizar categorias da sua empresa"
ON categorias
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = categorias.empresa_id
  )
);

CREATE POLICY "Usuário pode excluir categorias da sua empresa"
ON categorias
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.empresa_id = categorias.empresa_id
  )
);