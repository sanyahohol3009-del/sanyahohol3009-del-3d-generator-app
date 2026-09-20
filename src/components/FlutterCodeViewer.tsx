import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Network, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { organClient } from '../services/organClient';

type Tab = 'runtime' | 'family' | 'contracts' | 'evidence';

export const FlutterCodeViewer: React.FC = () => {
  const [tab, setTab] = useState<Tab>('runtime');
  const [snapshot, setSnapshot] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const value = await organClient.runtimeSnapshot();
      setSnapshot(value?.runtime || null);
      setError(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(() => {
    if (!snapshot) return null;
    if (tab === 'family') return snapshot.family;
    if (tab === 'contracts') {
      return {
        identity: snapshot.identity,
        capabilities: snapshot.capabilities,
        protocol: snapshot.protocol,
        authority: snapshot.authority,
        voice_policy: snapshot.voice_policy,
      };
    }
    if (tab === 'evidence') return { latest_job: snapshot.latest_job };
    return {
      schema: snapshot.schema,
      pid: snapshot.pid,
      llm: snapshot.llm,
      voice: snapshot.voice,
      latest_job: snapshot.latest_job,
    };
  }, [snapshot, tab]);

  const tabs = [
    { id: 'runtime' as Tab, label: 'RUNTIME', icon: <Activity className="w-3 h-3" /> },
    { id: 'family' as Tab, label: 'FAMILY', icon: <Users className="w-3 h-3" /> },
    { id: 'contracts' as Tab, label: 'CONTRACTS', icon: <Network className="w-3 h-3" /> },
    { id: 'evidence' as Tab, label: 'EVIDENCE', icon: <ShieldCheck className="w-3 h-3" /> },
  ];

  return (
    <div className="flex-1 min-w-0 h-full bg-slate-950 border-l border-cyan-500/30 flex flex-col overflow-hidden">
      <div className="px-3 py-2 bg-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-cyan-300 flex items-center gap-2">
            <Database className="w-4 h-4" /> LIVE MAKSIMAR RUNTIME
          </div>
          <div className="text-[9px] font-mono text-slate-500">canonical config + current local execution evidence</div>
        </div>
        <button type="button" onClick={() => void refresh()} className="p-1.5 border border-cyan-500/30 text-cyan-300" title="Refresh runtime">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-1 px-2 py-1.5 border-b border-cyan-500/20 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-2 py-1 text-[9px] font-mono flex items-center gap-1 border ${tab === item.id ? 'bg-cyan-500 text-black border-cyan-300 font-bold' : 'bg-slate-950 text-cyan-300 border-cyan-500/20'}`}
          >
            {item.icon}{item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {error ? (
          <div className="text-red-300 text-xs font-mono border border-red-500/30 p-3">{error}</div>
        ) : (
          <pre className="text-[10px] sm:text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap break-words">{JSON.stringify(visible, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};
