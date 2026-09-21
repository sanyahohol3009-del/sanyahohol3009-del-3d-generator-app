import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Edit2, FileSpreadsheet, Loader2, Send, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { DrawingAnalysisResult, DrawingReviewDimension } from '../types/vision';

interface Props {
  analysis: DrawingAnalysisResult | null;
  isAnalyzing?: boolean;
  onConfirmDimensions: (dims: DrawingReviewDimension[], targetCad: 'FreeCAD' | 'OpenSCAD') => Promise<void> | void;
  onDiscard: () => void;
  onBackToChat?: () => void;
}

export const DrawingReviewPanel: React.FC<Props> = ({ analysis, isAnalyzing = false, onConfirmDimensions, onDiscard, onBackToChat }) => {
  const { t } = useI18n();
  const [targetCad, setTargetCad] = useState<'FreeCAD' | 'OpenSCAD'>('FreeCAD');
  const [dimensions, setDimensions] = useState<DrawingReviewDimension[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    setDimensions((analysis?.dimensions || []).map((item) => ({ ...item, status: item.status || 'pending' })));
  }, [analysis]);

  const edit = (dimension: DrawingReviewDimension) => { setEditingId(dimension.id); setTempValue(String(dimension.nominalValue)); };
  const save = (id: string) => {
    const value = Number(tempValue);
    if (Number.isFinite(value) && value > 0) setDimensions((prev) => prev.map((item) => item.id === id ? { ...item, nominalValue: value, status: 'edited' } : item));
    setEditingId(null);
  };
  const status = (id: string, next: 'confirmed' | 'rejected') => setDimensions((prev) => prev.map((item) => item.id === id ? { ...item, status: next } : item));
  const active = dimensions.filter((item) => item.status === 'confirmed' || item.status === 'edited');

  return (
    <div className="min-h-full p-3 sm:p-4 bg-slate-950 text-slate-100 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <div><div className="text-xs font-bold text-cyan-300">{t.drawingReviewHeader}</div><div className="text-[10px] text-slate-400">{t.drawingReviewSub}</div></div>
        </div>
        <div className="flex items-center gap-2">
          {onBackToChat && <button onClick={onBackToChat} className="p-2 bg-black border border-cyan-500/50 text-cyan-300" title={t.cameraBackToChat}><ArrowLeft className="w-4 h-4" /></button>}
          <button onClick={onDiscard} className="p-2 text-slate-400 hover:text-red-400" title={t.drawingDiscardBtn}><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="mt-3 p-2 bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-[10px] text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /><span>{t.drawingUncertainNotice}</span>
      </div>

      {isAnalyzing && <div className="py-10 flex items-center justify-center gap-2 text-cyan-300 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> OCR / LINE ANALYSIS</div>}

      {!isAnalyzing && analysis && (
        <>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">{t.drawingTargetCad}</span>
            <div className="flex border border-cyan-500/30">
              {(['FreeCAD', 'OpenSCAD'] as const).map((engine) => <button key={engine} onClick={() => setTargetCad(engine)} className={`px-2.5 py-1 text-[10px] font-bold ${targetCad === engine ? 'bg-cyan-500 text-black' : 'bg-black text-cyan-400'}`}>{engine}</button>)}
            </div>
          </div>

          <div className="mt-3 text-[9px] text-slate-500">OCR LINES: {analysis.line_count ?? 'n/a'} · CONF: {Math.round(Number(analysis.confidence || 0) * 100)}% · {analysis.status}</div>

          <div className="mt-2 space-y-1.5">
            {dimensions.length === 0 && <div className="p-4 border border-amber-500/30 text-amber-300 text-[10px]">{t.drawingUncertainNotice}</div>}
            {dimensions.map((dim) => (
              <div key={dim.id} className={`p-2 border flex items-center justify-between gap-2 ${dim.status === 'confirmed' || dim.status === 'edited' ? 'border-emerald-500/40 bg-emerald-950/20' : dim.status === 'rejected' ? 'border-red-500/40 opacity-60' : 'border-slate-700 bg-slate-900/60'}`}>
                <div className="min-w-0 flex-1"><div className="text-[11px] font-semibold">{dim.name} {dim.originalOcrText ? <span className="text-slate-500">[OCR: {dim.originalOcrText}]</span> : null}</div><div className="text-[9px] text-slate-500">CONF {Math.round(dim.confidence * 100)}% · {dim.status.toUpperCase()}</div></div>
                <div className="flex items-center gap-1.5">
                  {editingId === dim.id ? (
                    <><input type="number" step="any" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save(dim.id)} className="w-20 bg-black border border-cyan-400 px-1 py-0.5 text-right text-xs" autoFocus /><span className="text-[10px]">{dim.unit}</span><button onClick={() => save(dim.id)} className="p-1 bg-emerald-500 text-black"><Check className="w-3 h-3" /></button></>
                  ) : (
                    <><span className="text-sm font-bold">{dim.nominalValue}</span><span className="text-[10px] text-slate-400">{dim.unit}</span><button onClick={() => edit(dim)} className="p-1 bg-black border border-cyan-500/30 text-cyan-300" title={t.drawingActionEdit}><Edit2 className="w-3 h-3" /></button><button onClick={() => status(dim.id, 'confirmed')} className="p-1 bg-black border border-emerald-500/30 text-emerald-300" title={t.drawingActionConfirm}><Check className="w-3 h-3" /></button><button onClick={() => status(dim.id, 'rejected')} className="p-1 bg-black border border-red-500/30 text-red-300" title={t.drawingActionReject}><X className="w-3 h-3" /></button></>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button onClick={onDiscard} className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">{t.drawingDiscardBtn}</button>
            <button onClick={() => void onConfirmDimensions(active, targetCad)} disabled={active.length === 0} className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 disabled:opacity-40 text-black text-xs font-bold"><Send className="w-3.5 h-3.5" />{t.drawingSendCadBtn}</button>
          </div>
        </>
      )}
    </div>
  );
};
