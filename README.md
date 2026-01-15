# Ninja Gen Z - Task Management System

A modern, collaborative task management platform built with React, TypeScript, and Supabase.

## 🚀 Features

- **Task Management**: Create, view, and manage tasks with multiple views (Table & Kanban)
- **Workspace Collaboration**: Multi-user workspaces with role-based access control
- **Real-time Updates**: Live collaboration with Supabase real-time subscriptions
- **Rich Task Details**: Comprehensive task information with properties, comments, and activity logs
- **Client Portal**: Dedicated portal for clients to review and approve tasks
- **Custom Properties**: Flexible property system for extending task metadata
- **Dark Mode UI**: Modern, sleek interface with dark theme

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Drag & Drop**: @dnd-kit
- **Tables**: TanStack Table
- **Rich Text**: TipTap Editor

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/m2kky/ngzngz.git
cd ngzngz/web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the `web` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
web/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── records/      # Record sheet components
│   │   ├── ui/           # Base UI components (Radix)
│   │   └── views/        # DataTable & Kanban views
│   ├── features/         # Feature-based modules
│   │   └── tasks/        # Task management feature
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript type definitions
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🗄️ Database Schema

Key tables:
- `workspaces` - Organization units
- `workspace_members` - User-workspace relationships
- `tasks` - Task records
- `projects` - Project organization
- `clients` - Client management
- `users` - User profiles
- `comments` - Task comments
- `activity_logs` - Audit trail

See [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) for full schema details.

## 🐛 Known Issues

### Activity Logs & Comments Not Loading

**Issue**: Users may encounter "Error loading activity" and "Error loading comments" when opening task details.

**Root Cause**: PostgREST schema cache not refreshing after RLS policy updates.

**Solution**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed resolution steps.

## 🚧 Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Developer**: m2kky

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React and Supabase
