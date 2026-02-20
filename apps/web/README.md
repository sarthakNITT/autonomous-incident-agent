# Web Application - Autonomous Incident Agent

Modern Next.js web application with Clerk authentication and animated landing page.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Animation**: Framer Motion
- **Authentication**: Clerk
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/web
bun install --ignore-scripts
```

### 2. Configure Clerk Authentication

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys
4. Update `.env.local` with your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
bun run build
bun run start
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Protected dashboard
│   │   ├── sign-in/            # Clerk sign-in
│   │   ├── sign-up/            # Clerk sign-up
│   │   ├── layout.tsx          # Root layout with ClerkProvider
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # 3-color theme
│   ├── components/
│   │   ├── ui/                 # Shadcn components
│   │   ├── layout/             # Navbar, Footer
│   │   └── landing/            # Hero, Workflow, CTA sections
│   ├── lib/
│   │   └── utils.ts            # cn() utility
│   └── middleware.ts           # Clerk auth protection
└── components.json             # Shadcn config
```

## Theme System

Strict 3-color palette defined in `globals.css`:

- **Background**: `oklch(0.98 0 0)` (light) / `oklch(0.15 0 0)` (dark)
- **Primary**: `oklch(0.15 0 0)` (light) / `oklch(0.98 0 0)` (dark)
- **Muted**: `oklch(0.88 0 0)` (light) / `oklch(0.25 0 0)` (dark)

All Shadcn variables map to these 3 colors.

## Features

- Animated landing page with Framer Motion
- Clerk authentication (sign-in, sign-up, protected routes)
- Responsive navbar with mobile menu
- Dark/light mode support
- Zero commented code
- Shadcn UI components only

## Routes

- `/` - Landing page
- `/sign-in` - Sign in
- `/sign-up` - Sign up
- `/dashboard` - Protected dashboard (requires auth)
- `/docs` - Documentation (placeholder)
