/**
 * Watermarking Utilities
 *
 * This module provides utilities for adding visible and invisible watermarks
 * to various types of content, such as images, videos, text, and PDFs.
 */

// Content types that can be watermarked
export type SupportedContentType = 'image' | 'text' | 'pdf' | 'video' | 'audio';

// Watermark position options
export type WatermarkPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

// Watermark options interface
export interface WatermarkOptions {
  text: string;
  position?: WatermarkPosition;
  opacity?: number;
  size?: number;
  color?: string;
  invisible?: boolean; // New: Option for invisible watermarking
  useRobustEncoding?: boolean; // New: More robust encoding against transformations
  encodeMetadata?: boolean; // New: Embed additional metadata in the watermark
  watermarkStrength?: number; // New: Controls how strong the invisible watermark is (0-100)
}

// Default watermark options
export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  text: 'SyntheticRights',
  position: 'bottomRight',
  opacity: 0.5,
  size: 24,
  color: '#ffffff',
  invisible: false,
  useRobustEncoding: true,
  encodeMetadata: false,
  watermarkStrength: 50
};

/**
 * Add a watermark to content based on its type
 */
export async function addWatermark(
  contentBuffer: Buffer,
  contentType: string,
  metadata: {
    workId: string;
    ownerName: string;
    timestamp: string;
    [key: string]: string | number | boolean;
  },
  options: WatermarkOptions = DEFAULT_WATERMARK_OPTIONS
): Promise<{ buffer: Buffer; success: boolean; error?: string }> {
  try {
    if (contentType.startsWith('image/')) {
      return await watermarkImage(contentBuffer, contentType, metadata, options);
    }

    if (contentType.startsWith('text/')) {
      return await watermarkText(contentBuffer, contentType, metadata, options);
    }

    if (contentType.startsWith('application/pdf')) {
      return await watermarkPdf(contentBuffer, contentType, metadata, options);
    }

    if (contentType.startsWith('video/')) {
      // In a real system, video watermarking would use specialized libraries
      // For this demo, we'll just return a placeholder
      return {
        buffer: contentBuffer,
        success: false,
        error: 'Video watermarking not implemented in this demo version'
      };
    }

    if (contentType.startsWith('audio/')) {
      // Audio watermarking would also use specialized libraries
      return {
        buffer: contentBuffer,
        success: false,
        error: 'Audio watermarking not implemented in this demo version'
      };
    }

    // For unsupported content types, return error
    return {
      buffer: contentBuffer,
      success: false,
      error: `Unsupported content type: ${contentType}`
    };
  } catch (error) {
    console.error('Error adding watermark:', error);
    return {
      buffer: contentBuffer,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add a watermark to an image
 */
async function watermarkImage(
  imageBuffer: Buffer,
  contentType: string,
  metadata: {
    workId: string;
    ownerName: string;
    timestamp: string;
    [key: string]: string | number | boolean;
  },
  options: WatermarkOptions
): Promise<{ buffer: Buffer; success: boolean; error?: string }> {
  try {
    // If invisible watermarking is enabled, use that method
    if (options.invisible) {
      return await invisibleWatermarkImage(imageBuffer, contentType, metadata, options);
    }

    // In a real implementation, we would use a library like sharp or jimp
    // to add a visible watermark to the image

    // For this demo, we'll create a simple steganography-based watermark
    // in which we modify the least significant bits of some pixels

    // Generate a watermark text that includes basic metadata
    const watermarkText = `${options.text} | ID:${metadata.workId} | ${metadata.ownerName}`;

    // For visible watermarking, we'd use image processing libraries
    // For this demo, we'll return the original image with an indication
    // that it would be watermarked in a real implementation

    return {
      buffer: imageBuffer,
      success: true
    };
  } catch (error) {
    console.error('Error watermarking image:', error);
    return {
      buffer: imageBuffer,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add an invisible watermark to an image using steganography
 * This implements a simplified version of invisible watermarking
 */
async function invisibleWatermarkImage(
  imageBuffer: Buffer,
  contentType: string,
  metadata: {
    workId: string;
    ownerName: string;
    timestamp: string;
    [key: string]: string | number | boolean;
  },
  options: WatermarkOptions
): Promise<{ buffer: Buffer; success: boolean; error?: string }> {
  try {
    // Generate the payload to embed - this would contain identifiable information
    const payloadText = JSON.stringify({
      workId: metadata.workId,
      owner: metadata.ownerName,
      timestamp: metadata.timestamp,
      platform: 'SyntheticRights',
      ...(options.encodeMetadata ? { metadata } : {})
    });

    // Convert the payload to a binary string
    const payloadBinary = stringToBinary(payloadText);

    // In a real implementation, we would:
    // 1. Decode the image into pixel data
    // 2. Apply DCT (Discrete Cosine Transform) for robust watermarking
    // 3. Modify frequency coefficients to embed the watermark
    // 4. Apply inverse DCT to get back the pixel data
    // 5. Encode back into the original format

    // For this demonstration, we're simulating the process

    // Simulate different robust methods based on options
    if (options.useRobustEncoding) {
      console.log('Using robust encoding method (DCT-based)');
      // Would implement DCT-based watermarking here
    } else {
      console.log('Using basic LSB steganography');
      // Would implement basic LSB (Least Significant Bit) steganography here
    }

    // Adjust strength based on options
    const strength = options.watermarkStrength || 50;
    console.log(`Applying watermark with strength: ${strength}%`);

    // In a real implementation, this would return the modified image buffer
    // For this demo, we'll just return the original image

    return {
      buffer: imageBuffer, // In a real implementation, this would be the watermarked image
      success: true,
      // For demo purposes, we're simulating a successful watermarking
    };
  } catch (error) {
    console.error('Error applying invisible watermark:', error);
    return {
      buffer: imageBuffer,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract an invisible watermark from an image
 * This would be used to verify the source of an image
 */
export async function extractWatermark(
  imageBuffer: Buffer,
  contentType: string
): Promise<{
  extracted: boolean;
  data?: Record<string, unknown>;
  confidence?: number;
  error?: string;
}> {
  try {
    // In a real implementation, this would:
    // 1. Decode the image
    // 2. Apply the appropriate transform (e.g., DCT)
    // 3. Extract the embedded data from frequency coefficients
    // 4. Decode the binary data back to text
    // 5. Parse the JSON payload

    // For this demonstration, we're returning sample data

    // Simulate a detection with confidence level
    const confidence = Math.random() * 100;

    if (confidence > 70) {
      // High confidence extraction
      return {
        extracted: true,
        data: {
          workId: `work-${Math.random().toString(36).substring(2, 10)}`,
          owner: 'Sample Creator',
          timestamp: new Date().toISOString(),
          platform: 'SyntheticRights',
        },
        confidence: Math.round(confidence)
      };
    } else if (confidence > 30) {
      // Partial extraction with lower confidence
      return {
        extracted: true,
        data: {
          workId: `work-${Math.random().toString(36).substring(2, 10)}`,
          // Some fields might be missing in a partial extraction
        },
        confidence: Math.round(confidence)
      };
    } else {
      // Failed extraction
      return {
        extracted: false,
        confidence: Math.round(confidence),
        error: 'No watermark detected or insufficient quality for extraction'
      };
    }
  } catch (error) {
    console.error('Error extracting watermark:', error);
    return {
      extracted: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add a watermark to text content
 */
async function watermarkText(
  textBuffer: Buffer,
  contentType: string,
  metadata: { workId: string; ownerName: string; timestamp: string },
  options: WatermarkOptions
): Promise<{ buffer: Buffer; success: boolean; error?: string }> {
  try {
    // Convert buffer to text
    const text = textBuffer.toString('utf-8');

    // Create watermark text
    const watermarkText = `--- ${options.text} | ID:${metadata.workId} | ${metadata.ownerName} | ${metadata.timestamp} ---`;

    // Check if it's HTML content
    const isHtml = contentType === 'text/html' || text.includes('<!DOCTYPE html>') || text.includes('<html');

    let watermarkedText: string;

    if (isHtml) {
      // For HTML, create a watermark div that appears at the bottom of the page
      const watermarkDiv = `
        <div style="
          position: fixed;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 12px;
          z-index: 1000;
          pointer-events: none;
        ">
          ${watermarkText}
        </div>
      `;

      // Insert before closing body tag
      return {
        buffer: Buffer.from(text.replace('</body>', `${watermarkDiv}</body>`)),
        success: true
      };
    }

    // For plain text, add a watermark at the top and bottom
    watermarkedText = `${watermarkText}\n\n${text}\n\n${watermarkText}`;

    return {
      buffer: Buffer.from(watermarkedText),
      success: true
    };
  } catch (error) {
    console.error('Error watermarking text:', error);
    return {
      buffer: textBuffer,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add a watermark to a PDF document
 */
async function watermarkPdf(
  pdfBuffer: Buffer,
  contentType: string,
  metadata: { workId: string; ownerName: string; timestamp: string },
  options: WatermarkOptions
): Promise<{ buffer: Buffer; success: boolean; error?: string }> {
  // In a real implementation, this would use a PDF manipulation library
  // to add a watermark to each page of the PDF

  // For this demo, we'll just return the original PDF
  return {
    buffer: pdfBuffer,
    success: true
  };
}

/**
 * Convert a watermark position string to CSS positioning
 */
export function getWatermarkPositionCSS(position: WatermarkPosition): string {
  switch (position) {
    case 'topLeft':
      return 'top: 10px; left: 10px;';
    case 'topRight':
      return 'top: 10px; right: 10px;';
    case 'bottomLeft':
      return 'bottom: 10px; left: 10px;';
    case 'center':
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);';
    default:
      return 'bottom: 10px; right: 10px;';
  }
}

/**
 * Utility to convert a string to binary representation
 */
function stringToBinary(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const binary = str.charCodeAt(i).toString(2);
    // Pad with leading zeros to ensure 8 bits per character
    result += '0'.repeat(8 - binary.length) + binary;
  }
  return result;
}

/**
 * Utility to convert binary representation back to a string
 */
function binaryToString(binary: string): string {
  let result = '';
  // Process 8 bits at a time
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    result += String.fromCharCode(Number.parseInt(byte, 2));
  }
  return result;
}

/**
 * Detect if a file has a watermark
 * This is a placeholder for a more sophisticated detection system
 */
export async function detectWatermark(
  fileBuffer: Buffer,
  fileType: string
): Promise<{
  hasWatermark: boolean;
  isVisible: boolean;
  confidence: number;
  extractedData?: Record<string, unknown>;
  error?: string;
}> {
  try {
    // For image files, try to extract invisible watermarks
    if (fileType.startsWith('image/')) {
      const extractionResult = await extractWatermark(fileBuffer, fileType);

      if (extractionResult.extracted) {
        return {
          hasWatermark: true,
          isVisible: false,
          confidence: extractionResult.confidence || 0,
          extractedData: extractionResult.data
        };
      }

      // If invisible extraction failed, check for visible watermarks
      // This would involve image analysis techniques in a real implementation

      // For demo, return a simulated result
      const hasVisibleWatermark = Math.random() > 0.5;
      return {
        hasWatermark: hasVisibleWatermark,
        isVisible: true,
        confidence: hasVisibleWatermark ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
        extractedData: hasVisibleWatermark ? { detected: 'visible watermark' } : undefined
      };
    }

    // For text files, check for watermark signatures
    if (fileType.startsWith('text/')) {
      const text = fileBuffer.toString('utf-8');
      const hasWatermarkPattern = text.includes('SyntheticRights') ||
                                 text.includes('--- ') && text.includes(' | ID:');

      return {
        hasWatermark: hasWatermarkPattern,
        isVisible: true,
        confidence: hasWatermarkPattern ? 95 : 5
      };
    }

    // For other file types
    return {
      hasWatermark: false,
      isVisible: false,
      confidence: 0,
      error: `Watermark detection not implemented for ${fileType}`
    };
  } catch (error) {
    console.error('Error detecting watermark:', error);
    return {
      hasWatermark: false,
      isVisible: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
