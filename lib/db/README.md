# Database Setup

## Overview

The PKHOUSE ECO platform uses PostgreSQL (Neon) as the primary database. The schema includes tables for users, properties, deals, commissions, leads, and agent networks.

## Tables

### Users
- **id**: Primary key
- **email**: Unique user email
- **name**: User full name
- **password_hash**: Hashed password
- **role**: 'consumer', 'middleman', or 'agent'
- **phone**: Optional contact phone
- **avatar_url**: Optional profile picture
- **bio**: Optional bio text
- **created_at, updated_at**: Timestamps

### Properties
- **id**: Primary key
- **title**: Property name
- **description**: Detailed description
- **address**: Street address
- **city, state, zip_code**: Location details
- **property_type**: Type of property
- **price**: Sale/listing price
- **bedrooms, bathrooms, square_feet**: Property specs
- **property_image_url**: Property image
- **agent_id**: Listing agent reference
- **created_at, updated_at**: Timestamps

### Deals
- **id**: Primary key
- **property_id**: Reference to property
- **consumer_id**: Reference to buyer
- **middleman_id**: Optional middleman reference
- **agent_id**: Optional agent reference
- **status**: 'pending', 'in_progress', 'completed', 'cancelled'
- **deal_amount**: Transaction amount
- **created_at, updated_at**: Timestamps

### Commissions
- **id**: Primary key
- **deal_id**: Reference to deal
- **user_id**: Commission recipient
- **commission_percentage**: Percentage amount
- **commission_amount**: Dollar amount
- **status**: 'pending' or 'paid'
- **paid_date**: Date commission was paid
- **created_at**: Timestamp

### Leads
- **id**: Primary key
- **name, email, phone**: Lead contact info
- **source**: Lead source
- **interested_property_type**: What they're looking for
- **budget_min, budget_max**: Budget range
- **middleman_id, agent_id**: Assigned to whom
- **status**: 'new', 'contacted', 'qualified', 'lost'
- **created_at, updated_at**: Timestamps

### Networks
- **id**: Primary key
- **agent_id**: Agent
- **partner_agent_id**: Partner agent
- **status**: 'pending', 'connected', 'inactive'
- **created_at**: Timestamp

## Setup Scripts

### Initialize Database
```bash
npm run init-db
```
Creates all tables and indexes in the database.

### Verify Database
```bash
npm run verify-db
```
Checks that all tables were created successfully.

## Usage in Code

### Query Operations
```typescript
import { query } from '@/lib/db/client';
import { User } from '@/lib/db/types';

// Execute a query
const result = await query('SELECT * FROM users WHERE email = $1', [email]);
```

### Manual Connection
```typescript
import { getClient } from '@/lib/db/client';

const client = await getClient();
try {
  // Use client for transactions or multiple queries
  await client.query('BEGIN');
  // ... multiple operations
  await client.query('COMMIT');
} finally {
  client.release();
}
```

## Environment Variables

Required `.env.local` variables:
- `DATABASE_URL`: PostgreSQL connection string (e.g., from Neon)
- `DATABASE_URL_UNPOOLED`: Unpooled connection for migrations (optional)

## Indexes

The following indexes are created for performance:
- `users`: email, role
- `properties`: agent_id, city
- `deals`: property_id, consumer_id, status
- `commissions`: deal_id, user_id
- `leads`: middleman_id, agent_id
- `networks`: agent_id
