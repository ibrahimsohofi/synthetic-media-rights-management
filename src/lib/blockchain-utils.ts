/**
 * Blockchain utilities for synthetic media rights management
 *
 * These utilities provide a simplified interface for interacting with a blockchain
 * for rights registration and verification. In a production environment, these would
 * connect to a real blockchain network (Ethereum, Polygon, etc.) using libraries like
 * ethers.js or web3.js.
 *
 * For the current implementation, we simulate blockchain interactions with local functions
 * that mimic the behavior of blockchain transactions and verification.
 */

import { sha256 } from './crypto-utils';
import { prisma } from './prisma';

export interface BlockchainRegistrationResult {
  success: boolean;
  transactionId?: string;
  timestamp?: number;
  blockNumber?: number;
  error?: string;
}

export interface BlockchainVerificationResult {
  verified: boolean;
  registrationTime?: Date;
  transactionId?: string;
  error?: string;
  matchPercentage?: number;
}

/**
 * Creates a metadata hash from content metadata
 * This hash represents the unique signature of the work
 */
export async function createMetadataHash(metadata: Record<string, any>): Promise<string> {
  try {
    // Sort keys to ensure consistent hash generation
    const sortedData = Object.keys(metadata)
      .sort()
      .reduce((acc, key) => {
        acc[key] = metadata[key];
        return acc;
      }, {} as Record<string, any>);

    // Create a string representation and hash it
    const metadataString = JSON.stringify(sortedData);
    const hash = await sha256(metadataString);

    return hash;
  } catch (error) {
    console.error('Error creating metadata hash:', error);
    throw new Error('Failed to create metadata hash');
  }
}

/**
 * Registers a creative work on the blockchain
 * In a real implementation, this would create a transaction on a blockchain
 */
export async function registerOnBlockchain(
  workId: string,
  metadataHash: string,
  ownerId: string
): Promise<BlockchainRegistrationResult> {
  try {
    // Simulate blockchain transaction
    const timestamp = Date.now();
    const blockNumber = Math.floor(Math.random() * 1000000) + 8000000;

    // Generate a fake transaction ID that looks like an Ethereum transaction hash
    const transactionId = `0x${Array.from({length: 64}, () =>
      Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // In a real implementation, this would submit the hash to the blockchain
    // and wait for confirmation

    // Simulate blockchain confirmation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update the database with blockchain registration details
    await prisma.creativeWork.update({
      where: { id: workId },
      data: {
        metadataHash,
        registrationStatus: 'REGISTERED',
        blockchain: {
          create: {
            transactionId,
            blockNumber,
            registeredAt: new Date(timestamp),
            networkName: 'Polygon',
            verified: true,
          }
        }
      }
    });

    return {
      success: true,
      transactionId,
      timestamp,
      blockNumber
    };
  } catch (error) {
    console.error('Error registering on blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during blockchain registration'
    };
  }
}

/**
 * Verifies if a work is registered on the blockchain
 */
export async function verifyOnBlockchain(
  metadataHash: string
): Promise<BlockchainVerificationResult> {
  try {
    // In a real implementation, this would query the blockchain for the transaction

    // Here we check our database for the registered hash
    const blockchainRecord = await prisma.blockchainRegistration.findFirst({
      where: {
        creativeWork: {
          metadataHash
        }
      },
      include: {
        creativeWork: true
      }
    });

    if (!blockchainRecord) {
      return {
        verified: false,
        error: 'No blockchain record found for this work'
      };
    }

    return {
      verified: true,
      registrationTime: blockchainRecord.registeredAt,
      transactionId: blockchainRecord.transactionId,
      matchPercentage: 100
    };
  } catch (error) {
    console.error('Error verifying on blockchain:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error during blockchain verification'
    };
  }
}

/**
 * Performs a fuzzy verification, checking if similar content exists
 * This is useful for detecting slight modifications of registered works
 */
export async function fuzzyVerifyOnBlockchain(
  metadataContent: Record<string, any>
): Promise<BlockchainVerificationResult> {
  try {
    // In a real implementation, this would use advanced fuzzy matching algorithms
    // or AI content analysis to detect similarities

    // For this demo, we'll do a simple check for similar titles or descriptions
    const title = metadataContent.title?.toLowerCase() || '';
    const description = metadataContent.description?.toLowerCase() || '';

    const registeredWorks = await prisma.creativeWork.findMany({
      where: {
        metadataHash: {
          not: null
        },
        OR: [
          { title: { contains: title, mode: 'insensitive' } },
          { description: { contains: description, mode: 'insensitive' } }
        ]
      },
      include: {
        blockchain: true
      }
    });

    if (registeredWorks.length === 0) {
      return {
        verified: false,
        error: 'No similar works found on the blockchain'
      };
    }

    // Find the most similar work based on a simple similarity score
    let bestMatch = { work: registeredWorks[0], score: 0 };

    for (const work of registeredWorks) {
      // Calculate a similarity score (very simplified)
      const titleSimilarity = work.title?.toLowerCase().includes(title) ? 0.5 : 0;
      const descSimilarity = work.description?.toLowerCase().includes(description) ? 0.5 : 0;
      const score = titleSimilarity + descSimilarity;

      if (score > bestMatch.score) {
        bestMatch = { work, score };
      }
    }

    // Convert score to percentage (0-100)
    const matchPercentage = Math.round(bestMatch.score * 100);

    if (matchPercentage < 30) {
      return {
        verified: false,
        matchPercentage,
        error: 'Low confidence match'
      };
    }

    return {
      verified: matchPercentage > 70,
      registrationTime: bestMatch.work.blockchain?.registeredAt,
      transactionId: bestMatch.work.blockchain?.transactionId,
      matchPercentage
    };
  } catch (error) {
    console.error('Error performing fuzzy verification:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error during fuzzy verification'
    };
  }
}
