// Lightweight heuristic scam-pattern detector, run synchronously on message
// send before persisting. This is NOT a replacement for human moderation —
// it flags for review and/or soft-warns the user; it never silently blocks
// legitimate conversation.
//
// Sugar-dating-style platforms are a common target for advance-fee /
// gift-card / wire-transfer scams. Detecting these patterns early and
// surfacing an in-app warning is one of the highest-leverage trust & safety
// investments for this category.

const FINANCIAL_REQUEST_PATTERNS: RegExp[] = [
  /gift\s*card/i,
  /wire\s*transfer/i,
  /western\s*union/i,
  /moneygram/i,
  /crypto(currency)?\s*(wallet|transfer|payment)/i,
  /bitcoin/i,
  /cash\s*app/i,
  /routing\s*number/i,
  /bank\s*account\s*(details|number)/i,
  /send\s*(me\s*)?money/i,
  /advance\s*(payment|fee)/i,
];

const OFF_PLATFORM_CONTACT_PATTERNS: RegExp[] = [
  /whats\s*app/i,
  /telegram/i,
  /\bsnap\s*chat\b/i,
  /my\s*number\s*is/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // bare phone number
];

export interface ScamScanResult {
  flagged: boolean;
  reason: string | null;
  category: "FINANCIAL_REQUEST" | "OFF_PLATFORM_REDIRECT" | null;
}

export function scanMessageForScamPatterns(body: string): ScamScanResult {
  for (const pattern of FINANCIAL_REQUEST_PATTERNS) {
    if (pattern.test(body)) {
      return {
        flagged: true,
        reason: `Message matched financial-request pattern: ${pattern.source}`,
        category: "FINANCIAL_REQUEST",
      };
    }
  }

  for (const pattern of OFF_PLATFORM_CONTACT_PATTERNS) {
    if (pattern.test(body)) {
      return {
        flagged: true,
        reason: `Message matched off-platform contact pattern: ${pattern.source}`,
        category: "OFF_PLATFORM_REDIRECT",
      };
    }
  }

  return { flagged: false, reason: null, category: null };
}
