// ============================================================
// ELIGIBILITY ENGINE - Server-side eligibility calculation
// ============================================================

import { Entry, Mention, FollowStatus, RepostStatus, FinalStatus, MentionStatus } from '../types';

export interface EligibilityResult {
  mentionStatus: MentionStatus;
  followStatus: FollowStatus;
  repostStatus: RepostStatus;
  finalStatus: FinalStatus;
  reasons: string[];
}

/**
 * Calculate mention status for an entry
 */
export function calculateMentionStatus(
  mentionCount: number,
  requiredMentionsMet: boolean,
  mentions: Mention[]
): MentionStatus {
  if (mentionCount === 0) return 'invalid_mentions';
  
  const friendMentions = mentions.filter(m => m.qualifies_as_friend_mention);
  if (friendMentions.length === 0) {
    const selfMentions = mentions.filter(m => m.is_self_mention);
    const targetMentions = mentions.filter(m => m.is_target_account_mention);
    if (selfMentions.length > 0 && friendMentions.length === 0) return 'self_mention_only';
    if (targetMentions.length > 0 && friendMentions.length === 0) return 'duplicate_mentions_only';
    return 'invalid_mentions';
  }
  
  if (!requiredMentionsMet) return 'insufficient_mentions';
  return 'valid';
}

/**
 * Calculate follow status based on mention verification states
 */
export function calculateFollowStatus(mentions: Mention[]): FollowStatus {
  const requiredMentions = mentions.filter(m => m.qualifies_as_friend_mention);
  if (requiredMentions.length === 0) return 'pending';
  
  const verified = requiredMentions.filter(m => m.follow_verification_status === 'verified');
  const failed = requiredMentions.filter(m => m.follow_verification_status === 'failed');
  const pending = requiredMentions.filter(m => m.follow_verification_status === 'pending');
  const unable = requiredMentions.filter(m => m.follow_verification_status === 'unable_to_verify');
  
  if (failed.length > 0) return 'failed';
  if (pending.length > 0 || unable.length > 0) return 'partially_verified';
  if (verified.length === requiredMentions.length) return 'all_verified';
  return 'pending';
}

/**
 * Calculate final eligibility status
 */
export function calculateFinalEligibility(
  entry: Entry,
  mentions: Mention[],
  adminOverride?: { reason: string; overriddenBy: string }
): EligibilityResult {
  const reasons: string[] = [];
  
  // Calculate mention status
  const mentionStatus = calculateMentionStatus(
    entry.mention_count,
    entry.required_mentions_met,
    mentions
  );
  
  // Calculate follow status
  const followStatus = calculateFollowStatus(mentions);
  
  // Repost status from entry
  const repostStatus = entry.repost_verification_status;
  
  // Determine final status
  let finalStatus: FinalStatus = 'pending';
  
  // Check for exclusion
  if (entry.final_status === 'excluded') {
    finalStatus = 'excluded';
    reasons.push('Entry manually excluded by admin');
    return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
  }
  
  // Check mentions
  if (mentionStatus !== 'valid') {
    reasons.push(`Mention issue: ${mentionStatus}`);
    if (!adminOverride) {
      finalStatus = 'ineligible';
      return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
    }
    reasons.push(`Override applied: ${adminOverride.reason}`);
  }
  
  // Check follow
  if (followStatus === 'failed') {
    reasons.push('Follow verification failed for required mentions');
    if (!adminOverride) {
      finalStatus = 'ineligible';
      return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
    }
    reasons.push(`Override applied: ${adminOverride.reason}`);
  } else if (followStatus === 'partially_verified' || followStatus === 'pending') {
    reasons.push('Follow verification pending');
    finalStatus = 'pending';
    if (!adminOverride) {
      return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
    }
  }
  
  // Check repost
  if (repostStatus === 'rejected' || repostStatus === 'expired' || repostStatus === 'insufficient_proof') {
    reasons.push(`Repost verification issue: ${repostStatus}`);
    if (!adminOverride) {
      finalStatus = 'ineligible';
      return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
    }
    reasons.push(`Override applied: ${adminOverride.reason}`);
  } else if (repostStatus === 'pending') {
    reasons.push('Repost verification pending');
    if ((finalStatus as string) !== 'ineligible') {
      finalStatus = 'pending';
    }
    if (!adminOverride) {
      return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
    }
  }
  
  // All checks pass or overridden
  if (adminOverride || (mentionStatus === 'valid' && followStatus === 'all_verified' && repostStatus === 'verified')) {
    finalStatus = 'eligible';
    reasons.push('All eligibility requirements met');
  }
  
  return { mentionStatus, followStatus, repostStatus, finalStatus, reasons };
}

/**
 * Recalculate all entries' final statuses
 */
export function recalculateAllEntries(
  entries: Entry[],
  mentions: Mention[]
): Entry[] {
  return entries.map(entry => {
    const entryMentions = mentions.filter(m => m.entry_id === entry.id);
    const result = calculateFinalEligibility(entry, entryMentions);
    
    // Don't override manually set statuses (excluded, winner, backup)
    if (entry.final_status === 'excluded' || entry.final_status === 'winner' || entry.final_status === 'backup') {
      return entry;
    }
    
    return {
      ...entry,
      follow_verification_status: result.followStatus,
      final_status: result.finalStatus,
      updated_at: new Date().toISOString(),
    };
  });
}
