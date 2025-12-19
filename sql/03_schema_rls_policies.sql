-- 1. Acomodações
ALTER TABLE public.acomodacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete acomodacoes" ON public.acomodacoes FOR DELETE USING (is_admin());
CREATE POLICY "Admins can update acomodacoes" ON public.acomodacoes FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert acomodacoes" ON public.acomodacoes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Acomodações são públicas para leitura." ON public.acomodacoes FOR SELECT USING (true);

-- 2. Comodidades
ALTER TABLE public.comodidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage comodidades" ON public.comodidades FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Comodidades are public for select" ON public.comodidades FOR SELECT USING (true);

-- 3. Acomodação Comodidade (Join table)
ALTER TABLE public.acomodacao_comodidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage acomodacao_comodidade" ON public.acomodacao_comodidade FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Acomodacao comodidade is public for select" ON public.acomodacao_comodidade FOR SELECT USING (true);

-- 4. Mídia de Acomodação
ALTER TABLE public.acomodacao_midia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can insert acomodacao_midia" ON public.acomodacao_midia FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can delete acomodacao_midia" ON public.acomodacao_midia FOR DELETE USING (is_admin());
CREATE POLICY "Admins can update acomodacao_midia" ON public.acomodacao_midia FOR UPDATE USING (is_admin());
CREATE POLICY "Midia is public for select" ON public.acomodacao_midia FOR SELECT USING (true);

-- 5. Slides
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete slides" ON public.slides FOR DELETE USING (is_admin());
CREATE POLICY "Admins can update slides" ON public.slides FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert slides" ON public.slides FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Slides são públicos para leitura." ON public.slides FOR SELECT USING (true);

-- 6. Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Usuários podem atualizar seus próprios perfis." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem ver seus próprios perfis." ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 7. Reservas
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can delete all reservas" ON public.reservas FOR DELETE USING (is_admin());
CREATE POLICY "Admins can update all reservas" ON public.reservas FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can view all reservas" ON public.reservas FOR SELECT USING (is_admin());
CREATE POLICY "Usuários podem criar reservas." ON public.reservas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver suas próprias reservas." ON public.reservas FOR SELECT USING (auth.uid() = user_id);

-- 8. Bloqueios Manuais
ALTER TABLE public.bloqueios_manuais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage manual blocks" ON public.bloqueios_manuais FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read access to manual blocks" ON public.bloqueios_manuais FOR SELECT USING (true);

-- 9. Categorias de Pacotes
ALTER TABLE public.categorias_pacotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage package categories" ON public.categorias_pacotes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read access to package categories" ON public.categorias_pacotes FOR SELECT USING (true);

-- 10. Pacotes
ALTER TABLE public.pacotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pacotes" ON public.pacotes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Pacotes are public for select" ON public.pacotes FOR SELECT USING (true);

-- 11. Mídia de Pacote
ALTER TABLE public.pacotes_midia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage pacote media" ON public.pacotes_midia FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Pacote media is public for select" ON public.pacotes_midia FOR SELECT USING (true);

-- 12. Configurações
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage configurations" ON public.configuracoes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Public read access to configurations" ON public.configuracoes FOR SELECT USING (true);