/**
 * Fingerprinting utilities for synthetic media rights management
 *
 * These utilities provide methods for generating unique fingerprints
 * for different types of creative content, and functions for comparing
 * content to detect similarities and potential copyright infringements.
 */

import { WorkType } from "@prisma/client";
import { sha256 } from "./crypto-utils";

export interface ContentFingerprint {
  hash: string;
  features: Record<string, number[]>;
  metadata: {
    workType: WorkType;
    createdAt: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    fileSize?: number;
  };
}

export interface FingerprintMatchResult {
  confidence: number; // 0-1 where 1 is exact match
  matchType: 'exact' | 'similar' | 'derivative' | 'none';
  matchedFeatures: string[];
  matchedSegments?: number; // For temporal content like audio/video
  details: string;
}

/**
 * Generate a content fingerprint based on the provided content and type
 * In a real implementation, this would use ML-based feature extraction
 * tailored to each content type
 */
export async function generateFingerprint(
  fileData: ArrayBuffer,
  workType: WorkType,
  metadata: {
    filename: string;
    mimeType: string;
    [key: string]: any;
  }
): Promise<ContentFingerprint> {
  // Create a representation of the content
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Extract basic metadata for all types
  const basicMetadata = {
    workType,
    createdAt: new Date().toISOString(),
    fileSize: fileData.byteLength
  };

  // Generate type-specific fingerprint features
  let features: Record<string, number[]>;
  let extendedMetadata = {};

  switch(workType) {
    case WorkType.IMAGE:
      features = await generateImageFingerprint(fileData, metadata);
      // In a real implementation, would extract image dimensions, colors, etc.
      extendedMetadata = {
        dimensions: { width: 1200, height: 800 }, // Simulated values
        colorProfile: 'sRGB'
      };
      break;

    case WorkType.AUDIO:
      features = await generateAudioFingerprint(fileData, metadata);
      // In a real implementation, would extract duration, spectral features, etc.
      extendedMetadata = {
        duration: 180, // 3 minutes in seconds
        sampleRate: 44100,
        channels: 2
      };
      break;

    case WorkType.VIDEO:
      features = await generateVideoFingerprint(fileData, metadata);
      // In a real implementation, would extract video characteristics
      extendedMetadata = {
        dimensions: { width: 1920, height: 1080 },
        duration: 120, // 2 minutes in seconds
        frameRate: 30
      };
      break;

    case WorkType.TEXT:
      features = await generateTextFingerprint(fileData, metadata);
      // In a real implementation, would extract text statistics
      extendedMetadata = {
        wordCount: 1500,
        languageCode: 'en'
      };
      break;

    default:
      features = {
        generic: simulateFeatureVector(64) // Default generic fingerprint
      };
  }

  return {
    hash: hashHex,
    features,
    metadata: {
      ...basicMetadata,
      ...extendedMetadata
    }
  };
}

/**
 * Compare two fingerprints and return a match result
 */
export function compareFingerprints(
  source: ContentFingerprint,
  target: ContentFingerprint
): FingerprintMatchResult {
  // If hashes match exactly, it's an exact copy
  if (source.hash === target.hash) {
    return {
      confidence: 1.0,
      matchType: 'exact',
      matchedFeatures: Object.keys(source.features),
      details: 'Exact content match detected (identical files)'
    };
  }

  // If content types don't match, adjust comparison approach
  if (source.metadata.workType !== target.metadata.workType) {
    return compareAcrossTypes(source, target);
  }

  // Compare features to detect similarities
  const similarities: number[] = [];
  const matchedFeatures: string[] = [];

  for (const [featureKey, sourceVector] of Object.entries(source.features)) {
    if (target.features[featureKey]) {
      const similarity = calculateCosineSimilarity(
        sourceVector,
        target.features[featureKey]
      );

      similarities.push(similarity);

      if (similarity > 0.85) {
        matchedFeatures.push(featureKey);
      }
    }
  }

  // Calculate overall confidence based on feature similarities
  const overallConfidence = similarities.length > 0
    ? similarities.reduce((sum, val) => sum + val, 0) / similarities.length
    : 0;

  // Determine match type based on confidence
  let matchType: 'exact' | 'similar' | 'derivative' | 'none';
  let details: string;

  if (overallConfidence > 0.95) {
    matchType = 'similar';
    details = 'Very high similarity detected, likely only minor modifications';
  } else if (overallConfidence > 0.8) {
    matchType = 'similar';
    details = 'High similarity detected, possible modification or version';
  } else if (overallConfidence > 0.6) {
    matchType = 'derivative';
    details = 'Moderate similarity detected, likely a derivative work';
  } else {
    matchType = 'none';
    details = 'Low similarity, likely unrelated content';
  }

  return {
    confidence: overallConfidence,
    matchType,
    matchedFeatures,
    details
  };
}

// Private helper functions for different content types

/**
 * Generate fingerprint specific to image content
 * In a real implementation, this would use computer vision techniques
 */
async function generateImageFingerprint(
  fileData: ArrayBuffer,
  metadata: any
): Promise<Record<string, number[]>> {
  // In a real implementation, this would:
  // 1. Extract perceptual hash
  // 2. Extract color histogram
  // 3. Extract texture features
  // 4. Extract edge features
  // 5. Extract deep learning embeddings

  // Simulated feature vectors for demonstration
  return {
    colorHistogram: simulateFeatureVector(128),
    edgeFeatures: simulateFeatureVector(64),
    textureFeatures: simulateFeatureVector(32),
    semanticFeatures: simulateFeatureVector(256)
  };
}

/**
 * Generate fingerprint specific to audio content
 * In a real implementation, this would use audio analysis techniques
 */
async function generateAudioFingerprint(
  fileData: ArrayBuffer,
  metadata: any
): Promise<Record<string, number[]>> {
  // In a real implementation, this would:
  // 1. Generate acoustic fingerprints
  // 2. Extract spectral features
  // 3. Extract rhythm features

  // Simulated feature vectors for demonstration
  return {
    spectralFingerprint: simulateFeatureVector(128),
    rhythmFeatures: simulateFeatureVector(64),
    melSpectrogramFeatures: simulateFeatureVector(256),
    temporalFeatures: simulateFeatureVector(32)
  };
}

/**
 * Generate fingerprint specific to video content
 * In a real implementation, this would use video analysis techniques
 */
async function generateVideoFingerprint(
  fileData: ArrayBuffer,
  metadata: any
): Promise<Record<string, number[]>> {
  // In a real implementation, this would:
  // 1. Extract frame-based visual fingerprints
  // 2. Extract motion features
  // 3. Extract scene transition fingerprints
  // 4. Extract audio track fingerprint

  // Simulated feature vectors for demonstration
  return {
    keyFrameFeatures: simulateFeatureVector(256),
    motionFeatures: simulateFeatureVector(128),
    sceneTransitions: simulateFeatureVector(64),
    audioTrackFeatures: simulateFeatureVector(128),
    temporalSignature: simulateFeatureVector(32)
  };
}

/**
 * Generate fingerprint specific to text content
 * In a real implementation, this would use NLP techniques
 */
async function generateTextFingerprint(
  fileData: ArrayBuffer,
  metadata: any
): Promise<Record<string, number[]>> {
  // In a real implementation, this would:
  // 1. Extract semantic embeddings
  // 2. Extract stylometric features
  // 3. Extract structural features
  // 4. Create n-gram distributions

  // Convert ArrayBuffer to text
  const textDecoder = new TextDecoder();
  let text;
  try {
    text = textDecoder.decode(fileData);
  } catch (error) {
    console.error('Error decoding text:', error);
    text = '';
  }

  // Simulated feature vectors for demonstration
  return {
    semanticEmbedding: simulateFeatureVector(384),
    stylometricFeatures: simulateFeatureVector(64),
    structuralFingerprint: simulateFeatureVector(32),
    nGramDistribution: simulateFeatureVector(128)
  };
}

/**
 * Compare fingerprints across different content types
 * (e.g., detecting if text was derived from image caption)
 */
function compareAcrossTypes(
  source: ContentFingerprint,
  target: ContentFingerprint
): FingerprintMatchResult {
  // In a real implementation, this would use more sophisticated techniques
  // for cross-modal matching (like using embeddings from multimodal models)

  // For now, we'll return a low confidence match for demonstration
  return {
    confidence: 0.3,
    matchType: 'derivative',
    matchedFeatures: ['cross-modal-similarity'],
    details: 'Cross-mode similarity detected, possibly derivative content in different format'
  };
}

/**
 * Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    // Pad the shorter vector or truncate the longer one
    const targetLength = Math.min(vec1.length, vec2.length);
    vec1 = vec1.slice(0, targetLength);
    vec2 = vec2.slice(0, targetLength);
  }

  // Calculate dot product
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);

  // Calculate magnitudes
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  // Handle zero magnitudes to avoid division by zero
  if (mag1 === 0 || mag2 === 0) return 0;

  // Return cosine similarity
  return dotProduct / (mag1 * mag2);
}

/**
 * Helper to generate simulated feature vectors for demonstration
 * In a real implementation, these would come from actual ML models
 */
function simulateFeatureVector(length: number): number[] {
  return Array.from(
    { length },
    () => Math.random()
  );
}

/**
 * Extract a stable fingerprint from a file
 * This is a simplified version for demonstration
 */
export async function extractFingerprintFromFile(file: File): Promise<ContentFingerprint | null> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const workType = getWorkTypeFromMimeType(file.type);

    return await generateFingerprint(fileBuffer, workType, {
      filename: file.name,
      mimeType: file.type
    });
  } catch (error) {
    console.error('Error extracting fingerprint:', error);
    return null;
  }
}

/**
 * Map MIME type to WorkType
 */
function getWorkTypeFromMimeType(mimeType: string): WorkType {
  if (mimeType.startsWith('image/')) {
    return WorkType.IMAGE;
  } else if (mimeType.startsWith('video/')) {
    return WorkType.VIDEO;
  } else if (mimeType.startsWith('audio/')) {
    return WorkType.AUDIO;
  } else if (
    mimeType.startsWith('text/') ||
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('markdown')
  ) {
    return WorkType.TEXT;
  }

  // Default to the most common type
  return WorkType.IMAGE;
}
