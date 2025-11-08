# Agent Guidelines

## Build/Lint/Test Commands

- **Dev server**: `astro dev`
- **Build**: `astro build`
- **Preview**: `astro preview`
- **Test**: `bun test`
- **Format**: `prettier -w .`
- **Reset local DB**: `rm .astro/content.db`

## Architecture

- **Frontend**: Astro + TypeScript + Alpine.js + TailwindCSS + Basecoat UI
- **Backend**: Bknd.io (database, auth, media management)
- **Database**: LibSQL (SQLite local dev, Turso prod)
- **Media**: Local filesystem dev, S3 prod
- **Deployment**: Netlify adapter
- **Integrations**: Stripe payments, Squarespace API, Resend email

## Code Style

- **Formatting**: Prettier (2 spaces, 120 width, no trailing comma)
- **TypeScript**: Strict settings enforced
- **Styling**: Utility-first TailwindCSS (no @apply)
- **Components**: Modular Astro components with clear separation
- **Performance**: Minimize client JS, static generation preferred
- **Imports**: Follow TypeScript/Astro conventions
- **Naming**: Descriptive, camelCase for variables/functions
- **Error Handling**: Graceful with appropriate logging
- **Commits**: Conventional commits (type(scope): description)

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
