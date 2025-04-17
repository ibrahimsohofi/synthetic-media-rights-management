import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create test users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const creatorPassword = await bcrypt.hash('creator123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      username: 'admin',
      bio: 'Platform administrator',
      creatorType: 'Administrator',
      isEmailVerified: true,
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: 'creator@example.com' },
    update: {},
    create: {
      email: 'creator@example.com',
      passwordHash: creatorPassword,
      name: 'Content Creator',
      username: 'creator',
      bio: 'Digital artist specializing in AI-assisted creations',
      creatorType: 'Artist',
      isEmailVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      name: 'Regular User',
      username: 'user',
      bio: 'Content consumer',
      creatorType: 'Consumer',
      isEmailVerified: true,
    },
  });

  console.log('Created users:', { admin, creator, user });

  // Create some creative works for the creator
  const work1 = await prisma.creativeWork.create({
    data: {
      title: 'Futuristic Cityscape',
      description: 'A digital painting of a cyberpunk-inspired cityscape with neon lights',
      type: 'IMAGE',
      category: 'Digital Art',
      fileUrls: 'https://example.com/images/cityscape.jpg',
      thumbnailUrl: 'https://example.com/thumbnails/cityscape.jpg',
      metadataHash: 'mh-123456789',
      aiTrainingOptOut: true,
      detectionEnabled: true,
      styleFingerprint: JSON.stringify({
        colors: ['#7e22ce', '#3b82f6'],
        textures: ['smooth', 'gradients'],
        patterns: ['abstract'],
        styleScore: 0.87
      }),
      keywords: 'cyberpunk,city,neon,futuristic',
      registrationStatus: 'REGISTERED',
      visibility: 'PUBLIC',
      ownerId: creator.id,
    },
  });

  const work2 = await prisma.creativeWork.create({
    data: {
      title: 'Ambient Soundscape',
      description: 'An atmospheric audio composition with synthesizers and field recordings',
      type: 'AUDIO',
      category: 'Music',
      fileUrls: 'https://example.com/audio/ambient.mp3',
      thumbnailUrl: 'https://example.com/thumbnails/ambient.jpg',
      metadataHash: 'mh-987654321',
      aiTrainingOptOut: true,
      detectionEnabled: true,
      styleFingerprint: JSON.stringify({
        tempo: 60,
        key: 'C minor',
        instruments: ['synthesizer', 'field recordings'],
        styleScore: 0.92
      }),
      keywords: 'ambient,atmospheric,synthesizer,field recording',
      registrationStatus: 'REGISTERED',
      visibility: 'PUBLIC',
      ownerId: creator.id,
    },
  });

  console.log('Created creative works:', { work1, work2 });

  // Create a license for one of the works
  const license = await prisma.license.create({
    data: {
      title: 'Commercial Usage License',
      type: 'COMMERCIAL',
      terms: JSON.stringify({
        usage: 'Marketing materials',
        territory: 'Worldwide',
        duration: 365,
        fee: 250,
        exclusivity: false,
      }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      price: 250,
      royaltyPercentage: 10,
      permissions: 'reproduce,distribute,display',
      restrictions: 'no-modification,no-sublicense',
      contractUrl: 'https://example.com/contracts/license123.pdf',
      creativeWorkId: work1.id,
      ownerId: creator.id,
      licenseeId: user.id,
      status: 'ACTIVE',
    },
  });

  console.log('Created license:', { license });

  // Create a marketplace listing
  const listing = await prisma.marketplaceListing.create({
    data: {
      title: 'Exclusive License for Ambient Soundscape',
      description: 'Get exclusive rights to use this atmospheric audio composition in your projects',
      price: 500,
      licenseType: 'EXCLUSIVE',
      duration: 730, // 2 years
      featured: true,
      status: 'ACTIVE',
      creativeWorkId: work2.id,
      sellerId: creator.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('Created marketplace listing:', { listing });

  // Create some notifications
  const notification1 = await prisma.notification.create({
    data: {
      userId: creator.id,
      type: 'LICENSE_CREATED',
      title: 'New License Agreement',
      message: 'Your work "Futuristic Cityscape" has been licensed to Regular User',
      linkUrl: `/dashboard/licensing/${license.id}`,
      isRead: false,
      metadata: JSON.stringify({
        licenseId: license.id,
        workId: work1.id,
        licenseeId: user.id,
      }),
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'MARKETPLACE_INTEREST',
      title: 'New Marketplace Listing',
      message: 'A new audio work is available for licensing: "Ambient Soundscape"',
      linkUrl: `/dashboard/marketplace`,
      isRead: false,
      metadata: JSON.stringify({
        listingId: listing.id,
        workId: work2.id,
      }),
    },
  });

  console.log('Created notifications:', { notification1, notification2 });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
