import React, { useState, useEffect } from 'react';
import {
  Camera,
  X,
  ArrowLeft,
  RotateCw,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  DraftingCompass,
} from 'lucide-react';
import { VisionCameraMode } from '../types/vision';
import { useCameraLifecycle } from '../hooks/useCameraLifecycle';
import { VisionToolSelector } from './VisionToolSelector';
import { VisionStatusOverlay, BackendGuidanceState } from './VisionStatusOverlay';
import { VisionObjectOverlay } from './VisionObjectOverlay';
import { ObjectCaptureHud } from './ObjectCaptureHud';
import { DrawingReviewPanel } from './DrawingReviewPanel';
import { useI18n } from '../i18n';

interface CameraHudViewProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, mode: VisionCameraMode) => void;
  initialMode?: VisionCameraMode;
}

export const CameraHudView: React.FC<CameraHudViewProps> = ({
  isOpen,
  onClose,
  onCapture,
  initialMode = 'auto',
}) => {
  const { t } = useI18n();
  const [currentMode, setCurrentMode] = useState<VisionCameraMode>(initialMode);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [guidanceState, setGuidanceState] = useState<BackendGuidanceState>('SEARCHING_FOR_SCALE');
  const [showDrawingReview, setShowDrawingReview] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

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
  } = useCameraLifecycle({
    idealFacingMode: 'environment',
  });

  // Open camera on modal open; close on modal close
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode);
      setShowDrawingReview(false);
      setLastCapturedImage(null);
      void openCamera();
    } else {
      closeCamera();
    }
  }, [isOpen, initialMode, openCamera, closeCamera]);

  if (!isOpen) return null;

  const handleCapture = async () => {
    if (cameraState !== 'live') return;

    setIsCapturingFlash(true);
    const dataUrl = await captureFrame();
    setTimeout(() => setIsCapturingFlash(false), 300);

    if (dataUrl) {
      if (currentMode === 'drawing') {
        setLastCapturedImage(dataUrl);
        setShowDrawingReview(true);
      } else {
        onCapture(dataUrl, currentMode);
        onClose();
      }
    }
  };

  const handleChoosePhotoFallback = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result || '');
          if (url) {
            if (currentMode === 'drawing') {
              setLastCapturedImage(url);
              setShowDrawingReview(true);
            } else {
              onCapture(url, currentMode);
              onClose();
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
    input.click();
  };

  const getErrorDescription = () => {
    switch (errorCode) {
      case 'permission_denied':
        return t.cameraPermissionDenied;
      case 'not_found':
        return t.cameraNotFound;
      case 'in_use':
        return t.cameraInUse;
      case 'interrupted':
        return t.cameraInterrupted;
      case 'unsupported':
        return t.cameraUnsupported;
      default:
        return errorMessage || t.cameraUnknownError;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none">
      {/* Top HUD Navigation Bar - Always visible across ALL camera modes, states, and panels */}
      <header className="relative z-40 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/40 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.8)] pointer-events-auto">
        {/* Left: Prominent Back to Chat Button */}
        <div className="flex items-center gap-2">
          <button
            id="camera-back-btn"
            data-testid="camera-back-btn"
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/90 hover:bg-cyan-900/90 border-2 border-cyan-400 hover:border-cyan-300 text-cyan-300 hover:text-white clip-faceted-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)] group active:scale-95"
            title={t.cameraBackToChat}
            aria-label={`${t.cameraBackToChat} / Back to chat`}
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-mono text-xs font-bold tracking-wider">{t.cameraBackToChat}</span>
          </button>
          {/* Alias hidden trigger for legacy or alternate id queries */}
          <button
            id="camera-back-to-chat-btn"
            onClick={onClose}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />

          {cameraState === 'live' && !showDrawingReview && (
            <button
              onClick={() => void switchFacingMode()}
              className="p-1.5 bg-black/85 border border-cyan-500/40 text-cyan-300 hover:text-white clip-faceted-sm transition-colors cursor-pointer"
              title={t.cameraSwitchFacingBtn}
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center: Mode Selector or Review Title */}
        {!showDrawingReview ? (
          <VisionToolSelector
            currentMode={currentMode}
            onSelectMode={(mode) => setCurrentMode(mode)}
            disabled={cameraState !== 'live'}
          />
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
            <DraftingCompass className="w-4 h-4 text-cyan-400" />
            <span>{t.drawingReviewHeader}</span>
          </div>
        )}

        {/* Right: Telemetry & Close */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-cyan-300 bg-black/85 px-2.5 py-1 border border-cyan-500/40 clip-faceted-sm">
            <span className={`w-2 h-2 rounded-full ${cameraState === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{cameraState === 'live' ? t.cameraSensorReady : cameraState.toUpperCase()}</span>
          </div>

          <button
            id="camera-close-icon-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/40 clip-faceted-sm transition-colors cursor-pointer"
            title={t.cameraBackToChat}
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <div className="relative flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Raw Optical Video Viewport (Background) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-slate-950">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraState === 'live' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Camera Opening State */}
          {cameraState === 'opening' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-cyan-400 font-mono z-10">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="text-xs font-semibold tracking-wider bg-black/80 px-3 py-1 border border-cyan-500/40 clip-faceted-sm">
                {t.cameraOpening}
              </div>
              <button
                id="camera-opening-back-to-chat-btn"
                onClick={onClose}
                className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-black/90 hover:bg-cyan-950 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono clip-faceted-sm transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.cameraBackToChat}</span>
              </button>
            </div>
          )}

          {/* Camera Error / Permission Denied State */}
          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-slate-100 font-mono max-w-md mx-auto text-center z-10">
              <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-red-400 tracking-wider">
                  {t.cameraError}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {getErrorDescription()}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
                <button
                  onClick={() => retryCamera()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold clip-faceted-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.cameraRetryBtn}</span>
                </button>

                <button
                  onClick={handleChoosePhotoFallback}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-bold clip-faceted-sm transition-all cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{t.cameraChoosePhotoBtn}</span>
                </button>
              </div>

              <button
                id="camera-error-back-to-chat-btn"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 hover:bg-cyan-950 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold clip-faceted-sm transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.cameraBackToChat}</span>
              </button>
            </div>
          )}

          {/* Scanlines Effect */}
          {cameraState === 'live' && (
            <div className="scanlines-overlay absolute inset-0 z-10 pointer-events-none opacity-40" />
          )}
        </div>

        {/* 2. Mode Overlay: Drawing Review Panel */}
        {showDrawingReview && (
          <div className="relative z-30 flex-1 overflow-y-auto bg-slate-950">
            <DrawingReviewPanel
              initialImageUrl={lastCapturedImage || undefined}
              onConfirmDimensions={(dims, targetCad) => {
                if (lastCapturedImage) {
                  onCapture(lastCapturedImage, 'drawing');
                }
                onClose();
              }}
              onDiscard={() => setShowDrawingReview(false)}
              onBackToChat={onClose}
            />
          </div>
        )}

        {/* 3. Interactive HUD Overlays (Display only, never burned into image) */}
        {!showDrawingReview && (
          <div className="relative z-20 flex-1 flex flex-col justify-between p-3 sm:p-5 pointer-events-none">
            {/* Center Mode Content */}
            <div className="relative flex-1 flex flex-col items-center justify-center my-2 pointer-events-none">
              {/* Object Capture Mode Shell */}
              {currentMode === 'capture' && (
                <ObjectCaptureHud
                  onCaptureAngleSnapshot={handleCapture}
                  onFinishReconstructionSequence={(count) => {
                    void handleCapture();
                  }}
                />
              )}

              {/* Measure / Auto / Drawing Viewfinder */}
              {currentMode !== 'capture' && cameraState === 'live' && (
                <>
                  {/* Status Guidance Overlay */}
                  <div className="absolute top-2">
                    <VisionStatusOverlay
                      guidanceState={guidanceState}
                      scaleProvider="aruco"
                    />
                  </div>

                  {/* Interactive Object Bounding Box / Tap-to-select overlay */}
                  <VisionObjectOverlay
                    onLockChange={(locked, bbox) => {
                      setGuidanceState(locked ? 'OBJECT_LOCKED' : bbox ? 'OBJECT_CANDIDATE' : 'SEARCHING_FOR_OBJECT');
                    }}
                  />

                  {/* Central Targeting Reticle */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 border border-cyan-400/30 rounded-full flex items-center justify-center pointer-events-none">
                    {/* Corner Framing Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

                    {/* Reticle Lines */}
                    <div className="absolute inset-x-0 h-px bg-cyan-400/30" />
                    <div className="absolute inset-y-0 w-px bg-cyan-400/30" />

                    {/* Center Target Dot */}
                    <div className="w-2.5 h-2.5 bg-cyan-400 clip-faceted-sm shadow-[0_0_10px_#00f0ff]" />
                  </div>
                </>
              )}
            </div>

            {/* Bottom Shutter Controls (Hidden in Object Capture mode because it provides its own step button) */}
            {currentMode !== 'capture' && (
              <div className="flex flex-col items-center pb-2 pointer-events-auto">
                <button
                  id="camera-shutter-btn"
                  onClick={handleCapture}
                  disabled={cameraState !== 'live'}
                  className="group relative flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t.cameraShutterLabel}
                >
                  <div className="w-18 h-18 rounded-full border-2 border-cyan-400 flex items-center justify-center group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-shadow">
                    <div className="w-13 h-13 bg-cyan-400 clip-faceted-sm flex items-center justify-center group-hover:bg-cyan-300 transition-colors">
                      <Camera className="w-6 h-6 text-black" />
                    </div>
                  </div>
                </button>

                <span className="font-mono text-[11px] font-bold text-cyan-300 tracking-[0.15em] mt-2 bg-black/85 px-3 py-0.5 border border-cyan-500/30 clip-faceted-sm">
                  {cameraState !== 'live'
                    ? t.cameraUnavailablePrompt
                    : isCapturingFlash
                    ? t.cameraShutterCapturing
                    : t.cameraShutterLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shutter Flash Effect */}
      {isCapturingFlash && (
        <div className="absolute inset-0 bg-cyan-200 z-50 animate-out fade-out duration-300 pointer-events-none" />
      )}
    </div>
  );
};
