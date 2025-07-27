# Local Development Setup Guide

This guide will help you set up MietLink for local development with Supabase.

## Step 1: Supabase Database Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Find your connection string under "Connection Pooling"

## Step 2: Choose Connection Type

### Option A: Transaction Pooler (Recommended for Local Development)
- **Best for:** Local development, serverless functions
- **Connection String:** `postgresql://postgres.ibdabozisphmmupuavth:[YOUR-PASSWORD]@aws-0-eu-central-2.pooler.supabase.com:6543/postgres`
- **Limitations:** Does not support PREPARE statements

### Option B: Direct Connection
- **Best for:** Production applications with persistent connections
- **Connection String:** `postgresql://postgres:[YOUR-PASSWORD]@db.ibdabozisphmmupuavth.supabase.co:5432/postgres`
- **Requirements:** IPv6 compatible network or IPv4 add-on

## Step 3: Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   # Use Transaction Pooler for local development
   DATABASE_URL=postgresql://postgres.ibdabozisphmmupuavth:YOUR_ACTUAL_PASSWORD@aws-0-eu-central-2.pooler.supabase.com:6543/postgres
   
   # Generate a random session secret (32+ characters)
   SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long
   
   # Your OpenAI API key for AI features
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   
   # Local development settings
   NODE_ENV=development
   REPLIT_DOMAINS=localhost:5000,127.0.0.1:5000
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Database Schema Setup

```bash
# Push the database schema to Supabase
npm run db:push
```

This will create all necessary tables in your Supabase database:
- `users` - User profiles and authentication data
- `sessions` - Session storage for authentication
- `properties` - Property listings
- `candidates` - Applicant information
- `documents` - Document storage metadata
- `tasks` - Tenant obligations and tasks
- `visit_slots` - Available viewing times

## Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5000`
- API: `http://localhost:5000/api`

## Step 7: Test the Setup

1. Open `http://localhost:5000`
2. You should see the landing page
3. Try clicking "Login" to test authentication
4. Create a test property to verify database connectivity

## Common Issues and Solutions

### Database Connection Issues

**Error:** `Connection timeout`
- **Solution:** Check your DATABASE_URL is correct and includes the password
- **Check:** Ensure your IP is allowed in Supabase (should be automatic)

**Error:** `SSL/TLS errors`
- **Solution:** The connection is configured to handle SSL automatically

### Authentication Issues

**Error:** `REPLIT_DOMAINS not provided`
- **Solution:** Ensure `.env.local` includes `REPLIT_DOMAINS=localhost:5000`

**Error:** `Session not working`
- **Solution:** Check that SESSION_SECRET is set and the sessions table exists

### OpenAI API Issues

**Error:** `OpenAI API key not found`
- **Solution:** Set `OPENAI_API_KEY` in your `.env.local` file
- **Get API Key:** Visit [platform.openai.com](https://platform.openai.com/api-keys)

## Database Management

### View Database in Browser
```bash
npm run db:studio
```

### Reset Database Schema
```bash
# Warning: This will delete all data
npm run db:push --force
```

### Generate New Migration
```bash
npm run db:generate
```

## Production Deployment

When deploying to production:

1. Use the Direct Connection string for better performance
2. Set `NODE_ENV=production`
3. Use HTTPS domains in `REPLIT_DOMAINS`
4. Ensure strong `SESSION_SECRET`

Example production `.env`:
```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.ibdabozisphmmupuavth.supabase.co:5432/postgres
SESSION_SECRET=your-very-secure-production-secret
OPENAI_API_KEY=sk-your-production-openai-key
NODE_ENV=production
REPLIT_DOMAINS=your-domain.com
```

## Need Help?

- Check the main `README.md` for architecture details
- Review `replit.md` for project-specific context
- Ensure all environment variables match the examples above