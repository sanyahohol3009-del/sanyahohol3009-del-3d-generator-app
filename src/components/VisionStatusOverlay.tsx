import React from 'react';
import { useI18n } from '../i18n';
import {
  Ruler,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Maximize2,
  Sun,
  ShieldCheck,
} from 'lucide-react';

export type BackendGuidanceState =
  | 'SEARCHING_FOR_SCALE'
  | 'SCALE_CANDIDATE'
  | 'RULER_DETECTED'
  | 'ARUCO_DETECTED'
  | 'SCALE_LOCKED'
  | 'SEARCHING_FOR_OBJECT'
  | 'OBJECT_CANDIDATE'
  | 'OBJECT_LOCKED'
  | 'HOLD_STEADY'
  | 'MOVE_CLOSER'
  | 'MOVE_FARTHER'
  | 'REDUCE_CAMERA_ANGLE'
  | 'MORE_LIGHT_REQUIRED'
  | 'OBJECT_OCCLUDED'
  | 'SCALE_LOST'
  | 'MEASUREMENT_VERIFIED'
  | 'LOW_CONFIDENCE'
  | 'NEED_ANOTHER_VIEW';

interface VisionStatusOverlayProps {
  guidanceState?: BackendGuidanceState;
  customStatus?: string;
  confidence?: number;
  scaleProvider?: string;
  markerId?: number;
}

export const VisionStatusOverlay: React.FC<VisionStatusOverlayProps> = ({
  guidanceState = 'SEARCHING_FOR_SCALE',
  customStatus,
  confidence,
  scaleProvider,
  markerId,
}) => {
  const { t } = useI18n();

  const getGuidanceConfig = () => {
    switch (guidanceState) {
      case 'SEARCHING_FOR_SCALE':
        return {
          label: t.hudSearchingScale,
          icon: <Eye className="w-3.5 h-3.5 text-cyan-400" />,
          colorClass: 'text-cyan-300 border-cyan-500/40 bg-black/75',
        };
      case 'SCALE_CANDIDATE':
        return {
          label: t.hudScaleCandidate,
          icon: <Crosshair className="w-3.5 h-3.5 text-amber-300" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'RULER_DETECTED':
        return {
          label: t.hudRulerDetected,
          icon: <Ruler className="w-3.5 h-3.5 text-cyan-400" />,
          colorClass: 'text-cyan-300 border-cyan-500/40 bg-black/75',
        };
      case 'ARUCO_DETECTED':
        return {
          label: markerId !== undefined ? `${t.hudArucoDetected} (ID: ${markerId})` : t.hudArucoDetected,
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          colorClass: 'text-emerald-300 border-emerald-500/40 bg-black/75',
        };
      case 'SCALE_LOCKED':
        return {
          label: t.hudScaleLocked,
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          colorClass: 'text-emerald-300 border-emerald-500/40 bg-black/75',
        };
      case 'SEARCHING_FOR_OBJECT':
        return {
          label: t.hudSearchingObject,
          icon: <Eye className="w-3.5 h-3.5 text-cyan-400" />,
          colorClass: 'text-cyan-300 border-cyan-500/40 bg-black/75',
        };
      case 'OBJECT_CANDIDATE':
        return {
          label: t.hudObjectCandidate,
          icon: <Maximize2 className="w-3.5 h-3.5 text-amber-300" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'OBJECT_LOCKED':
        return {
          label: t.hudObjectLocked,
          icon: <Crosshair className="w-3.5 h-3.5 text-cyan-400" />,
          colorClass: 'text-cyan-300 border-cyan-500/40 bg-black/75',
        };
      case 'HOLD_STEADY':
        return {
          label: t.hudHoldSteady,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'MOVE_CLOSER':
        return {
          label: t.hudMoveCloser,
          icon: <Maximize2 className="w-3.5 h-3.5 text-sky-400" />,
          colorClass: 'text-sky-300 border-sky-500/40 bg-black/75',
        };
      case 'MOVE_FARTHER':
        return {
          label: t.hudMoveFarther,
          icon: <Maximize2 className="w-3.5 h-3.5 text-sky-400" />,
          colorClass: 'text-sky-300 border-sky-500/40 bg-black/75',
        };
      case 'REDUCE_CAMERA_ANGLE':
        return {
          label: t.hudReduceAngle,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'MORE_LIGHT_REQUIRED':
        return {
          label: t.hudMoreLight,
          icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'OBJECT_OCCLUDED':
        return {
          label: t.hudObjectOccluded,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
          colorClass: 'text-red-300 border-red-500/40 bg-black/75',
        };
      case 'SCALE_LOST':
        return {
          label: t.hudScaleLost,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
          colorClass: 'text-red-300 border-red-500/40 bg-black/75',
        };
      case 'MEASUREMENT_VERIFIED':
        return {
          label: t.hudMeasurementVerified,
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          colorClass: 'text-emerald-300 border-emerald-500/40 bg-black/75',
        };
      case 'LOW_CONFIDENCE':
        return {
          label: t.hudLowConfidence,
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />,
          colorClass: 'text-amber-300 border-amber-500/40 bg-black/75',
        };
      case 'NEED_ANOTHER_VIEW':
        return {
          label: t.hudNeedAnotherView,
          icon: <HelpCircle className="w-3.5 h-3.5 text-sky-400" />,
          colorClass: 'text-sky-300 border-sky-500/40 bg-black/75',
        };
      default:
        return {
          label: customStatus || t.hudSearchingScale,
          icon: <Crosshair className="w-3.5 h-3.5 text-cyan-400" />,
          colorClass: 'text-cyan-300 border-cyan-500/40 bg-black/75',
        };
    }
  };

  const config = getGuidanceConfig();

  return (
    <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
      <div
        className={`flex items-center gap-2 px-3 py-1 border clip-faceted-sm font-mono text-[11px] font-semibold tracking-wider shadow-md ${config.colorClass}`}
      >
        {config.icon}
        <span>{customStatus || config.label}</span>
        {confidence !== undefined && (
          <span className="ml-1 px-1 py-0.2 bg-white/10 rounded-xs text-[9px]">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {scaleProvider && (
        <div className="text-[9px] font-mono text-cyan-400/80 bg-black/60 px-2 py-0.5 border border-cyan-500/20 clip-faceted-sm">
          PROVIDER: {scaleProvider.toUpperCase()}
        </div>
      )}
    </div>
  );
};
