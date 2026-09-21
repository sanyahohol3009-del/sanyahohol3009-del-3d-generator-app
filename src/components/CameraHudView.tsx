import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Camera, DraftingCompass, FolderOpen, RefreshCw, RotateCw, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { organClient } from '../services/organClient';
import { CaptureSector, DrawingAnalysisResult, DrawingReviewDimension, VisionBoundingBox, VisionCameraMode } from '../types/vision';
import { useCameraLifecycle } from '../hooks/useCameraLifecycle';
import { useVisionLiveSession } from '../hooks/useVisionLiveSession';
import { VisionToolSelector } from './VisionToolSelector';
import { VisionStatusOverlay } from './VisionStatusOverlay';
import { VisionObjectOverlay } from './VisionObjectOverlay';
import { ObjectCaptureHud } from './ObjectCaptureHud';
import { DrawingReviewPanel } from './DrawingReviewPanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, mode: VisionCameraMode) => void;
  initialMode?: VisionCameraMode;
  onCaptureDatasetReady?: (capture: Record<string, unknown>) => void;
  onDrawingConfirmed?: (imageDataUrl: string, grounding: Record<string, unknown>) => void;
}

export const CameraHudView: React.FC<Props> = ({
  isOpen,
  onClose,
  onCapture,
  initialMode = 'auto',
  onCaptureDatasetReady,
  onDrawingConfirmed,
}) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<VisionCameraMode>(initialMode);
  const [flash, setFlash] = useState(false);
  const [manualRoi, setManualRoi] = useState<VisionBoundingBox | null>(null);
  const [captureSessionId, setCaptureSessionId] = useState<string | null>(null);
  const [drawingImage, setDrawingImage] = useState<string | null>(null);
  const [drawingAnalysis, setDrawingAnalysis] = useState<DrawingAnalysisResult | null>(null);
  const [drawingAnalyzing, setDrawingAnalyzing] = useState(false);
  const [showDrawingReview, setShowDrawingReview] = useState(false);

  const {
    state: cameraState,
    errorCode,
    errorMessage,
    videoRef,
    openCamera,
    closeCamera,
    retryCamera,
    switchFacingMode,
    captureFrame,
    captureAnalysisFrame,
  } = useCameraLifecycle({ idealFacingMode: 'environment' });

  const live = useVisionLiveSession({
    enabled: isOpen && cameraState === 'live',
    mode,
    captureAnalysisFrame,
  });

  useEffect(() => {
    if (!isOpen) {
      closeCamera();
      return;
    }
    setMode(initialMode);
    setManualRoi(null);
    setCaptureSessionId(null);
    setDrawingImage(null);
    setDrawingAnalysis(null);
    setShowDrawingReview(false);
    void openCamera();
  }, [closeCamera, initialMode, isOpen, openCamera]);

  if (!isOpen) return null;

  const errorDescription = () => {
    switch (errorCode) {
      case 'permission_denied': return t.cameraPermissionDenied;
      case 'not_found': return t.cameraNotFound;
      case 'in_use': return t.cameraInUse;
      case 'interrupted': return t.cameraInterrupted;
      case 'unsupported': return t.cameraUnsupported;
      default: return errorMessage || t.cameraUnknownError;
    }
  };

  const choosePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const image = String(reader.result || '');
        if (!image) return;
        if (mode === 'drawing') void analyzeDrawing(image);
        else { onCapture(image, mode); onClose(); }
      };
      reader.readAsDataURL(file);
    }, { once: true });
    input.click();
  };

  const analyzeDrawing = async (image: string) => {
    setDrawingImage(image);
    setDrawingAnalysis(null);
    setDrawingAnalyzing(true);
    setShowDrawingReview(true);
    try {
      const response = await organClient.drawingAnalyze({ imageDataUrl: image, filename: 'drawing.jpg' });
      setDrawingAnalysis((response?.analysis || null) as DrawingAnalysisResult | null);
    } finally {
      setDrawingAnalyzing(false);
    }
  };

  const handleShutter = async () => {
    if (cameraState !== 'live' || mode === 'capture') return;
    setFlash(true);
    try {
      const image = await captureFrame();
      if (!image) return;
      if (mode === 'drawing') await analyzeDrawing(image);
      else { onCapture(image, mode); onClose(); }
    } finally {
      window.setTimeout(() => setFlash(false), 260);
    }
  };

  const selectManualRoi = async (bbox: VisionBoundingBox) => {
    setManualRoi(bbox);
    if (live.sessionId) await organClient.visionObjectSelect({ sessionId: live.sessionId, bbox, locked: true });
  };

  const clearManualRoi = async () => {
    setManualRoi(null);
    if (live.sessionId) {
      // Clearing is represented locally; a future explicit server clear endpoint can replace this.
    }
  };

  const startCapture = async () => {
    const response = await organClient.visionCaptureStart({ objectLabel: 'target_object', targetSectorCount: 8 });
    const id = String(response?.capture?.capture_session_id || '');
    if (!id) return false;
    setCaptureSessionId(id);
    return true;
  };

  const captureSector = async (sector: CaptureSector, index: number) => {
    if (!captureSessionId) return { accepted: false, warnings: ['capture session unavailable'] };
    const image = await captureFrame();
    if (!image) return { accepted: false, warnings: ['camera frame unavailable'] };
    const response = await organClient.visionCaptureFrame({
      captureSessionId,
      sectorIndex: index,
      yawDeg: sector.yawDeg,
      pitchDeg: sector.pitchDeg,
      imageDataUrl: image,
    });
    return {
      accepted: Boolean(response?.accepted),
      warnings: (response?.frame?.quality?.warnings || []) as string[],
    };
  };

  const finishCapture = async () => {
    if (!captureSessionId) return { datasetReady: false, frameCount: 0 };
    const response = await organClient.visionCaptureFinish({ captureSessionId });
    const capture = (response?.capture || {}) as Record<string, unknown>;
    onCaptureDatasetReady?.(capture);
    const frames = Array.isArray(capture.frames) ? capture.frames.length : 0;
    return { datasetReady: Boolean(capture.dataset_ready), frameCount: frames };
  };

  const confirmDrawing = async (dims: DrawingReviewDimension[], targetCad: 'FreeCAD' | 'OpenSCAD') => {
    if (!drawingAnalysis?.drawingId || !drawingImage) return;
    const response = await organClient.drawingConfirm({
      drawingId: drawingAnalysis.drawingId,
      targetCad,
      dimensions: dims.map((dim) => ({ name: dim.name, nominalValue: dim.nominalValue, unit: dim.unit })),
    });
    const grounding = (response?.grounding || {}) as Record<string, unknown>;
    onDrawingConfirmed?.(drawingImage, grounding);
    onClose();
  };

  const candidate = live.analysis?.object || null;
  const guidance = live.analysis?.guidance;
  const scale = live.analysis?.scale;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none">
      <header className="relative z-40 h-12 bg-slate-950/95 border-b border-cyan-500/40 px-2 sm:px-3 flex items-center justify-between gap-2 shrink-0">
        <button onClick={onClose} className="p-2 sm:px-3 sm:py-1.5 bg-black/80 border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5" title={t.cameraBackToChat} aria-label={t.cameraBackToChat}>
          <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline text-[10px] font-mono font-bold">{t.cameraBackToChat}</span>
        </button>
        {!showDrawingReview ? <VisionToolSelector currentMode={mode} onSelectMode={(next) => { setMode(next); setManualRoi(null); }} disabled={cameraState !== 'live'} /> : <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300"><DraftingCompass className="w-4 h-4" />{t.drawingReviewHeader}</div>}
        <div className="flex items-center gap-1.5">
          {cameraState === 'live' && !showDrawingReview && <button onClick={() => void switchFacingMode()} className="p-2 text-cyan-300 border border-cyan-500/30" title={t.cameraSwitchFacingBtn}><RotateCw className="w-4 h-4" /></button>}
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400" aria-label={t.cameraBackToChat}><X className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden bg-slate-950">
        <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cameraState === 'live' ? 'opacity-100' : 'opacity-0'}`} />

        {cameraState === 'opening' && <div className="absolute inset-0 z-30 flex items-center justify-center gap-2 text-cyan-300 font-mono text-xs"><RefreshCw className="w-5 h-5 animate-spin" />{t.cameraOpening}</div>}
        {cameraState === 'error' && <div className="absolute inset-0 z-30 flex items-center justify-center p-5"><div className="w-full max-w-md bg-slate-950 border border-red-500/50 p-4 text-center font-mono"><AlertTriangle className="w-7 h-7 text-red-400 mx-auto" /><div className="mt-2 text-red-300 text-xs font-bold">{t.cameraError}</div><div className="mt-1 text-slate-300 text-[10px]">{errorDescription()}</div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => void retryCamera()} className="px-3 py-2 bg-cyan-500 text-black text-xs font-bold"><RefreshCw className="inline w-3 h-3 mr-1" />{t.cameraRetryBtn}</button><button onClick={choosePhoto} className="px-3 py-2 bg-slate-900 border border-slate-700 text-cyan-300 text-xs"><FolderOpen className="inline w-3 h-3 mr-1" />{t.cameraChoosePhotoBtn}</button></div></div></div>}

        {showDrawingReview && <div className="absolute inset-0 z-35 bg-slate-950 overflow-y-auto"><DrawingReviewPanel analysis={drawingAnalysis} isAnalyzing={drawingAnalyzing} onConfirmDimensions={confirmDrawing} onDiscard={() => setShowDrawingReview(false)} onBackToChat={onClose} /></div>}

        {!showDrawingReview && cameraState === 'live' && (
          <>
            {(mode === 'auto' || mode === 'measure') && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {guidance && <div className="absolute top-3 left-1/2 -translate-x-1/2"><VisionStatusOverlay guidanceState={guidance} confidence={scale?.confidence} scaleProvider={scale?.provider} markerId={scale?.marker_id} /></div>}
                <VisionObjectOverlay candidate={candidate} manualRoi={manualRoi} onManualSelect={selectManualRoi} onClear={clearManualRoi} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-64 h-64 border border-cyan-400/25 relative"><div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/20" /><div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/20" /></div></div>
                {live.error && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 border border-amber-500/40 text-amber-300 text-[9px] font-mono">LIVE VISION: {live.error}</div>}
              </div>
            )}

            {mode === 'capture' && <ObjectCaptureHud onStartCapture={startCapture} onCaptureSector={captureSector} onFinishCapture={finishCapture} />}

            {mode !== 'capture' && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-auto">
                <button onClick={() => void handleShutter()} disabled={cameraState !== 'live'} className="w-18 h-18 rounded-full border-2 border-cyan-400 flex items-center justify-center disabled:opacity-40"><div className="w-13 h-13 bg-cyan-400 flex items-center justify-center"><Camera className="w-6 h-6 text-black" /></div></button>
                <span className="px-2 py-0.5 bg-black/80 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono">{t.cameraShutterLabel}</span>
              </div>
            )}
          </>
        )}
      </div>
      {flash && <div className="absolute inset-0 z-50 bg-cyan-100/90 pointer-events-none" />}
    </div>
  );
};
