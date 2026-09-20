import React, { useState } from 'react';
import { DrawingReviewDimension } from '../types/vision';
import { useI18n } from '../i18n';
import {
  FileSpreadsheet,
  Check,
  Edit2,
  X,
  Send,
  AlertTriangle,
  Cpu,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

interface DrawingReviewPanelProps {
  onConfirmDimensions: (dims: DrawingReviewDimension[], targetCad: 'FreeCAD' | 'OpenSCAD') => void;
  onDiscard: () => void;
  onBackToChat?: () => void;
  initialImageUrl?: string;
}

export const DrawingReviewPanel: React.FC<DrawingReviewPanelProps> = ({
  onConfirmDimensions,
  onDiscard,
  onBackToChat,
  initialImageUrl,
}) => {
  const { t } = useI18n();

  const [targetCad, setTargetCad] = useState<'FreeCAD' | 'OpenSCAD'>('FreeCAD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const [dimensions, setDimensions] = useState<DrawingReviewDimension[]>([
    {
      id: 'dim-w',
      name: t.drawingDimWidth,
      nominalValue: 80,
      unit: 'mm',
      confidence: 0.94,
      status: 'confirmed',
      originalOcrText: '80.0 ±0.1',
    },
    {
      id: 'dim-h',
      name: t.drawingDimHeight,
      nominalValue: 40,
      unit: 'mm',
      confidence: 0.92,
      status: 'confirmed',
      originalOcrText: '40.0',
    },
    {
      id: 'dim-hole',
      name: t.drawingDimHole,
      nominalValue: 8,
      unit: 'mm',
      confidence: 0.88,
      status: 'confirmed',
      originalOcrText: 'Ø 8 H7',
    },
    {
      id: 'dim-ox',
      name: t.drawingDimOffsetX,
      nominalValue: 15,
      unit: 'mm',
      confidence: 0.85,
      status: 'pending',
      originalOcrText: '15.0',
    },
    {
      id: 'dim-oy',
      name: t.drawingDimOffsetY,
      nominalValue: 12,
      unit: 'mm',
      confidence: 0.83,
      status: 'pending',
      originalOcrText: '12.0',
    },
  ]);

  const handleStartEdit = (dim: DrawingReviewDimension) => {
    setEditingId(dim.id);
    setTempValue(String(dim.nominalValue));
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(tempValue);
    if (!isNaN(val)) {
      setDimensions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, nominalValue: val, status: 'edited' } : d))
      );
    }
    setEditingId(null);
  };

  const handleToggleStatus = (id: string, newStatus: 'confirmed' | 'rejected') => {
    setDimensions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === newStatus ? 'pending' : newStatus } : d))
    );
  };

  const handleConfirmAll = () => {
    const activeDims = dimensions.filter((d) => d.status !== 'rejected');
    onConfirmDimensions(activeDims, targetCad);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs p-3 sm:p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/60 clip-faceted-sm text-cyan-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-cyan-300 text-sm tracking-wide">{t.drawingReviewHeader}</div>
            <div className="text-[10px] text-slate-400">{t.drawingReviewSub}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="drawing-review-back-btn"
            onClick={onBackToChat || onDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/85 hover:bg-cyan-950 border border-cyan-400 hover:border-cyan-300 text-cyan-300 hover:text-white clip-faceted-sm transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            title={t.cameraBackToChat}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold tracking-wider">{t.cameraBackToChat}</span>
          </button>
          <button
            onClick={onDiscard}
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title={t.drawingDiscardBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Uncertain notice banner */}
      <div className="mt-3 p-2 bg-amber-950/40 border border-amber-500/40 clip-faceted-sm flex items-start gap-2 text-[10px] text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
        <span>{t.drawingUncertainNotice}</span>
      </div>

      {/* Target CAD Engine Selector */}
      <div className="mt-3 flex items-center justify-between p-2 bg-slate-900 border border-cyan-500/30 clip-faceted-sm">
        <span className="text-[11px] text-slate-300 font-semibold">{t.drawingTargetCad}</span>
        <div className="flex items-center gap-1">
          {(['FreeCAD', 'OpenSCAD'] as const).map((engine) => (
            <button
              key={engine}
              onClick={() => setTargetCad(engine)}
              className={`px-2.5 py-1 text-[10px] font-bold clip-faceted-sm transition-colors cursor-pointer ${
                targetCad === engine
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'bg-black/60 text-cyan-400 hover:bg-cyan-950/60'
              }`}
            >
              {engine}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Dimensions Table */}
      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {dimensions.map((dim) => {
          const isEditing = editingId === dim.id;

          return (
            <div
              key={dim.id}
              className={`p-2 border clip-faceted-sm flex items-center justify-between gap-2 transition-colors ${
                dim.status === 'confirmed'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : dim.status === 'edited'
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                  : dim.status === 'rejected'
                  ? 'bg-red-950/20 border-red-500/40 text-red-300 opacity-60'
                  : 'bg-slate-900/70 border-slate-700 text-slate-200'
              }`}
            >
              {/* Name and OCR match info */}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[11px] flex items-center gap-1.5">
                  <span>{dim.name}</span>
                  {dim.originalOcrText && (
                    <span className="text-[9px] text-slate-500 font-normal">
                      [OCR: {dim.originalOcrText}]
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400">
                  CONF: {Math.round(dim.confidence * 100)}% · STATUS: {dim.status.toUpperCase()}
                </div>
              </div>

              {/* Value / Edit input */}
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(dim.id)}
                      className="w-16 bg-black border border-cyan-400 px-1 py-0.5 text-right text-xs text-white"
                      autoFocus
                    />
                    <span className="text-[10px] text-slate-400">{dim.unit}</span>
                    <button
                      onClick={() => handleSaveEdit(dim.id)}
                      className="p-1 bg-emerald-500 text-black clip-faceted-sm cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-sm font-bold">{dim.nominalValue}</span>{' '}
                    <span className="text-[10px] text-slate-400">{dim.unit}</span>
                  </div>
                )}

                {/* Status action buttons */}
                {!isEditing && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => handleStartEdit(dim)}
                      className="p-1 bg-black/60 border border-cyan-500/30 text-cyan-300 hover:text-white clip-faceted-sm cursor-pointer"
                      title={t.drawingActionEdit}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(dim.id, 'confirmed')}
                      className={`p-1 border clip-faceted-sm cursor-pointer ${
                        dim.status === 'confirmed'
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : 'bg-black/60 border-slate-700 text-slate-400 hover:text-emerald-400'
                      }`}
                      title={t.drawingActionConfirm}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(dim.id, 'rejected')}
                      className={`p-1 border clip-faceted-sm cursor-pointer ${
                        dim.status === 'rejected'
                          ? 'bg-red-500 text-black border-red-400'
                          : 'bg-black/60 border-slate-700 text-slate-400 hover:text-red-400'
                      }`}
                      title={t.drawingActionReject}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Submit */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-[10px] clip-faceted-sm transition-colors cursor-pointer"
        >
          {t.drawingDiscardBtn}
        </button>

        <button
          onClick={handleConfirmAll}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold clip-faceted-sm shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t.drawingSendCadBtn}</span>
        </button>
      </div>
    </div>
  );
};
