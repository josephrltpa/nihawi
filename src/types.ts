// ============================================================
// TYPES - Nihawi x Jaui Instagram Giveaway Comment Picker
// ============================================================

export type UserRole = 'super_admin' | 'moderator' | 'viewer';

export type GiveawayStatus = 'draft' | 'importing' | 'reviewing' | 'ready_for_draw' | 'completed' | 'archived';

export type MentionStatus = 'valid' | 'insufficient_mentions' | 'invalid_mentions' | 'duplicate_mentions_only' | 'self_mention_only';

export type FollowStatus = 'pending' | 'all_verified' | 'failed' | 'partially_verified' | 'unable_to_verify';

export type RepostStatus = 'pending' | 'verified' | 'rejected' | 'expired' | 'insufficient_proof';

export type FinalStatus = 'eligible' | 'pending' | 'ineligible' | 'excluded' | 'winner' | 'backup';

export type DuplicateStatus = 'unique' | 'duplicate' | 'suspected_duplicate';

export type MentionFollowStatus = 'pending' | 'verified' | 'failed' | 'unable_to_verify';

export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'expired' | 'insufficient_proof';

export type WinnerStatus = 'selected' | 'contacted' | 'claimed' | 'disqualified';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Giveaway {
  id: string;
  name: string;
  slug: string;
  instagram_post_url: string;
  instagram_media_id: string;
  target_account_1: string;
  target_account_2: string;
  min_required_mentions: number;
  strict_mention_mode: boolean;
  allow_multiple_entries_per_user: boolean;
  entry_deadline: string;
  repost_proof_deadline: string;
  status: GiveawayStatus;
  draw_seed: string;
  draw_nonce: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  prizes: Prize[];
}

export interface Prize {
  id: string;
  giveaway_id: string;
  rank: number;
  name: string;
  description: string;
  display_order: number;
}

export interface Comment {
  id: string;
  giveaway_id: string;
  instagram_comment_id: string;
  entrant_username: string;
  entrant_instagram_id: string;
  comment_text: string;
  comment_timestamp: string;
  source: 'api' | 'csv' | 'json' | 'manual';
  raw_payload: string;
  is_deleted: boolean;
  is_edited: boolean;
  imported_at: string;
}

export interface Entry {
  id: string;
  giveaway_id: string;
  comment_id: string;
  entrant_username: string;
  entrant_instagram_id: string;
  mention_count: number;
  required_mentions_met: boolean;
  follow_verification_status: FollowStatus;
  repost_verification_status: RepostStatus;
  duplicate_status: DuplicateStatus;
  risk_score: number;
  final_status: FinalStatus;
  admin_notes: string;
  risk_flags: string[];
  created_at: string;
  updated_at: string;
}

export interface Mention {
  id: string;
  entry_id: string;
  username: string;
  is_self_mention: boolean;
  is_target_account_mention: boolean;
  qualifies_as_friend_mention: boolean;
  follow_verification_status: MentionFollowStatus;
  verified_by: string | null;
  verified_at: string | null;
  notes: string;
}

export interface RepostProof {
  id: string;
  entry_id: string;
  proof_type: 'screenshot' | 'admin_check' | 'manual_record';
  file_url: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  status: ProofStatus;
  notes: string;
  expires_at: string | null;
}

export interface Winner {
  id: string;
  giveaway_id: string;
  entry_id: string;
  entrant_username: string;
  prize_rank: number;
  prize_name: string;
  selected_at: string;
  selection_order: number;
  seed_used: string;
  status: WinnerStatus;
  claimed_at: string | null;
  notes: string;
}

export interface BackupWinner {
  id: string;
  giveaway_id: string;
  entry_id: string;
  entrant_username: string;
  backup_rank: number;
  selected_at: string;
  promoted_to_winner_id: string | null;
  status: WinnerStatus;
}

export interface AuditLog {
  id: string;
  giveaway_id: string;
  admin_user_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: string;
  new_value: string;
  reason: string;
  created_at: string;
}

export interface DrawResult {
  giveaway_id: string;
  seed: string;
  nonce: string;
  timestamp: string;
  admin_user_id: string;
  eligible_entry_count: number;
  winners: Winner[];
  backups: BackupWinner[];
}

export interface AppState {
  currentUser: AdminUser | null;
  giveaways: Giveaway[];
  comments: Comment[];
  entries: Entry[];
  mentions: Mention[];
  repostProofs: RepostProof[];
  winners: Winner[];
  backupWinners: BackupWinner[];
  auditLogs: AuditLog[];
  drawResult: DrawResult | null;
  isAuthenticated: boolean;
}
