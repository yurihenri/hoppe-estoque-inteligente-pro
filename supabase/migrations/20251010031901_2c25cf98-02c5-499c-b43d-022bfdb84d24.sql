-- Fase 3: Limpar políticas RLS redundantes e conflitantes

-- =======================
-- TABELA: produtos
-- =======================

-- Remover políticas antigas/duplicadas que usam profiles.id ao invés de profiles.user_id
DROP POLICY IF EXISTS "Users can create products for their company" ON produtos;
DROP POLICY IF EXISTS "Users can delete products from their company" ON produtos;
DROP POLICY IF EXISTS "Users can update products from their company" ON produtos;
DROP POLICY IF EXISTS "Users can view products from their company" ON produtos;

-- Remover políticas duplicadas que usam profiles.id
DROP POLICY IF EXISTS "Users can delete produtos for their empresa" ON produtos;
DROP POLICY IF EXISTS "Users can insert produtos for their empresa" ON produtos;
DROP POLICY IF EXISTS "Users can update produtos for their empresa" ON produtos;
DROP POLICY IF EXISTS "Users can view their empresa's produtos" ON produtos;

-- Manter apenas as políticas corretas que usam profiles.user_id
-- Estas políticas já existem e estão corretas:
-- - "Usuário pode atualizar produtos da sua empresa"
-- - "Usuário pode inserir produtos da sua empresa"
-- - "Usuário pode ver produtos da sua empresa"


-- =======================
-- TABELA: categorias
-- =======================

-- Remover políticas antigas que usam profiles.id ao invés de profiles.user_id
DROP POLICY IF EXISTS "Users can create categories for their company" ON categorias;
DROP POLICY IF EXISTS "Users can delete categories from their company" ON categorias;
DROP POLICY IF EXISTS "Users can update categories from their company" ON categorias;
DROP POLICY IF EXISTS "Users can view categories from their company" ON categorias;

-- Remover políticas perigosas que permitem acesso total (USING true)
DROP POLICY IF EXISTS "Usuários podem atualizar categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários podem criar categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários podem excluir categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários podem visualizar suas categorias" ON categorias;

-- Manter apenas as políticas corretas que usam profiles.user_id
-- Estas políticas já existem e estão corretas:
-- - "Usuário pode atualizar categorias da sua empresa"
-- - "Usuário pode inserir categorias da sua empresa"
-- - "Usuário pode ver categorias da sua empresa"

-- Adicionar política de DELETE que estava faltando para categorias
CREATE POLICY "Usuário pode excluir categorias da sua empresa"
ON categorias
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.empresa_id = categorias.empresa_id
  )
);