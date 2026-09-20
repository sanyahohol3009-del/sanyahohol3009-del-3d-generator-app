import React from 'react';
import { Image, FileCode, Camera, X, Cpu, Orbit, FileSpreadsheet } from 'lucide-react';
import { useI18n } from '../i18n';

export type ActionBottomSheetType = 'photo' | 'file' | 'camera' | 'capture' | 'drawing';

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: ActionBottomSheetType) => void;
}

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const items: Array<{
    id: ActionBottomSheetType;
    title: string;
    sub: string;
    icon: React.ReactNode;
    primary?: boolean;
  }> = [
    {
      id: 'photo',
      title: t.toolPhoto,
      sub: t.toolPhotoSub,
      icon: <Image className="w-5 h-5" />,
    },
    {
      id: 'file',
      title: t.toolFile,
      sub: t.toolFileSub,
      icon: <FileCode className="w-5 h-5" />,
    },
    {
      id: 'camera',
      title: t.toolCamera,
      sub: t.toolCameraSub,
      icon: <Camera className="w-5 h-5" />,
      primary: true,
    },
    {
      id: 'capture',
      title: t.toolCapture,
      sub: t.toolCaptureSub,
      icon: <Orbit className="w-5 h-5" />,
    },
    {
      id: 'drawing',
      title: t.toolDrawing,
      sub: t.toolDrawingSub,
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative z-10 w-full max-w-xl mb-0 sm:mb-4 px-3 animate-in slide-in-from-bottom duration-250">
        <div className="bg-slate-950 border border-cyan-500/80 p-4 sm:p-5 clip-faceted-lg shadow-[0_0_40px_rgba(0,240,255,0.25)] text-slate-100">
          {/* Grab Bar & Header */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-10 h-1 bg-slate-700 rounded-full mb-3" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>{t.inputPeripheralsHeader}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full text-left text-[10px] font-mono text-slate-400 mt-1">
              {t.inputSubHeader}
            </div>
          </div>

          {/* 5 Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {items.map((item) => (
              <button
                key={item.id}
                id={`action-sheet-btn-${item.id}`}
                onClick={() => onSelectAction(item.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-3.5 clip-faceted-sm transition-all group cursor-pointer border ${
                  item.primary
                    ? 'bg-cyan-950/40 hover:bg-cyan-900/50 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] sm:col-span-1'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-cyan-400/80'
                }`}
              >
                <div
                  className={`w-11 h-11 mb-2 flex items-center justify-center clip-faceted-sm transition-colors ${
                    item.primary
                      ? 'bg-cyan-500 text-black group-hover:scale-105'
                      : 'bg-slate-950 border border-slate-700 group-hover:border-cyan-400 text-slate-200 group-hover:text-cyan-300'
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-xs font-semibold text-center ${
                    item.primary
                      ? 'text-cyan-300 group-hover:text-cyan-100 font-bold'
                      : 'text-slate-200 group-hover:text-cyan-200'
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-[9.5px] font-mono text-slate-400 mt-0.5 text-center">
                  {item.sub}
                </span>
              </button>
            ))}
          </div>

          {/* Pipeline footnote */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800 text-center text-[9.5px] font-mono text-slate-500">
            {t.pipelineFootnote}
          </div>
        </div>
      </div>
    </div>
  );
};
