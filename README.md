# Skateboard Deck Designer App for Board Co Supply

A web application that allows customers to design custom skateboard decks by uploading artwork (images or PDFs) and positioning it on a skateboard template. The app provides an interactive design interface with zoom, pan, and rotation controls, then processes orders through Squarespace Commerce API integration.

## Features

- **Interactive Design Tool**: Upload and position artwork on skateboard template with real-time preview
- **File Support**: Handles both image files and PDF artwork with validation using PDF.js and PDF-lib
- **Order Processing**: Integrates with Squarespace Commerce API for e-commerce functionality
- **User Management**: Authentication system with user accounts and order history
- **Admin Interface**: Backend management through Bknd admin panel
- **Responsive Design**: Works across desktop and mobile devices

## Technology Stack

### Core Framework

- **[Astro 5.11.0](https://astro.build)**: Full-stack web framework with server-side rendering
- **TypeScript**: Primary language for type safety
- **Netlify Adapter**: Server-side rendering deployment

### Frontend

- **[Alpine.js 3.14.9](https://alpinejs.dev)**: Lightweight reactive framework for interactivity
- **[Alpine AJAX 0.12.2](https://alpine-ajax.js.org/)**: AJAX utilities for Alpine.js
- **[TailwindCSS 4.1.8](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Basecoat CSS 0.1.2](https://basecoatui.com/)**: UI component library

### Backend & Database

- **[Bknd 0.15.0](https://bknd.io)**: Lightweight backend framework with built-in admin
- **LibSQL**: SQLite-compatible database (local development)
- **Turso**: Recommended for production database hosting
- **S3-compatible storage**: For file uploads and artwork storage

### External Integrations

- **Squarespace Commerce API**: Order processing and e-commerce
- **PDF.js 5.3.93**: Client-side PDF rendering and processing
- **PDF-lib 1.17.1**: Server-side PDF manipulation

## Project Structure

```
src/
├── components/           # Astro components
│   ├── SkateboardDesigner.astro    # Main design interface
│   ├── SkateboardTemplate.astro    # SVG skateboard template
│   ├── Header.astro               # Site navigation
│   └── Authenticated.astro        # Auth wrapper
├── pages/               # Astro pages
│   ├── index.astro     # Main designer interface
│   ├── login.astro     # User authentication
│   ├── register.astro  # User registration
│   └── api/            # API endpoints (handled by Bknd)
├── actions/            # Astro actions
│   ├── index.ts        # Actions registry
│   └── validate.ts     # File validation
├── utils/              # Shared utilities
└── styles/             # Global CSS
```

## Installation

### Prerequisites

- Node.js (see `.nvmrc` for version)
- npm or yarn package manager

### Clone and Install

```bash
git clone <repository-url>
cd skateboard-designer
npm install
```

### Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database (for production)
LIBSQL_DATABASE_URL="your-turso-database-url"
LIBSQL_DATABASE_TOKEN="your-turso-auth-token"

# S3-compatible storage for file uploads
S3_API_URL="your-s3-endpoint"
S3_ACCESS_KEY="your-s3-access-key"
S3_SECRET_ACCESS_KEY="your-s3-secret-key"

# Squarespace Commerce API
SQUARESPACE_API_KEY="your-squarespace-api-key"
```

### Database Setup

For local development, the app uses a file-based SQLite database automatically. For production, set up a [Turso](https://turso.tech) database.

Create an admin user:

```bash
npx tsx node_modules/.bin/bknd user create
```

## Development

### Start Development Server

```bash
# Use correct Node version (if using nvm)
nvm use

# Start development server
npm run dev
```

The app will be available at `http://localhost:4321`

### Available Scripts

```bash
npm run dev          # Start development server with asset copying
npm run build        # Production build with asset optimization
npm run preview      # Preview production build locally
npm run format       # Format code with Prettier
npm run db:reset-local  # Reset local SQLite database
```

## Usage

### For Customers

1. **Design Creation**: Upload artwork (images or PDFs) and position on skateboard template
2. **Interactive Controls**: Use zoom, pan, and rotation to perfect your design
3. **Order Placement**: Complete customer information and submit order through Squarespace integration
4. **Order Tracking**: View order history and status (for registered users)

### For Administrators

Access the admin panel at `/admin` to:

- Manage users and orders
- View uploaded artwork files
- Monitor system activity
- Configure backend settings

## API Integration

### Squarespace Commerce

The app integrates with Squarespace Commerce API for order processing:

- Automatic order creation with customer data
- Pricing calculation with artwork fees
- Order status tracking
- Error handling with retry logic

### File Storage

Artwork files are stored using S3-compatible storage:

- Secure file upload and access
- Automatic file cleanup
- Integration with order records

## Deployment

### Netlify (Recommended)

The app is configured for Netlify deployment with server-side rendering:

```bash
npm run build
```

Deploy the `dist/` folder to Netlify or use their Git integration.

### Environment Variables

Set the following in your deployment environment:

- All variables from `.env.example`
- Ensure S3 storage is accessible from your deployment region
- Configure Squarespace API key with proper permissions

## Contributing

1. Follow the existing code style (Prettier configuration included)
2. Use TypeScript for type safety
3. Test changes locally before submitting
4. Update documentation for new features

## Architecture Notes

- **Server-side rendering** with client-side Alpine.js hydration
- **Bknd middleware** handles all API routes automatically
- **Authentication** redirects to custom login/register pages
- **File uploads** processed through Bknd with S3 storage
- **Order processing** integrates with Squarespace Commerce API
