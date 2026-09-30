// ============================================================
// GIVEAWAYS PAGE - List and create giveaways
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Gift, Calendar, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, Modal } from '../components/ui';
import { GiveawayStatus } from '../types';

export default function GiveawaysPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  
  const getStatusColor = (status: GiveawayStatus) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-500/20';
      case 'importing': return 'text-blue-400 bg-blue-500/20';
      case 'reviewing': return 'text-amber-400 bg-amber-500/20';
      case 'ready_for_draw': return 'text-violet-400 bg-violet-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/20';
      case 'archived': return 'text-gray-500 bg-gray-600/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Giveaways</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your Instagram giveaways</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} className="mr-1.5" /> New Giveaway
        </Button>
      </div>
      
      {/* Giveaway List */}
      <div className="space-y-3">
        {state.giveaways.map(gw => {
          const entryCount = state.entries.filter(e => e.giveaway_id === gw.id).length;
          const eligibleCount = state.entries.filter(e => e.giveaway_id === gw.id && e.final_status === 'eligible').length;
          
          return (
            <Card key={gw.id} className="p-4 hover:border-gray-600 transition-all cursor-pointer group" >
              <div onClick={() => navigate(`/giveaways/${gw.id}/entries`)} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-600/20 border border-pink-500/20 flex items-center justify-center">
                  <Gift className="text-pink-400" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-pink-300 transition-colors">{gw.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(gw.status)}`}>
                      {gw.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users size={12} /> {entryCount} entries
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(gw.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-emerald-400">{eligibleCount} eligible</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-gray-400 transition-colors" size={20} />
              </div>
            </Card>
          );
        })}
      </div>
      
      {state.giveaways.length === 0 && (
        <Card className="p-12 text-center">
          <Gift className="mx-auto text-gray-600 mb-3" size={40} />
          <h3 className="text-lg font-medium text-gray-300">No giveaways yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first giveaway to get started</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1.5" /> Create Giveaway
          </Button>
        </Card>
      )}
      
      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Giveaway">
        <CreateGiveawayForm onClose={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}

function CreateGiveawayForm({ onClose }: { onClose: () => void }) {
  const { dispatch, addAuditLog } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [target1, setTarget1] = useState('@nihawi_puan');
  const [target2, setTarget2] = useState('@jaui_official');
  const [postUrl, setPostUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const id = `gw-${Date.now()}`;
    const giveaway = {
      id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      instagram_post_url: postUrl,
      instagram_media_id: '',
      target_account_1: target1,
      target_account_2: target2,
      min_required_mentions: 3,
      strict_mention_mode: false,
      allow_multiple_entries_per_user: false,
      entry_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      repost_proof_deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft' as GiveawayStatus,
      draw_seed: '',
      draw_nonce: '',
      created_by: 'admin-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      prizes: [
        { id: `p-${Date.now()}-1`, giveaway_id: id, rank: 1, name: '1st Prize', description: '', display_order: 1 },
        { id: `p-${Date.now()}-2`, giveaway_id: id, rank: 2, name: '2nd Prize', description: '', display_order: 2 },
        { id: `p-${Date.now()}-3`, giveaway_id: id, rank: 3, name: '3rd Prize', description: '', display_order: 3 },
        { id: `p-${Date.now()}-4`, giveaway_id: id, rank: 4, name: 'Consolation Prize 1', description: '', display_order: 4 },
        { id: `p-${Date.now()}-5`, giveaway_id: id, rank: 5, name: 'Consolation Prize 2', description: '', display_order: 5 },
      ],
    };
    
    dispatch({ type: 'ADD_GIVEAWAY', payload: giveaway });
    addAuditLog('giveaway_created', 'giveaway', id, '', name, 'New giveaway created');
    onClose();
    navigate(`/giveaways/${id}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Giveaway Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          placeholder="Mega Giveaway 2024"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Account 1</label>
          <input
            type="text"
            value={target1}
            onChange={e => setTarget1(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Account 2</label>
          <input
            type="text"
            value={target2}
            onChange={e => setTarget2(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Instagram Post/Reel URL</label>
        <input
          type="url"
          value={postUrl}
          onChange={e => setPostUrl(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          placeholder="https://www.instagram.com/reel/..."
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit">Create</Button>
      </div>
    </form>
  );
}
