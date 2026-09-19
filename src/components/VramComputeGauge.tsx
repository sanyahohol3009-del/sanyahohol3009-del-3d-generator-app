import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Activity, Zap, HardDrive, Thermometer, Gauge, ChevronDown, RefreshCw, Check } from 'lucide-react';

export type SynthesisStageType =
  | 'idle'
  | 'ingestion'
  | 'voxelization'
  | 'marching_cubes'
  | 'baking'
  | 'compression'
  | 'complete';

interface VramComputeGaugeProps {
  isSynthesizing: boolean;
  synthesisProgress?: number; // 0 - 100
  synthesisStage?: SynthesisStageType;
  compact?: boolean;
}

export const VramComputeGauge: React.FC<VramComputeGaugeProps> = ({
  isSynthesizing,
  synthesisProgress = 0,
  synthesisStage = 'idle',
  compact = false,
}) => {
  // Target values based on stage
  const [computeLoad, setComputeLoad] = useState<number>(14);
  const [vramGb, setVramGb] = useState<number>(2.3);
  const [gpuTemp, setGpuTemp] = useState<number>(43);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [flushedVram, setFlushedVram] = useState<boolean>(false);

  // High frequency micro-fluctuations
  const jitterTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Determine baseline targets from stage
    let targetCompute = 14;
    let targetVram = 2.3;
    let targetTemp = 43;

    if (isSynthesizing) {
      if (synthesisProgress < 20 || synthesisStage === 'ingestion') {
        targetCompute = 52;
        targetVram = 6.2;
        targetTemp = 54;
      } else if (synthesisProgress < 36) {
        targetCompute = 68;
        targetVram = 8.4;
        targetTemp = 59;
      } else if (synthesisProgress < 50 || synthesisStage === 'voxelization') {
        targetCompute = 82;
        targetVram = 11.2;
        targetTemp = 66;
      } else if (synthesisProgress < 68 || synthesisStage === 'marching_cubes') {
        targetCompute = 94; // Peak marching cubes load
        targetVram = 13.8;
        targetTemp = 74;
      } else if (synthesisProgress < 85 || synthesisStage === 'baking') {
        targetCompute = 98; // Peak 4K PBR shader baking
        targetVram = 15.2;
        targetTemp = 78;
      } else if (synthesisProgress < 100 || synthesisStage === 'compression') {
        targetCompute = 68;
        targetVram = 10.4;
        targetTemp = 68;
      } else {
        targetCompute = 35;
        targetVram = 4.2;
        targetTemp = 50;
      }
    }

    if (jitterTimerRef.current) {
      clearInterval(jitterTimerRef.current);
    }

    // Interval to create lively, realistic cyberpunk fluctuations
    jitterTimerRef.current = setInterval(() => {
      setComputeLoad(() => {
        // Micro fluctuation between -2.2% and +2.5%
        const jitter = (Math.random() - 0.48) * 4.5;
        const next = Math.max(8, Math.min(99.4, targetCompute + jitter));
        return parseFloat(next.toFixed(1));
      });

      setVramGb(() => {
        // Micro fluctuation between -0.15 GB and +0.18 GB
        const jitter = (Math.random() - 0.48) * 0.35;
        const next = Math.max(1.8, Math.min(15.8, targetVram + jitter));
        return parseFloat(next.toFixed(2));
      });

      setGpuTemp(() => {
        const jitter = (Math.random() - 0.5) * 1.5;
        return Math.round(targetTemp + jitter);
      });
    }, 280);

    return () => {
      if (jitterTimerRef.current) {
        clearInterval(jitterTimerRef.current);
      }
    };
  }, [isSynthesizing, synthesisProgress, synthesisStage]);

  // Color dynamics based on compute load
  const isHighLoad = computeLoad >= 85;
  const isMedLoad = computeLoad >= 65 && computeLoad < 85;

  const loadColor = isHighLoad
    ? 'text-red-400'
    : isMedLoad
    ? 'text-amber-400'
    : 'text-cyan-300';

  const vramPercent = Math.min(100, (vramGb / 16.0) * 100);

  // 8 Segmented bar units
  const totalSegments = 8;
  const activeSegments = Math.round((computeLoad / 100) * totalSegments);

  const handleFlushVram = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlushedVram(true);
    setVramGb(2.1);
    setComputeLoad(12);
    setTimeout(() => {
      setFlushedVram(false);
    }, 1800);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Interactive Trigger Button / Gauge Display */}
      <button
        type="button"
        id="vram-compute-gauge-btn"
        onClick={() => setShowTelemetryModal((prev) => !prev)}
        className={`flex items-center gap-2 px-2 py-0.5 rounded-xs transition-all cursor-pointer font-mono text-[9.5px] border select-none ${
          isHighLoad
            ? 'bg-red-950/40 border-red-500/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
            : isMedLoad
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            : 'bg-slate-950/90 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
        }`}
        title="Click to inspect real-time VRAM & Compute GPU diagnostic telemetry"
      >
        {/* VRAM Metric */}
        <div className="flex items-center gap-1">
          <HardDrive className="w-2.5 h-2.5 text-slate-400" />
          <span className="text-slate-400 text-[8.5px]">VRAM</span>
          <span className={`font-bold ${isHighLoad ? 'text-red-400' : 'text-slate-200'}`}>
            {vramGb.toFixed(1)}
            <span className="text-[8px] text-slate-400 font-normal">/16G</span>
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-2.5 w-[1px] bg-cyan-500/20" />

        {/* Compute Load Metric + 8 Segment Meter */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {isHighLoad ? (
              <Zap className="w-2.5 h-2.5 text-red-400 animate-pulse" />
            ) : (
              <Activity className="w-2.5 h-2.5 text-cyan-400" />
            )}
            <span className="text-slate-400 text-[8.5px]">LOAD</span>
            <span className={`font-bold w-[28px] text-right ${loadColor}`}>
              {Math.round(computeLoad)}%
            </span>
          </div>

          {/* Segmented Cyberpunk Bar Meter */}
          <div className="hidden sm:flex items-center gap-0.5 bg-black/60 p-0.5 border border-cyan-500/25 rounded-xs">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isActive = idx < activeSegments;
              let segColor = 'bg-slate-800';
              if (isActive) {
                if (idx >= 6) {
                  segColor = 'bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse';
                } else if (idx >= 4) {
                  segColor = 'bg-amber-400 shadow-[0_0_4px_#f59e0b]';
                } else {
                  segColor = 'bg-cyan-400 shadow-[0_0_4px_#00f0ff]';
                }
              }
              return (
                <div
                  key={idx}
                  className={`w-1 h-2 rounded-[1px] transition-colors duration-150 ${segColor}`}
                />
              );
            })}
          </div>
        </div>

        {/* Live Pulse Dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isHighLoad
              ? 'bg-red-400 animate-ping'
              : isMedLoad
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400 animate-pulse'
          }`}
        />
      </button>

      {/* Cyberpunk Diagnostic Telemetry Modal / Popover */}
      {showTelemetryModal && (
        <div
          id="vram-telemetry-modal"
          className="absolute top-full right-0 mt-1.5 w-72 sm:w-80 p-3 bg-slate-950/95 backdrop-blur-md border border-cyan-500/60 rounded-xs shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(0,240,255,0.25)] z-50 animate-fadeIn text-[10px] font-mono text-slate-200 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>GPU // VRAM DIAGNOSTIC MATRIX</span>
            </div>
            <button
              onClick={() => setShowTelemetryModal(false)}
              className="text-slate-400 hover:text-cyan-300 px-1 py-0.2 bg-slate-900 border border-cyan-500/20 rounded-xs cursor-pointer text-[9px]"
            >
              ESC ✕
            </button>
          </div>

          {/* Active Synthesis Status */}
          <div className="mb-2 p-1.5 bg-black/80 border border-cyan-500/25 rounded-xs flex items-center justify-between">
            <span className="text-slate-400 text-[9px]">ENGINE STATUS:</span>
            <span
              className={`font-bold text-[9.5px] ${
                isSynthesizing ? 'text-cyan-300 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {isSynthesizing
                ? `ACTIVE // ${synthesisStage.toUpperCase()} (${synthesisProgress}%)`
                : 'IDLE // READY FOR 3D SYNTHESIS'}
            </span>
          </div>

          {/* VRAM Progress Bar & Details */}
          <div className="space-y-1 mb-2.5">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Unified VRAM Usage</span>
              <span className="text-cyan-300 font-bold">
                {vramGb.toFixed(2)} GB / 16.00 GB ({vramPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-black border border-cyan-500/30 rounded-xs overflow-hidden p-0.2">
              <div
                className={`h-full transition-all duration-300 ${
                  isHighLoad
                    ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500'
                    : isMedLoad
                    ? 'bg-gradient-to-r from-cyan-500 to-amber-400'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${vramPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-slate-500">
              <span>0 GB</span>
              <span>8 GB</span>
              <span>16 GB (Unified GDDR6X)</span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-1.5 mb-2.5 text-[9px]">
            <div className="p-1.5 bg-black/60 border border-cyan-500/20 rounded-xs space-y-0.5">
              <div className="text-slate-400 flex items-center gap-1">
                <Gauge className="w-2.5 h-2.5 text-cyan-400" />
                <span>Compute Occupancy</span>
              </div>
              <div className={`text-xs font-bold ${loadColor}`}>
                {computeLoad.toFixed(1)}%
              </div>
              <div className="text-[8px] text-slate-500">
                {isHighLoad ? 'Peak Tensor Throughput' : 'Nominal Workload'}
              </div>
            </div>

            <div className="p-1.5 bg-black/60 border border-cyan-500/20 rounded-xs space-y-0.5">
              <div className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-2.5 h-2.5 text-amber-400" />
                <span>GPU Thermal Core</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                {gpuTemp}°C
              </div>
              <div className="text-[8px] text-slate-500">
                Fan: {Math.round(2200 + (computeLoad / 100) * 2600)} RPM
              </div>
            </div>
          </div>

          {/* Allocation Breakdown */}
          <div className="p-1.5 bg-black/80 border border-cyan-500/20 rounded-xs space-y-1 mb-2.5 text-[8.5px]">
            <div className="text-slate-400 font-bold border-b border-cyan-500/10 pb-0.5 flex justify-between">
              <span>BUFFER ALLOCATION</span>
              <span>BYTES</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">• Geometry & Vertex Buffer:</span>
              <span className="text-cyan-300 font-mono">{isSynthesizing ? '4.82 GB' : '0.62 GB'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">• 4K PBR Texture Cache:</span>
              <span className="text-cyan-300 font-mono">{isSynthesizing ? '6.15 GB' : '0.94 GB'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">• 512³ Voxel Grid Tensor:</span>
              <span className="text-cyan-300 font-mono">{isSynthesizing ? '3.42 GB' : '0.45 GB'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">• Draco L7 Compression Stream:</span>
              <span className="text-cyan-300 font-mono">{isSynthesizing ? '0.81 GB' : '0.29 GB'}</span>
            </div>
          </div>

          {/* Interactive Flush VRAM Button */}
          <button
            type="button"
            onClick={handleFlushVram}
            disabled={flushedVram || isSynthesizing}
            className={`w-full py-1 px-2 flex items-center justify-center gap-1.5 text-[9px] font-bold clip-faceted-sm border transition-all cursor-pointer ${
              flushedVram
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 hover:bg-cyan-950/80 border-cyan-500/40 hover:border-cyan-300 text-cyan-300 hover:text-white'
            } disabled:opacity-40`}
          >
            {flushedVram ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>VRAM CACHE PURGED (13.9 GB FREED)</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                <span>PURGE INTERMEDIATE VRAM CACHE</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
