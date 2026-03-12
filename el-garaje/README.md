# El Garaje de las Guitarras 🎸

A modern e-commerce platform for vintage and high-end guitars, amplifiers, and musical instruments. Built with Astro, Tailwind CSS, and Supabase.

## Overview

El Garaje de las Guitarras is a specialized online store featuring:
- Vintage and high-end electric and acoustic guitars
- Premium amplifiers and effects pedals
- Bass guitars and accessories
- Consignment services for instrument sales
- Private showroom for in-person testing

## Tech Stack

- **Framework**: [Astro 5.17](https://astro.build) - Static site generation with SSR capabilities
- **Styling**: [Tailwind CSS 4.2](https://tailwindcss.com) - Utility-first CSS framework
- **Database**: [Supabase](https://supabase.com) - PostgreSQL database with authentication
- **Deployment**: [Vercel](https://vercel.com) - Edge deployment platform
- **Additional**: Sitemap generation, SEO optimization

## Features

### Customer-Facing
- **Product Catalog**: Browse guitars, amplifiers, basses, and effects by category
- **Product Details**: Comprehensive specifications, image galleries, and pricing
- **Featured Products**: Curated showcase of premium instruments
- **Shopping Cart**: Add items and contact via WhatsApp for purchase
- **Hero Carousel**: Auto-rotating promotional slides with touch/swipe support
- **Responsive Design**: Mobile-first approach with accessibility features
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

### Admin Panel
- **Authentication**: Secure login system via Supabase Auth
- **Product Management**: Create, edit, and delete products
- **Image Upload**: Multi-image support with drag-and-drop
- **Category Management**: Organize products by type
- **Status Control**: Mark products as available, sold, or reserved
- **Featured Products**: Toggle featured status for homepage display

### Additional Services
- **Consignments**: Accept instruments for consignment sales
- **Inspections**: Pre-purchase inspection services
- **Private Showroom**: Book appointments to test instruments

## Project Structure

```
el-garaje/
├── public/              # Static assets (images, audio, favicon)
├── src/
│   ├── assets/         # Build-time assets
│   ├── components/     # Reusable Astro components
│   │   ├── cart/      # Shopping cart components
│   │   ├── category/  # Category filtering
│   │   ├── layout/    # Header, footer, navigation
│   │   ├── product/   # Product cards, galleries, specs
│   │   └── ui/        # UI elements (breadcrumbs, etc.)
│   ├── layouts/       # Page layouts
│   ├── lib/           # Utilities and business logic
│   │   ├── queries.ts        # Database queries
│   │   ├── supabase.ts       # Supabase client
│   │   ├── types.ts          # TypeScript types
│   │   ├── cartStore.ts      # Shopping cart state
│   │   └── whatsapp.ts       # WhatsApp integration
│   ├── pages/         # File-based routing
│   │   ├── admin/            # Admin panel pages
│   │   ├── api/              # API endpoints
│   │   ├── categoria/        # Category pages
│   │   └── producto/         # Product detail pages
│   └── styles/        # Global CSS
├── supabase/          # Database migrations
├── astro.config.mjs   # Astro configuration
├── package.json       # Dependencies
└── schema.sql         # Initial database schema
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd el-garaje
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the `el-garaje` directory:
```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

4. Set up the database:

Run the SQL schema in your Supabase SQL Editor:
```bash
# Copy contents of schema.sql and run in Supabase dashboard
```

If the project already exists and you want to fix the current warnings without rebuilding data, run:
```bash
# Copy contents of supabase/harden-admin-access.sql and run in Supabase dashboard
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:4321` to see the site.

## Available Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally before deploying |
| `npm run astro` | Run Astro CLI commands |

## Database Schema

### Tables

- **categories**: Product categories (guitars, amps, effects, etc.)
- **products**: Product listings with specs, pricing, and status
- **product_images**: Multiple images per product with sort order

### Key Features

- Row Level Security (RLS) enabled
- Public read access for storefront content
- Admin-only write access backed by `profiles.is_admin`
- Automatic profile creation trigger for new auth users
- Storage bucket policies limited to admin uploads/edits
- JSONB specifications field for flexible product attributes

## Admin Panel

Access the admin panel at `/admin/login`

### Features
- Secure authentication via Supabase
- Product CRUD operations
- Image upload and management
- Category assignment
- Status management (available/sold/reserved)
- Featured product toggle

### Required Supabase Auth Setting

To clear the `Leaked Password Protection Disabled` warning from the Supabase advisor, enable leaked password protection in:

`Authentication -> Sign In / Providers -> Password security`

That setting lives in the Supabase dashboard and cannot be changed from this repository alone.

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
```

The static site will be generated in `./dist/` and can be deployed to any static hosting service.

## Configuration

### Astro Config

Key settings in `astro.config.mjs`:
- Site URL for sitemap generation
- Vercel adapter for edge deployment
- Tailwind CSS integration
- Security settings for form submissions

### Tailwind CSS

Tailwind 4.2 is configured via Vite plugin with custom theme in `src/styles/global.css`.

## Security

- Environment variables for sensitive data
- Row Level Security on database
- CORS configuration for API endpoints
- Secure admin authentication
- Input validation on forms

## Performance

- Static site generation for fast loading
- Image optimization
- Lazy loading for images
- Minimal JavaScript bundle
- Edge deployment via Vercel

## SEO

- Semantic HTML structure
- Meta tags for all pages
- Sitemap generation
- Structured data for products
- Accessible navigation and ARIA labels

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch/swipe gestures for carousel
- Progressive enhancement approach

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

All rights reserved.

## Contact

For questions or support, visit [elgarajedelasguitarras.com](https://www.elgarajedelasguitarras.com)
