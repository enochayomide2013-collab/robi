/**
 * Client-Side Profanity Filter Utility for ACADO GameChat
 * Sanitizes user-sent messages to maintain a family-friendly gaming experience.
 */

const BLOCKED_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy',
  'cock', 'whore', 'slut', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  'idiot', 'moron', 'dumbass', 'kill yourself', 'kys', 'stfu', 'wtf', 'porn'
];

/**
 * Checks whether text contains flagged words.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
}

/**
 * Sanitizes input text by replacing blocked words with asterisks.
 */
export function sanitizeProfanity(text: string): string {
  if (!text) return '';
  let sanitized = text;

  BLOCKED_WORDS.forEach((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => '*'.repeat(match.length));
  });

  return sanitized;
}
