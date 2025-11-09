# Agent Guidelines

## Build/Lint/Test Commands

- **Dev server**: `astro dev`
- **Dev server (production mode)**: `PROD=true dotenv -e .env -- astro dev`
- **Build**: `astro build`
- **Preview**: `astro preview`
- **Test all**: `bun test`
- **Test single file**: `bun test <path-to-test-file>` (e.g., `bun test src/services/squarespace.test.ts`)
- **Format**: `prettier -w .`
- **Reset local DB**: `rm .astro/content.db`
- **Update packages**: `bun update --interactive`
- **Pre-build/copy assets**: `bknd copy-assets --out public/bknd --clean`

## Architecture

- **Frontend**: Astro + TypeScript + Alpine.js + TailwindCSS + Basecoat UI
- **Backend**: Bknd.io (database, auth, media management with code-only mode)
- **Database**: LibSQL (SQLite local dev, Turso prod) with schema defined in bknd.config.ts
- **Media**: Local filesystem dev, S3 prod (configured via bknd.config.ts)
- **Deployment**: Netlify adapter with server-side rendering
- **Integrations**: Stripe payments, Squarespace API, Resend email
- **Authentication**: Bknd.io auth with JWT, role-based permissions (admin/default roles)
- **Core Entities**: orders (skateboard orders), media (file management)
- **Order Schema**: userId, size, type (popsicle/shovel), stripeOrderId, designConfig (JSON), artwork, canvas, status, emailSent, comments, timestamps

## Code Style

- **Formatting**: Prettier (2 spaces, 120 width, no trailing comma, with Astro and TailwindCSS plugins)
- **TypeScript**: Strict settings enforced (extends astro/tsconfigs/strict)
- **Styling**: Utility-first TailwindCSS (no @apply, v4.x)
- **Components**: Modular Astro components with clear separation
- **Performance**: Minimize client JS, static generation preferred
- **Imports**: Follow TypeScript/Astro conventions, path aliases (@/_ for src/_)
- **Naming**: Descriptive, camelCase for variables/functions, PascalCase for components
- **Error Handling**: Graceful with appropriate logging
- **Commits**: Conventional commits (type(scope): description)
- **Testing**: Bun test framework with mocks, descriptive test names
- **JSX**: React JSX syntax (jsx: "react-jsx", jsxImportSource: "react")

## Project Structure

- `src/components/`: Astro components
- `src/pages/`: File-based routing
- `src/layouts/`: Page layouts
- `src/actions/`: Server actions
- `src/services/`: Business logic
- `src/utils/`: Utility functions
- `src/types/`: Type definitions
- `public/`: Static assets
- `bknd.config.ts`: Backend configuration

## Rules

- Enforce strict TypeScript for type safety
- Use Basecoat UI and TailwindCSS with utility-first approach
- Create modular, reusable Astro components
- Maintain clear separation of concerns
- Implement proper cache control headers
- Prioritize static generation and minimal JavaScript
- Use descriptive variable names and follow Astro's conventions
