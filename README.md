<<<<<<< HEAD
# Synthetic Media Rights Management Platform

A comprehensive platform for creators to register, protect, license, and monetize their synthetic media assets in the age of AI-generated content.

## 🚀 Features

- **Rights Registry**: Register your synthetic media creations with blockchain verification
- **Licensing Management**: Create and manage licenses for your creative works
- **Rights Detection**: Scan for unauthorized usage of your content across the web
- **Marketplace**: Buy and sell synthetic media rights and licenses
- **Analytics**: Track usage, violations, and licensing revenue
- **Notifications**: Stay informed about important events related to your media
- **Team Collaboration**: Work with other creators and stakeholders
- **User Dashboard**: Manage all aspects of your synthetic media rights
- **Communication**: Message creators, licensees, and support through integrated messaging

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.2, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui component library
- **Backend**: Next.js API Routes with serverless functions
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js with credential provider
- **Storage**: Cloudinary for media files
- **Media Processing**: Custom fingerprinting algorithms
- **Blockchain Integration**: For permanent rights registration

## 🏗️ Project Structure

- `/src/app` - Next.js application pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and business logic
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## ⚙️ Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up your environment variables:
   ```
   cp .env.example .env.local
   ```
4. Initialize the database:
   ```bash
   bunx prisma migrate dev
   ```
5. Seed the database:
   ```bash
   bun run seed
   ```
6. Start the development server:
   ```bash
   bun run dev
   ```

## 🔐 Authentication

The application uses NextAuth.js for authentication. You can log in with:

- Email: `demo@syntheticrights.com`
- Password: `password123`

## 📋 Recent Updates

### Version 7 - Added Support & Messages Pages
- Added comprehensive Help & Support page with FAQs, documentation, and contact form
- Created Messages feature with conversation list and message display interface
- Implemented tabbed interface for filtering conversations by All, Unread, and Support
- Added mock data for demonstration purposes

### Version 6 - Notification System
- Added real-time notification system
- Created UI components for displaying notifications
- Implemented notification count indicator
- Added API routes for managing notifications

### Version 5 - Analytics Dashboard
- Implemented analytics dashboard with usage metrics
- Added charts and visualizations for rights activity
- Created data aggregation utilities

## 📊 Database Schema

The platform uses a relational database with the following core models:

- **User**: Account information and profile data
- **CreativeWork**: Registered media assets
- **License**: Usage rights and terms
- **Violation**: Detected unauthorized usage
- **MarketplaceListing**: Items for sale
- **Transaction**: Financial records
- **Notification**: User alerts
- **Team & TeamMember**: Collaboration structures
- **BlockchainRegistration**: Verification records

## 🗺️ Roadmap

- [ ] Advanced AI detection algorithms for derivative works
- [ ] Blockchain certificate generation for rights proof
- [ ] Integration with major stock media platforms
- [ ] Mobile application for on-the-go rights management
- [ ] Automated DMCA takedown process
- [ ] Multi-language support
- [ ] AI training permission management
- [ ] Enhanced analytics and reporting

## 📜 License

This project is proprietary software. All rights reserved.
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 5ef4f3ae27a1e54782aeb7c28db59316fe49f5e8
