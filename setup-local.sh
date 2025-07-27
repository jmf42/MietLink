#!/bin/bash

# MietLink Local Development Setup Script
echo "🏠 Setting up MietLink for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment template if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your actual values:"
    echo "   - Add your Supabase database password"
    echo "   - Add your OpenAI API key"
    echo "   - Set a secure session secret"
else
    echo "✅ .env.local already exists"
fi

# Check if required environment variables are set
echo "🔧 Checking environment setup..."

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it from .env.local.example"
    exit 1
fi

# Source the .env.local file to check variables
set -a
source .env.local 2>/dev/null || true
set +a

if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"YOUR_ACTUAL_PASSWORD"* ]]; then
    echo "❌ DATABASE_URL not properly configured in .env.local"
    echo "   Please replace YOUR_ACTUAL_PASSWORD with your actual Supabase password"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ] || [[ "$OPENAI_API_KEY" == *"your-actual-openai-api-key"* ]]; then
    echo "⚠️  OPENAI_API_KEY not configured - AI features will not work"
fi

if [ -z "$SESSION_SECRET" ] || [[ "$SESSION_SECRET" == *"your-local-development"* ]]; then
    echo "⚠️  SESSION_SECRET not properly configured - please set a secure secret"
fi

echo "✅ Environment variables checked"

# Test database connection
echo "🗄️  Testing database connection..."
if npm run db:push > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL"
    echo "   Make sure your Supabase database is accessible and the password is correct"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your MietLink development environment is ready."
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your actual API keys and passwords"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run db:studio    - Open database management UI"
echo "  npm run db:push      - Update database schema"
echo ""
echo "For detailed setup instructions, see setup-local.md"