// ============================================================
// AUDIT LOG PAGE - Immutable audit trail
// ============================================================

import React from 'react';
import { useParams } from 'react-router-dom';
import { ScrollText, Download, Shield } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button } from '../components/ui';
import { exportAuditLogCSV } from '../utils/exportUtils';

export default function AuditLogPage() {
  const { giveawayId } = useParams();
  const { state } = useApp();
  
  const logs = state.auditLogs.filter(l => l.giveaway_id === giveawayId);
  
  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-emerald-400 bg-emerald-500/10';
    if (action.includes('verified') || action.includes('promoted')) return 'text-blue-400 bg-blue-500/10';
    if (action.includes('draw') || action.includes('selected')) return 'text-pink-400 bg-pink-500/10';
    if (action.includes('changed') || action.includes('updated')) return 'text-amber-400 bg-amber-500/10';
    if (action.includes('override') || action.includes('excluded')) return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-gray-400">Immutable record of all actions</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => exportAuditLogCSV(logs)}>
          <Download size={14} className="mr-1.5" /> Export CSV
        </Button>
      </div>
      
      {/* Integrity Notice */}
      <Card className="p-3 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-2">
          <Shield className="text-emerald-400" size={16} />
          <p className="text-xs text-emerald-300">
            This audit log is immutable. All admin actions are recorded for transparency and compliance.
          </p>
        </div>
      </Card>
      
      {/* Log Entries */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-800/50">
          {logs.map(log => (
            <div key={log.id} className="p-3 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.action.includes('created') ? 'bg-emerald-400' :
                  log.action.includes('draw') ? 'bg-pink-400' :
                  log.action.includes('override') ? 'bg-red-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{log.entity_type}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{log.reason}</p>
                  {(log.old_value || log.new_value) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {log.old_value && <span className="text-red-400/70">{log.old_value}</span>}
                      {log.old_value && log.new_value && <span className="text-gray-600"> → </span>}
                      {log.new_value && <span className="text-emerald-400/70">{log.new_value}</span>}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{log.admin_name}</p>
                  <p className="text-xs text-gray-600">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {logs.length === 0 && (
          <div className="py-12 text-center">
            <ScrollText className="mx-auto text-gray-600 mb-3" size={32} />
            <p className="text-gray-500">No audit logs yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
