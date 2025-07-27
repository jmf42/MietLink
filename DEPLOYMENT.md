# Deployment Guide

This guide covers deploying MietLink to various hosting platforms with Supabase as the database.

## Prerequisites

- Supabase project with PostgreSQL database
- OpenAI API key for AI features
- Domain name (for production)

## Environment Variables

### Required for All Deployments

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ibdabozisphmmupuavth.supabase.co:5432/postgres
SESSION_SECRET=your-super-secure-production-session-secret
OPENAI_API_KEY=sk-your-production-openai-api-key
NODE_ENV=production
REPLIT_DOMAINS=your-domain.com
```

### Database Connection Types

**Production (Direct Connection):**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ibdabozisphmmupuavth.supabase.co:5432/postgres
```

**Serverless (Transaction Pooler):**
```env
DATABASE_URL=postgresql://postgres.ibdabozisphmmupuavth:[PASSWORD]@aws-0-eu-central-2.pooler.supabase.com:6543/postgres
```

## Platform-Specific Deployments

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

### Railway

1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will auto-detect the Node.js app

### Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Configure environment variables

### DigitalOcean App Platform

1. Create a new app from GitHub
2. Configure the service:
   - Type: Web Service
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Set environment variables

### Heroku

1. Create a new Heroku app
2. Add the Node.js buildpack
3. Set environment variables using Heroku CLI:

```bash
heroku config:set DATABASE_URL="your-supabase-url"
heroku config:set SESSION_SECRET="your-session-secret"
heroku config:set OPENAI_API_KEY="your-openai-key"
heroku config:set NODE_ENV="production"
heroku config:set REPLIT_DOMAINS="your-app.herokuapp.com"
```

### VPS/Dedicated Server

1. Install Node.js 18+ and PM2
2. Clone your repository
3. Install dependencies: `npm install`
4. Create `.env` file with production variables
5. Build the application: `npm run build`
6. Start with PM2:

```bash
pm2 start npm --name "mietlink" -- start
pm2 save
pm2 startup
```

## Database Setup

Before deploying, ensure your Supabase database is properly configured:

```bash
# Push database schema
npm run db:push

# Or run migrations
npm run db:migrate
```

## SSL/HTTPS Configuration

Most hosting platforms provide automatic SSL. For custom domains:

1. Configure your DNS to point to the hosting platform
2. Enable SSL in your hosting platform dashboard
3. Update `REPLIT_DOMAINS` to use `https://`

## Authentication Setup

For production authentication with Replit Auth:

1. Configure your production domain in `REPLIT_DOMAINS`
2. Ensure callback URLs are properly set
3. Test the login flow after deployment

## Monitoring and Logging

### Error Tracking
Consider adding error tracking services:
- Sentry for error monitoring
- LogRocket for user session replay
- DataDog for application performance monitoring

### Health Checks
Most platforms support health check endpoints. The app responds at:
- `GET /api/health` (if implemented)
- `GET /` (landing page)

## Performance Optimization

### Production Build
The build process optimizes:
- TypeScript compilation
- Frontend bundling with Vite
- Asset optimization
- Code splitting

### Database Optimization
- Use connection pooling (built-in with current setup)
- Monitor query performance with Supabase dashboard
- Consider read replicas for high traffic

### Caching
- Enable gzip compression (most platforms do this automatically)
- Consider CDN for static assets
- Implement Redis for session caching if needed

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate secrets regularly

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use connection pooling to prevent connection exhaustion
- Monitor database access logs

### Application Security
- HTTPS only in production
- Secure session configuration
- Input validation and sanitization
- Regular dependency updates

## Troubleshooting

### Common Deployment Issues

**Database Connection Failed:**
- Verify DATABASE_URL is correct
- Check Supabase project is running
- Ensure IP restrictions allow hosting platform

**Authentication Not Working:**
- Verify REPLIT_DOMAINS matches your domain
- Check callback URLs
- Ensure HTTPS is enabled

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are included
- Review build logs for specific errors

**Environment Variables:**
- Ensure all required variables are set
- Check for typos in variable names
- Verify values don't contain special characters

## Rollback Strategy

1. Keep previous working deployment tagged
2. Database migrations should be reversible
3. Environment variables should be backed up
4. Have a tested rollback procedure

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Database connections work
- [ ] Authentication flow functions
- [ ] AI features operational (OpenAI API)
- [ ] All pages and routes accessible
- [ ] Language switching works
- [ ] File uploads function properly
- [ ] Session management working
- [ ] Error handling appropriate
- [ ] Performance is acceptable

## Support

For deployment issues:
1. Check the hosting platform's documentation
2. Review application logs
3. Test with local development setup first
4. Verify environment variables match requirements