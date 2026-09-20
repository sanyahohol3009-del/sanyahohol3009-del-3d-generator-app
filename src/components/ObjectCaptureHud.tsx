import React, { useState } from 'react';
import { ObjectCaptureStage, CaptureSector } from '../types/vision';
import { useI18n } from '../i18n';
import {
  Orbit,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface ObjectCaptureHudProps {
  onCaptureAngleSnapshot?: () => void;
  onFinishReconstructionSequence?: (sectorsCompleted: number) => void;
}

export const ObjectCaptureHud: React.FC<ObjectCaptureHudProps> = ({
  onCaptureAngleSnapshot,
  onFinishReconstructionSequence,
}) => {
  const { t } = useI18n();

  const [stage, setStage] = useState<ObjectCaptureStage>('setup');
  const [currentSectorIndex, setCurrentSectorIndex] = useState<number>(0);
  const [sectors, setSectors] = useState<CaptureSector[]>([
    { id: 'front', name: t.captureSectorFront, yawDeg: 0, pitchDeg: 0, completed: false, required: true },
    { id: 'front-right', name: t.captureSectorFrontRight, yawDeg: 45, pitchDeg: 0, completed: false, required: true },
    { id: 'right', name: t.captureSectorRight, yawDeg: 90, pitchDeg: 0, completed: false, required: true },
    { id: 'back-right', name: t.captureSectorBackRight, yawDeg: 135, pitchDeg: 0, completed: false, required: true },
    { id: 'back', name: t.captureSectorBack, yawDeg: 180, pitchDeg: 0, completed: false, required: true },
    { id: 'back-left', name: t.captureSectorBackLeft, yawDeg: 225, pitchDeg: 0, completed: false, required: true },
    { id: 'left', name: t.captureSectorLeft, yawDeg: 270, pitchDeg: 0, completed: false, required: true },
    { id: 'front-left', name: t.captureSectorFrontLeft, yawDeg: 315, pitchDeg: 0, completed: false, required: true },
    { id: 'top', name: t.captureSectorTop, yawDeg: 0, pitchDeg: 45, completed: false, required: false },
  ]);

  const completedCount = sectors.filter((s) => s.completed).length;
  const coveragePercent = Math.round((completedCount / 8) * 100);

  const handleStart = () => {
    setStage('capturing');
    setCurrentSectorIndex(0);
  };

  const handleCaptureNext = () => {
    onCaptureAngleSnapshot?.();

    setSectors((prev) => {
      const next = [...prev];
      if (next[currentSectorIndex]) {
        next[currentSectorIndex] = { ...next[currentSectorIndex], completed: true };
      }
      return next;
    });

    if (currentSectorIndex + 1 < sectors.length) {
      setCurrentSectorIndex((prev) => prev + 1);
    } else {
      setStage('complete');
    }
  };

  const handleReset = () => {
    setStage('setup');
    setCurrentSectorIndex(0);
    setSectors((prev) => prev.map((s) => ({ ...s, completed: false })));
  };

  const currentSector = sectors[currentSectorIndex] || sectors[0];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-25 select-none">
      {/* Top Banner Notice */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/85 border border-cyan-500/50 clip-faceted-sm font-mono text-xs text-cyan-300 shadow-md pointer-events-auto">
          <Orbit className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">{t.captureTitle}</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400">{coveragePercent}% {t.captureCoverage}</span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-black/70 border border-slate-700 clip-faceted-sm text-[9px] font-mono text-slate-400 max-w-md text-center">
          <Info className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>{t.captureShellNotice}</span>
        </div>
      </div>

      {/* Center 360° Orbital Compass Ring */}
      <div className="relative flex items-center justify-center my-auto">
        {/* Orbital 360 ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-cyan-500/30 flex items-center justify-center">
          {/* Circular Sector Indicators */}
          {sectors.slice(0, 8).map((sector, i) => {
            const angleRad = (i * 45 - 90) * (Math.PI / 180);
            const radius = 100; // px
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            const isTarget = currentSectorIndex === i && stage === 'capturing';

            return (
              <div
                key={sector.id}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center font-mono text-[8px] font-bold transition-all ${
                  sector.completed
                    ? 'bg-emerald-400 text-black shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : isTarget
                    ? 'bg-cyan-400 text-black ring-4 ring-cyan-400/40 animate-pulse'
                    : 'bg-black/80 border border-cyan-500/40 text-cyan-400'
                }`}
                title={`${sector.name} (${sector.yawDeg}°)`}
              >
                {sector.completed ? '✓' : i + 1}
              </div>
            );
          })}

          {/* Central reticle readout */}
          <div className="text-center font-mono space-y-1">
            <div className="text-[10px] text-slate-400">{t.captureFrames}</div>
            <div className="text-2xl font-bold text-cyan-300">{completedCount} / 8</div>
            {stage === 'capturing' && (
              <div className="text-[9px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 clip-faceted-sm">
                {currentSector.name} ({currentSector.yawDeg}°)
              </div>
            )}
          </div>
        </div>

        {/* Directional Hint Banner */}
        {stage === 'capturing' && (
          <div className="absolute -bottom-9 font-mono text-[10px] text-cyan-200 bg-black/80 px-3 py-1 border border-cyan-500/40 clip-faceted-sm flex items-center gap-1.5 animate-bounce">
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>{t.captureDirectionRight} ({currentSector.yawDeg}°)</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col items-center gap-2 pb-2 pointer-events-auto">
        {completedCount < 8 && stage === 'capturing' && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-amber-300/90 bg-black/80 px-2.5 py-0.5 border border-amber-500/30 clip-faceted-sm">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>{t.captureInsufficientCoverage}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {stage === 'setup' && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold clip-faceted-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{t.captureStartBtn}</span>
            </button>
          )}

          {stage === 'capturing' && (
            <>
              <button
                onClick={handleCaptureNext}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold clip-faceted-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t.captureNextAngleBtn}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white clip-faceted-sm transition-colors cursor-pointer"
                title={t.captureResetBtn}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          {(stage === 'complete' || completedCount >= 8) && (
            <button
              onClick={() => onFinishReconstructionSequence?.(completedCount)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold clip-faceted-sm shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.captureFinishBtn} ({completedCount} {t.captureFrames})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
