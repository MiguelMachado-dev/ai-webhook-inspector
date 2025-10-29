# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Workspace Commands
- `pnpm install` - Install dependencies for both API and web (requires pnpm)
- `pnpm dev` - Start development server with hot reload using tsx

### API (Backend) Commands
Navigate to `api/` directory first:
- `pnpm dev` - Start development server with hot reload using tsx
- `pnpm start` - Run production server from built files
- `pnpm format` - Format code using Biome
- `pnpm db:generate` - Generate Drizzle database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed database with initial data

### Web (Frontend) Commands
Navigate to `web/` directory first:
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build

## Architecture Overview

This is a full-stack webhook inspection application with a Node.js/Fastify backend and React/Vite frontend.

### Project Structure
- **api/**: Backend API service with Fastify, TypeScript, Drizzle ORM and PostgreSQL
- **web/**: Frontend React application with TypeScript, Vite, and TanStack Router

### Backend (api/) Architecture

#### Core Stack
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify with Zod type provider
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas with automatic type generation
- **Documentation**: OpenAPI/Swagger with Scalar UI
- **Tooling**: Biome for formatting, tsx for TypeScript execution

#### Database Layer
- Uses Drizzle ORM with PostgreSQL
- Schema defined in `src/db/schema/` with snake_case casing
- Main table: `webhooks` - stores captured webhook requests with metadata
- Database configuration in `drizzle.config.ts`
- Migrations output to `src/db/migrations/`

#### API Routes Structure
Routes are organized as Fastify plugins with Zod schemas:
- `GET /api/webhooks` - List webhooks with cursor-based pagination
- `GET /api/webhooks/:id` - Get specific webhook details
- `DELETE /api/webhooks/:id` - Delete a webhook
- `ALL /capture/*` - Catch-all route that captures incoming webhook requests

#### Key Features
- **Webhook Capture**: Captures all HTTP method types to `/capture/*` endpoints
- **Request Storage**: Stores method, pathname, IP, headers, body, and metadata
- **Pagination**: Cursor-based pagination for webhook lists
- **API Documentation**: Auto-generated OpenAPI docs available at `/docs`
- **CORS**: Enabled for all origins with common HTTP methods

#### Environment Configuration
- Environment variables validated with Zod in `src/env.ts`
- Required: `DATABASE_URL`
- Optional: `NODE_ENV` (defaults to development), `PORT` (defaults to 3333)

#### Path Aliases
Uses `@/` prefix for imports:
- `@/db` → `src/db/`
- `@/env` → `src/env.ts`

### Frontend (web/) Architecture

#### Core Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with React plugin
- **Routing**: TanStack Router with file-based routing and code splitting
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS v4 with dark theme
- **UI Components**: Custom components built on Radix UI primitives

#### Application Structure
- **Layout**: Resizable panel layout with sidebar navigation
- **Routing**: File-based routing in `src/routes/` with automatic route generation
- **Data Fetching**: TanStack Query with infinite scroll for webhook lists
- **Component Organization**:
  - `components/ui/` - Reusable UI primitives
  - `components/` - Application-specific components

#### Key Components
- **Sidebar**: Navigation panel with webhook list
- **WebhooksList**: Infinite scrolling list with intersection observer
- **WebhooksListItem**: Individual webhook items in the list
- **WebhookDetails**: Detailed view of selected webhook
- **WebhookDetailHeader**: Header component for webhook details

#### Data Flow
- API schemas defined in `src/http/schemas/webhooks.ts` using Zod
- TanStack Query manages caching and synchronization
- Infinite scroll implementation for large webhook lists
- Real-time updates through query invalidation

#### Routing System
- File-based routing with TanStack Router
- Route tree auto-generated in `routeTree.gen.ts`
- Routes: `/` (home), `/webhooks/$id` (webhook details)
- Layout routes with nested outlets

## Development Notes

### Environment Setup
1. Create `.env` file in `api/` directory with `DATABASE_URL`
2. Install dependencies with `pnpm install` from root
3. Run database migrations with `pnpm db:migrate` in `api/`
4. Seed database optionally with `pnpm db:seed` in `api/`

### Development Workflow
1. Start backend API: `cd api && pnpm dev`
2. Start frontend: `cd web && pnpm dev`
3. API documentation available at `http://localhost:3333/docs`
4. Frontend available at `http://localhost:5173`

### API Integration
The frontend expects the API to be running on `http://localhost:3333`. The capture endpoint (`/capture/*`) accepts any HTTP method and stores the complete request data including headers, body, and metadata for later inspection through the management API.