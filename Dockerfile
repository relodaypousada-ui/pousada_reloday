# --- STAGE 1: Build da Aplicação ---
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia package.json e package-lock.json (ou yarn.lock/pnpm-lock.yaml)
COPY package.json package.json
COPY package-lock.json package-lock.json

# Instala as dependências
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Executa o build da aplicação (gera a pasta 'dist')
RUN npm run build

# --- STAGE 2: Servir a Aplicação com Nginx ---
FROM nginx:stable-alpine AS final

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados na etapa 'builder' para o diretório de serviço do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]