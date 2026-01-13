# Ninja Gen Z - Agency OS

## Overview

Ninja Gen Z is a gamified, AI-powered workspace designed for Gen Z marketing agencies. The application provides a comprehensive platform for managing client workspaces, content creation, media buying, and client approvals. Built with a cyberpunk/ninja aesthetic, it emphasizes desktop-first workflows with keyboard-driven interactions and automation.

**Core Value Proposition:** Transform marketing agency operations through gamification, AI-assisted workflows, and strict quality control processes that ensure content aligns with brand guidelines before client review.

**Tech Stack:**
- **Frontend:** React + TypeScript with Vite
- **Backend:** Express.js (Node.js)
- **Database:** PostgreSQL via Neon Database with Drizzle ORM
- **UI Framework:** Shadcn/ui components with Radix UI primitives
- **Styling:** Tailwind CSS with custom cyber-ninja theme
- **Rich Text Editor:** TipTap (for block-based content editing)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure

**Monorepo Layout:**
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript schemas and types (Drizzle schema definitions)
- `/migrations` - Database migration files

**Design Pattern:** Full-stack monorepo with shared type definitions between frontend and backend, ensuring type safety across the entire application stack.

### Frontend Architecture

**Component System:**
- **UI Library:** Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling:** Custom design system with Tailwind CSS using a dark "cyber-ninja" theme
  - Primary brand color: Neon Lime (#ccff00) for CTAs, active states, progress bars
  - AI accent color: Electric Purple (#a855f7) exclusively for AI-related features
  - Background: Zinc-950 for deepest dark theme
  
**Key Layout Components:**
- Discord-style workspace switcher (64px vertical bar with circular workspace icons)
- Global command center (top bar with Cmd+K search and XP progress)
- Floating AI "Sensei" assistant (persistent UI element with toast notifications)

**Routing:** Wouter for lightweight client-side routing

**State Management:** TanStack Query (React Query) for server state with custom query client configuration

**Keyboard-First UX:**
- Cmd+K for global search
- Cmd+N for new tasks
- Cmd+S for immediate save

### Backend Architecture

**API Design:** RESTful API with Express.js
- All routes prefixed with `/api`
- Session-based authentication (planned)
- Rate limiting and security middleware (planned)

**Database Access Pattern:**
- Storage abstraction layer (`server/storage.ts`) for CRUD operations
- Drizzle ORM for type-safe database queries
- Connection pooling via Neon's serverless PostgreSQL

**Build System:**
- ESBuild for server bundling with selective dependency bundling
- Vite for client bundling
- Development mode with HMR via Vite middleware

### Data Model & Business Logic

**Core Workflow Engine:**
The application enforces a strict linear task lifecycle to ensure quality:
1. **Drafting** → 2. **In Progress** → 3. **AI Check** (automated) → 4. **Internal Review** → 5. **Client Review** → 6. **Approved** → 7. **Published/Ads Handoff**

**Key Database Tables:**
- `workspaces` - Client workspaces with branding configuration (JSONB)
- `users` - Team members with role-based permissions and XP points (gamification)
- `squads` - Junction table for workspace-user assignments with squad roles
- `tasks` - Core content tasks with JSONB `content_blocks` for editor state
- `personas` - Brand personas for AI tone checking
- `campaigns`, `ad_sets`, `ad_creatives` - Media buying hierarchy
- `assets_vault` - File storage with `is_ad_ready` flag for media buyer access

**Role-Based Access Control:**
- SYSTEM_ADMIN: Global access, billing, all workspaces
- ACCOUNT_MANAGER: Workspace-scoped, approvals, team management
- SQUAD_MEMBER: Task creation/editing, limited to internal review
- MEDIA_BUYER: Ad center access, read-only on content tasks
- EXTERNAL_CLIENT: Portal access for approvals only
- FREELANCER: Task-level access only

**Automation Rules:**
- AI Check: Automatic validation of content against persona tone and brand guidelines
- Handoff System: When task status = APPROVED, Account Manager can mark `is_ad_ready = true`, automatically making assets available in Media Buyer's creative library
- Auto-archiving: Tasks older than 6 months moved to archived state

### Content Creation System

**Block-Based Editor (TipTap):**
- Notion-style slash commands (`/image`, `/video`, `/embed`, etc.)
- Drag-and-drop block reordering
- Rich text formatting with neon color highlights
- Direct file upload or Google Drive embedding

**Advanced Features:**
- Template system: Save/load block layouts for reusable content structures
- Version history: Auto-save every 10 minutes with restore capability
- Smart Canvas: Separate brainstorming area within tasks

**Multi-View System:**
- Kanban: Drag cards between status columns
- Calendar: Monthly view with drag-to-reschedule
- Timeline: Gantt chart for campaigns
- List: Bulk editing table view

### Design System Implementation

**Color Variables:** CSS custom properties for theming with HSL color space
- Supports light/dark modes (dark mode primary)
- Consistent elevation system with `--elevate-1` and `--elevate-2` variables

**Typography:** Geist Sans (primary) or Inter fallback with tight tracking for headings

**Spacing Scale:** Tailwind units (2, 4, 6, 8, 12, 16, 20, 24) for consistent rhythm

**Component Variants:** CVA (class-variance-authority) for type-safe variant management

## External Dependencies

### Database & Infrastructure
- **Neon Database:** Serverless PostgreSQL with WebSocket support for real-time capabilities
- **Drizzle ORM:** Type-safe schema definitions and migrations in `shared/schema.ts`

### UI Component Libraries
- **Radix UI:** Headless accessible components (30+ primitives including Dialog, Dropdown, Popover, Toast, etc.)
- **Shadcn/ui:** Pre-styled component layer on top of Radix UI
- **Lucide React:** Icon library

### Rich Text & Interactions
- **TipTap:** Block-based rich text editor with extensions:
  - Code block with syntax highlighting (lowlight)
  - Image, Link, Highlight, Text align, Underline, Placeholder
- **@hello-pangea/dnd:** Drag-and-drop for Kanban board
- **Framer Motion:** Animations for AI "Sensei" floating avatar

### State & Data Management
- **TanStack Query:** Server state management with custom `getQueryFn` for automatic error handling
- **React Hook Form:** Form state with Zod validation (`@hookform/resolvers`)
- **Zod:** Runtime schema validation shared between client/server

### Development Tools
- **TypeScript:** Full type safety across stack
- **Vite:** Development server with HMR and optimized production builds
- **ESBuild:** Fast server-side bundling
- **PostCSS + Autoprefixer:** CSS processing

### Planned Integrations
Based on schema and documentation:
- **AI Services:** OpenAI or Google Generative AI for content tone checking
- **Email:** Nodemailer for notifications
- **File Storage:** Cloud storage for assets vault (Google Drive embedding mentioned)
- **Analytics APIs:** For ad performance metrics (ROAS, CPR, Spend tracking)
- **Payment Processing:** Stripe for billing (System Admin feature)