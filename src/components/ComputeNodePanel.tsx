import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Save,
} from 'lucide-react';
import { organClient } from '../services/organClient';

export const ComputeNodePanel: React.FC = () => {
  const initial = organClient.settings();
  const [endpoint, setEndpoint] = useState(initial.endpoint);
  const [token, setToken] = useState(initial.token);
  const [status, setStatus] =
    useState<'idle' | 'checking' | 'ready' | 'error'>('idle');
  const [detail, setDetail] = useState('Not checked');

  const test = async () => {
    setStatus('checking');
    try {
      const [health, ready, llm, voice] = await Promise.all([
        organClient.health(),
        organClient.readiness(),
        organClient.llmHealth(),
        organClient.voiceStatus(),
      ]);

      setStatus(health?.ok && ready?.ok ? 'ready' : 'error');

      const providers = Object.entries(ready?.providers || {})
        .map(([name, value]: any) => `${name}:${value?.ready ? 'OK' : 'OFF'}`)
        .join('  ');

      const llmState = llm?.llm?.ok ? 'LLM:OK' : 'LLM:OFF';
      const voiceState = voice?.voice?.ok
        ? `VOICE:${voice.voice.backend}`
        : 'VOICE:OFF';

      setDetail(`${providers}  ${llmState}  ${voiceState}`.trim());
    } catch (e: any) {
      setStatus('error');
      setDetail(e?.message || String(e));
    }
  };

  const save = async () => {
    organClient.saveSettings({ endpoint, token });
    await test();
  };

  useEffect(() => {
    void test();
  }, []);

  return (
    <div className="p-3 bg-slate-900/90 border border-cyan-500/30 clip-faceted-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>3D/CAD COMPUTE NODE</span>
        </div>
        <div
          className={`text-[9px] font-mono flex items-center gap-1 ${
            status === 'ready'
              ? 'text-emerald-400'
              : status === 'error'
              ? 'text-red-400'
              : 'text-amber-400'
          }`}
        >
          {status === 'ready'
            ? <CheckCircle2 className="w-3 h-3" />
            : <AlertTriangle className="w-3 h-3" />}
          {status.toUpperCase()}
        </div>
      </div>

      <input
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        className="w-full bg-black border border-cyan-500/30 px-2 py-1.5 text-[10px] font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
        placeholder="http://127.0.0.1:8765"
      />

      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        type="password"
        className="w-full bg-black border border-cyan-500/30 px-2 py-1.5 text-[10px] font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
        placeholder="Local Organ token"
      />

      <div className="text-[9px] font-mono text-slate-400 break-all">
        {detail}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={() => void save()}
          className="py-1.5 bg-cyan-950 border border-cyan-400 text-cyan-200 text-[10px] font-mono flex items-center justify-center gap-1"
        >
          <Save className="w-3 h-3" />
          SAVE + TEST
        </button>
        <button
          onClick={() => void test()}
          className="py-1.5 bg-slate-950 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          REFRESH
        </button>
      </div>
    </div>
  );
};
