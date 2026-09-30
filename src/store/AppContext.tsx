// ============================================================
// APP STORE - Central state management
// ============================================================

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, AdminUser, Giveaway, Comment, Entry, Mention, RepostProof, Winner, BackupWinner, AuditLog, DrawResult, FinalStatus, FollowStatus, RepostStatus, MentionFollowStatus, GiveawayStatus } from '../types';
import { generateSeedData } from '../utils/seedData';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'LOGIN'; payload: AdminUser }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_SEED_DATA' }
  | { type: 'ADD_GIVEAWAY'; payload: Giveaway }
  | { type: 'UPDATE_GIVEAWAY'; payload: { id: string; updates: Partial<Giveaway> } }
  | { type: 'ADD_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_ENTRIES'; payload: Entry[] }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; updates: Partial<Entry> } }
  | { type: 'BULK_UPDATE_ENTRIES'; payload: { ids: string[]; updates: Partial<Entry> } }
  | { type: 'UPDATE_MENTION'; payload: { id: string; updates: Partial<Mention> } }
  | { type: 'ADD_REPOST_PROOF'; payload: RepostProof }
  | { type: 'UPDATE_REPOST_PROOF'; payload: { id: string; updates: Partial<RepostProof> } }
  | { type: 'SET_WINNERS'; payload: { winners: Winner[]; backups: BackupWinner[]; drawResult: DrawResult } }
  | { type: 'UPDATE_WINNER'; payload: { id: string; updates: Partial<Winner> } }
  | { type: 'UPDATE_BACKUP'; payload: { id: string; updates: Partial<BackupWinner> } }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'OVERRIDE_ENTRY'; payload: { entryId: string; reason: string; adminId: string; adminName: string } };

const initialState: AppState = {
  currentUser: null,
  giveaways: [],
  comments: [],
  entries: [],
  mentions: [],
  repostProofs: [],
  winners: [],
  backupWinners: [],
  auditLogs: [],
  drawResult: null,
  isAuthenticated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    
    case 'LOAD_SEED_DATA': {
      const seed = generateSeedData();
      return {
        ...state,
        currentUser: seed.admin,
        giveaways: [seed.giveaway],
        comments: seed.comments,
        entries: seed.entries,
        mentions: seed.mentions,
        auditLogs: seed.auditLogs,
        isAuthenticated: true,
      };
    }
    
    case 'ADD_GIVEAWAY':
      return { ...state, giveaways: [...state.giveaways, action.payload] };
    
    case 'UPDATE_GIVEAWAY':
      return {
        ...state,
        giveaways: state.giveaways.map(g =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates, updated_at: new Date().toISOString() } : g
        ),
      };
    
    case 'ADD_COMMENTS':
      return { ...state, comments: [...state.comments, ...action.payload] };
    
    case 'ADD_ENTRIES':
      return { ...state, entries: [...state.entries, ...action.payload] };
    
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates, updated_at: new Date().toISOString() } : e
        ),
      };
    
    case 'BULK_UPDATE_ENTRIES':
      return {
        ...state,
        entries: state.entries.map(e =>
          action.payload.ids.includes(e.id)
            ? { ...e, ...action.payload.updates, updated_at: new Date().toISOString() }
            : e
        ),
      };
    
    case 'UPDATE_MENTION':
      return {
        ...state,
        mentions: state.mentions.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };
    
    case 'ADD_REPOST_PROOF':
      return { ...state, repostProofs: [...state.repostProofs, action.payload] };
    
    case 'UPDATE_REPOST_PROOF':
      return {
        ...state,
        repostProofs: state.repostProofs.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
    
    case 'SET_WINNERS':
      return {
        ...state,
        winners: action.payload.winners,
        backupWinners: action.payload.backups,
        drawResult: action.payload.drawResult,
      };
    
    case 'UPDATE_WINNER':
      return {
        ...state,
        winners: state.winners.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload.updates } : w
        ),
      };
    
    case 'UPDATE_BACKUP':
      return {
        ...state,
        backupWinners: state.backupWinners.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
        ),
      };
    
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs] };
    
    case 'OVERRIDE_ENTRY': {
      const entry = state.entries.find(e => e.id === action.payload.entryId);
      if (!entry) return state;
      return {
        ...state,
        entries: state.entries.map(e =>
          e.id === action.payload.entryId
            ? { ...e, final_status: 'eligible' as FinalStatus, admin_notes: `Override: ${action.payload.reason}`, updated_at: new Date().toISOString() }
            : e
        ),
      };
    }
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addAuditLog: (action: string, entityType: string, entityId: string, oldValue: string, newValue: string, reason: string) => void;
  getGiveawayEntries: (giveawayId: string) => Entry[];
  getEntryMentions: (entryId: string) => Mention[];
  getEntryProofs: (entryId: string) => RepostProof[];
  getGiveawayComments: (giveawayId: string) => Comment[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const addAuditLog = useCallback((action: string, entityType: string, entityId: string, oldValue: string, newValue: string, reason: string) => {
    const log: AuditLog = {
      id: uuidv4(),
      giveaway_id: state.giveaways[0]?.id || '',
      admin_user_id: state.currentUser?.id || '',
      admin_name: state.currentUser?.name || 'System',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      reason,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log });
  }, [state.giveaways, state.currentUser]);
  
  const getGiveawayEntries = useCallback((giveawayId: string) => {
    return state.entries.filter(e => e.giveaway_id === giveawayId);
  }, [state.entries]);
  
  const getEntryMentions = useCallback((entryId: string) => {
    return state.mentions.filter(m => m.entry_id === entryId);
  }, [state.mentions]);
  
  const getEntryProofs = useCallback((entryId: string) => {
    return state.repostProofs.filter(p => p.entry_id === entryId);
  }, [state.repostProofs]);
  
  const getGiveawayComments = useCallback((giveawayId: string) => {
    return state.comments.filter(c => c.giveaway_id === giveawayId);
  }, [state.comments]);
  
  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      addAuditLog,
      getGiveawayEntries,
      getEntryMentions,
      getEntryProofs,
      getGiveawayComments,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
