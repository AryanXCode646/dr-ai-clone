import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/AppError';

/**
 * Neutralizes HTML special characters to prevent cross-site scripting (XSS).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether a parameter contains NoSQL / SQL injection patterns or tainted structures.
 */
export function validateSafeParam(param: any): boolean {
  if (typeof param !== 'string') return false;

  const forbiddenPatterns = [
    /\$gt/i,
    /\$where/i,
    /\$ne/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
    /union\s+select/i,
    /drop\s+table/i,
    /--/,
    /['";]\s*or\s+['"]?1['"]?\s*=\s*['"]?1/i,
  ];

  return !forbiddenPatterns.some((pattern) => pattern.test(param));
}

/**
 * Validates file paths to protect against Directory Traversal and Local File Inclusion.
 */
export function isSafePath(filepath: string): boolean {
  if (!filepath || typeof filepath !== 'string') return false;
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
}

/**
 * Express middleware that recursively validates and rejects request bodies containing NoSQL query operators.
 */
export function noSqlInjectionSanitizer(req: Request, res: Response, next: NextFunction) {
  const hasOperator = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') return false;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) return true;
      if (typeof obj[key] === 'object' && hasOperator(obj[key])) return true;
    }
    return false;
  };

  if (hasOperator(req.body) || hasOperator(req.query) || hasOperator(req.params)) {
    return next(new ValidationError('Invalid request payload: prohibited query operator detected'));
  }

  next();
}
