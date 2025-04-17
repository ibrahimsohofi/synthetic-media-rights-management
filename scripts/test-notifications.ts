import { PrismaClient, NotificationType } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * This script tests the notification functionality of the synthetic media rights management platform.
 * It will:
 * 1. Find a user to use for testing or create one
 * 2. Create sample notifications for the user
 * 3. Retrieve notifications to verify they were created
 * 4. Update a notification to mark it as read
 * 5. Delete a notification
 *
 * Usage: bun run scripts/test-notifications.ts
 */
async function main() {
  console.log('🔔 Testing Notification System...');

  try {
    // Step 1: Find a user or create one for testing
    let user = await prisma.user.findFirst();

    if (!user) {
      console.log('No user found, creating a test user...');
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'notarealhash',
          name: 'Test User',
        }
      });
      console.log(`Created test user with ID: ${user.id}`);
    } else {
      console.log(`Using existing user: ${user.name} (${user.email})`);
    }

    // Step 2: Clean up any existing notifications for clean test
    const deleteResult = await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    console.log(`Deleted ${deleteResult.count} existing notifications`);

    // Step 3: Create sample notifications
    const notificationsData = [
      {
        userId: user.id,
        type: NotificationType.VIOLATION_DETECTED,
        title: 'Test Violation Detected',
        message: 'This is a test violation notification',
        isRead: false,
        createdAt: new Date()
      },
      {
        userId: user.id,
        type: NotificationType.LICENSE_CREATED,
        title: 'Test License Created',
        message: 'This is a test license notification',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      },
      {
        userId: user.id,
        type: NotificationType.MARKETPLACE_INTEREST,
        title: 'Test Marketplace Interest',
        message: 'This is a test marketplace interest notification',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    const createdNotifications = await prisma.notification.createMany({
      data: notificationsData
    });

    console.log(`Created ${createdNotifications.count} test notifications`);

    // Step 4: Retrieve notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Retrieved ${notifications.length} notifications:`);
    notifications.forEach(notification => {
      console.log(`- ${notification.title} (${notification.isRead ? 'Read' : 'Unread'})`);
    });

    // Step 5: Mark a notification as read
    if (notifications.length > 0) {
      const unreadNotification = notifications.find(n => !n.isRead);

      if (unreadNotification) {
        await prisma.notification.update({
          where: { id: unreadNotification.id },
          data: { isRead: true }
        });

        console.log(`Marked notification "${unreadNotification.title}" as read`);
      }
    }

    // Step 6: Delete a notification
    if (notifications.length > 0) {
      const notificationToDelete = notifications[notifications.length - 1];

      await prisma.notification.delete({
        where: { id: notificationToDelete.id }
      });

      console.log(`Deleted notification "${notificationToDelete.title}"`);
    }

    // Step 7: Verify final state
    const finalNotifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\nFinal state: ${finalNotifications.length} notifications:`);
    finalNotifications.forEach(notification => {
      console.log(`- ${notification.title} (${notification.isRead ? 'Read' : 'Unread'})`);
    });

    console.log('\n✅ Notification system test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
