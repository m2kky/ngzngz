# Stack & Libraries (قرار المنتج)

الهدف: تجربة خفيفة وسريعة وشكل جميل، وتتحول بسهولة لـ Mobile App.

## Core Stack
- App: Vite + React + TypeScript (SPA)
- Router: TanStack Router
- Server State/Data: TanStack React Query
- Client/UI State: Zustand
- Styling: Tailwind CSS + tailwindcss-animate + CVA + tailwind-merge
- UI Primitives: Radix UI + shadcn/ui
- Icons: lucide-react
- Animations: Framer Motion (للـ navigation + transitions + sheets) + CSS transitions للحركات البسيطة
- Forms: react-hook-form + zod
- Backend SDK: Supabase JS (لو اخترنا Supabase كـ backend)
- Mobile App: Capacitor (Android/iOS)

## View Engine (Notion-like Database Views)
- Table: TanStack Table
- Virtualization: TanStack Virtual
- DnD: dnd-kit (خصوصًا للـ Board)
- Calendar pickers: react-day-picker (UI) + date-fns (logic)

## Editor (Notion-like Body)
- Rich text & blocks: Tiptap (ProseMirror)
- Storage format: JSON document per record + attachments/embeds as nodes

## Optional / Later
- Charts: recharts (لو احتجنا)
- Flow builder: reactflow (لو توسعنا في automations بصريًا)

## مبادئ اختيار المكتبات
- “أداء المستخدم” أهم من “أسرع build”: virtualization في القوائم أهم مكسب
- “موبايل أولًا”: نفس routes والـ state؛ اختلاف UI shell فقط
- “تقليل الاعتماديات الثقيلة”: Framer Motion في الأماكن الأساسية فقط

