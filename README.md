# AI Webhook inspector

Projeto full-stack com backend em Node.js usando Fastify e frontend em React com Vite.

## Estrutura

- **api**: Backend com Fastify, TypeScript, Drizzle ORM e PostgreSQL
- **web**: Frontend com React, TypeScript e Vite

## Tecnologias

### Backend (api)
- Node.js
- Fastify
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod para validação
- Swagger para documentação

### Frontend (web)
- React 19
- TypeScript
- Vite

## Instalação

```bash
# Instalar dependências (requer pnpm)
pnpm install
```

## Uso

### Backend
```bash
# Entrar no diretório da API
cd api

# Iniciar em modo desenvolvimento
pnpm dev

# Migrar banco de dados
pnpm db:migrate

# Acessar documentação da API
# http://localhost:porta/docs
```

### Frontend
```bash
# Entrar no diretório web
cd web

# Iniciar em modo desenvolvimento
pnpm dev

# Construir para produção
pnpm build
```

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório `api/` com as configurações do banco de dados.
