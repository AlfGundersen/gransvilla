# Gransvilla

A modern event venue and shop website built with Next.js, Sanity CMS, and Shopify.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **CMS**: Sanity v5
- **E-commerce**: Shopify Storefront API
- **Styling**: CSS Modules
- **Animations**: Framer Motion, Lenis (smooth scroll)
- **Hosting**: Netlify
- **Newsletter**: Mailjet

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Sanity project
- Shopify store with Storefront API access

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `SANITY_API_TOKEN` - Sanity write token for syncing
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Your Shopify store domain
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API token
- `SHOPIFY_WEBHOOK_SECRET` - For Shopify webhook verification
- `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` - Newsletter integration

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Sanity Studio

The Sanity Studio is embedded at `/studio`. Access it in development or configure authentication for production.

## Project Structure

```
src/
├── app/
│   ├── (site)/        # Public pages (home, events, shop, etc.)
│   ├── api/           # API routes (cart, newsletter, webhooks)
│   ├── studio/        # Embedded Sanity Studio
│   └── passord/       # Password protection (dev only)
├── components/
│   ├── layout/        # Header, Footer, navigation
│   ├── sections/      # Page sections (Hero, Events, Products)
│   ├── cart/          # Shopping cart components
│   └── seo/           # SEO and structured data
├── lib/
│   ├── sanity/        # Sanity client, queries, image helpers
│   └── shopify/       # Shopify client, queries, cart operations
├── context/           # React context (cart state)
└── types/             # TypeScript definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm check:fix` | Lint and format in one command |

## API Endpoints

- `POST /api/cart` - Cart operations (create, add, update, remove)
- `POST /api/checkout` - Create Shopify checkout
- `POST /api/newsletter` - Newsletter subscription
- `POST /api/revalidate/shopify` - Shopify webhook for cache revalidation
- `POST /api/sync/collections` - Sync Shopify collections to Sanity

## Deployment

The site deploys to Netlify. Ensure environment variables are set in Netlify's dashboard.

### Shopify Webhooks

Configure these webhooks in Shopify to point to your deployed site:
- `products/create`, `products/update`, `products/delete` → `/api/revalidate/shopify`

## License

Private - All rights reserved
