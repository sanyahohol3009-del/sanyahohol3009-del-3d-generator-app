import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraErrorCode, CameraLifecycleState } from '../types/vision';

export interface CaptureFrameOptions {
  maxWidth?: number;
  quality?: number;
  affectState?: boolean;
}

export interface UseCameraLifecycleOptions {
  idealFacingMode?: 'environment' | 'user';
  onFrameCaptured?: (dataUrl: string) => void;
}

export interface UseCameraLifecycleReturn {
  state: CameraLifecycleState;
  errorCode: CameraErrorCode | null;
  errorMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  facingMode: 'environment' | 'user';
  openCamera: () => Promise<void>;
  closeCamera: () => void;
  retryCamera: () => Promise<void>;
  switchFacingMode: () => Promise<void>;
  captureFrame: (options?: CaptureFrameOptions) => Promise<string | null>;
  captureAnalysisFrame: () => Promise<string | null>;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function useCameraLifecycle(options: UseCameraLifecycleOptions = {}): UseCameraLifecycleReturn {
  const [state, setState] = useState<CameraLifecycleState>('idle');
  const [errorCode, setErrorCode] = useState<CameraErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(options.idealFacingMode || 'environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generationRef = useRef(0);
  const openingRef = useRef(false);

  const cleanupStream = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      for (const track of stream.getTracks()) {
        try { track.stop(); } catch { /* best effort */ }
      }
    }
    const video = videoRef.current;
    if (video) {
      try { video.pause(); } catch { /* best effort */ }
      try { video.srcObject = null; } catch { /* best effort */ }
    }
  }, []);

  const closeCamera = useCallback(() => {
    generationRef.current += 1;
    openingRef.current = false;
    setState('closing');
    cleanupStream();
    setErrorCode(null);
    setErrorMessage(null);
    setState('idle');
  }, [cleanupStream]);

  const waitForVideoElement = useCallback(async (generation: number) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (generation !== generationRef.current) return null;
      if (videoRef.current) return videoRef.current;
      await sleep(25);
    }
    return null;
  }, []);

  const waitForPlayable = useCallback(async (video: HTMLVideoElement, generation: number) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata', ready);
        video.removeEventListener('canplay', ready);
        if (error) reject(error); else resolve();
      };
      const ready = () => {
        if (generation !== generationRef.current) {
          finish(new Error('stale camera request'));
          return;
        }
        if (video.videoWidth > 0 && video.videoHeight > 0) finish();
      };
      const timer = window.setTimeout(() => finish(new Error('camera video readiness timeout')), 4500);
      video.addEventListener('loadedmetadata', ready);
      video.addEventListener('canplay', ready);
      ready();
    });
  }, []);

  const classifyError = (error: unknown): { code: CameraErrorCode; message: string } => {
    const value = error as { name?: string; message?: string };
    const name = value?.name || '';
    let code: CameraErrorCode = 'unknown';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') code = 'permission_denied';
    else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') code = 'not_found';
    else if (name === 'NotReadableError' || name === 'TrackStartError') code = 'in_use';
    else if (name === 'AbortError') code = 'interrupted';
    else if (name === 'NotSupportedError') code = 'unsupported';
    return { code, message: value?.message || 'Failed to open camera' };
  };

  const openCameraWithFacing = useCallback(async (targetFacing: 'environment' | 'user') => {
    if (openingRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorCode('unsupported');
      setErrorMessage('navigator.mediaDevices.getUserMedia is unavailable');
      setState('error');
      return;
    }

    const generation = ++generationRef.current;
    openingRef.current = true;
    cleanupStream();
    setState('opening');
    setErrorCode(null);
    setErrorMessage(null);

    let stream: MediaStream | null = null;
    try {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (error) {
        const named = error as { name?: string };
        if (named?.name !== 'OverconstrainedError') throw error;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (generation !== generationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          if (generation === generationRef.current) {
            setErrorCode('interrupted');
            setErrorMessage('Camera stream ended unexpectedly');
            setState('error');
          }
        };
      }

      const video = await waitForVideoElement(generation);
      if (!video || generation !== generationRef.current) {
        stream.getTracks().forEach((item) => item.stop());
        return;
      }

      video.srcObject = stream;
      await waitForPlayable(video, generation);
      if (generation !== generationRef.current) return;
      await video.play();
      await waitForPlayable(video, generation);
      if (generation !== generationRef.current) return;

      openingRef.current = false;
      setState('live');
    } catch (error) {
      if (generation !== generationRef.current) return;
      if (stream) stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      openingRef.current = false;
      const classified = classifyError(error);
      setErrorCode(classified.code);
      setErrorMessage(classified.message);
      setState('error');
    }
  }, [cleanupStream, waitForPlayable, waitForVideoElement]);

  const openCamera = useCallback(() => openCameraWithFacing(facingMode), [facingMode, openCameraWithFacing]);

  const retryCamera = useCallback(async () => {
    closeCamera();
    await sleep(80);
    await openCameraWithFacing(facingMode);
  }, [closeCamera, facingMode, openCameraWithFacing]);

  const switchFacingMode = useCallback(async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    closeCamera();
    await sleep(80);
    await openCameraWithFacing(next);
  }, [closeCamera, facingMode, openCameraWithFacing]);

  const captureFrame = useCallback(async (captureOptions: CaptureFrameOptions = {}) => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0 || video.videoHeight <= 0) return null;
    const affectState = captureOptions.affectState !== false;
    if (affectState) setState('capturing');
    try {
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      const maxWidth = captureOptions.maxWidth && captureOptions.maxWidth > 0 ? captureOptions.maxWidth : sourceWidth;
      const scale = Math.min(1, maxWidth / sourceWidth);
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', captureOptions.quality ?? 0.92);
      options.onFrameCaptured?.(dataUrl);
      return dataUrl;
    } finally {
      if (affectState && streamRef.current) setState('live');
    }
  }, [options.onFrameCaptured]);

  const captureAnalysisFrame = useCallback(
    () => captureFrame({ maxWidth: 640, quality: 0.62, affectState: false }),
    [captureFrame],
  );

  useEffect(() => () => {
    generationRef.current += 1;
    cleanupStream();
  }, [cleanupStream]);

  return {
    state, errorCode, errorMessage, videoRef, facingMode,
    openCamera, closeCamera, retryCamera, switchFacingMode,
    captureFrame, captureAnalysisFrame,
  };
}
