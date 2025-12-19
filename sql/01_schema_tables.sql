-- Habilita a extensão HTTP para a função de webhook
CREATE EXTENSION IF NOT EXISTS http;

-- Criação do tipo ENUM para status de reserva
CREATE TYPE public.reserva_status AS ENUM ('pendente', 'confirmada', 'cancelada', 'concluida');

-- 1. Acomodações (Base table)
CREATE TABLE public.acomodacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao TEXT,
  capacidade INTEGER NOT NULL,
  preco NUMERIC NOT NULL,
  imagem_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  cleaning_buffer_hours NUMERIC DEFAULT 1.0
);

-- 2. Comodidades (Base table)
CREATE TABLE public.comodidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categorias de Pacotes (Base table)
CREATE TABLE public.categorias_pacotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pacotes
CREATE TABLE public.pacotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  imagem_url TEXT,
  categoria_id UUID REFERENCES public.categorias_pacotes(id)
);

-- 5. Slides
CREATE TABLE public.slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  imagem_url TEXT NOT NULL,
  cta_label TEXT,
  cta_href TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. Perfis (Requer auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  billing_address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  whatsapp TEXT
);

-- 7. Configurações (Linha única)
CREATE TABLE public.configuracoes (
  id UUID DEFAULT '00000000-0000-0000-0000-000000000000' PRIMARY KEY,
  email_contato TEXT,
  telefone_principal TEXT,
  endereco_fisico TEXT,
  titulo_site TEXT,
  meta_descricao TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  chave_pix TEXT,
  mensagem_padrao_whatsapp TEXT,
  hook_msg TEXT
);

-- 8. Bloqueios Manuais
CREATE TABLE public.bloqueios_manuais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  acomodacao_id UUID REFERENCES public.acomodacoes(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Mídia de Acomodação (Join table)
CREATE TABLE public.acomodacao_midia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  acomodacao_id UUID NOT NULL REFERENCES public.acomodacoes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Mídia de Pacote (Join table)
CREATE TABLE public.pacotes_midia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pacote_id UUID NOT NULL REFERENCES public.pacotes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Acomodação Comodidade (Many-to-many join table)
CREATE TABLE public.acomodacao_comodidade (
  acomodacao_id UUID NOT NULL REFERENCES public.acomodacoes(id) ON DELETE CASCADE,
  comodidade_id UUID NOT NULL REFERENCES public.comodidades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (acomodacao_id, comodidade_id)
);

-- 12. Reservas
CREATE TABLE public.reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acomodacao_id UUID NOT NULL REFERENCES public.acomodacoes(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_hospedes INTEGER NOT NULL,
  valor_total NUMERIC NOT NULL,
  status public.reserva_status NOT NULL DEFAULT 'pendente',
  check_in_time TIME WITHOUT TIME ZONE DEFAULT '14:00:00',
  check_out_time TIME WITHOUT TIME ZONE DEFAULT '11:00:00',
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE
);