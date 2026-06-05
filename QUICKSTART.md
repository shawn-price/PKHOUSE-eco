# PKHOUSE ECO - Quick Start Guide

## Overview

PKHOUSE ECO is a complete real estate ecosystem platform built with Next.js 14, TypeScript, and PostgreSQL. It includes:
- User authentication and profiles
- Property management and browsing
- Contact directory
- Real-time messaging
- AI-powered assistant
- Admin dashboard

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Neon PostgreSQL database URL
- NextAuth secret token

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create/update `.env.local`:
```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret-here>

# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3. Initialize Database
```bash
npm run migrate
```

This creates all 16 tables with proper indexes.

### 4. Verify Setup
```bash
npm run verify-db
```

## Running the Application

### Development
```bash
npm run dev
```

Access at: http://localhost:3000

### Production
```bash
npm run build
npm start
```

## Quick Navigation

| Feature | URL | Description |
|---------|-----|-------------|
| Home | `/` | Landing page |
| Register | `/auth/register` | Create new account |
| Login | `/auth/login` | Sign in |
| Dashboard | `/dashboard` | User main dashboard |
| Properties | `/properties` | Browse all properties |
| Profile | `/dashboard/profile` | Edit user profile |
| Contacts | `/dashboard/contacts` | Manage contacts |
| Messages | `/dashboard/messages` | User messaging |
| AI Chat | `/ai-chat` | AI assistant |
| Admin | `/admin` | System administration |

## Test Credentials

### Creating Test Account
1. Go to http://localhost:3000/auth/register
2. Enter email, name, password (8+ chars), select role
3. Choose role: Consumer, Middleman, or Agent
4. Click "Sign Up"

### Default Demo User
To create a demo user directly:
```bash
npm run seed-demo  # (if available)
```

Or register manually through the UI.

## Database

### Schema Overview
```
Users (authentication)
├── Properties (real estate listings)
├── Deals (transactions)
├── Commissions (payment tracking)
├── Leads (lead management)
├── Networks (agent partnerships)
├── Contacts (user directory)
├── Messages (direct messaging)
└── AI System (agent configs, embeddings, settings)
```

### View Database
```bash
# Verify tables
npm run verify-db

# Check migrations
npm run migrate
```

## API Endpoints

### Properties
```
GET    /api/properties              # List properties
POST   /api/properties              # Create property
GET    /api/properties/[id]         # Get property
PUT    /api/properties/[id]         # Update property
DELETE /api/properties/[id]         # Delete property
GET    /api/my-properties           # Agent's properties
```

### Contacts
```
GET    /api/contacts                # List contacts
POST   /api/contacts                # Create contact
GET    /api/contacts/[id]           # Get contact
PUT    /api/contacts/[id]           # Update contact
DELETE /api/contacts/[id]           # Delete contact
```

### Messages
```
GET    /api/messages                # List conversations
POST   /api/messages                # Send message
POST   /api/messages/[id]/read      # Mark as read
```

### Users
```
GET    /api/users/profile           # Get profile
PUT    /api/users/profile           # Update profile
```

### AI
```
POST   /api/ai/chat                 # Send message to AI
```

### Admin
```
GET    /api/admin/stats             # System statistics
```

## Common Tasks

### Add a Property (as Agent)
1. Login as Agent role
2. Go to `/dashboard/agent`
3. Click "Add New Property"
4. Fill form and submit
5. View at `/properties` or `/properties/[id]`

### Send a Message
1. Go to `/dashboard/messages`
2. Select recipient from list
3. Type message and click Send
4. Message appears in thread

### Manage Contacts
1. Go to `/dashboard/contacts`
2. Click "Add Contact" to create
3. Filter by type (agent, broker, etc.)
4. Click contact to edit or delete

### Chat with AI Assistant
1. Go to `/ai-chat`
2. Ask about properties, financing, agents
3. AI responds with suggestions and info

### View System Stats
1. Go to `/admin` (any user can access for now)
2. See total users, properties, deals, messages, contacts
3. Access management tools

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` in `.env.local`
- Check Neon credentials
- Run `npm run verify-db`

### Authentication Issues
- Clear browser cookies: DevTools → Application → Cookies
- Verify `NEXTAUTH_SECRET` is set
- Check `/api/auth/[...nextauth]` route

### Properties Not Showing
- Verify database has properties
- Check filters (city, type)
- Run `npm run verify-db` to confirm tables exist

### Messages Not Working
- Verify both users exist
- Check message API: `GET /api/messages`
- Confirm session is active

### AI Chat Not Responding
- Check API response: `POST /api/ai/chat`
- Verify message is not empty
- Check browser console for errors

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code quality
npm run init-db      # Initialize database
npm run migrate      # Run migrations
npm run verify-db    # Verify database setup
```

## Project Structure

```
app/                 # Next.js App Router pages
├── auth/           # Authentication pages
├── dashboard/      # User dashboards
├── properties/     # Property pages
├── admin/          # Admin dashboard
├── api/            # API routes
└── ai-chat/        # AI chat interface

lib/
├── db/             # Database queries and schema
├── ai/             # AI/NLP utilities
├── auth.ts         # NextAuth config
└── validation/     # Zod schemas

components/         # React components
scripts/            # Utility scripts
public/             # Static assets
```

## Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables (Production)
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Secure random token
- `DATABASE_URL` - Neon database URL
- `POSTGRES_URL` - Same as DATABASE_URL

## Next Steps

1. **Customize** - Modify branding, colors, text
2. **Deploy** - Push to production on Vercel
3. **Extend** - Add image uploads, payments, more features
4. **Monitor** - Set up logging and error tracking

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for full docs
2. Review API endpoint structure
3. Check database schema in `lib/db/schema.sql`
4. Review error logs in browser console

## Key Features

- ✓ User authentication with email/password
- ✓ Role-based access (consumer, middleman, agent)
- ✓ Property CRUD with advanced filtering
- ✓ Contact directory management
- ✓ Real-time messaging between users
- ✓ AI assistant with NLP
- ✓ Admin dashboard with statistics
- ✓ Type-safe codebase with TypeScript
- ✓ Beautiful UI with Tailwind CSS
- ✓ Production-ready security

---

**Status**: Ready for development and deployment
**Last Updated**: June 2026
