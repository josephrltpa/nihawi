// ============================================================
// SEED DATA - Clean start with no demo entries
// ============================================================

import { Giveaway, Comment, Entry, Mention, AuditLog, AdminUser, Prize } from '../types';
import { v4 as uuidv4 } from 'uuid';

const GIVEAWAY_ID = 'gw-nihawi-jaui-001';

export function generateSeedData(): {
  admin: AdminUser;
  giveaway: Giveaway;
  comments: Comment[];
  entries: Entry[];
  mentions: Mention[];
  auditLogs: AuditLog[];
} {
  const admin: AdminUser = {
    id: 'admin-001',
    name: 'Nihawi Admin',
    email: 'admin@nihawi.com',
    role: 'super_admin',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const prizes: Prize[] = [
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 1, name: '1st Prize', description: '', display_order: 1 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 2, name: '2nd Prize', description: '', display_order: 2 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 3, name: '3rd Prize', description: '', display_order: 3 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 4, name: 'Consolation Prize 1', description: '', display_order: 4 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 5, name: 'Consolation Prize 2', description: '', display_order: 5 },
  ];
  
  const giveaway: Giveaway = {
    id: GIVEAWAY_ID,
    name: 'Nihawi Puan x Jaui Mega Giveaway',
    slug: 'nihawi-puan-x-jaui-mega-giveaway',
    instagram_post_url: 'https://www.instagram.com/reel/DdQur5BugOd/',
    instagram_media_id: 'DdQur5BugOd',
    target_account_1: '@nihawi_puan',
    target_account_2: '@jauigiggles',
    min_required_mentions: 3,
    strict_mention_mode: false,
    allow_multiple_entries_per_user: false,
    entry_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    repost_proof_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    draw_seed: '',
    draw_nonce: '',
    created_by: admin.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prizes,
  };
  
  // Empty arrays - ready for real imports
  const comments: Comment[] = [];
  const entries: Entry[] = [];
  const mentions: Mention[] = [];
  
  const auditLogs: AuditLog[] = [
    {
      id: uuidv4(),
      giveaway_id: GIVEAWAY_ID,
      admin_user_id: admin.id,
      admin_name: admin.name,
      action: 'giveaway_created',
      entity_type: 'giveaway',
      entity_id: GIVEAWAY_ID,
      old_value: '',
      new_value: giveaway.name,
      reason: 'Giveaway initialized - ready for comment import',
      created_at: giveaway.created_at,
    }
  ];
  
  return { admin, giveaway, comments, entries, mentions, auditLogs };
}
