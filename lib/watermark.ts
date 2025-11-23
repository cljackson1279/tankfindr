/**
 * Watermark utilities for TankFindr reports
 * Prevents unauthorized sharing and data scraping
 */

export interface WatermarkData {
  reportId: string;
  email: string;
  timestamp: string;
}

/**
 * Generate a unique watermark ID for a report
 */
export function generateWatermarkId(email: string): string {
  const timestamp = Date.now();
  const hash = simpleHash(`${email}:${timestamp}`);
  return `TF-${hash.substring(0, 8).toUpperCase()}`;
}

/**
 * Embed watermark data in report
 */
export function embedWatermark(reportData: any, watermarkData: WatermarkData): any {
  return {
    ...reportData,
    _watermark: {
      id: watermarkData.reportId,
      email: obfuscateEmail(watermarkData.email),
      generated: watermarkData.timestamp,
      notice: 'This report is licensed for single use. Unauthorized distribution is prohibited.',
    },
  };
}

/**
 * Get watermark text for display
 */
export function getWatermarkText(watermarkData: WatermarkData): string {
  return `Report ID: ${watermarkData.reportId} • Generated for: ${obfuscateEmail(watermarkData.email)} • ${new Date(watermarkData.timestamp).toLocaleDateString()}`;
}

/**
 * Obfuscate email for display
 */
function obfuscateEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!domain) return email;

  const visibleChars = Math.min(3, username.length);
  const obfuscated = username.substring(0, visibleChars) + '***';
  return `${obfuscated}@${domain}`;
}

/**
 * Simple hash function
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if report access is valid
 */
export async function validateReportAccess(
  reportId: string,
  email: string
): Promise<boolean> {
  // TODO: Check database for valid purchase
  // For now, return true
  return true;
}
