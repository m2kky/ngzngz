# Ninja Gen Z - Project Overview

## 📋 Project Description
Ninja Gen Z is a comprehensive agency and digital marketing management platform designed specifically for Generation Z. It offers a modern interface with features for project management, campaign analytics, team motivation, and more.

## 🏗️ Tech Stack

### Core Technologies
- **Frontend**: Next.js 14 with TypeScript
- **UI Framework**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Data Fetching**: React Query
- **Rich Text Editor**: Tiptap
- **3D & Animations**: Three.js, React Three Fiber, GSAP
- **AI Integration**: Google AI SDK
- **Form Handling**: React Hook Form with Zod validation

### Key Dependencies
- `@supabase/supabase-js`: Database and authentication
- `@tanstack/react-query`: Data fetching and caching
- `@tiptap/*`: Rich text editing
- `framer-motion`: Animations
- `@radix-ui/*`: UI components
- `@dnd-kit/*`: Drag and drop functionality
- `ai` & `@ai-sdk/*`: AI capabilities
- `three` & `@react-three/*`: 3D graphics

## 📁 Project Structure

```
ninja-gen-z/
├── app/                  # Next.js app router pages and layouts
├── components/           # Reusable UI components
├── config/               # Application configuration
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared logic
├── public/               # Static assets
├── supabase/             # Supabase configuration and migrations
├── types/                # TypeScript type definitions
├── actions/              # Server actions
├── middleware.ts         # Next.js middleware
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## 🏆 Core Features

### 1. Content Studio
- Kanban board view
- Gallery view
- List view
- Rich text editor
- Task management

### 2. The Dojo (Gamification)
- XP points system
- Leaderboard
- Achievement badges
- Level progression

### 3. Ad Center
- Direct API integration with:
  - Meta Ads (Facebook & Instagram)
  - TikTok Ads
  - Google Ads
- Real-time campaign metrics
- Connection wizard

### 4. Meeting Management
- Meeting scheduling
- Rich meeting notes
- Task conversion
- File attachments

### 5. User Profiles
- Customizable profiles
- Activity tracking
- Performance metrics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account (for AI features)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_AI_API_KEY=your_google_ai_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## 🔐 Authentication
The app uses Supabase Auth for authentication. The authentication flow includes:
- Email/password login
- OAuth providers (Google, GitHub, etc.)
- Magic links
- Session management

## 📦 State Management
- **Zustand** for client-side state
- **React Query** for server state and data fetching
- **URL search params** for shared state (like filters)

## 🧪 Testing
To run tests:
```bash
npm test
```

## 🛠️ Build
To create a production build:
```bash
npm run build
```

## 🌐 Deployment
The app can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Team
- [Your Name] - Initial work - [YourUsername](https://github.com/YourUsername)

## 🙏 Acknowledgments
- Next.js team for the amazing framework
- Supabase for the awesome backend
- All open-source contributors
