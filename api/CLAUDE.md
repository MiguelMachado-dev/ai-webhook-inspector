# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with hot reload using tsx
- `pnpm start` - Run production server from built files
- `pnpm format` - Format code using Biome
- `pnpm db:generate` - Generate Drizzle database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed database with initial data

## Architecture Overview

This is a Node.js webhook inspection API built with Fastify and TypeScript. The service captures and stores incoming webhook requests for inspection and debugging.

### Core Stack
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify with Zod type provider
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Documentation**: OpenAPI/Swagger with Scalar UI
- **Tooling**: Biome for formatting, tsx for TypeScript execution

### Database Layer
- Uses Drizzle ORM with PostgreSQL
- Schema defined in `src/db/schema/` with snake_case casing
- Main table: `webhooks` - stores captured webhook requests with metadata
- Database configuration in `drizzle.config.ts`
- Migrations output to `src/db/migrations/`

### API Routes Structure
Routes are organized as Fastify plugins with Zod schemas:
- `GET /api/webhooks` - List webhooks with cursor-based pagination
- `GET /api/webhooks/:id` - Get specific webhook details
- `DELETE /api/webhooks/:id` - Delete a webhook
- `ALL /capture/*` - Catch-all route that captures incoming webhook requests

### Key Features
- **Webhook Capture**: Captures all HTTP method types to `/capture/*` endpoints
- **Request Storage**: Stores method, pathname, IP, headers, body, and metadata
- **Pagination**: Cursor-based pagination for webhook lists
- **API Documentation**: Auto-generated OpenAPI docs available at `/docs`
- **CORS**: Enabled for all origins with common HTTP methods

### Environment Configuration
- Environment variables validated with Zod in `src/env.ts`
- Required: `DATABASE_URL`
- Optional: `NODE_ENV` (defaults to development), `PORT` (defaults to 3333)

### Path Aliases
Uses `@/` prefix for imports:
- `@/db` → `src/db/`
- `@/env` → `src/env.ts`

## Development Notes

The API is designed to capture webhook requests from external services. The capture endpoint (`/capture/*`) accepts any HTTP method and stores the complete request data including headers, body, and metadata for later inspection through the management API.