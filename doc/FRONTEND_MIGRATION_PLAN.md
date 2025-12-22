# Frontend Migration Plan (ShadCN/Refine Vite -> Next.js App Router)

This plan outlines how to integrate the internal management UI from `mypro-fpg-fe` (Vite) into this Next.js project.

## 1. Analysis & key Differences

| Feature | Source (Vite) | Destination (Next.js) | Action |
| :--- | :--- | :--- | :--- |
| **Routing** | React Router (`App.tsx` `<Route>` list) | App Router (File-system based) | Create `app/**/page.tsx` files manually for each route. |
| **Layout** | `AuthenticatedLayout` in `App.tsx` | `app/layout.tsx` or `app/(authenticated)/layout.tsx` | Port layout components and wrap in Next.js Layout. |
| **Styling** | `index.css` (Tailwind) + SCSS | `globals.css` (Tailwind) | Merge Tailwind config and CSS variables. |
| **Auth** | `authProvider` (Vite envs) | `authProvider` (Next.js envs) | Adapt provider to use `process.env`. |
| **Entry** | `App.tsx` (Refine config) | `app/layout.tsx` (Refine config) | Move `<Refine>` config to RootLayout. |

## 2. Migration Steps

### Step 1: Copy Source Code
Copy the following directories from `mypro-fpg-fe/src` to `refine-next-demo/src`:
- `components/` -> `components/` (Merge/Overwrite, be careful with duplicates)
- `hooks/` -> `hooks/`
- `lib/` -> `lib/` (Merge)
- `types/` -> `types/`
- `stores/` -> `stores/`
- `pages/` -> `components/pages/` (Rename to avoid conflict with Next.js router, effectively turning them into "Screen" components)
- `data/` -> `data/`
- `assets/` -> `assets/`
- `providers/` -> `providers/`

### Step 2: Install Dependencies
Ensure all UI libraries from the source `package.json` are installed:
```bash
npm install @radix-ui/react-* lucide-react date-fns dayjs recharts react-day-picker sonner tailwind-merge clsx class-variance-authority framer-motion input-otp next-themes react-resizable-panels vaul zustand
```

### Step 3: Configure Tailwind & Styles
1. Copy `mypro-fpg-fe/src/styles/index.css` content to `src/app/globals.css`.
2. Ensure `tailwind.config.ts` includes `content` paths for the new components (`./src/components/**/*.{ts,tsx}`).

### Step 4: Adapt Providers
1. **Auth Provider**: Update `providers/authProvider.ts` to use `process.env.NEXT_PUBLIC_...` instead of `import.meta.env`.
2. **Data Provider**: Same for `providers/dataProvider.ts`.
3. **Router Provider**: Ensure we use `@refinedev/nextjs-router` instead of `@refinedev/react-router` in the Refine config.

### Step 5: Migrate Routing (The specific pages)
Based on `src/data/sidebar-data.ts`, create the following Next.js pages.
For each item (e.g., `/accounts`):

**`src/app/accounts/page.tsx`**:
```tsx
"use client";
import { AccountList } from "@/components/pages/accounts"; // Imported from copied source
export default function Page() {
  return <AccountList />;
}
```

**List of Pages to Create:**
- `/dashboard`
- `/exchanges`
- `/symbols`
- `/trade_accounts` (and sub-routes like `/trade_accounts/[id]/positions`)
- `/customers`
- `/strategies` (and `/strategies/[id]/rules`)
- `/strategy_templates`
- `/system_configs`
- `/accounts`
- `/roles`

### Step 6: Layout Integration
1. Create `src/app/(authenticated)/layout.tsx` (Route Group) to apply the `AuthenticatedLayout` only to internal pages.
2. Move the `<Refine>` configuration from `App.tsx` to `src/app/layout.tsx`.
3. Ensure `sidebarData` is used by the Sidebar component correctly (it likely iterates over the list, which is fine).

## 3. Execution Order
1. **Dependencies**: `npm install ...`
2. **Copy Files**: `cp -r ...`
3. **Refactor Code**: Fix imports (`@/` alias is already standard in both), fix env vars.
4. **Create Pages**: Generate `page.tsx` files.
5. **Verify**: Run `npm run dev`.
