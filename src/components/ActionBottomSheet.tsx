import React from 'react';
import { Image, FileCode, Camera, X, Cpu } from 'lucide-react';

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'photo' | 'file' | 'camera') => void;
}

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative z-10 w-full max-w-lg mb-0 sm:mb-4 px-3 animate-in slide-in-from-bottom duration-250">
        <div className="bg-slate-950 border border-cyan-500/80 p-5 clip-faceted-lg shadow-[0_0_40px_rgba(0,240,255,0.25)] text-slate-100">
          
          {/* Grab Bar & Header */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-10 h-1 bg-slate-700 rounded-full mb-3" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>INPUT PERIPHERALS // INGEST MATRIX</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* 1. Add Photo */}
            <button
              onClick={() => onSelectAction('photo')}
              className="flex flex-col items-center justify-center p-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/80 clip-faceted-sm transition-all group cursor-pointer"
            >
              <div className="w-14 h-14 mb-2 flex items-center justify-center bg-slate-950 border border-slate-700 group-hover:border-cyan-400 group-hover:bg-cyan-950/30 text-slate-200 group-hover:text-cyan-300 transition-colors">
                <Image className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200">
                Add Photo
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                Gallery / JPG
              </span>
            </button>

            {/* 2. Add File */}
            <button
              onClick={() => onSelectAction('file')}
              className="flex flex-col items-center justify-center p-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/80 clip-faceted-sm transition-all group cursor-pointer"
            >
              <div className="w-14 h-14 mb-2 flex items-center justify-center bg-slate-950 border border-slate-700 group-hover:border-cyan-400 group-hover:bg-cyan-950/30 text-slate-200 group-hover:text-cyan-300 transition-colors">
                <FileCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200">
                Add File
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                OBJ / CAD / DOC
              </span>
            </button>

            {/* 3. Open Camera */}
            <button
              onClick={() => onSelectAction('camera')}
              className="flex flex-col items-center justify-center p-4 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-400 clip-faceted-sm transition-all group cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <div className="w-14 h-14 mb-2 flex items-center justify-center bg-cyan-500 text-black group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-100">
                Open Camera
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                HUD Scanner
              </span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500">
            TRANSMITS SPATIAL DATA DIRECTLY TO GOLEM 3D PIPELINE
          </div>
        </div>
      </div>
    </div>
  );
};
