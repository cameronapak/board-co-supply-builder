# Technology Stack

## Core Framework

- **Astro 5.11.0**: Full-stack web framework with server-side rendering
- **Output Mode**: Server-side rendering with Netlify adapter
- **TypeScript**: Primary language for type safety

## Frontend Stack

- **Alpine.js 3.14.9**: Lightweight reactive framework for interactivity
- **Alpine AJAX 0.12.2**: AJAX utilities for Alpine.js
- **TailwindCSS 4.1.8**: Utility-first CSS framework
- **Basecoat CSS 0.1.2**: UI component library

## Backend & Database

- **Bknd 0.15.0**: Lightweight backend framework with built-in admin
- **LibSQL**: SQLite-compatible database (local development)
- **Turso**: Recommended for production database hosting
- **S3-compatible storage**: For file uploads and artwork storage

## External Integrations

- **Squarespace Commerce API**: Order processing and e-commerce
- **PDF.js**: Client-side PDF rendering and processing
- **PDF-lib**: Server-side PDF manipulation

## Development Tools

- **Prettier**: Code formatting with Astro and TailwindCSS plugins

## Common Commands

### Development

```bash
bun run dev          # Start development server with asset copying
bun run build        # Production build with asset optimization
bun run preview      # Preview production build locally
```

### Database Management

```bash
bun run db:reset-local    # Reset local SQLite database
bun x tsx node_modules/.bin/bknd user create    # Create admin user
```

### Code Quality

```bash
bun run format       # Format code with Prettier
```

## Environment Configuration

- Local development uses file-based SQLite (`.astro/content.db`)
- Production requires LibSQL URL and token
- S3 credentials for file storage
- Squarespace API key for order processing

## Build Process

- Pre-build step copies Bknd admin assets to `public/bknd/`
- Astro handles static site generation and server-side rendering
- Netlify deployment with edge functions support
