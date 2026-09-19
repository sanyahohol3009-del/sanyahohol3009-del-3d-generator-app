import React, { useRef, useEffect, useState } from 'react';
import { 
  Rotate3d, 
  Cpu, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  HardDrive, 
  Layers, 
  Grid3X3, 
  Box, 
  Sliders, 
  Download, 
  Check, 
  Sparkles,
  Zap,
  Code2,
  FileJson,
  Copy,
  Scale
} from 'lucide-react';

interface ModelViewer3DProps {
  modelName?: string;
  vertices?: number;
  polygons?: number;
  renderTime?: string;
  fileSize?: string;
  textureComplexity?: string;
  meshDensity?: string;
  dimensions?: string;
  uvChannels?: number;
  drawCalls?: number;
  materialCount?: number;
  dracoCompression?: string;
  onOpenComparator?: () => void;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  modelName = 'Runic Stone Guardian',
  vertices = 6420,
  polygons = 12480,
  renderTime = '1.2s local',
  fileSize = '4.82 MB',
  textureComplexity = '4K PBR (Albedo, Normal, Roughness, Metalness, AO)',
  meshDensity = '28.4 tris/cm²',
  dimensions = '1.85m × 1.20m × 2.40m',
  uvChannels = 2,
  drawCalls = 1,
  materialCount = 3,
  dracoCompression = 'Draco L7 (-64%)',
  onOpenComparator,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const angleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSpecs, setCopiedSpecs] = useState(false);
  const [copiedFlutterJson, setCopiedFlutterJson] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [exportStatusMessage, setExportStatusMessage] = useState<string | null>(null);
  const [simulatedDensityLevel, setSimulatedDensityLevel] = useState<'Standard' | 'Adaptive High' | 'Sub-D Ultra'>('Adaptive High');

  const handleNudgeAngle = (delta: number) => {
    angleRef.current += delta;
  };

  const handleResetAngle = () => {
    angleRef.current = 0;
  };

  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - lastMouseXRef.current;
    lastMouseXRef.current = clientX;
    angleRef.current += deltaX * 0.015;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // 3D Polygonal Golem / Monolith Vertices
    const vertices3D = [
      // Head/Top Crest
      { x: 0, y: -50, z: 0 },
      { x: -20, y: -35, z: 20 },
      { x: 20, y: -35, z: 20 },
      { x: 20, y: -35, z: -20 },
      { x: -20, y: -35, z: -20 },
      
      // Chest/Shoulders
      { x: -45, y: -15, z: 25 },
      { x: 45, y: -15, z: 25 },
      { x: 50, y: -15, z: -25 },
      { x: -50, y: -15, z: -25 },

      // Core Crystal
      { x: 0, y: 0, z: 35 },
      { x: 0, y: 0, z: -35 },

      // Torso / Waist
      { x: -30, y: 25, z: 20 },
      { x: 30, y: 25, z: 20 },
      { x: 30, y: 25, z: -20 },
      { x: -30, y: 25, z: -20 },

      // Base / Pedestal
      { x: -40, y: 55, z: 25 },
      { x: 40, y: 55, z: 25 },
      { x: 40, y: 55, z: -25 },
      { x: -40, y: 55, z: -25 },
      { x: 0, y: 65, z: 0 },
    ];

    // Edges connecting vertices to form faceted geometry
    const edges = [
      // Top crest
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],

      // Crest to shoulders
      [1, 5], [2, 6], [3, 7], [4, 8],
      [5, 6], [6, 7], [7, 8], [8, 5],

      // Core connections
      [5, 9], [6, 9], [7, 10], [8, 10],
      [9, 11], [9, 12], [10, 13], [10, 14],

      // Torso
      [11, 12], [12, 13], [13, 14], [14, 11],
      [5, 11], [6, 12], [7, 13], [8, 14],

      // Base
      [11, 15], [12, 16], [13, 17], [14, 18],
      [15, 16], [16, 17], [17, 18], [18, 15],
      [15, 19], [16, 19], [17, 19], [18, 19],
    ];

    // Additional wireframe subdivisions if High/Ultra density
    const subEdges = [
      [1, 3], [2, 4],
      [5, 7], [6, 8],
      [11, 13], [12, 14],
      [15, 17], [16, 18],
    ];

    const render = () => {
      if (isRotating && !isDraggingRef.current) {
        angleRef.current += 0.015;
      }
      const angle = angleRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 190;

      // Project vertices with 3D rotation matrix
      const projected = vertices3D.map((v) => {
        // Rotate around Y
        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.x * sinY + v.z * cosY;

        // Subtle tilt around X
        const tilt = 0.25;
        const cosX = Math.cos(tilt);
        const sinX = Math.sin(tilt);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = v.y * sinX + z1 * cosX + 160;

        const scale = fov / Math.max(1, z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
        };
      });

      // Draw background holographic grid rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy + 30, 60, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy + 30, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Render primary edges
      edges.forEach(([p1Idx, p2Idx]) => {
        const p1 = projected[p1Idx];
        const p2 = projected[p2Idx];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (wireframeMode) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
          ctx.lineWidth = 1.6;
        }
        ctx.stroke();
      });

      // If wireframe mode or high density mode, render additional internal tessellation chords
      if (wireframeMode || simulatedDensityLevel !== 'Standard') {
        subEdges.forEach(([p1Idx, p2Idx]) => {
          const p1 = projected[p1Idx];
          const p2 = projected[p2Idx];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = wireframeMode ? 'rgba(0, 240, 255, 0.45)' : 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      }

      // Draw glowing nodes on vertices
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, wireframeMode ? 1.8 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = wireframeMode ? '#38bdf8' : '#00f0ff';
        ctx.fill();
      });

      // Draw central glowing heart/crystal
      const core = projected[9];
      if (core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRotating, wireframeMode, simulatedDensityLevel]);

  const handleCopySpecs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const specSummary = `[GOLEM 3D TELEMETRY]\nModel: ${modelName}\nFile Size: ${fileSize}\nTexture: ${textureComplexity}\nWireframe Density: ${meshDensity} (${simulatedDensityLevel})\nPolys: ${polygons.toLocaleString()}\nVertices: ${vertices.toLocaleString()}\nDimensions: ${dimensions}\nCompression: ${dracoCompression}`;
    navigator.clipboard.writeText(specSummary);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2000);
  };

  const getFlutterJsonTelemetry = () => {
    const flutterData = {
      modelName,
      format: 'GLB / USDZ',
      assetPath: `assets/models/${modelName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.glb`,
      geometryTelemetry: {
        fileSize,
        dracoCompression,
        polygons,
        vertices,
        renderLatency: renderTime,
        meshDensity,
        tessellationLOD: simulatedDensityLevel,
        dimensions,
        uvChannels,
        drawCalls,
        materials: materialCount,
      },
      textureTelemetry: {
        resolution: '4096x4096 (4K Ultra)',
        complexity: textureComplexity,
        colorDepth: '8-bit sRGB',
        channels: [
          'Albedo RGB',
          'Normal Tangent',
          'Roughness',
          'Metallic',
          'Ambient Occlusion',
        ],
      },
      flutterChatMessagePayload: {
        id: Date.now().toString(),
        type: 'MessageType.model3D',
        modelMetadata: {
          name: modelName,
          polys: `${polygons.toLocaleString()} Tris`,
          time: renderTime,
          fileSize,
          textureComplexity,
          meshDensity,
          dimensions,
          compression: dracoCompression,
        },
      },
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(flutterData, null, 2);
  };

  const handleExportToFlutter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = getFlutterJsonTelemetry();
    navigator.clipboard.writeText(jsonStr);
    setCopiedFlutterJson(true);
    setExportStatusMessage('Flutter geometry telemetry copied as JSON!');
    setTimeout(() => setCopiedFlutterJson(false), 2500);
    setTimeout(() => setExportStatusMessage(null), 3500);
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[360px] my-2 bg-slate-950 border border-cyan-500/70 clip-faceted-sm relative group overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.18)] transition-all duration-300">
      {/* Top Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-cyan-500/40 text-xs cursor-pointer select-none hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-cyan-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{modelName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenComparator && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenComparator();
              }}
              className="text-[10px] px-1.5 py-0.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/50 hover:border-emerald-400 clip-faceted-sm font-mono flex items-center gap-1 cursor-pointer transition-colors"
              title="Open Synthesis Comparator with this model"
            >
              <Scale className="w-2.5 h-2.5 text-emerald-400" />
              <span>COMPARE</span>
            </button>
          )}
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 clip-faceted-sm font-mono">
            GLB // 3D
          </span>
          <div className="text-cyan-400 p-0.5 rounded-xs hover:bg-cyan-950 transition-colors">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div 
        className="relative w-full h-48 bg-radial from-slate-900 via-slate-950 to-black flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        title="Click and drag horizontally to interactively rotate the 3D model"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={192}
          className="w-full h-full block pointer-events-none"
        />

        {/* Center Prompt Requirement: "3D Model Rendered Here" overlay */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-black/85 border border-cyan-500/50 rounded-xs text-[11px] text-cyan-300 font-medium backdrop-blur-sm pointer-events-none shadow-lg whitespace-nowrap">
          <Rotate3d className={`w-3 h-3 text-cyan-400 ${isRotating ? 'animate-spin' : ''}`} />
          <span>3D Model Rendered Here</span>
        </div>

        {/* Quick controls toolbar */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            id="viewport-quick-rotate-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsRotating(!isRotating);
            }}
            title={isRotating ? 'Pause rotation' : 'Resume rotation'}
            className={`p-1.5 rounded-xs border transition-colors shadow-md cursor-pointer ${
              isRotating
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Rotate3d className={`w-3.5 h-3.5 ${isRotating ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setWireframeMode(!wireframeMode);
            }}
            title="Toggle Wireframe mode"
            className={`p-1.5 rounded-xs border transition-colors shadow-md ${
              wireframeMode
                ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live wireframe status badge if enabled */}
        {wireframeMode && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-mono tracking-widest uppercase">
            WIREFRAME ACTIVE
          </div>
        )}
      </div>

      {/* Interactive Tap Banner to Toggle Expandable Details */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1.5 bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-mono text-cyan-300 hover:text-white hover:bg-cyan-950/70 transition-colors group/banner"
      >
        <span className="flex items-center gap-1.5 font-semibold tracking-wider text-[10px]">
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          {isExpanded ? 'COLLAPSE 3D METADATA' : 'TAP TO EXPAND 3D DETAILS & TELEMETRY'}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-cyan-400 group-hover/banner:translate-y-0.5 transition-transform">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Telemetry Footer Summary */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>POLYS: <strong className="text-cyan-300">{polygons.toLocaleString()}</strong></span>
          <span>•</span>
          <span>VERTS: <strong className="text-cyan-300">{vertices.toLocaleString()}</strong></span>
        </div>
        <span className="text-emerald-400 font-semibold">{renderTime}</span>
      </div>

      {/* =================================================================== */}
      {/* EXPANDABLE DETAIL PANEL: File Size, Texture Complexity, Wireframe   */}
      {/* =================================================================== */}
      {isExpanded && (
        <div className="border-t-2 border-cyan-400/80 bg-slate-950/98 p-3.5 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Interactive 3D Mesh Rotation Control Panel */}
          <div className="bg-slate-900/95 border border-cyan-500/50 p-2.5 rounded-xs space-y-2 shadow-[0_0_15px_rgba(0,240,255,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <Rotate3d className={`w-3.5 h-3.5 ${isRotating ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
                <span>INTERACTIVE MESH ROTATION</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isRotating ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                <span className={`px-1.5 py-0.5 border text-[9px] font-mono font-bold rounded-xs ${
                  isRotating
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-950 border-slate-700 text-slate-400'
                }`}>
                  {isRotating ? 'AUTO-SPIN: ACTIVE' : 'AUTO-SPIN: PAUSED'}
                </span>
              </div>
            </div>

            {/* Primary 'Rotate 3D' Button */}
            <button
              type="button"
              id="rotate-3d-button"
              onClick={() => setIsRotating(!isRotating)}
              className={`w-full py-2 px-2.5 text-xs font-mono font-bold flex items-center justify-between rounded-xs border transition-all duration-200 cursor-pointer ${
                isRotating
                  ? 'bg-gradient-to-r from-cyan-950 via-cyan-900/60 to-slate-900 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(0,240,255,0.25)] hover:border-cyan-300'
                  : 'bg-slate-950 hover:bg-cyan-950/40 border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-white'
              }`}
              title={isRotating ? 'Pause preview mesh rotation' : 'Resume preview mesh rotation'}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-xs border ${
                  isRotating
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <Rotate3d className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-cyan-300' : 'text-slate-400'}`} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold tracking-wider text-cyan-300">Rotate 3D</span>
                  <span className="text-[9px] font-normal text-slate-400">
                    {isRotating ? 'Auto-rotation active (tap to pause preview)' : 'Mesh rotation paused (tap to start spin)'}
                  </span>
                </div>
              </div>
              <span className={`text-[9.5px] px-2 py-0.5 border font-mono font-bold tracking-wider rounded-xs ${
                isRotating
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {isRotating ? 'PAUSE' : 'ROTATE'}
              </span>
            </button>

            {/* Manual Orientation Nudges & Drag Guidance */}
            <div className="pt-1.5 border-t border-cyan-500/20 flex items-center justify-between gap-1.5 text-[9.5px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Manual Nudge:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleNudgeAngle(-Math.PI / 4)}
                  className="px-1.5 py-0.5 bg-slate-950 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xs transition-colors cursor-pointer"
                  title="Rotate 45° counter-clockwise"
                >
                  ⟲ -45°
                </button>
                <button
                  type="button"
                  onClick={handleResetAngle}
                  className="px-1.5 py-0.5 bg-slate-950 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xs transition-colors cursor-pointer"
                  title="Reset orientation to 0°"
                >
                  RESET 0°
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeAngle(Math.PI / 4)}
                  className="px-1.5 py-0.5 bg-slate-950 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xs transition-colors cursor-pointer"
                  title="Rotate 45° clockwise"
                >
                  ⟳ +45°
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: File Size & Storage Footprint */}
          <div className="bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>FILE SIZE & STORAGE FOOTPRINT</span>
              </div>
              <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold rounded-xs shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                {fileSize}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800">
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">Mesh Geometry:</span>
                <span className="text-cyan-300 font-semibold">2.10 MB</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">PBR Textures:</span>
                <span className="text-cyan-300 font-semibold">2.72 MB</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">Compression:</span>
                <span className="text-emerald-400 font-semibold">{dracoCompression}</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">VRAM Allocation:</span>
                <span className="text-amber-300 font-semibold">~34.6 MB</span>
              </div>
            </div>
          </div>

          {/* Section 2: Texture Complexity */}
          <div className="bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>TEXTURE COMPLEXITY</span>
              </div>
              <span className="px-1.5 py-0.5 bg-sky-950/80 border border-sky-400/50 text-sky-200 text-[10px] font-mono rounded-xs">
                4096 × 4096 (4K)
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-snug">
              {textureComplexity}
            </p>

            {/* PBR Channel Pills */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[
                { name: 'Albedo (BaseColor)', color: 'text-amber-300 border-amber-500/40 bg-amber-950/30' },
                { name: 'Normal (Tangent)', color: 'text-purple-300 border-purple-500/40 bg-purple-950/30' },
                { name: 'Roughness', color: 'text-sky-300 border-sky-500/40 bg-sky-950/30' },
                { name: 'Metallic', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/30' },
                { name: 'Ambient Occlusion', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30' },
              ].map((map) => (
                <span
                  key={map.name}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs border ${map.color}`}
                >
                  {map.name}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Mesh Wireframe Density */}
          <div className="bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>MESH WIREFRAME DENSITY</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold rounded-xs">
                {meshDensity}
              </span>
            </div>

            {/* Density Selector / Multiplier */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <span className="text-[10px] font-mono text-slate-400">Tessellation LOD:</span>
              <div className="flex gap-1">
                {(['Standard', 'Adaptive High', 'Sub-D Ultra'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSimulatedDensityLevel(level)}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs border transition-colors ${
                      simulatedDensityLevel === level
                        ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
                        : 'bg-black/40 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Wireframe Density Visual Spectrum Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Density Spectrum</span>
                <span className="text-cyan-300">
                  {simulatedDensityLevel === 'Standard' ? '65% (Balanced)' : simulatedDensityLevel === 'Adaptive High' ? '88% (Optimized)' : '97% (Production Sub-D)'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ 
                    width: simulatedDensityLevel === 'Standard' ? '65%' : simulatedDensityLevel === 'Adaptive High' ? '88%' : '97%' 
                  }}
                />
              </div>
            </div>

            {/* Action to trigger wireframe directly on canvas */}
            <button
              type="button"
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`w-full py-1 px-2 text-[10px] font-mono font-semibold rounded-xs border flex items-center justify-center gap-1.5 transition-colors ${
                wireframeMode
                  ? 'bg-cyan-500 text-black border-cyan-300'
                  : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{wireframeMode ? 'HIDE WIREFRAME OVERLAY' : 'INSPECT REAL-TIME WIREFRAME'}</span>
            </button>
          </div>

          {/* Section 4: Spatial Dimensions & UV Topology Specs */}
          <div className="bg-slate-900/90 border border-cyan-500/30 p-2.5 rounded-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL BLUEPRINT & TOPOLOGY</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300 pt-1">
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">Bounding Box:</span>
                <span className="text-cyan-300 font-semibold">{dimensions}</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">UV Channels:</span>
                <span className="text-cyan-300 font-semibold">{uvChannels} Sets</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">Draw Calls:</span>
                <span className="text-cyan-300 font-semibold">{drawCalls} Batch</span>
              </div>
              <div className="flex justify-between px-1.5 py-1 bg-black/40 rounded-xs">
                <span className="text-slate-400">Shaders:</span>
                <span className="text-cyan-300 font-semibold">{materialCount} Materials</span>
              </div>
            </div>
          </div>

          {/* Status Toast Banner */}
          {exportStatusMessage && (
            <div className="p-2 bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] font-mono flex items-center justify-between gap-1.5 rounded-xs animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{exportStatusMessage}</span>
              </div>
              <span className="text-[9px] text-cyan-400 font-bold px-1.5 py-0.2 bg-cyan-900/60 rounded-xs">JSON</span>
            </div>
          )}

          {/* Primary Action: Export to Flutter */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              id="export-to-flutter-button"
              onClick={handleExportToFlutter}
              className={`w-full py-2 px-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 rounded-xs border transition-all duration-200 ${
                copiedFlutterJson
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-gradient-to-r from-cyan-950/70 via-cyan-900/50 to-slate-900 border-cyan-400 text-cyan-200 hover:text-white hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              }`}
            >
              {copiedFlutterJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span>FLUTTER JSON COPIED TO CLIPBOARD!</span>
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EXPORT TO FLUTTER (COPY JSON)</span>
                </>
              )}
            </button>

            {/* Toggle JSON preview button */}
            <div className="flex items-center justify-between text-[10px] font-mono px-1 text-slate-400">
              <span className="text-slate-400">Flutter telemetry payload:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowJsonPreview(!showJsonPreview);
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
              >
                <FileJson className="w-3 h-3" />
                <span>{showJsonPreview ? 'Hide JSON Block' : 'View JSON Block'}</span>
              </button>
            </div>

            {/* Expandable JSON Data Block Preview */}
            {showJsonPreview && (
              <div className="relative mt-1 p-2 bg-black/80 border border-cyan-500/40 rounded-xs font-mono text-[9.5px] leading-relaxed max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-cyan-500/20 text-cyan-400">
                  <span className="font-bold flex items-center gap-1">
                    <FileJson className="w-3 h-3 text-cyan-400" />
                    <span>flutter_geometry_telemetry.json</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportToFlutter(e);
                    }}
                    className="px-1.5 py-0.5 bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 text-[9px] flex items-center gap-1 rounded-xs"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{copiedFlutterJson ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-cyan-200/90 whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
                  {getFlutterJsonTelemetry()}
                </pre>
              </div>
            )}
          </div>

          {/* Secondary Actions Bar */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-cyan-500/20">
            <button
              type="button"
              id="action-rotate-3d-button"
              onClick={() => setIsRotating(!isRotating)}
              className={`py-1.5 px-2 text-[10px] font-mono flex items-center justify-center gap-1 rounded-xs border transition-colors cursor-pointer ${
                isRotating
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isRotating ? 'Pause 3D rotation' : 'Start 3D rotation'}
            >
              <Rotate3d className={`w-3 h-3 ${isRotating ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
              <span>{isRotating ? 'PAUSE 3D' : 'ROTATE 3D'}</span>
            </button>

            {onOpenComparator && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenComparator();
                }}
                className="py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 text-[10px] font-mono flex items-center justify-center gap-1 rounded-xs transition-colors cursor-pointer"
                title="Compare this model in Synthesis Comparator"
              >
                <Scale className="w-3 h-3 text-emerald-400" />
                <span>DIFF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySpecs}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center justify-center gap-1 rounded-xs transition-colors"
            >
              {copiedSpecs ? <Check className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3" />}
              <span>{copiedSpecs ? 'SPECS COPIED' : 'COPY RAW SPECS'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExportStatusMessage(`Initiated .GLB packaging: ${modelName}.glb (${fileSize})`);
                setTimeout(() => setExportStatusMessage(null), 3500);
              }}
              className="flex-1 py-1.5 px-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-[10px] font-mono flex items-center justify-center gap-1 rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT .GLB</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

