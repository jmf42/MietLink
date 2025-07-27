# MietLink - Swiss Rental Platform

MietLink is a comprehensive Swiss rental handover platform that connects outgoing tenants with pre-vetted incoming candidates, automating the "Nachmieter" process from application to landlord approval.

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account with PostgreSQL database

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd mietlink

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your actual values:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.ibdabozisphmmupuavth:YOUR_ACTUAL_PASSWORD@aws-0-eu-central-2.pooler.supabase.com:6543/postgres

# Session Secret (generate a strong random string)
SESSION_SECRET=your-local-development-session-secret-at-least-32-characters-long

# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Development Settings
NODE_ENV=development
REPLIT_DOMAINS=localhost:5000,127.0.0.1:5000
```

### 3. Database Setup

```bash
# Push database schema to Supabase
npm run db:push

# Optional: Generate and run migrations
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5000` to see the application.

## 🏗️ Architecture

### Database Options

**Transaction Pooler (Recommended for Local Development):**
- Best for serverless and stateless applications
- Connection string: `postgresql://postgres.ibdabozisphmmupuavth:[PASSWORD]@aws-0-eu-central-2.pooler.supabase.com:6543/postgres`

**Direct Connection (For Production/Long-running Apps):**
- Best for persistent applications with long-lived connections
- Connection string: `postgresql://postgres:[PASSWORD]@db.ibdabozisphmmupuavth.supabase.co:5432/postgres`

### Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM with Node-Postgres driver
- **Authentication:** Replit Auth (OpenID Connect)
- **AI:** OpenAI GPT-4o for contract parsing and document processing
- **Session Storage:** PostgreSQL-based sessions

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── db.ts             # Database connection (Supabase)
│   ├── routes.ts         # API routes
│   ├── replitAuth.ts     # Authentication setup
│   ├── storage.ts        # Data access layer
│   └── openai.ts         # AI integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── migrations/           # Database migrations
```

## 🌍 Multi-language Support

The platform supports 5 languages:
- 🇩🇪 German (DE)
- 🇫🇷 French (FR) 
- 🇮🇹 Italian (IT)
- 🇬🇧 English (EN)
- 🇪🇸 Spanish (ES)

## 🔑 Key Features

### For Outgoing Tenants
- Property setup wizard with contract parsing
- Automated task generation from lease obligations
- Candidate application management
- Visit scheduling system

### For Incoming Tenants  
- Property discovery through public links
- Document upload with AI classification
- Cover letter generation assistance
- Application tracking

### For Landlords/Property Managers
- Curated candidate dossiers
- Scoring and ranking system
- Decision tracking and management

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ibdabozisphmmupuavth.supabase.co:5432/postgres
SESSION_SECRET=your-production-session-secret
OPENAI_API_KEY=sk-your-production-openai-key
NODE_ENV=production
REPLIT_DOMAINS=your-domain.com
```

### Deployment Steps

1. Set up production database in Supabase
2. Configure environment variables
3. Run database migrations: `npm run db:push`
4. Build the application: `npm run build`
5. Deploy to your hosting platform

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## 📝 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/callback` - OAuth callback

### Properties
- `GET /api/properties/my` - Get user's properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details

### AI Services
- `POST /api/ai/parse-contract` - Parse rental contract
- `POST /api/documents/upload` - Upload and classify documents

## 🛡️ Security Considerations

- Session-based authentication with PostgreSQL storage
- Environment-based SSL configuration
- CORS and security headers configured
- Input validation with Zod schemas
- File upload size limits (50MB)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.