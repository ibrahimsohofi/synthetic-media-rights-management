# Deployment Guide

This document provides instructions for deploying the application to Vercel or Netlify.

## Prerequisites

- A GitHub repository with your project code
- A Vercel or Netlify account
- PostgreSQL database (recommended for production)
- Redis instance (Upstash recommended)

## Environment Variables

You'll need to set the following environment variables in your deployment platform:

```
NEXTAUTH_SECRET=<your-strong-secret-key>
NEXTAUTH_URL=<your-deployment-url>
DATABASE_URL=<your-database-connection-string>
UPSTASH_REDIS_REST_URL=<your-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
```

## Deploying to Vercel

1. Push your code to GitHub
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (this runs prisma generate and migrate)
   - **Output Directory**: `.next`
6. Add the environment variables listed above
7. Click "Deploy"

## Deploying to Netlify

1. Push your code to GitHub
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repository
5. Configure the following settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add the environment variables listed above
7. Click "Deploy site"

## Database Setup

For production, we recommend using PostgreSQL instead of SQLite. Update your `schema.prisma` file:

```prisma
datasource db {
  provider = "postgresql" // Change from sqlite to postgresql
  url      = env("DATABASE_URL")
}
```

Then run migrations before deploying:

```bash
# Generate a new migration
npx prisma migrate dev --name production-setup

# Commit the migration files to your repository
git add .
git commit -m "Add production database migrations"
git push
```

When you deploy, the build process will run `prisma migrate deploy` automatically.

## Troubleshooting

### Database Connectivity Issues

- Verify your `DATABASE_URL` is correct
- Ensure your database server accepts connections from your deployment platform
- Check if you need to add SSL parameters to your connection string: `?sslmode=require`

### Authentication Problems

- Verify `NEXTAUTH_SECRET` is set and is at least 32 characters long
- Ensure `NEXTAUTH_URL` matches your actual deployment URL

### Build Failures

- Check the build logs for specific errors
- Ensure all dependencies are properly installed
- Verify your Node.js version is compatible (14.x or higher)

## Post-Deployment

After successful deployment:

1. Create an admin user using the admin creation script
2. Test login functionality
3. Check that database migrations were applied correctly
4. Verify Redis connectivity for rate limiting and caching 