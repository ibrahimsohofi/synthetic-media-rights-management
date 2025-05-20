-- CreateTable
CREATE TABLE "APIMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "duration" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "errorCode" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "identifier" TEXT NOT NULL PRIMARY KEY,
    "tokens" REAL NOT NULL,
    "lastRefill" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "avatar" TEXT DEFAULT 'default-avatar.png',
    "creatorType" TEXT,
    "portfolioUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "notificationPreferences" JSONB,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreativeWork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrls" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "metadataHash" TEXT,
    "aiTrainingOptOut" BOOLEAN NOT NULL DEFAULT true,
    "detectionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "styleFingerprint" JSONB,
    "keywords" TEXT NOT NULL,
    "registrationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreativeWork_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockchainRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "networkName" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "creativeWorkId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlockchainRegistration_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "terms" JSONB NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "price" REAL,
    "royaltyPercentage" REAL,
    "permissions" TEXT NOT NULL,
    "restrictions" TEXT NOT NULL,
    "contractUrl" TEXT,
    "creativeWorkId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "licenseeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "License_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "License_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "License_licenseeId_fkey" FOREIGN KEY ("licenseeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceUrl" TEXT NOT NULL,
    "detectionMethod" TEXT NOT NULL,
    "matchConfidence" REAL NOT NULL,
    "description" TEXT,
    "evidenceUrls" TEXT NOT NULL,
    "resolutionNotes" TEXT,
    "creativeWorkId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "Violation_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Violation_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "licenseType" TEXT NOT NULL,
    "duration" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "creativeWorkId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "MarketplaceListing_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "inviteCode" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "permissions" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certificate_workId_fkey" FOREIGN KEY ("workId") REFERENCES "CreativeWork" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentFingerprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creativeWorkId" TEXT NOT NULL,
    "fingerprintType" TEXT NOT NULL,
    "fingerprintData" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentFingerprint_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectionScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "targetUrl" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "scanConfig" JSONB,
    "initiatedById" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DetectionScan_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "matchType" TEXT NOT NULL DEFAULT 'EXACT',
    "confidence" REAL NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "contextData" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "creativeWorkId" TEXT NOT NULL,
    "violationId" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DetectionResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "DetectionScan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetectionResult_creativeWorkId_fkey" FOREIGN KEY ("creativeWorkId") REFERENCES "CreativeWork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetectionResult_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "APIMetrics_endpoint_idx" ON "APIMetrics"("endpoint");

-- CreateIndex
CREATE INDEX "APIMetrics_timestamp_idx" ON "APIMetrics"("timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_endpoint_idx" ON "ErrorLog"("endpoint");

-- CreateIndex
CREATE INDEX "ErrorLog_timestamp_idx" ON "ErrorLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeWork_metadataHash_key" ON "CreativeWork"("metadataHash");

-- CreateIndex
CREATE INDEX "CreativeWork_ownerId_idx" ON "CreativeWork"("ownerId");

-- CreateIndex
CREATE INDEX "CreativeWork_type_idx" ON "CreativeWork"("type");

-- CreateIndex
CREATE INDEX "CreativeWork_registrationStatus_idx" ON "CreativeWork"("registrationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRegistration_transactionId_key" ON "BlockchainRegistration"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainRegistration_creativeWorkId_key" ON "BlockchainRegistration"("creativeWorkId");

-- CreateIndex
CREATE INDEX "BlockchainRegistration_transactionId_idx" ON "BlockchainRegistration"("transactionId");

-- CreateIndex
CREATE INDEX "BlockchainRegistration_creativeWorkId_idx" ON "BlockchainRegistration"("creativeWorkId");

-- CreateIndex
CREATE INDEX "License_ownerId_idx" ON "License"("ownerId");

-- CreateIndex
CREATE INDEX "License_licenseeId_idx" ON "License"("licenseeId");

-- CreateIndex
CREATE INDEX "License_creativeWorkId_idx" ON "License"("creativeWorkId");

-- CreateIndex
CREATE INDEX "License_status_idx" ON "License"("status");

-- CreateIndex
CREATE INDEX "Violation_creativeWorkId_idx" ON "Violation"("creativeWorkId");

-- CreateIndex
CREATE INDEX "Violation_reportedById_idx" ON "Violation"("reportedById");

-- CreateIndex
CREATE INDEX "Violation_status_idx" ON "Violation"("status");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerId_idx" ON "MarketplaceListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_creativeWorkId_idx" ON "MarketplaceListing"("creativeWorkId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_status_idx" ON "MarketplaceListing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_paymentId_key" ON "Transaction"("paymentId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "Certificate_workId_idx" ON "Certificate"("workId");

-- CreateIndex
CREATE INDEX "Certificate_ownerId_idx" ON "Certificate"("ownerId");

-- CreateIndex
CREATE INDEX "Certificate_createdAt_idx" ON "Certificate"("createdAt");

-- CreateIndex
CREATE INDEX "ContentFingerprint_creativeWorkId_idx" ON "ContentFingerprint"("creativeWorkId");

-- CreateIndex
CREATE INDEX "ContentFingerprint_fingerprintType_idx" ON "ContentFingerprint"("fingerprintType");

-- CreateIndex
CREATE INDEX "DetectionScan_initiatedById_idx" ON "DetectionScan"("initiatedById");

-- CreateIndex
CREATE INDEX "DetectionScan_status_idx" ON "DetectionScan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DetectionResult_violationId_key" ON "DetectionResult"("violationId");

-- CreateIndex
CREATE INDEX "DetectionResult_scanId_idx" ON "DetectionResult"("scanId");

-- CreateIndex
CREATE INDEX "DetectionResult_creativeWorkId_idx" ON "DetectionResult"("creativeWorkId");

-- CreateIndex
CREATE INDEX "DetectionResult_matchType_idx" ON "DetectionResult"("matchType");
