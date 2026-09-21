import React, { useEffect, useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { VisionBoundingBox, VisionObjectLock } from '../types/vision';

interface Props {
  candidate?: (VisionObjectLock & { bbox_normalized?: VisionBoundingBox }) | null;
  manualRoi?: VisionBoundingBox | null;
  onManualSelect?: (bbox: VisionBoundingBox) => Promise<void> | void;
  onClear?: () => Promise<void> | void;
}

export const VisionObjectOverlay: React.FC<Props> = ({ candidate, manualRoi, onManualSelect, onClear }) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<VisionBoundingBox | null>(manualRoi || null);

  useEffect(() => setSelected(manualRoi || null), [manualRoi]);

  const select = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const boxWidth = Math.min(220, rect.width * 0.52);
    const boxHeight = Math.min(180, rect.height * 0.42);
    const x = Math.max(0, Math.min(event.clientX - rect.left - boxWidth / 2, rect.width - boxWidth));
    const y = Math.max(0, Math.min(event.clientY - rect.top - boxHeight / 2, rect.height - boxHeight));
    const bbox = { x: Math.round(x), y: Math.round(y), width: Math.round(boxWidth), height: Math.round(boxHeight) };
    setSelected(bbox);
    void onManualSelect?.(bbox);
  };

  const box = selected || candidate?.bbox || null;
  const normalized = !selected ? candidate?.bbox_normalized : undefined;
  const manual = Boolean(selected);
  const boxStyle: React.CSSProperties | undefined = box ? (
    normalized
      ? { left: `${normalized.x * 100}%`, top: `${normalized.y * 100}%`, width: `${normalized.width * 100}%`, height: `${normalized.height * 100}%` }
      : { left: box.x, top: box.y, width: box.width, height: box.height }
  ) : undefined;

  return (
    <div className="absolute inset-0 z-25 cursor-crosshair select-none pointer-events-auto" onClick={select} title={t.objectLockTapHint}>
      {box && (
        <div
          style={boxStyle}
          className={`absolute border-2 ${manual ? 'border-cyan-300 bg-cyan-950/15' : 'border-amber-300 border-dashed bg-amber-950/10'}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={`absolute -top-7 left-0 px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1 ${manual ? 'bg-cyan-500 text-black' : 'bg-amber-400 text-black'}`}>
            <Crosshair className="w-2.5 h-2.5" />
            {manual ? t.objectLockSelected : t.hudObjectCandidate}
            {!manual && candidate?.confidence !== undefined ? ` ${Math.round(candidate.confidence * 100)}%` : ''}
          </div>
          {manual && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setSelected(null); void onClear?.(); }}
              className="absolute -top-7 right-0 p-1 bg-black/90 border border-slate-600 text-slate-300 hover:text-red-400"
              title={t.objectLockClearBtn}
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div className="absolute -bottom-5 right-0 text-[8px] font-mono text-slate-300 bg-black/80 px-1.5 py-0.5">
            {manual ? 'USER ROI' : 'CV CANDIDATE'} · {box.width}×{box.height}px
          </div>
        </div>
      )}
    </div>
  );
};
