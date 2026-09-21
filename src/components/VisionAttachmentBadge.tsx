import React from 'react';
import { AlertCircle, Clock, FileQuestion, HelpCircle, ShieldCheck, XCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { VisionMeasurement } from '../types';
import { VisionAttachmentState } from '../types/vision';

interface Props {
  state: VisionAttachmentState;
  measurement?: VisionMeasurement | null;
  compact?: boolean;
}

export const VisionAttachmentBadge: React.FC<Props> = ({ state, measurement, compact = false }) => {
  const { t } = useI18n();
  const config = {
    VERIFIED: [t.badgeVerified, <ShieldCheck key="i" className="w-3.5 h-3.5" />, 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60'],
    PROCESSING: [t.badgeProcessing, <Clock key="i" className="w-3.5 h-3.5 animate-spin" />, 'border-cyan-500/50 text-cyan-300 bg-cyan-950/60'],
    APPROXIMATE: [t.badgeApproximate, <AlertCircle key="i" className="w-3.5 h-3.5" />, 'border-amber-500/50 text-amber-300 bg-amber-950/60'],
    'NEED MORE INPUT': [t.badgeNeedMoreInput, <HelpCircle key="i" className="w-3.5 h-3.5" />, 'border-sky-500/50 text-sky-300 bg-sky-950/60'],
    FAILED: [t.badgeFailed, <XCircle key="i" className="w-3.5 h-3.5" />, 'border-red-500/50 text-red-300 bg-red-950/60'],
    'REFERENCE ONLY': [t.badgeReferenceOnly, <FileQuestion key="i" className="w-3.5 h-3.5" />, 'border-slate-700 text-slate-300 bg-slate-900/70'],
  } as const;
  const [title, icon, classes] = config[state];
  const hasDimensions = Boolean(measurement?.object?.width_mm && measurement?.object?.height_mm);
  const provider = measurement?.scale?.provider || (measurement?.marker ? 'aruco' : undefined);

  if (compact) return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-mono ${classes}`}>{icon}<span>{title}</span>{hasDimensions ? <span>{Number(measurement?.object.width_mm).toFixed(0)}×{Number(measurement?.object.height_mm).toFixed(0)}mm</span> : null}</span>;

  return (
    <div className={`p-2 border text-[10px] font-mono space-y-1 ${classes}`}>
      <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-1.5 font-bold">{icon}<span>{title}</span></div>{measurement ? <span>{Math.round(Number(measurement.confidence || 0) * 100)}%</span> : null}</div>
      {hasDimensions && <div className="text-slate-100 text-[11px] font-semibold">{Number(measurement?.object.width_mm).toFixed(1)} × {Number(measurement?.object.height_mm).toFixed(1)} mm</div>}
      {provider && <div className="text-[9px] text-slate-400">SCALE: {String(provider).toUpperCase()} · {measurement?.evidence?.verified ? 'SERVER VERIFIED' : 'APPROXIMATE'}</div>}
      {measurement && !measurement.evidence?.verified && <div className="text-[9px] text-amber-300">{t.visionDepthLimitation}</div>}
      {!measurement && state === 'REFERENCE ONLY' && <div className="text-[9px] text-slate-400">{t.snackVisionReference}</div>}
    </div>
  );
};
