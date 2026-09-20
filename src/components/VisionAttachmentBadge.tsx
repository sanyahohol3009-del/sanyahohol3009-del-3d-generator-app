import React from 'react';
import { VisionAttachmentState } from '../types/vision';
import { VisionMeasurement } from '../types';
import { useI18n } from '../i18n';
import { CheckCircle2, AlertCircle, Clock, FileQuestion, XCircle, ShieldCheck, HelpCircle } from 'lucide-react';

interface VisionAttachmentBadgeProps {
  state: VisionAttachmentState;
  measurement?: VisionMeasurement | null;
  compact?: boolean;
}

export const VisionAttachmentBadge: React.FC<VisionAttachmentBadgeProps> = ({
  state,
  measurement,
  compact = false,
}) => {
  const { t } = useI18n();

  const getBadgeDetails = () => {
    switch (state) {
      case 'VERIFIED':
        return {
          title: t.badgeVerified,
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          containerClass: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
          badgeColor: 'text-emerald-400',
        };
      case 'PROCESSING':
        return {
          title: t.badgeProcessing,
          icon: <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />,
          containerClass: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
          badgeColor: 'text-cyan-400',
        };
      case 'APPROXIMATE':
        return {
          title: t.badgeApproximate,
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          containerClass: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          badgeColor: 'text-amber-400',
        };
      case 'NEED MORE INPUT':
        return {
          title: t.badgeNeedMoreInput,
          icon: <HelpCircle className="w-3.5 h-3.5 text-sky-400" />,
          containerClass: 'bg-sky-950/70 border-sky-500/50 text-sky-300',
          badgeColor: 'text-sky-400',
        };
      case 'FAILED':
        return {
          title: t.badgeFailed,
          icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
          containerClass: 'bg-red-950/70 border-red-500/50 text-red-300',
          badgeColor: 'text-red-400',
        };
      case 'REFERENCE ONLY':
      default:
        return {
          title: t.badgeReferenceOnly,
          icon: <FileQuestion className="w-3.5 h-3.5 text-slate-400" />,
          containerClass: 'bg-slate-900/80 border-slate-700 text-slate-300',
          badgeColor: 'text-slate-400',
        };
    }
  };

  const { title, icon, containerClass } = getBadgeDetails();

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 border clip-faceted-sm font-mono text-[9px] font-semibold tracking-wider ${containerClass}`}
      >
        {icon}
        <span>{title}</span>
        {state === 'VERIFIED' && measurement && (
          <span className="text-emerald-400 ml-0.5">
            {Number(measurement.object.width_mm).toFixed(0)}×{Number(measurement.object.height_mm).toFixed(0)}mm
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`p-2 border clip-faceted-sm font-mono text-[10px] space-y-1 ${containerClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wider">
          {icon}
          <span>{title}</span>
        </div>
        {measurement && (
          <span className="px-1.5 py-0.2 bg-black/50 border border-current/30 text-[9px]">
            {Math.round(Number(measurement.confidence) * 100)}%
          </span>
        )}
      </div>

      {state === 'VERIFIED' && measurement && (
        <>
          <div className="text-slate-200 text-[11px] font-semibold">
            {Number(measurement.object.width_mm).toFixed(1)} × {Number(measurement.object.height_mm).toFixed(1)} mm
            {measurement.object.area_mm2 && (
              <span className="text-slate-400 text-[10px] ml-1.5 font-normal">
                ({Math.round(measurement.object.area_mm2)} mm²)
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-emerald-500/20">
            <span>{t.visionArUcoScaleLabel}</span>
            <span className="italic">{t.visionDepthLimitation}</span>
          </div>
        </>
      )}

      {state === 'REFERENCE ONLY' && (
        <div className="text-[9px] text-slate-400">
          {t.snackVisionReference}
        </div>
      )}
    </div>
  );
};
