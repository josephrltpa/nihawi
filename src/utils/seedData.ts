// ============================================================
// SEED DATA - Demo mode sample data
// ============================================================

import { Giveaway, Comment, Entry, Mention, AuditLog, AdminUser, Prize } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseMentions } from './mentionParser';

const TARGET_ACCOUNTS = ['nihawi_puan', 'jaui_official'];
const GIVEAWAY_ID = 'gw-demo-001';

const fakeComments: { username: string; text: string; hoursAgo: number }[] = [
  // Valid entries with 3+ mentions
  { username: 'sarah_beauty', text: '@bestie_anna @lisa_moon @cake_lover99 this is amazing! @nihawi_puan @jaui_official 🔥', hoursAgo: 48 },
  { username: 'jake_runs', text: '@marco_fit @dina.style @rohit.k @nihawi_puan @jaui_official need this!!', hoursAgo: 46 },
  { username: 'luna.star', text: '@pixie.dust @neon_vibes @cosmic.jay @nihawi_puan @jaui_official omg enter now!!', hoursAgo: 44 },
  { username: 'dev_king', text: '@code_ninja @pixel_art @tech_guru @nihawi_puan @jaui_official lets gooo', hoursAgo: 42 },
  { username: 'mia.photo', text: '@sunset.chaser @golden.hour @lens.master @nihawi_puan @jaui_official 📸✨', hoursAgo: 40 },
  { username: 'alex.music', text: '@beat_maker @melody_queen @rhythm_kid @nihawi_puan @jaui_official fire 🔥🔥', hoursAgo: 38 },
  { username: 'zoe.yoga', text: '@zen.master @flow_state @namaste_life @nihawi_puan @jaui_official 🧘‍♀️', hoursAgo: 36 },
  { username: 'ryan.cook', text: '@chef_boy @spice_king @foodie_queen @nihawi_puan @jaui_official yum!', hoursAgo: 34 },
  { username: 'emma.reads', text: '@bookworm22 @page_turner @novel_addict @nihawi_puan @jaui_official 📚', hoursAgo: 32 },
  { username: 'tom.travel', text: '@wanderlust99 @globe_trotter @adventure_soul @nihawi_puan @jaui_official ✈️', hoursAgo: 30 },
  { username: 'nina.dance', text: '@groove_master @dance_fever @rhythm_soul @nihawi_puan @jaui_official 💃', hoursAgo: 28 },
  { username: 'kai.surf', text: '@wave_rider @ocean_soul @beach_bum22 @nihawi_puan @jaui_official 🏄', hoursAgo: 26 },
  { username: 'lily.art', text: '@color_palette @brush_stroke @canvas_dream @nihawi_puan @jaui_official 🎨', hoursAgo: 24 },
  { username: 'max.gaming', text: '@pro_gamer @stream_king @pixel_warrior @nihawi_puan @jaui_official 🎮', hoursAgo: 22 },
  { username: 'ruby.fashion', text: '@style_icon @trend_setter @fashion_killa @nihawi_puan @jaui_official 👗', hoursAgo: 20 },
  // Valid entries with more than 3 mentions
  { username: 'chris.fit', text: '@gym_rat @iron_pump @cardio_king @flex_master @nihawi_puan @jaui_official 💪 lets go!', hoursAgo: 18 },
  { username: 'diana.garden', text: '@plant_mom @green_thumb @bloom_child @nihawi_puan @jaui_official 🌿🌸', hoursAgo: 16 },
  { username: 'ethan.code', text: '@debug_king @stack_overflow_fan @code_craft @nihawi_puan @jaui_official 🖥️', hoursAgo: 14 },
  // Insufficient mentions (only 2)
  { username: 'olivia.sing', text: '@music_love @harmony_soul @nihawi_puan @jaui_official love this!', hoursAgo: 12 },
  { username: 'paul.skate', text: '@kick_flip @board_rider @nihawi_puan @jaui_official sick reel!', hoursAgo: 11 },
  // Self mention (mentions themselves)
  { username: 'quinn.draw', text: '@quinn.draw @art_friend1 @creative_soul @nihawi_puan @jaui_official', hoursAgo: 10 },
  { username: 'sam.photo', text: '@sam.photo @sam.photo @lens_buddy @nihawi_puan @jaui_official', hoursAgo: 9 },
  // Target account mentions only
  { username: 'tina.love', text: '@nihawi_puan @jaui_official amazing giveaway!!', hoursAgo: 8 },
  { username: 'uma.star', text: 'Love @nihawi_puan and @jaui_official so much! ❤️', hoursAgo: 7 },
  // Duplicate mentions
  { username: 'vic.run', text: '@runner_buddy @runner_buddy @runner_buddy @nihawi_puan @jaui_official', hoursAgo: 6 },
  // Bot-like username
  { username: 'xkcd99482', text: '@friend1_x @friend2_y @friend3_z @nihawi_puan @jaui_official', hoursAgo: 5 },
  { username: 'user8472910', text: '@pal_a @pal_b @pal_c @nihawi_puan @jaui_official', hoursAgo: 4 },
  // Duplicate entry (same user comments twice)
  { username: 'sarah_beauty', text: '@bestie_anna @lisa_moon @cake_lover99 @nihawi_puan @jaui_official entering again!!', hoursAgo: 3 },
  // Valid entry
  { username: 'wendy.bake', text: '@sugar_rush @flour_power @butter_cream @nihawi_puan @jaui_official 🧁', hoursAgo: 2 },
  { username: 'xavier.dj', text: '@bass_drop @vinyl_spin @mix_master @nihawi_puan @jaui_official 🎧', hoursAgo: 1 },
  // Same friend set pattern (suspicious)
  { username: 'yara.knit', text: '@same_friend1 @same_friend2 @same_friend3 @nihawi_puan @jaui_official', hoursAgo: 1 },
  { username: 'zack.bike', text: '@same_friend1 @same_friend2 @same_friend3 @nihawi_puan @jaui_official', hoursAgo: 1 },
];

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
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 1, name: '1st Prize', description: 'Premium Gift Set', display_order: 1 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 2, name: '2nd Prize', description: 'Gift Card Bundle', display_order: 2 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 3, name: '3rd Prize', description: 'Mystery Box', display_order: 3 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 4, name: 'Consolation Prize 1', description: 'Surprise Gift', display_order: 4 },
    { id: uuidv4(), giveaway_id: GIVEAWAY_ID, rank: 5, name: 'Consolation Prize 2', description: 'Surprise Gift', display_order: 5 },
  ];
  
  const giveaway: Giveaway = {
    id: GIVEAWAY_ID,
    name: 'Nihawi x Jaui Mega Giveaway',
    slug: 'nihawi-x-jaui-mega-giveaway',
    instagram_post_url: 'https://www.instagram.com/reel/CxXxXxXxXx/',
    instagram_media_id: '1234567890123456789',
    target_account_1: '@nihawi_puan',
    target_account_2: '@jaui_official',
    min_required_mentions: 3,
    strict_mention_mode: false,
    allow_multiple_entries_per_user: false,
    entry_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    repost_proof_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'reviewing',
    draw_seed: '',
    draw_nonce: '',
    created_by: admin.id,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    prizes,
  };
  
  const comments: Comment[] = [];
  const entries: Entry[] = [];
  const mentions: Mention[] = [];
  const auditLogs: AuditLog[] = [];
  
  // Generate comments and entries
  fakeComments.forEach((fc, idx) => {
    const commentId = uuidv4();
    const entryId = uuidv4();
    const timestamp = new Date(Date.now() - fc.hoursAgo * 60 * 60 * 1000).toISOString();
    
    const comment: Comment = {
      id: commentId,
      giveaway_id: GIVEAWAY_ID,
      instagram_comment_id: `ig_comment_${idx}`,
      entrant_username: fc.username,
      entrant_instagram_id: `ig_user_${idx}`,
      comment_text: fc.text,
      comment_timestamp: timestamp,
      source: 'manual',
      raw_payload: JSON.stringify({ text: fc.text, username: fc.username }),
      is_deleted: false,
      is_edited: false,
      imported_at: timestamp,
    };
    comments.push(comment);
    
    // Parse mentions
    const parsed = parseMentions(fc.text, fc.username, TARGET_ACCOUNTS, 3);
    
    // Determine risk flags
    const riskFlags: string[] = [];
    if (/^[a-z]+[0-9]{5,}$/.test(fc.username) || /^[0-9]+[a-z]+$/.test(fc.username)) {
      riskFlags.push('bot_like_username');
    }
    if (parsed.allMentions.length !== parsed.uniqueMentions.length) {
      riskFlags.push('duplicate_mentions_in_comment');
    }
    
    // Check for duplicate entrant
    const existingEntry = entries.find(e => e.entrant_username === fc.username);
    if (existingEntry) {
      riskFlags.push('multiple_entries');
    }
    
    const entry: Entry = {
      id: entryId,
      giveaway_id: GIVEAWAY_ID,
      comment_id: commentId,
      entrant_username: fc.username,
      entrant_instagram_id: `ig_user_${idx}`,
      mention_count: parsed.uniqueMentions.length,
      required_mentions_met: parsed.minRequiredMet,
      follow_verification_status: parsed.minRequiredMet ? 'pending' : 'pending',
      repost_verification_status: 'pending',
      duplicate_status: existingEntry ? 'duplicate' : 'unique',
      risk_score: riskFlags.length * 20,
      final_status: 'pending',
      admin_notes: '',
      risk_flags: riskFlags,
      created_at: timestamp,
      updated_at: timestamp,
    };
    entries.push(entry);
    
    // Create mention records
    parsed.parsedMentions.forEach(pm => {
      mentions.push({
        id: uuidv4(),
        entry_id: entryId,
        username: pm.username,
        is_self_mention: pm.isSelfMention,
        is_target_account_mention: pm.isTargetAccountMention,
        qualifies_as_friend_mention: pm.qualifiesAsFriendMention,
        follow_verification_status: 'pending',
        verified_by: null,
        verified_at: null,
        notes: '',
      });
    });
  });
  
  // Add initial audit log
  auditLogs.push({
    id: uuidv4(),
    giveaway_id: GIVEAWAY_ID,
    admin_user_id: admin.id,
    admin_name: admin.name,
    action: 'giveaway_created',
    entity_type: 'giveaway',
    entity_id: GIVEAWAY_ID,
    old_value: '',
    new_value: giveaway.name,
    reason: 'Initial setup',
    created_at: giveaway.created_at,
  });
  
  auditLogs.push({
    id: uuidv4(),
    giveaway_id: GIVEAWAY_ID,
    admin_user_id: admin.id,
    admin_name: admin.name,
    action: 'comments_imported',
    entity_type: 'comments',
    entity_id: GIVEAWAY_ID,
    old_value: '0',
    new_value: String(comments.length),
    reason: 'Demo data import',
    created_at: new Date().toISOString(),
  });
  
  return { admin, giveaway, comments, entries, mentions, auditLogs };
}
