-- Corriger les problèmes de sécurité

-- 1. Ajouter les policies pour user_roles
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = (SELECT id FROM public.users WHERE open_id = auth.uid()::text));

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(
        (SELECT id FROM public.users WHERE open_id = auth.uid()::text),
        'admin'
    ));

-- 2. Corriger la fonction update_updated_at_column avec search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;