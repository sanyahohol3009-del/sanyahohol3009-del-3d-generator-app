import { useEffect, useRef, useState } from 'react';
import { organClient } from '../services/organClient';
import { VisionCameraMode, VisionObjectLock, VisionScaleResult } from '../types/vision';
import { BackendGuidanceState } from '../components/VisionStatusOverlay';

export interface LiveVisionAnalysis {
  guidance?: BackendGuidanceState;
  scale?: VisionScaleResult & { marker_id?: number; status?: string };
  object?: VisionObjectLock & { source?: string; bbox_normalized?: { x: number; y: number; width: number; height: number } };
  manual_roi?: { bbox: { x: number; y: number; width: number; height: number }; locked: boolean };
}

interface Options {
  enabled: boolean;
  mode: VisionCameraMode;
  captureAnalysisFrame: () => Promise<string | null>;
}

export function useVisionLiveSession({ enabled, mode, captureAnalysisFrame }: Options) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LiveVisionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!enabled || (mode !== 'auto' && mode !== 'measure')) {
      setSessionId(null);
      setAnalysis(null);
      setError(null);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const start = async () => {
      try {
        const response = await organClient.visionSessionStart({ mode, scaleProvider: 'auto' });
        if (cancelled) return;
        const id = String(response?.session?.session_id || '');
        if (!id) throw new Error('Vision session did not return session_id');
        setSessionId(id);

        const tick = async () => {
          if (cancelled || busyRef.current) return;
          busyRef.current = true;
          try {
            const frame = await captureAnalysisFrame();
            if (!frame || cancelled) return;
            const result = await organClient.visionSessionFrame({ sessionId: id, imageDataUrl: frame });
            if (!cancelled) {
              setAnalysis((result?.analysis || null) as LiveVisionAnalysis | null);
              setError(null);
            }
          } catch (cause) {
            if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
          } finally {
            busyRef.current = false;
          }
        };

        await tick();
        timer = window.setInterval(() => void tick(), 750);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      }
    };

    void start();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearInterval(timer);
      busyRef.current = false;
    };
  }, [captureAnalysisFrame, enabled, mode]);

  return { sessionId, analysis, error };
}
