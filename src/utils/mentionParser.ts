// ============================================================
// MENTION PARSER - Robust @mention extraction from comments
// ============================================================

export interface ParsedMention {
  username: string;
  isSelfMention: boolean;
  isTargetAccountMention: boolean;
  qualifiesAsFriendMention: boolean;
}

export interface MentionParseResult {
  allMentions: string[];
  uniqueMentions: string[];
  qualifyingFriendMentions: string[];
  requiredMentions: string[];
  minRequiredMet: boolean;
  parsedMentions: ParsedMention[];
}

/**
 * Extract @mentions from comment text
 * - Supports letters, numbers, periods, underscores
 * - Case-insensitive comparison
 * - Trims punctuation around mentions
 * - Ignores email-like strings (name@domain.com)
 * - Removes duplicate mentions within same comment
 * - Ignores entrant's own username
 * - Ignores target giveaway handles
 */
export function parseMentions(
  commentText: string,
  entrantUsername: string,
  targetAccounts: string[],
  minRequired: number = 3
): MentionParseResult {
  // Regex to find @mentions - supports letters, numbers, periods, underscores
  // Must not be preceded by a word character (to avoid matching emails)
  const mentionRegex = /(?<![a-zA-Z0-9._])@([a-zA-Z0-9][a-zA-Z0-9._]{0,28}[a-zA-Z0-9]|[a-zA-Z0-9])/g;
  
  // First, remove email-like patterns to avoid false positives
  const cleanedText = commentText.replace(/[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  
  const rawMentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(cleanedText)) !== null) {
    const username = match[1].toLowerCase().replace(/[._]+$/, ''); // Trim trailing dots/underscores
    if (username && !rawMentions.includes(username)) {
      rawMentions.push(username);
    }
  }
  
  const entrantLower = entrantUsername.toLowerCase().replace(/^@/, '');
  const targetLower = targetAccounts.map(t => t.toLowerCase().replace(/^@/, ''));
  
  const parsedMentions: ParsedMention[] = rawMentions.map(username => {
    const isSelfMention = username === entrantLower;
    const isTargetAccountMention = targetLower.includes(username);
    const qualifiesAsFriendMention = !isSelfMention && !isTargetAccountMention;
    
    return {
      username,
      isSelfMention,
      isTargetAccountMention,
      qualifiesAsFriendMention,
    };
  });
  
  const qualifyingFriendMentions = parsedMentions
    .filter(m => m.qualifiesAsFriendMention)
    .map(m => m.username);
  
  const requiredMentions = qualifyingFriendMentions.slice(0, minRequired);
  const minRequiredMet = qualifyingFriendMentions.length >= minRequired;
  
  return {
    allMentions: rawMentions,
    uniqueMentions: [...new Set(rawMentions)],
    qualifyingFriendMentions,
    requiredMentions,
    minRequiredMet,
    parsedMentions,
  };
}

/**
 * Check if a username is a valid Instagram-style username
 */
export function isValidInstagramUsername(username: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._]{0,28}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(username);
}

/**
 * Detect suspicious mention patterns
 */
export function detectSuspiciousPatterns(
  entries: { entrant_username: string; mentions: string[] }[]
): Map<string, string[]> {
  const flags = new Map<string, string[]>();
  
  // Check for same set of friends mentioned by many entrants
  const mentionSets = new Map<string, number>();
  entries.forEach(entry => {
    const sortedMentions = [...entry.mentions].sort().join(',');
    mentionSets.set(sortedMentions, (mentionSets.get(sortedMentions) || 0) + 1);
  });
  
  mentionSets.forEach((count, set) => {
    if (count >= 5) {
      const usernames = set.split(',');
      usernames.forEach(u => {
        const existing = flags.get(u) || [];
        if (!existing.includes('same_mention_set_pattern')) {
          existing.push('same_mention_set_pattern');
          flags.set(u, existing);
        }
      });
    }
  });
  
  // Check for bot-like usernames (random strings)
  entries.forEach(entry => {
    const username = entry.entrant_username;
    if (/^[a-z]+[0-9]{5,}$/.test(username) || /^[0-9]+[a-z]+$/.test(username)) {
      const existing = flags.get(username) || [];
      existing.push('bot_like_username');
      flags.set(username, existing);
    }
  });
  
  return flags;
}
