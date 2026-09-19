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
import { ChatMessage, AppLanguage, SynthesisHistoryItem } from './types';
import { GolemDrawer } from './components/GolemDrawer';
import { ChatBubble } from './components/ChatBubble';
import { ActionBottomSheet } from './components/ActionBottomSheet';
import { CameraHudView } from './components/CameraHudView';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { GolemHoloLogo } from './components/GolemHoloLogo';
import { VramComputeGauge, SynthesisStageType } from './components/VramComputeGauge';
import { SynthesisComparator } from './components/SynthesisComparator';

export default function App() {
  // Navigation / View layout
  const [viewMode, setViewMode] = useState<'split' | 'app' | 'code'>('split');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
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
      id: '0a',
      sender: 'golem',
      text: 'Archive restored: Previously synthesized Cybernetic Monolith Ward (5.40 MB, 16.8K polys) and Crystalline Kinetic Core (6.75 MB, 21.5K polys) stored in synthesis history.',
      timestamp: '11:10',
      is3DModel: true,
      modelDetails: {
        name: 'Cybernetic Monolith Ward',
        vertices: 8920,
        polygons: 16840,
        format: 'GLB / USDZ',
        renderTime: '1.5s local',
        fileSize: '5.40 MB',
        textureComplexity: '4K PBR (Normal, Metallic, AO)',
        meshDensity: '34.2 tris/cm²',
        dimensions: '2.40m × 1.10m × 3.20m',
        uvChannels: 2,
        drawCalls: 1,
        materialCount: 3,
        dracoCompression: 'Draco L7 (-65%)',
      },
    },
    {
      id: '0b',
      sender: 'golem',
      text: 'Archive restored: Crystalline Kinetic Core synthesized with multi-angle tessellation.',
      timestamp: '12:45',
      is3DModel: true,
      modelDetails: {
        name: 'Crystalline Kinetic Core',
        vertices: 11200,
        polygons: 21500,
        format: 'GLB / USDZ',
        renderTime: '1.8s local',
        fileSize: '6.75 MB',
        textureComplexity: '4K Ultra-PBR (Emissive Core)',
        meshDensity: '39.8 tris/cm²',
        dimensions: '1.60m × 1.60m × 1.95m',
        uvChannels: 3,
        drawCalls: 1,
        materialCount: 4,
        dracoCompression: 'Draco L7 (-68%)',
      },
    },
    {
      id: '1',
      sender: 'golem',
      text: 'Core initialized. I am GOLEM, your holographic stone guardian companion. Input your prompt to synthesize 3D spatial models.',
      timestamp: '14:20',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Synthesize an ancient runic monolith guardian with crystalline obsidian veins.',
      timestamp: '14:22',
    },
    {
      id: '3',
      sender: 'golem',
      text: 'Spatial mesh synthesized. Quantum lattice rendered 12,480 polygonal facets with deep obsidian shader. Tap the 3D model to inspect file footprint, texture complexity, and wireframe density.',
      timestamp: '14:23',
      is3DModel: true,
      modelDetails: {
        name: 'Runic Stone Guardian',
        vertices: 6420,
        polygons: 12480,
        format: 'GLB / USDZ',
        renderTime: '1.2s local',
        fileSize: '4.82 MB',
        textureComplexity: '4K PBR (Albedo, Normal, Roughness, Metalness, AO)',
        meshDensity: '28.4 tris/cm²',
        dimensions: '1.85m × 1.20m × 2.40m',
        uvChannels: 2,
        drawCalls: 1,
        materialCount: 3,
        dracoCompression: 'Draco L7 (-64%)',
      },
    },
  ]);

  const [promptText, setPromptText] = useState('');
  const [attachedThumbnail, setAttachedThumbnail] = useState<string | null>(null);
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

  const handleSendMessage = (overridePrompt?: string) => {
    const rawText = (overridePrompt ?? promptText).trim();
    if (!rawText && !attachedThumbnail) return;
    if (isSynthesizing) return; // Prevent overlapping synthesis runs

    const userMsgText = rawText || 'Transmitted spatial visual data for 3D reconstruction.';
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedImage: attachedThumbnail || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptText('');
    setAttachedThumbnail(null);

    // Initialize GOLEM's incoming message with real-time synthesis progress
    const synthMsgId = (Date.now() + 1).toString();
    const targetModelName = userMsgText.length > 28
      ? `${userMsgText.slice(0, 25)}...`
      : userMsgText;

    const initialSynthMsg: ChatMessage = {
      id: synthMsgId,
      sender: 'golem',
      text: targetModelName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSynthesizing: true,
      synthesisProgress: {
        stage: 'ingestion',
        progress: 4,
        statusText: 'Stage 1/2: Ingesting spatial prompt & optical scan tensors...',
        subDetail: 'Parsing lexical tokens & computing voxel grid bounds (512³)...',
        tflops: 124,
        vertices: 1840,
        polygons: 3200,
      },
    };

    setMessages((prev) => [...prev, initialSynthMsg]);
    setIsSynthesizing(true);
    setSynthesisProgress(4);
    setSynthesisStage('ingestion');

    if (synthesisIntervalRef.current) {
      clearInterval(synthesisIntervalRef.current);
    }

    let progress = 4;

    synthesisIntervalRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 3) + 3; // +3% to +5% per 70ms (~2s total duration)

      if (progress >= 100) {
        progress = 100;
        setSynthesisProgress(100);
        setSynthesisStage('complete');
        if (synthesisIntervalRef.current) {
          clearInterval(synthesisIntervalRef.current);
          synthesisIntervalRef.current = null;
        }

        // Show 100% completion state on progress bar
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === synthMsgId
              ? {
                  ...msg,
                  synthesisProgress: {
                    stage: 'complete',
                    progress: 100,
                    statusText: 'Stage 2/2: Spatial 3D mesh synthesis completed successfully!',
                    subDetail: 'Tessellated 18,940 faces, baked 4K PBR maps, Draco L7 compressed.',
                    tflops: 142,
                    vertices: 9840,
                    polygons: 18940,
                  },
                }
              : msg
          )
        );

        // Smoothly transition into the interactive 3D model viewer after brief celebration
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === synthMsgId
                ? {
                    ...msg,
                    isSynthesizing: false,
                    is3DModel: true,
                    text: `Topology ingestion and neural mesh synthesis complete for "${targetModelName}". Generated 18,940 faces, 4K multi-layer PBR shaders, and 31.2 tris/cm² density. Tap the card below to inspect full geometry telemetry.`,
                    modelDetails: {
                      name: targetModelName,
                      vertices: 9840,
                      polygons: 18940,
                      format: 'GLB / USDZ',
                      renderTime: '1.4s local',
                      fileSize: '6.15 MB',
                      textureComplexity: '4K Ultra-PBR (Albedo, Normal, Roughness, Metalness, AO, Emissive)',
                      meshDensity: '31.2 tris/cm²',
                      dimensions: '2.10m × 1.45m × 2.80m',
                      uvChannels: 3,
                      drawCalls: 1,
                      materialCount: 4,
                      dracoCompression: 'Draco L7 (-68%)',
                    },
                  }
                : msg
            )
          );
          setIsSynthesizing(false);
          setSynthesisProgress(0);
          setSynthesisStage('idle');
          showSnackBar(`3D Mesh synthesized: ${targetModelName} ready.`);
        }, 500);

      } else {
        const isIngestion = progress < 50;
        const stage: 'ingestion' | 'mesh_synthesis' = isIngestion ? 'ingestion' : 'mesh_synthesis';

        setSynthesisProgress(progress);
        if (progress < 20) {
          setSynthesisStage('ingestion');
        } else if (progress < 50) {
          setSynthesisStage('voxelization');
        } else if (progress < 68) {
          setSynthesisStage('marching_cubes');
        } else if (progress < 85) {
          setSynthesisStage('baking');
        } else {
          setSynthesisStage('compression');
        }

        let statusText = '';
        let subDetail = '';
        let vertices = 1840;
        let polygons = 3200;

        if (progress < 20) {
          statusText = 'Stage 1/2: Ingesting spatial prompt & optical scan tensors...';
          subDetail = 'Tokenizing geometric descriptors & boundary constraints...';
          vertices = Math.round(1800 + (progress / 20) * 1400);
          polygons = Math.round(3200 + (progress / 20) * 2200);
        } else if (progress < 36) {
          statusText = 'Stage 1/2: Extracting boundary point clouds & spatial embeddings...';
          subDetail = 'Calculating normal vectors and depth disparity...';
          vertices = Math.round(3200 + ((progress - 20) / 16) * 2100);
          polygons = Math.round(5400 + ((progress - 20) / 16) * 3200);
        } else if (progress < 50) {
          statusText = 'Stage 1/2: Constructing 3D voxel coordinate lattice (512³)...';
          subDetail = 'Voxelization complete. Preparing neural marching cubes...';
          vertices = Math.round(5300 + ((progress - 36) / 14) * 1700);
          polygons = Math.round(8600 + ((progress - 36) / 14) * 2800);
        } else if (progress < 68) {
          statusText = 'Stage 2/2: Neural marching cubes mesh synthesis (18,940 faces)...';
          subDetail = 'Tessellating triangular topology and smoothing vertex normals...';
          vertices = Math.round(7000 + ((progress - 50) / 18) * 1600);
          polygons = Math.round(11400 + ((progress - 50) / 18) * 4400);
        } else if (progress < 85) {
          statusText = 'Stage 2/2: Baking 4K Ultra-PBR maps (Albedo, Normal, Roughness)...';
          subDetail = 'Applying anisotropic metallic shaders and ambient occlusion...';
          vertices = Math.round(8600 + ((progress - 68) / 17) * 900);
          polygons = Math.round(15800 + ((progress - 68) / 17) * 2600);
        } else {
          statusText = 'Stage 2/2: Applying Draco L7 geometry compression & compiling GLB...';
          subDetail = 'Compressing geometry (-68%) and linking spatial scene graph...';
          vertices = 9840;
          polygons = 18940;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === synthMsgId
              ? {
                  ...msg,
                  synthesisProgress: {
                    stage,
                    progress,
                    statusText,
                    subDetail,
                    tflops: 124 + Math.round((progress / 100) * 18),
                    vertices,
                    polygons,
                  },
                }
              : msg
          )
        );
      }
    }, 70);
  };

  const handleActionSelect = (action: 'photo' | 'file' | 'camera') => {
    setIsBottomSheetOpen(false);

    if (action === 'photo') {
      // Mock photo selection
      setAttachedThumbnail('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
      showSnackBar('Photo attached from local device library.');
    } else if (action === 'file') {
      showSnackBar('Mock 3D CAD/OBJ blueprint ingested.');
    } else if (action === 'camera') {
      setIsCameraOpen(true);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setAttachedThumbnail(imageDataUrl);
    showSnackBar('HUD Optical scan captured & attached to prompt bar.');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-slate-100 font-sans">
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
        <div className="flex items-center gap-2">
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
              title="Mobile Simulation Only"
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
              title="Split: App + Flutter Code"
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
              title="Flutter Dart Codebase"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono transition-all ${
                viewMode === 'code'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dart Code (lib/)</span>
            </button>
          </div>
        </div>
      </header>

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
                    id="mobile-appbar-comparator-btn"
                    onClick={() => handleOpenComparator()}
                    className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 clip-faceted-sm transition-colors cursor-pointer"
                    title="Open Synthesis Comparator"
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showSnackBar('Holo Audio Diagnostic: Frequency 432Hz locked.')}
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
                        <div className="text-slate-400 text-[10px]">Ready for 3D neural synthesis</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachedThumbnail(null)}
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
                    'Obsidian Keystone',
                    'Quantum Resonator',
                    'Cyber Relic Prism',
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
                      placeholder={isSynthesizing ? "Synthesizing 3D mesh in real-time..." : "Enter 3D synthesis prompt..."}
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
                  showSnackBar(`Accessed storage vault: ${folderName}`);
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
