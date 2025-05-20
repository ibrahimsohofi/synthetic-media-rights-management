# Next.js Application Monitoring System

A comprehensive monitoring and observability system built with Next.js, Prisma, and Redis.

## Features

- Real-time API metrics tracking
- Error logging and monitoring
- Health check endpoints
- Performance monitoring
- Alerting system
- Monitoring dashboard
- Security monitoring
- Structured logging

## Tech Stack

- **Framework**: Next.js
- **Database**: PostgreSQL (via Prisma)
- **Caching**: Redis (Upstash)
- **Monitoring**: Custom monitoring service
- **Alerting**: Email/Slack notifications
- **Testing**: Jest, React Testing Library

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Redis instance (Upstash)
- SMTP server (for email alerts)
- Slack workspace (for Slack notifications)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Application
NODE_ENV="development"
PORT=3000

# Monitoring
METRICS_RETENTION_DAYS=7
ERROR_RETENTION_DAYS=30
ALERT_THRESHOLD_ERROR_RATE=5
ALERT_THRESHOLD_RESPONSE_TIME=1000

# Email Alerts (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
ALERT_EMAIL_FROM="alerts@example.com"
ALERT_EMAIL_TO="admin@example.com"

# Slack Alerts
SLACK_WEBHOOK_URL="your-slack-webhook-url"

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── health/        # Health check endpoint
│   │   ├── metrics/       # Metrics endpoints
│   │   └── alerts/        # Alert management
│   └── dashboard/         # Monitoring dashboard
├── lib/                   # Core libraries
│   ├── monitoring/        # Monitoring service
│   ├── alerts/           # Alerting system
│   ├── security/         # Security monitoring
│   └── logging/          # Logging utilities
├── components/           # React components
├── types/               # TypeScript types
└── utils/              # Utility functions
```

## Monitoring Dashboard

Access the monitoring dashboard at `/dashboard` after starting the application. The dashboard provides:

- Real-time API metrics
- Error rates and logs
- Service health status
- Performance trends
- Security alerts

## Alerting System

The system supports multiple alert channels:

- Email notifications for critical errors
- Slack notifications for service issues
- In-app alerts for performance degradation

Configure alert thresholds in the `.env` file.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

### Code Quality

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Format code
npm run format
```

## Deployment

The application is configured for deployment on Railway. The `railway.json` file contains the necessary configuration.

1. Push to your repository
2. Connect to Railway
3. Set up environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For support, please open an issue in the repository or contact the maintainers.
