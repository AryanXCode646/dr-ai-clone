/**
 * Client-Side Input Sanitization and PII Masking Utilities
 * Provides defense-in-depth sanitization for user inputs before network transmission.
 */

/**
 * Escapes dangerous HTML entities to mitigate XSS in client-rendered contexts.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates query parameters against dangerous SQL/NoSQL injection tokens.
 */
export const validateSafeParam = (param: any): boolean => {
  if (typeof param !== 'string') return false;
  const forbiddenPatterns = [
    /\$gt/i,
    /\$where/i,
    /\$ne/i,
    /\$regex/i,
    /union\s+select/i,
    /drop\s+table/i,
    /--/,
    /['";]\s*or\s+['"]?1['"]?\s*=\s*['"]?1/i,
  ];
  return !forbiddenPatterns.some((p) => p.test(param));
};

/**
 * Validates safe filenames and paths against directory traversal.
 */
export const isSafePath = (filepath: string): boolean => {
  if (typeof filepath !== 'string') return false;
  try {
    const decoded = decodeURIComponent(filepath);
    if (
      decoded.includes('..') ||
      decoded.includes('\0') ||
      decoded.startsWith('/') ||
      decoded.includes('\\')
    ) {
      return false;
    }
    return /^[a-zA-Z0-9_\-.]+\.[a-zA-Z0-9]+$/.test(decoded);
  } catch {
    return false;
  }
};

/**
 * Masks sensitive patient identification details (SSN, credit cards) for client logs and exports.
 */
export const redactPII = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/\b(?:\d{4}-){3}\d{4}\b/g, '****-****-****-[MASKED]');
};

/**
 * Quick client-side check for acute life-threatening emergency symptoms.
 */
const EMERGENCY_REGEX = /\b(chest\s+pain|heart\s+attack|stroke|facial\s+droop|cannot\s+breathe|dyspnea|shortness\s+of\s+breath|suicid\w*|overdose\w*)\b/i;

export const hasEmergencyKeywords = (input: string): boolean => {
  if (!input) return false;
  return EMERGENCY_REGEX.test(input);
};
