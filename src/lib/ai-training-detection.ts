/**
 * AI Training Detection Utility
 *
 * This module provides tools to detect if content has been used in AI model training.
 * It uses pattern recognition and model behavior analysis to determine if content
 * appears to have been used in training data.
 */

import { sha256 } from './crypto-utils';
import type { WorkType } from '@prisma/client';

export interface AITrainingDetectionResult {
  detected: boolean;
  confidence: number; // 0-1 range
  models: AIModelMatch[];
  evidenceType: 'direct' | 'behavioral' | 'stylistic';
  analysisTimestamp: string;
  uniquePatternFound: boolean;
  details: AITrainingDetectionDetails;
}

export interface AIModelMatch {
  modelName: string;
  provider: string;
  confidence: number; // 0-1 range
  evidenceStrength: 'strong' | 'moderate' | 'weak';
  lastUpdated: string; // ISO date when the model was last updated
  trainingPeriod?: {
    start: string;
    end: string;
  };
}

export interface AITrainingDetectionDetails {
  matchedPatterns: number;
  totalCheckedPatterns: number;
  outputSimilarity: number; // 0-1 range
  recognizableElements: string[];
  reconstructionQuality?: number; // For image/video analysis
  semanticPreservation?: number; // For text analysis
  frequencyResponse?: number[]; // For audio analysis
  stylePersistence?: number; // For art/design
  reportUrl?: string; // URL to a detailed report
}

export type ContentDescriptor = string | ArrayBuffer | File | Blob;

/**
 * Detect if content has been potentially used in AI model training
 */
export async function detectAITrainingUsage(
  content: ContentDescriptor,
  contentType: WorkType,
  contentId?: string,
  options?: {
    deepScan?: boolean;
    targetModels?: string[];
    sensitivityLevel?: 'high' | 'medium' | 'low';
  }
): Promise<AITrainingDetectionResult> {
  // This would connect to an actual AI training detection service in production
  // For demo purposes, we'll simulate a detection process

  console.log(`Starting AI training detection for ${contentType} content`);
  const startTime = Date.now();

  // Generate a content hash for comparison
  const contentHash = await getContentHash(content);

  // Run appropriate detection based on content type
  let result: AITrainingDetectionResult;

  switch (contentType) {
    case 'IMAGE':
      result = await detectImageTrainingUsage(content, contentHash, options);
      break;
    case 'VIDEO':
      result = await detectVideoTrainingUsage(content, contentHash, options);
      break;
    case 'AUDIO':
      result = await detectAudioTrainingUsage(content, contentHash, options);
      break;
    case 'TEXT':
      result = await detectTextTrainingUsage(content, contentHash, options);
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Add processing time to result
  const processingTime = Date.now() - startTime;
  console.log(`AI training detection completed in ${processingTime}ms`);

  return result;
}

/**
 * Extract a unique pattern from content for detection fingerprinting
 */
export async function extractDetectionPattern(
  content: ContentDescriptor,
  contentType: WorkType
): Promise<string> {
  // In a real implementation, this would extract unique patterns from the content
  // that could be used to identify if the content was included in training data

  // For now, we'll simulate by creating a hash
  const contentHash = await getContentHash(content);
  return `pattern-${contentType.toLowerCase()}-${contentHash.substring(0, 16)}`;
}

/**
 * Generate a hash representation of content
 */
async function getContentHash(content: ContentDescriptor): Promise<string> {
  if (typeof content === 'string') {
    return sha256(content);
  }

  if (content instanceof File || content instanceof Blob) {
    const buffer = await content.arrayBuffer();
    return hashArrayBuffer(buffer);
  }

  if (content instanceof ArrayBuffer) {
    return hashArrayBuffer(content);
  }

  throw new Error('Unsupported content format');
}

/**
 * Hash an ArrayBuffer
 */
async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  // In a real implementation, this would use crypto APIs to hash the buffer
  const bytes = new Uint8Array(buffer);
  let hash = 0;

  // Simple hash function for demonstration
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash = hash & hash; // Convert to 32bit integer
  }

  // Add a random component to simulate uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${hash.toString(16)}-${randomSuffix}`;
}

// ===== Media-specific detection implementations =====

/**
 * Detect if an image was used in AI training
 */
async function detectImageTrainingUsage(
  image: ContentDescriptor,
  contentHash: string,
  options?: {
    deepScan?: boolean;
    targetModels?: string[];
    sensitivityLevel?: 'high' | 'medium' | 'low';
  }
): Promise<AITrainingDetectionResult> {
  // Simulate detection delays based on scan depth
  const delay = options?.deepScan ? 2000 : 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // For demo, create random but realistic-looking results
  const detected = Math.random() > 0.4; // 60% chance of detection
  const confidence = detected
    ? 0.7 + (Math.random() * 0.3) // 0.7-1.0
    : 0.1 + (Math.random() * 0.2); // 0.1-0.3

  // Generate model matches
  const modelCount = detected ? Math.floor(Math.random() * 4) + 1 : 0;
  const models: AIModelMatch[] = [];

  const possibleModels = [
    { name: 'DALL-E 3', provider: 'OpenAI' },
    { name: 'Midjourney v5', provider: 'Midjourney' },
    { name: 'Stable Diffusion 3', provider: 'Stability AI' },
    { name: 'Imagen 2', provider: 'Google' },
    { name: 'Firefly', provider: 'Adobe' }
  ];

  for (let i = 0; i < modelCount; i++) {
    const model = possibleModels[Math.floor(Math.random() * possibleModels.length)];
    models.push({
      modelName: model.name,
      provider: model.provider,
      confidence: 0.5 + (Math.random() * 0.5), // 0.5-1.0
      evidenceStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as 'weak' | 'moderate' | 'strong',
      lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trainingPeriod: {
        start: '2023-01-01',
        end: '2023-12-31'
      }
    });
  }

  // Generate details
  const patternCount = Math.floor(Math.random() * 20) + 5;
  const matchedPatterns = detected
    ? Math.floor(patternCount * confidence)
    : Math.floor(patternCount * 0.1);

  return {
    detected,
    confidence,
    models,
    evidenceType: detected
      ? (['direct', 'behavioral', 'stylistic'][Math.floor(Math.random() * 3)] as 'direct' | 'behavioral' | 'stylistic')
      : 'behavioral',
    analysisTimestamp: new Date().toISOString(),
    uniquePatternFound: detected && confidence > 0.8,
    details: {
      matchedPatterns,
      totalCheckedPatterns: patternCount,
      outputSimilarity: detected ? 0.6 + (Math.random() * 0.4) : 0.1 + (Math.random() * 0.3),
      recognizableElements: detected
        ? ['composition', 'color palette', 'texture patterns', 'subject features']
        : [],
      reconstructionQuality: detected ? 0.7 + (Math.random() * 0.3) : 0.1 + (Math.random() * 0.2),
      stylePersistence: detected ? 0.8 + (Math.random() * 0.2) : 0.2 + (Math.random() * 0.3),
      reportUrl: `https://reports.syntheticrights.com/analysis/${contentHash}`
    }
  };
}

/**
 * Detect if a video was used in AI training
 */
async function detectVideoTrainingUsage(
  video: ContentDescriptor,
  contentHash: string,
  options?: {
    deepScan?: boolean;
    targetModels?: string[];
    sensitivityLevel?: 'high' | 'medium' | 'low';
  }
): Promise<AITrainingDetectionResult> {
  // Simulate detection delays based on scan depth
  const delay = options?.deepScan ? 3500 : 1200;
  await new Promise(resolve => setTimeout(resolve, delay));

  // For demo, create random but realistic-looking results
  const detected = Math.random() > 0.5; // 50% chance of detection
  const confidence = detected
    ? 0.65 + (Math.random() * 0.35) // 0.65-1.0
    : 0.05 + (Math.random() * 0.2); // 0.05-0.25

  // Generate model matches
  const modelCount = detected ? Math.floor(Math.random() * 3) + 1 : 0;
  const models: AIModelMatch[] = [];

  const possibleModels = [
    { name: 'Sora', provider: 'OpenAI' },
    { name: 'Lumiere', provider: 'Google' },
    { name: 'Gen-2', provider: 'Runway' },
    { name: 'Pika', provider: 'Pika Labs' },
    { name: 'Phenaki', provider: 'Google Research' }
  ];

  for (let i = 0; i < modelCount; i++) {
    const model = possibleModels[Math.floor(Math.random() * possibleModels.length)];
    models.push({
      modelName: model.name,
      provider: model.provider,
      confidence: 0.4 + (Math.random() * 0.6), // 0.4-1.0
      evidenceStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as 'weak' | 'moderate' | 'strong',
      lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trainingPeriod: {
        start: '2023-03-01',
        end: '2024-01-31'
      }
    });
  }

  // Generate details
  const patternCount = Math.floor(Math.random() * 30) + 10;
  const matchedPatterns = detected
    ? Math.floor(patternCount * confidence)
    : Math.floor(patternCount * 0.05);

  return {
    detected,
    confidence,
    models,
    evidenceType: detected
      ? (['direct', 'behavioral', 'stylistic'][Math.floor(Math.random() * 3)] as 'direct' | 'behavioral' | 'stylistic')
      : 'behavioral',
    analysisTimestamp: new Date().toISOString(),
    uniquePatternFound: detected && confidence > 0.85,
    details: {
      matchedPatterns,
      totalCheckedPatterns: patternCount,
      outputSimilarity: detected ? 0.55 + (Math.random() * 0.45) : 0.05 + (Math.random() * 0.2),
      recognizableElements: detected
        ? ['scene composition', 'camera movement', 'lighting patterns', 'subject motion', 'transition effects']
        : [],
      reconstructionQuality: detected ? 0.6 + (Math.random() * 0.4) : 0.1 + (Math.random() * 0.15),
      reportUrl: `https://reports.syntheticrights.com/analysis/${contentHash}`
    }
  };
}

/**
 * Detect if an audio was used in AI training
 */
async function detectAudioTrainingUsage(
  audio: ContentDescriptor,
  contentHash: string,
  options?: {
    deepScan?: boolean;
    targetModels?: string[];
    sensitivityLevel?: 'high' | 'medium' | 'low';
  }
): Promise<AITrainingDetectionResult> {
  // Simulate detection delays based on scan depth
  const delay = options?.deepScan ? 1800 : 800;
  await new Promise(resolve => setTimeout(resolve, delay));

  // For demo, create random but realistic-looking results
  const detected = Math.random() > 0.6; // 40% chance of detection
  const confidence = detected
    ? 0.6 + (Math.random() * 0.4) // 0.6-1.0
    : 0.1 + (Math.random() * 0.15); // 0.1-0.25

  // Generate model matches
  const modelCount = detected ? Math.floor(Math.random() * 3) + 1 : 0;
  const models: AIModelMatch[] = [];

  const possibleModels = [
    { name: 'AudioGen', provider: 'Meta AI' },
    { name: 'MusicLM', provider: 'Google' },
    { name: 'Jukebox', provider: 'OpenAI' },
    { name: 'AudioCraft', provider: 'Meta AI' },
    { name: 'VALL-E', provider: 'Microsoft Research' }
  ];

  for (let i = 0; i < modelCount; i++) {
    const model = possibleModels[Math.floor(Math.random() * possibleModels.length)];
    models.push({
      modelName: model.name,
      provider: model.provider,
      confidence: 0.45 + (Math.random() * 0.55), // 0.45-1.0
      evidenceStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as 'weak' | 'moderate' | 'strong',
      lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trainingPeriod: {
        start: '2023-02-01',
        end: '2023-11-30'
      }
    });
  }

  // Generate details
  const patternCount = Math.floor(Math.random() * 25) + 5;
  const matchedPatterns = detected
    ? Math.floor(patternCount * confidence)
    : Math.floor(patternCount * 0.08);

  // Create a simulated frequency response array
  const frequencyResponse = Array.from({ length: 10 }, () => Math.random());

  return {
    detected,
    confidence,
    models,
    evidenceType: detected
      ? (['direct', 'behavioral', 'stylistic'][Math.floor(Math.random() * 3)] as 'direct' | 'behavioral' | 'stylistic')
      : 'behavioral',
    analysisTimestamp: new Date().toISOString(),
    uniquePatternFound: detected && confidence > 0.75,
    details: {
      matchedPatterns,
      totalCheckedPatterns: patternCount,
      outputSimilarity: detected ? 0.5 + (Math.random() * 0.5) : 0.05 + (Math.random() * 0.25),
      recognizableElements: detected
        ? ['tone', 'pitch patterns', 'rhythm', 'vocal characteristics', 'instrumentation']
        : [],
      frequencyResponse: frequencyResponse,
      reportUrl: `https://reports.syntheticrights.com/analysis/${contentHash}`
    }
  };
}

/**
 * Detect if text was used in AI training
 */
async function detectTextTrainingUsage(
  text: ContentDescriptor,
  contentHash: string,
  options?: {
    deepScan?: boolean;
    targetModels?: string[];
    sensitivityLevel?: 'high' | 'medium' | 'low';
  }
): Promise<AITrainingDetectionResult> {
  // Simulate detection delays based on scan depth
  const delay = options?.deepScan ? 1500 : 400;
  await new Promise(resolve => setTimeout(resolve, delay));

  // For demo, create random but realistic-looking results
  const detected = Math.random() > 0.3; // 70% chance of detection
  const confidence = detected
    ? 0.75 + (Math.random() * 0.25) // 0.75-1.0
    : 0.05 + (Math.random() * 0.2); // 0.05-0.25

  // Generate model matches
  const modelCount = detected ? Math.floor(Math.random() * 4) + 1 : 0;
  const models: AIModelMatch[] = [];

  const possibleModels = [
    { name: 'GPT-4', provider: 'OpenAI' },
    { name: 'Claude 3', provider: 'Anthropic' },
    { name: 'Gemini', provider: 'Google' },
    { name: 'Llama 3', provider: 'Meta AI' },
    { name: 'Mistral Large', provider: 'Mistral AI' }
  ];

  for (let i = 0; i < modelCount; i++) {
    const model = possibleModels[Math.floor(Math.random() * possibleModels.length)];
    models.push({
      modelName: model.name,
      provider: model.provider,
      confidence: 0.6 + (Math.random() * 0.4), // 0.6-1.0
      evidenceStrength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as 'weak' | 'moderate' | 'strong',
      lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trainingPeriod: {
        start: '2023-01-01',
        end: '2024-02-29'
      }
    });
  }

  // Generate details
  const patternCount = Math.floor(Math.random() * 50) + 20;
  const matchedPatterns = detected
    ? Math.floor(patternCount * confidence)
    : Math.floor(patternCount * 0.05);

  return {
    detected,
    confidence,
    models,
    evidenceType: detected
      ? (['direct', 'behavioral', 'stylistic'][Math.floor(Math.random() * 3)] as 'direct' | 'behavioral' | 'stylistic')
      : 'behavioral',
    analysisTimestamp: new Date().toISOString(),
    uniquePatternFound: detected && confidence > 0.9,
    details: {
      matchedPatterns,
      totalCheckedPatterns: patternCount,
      outputSimilarity: detected ? 0.7 + (Math.random() * 0.3) : 0.1 + (Math.random() * 0.2),
      recognizableElements: detected
        ? ['phrasing', 'structural patterns', 'stylistic elements', 'vocabulary usage', 'thematic content']
        : [],
      semanticPreservation: detected ? 0.8 + (Math.random() * 0.2) : 0.2 + (Math.random() * 0.3),
      reportUrl: `https://reports.syntheticrights.com/analysis/${contentHash}`
    }
  };
}
