import React from 'react';
import { 
  Database, 
  Layers, 
  Check, 
  Cpu, 
  Sparkles, 
  Scan, 
  Activity,
  Box
} from 'lucide-react';
import { SynthesisProgressData, SynthesisStage } from '../types';

interface SynthesisProgressBarProps {
  progressData: SynthesisProgressData;
  promptSnippet?: string;
  className?: string;
  showDetails?: boolean;
}

export const SynthesisProgressBar: React.FC<SynthesisProgressBarProps> = ({
  progressData,
  promptSnippet,
  className = '',
  showDetails = true,
}) => {
  const { 
    stage, 
    progress, 
    statusText, 
    subDetail, 
    tflops = 128, 
    polygons = 18940, 
    vertices = 9840 
  } = progressData;

  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const isIngestion = clampedProgress < 50;
  const isSynthesis = clampedProgress >= 50 && clampedProgress < 100;
  const isComplete = clampedProgress >= 100;

  // Ingestion sub-progress (0 to 100% of stage 1)
  const ingestionPercent = Math.min(100, Math.round((Math.min(50, clampedProgress) / 50) * 100));
  // Synthesis sub-progress (0 to 100% of stage 2)
  const synthesisPercent = clampedProgress <= 50 ? 0 : Math.min(100, Math.round(((clampedProgress - 50) / 50) * 100));

  return (
    <div 
      id="synthesis-progress-container"
      className={`w-full bg-slate-950/95 border border-cyan-500/50 clip-faceted-sm p-3 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-2.5 transition-all duration-300 select-none ${className}`}
    >
      {/* 1. Header: Stage indicator & Live Numeric Percent */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            {isComplete ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-400/80 flex items-center justify-center text-cyan-300">
                <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                {isComplete ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 inline" /> 3D SPATIAL SYNTHESIS COMPLETE
                  </span>
                ) : isIngestion ? (
                  'STAGE 1/2 // INGESTION & PARSING'
                ) : (
                  'STAGE 2/2 // NEURAL MESH SYNTHESIS'
                )}
              </span>
            </div>
            {promptSnippet && (
              <p className="text-[9.5px] font-mono text-slate-400 truncate max-w-[210px] sm:max-w-[280px]">
                Target: &quot;{promptSnippet}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Real-time Percentage Badge */}
        <div className="flex items-center gap-1.5 font-mono">
          <span 
            className={`text-xs sm:text-sm font-bold px-2 py-0.5 border clip-faceted-sm tabular-nums transition-colors duration-300 ${
              isComplete
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-black border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
            }`}
          >
            {clampedProgress}%
          </span>
        </div>
      </div>

      {/* 2. Dual-Stage Visual Stepper */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        {/* Stage 1: Ingestion */}
        <div 
          className={`p-1.5 border transition-all duration-300 flex items-center justify-between clip-faceted-sm ${
            isComplete || !isIngestion
              ? 'bg-slate-900/80 border-cyan-500/30 text-cyan-300'
              : 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Scan className={`w-3 h-3 ${isIngestion ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="font-semibold">1. INGESTION</span>
          </div>
          {isComplete || !isIngestion ? (
            <span className="text-emerald-400 text-[9px] flex items-center gap-0.5 font-bold">
              <Check className="w-2.5 h-2.5" /> DONE
            </span>
          ) : (
            <span className="text-cyan-300 text-[9px] font-bold animate-pulse">
              {ingestionPercent}%
            </span>
          )}
        </div>

        {/* Stage 2: Mesh Synthesis */}
        <div 
          className={`p-1.5 border transition-all duration-300 flex items-center justify-between clip-faceted-sm ${
            isComplete
              ? 'bg-emerald-950/40 border-emerald-400/80 text-emerald-300'
              : isSynthesis
              ? 'bg-teal-950/50 border-teal-400 text-white shadow-[0_0_12px_rgba(45,212,191,0.2)]'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Box className={`w-3 h-3 ${isSynthesis ? 'text-teal-400 animate-pulse' : isComplete ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span className="font-semibold">2. MESH SYNTHESIS</span>
          </div>
          {isComplete ? (
            <span className="text-emerald-400 text-[9px] flex items-center gap-0.5 font-bold">
              <Check className="w-2.5 h-2.5" /> DONE
            </span>
          ) : isSynthesis ? (
            <span className="text-emerald-300 text-[9px] font-bold animate-pulse">
              {synthesisPercent}%
            </span>
          ) : (
            <span className="text-slate-600 text-[9px]">PENDING</span>
          )}
        </div>
      </div>

      {/* 3. The Real-time Progress Bar: Subtle Cyan-to-Emerald Gradient */}
      <div className="space-y-1">
        <div 
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative w-full h-2.5 sm:h-3 bg-slate-900 border border-cyan-500/40 clip-faceted-sm overflow-hidden p-0.5"
        >
          {/* Subtle midpoint divider (50% stage marker) */}
          <div 
            className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-400/40 z-10 pointer-events-none"
            title="Stage transition boundary (50%)"
          />

          {/* Glowing Fill Bar with Subtle Cyan-to-Emerald Gradient */}
          <div
            className="h-full rounded-none transition-[width] duration-150 ease-out bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 relative shadow-[0_0_12px_rgba(0,240,255,0.6)]"
            style={{ width: `${clampedProgress}%` }}
          >
            {/* Shimmer sweep line animation */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] opacity-60 animate-pulse" />
            
            {/* Bright leading tip */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/90 shadow-[0_0_6px_#fff]" />
          </div>
        </div>

        {/* Progress Bar Scale Marks */}
        <div className="flex justify-between text-[8px] font-mono text-slate-500 px-0.5">
          <span>0%</span>
          <span className="text-cyan-400/80">50% // STAGE 2</span>
          <span>100%</span>
        </div>
      </div>

      {/* 4. Real-time Status Text & Micro-Telemetry */}
      {showDetails && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-300 flex items-center gap-1 truncate max-w-[260px] sm:max-w-[320px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="text-cyan-200">{statusText}</span>
            </span>
            <span className="text-slate-500 text-[9px] shrink-0 font-bold">
              {isComplete ? 'READY' : 'ACTIVE'}
            </span>
          </div>

          {subDetail && (
            <p className="text-[9px] font-mono text-slate-400 bg-black/40 px-2 py-1 border border-cyan-500/10 clip-faceted-sm">
              {subDetail}
            </p>
          )}

          {/* Hardware & Topology Telemetry Chips */}
          <div className="grid grid-cols-3 gap-1 pt-0.5 text-[8.5px] font-mono text-slate-400">
            <div className="bg-slate-900/80 px-1.5 py-0.5 border border-cyan-500/20 text-center">
              <span className="text-slate-500 block text-[7.5px]">THROUGHPUT</span>
              <span className="text-cyan-300 font-bold">{tflops} TFLOPS</span>
            </div>
            <div className="bg-slate-900/80 px-1.5 py-0.5 border border-cyan-500/20 text-center">
              <span className="text-slate-500 block text-[7.5px]">VERTICES</span>
              <span className="text-cyan-300 font-bold">{vertices.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/80 px-1.5 py-0.5 border border-cyan-500/20 text-center">
              <span className="text-slate-500 block text-[7.5px]">POLYGONS</span>
              <span className="text-emerald-300 font-bold">{polygons.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
