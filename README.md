# PKHOUSE ECO - Real Estate Ecosystem Platform

A comprehensive Next.js application for managing real estate transactions with support for consumers, middlemen, and agents.

## Features

- **Consumer Portal**: Browse properties, search listings, calculate mortgages
- **Middleman Dashboard**: Manage deals, track commissions, source leads
- **Agent Network**: Track partnerships, manage commissions, build networks
- **Authentication**: Secure sign-in/sign-up with NextAuth
- **Property Management**: Create, edit, and manage property listings
- **Deal Tracking**: Monitor deals and commissions
- **Lead Management**: Capture and manage leads

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for data operations
│   ├── api/              # API routes
│   ├── agent/            # Agent-related pages
│   ├── consumer/         # Consumer-related pages
│   ├── middleman/        # Middleman-related pages
│   ├── properties/       # Property management pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── consumer/         # Consumer-specific components
│   └── middleman/        # Middleman-specific components
├── lib/
│   ├── auth.ts           # Authentication configuration
│   ├── db/               # Database schemas
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
pnpm build
pnpm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Technologies Used

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **NextAuth**: Authentication
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Radix UI**: Accessible component primitives

## License

MIT