# Pousada Reloday - Sistema de Reservas e Gestãoversão

## versão teste (deploy)

## Visão Geral
Este é o frontend de um sistema de gestão e reservas para uma pousada, construído com React, TypeScript e Tailwind CSS. Ele utiliza o Supabase como backend completo (Autenticação, Banco de Dados, Storage e Edge Functions) para gerenciar acomodações, pacotes, reservas e configurações do site.

## Stack Tecnológica
| Categoria | Tecnologia |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Roteamento** | React Router DOM |
| **Gerenciamento de Dados** | TanStack Query |
| **Backend as a Service (BaaS)** | Supabase (Auth, Database, Storage, Edge Functions) |
| **Notificações** | Sonner (Toasts) |

## Estrutura de Pastas
*   `src/pages`: Páginas principais e rotas do frontend.
*   `src/pages/admin`: Páginas do painel administrativo (protegidas).
*   `src/components`: Componentes reutilizáveis.
*   `src/integrations/supabase`: Hooks e tipagens para interação com o Supabase.
*   `sql`: **Scripts SQL para recriação completa do esquema do banco de dados.**
*   `supabase/functions`: Código das Edge Functions.

## Funcionalidades Principais

### Frontend (Público)
*   **Página Inicial Dinâmica:** Carrossel de slides gerenciado via CMS (Supabase).
*   **Listagem de Acomodações:** Exibição de todas as acomodações ativas.
*   **Detalhe da Acomodação:** Galeria de fotos/vídeos, comodidades e informações de preço.
*   **Sistema de Reserva:** Formulário de reserva com validação de datas e horários (considerando check-out anterior e buffer de limpeza).
*   **Autenticação de Usuário:** Login, Cadastro e Recuperação de Senha via Supabase Auth.
*   **Área do Cliente (`/acompanhar-reserva`):** Visualização e gestão do perfil, e lista de reservas ativas/histórico.

### Painel Administrativo (`/admin`)
*   **Proteção de Rota:** Acesso restrito a usuários com `is_admin: true` no perfil.
*   **Gestão de Conteúdo:** CRUDs para Acomodações, Comodidades, Slides, Pacotes e Categorias.
*   **Gestão de Reservas:** Visualização, atualização de status e integração com WhatsApp para envio de link de pagamento.
*   **Bloqueio Manual de Datas:** Ferramenta para bloquear períodos específicos em acomodações (ex: manutenção).
*   **Configurações Globais:** Edição de informações de contato, SEO, chave PIX e URL do Webhook de notificação.

## Configuração do Projeto

### 1. Instalação e Inicialização
Certifique-se de ter o Node.js e o npm instalados.

```bash
# Instalar dependências
npm install

# Iniciar o ambiente de desenvolvimento
npm run dev
```

### 2. Configuração do Supabase

Este projeto depende de um ambiente Supabase configurado.

#### A. Credenciais
As credenciais do Supabase já estão configuradas em `src/lib/supabase/client.ts`:
*   **URL do Projeto:** `https://ayxmiufkbgipytpixtiv.supabase.co`
*   **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eG1pdWZrYmdpcHl0cGl4dGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODM5MzgsImV4cCI6MjA4MDk1OTkzOH0.GbUvjsy0xJ2lp7IsqS1w3jQwYe9f80m8h2Xo-gVtp78`

#### B. Banco de Dados (Schema)
Para recriar o esquema do banco de dados, execute os scripts SQL localizados na pasta `sql/` no seu Supabase Studio (SQL Editor) **na ordem listada abaixo**:
1.  `sql/01_schema_tables.sql` (Criação de Tabelas e Tipos)
2.  `sql/02_schema_functions.sql` (Criação de Funções)
3.  `sql/03_schema_rls_policies.sql` (Habilitação de RLS e Políticas de Segurança)
4.  `sql/04_schema_triggers.sql` (Criação de Triggers)
5.  `sql/05_initial_data.sql` (Inserção da linha de Configuração)

#### C. Edge Function (Notificação de Reserva)
A Edge Function `send-reservation-hook` é crucial para notificar sistemas externos (como n8n ou Zapier) sobre novas reservas.

*   **Nome da Função:** `send-reservation-hook`
*   **Localização:** `supabase/functions/send-reservation-hook/index.ts`
*   **Ação Necessária:** Certifique-se de que esta função esteja implantada no seu projeto Supabase.

#### D. Storage (Armazenamento)
*   **Bucket Necessário:** Crie um bucket chamado `imagens_video`.
*   **Configuração:** O bucket deve ter políticas de acesso público para leitura (para exibir as imagens no frontend).

## Deploy e Build

O projeto utiliza o Vite para criar um aplicativo de página única (SPA) otimizado.

### Verificação de Dependências
Todas as dependências de desenvolvimento e produção necessárias para o build (`typescript`, `vite`, `tailwindcss`, etc.) estão corretamente listadas em `package.json`.

### Comando de Build
Para gerar os arquivos estáticos prontos para produção, utilize o comando:

```bash
npm run build
```
Isso criará a pasta `dist/` com o código otimizado.

### Deploy (Exemplo Vercel)
O arquivo `vercel.json` já está configurado para rotear corretamente as rotas do React Router DOM (necessário para rotas como `/acomodacoes/suite-master`).

Ao implantar em plataformas como Vercel ou Netlify:
1.  **Comando de Build:** `npm run build`
2.  **Diretório de Output:** `dist`