-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid()
$function$;

-- Function to handle new user creation (inserting into profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.email); -- Usamos o email como nome inicial
  RETURN NEW;
END;
$function$;

-- Function to notify external webhook on new reservation
CREATE OR REPLACE FUNCTION public.notify_new_reservation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    -- Variáveis para a chamada da Edge Function
    supabase_url TEXT := current_setting('supa.url');
    anon_key TEXT := current_setting('supa.anon_key');
    service_role_key TEXT := current_setting('supa.service_role_key');
    function_url TEXT := supabase_url || '/functions/v1/send-reservation-hook';
    
    -- Payload para a Edge Function (apenas o ID da nova reserva)
    payload JSONB;
    
    -- Variável para a resposta da requisição
    response_status INT;
    response_body TEXT;
BEGIN
    -- Verifica se a reserva é pendente (status inicial)
    IF NEW.status = 'pendente' THEN
        -- Monta o payload com o registro completo da nova reserva
        payload := row_to_json(NEW)::jsonb;

        -- Chama a Edge Function de forma assíncrona
        SELECT 
            status, 
            content 
        INTO 
            response_status, 
            response_body 
        FROM 
            http_post(
                function_url,
                payload,
                'application/json',
                ARRAY[
                    http_header('Authorization', 'Bearer ' || anon_key),
                    http_header('x-supabase-auth', service_role_key) -- Passa a chave de serviço para autenticação interna
                ]
            );

        -- Opcional: Logar a resposta da Edge Function (apenas para depuração)
        -- RAISE NOTICE 'Edge Function Status: %', response_status;
        -- RAISE NOTICE 'Edge Function Body: %', response_body;
    END IF;

    RETURN NEW;
END;
$function$;