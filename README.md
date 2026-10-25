# Bubbly Admin

Super Admin console for **Bubbly**, a multi-tenant School Management SaaS for preschools. Platform owners and staff use it to manage schools (clients), plans, subscriptions, billing and support. The API lives in the separate backend repository.

> **Status:** early development. The UI is a cleaned-up starter (dashboard, users, account, auth pages) based on the free **Aurora** template. It still shows **demo data** and a **fake login**; real screens and API integration are not built yet.

## Tech stack

| Area | Choice |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 7 |
| Components | Material UI 7 (Emotion), MUI X Data Grid (community) |
| Charts | Apache ECharts 6 |
| Routing | React Router 7 |
| Icons | Iconify (all icons bundled locally, no network calls) |

## Getting started

Requirements: **Node.js 24.x** (latest patch; `nvm use` reads `.nvmrc`) and npm.

```bash
npm ci                       # install exactly what the lockfile says
cp .env.example .env         # then edit values if needed
npm run dev                  # http://localhost:5005
```

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_VERSION` | App version shown in the footer | `$npm_package_version` |
| `VITE_APP_PORT` | Dev/preview server port | `5005` |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (localhost only) |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (must pass with zero warnings) |
| `npm run pretty` | Format with Prettier |

## Project structure

```
src/
├── components/   shared and section components (base, common, sections, settings-panel)
├── data/         demo data (to be replaced by API calls)
├── hooks/  providers/  reducers/  lib/  types/
├── services/     one file per API area (axios): auth, profile, files, staff, audit
├── layouts/      main-layout (sidenav, topbar, footer) and auth-layout
├── pages/        dashboard, users, account, starter, authentication, errors
├── routes/       router, paths and sitemap (sidebar menu)
└── theme/        MUI theme, palette, component overrides
public/           static assets
```

Absolute imports are enabled (for example `import paths from 'routes/paths'`).

## Users & Access

- **Users** (`/users`, needs `users_access.view`): staff list with search, status filter and pages; add, edit, activate or deactivate, delete. Add staff takes you to the detail page to choose permissions.
- **Staff detail** (`/users/:uuid`): Details, **Permissions** (checklist per module; you can only tick what you hold yourself, other boxes are greyed out), **Sessions** (end one or all) and **Login history**. Each tab only shows with its permission. Set a new password and activate or deactivate are buttons at the top.
- **Audit Log** (`/audit-logs`, needs `audit.view`): filter by action, record, dates and text; click a row to see before and after.
- Menu items carry an optional `permission` in `routes/sitemap.ts`; items the admin lacks are hidden. `RequirePermission` in `routes/guards.tsx` shows a "no access" page. The backend enforces the same permissions.
- Needs the backend migration `20261025000107-create-audit-logs-table.js` (run `npm run migration` in the backend).
## Plans and modules
- `/plans`: list with search and status filter; actions edit, publish, duplicate, archive and delete (drafts only). `/plans/new` and `/plans/:uuid` is the form: details, price (entered in rupees, stored in paise), billing interval, GST, limits (each with an Unlimited switch) and the module checklist (core modules are always included).
- A published plan keeps its price, interval, tax setting and link name; the form shows them locked. To change a price, use Duplicate to create a new draft version.
- `/modules`: list of modules with an edit dialog (name, description, order, active; core modules stay active).
- The API calls live in `src/services/planService.ts` and `moduleService.ts`; the limit keys and billing intervals come from `GET /admin/plans/options`, so nothing is hard-coded here.
- Sidebar items carry a `permission` (`plans.view`, `modules.view`) in `routes/sitemap.ts`; the buttons on the pages use `useAuth().hasPermission`. The backend enforces every permission.
## Settings page
`/settings` (menu item Settings, needs `settings.view`) shows the platform settings in tabs: General, Billing & Tax, Policy, Renewals and Email. The forms are built from what the API returns for each setting (label, description, type and limits), so a new setting only needs adding in the backend `config/settings.js`. Each tab saves on its own and shows field errors; without `settings.edit` the fields are read-only. The renewal reminder days are typed as a comma separated list.
## Schools module
- Pages: `/schools` (list with search, status filter and paging), `/schools/new`, `/schools/:uuid` (tabs: Overview form with logo, Notes, Status history). Suspend, reactivate and archive go through a dialog that requires a reason; only an archived school can be deleted.
- Code: `src/pages/schools/`, `src/components/sections/schools/`, `src/services/schoolService.ts`, `src/types/school.ts`. The logo uses `FileUploadBox` with the `clientLogo` file type (its rules come from the backend).
- The sidebar item carries `permission: 'schools.view'`; buttons are shown only when the admin holds the matching `schools.*` permission (the backend enforces it as well).

## Theming and layout

Everything below is built into this app (the free template ships light only, with these features locked).

- **Theme icon in the header** opens a box listing every theme; pick one and it applies instantly.
- **Customize panel** (tab on the right edge) has the same themes as previews, plus layout controls.
- **12 themes:** 6 light (Light, Arctic, Nature, Luxury, Retro, Bubbly) and 6 dark (Dark, Midnight, Graphite, Forest, Plum, Bubbly). **Bubbly** is the playful preschool theme: warm cream and sunny orange in light, a deep grape night sky with candy colours in dark. Defined in `src/theme/presets.ts`; add a preset there and it appears in both places.
- **Layout controls:** navigation position (left, right or top bar), sidebar width (compact, default, wide), collapsed sidebar, content width (fluid or boxed), font family, and Reset.
- All choices are saved in the browser (`localStorage`) and restored on reload.

## Brand and illustrations

- **Logo:** the Bubbly logo as a vector, `public/assets/images/logo.svg` (traced from the supplied PNG, so it stays sharp at any size and has no background). The collapsed sidebar shows `logo-mark.svg`, the orange "B". Component: `src/components/common/Logo.tsx`. If you get an official vector logo from a designer, replace these two SVG files. The browser-tab icon is `public/assets/images/favicon.png` (transparent).
- **Login page:** a full-height illustrated panel (`src/components/illustrations/LoginHero.tsx`) with glossy "Bubbly" mascots (one in a graduation cap), 3D toy blocks, a rainbow and floating bubbles. All colours come from the selected theme, so every theme gets its own look. Mascot and block drawing code is in `BubbleMascot.tsx`. Animations respect `prefers-reduced-motion`. On phones the panel is hidden and only the logo shows.
- **Starter page:** a playground scene (`PlaygroundScene.tsx`). The shared child character is `Kid.tsx`. All illustrations are SVG drawn in code, so they are sharp at any size and need no image files.

## Changes from the original template

Removed or replaced so nothing depends on the template author's services or paid tier:
- "Upgrade to Pro" snackbars, the Pro banner, promo cards, and the locked language, theme-preset and dark-mode menus
- Images that were loaded from an outside website at runtime (avatars, notification images, social-login logos)
- Social login buttons, demo login credentials, external documentation and store links
- The public **Sign up** page: this is the platform admin console, so staff accounts are created by the Super Admin, not by self-registration. School sign-up belongs to the School app
- GSAP (non-MIT license) replaced by a plain SVG path switch in the sidebar toggle
- Unused or deploy-only dependencies (`worker-loader`, `gh-pages`), the extra `pnpm-lock.yaml`, and the template's deploy scripts
- Template branding (name, footer credit, favicon text, CSS variable prefix) renamed to Bubbly
- The dev server now binds to `localhost` only (the template exposed it on the network)
- Dependencies updated; `npm audit` reports 0 vulnerabilities
- Added what the free template locks: a dark colour scheme, theme presets and the layout customizer

## To do before production

- Replace the remaining demo pages and data (Dashboard) with real API calls
- Replace the placeholder logo and demo illustrations with Bubbly assets (the logo and favicon are already Bubbly's)
- Self-host the Google Fonts currently loaded in `index.html` (privacy and speed)
- Add a real documentation link or remove remaining demo pages

## License and credits

This project is proprietary. It includes code from the **Aurora Free** template (MIT, Copyright (c) 2025 ThemeWagon). Keep [LICENSE.md](LICENSE.md) in the repository; it is the notice the MIT license requires.

Other libraries (React, MUI, Emotion, ECharts, Iconify and others) are open source under their own licenses; see `package-lock.json`. Flag graphics used by the demo dashboard are **Twemoji**, Copyright 2020 Twitter, Inc and other contributors, licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). Remove the flags together with the demo data, or keep this credit.
