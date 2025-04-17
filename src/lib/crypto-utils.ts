/**
 * Crypto utilities for synthetic media rights management
 *
 * These utilities provide cryptographic functions for secure operations
 * like hashing, signing, and verification.
 */

/**
 * Generates a SHA-256 hash of the provided input
 * @param input - The string to hash
 * @returns A hex string representation of the hash
 */
export async function sha256(input: string): Promise<string> {
  try {
    // Use the Web Crypto API for consistent cross-platform support
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error generating SHA-256 hash:', error);
    throw new Error('Failed to generate SHA-256 hash');
  }
}

/**
 * Signs data with a private key (simplified implementation)
 * In a real implementation, this would use proper cryptographic signing
 */
export async function signData(data: string, privateKey: string): Promise<string> {
  // This is a placeholder. In a real application, this would use proper
  // cryptographic signing with the provided private key
  const hash = await sha256(data + privateKey);
  return `signed-${hash}`;
}

/**
 * Verifies a signature against data and a public key (simplified implementation)
 * In a real implementation, this would use proper cryptographic verification
 */
export async function verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
  // This is a placeholder. In a real application, this would verify the
  // signature using proper cryptographic verification with the public key
  const expectedSignature = `signed-${await sha256(data + publicKey)}`;
  return signature === expectedSignature;
}
