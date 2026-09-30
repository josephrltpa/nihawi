// ============================================================
// WINNER SELECTION - Deterministic seeded random selection
// ============================================================

import { Entry, Winner, BackupWinner, Prize } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a seed string from multiple sources
 */
export function generateDrawSeed(
  giveawayId: string,
  adminUserId: string,
  nonce: string,
  timestamp: string,
  secretPhrase?: string
): string {
  const combined = `${giveawayId}:${adminUserId}:${nonce}:${timestamp}:${secretPhrase || ''}`;
  return simpleHash(combined);
}

/**
 * Simple hash function (SHA-256 simulation for client-side)
 * In production, use crypto.subtle.digest
 */
function simpleHash(input: string): string {
  let hash = 0;
  const str = input + 'nihawi_jaui_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + 
         Math.abs(hash * 31).toString(16).padStart(8, '0');
}

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
function seededRandom(seed: string): () => number {
  let state = parseInt(seed, 16) || 12345;
  return function() {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

export interface DrawConfig {
  giveawayId: string;
  adminUserId: string;
  prizes: Prize[];
  backupCount: number;
  allowMultipleEntries: boolean;
  multipleEntryStrategy: 'earliest' | 'latest';
  secretPhrase?: string;
}

export interface DrawOutput {
  seed: string;
  nonce: string;
  timestamp: string;
  eligibleEntryCount: number;
  winners: Winner[];
  backups: BackupWinner[];
  warnings: string[];
}

/**
 * Run the official draw
 */
export function runDraw(
  eligibleEntries: Entry[],
  config: DrawConfig
): DrawOutput {
  const warnings: string[] = [];
  const timestamp = new Date().toISOString();
  const nonce = uuidv4().slice(0, 8);
  
  // Deduplicate entries if needed
  let pool = [...eligibleEntries];
  
  if (!config.allowMultipleEntries) {
    const seen = new Map<string, Entry>();
    pool.forEach(entry => {
      const existing = seen.get(entry.entrant_username.toLowerCase());
      if (!existing) {
        seen.set(entry.entrant_username.toLowerCase(), entry);
      } else {
        // Keep earliest or latest based on strategy
        const existingTime = new Date(existing.created_at).getTime();
        const entryTime = new Date(entry.created_at).getTime();
        if (config.multipleEntryStrategy === 'earliest' && entryTime < existingTime) {
          seen.set(entry.entrant_username.toLowerCase(), entry);
        } else if (config.multipleEntryStrategy === 'latest' && entryTime > existingTime) {
          seen.set(entry.entrant_username.toLowerCase(), entry);
        }
      }
    });
    pool = Array.from(seen.values());
  }
  
  if (pool.length === 0) {
    warnings.push('No eligible entries available for draw');
    return {
      seed: '',
      nonce,
      timestamp,
      eligibleEntryCount: 0,
      winners: [],
      backups: [],
      warnings,
    };
  }
  
  const totalNeeded = config.prizes.length + config.backupCount;
  if (pool.length < totalNeeded) {
    warnings.push(`Only ${pool.length} eligible entries available, need ${totalNeeded} (${config.prizes.length} winners + ${config.backupCount} backups)`);
  }
  
  // Generate seed
  const seed = generateDrawSeed(
    config.giveawayId,
    config.adminUserId,
    nonce,
    timestamp,
    config.secretPhrase
  );
  
  // Shuffle entries
  const shuffled = seededShuffle(pool, seed);
  
  // Select winners
  const winners: Winner[] = [];
  const selectedUsernames = new Set<string>();
  
  const sortedPrizes = [...config.prizes].sort((a, b) => a.display_order - b.display_order);
  
  for (const prize of sortedPrizes) {
    for (const entry of shuffled) {
      if (!selectedUsernames.has(entry.entrant_username.toLowerCase())) {
        winners.push({
          id: uuidv4(),
          giveaway_id: config.giveawayId,
          entry_id: entry.id,
          entrant_username: entry.entrant_username,
          prize_rank: prize.rank,
          prize_name: prize.name,
          selected_at: timestamp,
          selection_order: winners.length + 1,
          seed_used: seed,
          status: 'selected',
          claimed_at: null,
          notes: '',
        });
        selectedUsernames.add(entry.entrant_username.toLowerCase());
        break;
      }
    }
  }
  
  // Select backups
  const backups: BackupWinner[] = [];
  let backupRank = 1;
  
  for (const entry of shuffled) {
    if (backups.length >= config.backupCount) break;
    if (!selectedUsernames.has(entry.entrant_username.toLowerCase())) {
      backups.push({
        id: uuidv4(),
        giveaway_id: config.giveawayId,
        entry_id: entry.id,
        entrant_username: entry.entrant_username,
        backup_rank: backupRank,
        selected_at: timestamp,
        promoted_to_winner_id: null,
        status: 'selected',
      });
      selectedUsernames.add(entry.entrant_username.toLowerCase());
      backupRank++;
    }
  }
  
  return {
    seed,
    nonce,
    timestamp,
    eligibleEntryCount: pool.length,
    winners,
    backups,
    warnings,
  };
}

/**
 * Verify that a draw is deterministic (same seed produces same results)
 */
export function verifyDraw(
  entries: Entry[],
  seed: string,
  config: DrawConfig
): { winners: string[]; backups: string[] } {
  const pool = [...entries];
  const shuffled = seededShuffle(pool, seed);
  
  const selectedUsernames = new Set<string>();
  const winnerUsernames: string[] = [];
  const backupUsernames: string[] = [];
  
  for (let i = 0; i < config.prizes.length && i < shuffled.length; i++) {
    for (const entry of shuffled) {
      if (!selectedUsernames.has(entry.entrant_username.toLowerCase())) {
        winnerUsernames.push(entry.entrant_username);
        selectedUsernames.add(entry.entrant_username.toLowerCase());
        break;
      }
    }
  }
  
  for (const entry of shuffled) {
    if (backupUsernames.length >= config.backupCount) break;
    if (!selectedUsernames.has(entry.entrant_username.toLowerCase())) {
      backupUsernames.push(entry.entrant_username);
      selectedUsernames.add(entry.entrant_username.toLowerCase());
    }
  }
  
  return { winners: winnerUsernames, backups: backupUsernames };
}
