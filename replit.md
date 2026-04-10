# AURA Shell — Tortoise Conservation Management System

## Overview
A full-stack AI-integrated Tortoise Care Management System with role-based access control, session authentication, and a complete REST API backend.

## Architecture

### Frontend
- **React 18** + **TypeScript** + **Vite** (port 5000)
- **TailwindCSS** with glassmorphism design language
- **TanStack Query** for server state
- **React Router v6** for SPA routing
- **Radix UI / shadcn** component library

### Backend
- **Express 5** embedded in Vite dev server via `expressPlugin` (dev mode)
- **PostgreSQL** (Replit built-in database) via `pg` pool
- **express-session** + **connect-pg-simple** for persistent session store
- **bcryptjs** for password hashing (rounds: 12)
- **Zod** for request validation

## Authentication
- POST `/api/v1/auth/login` — username + password
- POST `/api/v1/auth/logout`
- GET `/api/v1/auth/me` — session restore on refresh
- POST `/api/v1/auth/forgot-password`
- POST `/api/v1/auth/reset-password`
- POST `/api/v1/auth/change-password`

## API Endpoints (`/api/v1/`)

| Module | Endpoints |
|--------|-----------|
| Auth | `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/forgot-password`, etc. |
| Users | CRUD + `/users/me/profile`, `/users/roles/all` |
| Tortoises | CRUD + `/tortoises/meta/species`, `/tortoises/meta/enclosures` |
| Feeding | CRUD feeding logs |
| Health | CRUD health records |
| Breeding | CRUD breeding records |
| Environment | `/environment/logs`, `/environment/enclosures` |
| Tasks | CRUD + `/tasks/:id/status` + `/tasks/overdue` |
| Alerts | CRUD + `/alerts/:id/assign`, `/alerts/:id/resolve` |
| Notifications | GET + mark read |
| Audit | Read-only audit log |
| AI | `/ai/diagnostics`, `/ai/network-graph-state`, `/ai/anomalies`, `/ai/population-analytics`, `/ai/alert-summary`, `/ai/habitat-metrics` |

## RBAC Roles & Permissions
8 roles: Admin, Supervisor, Vet, Caretaker, Breeding Officer, Env Tech, Collection Officer, Staff

45 granular permissions in `module.action` format stored in the database.

## Database Schema (PostgreSQL)
Tables: `roles`, `permissions`, `role_permissions`, `users`, `user_profiles`, `password_reset_tokens`, `species`, `enclosures`, `tortoise_profiles`, `feeding_logs`, `health_records`, `breeding_records`, `environment_logs`, `tasks`, `task_status_history`, `alerts`, `alert_action_history`, `notifications`, `audit_logs`, `sessions`

## Demo Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| supervisor1 | demo123 | Supervisor |
| vet1 | demo123 | Vet |
| caretaker1 | demo123 | Caretaker |
| breeder1 | demo123 | Breeding Officer |
| envtech1 | demo123 | Env Tech |
| collector1 | demo123 | Collection Officer |
| staff1 | demo123 | Staff |

## Server File Structure
```
server/
  db/
    pool.ts           — PostgreSQL connection pool
    schema.sql        — Full 3NF schema
    seed.sql          — Roles, permissions, enclosures, species
    migrate.ts        — Migration runner (used in production)
  middleware/
    auth.ts           — requireAuth, requirePermission, requireAnyPermission, requireRole
    errorHandler.ts   — Centralized error middleware
    rateLimiter.ts    — Login and API rate limiting
  routes/             — auth, users, tortoises, feeding, health, breeding, environment, tasks, alerts, notifications, audit, ai
  services/
    authService.ts    — Login, password reset, bcrypt logic
  utils/
    audit.ts          — Audit log helper
    response.ts       — Standardized API response helpers
  index.ts            — createServer() with all routes mounted
  node-build.ts       — Production entry point
```

## Development
```bash
pnpm dev   # Starts Vite dev server on port 5000 (Express embedded as middleware)
```

## Production Build
```bash
pnpm build  # Builds client to dist/spa and server to dist/server
pnpm start  # Runs production server (runs migrations + serves SPA + API)
```
