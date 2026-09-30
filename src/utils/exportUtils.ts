// ============================================================
// EXPORT UTILITIES - CSV export and announcement generation
// ============================================================

import { Entry, Winner, BackupWinner, AuditLog, Mention } from '../types';

/**
 * Convert array of objects to CSV string
 */
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape quotes and wrap in quotes if contains comma/quote/newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export all entries as CSV
 */
export function exportEntriesCSV(entries: Entry[], mentions: Mention[]): void {
  const data = entries.map(entry => {
    const entryMentions = mentions.filter(m => m.entry_id === entry.id);
    const friendMentions = entryMentions.filter(m => m.qualifies_as_friend_mention);
    
    return {
      entrant_username: entry.entrant_username,
      comment_id: entry.comment_id,
      mention_count: entry.mention_count,
      required_mentions_met: entry.required_mentions_met,
      qualifying_friends: friendMentions.map(m => m.username).join('; '),
      follow_status: entry.follow_verification_status,
      repost_status: entry.repost_verification_status,
      duplicate_status: entry.duplicate_status,
      risk_score: entry.risk_score,
      risk_flags: entry.risk_flags.join('; '),
      final_status: entry.final_status,
      admin_notes: entry.admin_notes,
      created_at: entry.created_at,
    };
  });
  
  const csv = toCSV(data);
  downloadCSV(csv, `entries_export_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export winners as CSV
 */
export function exportWinnersCSV(winners: Winner[], backups: BackupWinner[]): void {
  const winnerData = winners.map(w => ({
    type: 'winner',
    prize_rank: w.prize_rank,
    prize_name: w.prize_name,
    entrant_username: w.entrant_username,
    selected_at: w.selected_at,
    status: w.status,
    seed_used: w.seed_used,
  }));
  
  const backupData = backups.map(b => ({
    type: 'backup',
    prize_rank: b.backup_rank,
    prize_name: `Backup #${b.backup_rank}`,
    entrant_username: b.entrant_username,
    selected_at: b.selected_at,
    status: b.status,
    seed_used: '',
  }));
  
  const csv = toCSV([...winnerData, ...backupData]);
  downloadCSV(csv, `winners_export_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export audit log as CSV
 */
export function exportAuditLogCSV(logs: AuditLog[]): void {
  const data = logs.map(log => ({
    timestamp: log.created_at,
    admin: log.admin_name,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    reason: log.reason,
    old_value: log.old_value,
    new_value: log.new_value,
  }));
  
  const csv = toCSV(data);
  downloadCSV(csv, `audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Generate announcement text
 */
export function generateAnnouncement(
  winners: Winner[],
  backups: BackupWinner[],
  claimDeadlineHours: number = 48
): string {
  const sortedWinners = [...winners].sort((a, b) => a.prize_rank - b.prize_rank);
  
  let text = `🎉 WINNERS ANNOUNCEMENT 🎉\n\n`;
  text += `Thank you to everyone who entered our giveaway!\n\n`;
  text += `Here are the winners:\n\n`;
  
  sortedWinners.forEach(w => {
    const rankLabel = w.prize_rank <= 3 
      ? `${getOrdinal(w.prize_rank)} Prize` 
      : `Consolation Prize`;
    text += `${rankLabel}: @${w.entrant_username}\n`;
  });
  
  if (backups.length > 0) {
    text += `\n🔄 Backup Winners:\n`;
    backups.forEach(b => {
      text += `@${b.entrant_username}\n`;
    });
  }
  
  text += `\n⏰ Winners must DM us within ${claimDeadlineHours} hours to claim their prize.\n\n`;
  text += `Congratulations to all winners! 🎊\n\n`;
  text += `---\n`;
  text += `This giveaway was conducted fairly and transparently.\n`;
  text += `Draw seed and audit logs are available for verification.\n`;
  
  return text;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    return obj;
  });
}
