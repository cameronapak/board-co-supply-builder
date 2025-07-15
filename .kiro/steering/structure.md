# Project Structure

## Root Configuration

- `astro.config.mjs`: Astro framework configuration with Netlify adapter
- `bknd.config.ts`: Backend configuration including database schema and auth
- `package.json`: Dependencies and npm scripts
- `tsconfig.json`: TypeScript configuration
- `.env` / `.env.example`: Environment variables

## Source Code Organization (`src/`)

### Core Application

- `src/middleware.ts`: Astro middleware for Bknd integration and auth redirects
- `src/bknd.ts`: Bknd app initialization and API helpers
- `src/env.d.ts`: TypeScript environment declarations
- `src/bknd-types.d.ts`: Auto-generated Bknd entity types

### Pages (`src/pages/`)

- `src/pages/index.astro`: Main skateboard designer interface
- `src/pages/login.astro`: User authentication
- `src/pages/register.astro`: User registration
- `src/pages/logout.astro`: Logout handler
- `src/pages/404.astro`: Error page
- `src/pages/api/`: API endpoints (handled by Bknd middleware)

### Components (`src/components/`)

- `src/components/SkateboardDesigner.astro`: Main design interface with Alpine.js
- `src/components/SkateboardTemplate.astro`: SVG skateboard template
- `src/components/Header.astro`: Site navigation
- `src/components/Authenticated.astro`: Auth wrapper component

### Actions (`src/actions/`)

- `src/actions/index.ts`: Astro actions registry
- `src/actions/validate.ts`: File validation actions

### Utilities

- `src/utils/index.ts`: Shared utility functions
- `src/styles/global.css`: Global CSS styles

## Database Schema (Bknd)

Defined in `bknd.config.ts`:

- **posts**: Blog/content entities
- **comments**: Comment system
- **orders**: Skateboard order management with user relations

## Static Assets (`public/`)

- `public/bknd/`: Bknd admin interface assets (auto-copied)
- Standard favicon and manifest files
- Images and static resources

## Development Files

- `.astro/`: Astro build cache and generated files
- `.kiro/`: Kiro AI assistant configuration and specs
- `.cursor/rules/`: Cursor IDE rules
- `.github/`: GitHub workflows and templates

## File Naming Conventions

- **Astro components**: PascalCase (e.g., `SkateboardDesigner.astro`)
- **TypeScript files**: camelCase (e.g., `middleware.ts`)
- **Configuration files**: kebab-case or standard names
- **Actions**: Descriptive names in camelCase

## Import Patterns

- Use `@/` alias for `src/` directory imports
- Astro actions imported as `astro:actions`
- Environment variables from `astro:env/server`
- Bknd utilities from `bknd/` package paths

## Architecture Notes

- Server-side rendering with client-side Alpine.js hydration
- Bknd handles all API routes through middleware
- Authentication redirects to custom login/register pages
- File uploads processed through Bknd with S3 storage
