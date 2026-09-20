import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Send, 
  X, 
  Smartphone, 
  Code2, 
  Columns2, 
  Sparkles, 
  Activity, 
  SlidersHorizontal,
  Volume2,
  Terminal,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { FolderKanban } from 'lucide-react';
import { ChatMessage, AppLanguage, SynthesisHistoryItem, VisionMeasurement } from './types';
import { GolemDrawer } from './components/GolemDrawer';
import { ChatBubble } from './components/ChatBubble';
import { ActionBottomSheet } from './components/ActionBottomSheet';
import { CameraHudView } from './components/CameraHudView';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { GolemHoloLogo } from './components/GolemHoloLogo';
import { VramComputeGauge, SynthesisStageType } from './components/VramComputeGauge';
import { SynthesisComparator } from './components/SynthesisComparator';
import { ProjectBrowser } from './components/ProjectBrowser';
import { organClient, pickArtifact, OrganResult } from './services/organClient';


import { voiceClient } from './services/voiceClient';
async function pickLocalFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', () => resolve(input.files?.[0] || null), { once: true });
    input.addEventListener('cancel', () => resolve(null), { once: true });
    input.click();
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function runAudioDiagnostic(show: (message: string) => void) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 432;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.22);
    oscillator.onended = () => void context.close();
    show('Audio diagnostic: real 432 Hz test tone emitted.');
  } catch {
    show('Audio diagnostic is unavailable on this platform.');
  }
}

function jobProgress(state: string) {
  switch (state) {
    case 'queued':
      return {
        progress: 8,
        stage: 'ingestion' as const,
        status: 'Queued for 3D/CAD Organ...',
        detail: 'Request validated and persisted.',
      };
    case 'accepted':
      return {
        progress: 18,
        stage: 'ingestion' as const,
        status: 'Accepted by 3D/CAD Organ...',
        detail: 'Selecting bounded provider path.',
      };
    case 'running':
      return {
        progress: 68,
        stage: 'mesh_synthesis' as const,
        status: 'Real provider executing geometry job...',
        detail: 'Blender / FreeCAD / OpenSCAD is running.',
      };
    case 'verifying':
      return {
        progress: 90,
        stage: 'mesh_synthesis' as const,
        status: 'Verifying generated artifacts...',
        detail: 'Checking file format, hashes and effect metadata.',
      };
    default:
      return {
        progress: 45,
        stage: 'mesh_synthesis' as const,
        status: `Runtime state: ${state}`,
        detail: '3D/CAD Organ active.',
      };
  }
}

function formatArtifactSize(bytes: number): string {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1048576) return `${(value / 1024).toFixed(2)} KB`;
  return `${(value / 1048576).toFixed(2)} MB`;
}

function modelFromResult(result: OrganResult, fallbackName: string) {
  const receipt = result.receipt;
  if (!receipt) {
    throw new Error(
      result.error_details || result.error_code || 'Missing execution receipt',
    );
  }

  const artifacts = receipt.evidence.artifact_evidence || [];
  const glb = pickArtifact(result, 'glb');
  const preferred =
    glb ||
    pickArtifact(result, 'step') ||
    pickArtifact(result, 'stl') ||
    pickArtifact(result, 'blend') ||
    artifacts[0];

  const metadata = receipt.evidence.effect_verification?.metadata || {};
  const bbox = metadata.bbox;
  const dimensions =
    bbox && typeof bbox === 'object'
      ? `${Number(bbox.x || 0).toFixed(2)} × ${Number(bbox.y || 0).toFixed(2)} × ${Number(bbox.z || 0).toFixed(2)}`
      : 'provider verified';

  const elapsed = Math.max(
    0,
    receipt.end_timestamp - receipt.start_timestamp,
  );

  return {
    details: {
      name: fallbackName,
      vertices: Number(metadata.vertices || 0),
      polygons: Number(metadata.polygons || 0),
      format: artifacts.map((a) => a.format.toUpperCase()).join(' / ') || 'VERIFIED',
      renderTime: `${elapsed.toFixed(2)}s real`,
      fileSize: preferred
        ? formatArtifactSize(preferred.size)
        : undefined,
      textureComplexity:
        receipt.provider_id === 'blender'
          ? 'Blender geometry pipeline'
          : 'Parametric CAD solid',
      meshDensity:
        receipt.provider_id === 'blender'
          ? 'verified mesh'
          : 'verified parametric solid',
      dimensions,
      uvChannels: 0,
      drawCalls: 0,
      materialCount: receipt.provider_id === 'blender' ? 1 : 0,
      dracoCompression: 'not applied',
      characterName: typeof metadata.character_name === 'string' ? metadata.character_name : undefined,
      species: typeof metadata.species === 'string' ? metadata.species : undefined,
      profileId: typeof metadata.profile_id === 'string' ? metadata.profile_id : undefined,
      variantOf: typeof metadata.variant_of === 'string' ? metadata.variant_of : undefined,
      modifiers: Array.isArray(metadata.modifiers) ? metadata.modifiers.map(String) : undefined,
      modularParts: Number(metadata.modular_part_count || 0) || undefined,
      tailSegments: Number(metadata.tail_segment_count || 0) || undefined,
      backSpines: Number(metadata.back_spine_count || 0) || undefined,
      rigPresent: typeof metadata.rig_present === 'boolean' ? metadata.rig_present : undefined,
    },
    asset: {
      jobId: result.job_id,
      provider: receipt.provider_id,
      glbUrl: glb
        ? organClient.artifactUrl(result.job_id, glb.path)
        : undefined,
      downloadUrl: preferred
        ? organClient.artifactUrl(result.job_id, preferred.path)
        : undefined,
      sha256: preferred?.sha256,
      effectStatus: receipt.effect_status,
    },
  };
}


export default function App() {
  // Navigation / View layout
  const [viewMode, setViewMode] = useState<'split' | 'app' | 'code'>('split');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isProjectBrowserOpen, setIsProjectBrowserOpen] = useState(false);
  const [comparatorModelAId, setComparatorModelAId] = useState<string | undefined>(undefined);
  const [comparatorModelBId, setComparatorModelBId] = useState<string | undefined>(undefined);
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('en');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState<number>(0);
  const [synthesisStage, setSynthesisStage] = useState<SynthesisStageType>('idle');
  const synthesisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup synthesis interval on unmount
  useEffect(() => {
    return () => {
      if (synthesisIntervalRef.current) {
        clearInterval(synthesisIntervalRef.current);
      }
    };
  }, []);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'boot',
      sender: 'golem',
      text: 'GOLEM UI initialized. Configure the 3D/CAD Compute Node in the drawer, then send a real mesh or CAD request.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [promptText, setPromptText] = useState('');
  const [attachedThumbnail, setAttachedThumbnail] = useState<string | null>(null);
  const [attachedVision, setAttachedVision] = useState<VisionMeasurement | null>(null);
  const [visionState, setVisionState] = useState<'idle' | 'analyzing' | 'measured' | 'reference'>('idle');
  const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, attachedThumbnail]);

  // SnackBar helper
  const showSnackBar = (msg: string) => {
    setSnackBarMessage(msg);
    setTimeout(() => {
      setSnackBarMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Extract all 3D synthesized models for Synthesis History (most recent first)
  const historyItems: SynthesisHistoryItem[] = messages
    .filter((m) => m.is3DModel && m.modelDetails)
    .map((m) => ({
      id: `hist-${m.id}`,
      messageId: m.id,
      modelName: m.modelDetails!.name,
      timestamp: m.timestamp,
      promptSnippet: m.text,
      modelDetails: m.modelDetails!,
      modelAsset: m.modelAsset,
    }))
    .reverse();

  const handleReaccessModel = (item: SynthesisHistoryItem) => {
    setIsDrawerOpen(false);
    showSnackBar(`Re-accessed 3D model: ${item.modelName}`);

    setTimeout(() => {
      const el = document.getElementById(`chat-msg-${item.messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-cyan-400', 'bg-cyan-950/40', 'rounded-xs');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-950/40', 'rounded-xs');
        }, 2200);
      }
    }, 300);
  };

  const handleOpenComparator = (initialModelId?: string) => {
    if (initialModelId) {
      const matched = historyItems.find(
        (i) => i.id === initialModelId || i.messageId === initialModelId
      );
      if (matched) {
        setComparatorModelAId(matched.id);
        const second = historyItems.find((i) => i.id !== matched.id);
        if (second) {
          setComparatorModelBId(second.id);
        }
      }
    }
    setIsComparatorOpen(true);
  };

  const attachImageWithVision = async (
    imageDataUrl: string,
    sourceLabel: string,
  ) => {
    setAttachedThumbnail(imageDataUrl);
    setAttachedVision(null);
    setVisionState('analyzing');

    showSnackBar(
      `${sourceLabel} attached · GOLEM Vision checking ArUco metric plane...`,
    );

    try {
      const payload = await organClient.visionMeasure({
        imageDataUrl,
        markerSizeMm: 50,
        markerId: 0,
      });

      const measurement = payload?.measurement as VisionMeasurement | undefined;

      if (measurement?.evidence?.verified) {
        setAttachedVision(measurement);
        setVisionState('measured');
        showSnackBar(
          `VISION VERIFIED · ${Number(measurement.object.width_mm).toFixed(1)} × ${Number(measurement.object.height_mm).toFixed(1)} mm · ${Math.round(Number(measurement.confidence) * 100)}%`,
        );
        return;
      }
    } catch {
      // No ArUco / no clean contour: keep the image as a normal reference.
    }

    setVisionState('reference');
    showSnackBar(
      `${sourceLabel} attached as reference · no verified ArUco measurement.`,
    );
  };

  const handleSendMessage = async (overridePrompt?: string) => {
    const rawText = (overridePrompt ?? promptText).trim();
    if (!rawText && !attachedThumbnail) return;
    if (isSynthesizing) return;

    const userMsgText = rawText || (
      attachedVision
        ? 'Use the verified camera measurement as geometry input. Do not invent missing depth; ask for another view or dimension when required.'
        : 'Analyze the attached reference without fabricating unavailable geometry.'
    );
    const userMsg: ChatMessage = {
      id: Date.now().toString(), sender: 'user', text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedImage: attachedThumbnail || undefined,
      visionMeasurement: attachedVision || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPromptText('');
    const imageForRequest = attachedThumbnail || undefined;
    const visionForRequest = attachedVision || undefined;
    setAttachedThumbnail(null);
    setAttachedVision(null);
    setVisionState('idle');

    const golemMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      id: golemMsgId, sender: 'golem', text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSynthesizing: true,
      synthesisProgress: { stage: 'ingestion', progress: 4,
        statusText: 'GOLEM semantic runtime is interpreting the request...',
        subDetail: 'Deterministic fast path first; local LLM only when needed.' },
    }]);
    setIsSynthesizing(true); setSynthesisProgress(4); setSynthesisStage('ingestion');

    try {
      const routed = await organClient.chat({
        message: userMsgText,
        imageDataUrl: imageForRequest,
        visionMeasurementId: visionForRequest?.measurement_id,
        maxTime: 180,
      });
      if (routed?.kind === 'conversation' || routed?.kind === 'clarification') {
        const waiting = routed?.kind === 'clarification';
        setMessages((prev) => prev.map((msg) => msg.id === golemMsgId ? {
          ...msg, isSynthesizing: false, is3DModel: false,
          text: String(routed?.message || (waiting ? 'Need additional engineering input.' : 'GOLEM online.')),
          source: String(routed?.source || ''),
          synthesisProgress: undefined,
        } : msg));
        setIsSynthesizing(false); setSynthesisProgress(0); setSynthesisStage('idle');
        void voiceClient.speak(
          String(routed?.message || ''),
          waiting ? 'IMPORTANT' : 'TEAM',
        );
        showSnackBar(waiting ? 'GOLEM is waiting for engineering input.' : 'GOLEM local response received.');
        return;
      }
      if (routed?.kind !== 'job') throw new Error(routed?.message || 'Unknown GOLEM route');
      const jobId = String(routed?.job?.job_id || '');
      if (!jobId) throw new Error('GOLEM did not return a job_id');

      const result = await organClient.waitForResult(jobId, (state) => {
        const p = jobProgress(state);
        setSynthesisProgress(p.progress);
        setSynthesisStage(p.progress < 20 ? 'ingestion' : p.progress < 80 ? 'marching_cubes' : 'baking');
        setMessages((prev) => prev.map((msg) => msg.id === golemMsgId ? {
          ...msg,
          synthesisProgress: { stage: p.stage, progress: p.progress, statusText: p.status, subDetail: p.detail },
        } : msg));
      });
      if (result.status !== 'succeeded' || !result.receipt?.evidence?.effect_verification?.verified) {
        throw new Error(result.error_details || result.error_code || 'Provider effect was not confirmed');
      }
      const mapped = modelFromResult(result, userMsgText.length > 34 ? `${userMsgText.slice(0,31)}...` : userMsgText);
      setMessages((prev) => prev.map((msg) => msg.id === golemMsgId ? {
        ...msg, isSynthesizing:false, is3DModel:true,
        text:`Real ${result.receipt?.provider_id} artifact created and effect-confirmed. Job ${result.job_id}.`,
        modelDetails:mapped.details, modelAsset:mapped.asset,
        synthesisProgress:{ stage:'complete', progress:100, statusText:'GOLEM verified the real engineering effect.', subDetail:`Provider: ${result.receipt?.provider_id} // ${result.receipt?.effect_status}` },
      } : msg));
      setSynthesisProgress(100); setSynthesisStage('complete');
      void voiceClient.speak('Геометрия подтверждена. Реальный эффект проверен.', 'IMPORTANT');
      showSnackBar(`VERIFIED via ${result.receipt?.provider_id}.`);
    } catch (error:any) {
      const message = error?.message || String(error);
      setMessages((prev) => prev.map((msg) => msg.id === golemMsgId ? {
        ...msg, isSynthesizing:false, is3DModel:false, text:`GOLEM stopped: ${message}`, synthesisProgress:undefined,
      } : msg));
      void voiceClient.speak(`Ошибка GOLEM. ${message}`, 'IMPORTANT');
      showSnackBar(`GOLEM: ${message}`);
    } finally {
      setIsSynthesizing(false);
      setTimeout(() => { setSynthesisProgress(0); setSynthesisStage('idle'); }, 700);
    }
  };

  const handleActionSelect = async (
    action: 'photo' | 'file' | 'camera',
  ) => {
    setIsBottomSheetOpen(false);

    if (action === 'photo') {
      const file = await pickLocalFile('image/*');
      if (!file) return;
      if (file.size > 12 * 1024 * 1024) {
        showSnackBar('Image is too large; maximum is 12 MB.');
        return;
      }
      await attachImageWithVision(
        await fileToDataUrl(file),
        `Photo ${file.name}`,
      );
      return;
    }

    if (action === 'file') {
      const file = await pickLocalFile(
        '.obj,.stl,.glb,.gltf,.step,.stp,.fcstd,.scad,.json,.txt,.pdf',
      );
      if (!file) return;
      try {
        const imported = await organClient.importFile(file);
        showSnackBar(
          `Imported ${file.name} as ${imported?.asset?.asset_id || 'asset'}.`,
        );
      } catch (error: any) {
        showSnackBar(`Import failed: ${error?.message || error}`);
      }
      return;
    }

    setIsCameraOpen(true);
  };

  const handleCameraCapture = async (imageDataUrl: string) => {
    await attachImageWithVision(
      imageDataUrl,
      'Vision camera frame',
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-100 font-sans">
      {isProjectBrowserOpen && (
        <ProjectBrowser onClose={() => setIsProjectBrowserOpen(false)} />
      )}
      {/* ============================================================ */}
      {/* Top Application Bar: Brand, Status, Layout Controls */}
      {/* ============================================================ */}
      <header className="h-14 bg-slate-950 border-b border-cyan-500/40 px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        {/* Left: Brand / Mascot Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <GolemHoloLogo size={32} glow={false} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display font-bold text-sm tracking-[0.2em] text-cyan-400">
              <span>GOLEM</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 clip-faceted-sm font-mono">
                AI 3D
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
              HOLOGRAPHIC POLYGONAL COMPANION
            </div>
          </div>
        </div>

        {/* Center: System Status with live VRAM / Compute Telemetry */}
        <div className="hidden md:flex items-center gap-3 font-mono text-[11px] px-3 py-1 bg-slate-900 border border-cyan-500/30 clip-faceted-sm text-cyan-300">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSynthesizing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{isSynthesizing ? 'NEURAL MESH COMPUTE BUSY' : 'NEURAL LATTICE ONLINE'}</span>
          </div>
          <div className="h-3 w-[1px] bg-cyan-500/30" />
          <VramComputeGauge
            isSynthesizing={isSynthesizing}
            synthesisProgress={synthesisProgress}
            synthesisStage={synthesisStage}
          />
        </div>

        {/* Right: Mode Switcher & 3D Comparator */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            id="header-open-projects-btn"
            onClick={() => setIsProjectBrowserOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-cyan-950 border border-cyan-500/50 text-cyan-200 transition-all cursor-pointer"
            title="Open verified GOLEM projects"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider hidden sm:inline">PROJECTS</span>
          </button>

          <button
            id="header-open-comparator-btn"
            onClick={() => handleOpenComparator()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 hover:from-cyan-900 hover:to-emerald-900 border border-cyan-400/80 hover:border-cyan-300 text-cyan-200 hover:text-white clip-faceted-sm transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
            title="Open Synthesis Comparator: Side-by-side 3D model geometry & wireframe diff"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold tracking-wider hidden sm:inline">3D COMPARATOR</span>
            <span className="sm:hidden font-bold">DIFF</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 border border-cyan-500/40 clip-faceted-sm">
            <button
              onClick={() => setViewMode('app')}
              title="Live GOLEM"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all ${
                viewMode === 'app'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulation</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              title="Split: GOLEM + Runtime"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all ${
                viewMode === 'split'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              title="Runtime / Contracts"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all ${
                viewMode === 'code'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Runtime</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* Mobile workspace mode switcher */}
      {/* ============================================================ */}
      <div
        id="mobile-workspace-mode-switcher"
        className="sm:hidden shrink-0 bg-black border-b border-cyan-500/40 px-2 py-1.5 flex items-center gap-1 z-30"
      >
        <button
          type="button"
          onClick={() => setViewMode('app')}
          className={`flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-mono border transition-all ${
            viewMode === 'app'
              ? 'bg-cyan-500 border-cyan-300 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.35)]'
              : 'bg-slate-950 border-cyan-500/30 text-cyan-300'
          }`}
          title="GOLEM chat full screen"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>GOLEM</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('split')}
          className={`flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-mono border transition-all ${
            viewMode === 'split'
              ? 'bg-cyan-500 border-cyan-300 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.35)]'
              : 'bg-slate-950 border-cyan-500/30 text-cyan-300'
          }`}
          title="GOLEM and source code"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>SPLIT</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('code')}
          className={`flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-mono border transition-all ${
            viewMode === 'code'
              ? 'bg-cyan-500 border-cyan-300 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.35)]'
              : 'bg-slate-950 border-cyan-500/30 text-cyan-300'
          }`}
          title="Source code full screen"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>CODE</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenComparator()}
          className="w-10 h-9 shrink-0 flex items-center justify-center bg-emerald-950 border border-emerald-500/60 text-emerald-300"
          title="3D Comparator"
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* Main Workspace: Flutter App Simulation + Flutter Code Viewer */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* ======================================== */}
        {/* 1. Mobile Flutter App Simulation View */}
        {/* ======================================== */}
        {(viewMode === 'app' || viewMode === 'split') && (
          <div
            className={`flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 overflow-hidden relative ${
              viewMode === 'split' ? 'md:max-w-[460px] lg:max-w-[480px] shrink-0' : 'w-full'
            }`}
          >
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Mobile Device Frame */}
            <div className="relative w-full max-w-[414px] h-full max-h-[840px] bg-slate-950 border-2 border-cyan-500/50 clip-faceted-lg flex flex-col shadow-[0_0_35px_rgba(0,240,255,0.18)] z-10 overflow-hidden">
              
              {/* Flutter AppBar */}
              <div className="h-13 bg-slate-900/95 border-b border-cyan-500/40 px-3 flex items-center justify-between shrink-0 select-none">
                {/* Left: Drawer Hamburger Button */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 clip-faceted-sm border border-transparent hover:border-cyan-500/40 transition-all cursor-pointer"
                  title="Open Drawer (Шторка)"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Center Title with Diamond Icon */}
                <div className="flex items-center gap-2 font-display font-bold text-base tracking-[0.25em] text-cyan-400">
                  <div className="w-2.5 h-2.5 bg-cyan-400 clip-faceted-sm shadow-[0_0_8px_#00f0ff]" />
                  <span>GOLEM</span>
                </div>

                {/* Right: Audio Telemetry & Comparator Quick Action */}
                <div className="flex items-center gap-0.5">
                  <button
                    id="mobile-appbar-projects-btn"
                    onClick={() => setIsProjectBrowserOpen(true)}
                    className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 clip-faceted-sm transition-colors cursor-pointer"
                    title="Open verified project history"
                  >
                    <FolderKanban className="w-4 h-4" />
                  </button>
                  <button
                    id="mobile-appbar-comparator-btn"
                    onClick={() => handleOpenComparator()}
                    className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 clip-faceted-sm transition-colors cursor-pointer"
                    title="Open Synthesis Comparator"
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const mode = voiceClient.cycleMode();
                      void voiceClient.speak(`Режим голоса ${mode}`, 'CRITICAL', true);
                      showSnackBar(`VOICE MODE: ${mode}`);
                    }}
                    className="p-1.5 text-sky-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Audio Diagnostic"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-header status ticker with dynamic VRAM/Compute Load gauge */}
              <div className="px-2.5 py-1 bg-black border-b border-cyan-500/30 flex items-center justify-between text-[10px] font-mono select-none relative z-20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSynthesizing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {isSynthesizing ? (
                    <span className="flex items-center gap-1 text-cyan-300 font-semibold truncate">
                      <span className="hidden sm:inline">SYNTH:</span>
                      <span className="text-[9px] px-1 py-0.2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 clip-faceted-sm">
                        {synthesisStage === 'ingestion'
                          ? 'S1: INGEST'
                          : synthesisStage === 'voxelization'
                          ? 'S1: VOXEL'
                          : synthesisStage === 'marching_cubes'
                          ? 'S2: MESH'
                          : synthesisStage === 'baking'
                          ? 'S2: 4K PBR'
                          : synthesisStage === 'compression'
                          ? 'S2: DRACO'
                          : 'COMPLETE'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium tracking-wide">
                      SYNC // ONLINE
                    </span>
                  )}
                </div>

                {/* Dynamic VRAM / Compute Load Gauge */}
                <VramComputeGauge
                  isSynthesizing={isSynthesizing}
                  synthesisProgress={synthesisProgress}
                  synthesisStage={synthesisStage}
                />
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
                {messages.map((msg) => (
                  <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    onOpenComparator={(msgId) => handleOpenComparator(msgId)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Bar */}
              <div className="p-2 sm:p-3 bg-slate-900/95 border-t border-cyan-500/40 shrink-0">
                {/* Thumbnail Preview if attached */}
                {attachedThumbnail && (
                  <div className="mb-2 p-1.5 bg-slate-950 border border-cyan-500/70 clip-faceted-sm flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <img
                        src={attachedThumbnail}
                        alt="Attached scan"
                        className="w-10 h-10 object-cover clip-faceted-sm border border-cyan-400"
                      />
                      <div className="text-[11px] font-mono">
                        <div className="text-cyan-300 font-bold">OPTICAL SCAN ATTACHED</div>
                        <div className="text-slate-400 text-[10px]">Ready for local GOLEM analysis</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAttachedThumbnail(null);
                        setAttachedVision(null);
                        setVisionState('idle');
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Synthesis Presets for Instant Real-Time Testing */}
                <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] font-mono select-none scrollbar-none">
                  <span className="text-slate-500 shrink-0 text-[9px] font-bold tracking-wider">QUICK SYNTH:</span>
                  {[
                    'Cylinder diameter 30 height 15',
                    'cube size 3',
                    'sphere radius 2',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        if (!isSynthesizing) {
                          setPromptText(preset);
                          handleSendMessage(preset);
                        }
                      }}
                      disabled={isSynthesizing}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white clip-faceted-sm transition-all whitespace-nowrap disabled:opacity-40 cursor-pointer text-[9.5px]"
                    >
                      ⚡ {preset}
                    </button>
                  ))}
                </div>

                {attachedThumbnail && visionState !== 'idle' && (
                  <div className="mb-2 px-2 py-1.5 border border-cyan-500/25 bg-black/70 font-mono text-[9px] flex items-center justify-between gap-2">
                    <span className="text-slate-400">
                      {visionState === 'analyzing'
                        ? 'VISION ANALYZING · OPENCV / ARUCO'
                        : visionState === 'measured' && attachedVision
                        ? `VISION VERIFIED · ${Number(attachedVision.object.width_mm).toFixed(1)} × ${Number(attachedVision.object.height_mm).toFixed(1)} mm`
                        : 'REFERENCE IMAGE · NO VERIFIED METRIC MARKER'}
                    </span>
                    <span className={
                      visionState === 'measured'
                        ? 'text-emerald-400'
                        : visionState === 'analyzing'
                        ? 'text-cyan-300'
                        : 'text-amber-300'
                    }>
                      {visionState === 'measured' && attachedVision
                        ? `${Math.round(Number(attachedVision.confidence) * 100)}%`
                        : visionState.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Input Row: '+' Button, Input, Send */}
                <div className="flex items-center gap-2">
                  {/* '+' Button */}
                  <button
                    onClick={() => setIsBottomSheetOpen(true)}
                    disabled={isSynthesizing}
                    className="w-10 h-10 shrink-0 bg-slate-950 hover:bg-cyan-950/60 disabled:opacity-50 border border-cyan-500/60 hover:border-cyan-400 text-cyan-400 flex items-center justify-center clip-faceted-sm transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                    title="Add Photo / File / Camera"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {/* Text Input */}
                  <div className="flex-1 bg-slate-950 border border-cyan-500/40 focus-within:border-cyan-400 clip-faceted-sm px-3 py-1.5 transition-colors">
                    <input
                      type="text"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isSynthesizing && handleSendMessage()}
                      disabled={isSynthesizing}
                      placeholder={isSynthesizing ? "Executing verified 3D/CAD task..." : "Describe a 3D/CAD task..."}
                      className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden disabled:opacity-50"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSynthesizing || (!promptText.trim() && !attachedThumbnail)}
                    className="w-10 h-10 shrink-0 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black flex items-center justify-center clip-faceted-sm transition-all cursor-pointer font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                    title={isSynthesizing ? "Synthesis in progress" : "Transmit to GOLEM"}
                  >
                    {isSynthesizing ? (
                      <Activity className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* In-App Left Drawer */}
              <GolemDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                currentLanguage={currentLanguage}
                onLanguageChange={(lang) => {
                  setCurrentLanguage(lang);
                  showSnackBar(`Language switched to: ${lang.toUpperCase()}`);
                }}
                onSelectFolder={(folderName) => {
                  void organClient.vaults()
                    .then((vault) =>
                      showSnackBar(
                        `${folderName}: ${vault.jobs || 0} verified jobs, ${vault.bytes || 0} bytes.`,
                      ),
                    )
                    .catch((error) =>
                      showSnackBar(
                        `Vault unavailable: ${error?.message || error}`,
                      ),
                    );
                  setIsDrawerOpen(false);
                }}
                historyItems={historyItems}
                onReaccessModel={handleReaccessModel}
                onShareSynthesis={(item) => {
                  showSnackBar(`3D Telemetry share link copied for ${item.modelName}!`);
                }}
                onOpenComparator={(initialModelId) => {
                  handleOpenComparator(initialModelId);
                }}
                onDiagnosticLogDownloaded={(filename) => {
                  showSnackBar(`Diagnostic log downloaded: ${filename}`);
                }}
              />

              {/* In-App '+' Action Bottom Sheet */}
              <ActionBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                onSelectAction={handleActionSelect}
              />

              {/* In-App Full-Screen Camera HUD View */}
              <CameraHudView
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCameraCapture}
              />
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* 2. Flutter / Dart Source Code Explorer */}
        {/* ======================================== */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <FlutterCodeViewer />
        )}
      </main>

      {/* Synthesis Comparator Tool: Side-by-side 3D viewports & telemetry diff */}
      <SynthesisComparator
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        historyItems={historyItems}
        initialModelAId={comparatorModelAId}
        initialModelBId={comparatorModelBId}
      />

      {/* Floating System SnackBar */}
      {snackBarMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-950 border border-cyan-400 clip-faceted-sm text-cyan-300 font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{snackBarMessage}</span>
        </div>
      )}
    </div>
  );
}
