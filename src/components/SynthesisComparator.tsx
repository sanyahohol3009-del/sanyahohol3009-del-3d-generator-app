import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  SplitSquareVertical,
  Layers,
  Rotate3d,
  Grid3X3,
  Cpu,
  HardDrive,
  Zap,
  Download,
  Copy,
  Check,
  Scale,
  X,
  Maximize2,
  Minimize2,
  Box,
  ChevronDown,
  Sparkles,
  Activity,
  Sliders,
  Eye,
  FileCode,
  Gauge
} from 'lucide-react';
import { SynthesisHistoryItem, ModelDetails } from '../types';

export interface SynthesisComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: SynthesisHistoryItem[];
  initialModelAId?: string;
  initialModelBId?: string;
}

export type WireframeRenderMode = 'wireframe' | 'faceted' | 'pointcloud' | 'density';

// Procedural 3D Geometry Generators for different synthesized model archetypes
interface GeometryData {
  vertices: { x: number; y: number; z: number }[];
  edges: [number, number][];
  faces?: [number, number, number][];
  accentNodes?: number[];
  label: string;
}

function generateGeometryForModel(details: ModelDetails): GeometryData {
  const name = details.name.toLowerCase();

  // Archetype 1: Crystalline Kinetic Core / Spherical Polyhedral
  if (name.includes('core') || name.includes('crystalline') || name.includes('kinetic')) {
    const vertices: { x: number; y: number; z: number }[] = [
      // Central Octahedron Core
      { x: 0, y: -45, z: 0 },
      { x: 0, y: 45, z: 0 },
      { x: -40, y: 0, z: -40 },
      { x: 40, y: 0, z: -40 },
      { x: 40, y: 0, z: 40 },
      { x: -40, y: 0, z: 40 },
      // Orbital Ring 1
      { x: -60, y: -15, z: 0 },
      { x: 0, y: -20, z: 60 },
      { x: 60, y: -15, z: 0 },
      { x: 0, y: -20, z: -60 },
      // Orbital Ring 2 (Tilted)
      { x: -45, y: 35, z: -35 },
      { x: 45, y: 35, z: -35 },
      { x: 45, y: 35, z: 35 },
      { x: -45, y: 35, z: 35 },
      // Center Point
      { x: 0, y: 0, z: 0 },
    ];

    const edges: [number, number][] = [
      // Octahedron top pyramid
      [0, 2], [0, 3], [0, 4], [0, 5],
      // Octahedron bottom pyramid
      [1, 2], [1, 3], [1, 4], [1, 5],
      // Equatorial ring
      [2, 3], [3, 4], [4, 5], [5, 2],
      // Outer Gimbal Ring 1
      [6, 7], [7, 8], [8, 9], [9, 6],
      // Outer Gimbal Ring 2
      [10, 11], [11, 12], [12, 13], [13, 10],
      // Radial struts
      [2, 6], [4, 8], [3, 11], [5, 13],
      [0, 14], [1, 14],
    ];

    const faces: [number, number, number][] = [
      [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
      [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
    ];

    return { vertices, edges, faces, accentNodes: [0, 1, 14], label: 'Orbital Crystalline Lattice' };
  }

  // Archetype 2: Monolith / Cybernetic Ward / Obelisk
  if (name.includes('monolith') || name.includes('ward') || name.includes('tower') || name.includes('cybernetic')) {
    const vertices: { x: number; y: number; z: number }[] = [
      // Top Apex Cap
      { x: 0, y: -65, z: 0 },
      // Upper Tier
      { x: -18, y: -45, z: 18 },
      { x: 18, y: -45, z: 18 },
      { x: 18, y: -45, z: -18 },
      { x: -18, y: -45, z: -18 },
      // Mid Conduit Segment
      { x: -24, y: -5, z: 24 },
      { x: 24, y: -5, z: 24 },
      { x: 24, y: -5, z: -24 },
      { x: -24, y: -5, z: -24 },
      // Power Node Matrix
      { x: 0, y: -5, z: 34 },
      { x: 0, y: -5, z: -34 },
      // Lower Tier
      { x: -32, y: 35, z: 32 },
      { x: 32, y: 35, z: 32 },
      { x: 32, y: 35, z: -32 },
      { x: -32, y: 35, z: -32 },
      // Base Pedestal
      { x: -44, y: 65, z: 44 },
      { x: 44, y: 65, z: 44 },
      { x: 44, y: 65, z: -44 },
      { x: -44, y: 65, z: -44 },
    ];

    const edges: [number, number][] = [
      // Apex to upper tier
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
      // Upper tier to mid
      [1, 5], [2, 6], [3, 7], [4, 8],
      [5, 6], [6, 7], [7, 8], [8, 5],
      // Core conduits
      [5, 9], [6, 9], [7, 10], [8, 10],
      // Mid to lower tier
      [5, 11], [6, 12], [7, 13], [8, 14],
      [11, 12], [12, 13], [13, 14], [14, 11],
      // Lower tier to base
      [11, 15], [12, 16], [13, 17], [14, 18],
      [15, 16], [16, 17], [17, 18], [18, 15],
      // Diagonal cross bracings
      [1, 6], [2, 7], [3, 8], [4, 5],
      [11, 16], [12, 17], [13, 18], [14, 15],
    ];

    const faces: [number, number, number][] = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [1, 2, 6], [2, 3, 7], [3, 4, 8], [4, 1, 5],
    ];

    return { vertices, edges, faces, accentNodes: [0, 9, 10], label: 'Cybernetic Obelisk Ward' };
  }

  // Archetype 3: Default Golem / Guardian / Humanoid Monolith
  const vertices: { x: number; y: number; z: number }[] = [
    // Head/Crest
    { x: 0, y: -52, z: 0 },
    { x: -22, y: -38, z: 22 },
    { x: 22, y: -38, z: 22 },
    { x: 22, y: -38, z: -22 },
    { x: -22, y: -38, z: -22 },
    // Shoulders
    { x: -48, y: -16, z: 26 },
    { x: 48, y: -16, z: 26 },
    { x: 52, y: -16, z: -26 },
    { x: -52, y: -16, z: -26 },
    // Core Crystal (Center of chest)
    { x: 0, y: 0, z: 38 },
    { x: 0, y: 0, z: -38 },
    // Torso / Waist
    { x: -32, y: 26, z: 22 },
    { x: 32, y: 26, z: 22 },
    { x: 32, y: 26, z: -22 },
    { x: -32, y: 26, z: -22 },
    // Base Plinth
    { x: -42, y: 58, z: 28 },
    { x: 42, y: 58, z: 28 },
    { x: 42, y: 58, z: -28 },
    { x: -42, y: 58, z: -28 },
    { x: 0, y: 68, z: 0 },
  ];

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
    [1, 5], [2, 6], [3, 7], [4, 8],
    [5, 6], [6, 7], [7, 8], [8, 5],
    [5, 9], [6, 9], [7, 10], [8, 10],
    [9, 11], [9, 12], [10, 13], [10, 14],
    [11, 12], [12, 13], [13, 14], [14, 11],
    [5, 11], [6, 12], [7, 13], [8, 14],
    [11, 15], [12, 16], [13, 17], [14, 18],
    [15, 16], [16, 17], [17, 18], [18, 15],
    [15, 19], [16, 19], [17, 19], [18, 19],
    // High-poly diagonal struts
    [1, 3], [2, 4], [5, 7], [6, 8],
  ];

  const faces: [number, number, number][] = [
    [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
    [1, 2, 6], [2, 6, 5], [5, 6, 9], [7, 8, 10],
    [11, 12, 16], [12, 13, 17], [13, 14, 18], [14, 11, 15],
  ];

  return { vertices, edges, faces, accentNodes: [0, 9, 10, 19], label: 'Faceted Guardian Topology' };
}

export const SynthesisComparator: React.FC<SynthesisComparatorProps> = ({
  isOpen,
  onClose,
  historyItems,
  initialModelAId,
  initialModelBId,
}) => {
  // Ensure we have at least 2 selectable models
  const safeHistory = useMemo(() => {
    if (historyItems.length >= 2) return historyItems;

    // Fallback seed models if fewer exist in history
    return [
      ...historyItems,
      {
        id: 'fallback-1',
        messageId: 'fb-1',
        modelName: 'Runic Stone Guardian',
        timestamp: '14:23',
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
      {
        id: 'fallback-2',
        messageId: 'fb-2',
        modelName: 'Crystalline Kinetic Core',
        timestamp: '12:45',
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
    ];
  }, [historyItems]);

  // Selected Model IDs
  const [selectedIdA, setSelectedIdA] = useState<string>(() => {
    if (initialModelAId && safeHistory.some((i) => i.id === initialModelAId)) {
      return initialModelAId;
    }
    return safeHistory[0]?.id || '';
  });

  const [selectedIdB, setSelectedIdB] = useState<string>(() => {
    if (initialModelBId && safeHistory.some((i) => i.id === initialModelBId)) {
      return initialModelBId;
    }
    // Select second item distinct from A
    const second = safeHistory.find((i) => i.id !== selectedIdA);
    return second?.id || safeHistory[1]?.id || safeHistory[0]?.id || '';
  });

  // Keep synced if props change
  useEffect(() => {
    if (initialModelAId && safeHistory.some((i) => i.id === initialModelAId)) {
      setSelectedIdA(initialModelAId);
    }
    if (initialModelBId && safeHistory.some((i) => i.id === initialModelBId)) {
      setSelectedIdB(initialModelBId);
    }
  }, [initialModelAId, initialModelBId, safeHistory]);

  const modelA = useMemo(
    () => safeHistory.find((i) => i.id === selectedIdA) || safeHistory[0],
    [safeHistory, selectedIdA]
  );
  const modelB = useMemo(
    () => safeHistory.find((i) => i.id === selectedIdB) || safeHistory[1] || safeHistory[0],
    [safeHistory, selectedIdB]
  );

  // Comparator Controls
  const [syncOrbit, setSyncOrbit] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<WireframeRenderMode>('wireframe');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Rotation Angles
  const angleARef = useRef<number>(0);
  const angleBRef = useRef<number>(0);

  // Drag interaction states
  const isDraggingRef = useRef<'A' | 'B' | null>(null);
  const lastMouseXRef = useRef<number>(0);

  // Canvas Refs
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  // Swap Models A <-> B
  const handleSwapModels = () => {
    setSelectedIdA(selectedIdB);
    setSelectedIdB(selectedIdA);
  };

  // Drag handlers for Canvas A
  const handleStartDrag = (which: 'A' | 'B', clientX: number) => {
    isDraggingRef.current = which;
    lastMouseXRef.current = clientX;
  };

  const handleMoveDrag = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - lastMouseXRef.current;
    lastMouseXRef.current = clientX;
    const rad = deltaX * 0.015;

    if (syncOrbit) {
      angleARef.current += rad;
      angleBRef.current += rad;
    } else {
      if (isDraggingRef.current === 'A') angleARef.current += rad;
      if (isDraggingRef.current === 'B') angleBRef.current += rad;
    }
  };

  const handleEndDrag = () => {
    isDraggingRef.current = null;
  };

  // Reset or preset angles
  const handleSetAnglePreset = (preset: 'front' | 'isometric' | 'side' | 'top') => {
    let target = 0;
    if (preset === 'isometric') target = Math.PI / 4;
    if (preset === 'side') target = Math.PI / 2;
    if (preset === 'top') target = Math.PI;

    angleARef.current = target;
    angleBRef.current = target;
  };

  // Animation & Rendering loop
  useEffect(() => {
    if (!isOpen) return;

    let animationFrameId: number;

    const renderCanvas = (
      canvas: HTMLCanvasElement | null,
      model: SynthesisHistoryItem,
      angle: number,
      theme: 'cyan' | 'emerald'
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const fov = 175 * zoomScale;

      ctx.clearRect(0, 0, width, height);

      // Color Palette configuration
      const isCyan = theme === 'cyan';
      const baseEdgeColor = isCyan ? 'rgba(0, 240, 255, 0.85)' : 'rgba(16, 185, 129, 0.85)';
      const thinEdgeColor = isCyan ? 'rgba(0, 240, 255, 0.35)' : 'rgba(16, 185, 129, 0.35)';
      const nodeColor = isCyan ? '#38bdf8' : '#34d399';
      const accentGlow = isCyan ? '#00f0ff' : '#10b981';
      const faceFillColor = isCyan ? 'rgba(0, 240, 255, 0.08)' : 'rgba(16, 185, 129, 0.08)';

      const geom = generateGeometryForModel(model.modelDetails);

      // 3D Projection
      const projected = geom.vertices.map((v) => {
        // Rotate around Y
        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.x * sinY + v.z * cosY;

        // Subtle tilt around X (isometric look)
        const tilt = 0.28;
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

      // 1. Background holographic grid lines
      ctx.strokeStyle = isCyan ? 'rgba(0, 240, 255, 0.08)' : 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy + 32, 55 * zoomScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy + 32, 85 * zoomScale, 0, Math.PI * 2);
      ctx.stroke();

      // Axis crosshair in bottom corner
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(18, height - 18);
      ctx.lineTo(38, height - 18);
      ctx.moveTo(18, height - 18);
      ctx.lineTo(18, height - 38);
      ctx.stroke();

      // 2. Render Faceted Polygon Faces (if in faceted or density mode)
      if ((renderMode === 'faceted' || renderMode === 'density') && geom.faces) {
        geom.faces.forEach(([i1, i2, i3]) => {
          const p1 = projected[i1];
          const p2 = projected[i2];
          const p3 = projected[i3];
          if (!p1 || !p2 || !p3) return;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();

          if (renderMode === 'density') {
            // Gradient heatmap based on depth / vertex density
            const depth = (p1.z + p2.z + p3.z) / 3;
            ctx.fillStyle = depth < 160 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(0, 240, 255, 0.12)';
          } else {
            ctx.fillStyle = faceFillColor;
          }
          ctx.fill();
        });
      }

      // 3. Render Wireframe Edges
      if (renderMode !== 'pointcloud') {
        geom.edges.forEach(([i1, i2], edgeIndex) => {
          const p1 = projected[i1];
          const p2 = projected[i2];
          if (!p1 || !p2) return;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          const isSub = edgeIndex > 16;
          ctx.strokeStyle = isSub ? thinEdgeColor : baseEdgeColor;
          ctx.lineWidth = isSub ? 0.9 : 1.5;
          ctx.stroke();
        });
      }

      // 4. Render Vertex Point Cloud Nodes
      projected.forEach((p, nodeIdx) => {
        const isAccent = geom.accentNodes?.includes(nodeIdx);
        const nodeRadius = isAccent ? 3.2 : renderMode === 'pointcloud' ? 2.6 : 1.8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isAccent ? '#ffffff' : nodeColor;

        if (isAccent) {
          ctx.shadowColor = accentGlow;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fill();
        }
      });

      // 5. Draw Archetype Topology Badge inside canvas
      ctx.font = '9px monospace';
      ctx.fillStyle = isCyan ? 'rgba(0, 240, 255, 0.7)' : 'rgba(16, 185, 129, 0.7)';
      ctx.fillText(`TOPOLOGY: ${geom.label.toUpperCase()}`, 12, 18);
      ctx.fillText(`TRIS: ${(model.modelDetails.polygons || 12480).toLocaleString()} // VTX: ${(model.modelDetails.vertices || 6420).toLocaleString()}`, 12, 30);
    };

    const loop = () => {
      if (isRotating && !isDraggingRef.current) {
        angleARef.current += 0.012;
        if (syncOrbit) {
          angleBRef.current = angleARef.current;
        } else {
          angleBRef.current += 0.012;
        }
      }

      renderCanvas(canvasARef.current, modelA, angleARef.current, 'cyan');
      renderCanvas(canvasBRef.current, modelB, angleBRef.current, 'emerald');

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, modelA, modelB, isRotating, syncOrbit, renderMode, zoomScale]);

  // Delta calculation helpers
  const detailsA = modelA.modelDetails;
  const detailsB = modelB.modelDetails;

  const polyA = detailsA.polygons || 12480;
  const polyB = detailsB.polygons || 21500;
  const polyDelta = ((polyB - polyA) / polyA) * 100;

  const vtxA = detailsA.vertices || 6420;
  const vtxB = detailsB.vertices || 11200;
  const vtxDelta = ((vtxB - vtxA) / vtxA) * 100;

  const parseSizeMb = (sizeStr?: string): number => {
    if (!sizeStr) return 4.8;
    const match = sizeStr.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 4.8;
  };

  const sizeA = parseSizeMb(detailsA.fileSize);
  const sizeB = parseSizeMb(detailsB.fileSize);
  const sizeDelta = ((sizeB - sizeA) / sizeA) * 100;

  // Algorithmic Verdict
  const verdict = useMemo(() => {
    const isALighter = sizeA < sizeB;
    const isBHigherDensity = polyB > polyA;

    return {
      lighterModel: isALighter ? detailsA.name : detailsB.name,
      lighterDeltaPercent: Math.abs(sizeDelta).toFixed(1),
      higherDensityModel: isBHigherDensity ? detailsB.name : detailsA.name,
      densityDeltaPercent: Math.abs(polyDelta).toFixed(1),
      summary: `${isALighter ? detailsA.name : detailsB.name} is ${Math.abs(sizeDelta).toFixed(1)}% lighter on GPU memory footprint, optimizing real-time WebGL frame delivery. ${isBHigherDensity ? detailsB.name : detailsA.name} provides ${Math.abs(polyDelta).toFixed(1)}% greater polygon density for high-fidelity geometric curvature.`,
    };
  }, [detailsA.name, detailsB.name, sizeA, sizeB, polyA, polyB, sizeDelta, polyDelta]);

  // Copy Comparative Telemetry Report
  const handleCopyReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      comparator_mode: 'Side-by-Side Dual Telemetry Diff',
      model_A: {
        id: modelA.id,
        name: detailsA.name,
        polygons: polyA,
        vertices: vtxA,
        file_size: detailsA.fileSize,
        mesh_density: detailsA.meshDensity,
        dimensions: detailsA.dimensions,
        uv_channels: detailsA.uvChannels,
        draw_calls: detailsA.drawCalls,
        draco_compression: detailsA.dracoCompression,
        texture_specs: detailsA.textureComplexity,
      },
      model_B: {
        id: modelB.id,
        name: detailsB.name,
        polygons: polyB,
        vertices: vtxB,
        file_size: detailsB.fileSize,
        mesh_density: detailsB.meshDensity,
        dimensions: detailsB.dimensions,
        uv_channels: detailsB.uvChannels,
        draw_calls: detailsB.drawCalls,
        draco_compression: detailsB.dracoCompression,
        texture_specs: detailsB.textureComplexity,
      },
      telemetry_deltas: {
        polygon_delta_pct: `${polyDelta >= 0 ? '+' : ''}${polyDelta.toFixed(1)}%`,
        vertex_delta_pct: `${vtxDelta >= 0 ? '+' : ''}${vtxDelta.toFixed(1)}%`,
        file_size_delta_pct: `${sizeDelta >= 0 ? '+' : ''}${sizeDelta.toFixed(1)}%`,
      },
      verdict: verdict.summary,
    };

    const text = JSON.stringify(report, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      {/* Container Dialog */}
      <div
        id="synthesis-comparator-dialog"
        className="w-full max-w-5xl bg-slate-950 border border-cyan-500/70 clip-faceted-lg shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col my-auto max-h-[94vh] overflow-hidden"
      >
        {/* ========================================================= */}
        {/* HEADER BAR */}
        {/* ========================================================= */}
        <div className="p-3 sm:px-4 bg-black/90 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-950 border border-cyan-400 text-cyan-300 clip-faceted-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300 tracking-wider">
                  SYNTHESIS COMPARATOR // 3D DIFF & GEOMETRY MATRIX
                </span>
                <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 rounded-xs">
                  DUAL-VIEW HUD
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Side-by-side parametric comparison of topological complexity, vertex count, and Draco compression efficiency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className={`py-1 px-2.5 text-[10px] font-mono font-bold flex items-center gap-1.5 clip-faceted-sm border transition-all cursor-pointer ${
                copiedReport
                  ? 'bg-emerald-500 text-black border-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-300'
              }`}
              title="Copy formatted comparative telemetry JSON"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'DIFF COPIED' : 'EXPORT DIFF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 clip-faceted-sm transition-colors cursor-pointer"
              title="Close comparator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* ========================================================= */}
          {/* SELECTORS ROW (MODEL A <-> MODEL B) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center bg-black/60 p-2.5 border border-cyan-500/25 clip-faceted-sm">
            {/* Model A Dropdown */}
            <div className="sm:col-span-5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Box className="w-3 h-3 text-cyan-400" />
                  <span>MODEL A (PRIMARY LATTICE)</span>
                </span>
                <span className="text-slate-400 text-[9px]">ID: {modelA.id}</span>
              </div>
              <div className="relative">
                <select
                  value={selectedIdA}
                  onChange={(e) => setSelectedIdA(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/50 text-cyan-200 text-xs font-mono p-2 pr-8 focus:outline-hidden focus:border-cyan-300 clip-faceted-sm cursor-pointer"
                >
                  {safeHistory.map((item) => (
                    <option key={`a-${item.id}`} value={item.id} className="bg-slate-950 text-slate-200">
                      {item.modelName} ({item.modelDetails.polygons?.toLocaleString()} tris • {item.timestamp})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwapModels}
                className="p-2 bg-slate-900 hover:bg-cyan-950 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 rounded-full transition-transform active:scale-95 cursor-pointer"
                title="Swap Model A ↔ Model B"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Model B Dropdown */}
            <div className="sm:col-span-5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Box className="w-3 h-3 text-emerald-400" />
                  <span>MODEL B (SECONDARY LATTICE)</span>
                </span>
                <span className="text-slate-400 text-[9px]">ID: {modelB.id}</span>
              </div>
              <div className="relative">
                <select
                  value={selectedIdB}
                  onChange={(e) => setSelectedIdB(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/50 text-emerald-200 text-xs font-mono p-2 pr-8 focus:outline-hidden focus:border-emerald-300 clip-faceted-sm cursor-pointer"
                >
                  {safeHistory.map((item) => (
                    <option key={`b-${item.id}`} value={item.id} className="bg-slate-950 text-slate-200">
                      {item.modelName} ({item.modelDetails.polygons?.toLocaleString()} tris • {item.timestamp})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEWPORT CONTROLS TOOLBAR */}
          {/* ========================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 px-3 py-1.5 border border-cyan-500/20 text-[10px] font-mono">
            {/* Left: Render Modes */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1 hidden sm:inline">RENDER MODE:</span>
              {(['wireframe', 'faceted', 'pointcloud', 'density'] as WireframeRenderMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRenderMode(mode)}
                  className={`px-2 py-0.5 clip-faceted-sm border uppercase transition-colors cursor-pointer ${
                    renderMode === mode
                      ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/40'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Right: Orbit Sync & Presets */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSyncOrbit((prev) => !prev)}
                className={`px-2 py-0.5 clip-faceted-sm border flex items-center gap-1 transition-colors cursor-pointer ${
                  syncOrbit
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
                title="Toggle synchronized 3D rotation between both viewports"
              >
                <Rotate3d className="w-3 h-3" />
                <span>SYNC ORBIT: {syncOrbit ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRotating((prev) => !prev)}
                className={`px-2 py-0.5 clip-faceted-sm border transition-colors cursor-pointer ${
                  isRotating
                    ? 'bg-slate-900 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {isRotating ? 'PAUSE' : 'AUTO-ROTATE'}
              </button>

              <div className="hidden md:flex items-center gap-1 pl-2 border-l border-cyan-500/20">
                <span className="text-slate-500 text-[9px]">ANGLE:</span>
                <button
                  type="button"
                  onClick={() => handleSetAnglePreset('front')}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 clip-faceted-sm"
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAnglePreset('isometric')}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 clip-faceted-sm"
                >
                  Iso
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAnglePreset('side')}
                  className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 clip-faceted-sm"
                >
                  Side
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DUAL 3D WIREFRAME CANVASES */}
          {/* ========================================================= */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            onMouseMove={(e) => handleMoveDrag(e.clientX)}
            onMouseUp={handleEndDrag}
            onTouchMove={(e) => {
              if (e.touches[0]) handleMoveDrag(e.touches[0].clientX);
            }}
            onTouchEnd={handleEndDrag}
          >
            {/* Viewport A (Cyan Theme) */}
            <div className="relative bg-slate-950 border border-cyan-500/50 clip-faceted-sm overflow-hidden flex flex-col group">
              <div className="px-2.5 py-1.5 bg-black/80 border-b border-cyan-500/30 flex items-center justify-between text-[10px] font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  MODEL A // {detailsA.name}
                </span>
                <span className="text-cyan-400 font-bold">{detailsA.fileSize || '4.82 MB'}</span>
              </div>

              <div
                className="relative h-56 sm:h-64 flex items-center justify-center cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleStartDrag('A', e.clientX)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStartDrag('A', e.touches[0].clientX);
                }}
              >
                <canvas
                  ref={canvasARef}
                  width={420}
                  height={260}
                  className="w-full h-full object-contain"
                />

                {/* Floating HUD Tag */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 pointer-events-none">
                  {detailsA.dimensions || '1.85m × 1.20m × 2.40m'}
                </div>
              </div>
            </div>

            {/* Viewport B (Emerald Theme) */}
            <div className="relative bg-slate-950 border border-emerald-500/50 clip-faceted-sm overflow-hidden flex flex-col group">
              <div className="px-2.5 py-1.5 bg-black/80 border-b border-emerald-500/30 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MODEL B // {detailsB.name}
                </span>
                <span className="text-emerald-400 font-bold">{detailsB.fileSize || '6.75 MB'}</span>
              </div>

              <div
                className="relative h-56 sm:h-64 flex items-center justify-center cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleStartDrag('B', e.clientX)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStartDrag('B', e.touches[0].clientX);
                }}
              >
                <canvas
                  ref={canvasBRef}
                  width={420}
                  height={260}
                  className="w-full h-full object-contain"
                />

                {/* Floating HUD Tag */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 pointer-events-none">
                  {detailsB.dimensions || '1.60m × 1.60m × 1.95m'}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COMPARATIVE TELEMETRY METRICS TABLE */}
          {/* ========================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 px-1">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>GEOMETRY & TOPOLOGY TELEMETRY MATRIX</span>
              </div>
              <span className="text-[10px] text-slate-400">DELTA (B relative to A)</span>
            </div>

            <div className="overflow-x-auto border border-cyan-500/30 clip-faceted-sm bg-slate-950">
              <table className="w-full text-[11px] font-mono text-left">
                <thead>
                  <tr className="bg-black/90 text-slate-400 border-b border-cyan-500/30 text-[10px]">
                    <th className="p-2 sm:px-3">METRIC</th>
                    <th className="p-2 text-cyan-300">MODEL A</th>
                    <th className="p-2 text-emerald-300">MODEL B</th>
                    <th className="p-2 text-right">TOPOLOGY DELTA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {/* Polygons (Tris) */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Polygon Faces (Tris)</span>
                    </td>
                    <td className="p-2 text-cyan-200 font-bold">{polyA.toLocaleString()}</td>
                    <td className="p-2 text-emerald-200 font-bold">{polyB.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                          polyDelta > 0
                            ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                            : polyDelta < 0
                            ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {polyDelta >= 0 ? `+${polyDelta.toFixed(1)}%` : `${polyDelta.toFixed(1)}%`}
                      </span>
                    </td>
                  </tr>

                  {/* Vertices */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Vertex Nodes</span>
                    </td>
                    <td className="p-2 text-cyan-200">{vtxA.toLocaleString()}</td>
                    <td className="p-2 text-emerald-200">{vtxB.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                          vtxDelta > 0
                            ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                            : vtxDelta < 0
                            ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {vtxDelta >= 0 ? `+${vtxDelta.toFixed(1)}%` : `${vtxDelta.toFixed(1)}%`}
                      </span>
                    </td>
                  </tr>

                  {/* File Size */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>GLB Footprint (Compressed)</span>
                    </td>
                    <td className="p-2 text-cyan-200">{detailsA.fileSize || `${sizeA} MB`}</td>
                    <td className="p-2 text-emerald-200">{detailsB.fileSize || `${sizeB} MB`}</td>
                    <td className="p-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                          sizeDelta > 0
                            ? 'bg-red-950/70 border border-red-500/40 text-red-300'
                            : sizeDelta < 0
                            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {sizeDelta >= 0 ? `+${sizeDelta.toFixed(1)}% (Heavier)` : `${sizeDelta.toFixed(1)}% (Lighter)`}
                      </span>
                    </td>
                  </tr>

                  {/* Mesh Density */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Surface Mesh Density</span>
                    </td>
                    <td className="p-2 text-cyan-200">{detailsA.meshDensity || '28.4 tris/cm²'}</td>
                    <td className="p-2 text-emerald-200">{detailsB.meshDensity || '39.8 tris/cm²'}</td>
                    <td className="p-2 text-right text-slate-400 text-[10px]">
                      {detailsA.meshDensity === detailsB.meshDensity ? 'IDENTICAL' : 'VARIABLE RESOLUTION'}
                    </td>
                  </tr>

                  {/* Dimensions */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Bounding Box Dimensions</span>
                    </td>
                    <td className="p-2 text-cyan-200 text-[10px]">{detailsA.dimensions || '1.85m × 1.20m × 2.40m'}</td>
                    <td className="p-2 text-emerald-200 text-[10px]">{detailsB.dimensions || '1.60m × 1.60m × 1.95m'}</td>
                    <td className="p-2 text-right text-slate-400 text-[10px]">Spatial Bound</td>
                  </tr>

                  {/* Texture Complexity */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Shader / Texture Maps</span>
                    </td>
                    <td className="p-2 text-cyan-200 text-[10px] truncate max-w-[140px]">{detailsA.textureComplexity || '4K PBR Multi-channel'}</td>
                    <td className="p-2 text-emerald-200 text-[10px] truncate max-w-[140px]">{detailsB.textureComplexity || '4K Ultra-PBR'}</td>
                    <td className="p-2 text-right text-slate-400 text-[10px]">PBR Pipelines</td>
                  </tr>

                  {/* Draco Compression Profile */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Draco Geometry Compression</span>
                    </td>
                    <td className="p-2 text-cyan-200">{detailsA.dracoCompression || 'Draco L7 (-64%)'}</td>
                    <td className="p-2 text-emerald-200">{detailsB.dracoCompression || 'Draco L7 (-68%)'}</td>
                    <td className="p-2 text-right text-emerald-400 text-[10px]">Optimized GLB</td>
                  </tr>

                  {/* Draw Calls & UVs */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-2 sm:px-3 text-slate-300 font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>UV Channels & Draw Calls</span>
                    </td>
                    <td className="p-2 text-cyan-200">{detailsA.uvChannels || 2} UVs • {detailsA.drawCalls || 1} DC</td>
                    <td className="p-2 text-emerald-200">{detailsB.uvChannels || 3} UVs • {detailsB.drawCalls || 1} DC</td>
                    <td className="p-2 text-right text-slate-400 text-[10px]">GPU Invocations</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DIAGNOSTIC VERDICT SUMMARY BOX */}
          {/* ========================================================= */}
          <div className="p-3 bg-black/80 border border-cyan-500/40 clip-faceted-sm space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ALGORITHMIC VERDICT // COMPARATIVE TELEMETRY</span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
              {verdict.summary}
            </p>
            <div className="pt-1.5 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex items-center justify-between p-1.5 bg-slate-900/80 border border-cyan-500/30 rounded-xs">
                <span className="text-slate-400">Memory Efficiency Pick:</span>
                <span className="text-cyan-300 font-bold">{verdict.lighterModel}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-900/80 border border-emerald-500/30 rounded-xs">
                <span className="text-slate-400">Surface Fidelity Pick:</span>
                <span className="text-emerald-300 font-bold">{verdict.higherDensityModel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER ACTION BAR */}
        {/* ========================================================= */}
        <div className="p-3 bg-black/90 border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-mono">
          <div className="text-slate-400 hidden sm:block">
            ACTIVE LATTICE DIFF: <span className="text-cyan-300">{detailsA.name}</span> vs <span className="text-emerald-300">{detailsB.name}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex-1 sm:flex-none py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 clip-faceted-sm transition-colors cursor-pointer"
            >
              COPY TELEMETRY JSON
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold clip-faceted-sm transition-colors cursor-pointer"
            >
              DISMISS // ESC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
