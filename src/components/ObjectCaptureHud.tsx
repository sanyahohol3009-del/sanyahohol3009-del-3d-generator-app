import React, { useMemo, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Info, Orbit, Play, RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n';
import { CaptureSector, ObjectCaptureStage } from '../types/vision';

interface Props {
  onStartCapture: () => Promise<boolean>;
  onCaptureSector: (sector: CaptureSector, index: number) => Promise<{ accepted: boolean; warnings?: string[] }>;
  onFinishCapture: () => Promise<{ datasetReady: boolean; frameCount: number }>;
}

export const ObjectCaptureHud: React.FC<Props> = ({ onStartCapture, onCaptureSector, onFinishCapture }) => {
  const { t } = useI18n();
  const initial = useMemo<CaptureSector[]>(() => [
    { id: 'front', name: t.captureSectorFront, yawDeg: 0, pitchDeg: 0, completed: false, required: true },
    { id: 'front-right', name: t.captureSectorFrontRight, yawDeg: 45, pitchDeg: 0, completed: false, required: true },
    { id: 'right', name: t.captureSectorRight, yawDeg: 90, pitchDeg: 0, completed: false, required: true },
    { id: 'back-right', name: t.captureSectorBackRight, yawDeg: 135, pitchDeg: 0, completed: false, required: true },
    { id: 'back', name: t.captureSectorBack, yawDeg: 180, pitchDeg: 0, completed: false, required: true },
    { id: 'back-left', name: t.captureSectorBackLeft, yawDeg: 225, pitchDeg: 0, completed: false, required: true },
    { id: 'left', name: t.captureSectorLeft, yawDeg: 270, pitchDeg: 0, completed: false, required: true },
    { id: 'front-left', name: t.captureSectorFrontLeft, yawDeg: 315, pitchDeg: 0, completed: false, required: true },
  ], [t]);

  const [stage, setStage] = useState<ObjectCaptureStage>('setup');
  const [sectors, setSectors] = useState<CaptureSector[]>(initial);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const completed = sectors.filter((sector) => sector.completed).length;
  const current = sectors[Math.min(index, sectors.length - 1)];

  const start = async () => {
    setBusy(true); setWarning(null);
    try {
      const ok = await onStartCapture();
      if (!ok) throw new Error('capture session unavailable');
      setSectors(initial.map((sector) => ({ ...sector, completed: false })));
      setIndex(0);
      setStage('capturing');
    } catch (error) {
      setStage('error');
      setWarning(error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  };

  const capture = async () => {
    if (!current || busy) return;
    setBusy(true); setWarning(null);
    try {
      const result = await onCaptureSector(current, index);
      if (!result.accepted) {
        setWarning((result.warnings || []).join(', ') || t.captureBlurWarning);
        return;
      }
      setSectors((prev) => prev.map((sector, i) => i === index ? { ...sector, completed: true } : sector));
      if (index + 1 < sectors.length) setIndex(index + 1);
      else setStage('coverage_progress');
    } catch (error) {
      setWarning(error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  };

  const finish = async () => {
    setBusy(true); setWarning(null); setStage('processing');
    try {
      const result = await onFinishCapture();
      if (result.datasetReady) setStage('complete');
      else { setStage('coverage_progress'); setWarning(t.captureInsufficientCoverage); }
    } catch (error) {
      setStage('error');
      setWarning(error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  };

  const reset = () => {
    setSectors(initial.map((sector) => ({ ...sector, completed: false })));
    setIndex(0); setStage('setup'); setWarning(null);
  };

  return (
    <div className="absolute inset-0 z-25 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/85 border border-cyan-500/50 font-mono text-xs text-cyan-300">
          <Orbit className="w-4 h-4" />
          <span className="font-bold">{t.captureTitle}</span>
          <span className="text-emerald-400">{Math.round((completed / sectors.length) * 100)}% {t.captureCoverage}</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-black/75 border border-slate-700 text-[9px] font-mono text-slate-400">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>{t.captureShellNotice}</span>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-auto">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-cyan-500/30 flex items-center justify-center">
          {sectors.map((sector, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180;
            const radius = 100;
            const target = i === index && (stage === 'capturing' || stage === 'coverage_progress');
            return (
              <div key={sector.id} style={{ transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)` }}
                className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center text-[8px] font-bold ${sector.completed ? 'bg-emerald-400 text-black' : target ? 'bg-cyan-400 text-black ring-4 ring-cyan-400/30 animate-pulse' : 'bg-black border border-cyan-500/40 text-cyan-400'}`}>
                {sector.completed ? '✓' : i + 1}
              </div>
            );
          })}
          <div className="text-center font-mono">
            <div className="text-[10px] text-slate-400">{t.captureFrames}</div>
            <div className="text-2xl font-bold text-cyan-300">{completed} / {sectors.length}</div>
            {current && stage !== 'setup' && stage !== 'complete' && (
              <div className="mt-1 text-[9px] text-emerald-300">{current.name} · {current.yawDeg}°</div>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {warning && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/85 border border-amber-500/50 text-amber-300 text-[10px] font-mono">
            <AlertTriangle className="w-3 h-3" /> {warning}
          </div>
        )}
        {stage === 'setup' && (
          <button onClick={() => void start()} disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-mono text-xs font-bold disabled:opacity-50">
            <Play className="w-4 h-4" /> {t.captureStartBtn}
          </button>
        )}
        {(stage === 'capturing' || stage === 'coverage_progress') && completed < sectors.length && (
          <button onClick={() => void capture()} disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-mono text-xs font-bold disabled:opacity-50">
            <Camera className="w-4 h-4" /> {t.captureNextAngleBtn}
          </button>
        )}
        {(completed >= 6 || stage === 'coverage_progress') && stage !== 'complete' && (
          <button onClick={() => void finish()} disabled={busy} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-mono text-xs font-bold disabled:opacity-50">
            <CheckCircle2 className="w-4 h-4" /> {t.captureFinishBtn}
          </button>
        )}
        {stage === 'complete' && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono">
              CAPTURE DATASET READY · {completed} {t.captureFrames}
            </div>
            <button onClick={reset} className="p-2 bg-black border border-slate-600 text-slate-300" title={t.captureResetBtn}><RotateCcw className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
