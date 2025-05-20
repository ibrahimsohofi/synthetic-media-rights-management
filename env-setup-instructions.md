# Environment Setup Instructions

1. Create a file named `.env.local` in the project root with the following content:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (for media storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional: Blockchain Integration
BLOCKCHAIN_NETWORK_URL=""
BLOCKCHAIN_PRIVATE_KEY=""
```

2. For development purposes, you can leave the Cloudinary and Blockchain credentials empty initially.
3. Generate a secure NEXTAUTH_SECRET using a command like `openssl rand -base64 32` or any other secure random string. 