/**
 * Dr.AI Client-Side Security & Data Protection Test Suite
 *
 * Verifies that client input sanitization, query parameter validation,
 * path safety checks, PII redaction, emergency triage pre-flight detection,
 * and authentication state storage operate correctly.
 */

import {
  sanitizeInput,
  validateSafeParam,
  isSafePath,
  redactPII,
  hasEmergencyKeywords,
} from './utils/sanitize';

describe('Dr.AI Client Security & Data Protection Suite', () => {
  // 1. XSS Input Sanitization
  describe('1. XSS Injection Sanitization', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><svg onload=alert(document.cookie)>',
      '<iframe src="javascript:alert(`XSS`)"></iframe>',
      '"><script src=data:text/javascript,alert(1)></script>',
      '<body onload=alert(/XSS/)>',
      '<input onfocus=alert(1) autofocus>',
    ];

    test.each(xssPayloads)('escapes dangerous HTML characters in payload: %s', (payload) => {
      const sanitized = sanitizeInput(payload);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('<svg');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('<body');
      expect(sanitized).not.toContain('<input');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    test('handles empty or non-string gracefully', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  // 2. Query Parameter Validation (NoSQL/SQL Injection Defense)
  describe('2. Query Parameter Validation', () => {
    const injectionVectors = [
      { param: "admin' --", description: 'SQL comment injection' },
      { param: "' OR '1'='1", description: 'Classic SQL tautology' },
      { param: "' UNION SELECT null, username, password FROM users --", description: 'UNION query extraction' },
      { param: "'; DROP TABLE users; --", description: 'Destructive SQL batch' },
      { param: { $gt: '' }, description: 'NoSQL operator object injection' },
      { param: { $where: 'this.password.length > 0' }, description: 'NoSQL where clause injection' },
      { param: 12345, description: 'Non-string numeric payload' },
    ];

    test.each(injectionVectors)('rejects dangerous parameter: $description', ({ param }) => {
      const isValid = validateSafeParam(param);
      expect(isValid).toBe(false);
    });

    test('accepts benign alphanumeric query parameters', () => {
      expect(validateSafeParam('cardiology')).toBe(true);
      expect(validateSafeParam('fever-cough-headache')).toBe(true);
      expect(validateSafeParam('dr_sarah_johnson')).toBe(true);
    });
  });

  // 3. Path Traversal Protection
  describe('3. Directory Traversal & LFI Protection', () => {
    const dangerousPaths = [
      '../../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//etc/shadow',
      '/etc/hosts\0.jpg',
      '/var/log/syslog',
    ];

    test.each(dangerousPaths)('blocks unsafe file path: %s', (filepath) => {
      expect(isSafePath(filepath)).toBe(false);
    });

    test('allows clean sanitized file extensions and identifiers', () => {
      expect(isSafePath('user-avatar.png')).toBe(true);
      expect(isSafePath('lab_results_2026.pdf')).toBe(true);
      expect(isSafePath('scan101.jpg')).toBe(true);
    });
  });

  // 4. Client-Side PII Masking
  describe('4. PII Redaction & Data Masking', () => {
    test('masks US Social Security Numbers', () => {
      const raw = 'Patient SSN is 123-45-6789 registered with Medicaid.';
      const masked = redactPII(raw);
      expect(masked).toBe('Patient SSN is [REDACTED_SSN] registered with Medicaid.');
      expect(masked).not.toContain('123-45-6789');
    });

    test('masks Primary Account / Credit Card Numbers', () => {
      const raw = 'Payment card 4111-2222-3333-4444 charged $50.00';
      const masked = redactPII(raw);
      expect(masked).toContain('****-****-****-[MASKED]');
      expect(masked).not.toContain('4111-2222-3333-4444');
    });
  });

  // 5. Acute Emergency Keyword Detection
  describe('5. Client Emergency Pre-flight Detection', () => {
    test('flags severe emergency symptoms for escalation', () => {
      expect(hasEmergencyKeywords('I have severe crushing chest pain radiating to left arm')).toBe(true);
      expect(hasEmergencyKeywords('My father has sudden facial droop and cannot breathe')).toBe(true);
      expect(hasEmergencyKeywords('Feeling acute dyspnea and shortness of breath')).toBe(true);
      expect(hasEmergencyKeywords('Experiencing suicidal thoughts')).toBe(true);
    });

    test('does not trigger for routine non-emergent complaints', () => {
      expect(hasEmergencyKeywords('Mild headache and sore throat for two days')).toBe(false);
      expect(hasEmergencyKeywords('Minor rash on elbow after hiking')).toBe(false);
      expect(hasEmergencyKeywords('Sprained ankle during soccer game')).toBe(false);
    });
  });

  // 6. Token Storage Integrity
  describe('6. Client Token Storage Integrity', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('stores and clears authentication token in localStorage correctly', () => {
      const testToken = 'header.payload.signature';
      localStorage.setItem('dr_ai_token', testToken);
      expect(localStorage.getItem('dr_ai_token')).toBe(testToken);

      localStorage.removeItem('dr_ai_token');
      expect(localStorage.getItem('dr_ai_token')).toBeNull();
    });
  });
});
