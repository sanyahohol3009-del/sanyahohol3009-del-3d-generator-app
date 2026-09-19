import React from 'react';
import { Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { SynthesisProgressData } from '../types';

interface SynthesisProgressBarProps {
  progressData: SynthesisProgressData;
  promptSnippet?: string;
  className?: string;
  showDetails?: boolean;
}

const stageLabel = (stage: string, progress: number) => {
  if (progress >= 100 || stage === 'complete') return 'VERIFIED RESULT';
  if (stage === 'ingestion') return 'INTERPRET / GROUND';
  if (stage === 'voxelization') return 'PLAN / ROUTE';
  if (stage === 'marching_cubes') return 'REAL PROVIDER EXECUTION';
  if (stage === 'baking') return 'VERIFY REAL EFFECT';
  if (stage === 'compression') return 'PACKAGE ARTIFACT';
  return String(stage || 'running').replace(/_/g, ' ').toUpperCase();
};

export const SynthesisProgressBar: React.FC<SynthesisProgressBarProps> = ({
  progressData,
  promptSnippet,
  className = '',
  showDetails = true,
}) => {
  const progress = Math.min(100, Math.max(0, Math.round(progressData.progress || 0)));
  const complete = progress >= 100 || progressData.stage === 'complete';

  return (
    <div className={`w-full bg-slate-950/95 border border-cyan-500/50 p-3 font-mono space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {complete ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Activity className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />}
          <div className="min-w-0">
            <div className={`text-[11px] font-bold ${complete ? 'text-emerald-300' : 'text-cyan-300'}`}>
              {stageLabel(String(progressData.stage), progress)}
            </div>
            {promptSnippet && <div className="text-[9px] text-slate-500 truncate">REQUEST: {promptSnippet}</div>}
          </div>
        </div>
        <span className={`text-xs font-bold ${complete ? 'text-emerald-300' : 'text-cyan-300'}`}>{progress}%</span>
      </div>

      <div className="h-2 bg-slate-900 border border-cyan-500/30 overflow-hidden">
        <div className="h-full bg-cyan-400 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {showDetails && (
        <div className="space-y-1 text-[9px]">
          <div className="text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>{progressData.statusText || 'Waiting for canonical runtime state...'}</span>
          </div>
          {progressData.subDetail && <div className="text-slate-500">{progressData.subDetail}</div>}
        </div>
      )}
    </div>
  );
};
