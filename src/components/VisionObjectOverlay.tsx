import React, { useState } from 'react';
import { VisionBoundingBox, VisionObjectLock } from '../types/vision';
import { useI18n } from '../i18n';
import { Lock, Unlock, X, Crosshair, HelpCircle } from 'lucide-react';

interface VisionObjectOverlayProps {
  onLockChange?: (locked: boolean, bbox: VisionBoundingBox | null) => void;
  initialLock?: VisionObjectLock | null;
}

export const VisionObjectOverlay: React.FC<VisionObjectOverlayProps> = ({
  onLockChange,
  initialLock,
}) => {
  const { t } = useI18n();

  // User-interactive selection state
  const [selectedBox, setSelectedBox] = useState<VisionBoundingBox | null>(
    initialLock ? initialLock.bbox : null
  );
  const [isLocked, setIsLocked] = useState<boolean>(
    initialLock ? initialLock.locked : false
  );

  // Handle tap/click on viewfinder to position bounding box
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const boxWidth = Math.min(220, rect.width * 0.55);
    const boxHeight = Math.min(180, rect.height * 0.45);

    const x = Math.max(10, Math.min(clickX - boxWidth / 2, rect.width - boxWidth - 10));
    const y = Math.max(10, Math.min(clickY - boxHeight / 2, rect.height - boxHeight - 10));

    const newBox: VisionBoundingBox = {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(boxWidth),
      height: Math.round(boxHeight),
    };

    setSelectedBox(newBox);
    onLockChange?.(false, newBox);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    onLockChange?.(nextLocked, selectedBox);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocked(false);
    setSelectedBox(null);
    onLockChange?.(false, null);
  };

  return (
    <div
      onClick={handleViewportClick}
      className="absolute inset-0 z-25 cursor-crosshair select-none"
      title={t.objectLockTapHint}
    >
      {/* If a box is selected by user */}
      {selectedBox && (
        <div
          style={{
            left: `${selectedBox.x}px`,
            top: `${selectedBox.y}px`,
            width: `${selectedBox.width}px`,
            height: `${selectedBox.height}px`,
          }}
          className={`absolute border-2 transition-all ${
            isLocked
              ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
              : 'border-cyan-400 border-dashed bg-cyan-950/15 animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.3)]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Corner framing brackets */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />

          {/* Top Label & Action Controls */}
          <div className="absolute -top-7 left-0 flex items-center gap-1 font-mono text-[9px] pointer-events-auto">
            <span
              className={`px-2 py-0.5 clip-faceted-sm font-bold flex items-center gap-1 ${
                isLocked
                  ? 'bg-emerald-500 text-black'
                  : 'bg-cyan-500 text-black'
              }`}
            >
              <Crosshair className="w-2.5 h-2.5" />
              {isLocked ? t.hudObjectLocked : t.objectLockSelected}
            </span>

            <button
              onClick={handleToggleLock}
              className={`px-2 py-0.5 clip-faceted-sm flex items-center gap-1 border transition-colors cursor-pointer ${
                isLocked
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-cyan-950/90 border-cyan-400 text-cyan-300 hover:bg-cyan-900'
              }`}
              title={isLocked ? t.objectLockUnlockBtn : t.objectLockLockBtn}
            >
              {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
              <span>{isLocked ? t.objectLockUnlockBtn : t.objectLockLockBtn}</span>
            </button>

            <button
              onClick={handleClear}
              className="px-1.5 py-0.5 bg-black/90 border border-slate-600 text-slate-300 hover:text-red-400 clip-faceted-sm cursor-pointer"
              title={t.objectLockClearBtn}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Bottom Dimensions indicator */}
          <div className="absolute -bottom-5 right-0 font-mono text-[8px] text-cyan-300/80 bg-black/80 px-1.5 py-0.2 border border-cyan-500/30 clip-faceted-sm">
            ROI: {selectedBox.width}×{selectedBox.height} px
          </div>
        </div>
      )}

      {/* Floating subtle helper hint if no box is selected */}
      {!selectedBox && (
        <div className="absolute bottom-20 inset-x-0 flex justify-center pointer-events-none">
          <span className="font-mono text-[10px] text-cyan-300/75 bg-black/80 border border-cyan-500/30 px-3 py-1 clip-faceted-sm flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            {t.objectLockTapHint}
          </span>
        </div>
      )}
    </div>
  );
};
