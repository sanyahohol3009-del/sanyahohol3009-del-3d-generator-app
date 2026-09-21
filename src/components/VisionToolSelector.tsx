import React from 'react';
import { VisionCameraMode } from '../types/vision';
import { useI18n } from '../i18n';
import { Sparkles, Ruler, Orbit, FileSpreadsheet } from 'lucide-react';

interface VisionToolSelectorProps {
  currentMode: VisionCameraMode;
  onSelectMode: (mode: VisionCameraMode) => void;
  disabled?: boolean;
}

export const VisionToolSelector: React.FC<VisionToolSelectorProps> = ({
  currentMode,
  onSelectMode,
  disabled = false,
}) => {
  const { t } = useI18n();

  const modes: Array<{
    id: VisionCameraMode;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'auto',
      label: t.modeAuto,
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'measure',
      label: t.modeMeasure,
      icon: <Ruler className="w-3.5 h-3.5" />,
    },
    {
      id: 'capture',
      label: t.modeCapture,
      icon: <Orbit className="w-3.5 h-3.5" />,
    },
    {
      id: 'drawing',
      label: t.modeDrawing,
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-black/80 backdrop-blur-xs border border-cyan-500/50 clip-faceted-sm select-none">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            id={`camera-mode-btn-${m.id}`}
            onClick={() => onSelectMode(m.id)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-semibold transition-all clip-faceted-sm cursor-pointer ${
              isActive
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/60'
            } disabled:opacity-50`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
