import React, { useRef, useEffect, useState } from 'react';
import { Camera, ArrowLeft, RefreshCw, Crosshair, Sparkles, Shield, Compass } from 'lucide-react';

interface CameraHudViewProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraHudView: React.FC<CameraHudViewProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [simulatedMeshAngle, setSimulatedMeshAngle] = useState(0);

  // Initialize camera or fallback
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          if (!isMounted) {
            mediaStream.getTracks().forEach((t) => t.stop());
            return;
          }
          setStream(mediaStream);
          setUseRealCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.log('Webcam access optional or denied in sandbox; utilizing HUD simulation matrix:', err);
        setUseRealCamera(false);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Simulated scan animation if real camera not available
  useEffect(() => {
    if (!isOpen || useRealCamera) return;
    const interval = setInterval(() => {
      setSimulatedMeshAngle((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen, useRealCamera]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (
      isCapturing
      || !useRealCamera
      || !videoRef.current
    ) {
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Camera canvas is unavailable');
      }

      // Raw pixels only: display HUD graphics are never burned into CV evidence.
      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const dataUrl = canvas.toDataURL(
        'image/jpeg',
        0.92,
      );

      onCapture(dataUrl);
      onClose();
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Camera Viewfinder or Simulated HUD Matrix */}
      <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center text-cyan-400">
            {/* Holographic Wireframe Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0d_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0d_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Rotating Monolith Object Simulation */}
            <div 
              className="relative w-48 h-48 border-2 border-cyan-400/50 clip-faceted-sm flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-transform"
              style={{ transform: `rotate(${simulatedMeshAngle * 0.5}deg)` }}
            >
              <div 
                className="w-32 h-32 border border-sky-400/60 clip-faceted-corner flex items-center justify-center"
                style={{ transform: `rotate(-${simulatedMeshAngle}deg)` }}
              >
                <div className="w-16 h-16 border border-cyan-300 bg-cyan-950/40 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyan-300 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-8 text-center font-mono z-10 px-4">
              <div className="text-sm font-bold tracking-[0.2em] text-cyan-300 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                OPTICAL SENSOR MATRIX // ARUCO 50 MM READY
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Target subject for 3D point-cloud extraction and neural mesh reconstruction
              </p>
            </div>
          </div>
        )}

        {/* Scanline Sweep Effect */}
        <div className="scanlines-overlay absolute inset-0 z-10" />

        {/* Horizontal Laser Scanning Beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 animate-bounce z-15 pointer-events-none" />
      </div>

      {/* 2. Custom HUD Overlay (Crosshairs, Brackets & Telemetry) */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/90 border border-cyan-500/70 text-cyan-400 clip-faceted-sm hover:bg-cyan-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-xs font-semibold">EXIT HUD</span>
          </button>

          <div className="flex items-center gap-3 font-mono text-[11px] text-cyan-300 bg-black/80 px-3 py-1.5 border border-cyan-500/40 clip-faceted-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SENSORS: LOCK
            </span>
            <span>•</span>
            <span>FOV 84°</span>
            <span>•</span>
            <span>60 FPS</span>
          </div>
        </div>

        {/* Center Crosshairs & Targeting Brackets */}
        <div className="relative flex items-center justify-center pointer-events-none">
          {/* Outer Crosshair Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 border border-cyan-400/30 rounded-full flex items-center justify-center">
            {/* Inner Ring */}
            <div className="w-36 h-36 border border-dashed border-cyan-400/50 rounded-full flex items-center justify-center" />

            {/* Corner Framing Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

            {/* Reticle Lines */}
            <div className="absolute inset-x-0 h-px bg-cyan-400/30" />
            <div className="absolute inset-y-0 w-px bg-cyan-400/30" />

            {/* Center Target Dot */}
            <div className="w-3 h-3 bg-cyan-400 clip-faceted-sm shadow-[0_0_10px_#00f0ff]" />
          </div>

          {/* Telemetry Labels around Crosshairs */}
          <div className="absolute top-2 font-mono text-[10px] text-cyan-300/80 tracking-widest bg-black/70 px-2 py-0.5 border border-cyan-500/20">
            PITCH: +14.2° // YAW: -03.8°
          </div>
        </div>

        {/* Bottom Shutter Controls */}
        <div className="flex flex-col items-center pb-2 pointer-events-auto">
          <button
            onClick={handleCapture}
            disabled={isCapturing || !useRealCamera}
            className="group relative flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-95"
          >
            {/* Outer ring */}
            <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-shadow">
              {/* Inner Faceted Shutter Button */}
              <div className="w-14 h-14 bg-cyan-400 clip-faceted-sm flex items-center justify-center group-hover:bg-cyan-300 transition-colors">
                <Camera className="w-7 h-7 text-black" />
              </div>
            </div>
          </button>

          <span className="font-mono text-xs font-bold text-cyan-300 tracking-[0.2em] mt-2 bg-black/80 px-3 py-0.5 border border-cyan-500/30 clip-faceted-sm">
            {!useRealCamera ? 'CAMERA UNAVAILABLE · USE + PHOTO' : isCapturing ? 'CAPTURING VISION FRAME...' : 'CAPTURE FOR GOLEM VISION'}
          </span>
        </div>
      </div>

      {/* Shutter Flash effect */}
      {isCapturing && (
        <div className="absolute inset-0 bg-cyan-200 z-50 animate-out fade-out duration-300 pointer-events-none" />
      )}
    </div>
  );
};
