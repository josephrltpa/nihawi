// ============================================================
// ENTRIES PAGE - View and manage giveaway entries
// ============================================================

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Download, CheckCircle, XCircle, Eye, Flag, ChevronDown } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, StatusBadge } from '../components/ui';
import { Entry, FinalStatus } from '../types';
import { exportEntriesCSV } from '../utils/exportUtils';

type FilterType = 'all' | 'eligible' | 'ineligible' | 'pending_follow' | 'pending_repost' | 'duplicate' | 'flagged' | 'excluded' | 'winner' | 'backup';

export default function EntriesPage() {
  const { giveawayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getGiveawayEntries, getEntryMentions, addAuditLog } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const entries = getGiveawayEntries(giveawayId || '');
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  
  const filteredEntries = useMemo(() => {
    let result = entries;
    
    // Apply search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.entrant_username.toLowerCase().includes(q) ||
        e.admin_notes.toLowerCase().includes(q)
      );
    }
    
    // Apply filter
    switch (filter) {
      case 'eligible': result = result.filter(e => e.final_status === 'eligible'); break;
      case 'ineligible': result = result.filter(e => e.final_status === 'ineligible'); break;
      case 'pending_follow': result = result.filter(e => e.follow_verification_status === 'pending' || e.follow_verification_status === 'partially_verified'); break;
      case 'pending_repost': result = result.filter(e => e.repost_verification_status === 'pending'); break;
      case 'duplicate': result = result.filter(e => e.duplicate_status !== 'unique'); break;
      case 'flagged': result = result.filter(e => e.risk_flags.length > 0); break;
      case 'excluded': result = result.filter(e => e.final_status === 'excluded'); break;
      case 'winner': result = result.filter(e => e.final_status === 'winner'); break;
      case 'backup': result = result.filter(e => e.final_status === 'backup'); break;
    }
    
    return result;
  }, [entries, search, filter]);
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const selectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map(e => e.id));
    }
  };
  
  const handleBulkAction = (action: string) => {
    const updates: Partial<Entry> = {};
    switch (action) {
      case 'follow_verified': updates.follow_verification_status = 'all_verified'; break;
      case 'follow_failed': updates.follow_verification_status = 'failed'; break;
      case 'repost_verified': updates.repost_verification_status = 'verified'; break;
      case 'repost_rejected': updates.repost_verification_status = 'rejected'; break;
      case 'exclude': updates.final_status = 'excluded'; break;
      case 'include': updates.final_status = 'pending'; break;
    }
    dispatch({ type: 'BULK_UPDATE_ENTRIES', payload: { ids: selectedIds, updates } });
    addAuditLog('bulk_update', 'entries', selectedIds.join(','), '', action, `Bulk ${action} on ${selectedIds.length} entries`);
    setSelectedIds([]);
    setShowBulkActions(false);
  };
  
  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: entries.length },
    { value: 'eligible', label: 'Eligible', count: entries.filter(e => e.final_status === 'eligible').length },
    { value: 'pending_follow', label: 'Pending Follow', count: entries.filter(e => e.follow_verification_status === 'pending' || e.follow_verification_status === 'partially_verified').length },
    { value: 'pending_repost', label: 'Pending Repost', count: entries.filter(e => e.repost_verification_status === 'pending').length },
    { value: 'flagged', label: 'Flagged', count: entries.filter(e => e.risk_flags.length > 0).length },
    { value: 'duplicate', label: 'Duplicates', count: entries.filter(e => e.duplicate_status !== 'unique').length },
    { value: 'ineligible', label: 'Ineligible', count: entries.filter(e => e.final_status === 'ineligible').length },
    { value: 'excluded', label: 'Excluded', count: entries.filter(e => e.final_status === 'excluded').length },
  ];
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Entries</h1>
          <p className="text-sm text-gray-400">{filteredEntries.length} of {entries.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportEntriesCSV(entries, state.mentions)}>
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Search by username..."
            />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </Card>
      
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-3 border-pink-500/20 bg-pink-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-pink-300">{selectedIds.length} entries selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="success" onClick={() => handleBulkAction('follow_verified')}>
                <CheckCircle size={12} className="mr-1" /> Follow ✓
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction('follow_failed')}>
                <XCircle size={12} className="mr-1" /> Follow ✗
              </Button>
              <Button size="sm" variant="success" onClick={() => handleBulkAction('repost_verified')}>
                Repost ✓
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction('exclude')}>
                Exclude
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Entries Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-3 py-3 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase">Comment</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Mentions</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Follow</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Repost</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Flags</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-white">@{entry.entrant_username}</span>
                    <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-3 py-2.5 max-w-[200px]">
                    <p className="text-gray-300 truncate text-xs">{state.comments.find(c => c.id === entry.comment_id)?.comment_text || 'N/A'}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-sm font-medium ${entry.required_mentions_met ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.mention_count}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge status={entry.follow_verification_status} type="follow" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge status={entry.repost_verification_status} type="repost" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <StatusBadge status={entry.final_status} type="final" />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {entry.risk_flags.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-orange-400">
                        <Flag size={12} /> {entry.risk_flags.length}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => navigate(`/giveaways/${giveawayId}/entries/${entry.id}`)}
                      className="text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No entries match your filter</p>
          </div>
        )}
      </Card>
    </div>
  );
}
