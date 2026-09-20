import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraLifecycleState, CameraErrorCode } from '../types/vision';

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
  captureFrame: () => Promise<string | null>;
}

export function useCameraLifecycle(options: UseCameraLifecycleOptions = {}): UseCameraLifecycleReturn {
  const [state, setState] = useState<CameraLifecycleState>('idle');
  const [errorCode, setErrorCode] = useState<CameraErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    options.idealFacingMode || 'environment'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const requestGenRef = useRef<number>(0);
  const isOpeningRef = useRef<boolean>(false);

  // Helper to safely stop all active tracks and detach video
  const cleanupStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      activeStreamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // Ignore
      }
    }
  }, []);

  const closeCamera = useCallback(() => {
    requestGenRef.current += 1;
    isOpeningRef.current = false;
    setState('closing');
    cleanupStream();
    setErrorCode(null);
    setErrorMessage(null);
    setState('idle');
  }, [cleanupStream]);

  const openCameraWithFacing = useCallback(
    async (targetFacing: 'environment' | 'user') => {
      // If already opening, avoid duplicate getUserMedia calls
      if (isOpeningRef.current) return;

      const currentGen = ++requestGenRef.current;
      isOpeningRef.current = true;

      // Clean up any existing stream before starting a new one
      cleanupStream();

      setState('opening');
      setErrorCode(null);
      setErrorMessage(null);

      // Check browser WebRTC support
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        if (currentGen === requestGenRef.current) {
          isOpeningRef.current = false;
          setErrorCode('unsupported');
          setErrorMessage('navigator.mediaDevices.getUserMedia is unavailable in this environment.');
          setState('error');
        }
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Check if a newer request was made while waiting for getUserMedia
        if (currentGen !== requestGenRef.current) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStreamRef.current = mediaStream;

        // Monitor stream interruption
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            if (currentGen === requestGenRef.current) {
              setErrorCode('interrupted');
              setErrorMessage('Camera track ended or was unplugged.');
              setState('error');
            }
          };
        }

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            // Autoplay could be deferred; listen for loadedmetadata
          }
        }

        isOpeningRef.current = false;
        setState('live');
      } catch (err: any) {
        if (currentGen !== requestGenRef.current) return;
        isOpeningRef.current = false;

        const errorName = err?.name || '';
        let code: CameraErrorCode = 'unknown';

        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
          code = 'permission_denied';
        } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
          code = 'not_found';
        } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
          code = 'in_use';
        } else if (errorName === 'OverconstrainedError') {
          // If overconstrained on ideal facingMode, try fallback without constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (currentGen === requestGenRef.current) {
              activeStreamRef.current = fallbackStream;
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                await videoRef.current.play().catch(() => {});
              }
              setState('live');
              return;
            } else {
              fallbackStream.getTracks().forEach((t) => t.stop());
              return;
            }
          } catch {
            code = 'not_found';
          }
        }

        setErrorCode(code);
        setErrorMessage(err?.message || 'Failed to open camera');
        setState('error');
      }
    },
    [cleanupStream]
  );

  const openCamera = useCallback(() => {
    return openCameraWithFacing(facingMode);
  }, [openCameraWithFacing, facingMode]);

  const retryCamera = useCallback(() => {
    closeCamera();
    return openCameraWithFacing(facingMode);
  }, [closeCamera, openCameraWithFacing, facingMode]);

  const switchFacingMode = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    closeCamera();
    await openCameraWithFacing(nextFacing);
  }, [facingMode, closeCamera, openCameraWithFacing]);

  // Capture frame at native resolution without burning any HUD graphics into image
  const captureFrame = useCallback(async (): Promise<string | null> => {
    const video = videoRef.current;
    if (!video || state !== 'live' || video.readyState < 2) {
      return null;
    }

    setState('capturing');

    try {
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setState('live');
        return null;
      }

      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      if (options.onFrameCaptured) {
        options.onFrameCaptured(dataUrl);
      }

      setState('live');
      return dataUrl;
    } catch {
      setState('live');
      return null;
    }
  }, [state, options]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      requestGenRef.current += 1;
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    state,
    errorCode,
    errorMessage,
    videoRef,
    facingMode,
    openCamera,
    closeCamera,
    retryCamera,
    switchFacingMode,
    captureFrame,
  };
}
