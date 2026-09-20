import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Rotate3d,
  Scale,
  TriangleAlert,
} from 'lucide-react';
import '@google/model-viewer';
import {
  stepToDerivedGlb,
  type StepDerivedPreview,
} from '../services/stepPreview';

const findDirectUrl = (
  props: any,
  formats: string[],
): string | undefined => {
  const values = [
    props?.modelUrl,
    props?.glbUrl,
    props?.stepUrl,
    props?.downloadUrl,
    props?.assetUrl,
  ];

  for (const value of values) {
    if (!value) continue;
    const lower = String(value).toLowerCase();
    if (
      formats.some((format) =>
        lower.includes(`.${format}`)
      )
    ) {
      return String(value);
    }
  }

  return undefined;
};

export const ModelViewer3D: React.FC<any> = (props) => {
  const {
    modelName = 'Verified engineering artifact',
    vertices = 0,
    polygons = 0,
    renderTime = '',
    fileSize,
    textureComplexity,
    meshDensity,
    dimensions,
    uvChannels,
    drawCalls,
    materialCount,
    dracoCompression,
    provider,
    sha256,
    effectStatus,
    onOpenComparator,
  } = props;

  const directGlb = useMemo(
    () => findDirectUrl(props, ['glb', 'gltf']),
    [props],
  );

  const stepUrl = useMemo(
    () => findDirectUrl(props, ['step', 'stp']),
    [props],
  );

  const [derived, setDerived] =
    useState<StepDerivedPreview | null>(null);
  const [deriveError, setDeriveError] =
    useState<string | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let disposableUrl: string | undefined;

    setDerived(null);
    setDeriveError(null);

    if (directGlb || !stepUrl) {
      return () => undefined;
    }

    setDeriving(true);

    void stepToDerivedGlb(stepUrl)
      .then((preview) => {
        disposableUrl = preview.url;
        if (!cancelled) {
          setDerived(preview);
          setDeriving(false);
        }
      })
      .catch((error: any) => {
        if (!cancelled) {
          setDeriveError(error?.message || String(error));
          setDeriving(false);
        }
      });

    return () => {
      cancelled = true;
      if (disposableUrl) {
        URL.revokeObjectURL(disposableUrl);
      }
    };
  }, [directGlb, stepUrl]);

  const previewUrl = directGlb || derived?.url;
  const shownVertices = derived?.vertices ?? vertices;
  const shownPolygons = derived?.polygons ?? polygons;

  const previewLabel = directGlb
    ? 'REAL GLB ARTIFACT'
    : derived
    ? 'REAL STEP-DERIVED GLB'
    : 'CAD VERIFIED';

  const copyTelemetry = async () => {
    const payload = {
      modelName,
      provider,
      effectStatus,
      format: directGlb
        ? 'GLB'
        : stepUrl
        ? 'STEP -> derived GLB'
        : 'verified artifact',
      vertices: shownVertices,
      triangles: shownPolygons,
      dimensions,
      fileSize,
      renderTime,
      sha256,
      meshDensity,
      textureComplexity,
      uvChannels,
      drawCalls,
      materialCount,
      dracoCompression,
    };

    await navigator.clipboard.writeText(
      JSON.stringify(payload, null, 2),
    );

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="w-full max-w-[370px] my-2 bg-slate-950 border border-cyan-500/70 clip-faceted-sm overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.18)]">
      <div
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-cyan-500/40 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 min-w-0">
          <Box className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {String(modelName).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenComparator && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenComparator();
              }}
              className="px-1.5 py-0.5 text-[10px] bg-emerald-950 border border-emerald-500/50 text-emerald-300 flex items-center gap-1"
            >
              <Scale className="w-3 h-3" />
              COMPARE
            </button>
          )}

          <span className="px-1.5 py-0.5 text-[9px] border border-cyan-500/40 text-cyan-300">
            {directGlb ? 'REAL GLB' : stepUrl ? 'STEP → GLB' : 'VERIFIED'}
          </span>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-cyan-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-cyan-300" />
          )}
        </div>
      </div>

      <div className="relative min-h-56 bg-black flex items-center justify-center">
        {previewUrl ? (
          React.createElement('model-viewer', {
            key: `${viewerKey}-${previewUrl}`,
            src: previewUrl,
            alt: `Verified 3D preview for ${modelName}`,
            'camera-controls': true,
            ...(autoRotate ? { 'auto-rotate': true } : {}),
            'shadow-intensity': '1',
            'interaction-prompt': 'none',
            style: {
              width: '100%',
              height: '260px',
              background: '#020617',
            },
          })
        ) : deriving ? (
          <div className="p-8 text-center font-mono">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-cyan-400 animate-spin" />
            <div className="text-cyan-300 text-xs font-bold">
              TRIANGULATING VERIFIED STEP
            </div>
            <div className="text-slate-500 text-[10px] mt-1">
              OCCT/WASM → derived GLB preview
            </div>
          </div>
        ) : (
          <div className="p-8 text-center font-mono">
            <TriangleAlert className="w-8 h-8 mx-auto mb-3 text-amber-400" />
            <div className="text-amber-300 text-xs font-bold">
              NO ARTIFACT-DERIVED 3D PREVIEW
            </div>
            <div className="text-slate-400 text-[10px] mt-2">
              Verified engineering artifacts are preserved.
              GOLEM will not substitute procedural geometry.
            </div>
            {deriveError && (
              <div className="mt-2 text-[9px] text-red-300 break-words">
                {deriveError}
              </div>
            )}
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setAutoRotate((value) => !value)}
            title={autoRotate ? 'Pause real 3D rotation' : 'Resume real 3D rotation'}
            className={`p-2 border ${
              autoRotate
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
          >
            <Rotate3d className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            title="Open real artifact telemetry"
            className={`p-2 border ${
              expanded
                ? 'bg-cyan-500 text-black border-cyan-300'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-400'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setViewerKey((value) => value + 1)}
            title="Reset real 3D camera"
            className="p-2 bg-slate-900/90 border border-cyan-500/40 text-cyan-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {previewUrl && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/85 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 whitespace-nowrap flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {previewLabel}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full px-3 py-1.5 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-cyan-300"
      >
        <span>
          {expanded
            ? 'COLLAPSE REAL ARTIFACT TELEMETRY'
            : 'TAP TO EXPAND REAL 3D DETAILS & TELEMETRY'}
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="px-3 py-2 bg-slate-900/90 border-t border-cyan-500/20 font-mono text-[10px] flex items-center justify-between">
        <div className="text-slate-400">
          TRIANGLES:{' '}
          <span className="text-cyan-300">
            {Number(shownPolygons || 0).toLocaleString()}
          </span>
          {' · '}
          VERTICES:{' '}
          <span className="text-cyan-300">
            {Number(shownVertices || 0).toLocaleString()}
          </span>
        </div>
        <span className="text-emerald-400">{renderTime}</span>
      </div>

      {expanded && (
        <div className="border-t border-cyan-500/30 bg-slate-950 p-3 space-y-2 font-mono">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">PROVIDER</div>
              <div className="text-cyan-200 break-words">
                {provider || 'unknown'}
              </div>
            </div>
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">EFFECT</div>
              <div className="text-emerald-300 break-words">
                {effectStatus || 'verified'}
              </div>
            </div>
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">DIMENSIONS</div>
              <div className="text-cyan-200 break-words">
                {dimensions || 'not reported'}
              </div>
            </div>
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">ARTIFACT SIZE</div>
              <div className="text-cyan-200">
                {fileSize || 'not reported'}
              </div>
            </div>
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">MESH / SOLID</div>
              <div className="text-cyan-200 break-words">
                {meshDensity || 'verified geometry'}
              </div>
            </div>
            <div className="p-2 border border-cyan-500/20">
              <div className="text-slate-500">MATERIALS</div>
              <div className="text-cyan-200">
                {materialCount ?? 0}
              </div>
            </div>
          </div>

          {props?.characterName && (
            <div className="p-2 border border-fuchsia-500/30 bg-fuchsia-950/10">
              <div className="text-[9px] text-fuchsia-300 mb-2">CHARACTER PROFILE</div>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div><div className="text-slate-500">NAME / SPECIES</div><div className="text-fuchsia-200">{props.characterName} / {props.species || 'n/a'}</div></div>
                <div><div className="text-slate-500">RIG</div><div className="text-fuchsia-200">{props.rigPresent ? 'YES' : 'NO'}</div></div>
                <div><div className="text-slate-500">MODULAR PARTS</div><div className="text-fuchsia-200">{props.modularParts ?? 'n/a'}</div></div>
                <div><div className="text-slate-500">TAIL / SPINES</div><div className="text-fuchsia-200">{props.tailSegments ?? 'n/a'} / {props.backSpines ?? 'n/a'}</div></div>
              </div>
              {props.profileId && <div className="mt-2 text-[8px] text-slate-500 break-all">PROFILE: {props.profileId}</div>}
              {Array.isArray(props.modifiers) && props.modifiers.length > 0 && (
                <div className="mt-2 text-[8px] text-cyan-300 break-words">VARIANT: {props.modifiers.join(' · ')}</div>
              )}
            </div>
          )}

          {sha256 && (
            <div className="p-2 border border-cyan-500/20 text-[9px]">
              <div className="text-slate-500 mb-1">SHA256</div>
              <div className="text-cyan-200 break-all">{sha256}</div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void copyTelemetry()}
              className="flex-1 px-2 py-2 border border-cyan-500/40 text-cyan-300 text-[9px] flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'COPIED' : 'COPY REAL TELEMETRY JSON'}
            </button>

            {props?.downloadUrl && (
              <a
                href={props.downloadUrl}
                download
                className="flex-1 px-2 py-2 border border-emerald-500/40 text-emerald-300 text-[9px] flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                VERIFIED ARTIFACT
              </a>
            )}
          </div>

          {(textureComplexity ||
            uvChannels ||
            drawCalls ||
            dracoCompression) && (
            <div className="text-[9px] text-slate-500">
              Optional render metadata:{' '}
              {textureComplexity || 'n/a'} · UV {uvChannels ?? 0} ·
              DC {drawCalls ?? 0} · {dracoCompression || 'no compression'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
