-- Fase 1: Corrigir função check_plan_limits para lidar com current_plan_id NULL
CREATE OR REPLACE FUNCTION public.check_plan_limits(empresa_uuid uuid, limit_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  plan_data RECORD;
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Buscar dados do plano atual da empresa
  -- Se current_plan_id for NULL, buscar o plano gratuito como fallback
  SELECT p.max_products, p.max_users, p.features
  INTO plan_data
  FROM public.empresas e
  LEFT JOIN public.plans p ON COALESCE(e.current_plan_id, (SELECT id FROM public.plans WHERE type = 'free' LIMIT 1)) = p.id
  WHERE e.id = empresa_uuid;
  
  IF plan_data IS NULL THEN
    RETURN '{"allowed": false, "reason": "Plano não encontrado"}'::JSONB;
  END IF;
  
  -- Verificar limite de produtos
  IF limit_type = 'products' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.produtos 
    WHERE empresa_id = empresa_uuid;
    
    max_allowed := plan_data.max_products;
    
    IF current_count >= max_allowed THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Limite de produtos atingido',
        'current', current_count,
        'max', max_allowed
      );
    END IF;
  END IF;
  
  -- Verificar limite de usuários
  IF limit_type = 'users' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.profiles 
    WHERE empresa_id = empresa_uuid;
    
    max_allowed := plan_data.max_users;
    
    IF current_count >= max_allowed THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Limite de usuários atingido',
        'current', current_count,
        'max', max_allowed
      );
    END IF;
  END IF;
  
  RETURN '{"allowed": true}'::JSONB;
END;
$function$;

-- Fase 2: Migrar empresas com current_plan_id NULL para o plano gratuito
UPDATE public.empresas
SET current_plan_id = (SELECT id FROM public.plans WHERE type = 'free' LIMIT 1)
WHERE current_plan_id IS NULL;