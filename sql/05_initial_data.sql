-- Insert the fixed configuration row if it doesn't exist
INSERT INTO public.configuracoes (id, titulo_site)
VALUES ('00000000-0000-0000-0000-000000000000', 'Pousada Reloday')
ON CONFLICT (id) DO NOTHING;