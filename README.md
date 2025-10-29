# AI Webhook Inspector

A full-stack webhook inspection application with Node.js/Fastify backend and React/Vite frontend for capturing and analyzing incoming webhook requests.

## Architecture

### Backend (api/)
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify with Zod type provider
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas with automatic type generation
- **Documentation**: OpenAPI/Swagger with Scalar UI
- **Tooling**: Biome for formatting, tsx for TypeScript execution

### Frontend (web/)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with React plugin
- **Routing**: TanStack Router with file-based routing and code splitting
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS v4 with dark theme
- **UI Components**: Custom components built on Radix UI primitives

## Features

### Backend API
- **Webhook Capture**: Captures all HTTP method types to `/capture/*` endpoints
- **Request Storage**: Stores method, pathname, IP, headers, body, and metadata
- **Pagination**: Cursor-based pagination for webhook lists
- **API Documentation**: Auto-generated OpenAPI docs available at `/docs`
- **CORS**: Enabled for all origins with common HTTP methods

### Frontend Application
- **Resizable Panel Layout**: Sidebar navigation with main content area
- **Infinite Scrolling**: Webhook list with intersection observer for large datasets
- **Real-time Updates**: TanStack Query manages caching and synchronization
- **Detailed View**: Complete webhook request inspection including headers and body
- **Dark Theme**: Modern dark interface with Tailwind CSS

## Installation

```bash
# Install dependencies (requires pnpm)
pnpm install
```

## Development

### Environment Setup
1. Create `.env` file in `api/` directory with `DATABASE_URL`
2. Run database migrations: `cd api && pnpm db:migrate`
3. Optionally seed database: `cd api && pnpm db:seed`

### Starting Development Servers

#### Backend
```bash
cd api
pnpm dev
```
API will be available at `http://localhost:3333`
API documentation at `http://localhost:3333/docs`

#### Frontend
```bash
cd web
pnpm dev
```
Frontend will be available at `http://localhost:5173`

### Development Commands

#### Workspace Commands
- `pnpm install` - Install dependencies for both API and web
- `pnpm dev` - Start development server with hot reload using tsx

#### API Commands (in api/ directory)
- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Run production server from built files
- `pnpm format` - Format code using Biome
- `pnpm db:generate` - Generate Drizzle database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed database with initial data

#### Frontend Commands (in web/ directory)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build

## API Endpoints

### Webhook Management
- `GET /api/webhooks` - List webhooks with cursor-based pagination
- `GET /api/webhooks/:id` - Get specific webhook details
- `DELETE /api/webhooks/:id` - Delete a webhook

### Webhook Capture
- `ALL /capture/*` - Catch-all route that captures incoming webhook requests

## Environment Variables

Create a `.env` file in the `api/` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=development
PORT=3333
```

## Project Structure

```
├── api/                    # Backend API service
│   ├── src/
│   │   ├── db/            # Database schemas and migrations
│   │   ├── http/          # HTTP routes and schemas
│   │   └── server.ts      # Main server file
│   └── drizzle.config.ts  # Database configuration
└── web/                   # Frontend React application
    ├── src/
    │   ├── components/    # React components
    │   ├── routes/        # File-based routing
    │   └── http/          # API schemas
    └── vite.config.ts     # Vite configuration
```

## Usage

1. Start both backend and frontend servers
2. Send webhook requests to `http://localhost:3333/capture/your-endpoint`
3. View captured webhooks in the web interface
4. Inspect detailed request data including headers, body, and metadata
