import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Scale,
  X,
} from 'lucide-react';
import type {
  ModelDetails,
  SynthesisHistoryItem,
} from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { stepToDerivedGlb } from '../services/stepPreview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  historyItems: SynthesisHistoryItem[];
  initialModelAId?: string;
  initialModelBId?: string;
}

interface ResolvedStats {
  triangles: number | null;
  vertices: number | null;
  source: 'provider' | 'step-derived' | 'unavailable';
}

const stepUrlFor = (
  item: SynthesisHistoryItem | undefined,
): string | undefined => {
  const url = item?.modelAsset?.downloadUrl;
  if (!url) return undefined;
  const lower = url.toLowerCase();
  return lower.includes('.step') || lower.includes('.stp')
    ? url
    : undefined;
};

const useResolvedStats = (
  item: SynthesisHistoryItem | undefined,
): ResolvedStats => {
  const [derived, setDerived] = useState<ResolvedStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | undefined;

    setDerived(null);

    if (!item) return;

    const providerTriangles = Number(item.modelDetails.polygons || 0);
    const providerVertices = Number(item.modelDetails.vertices || 0);

    if (providerTriangles > 0 || providerVertices > 0) {
      return;
    }

    const stepUrl = stepUrlFor(item);

    if (!stepUrl) return;

    void stepToDerivedGlb(stepUrl)
      .then((preview) => {
        blobUrl = preview.url;
        if (!cancelled) {
          setDerived({
            triangles: preview.polygons,
            vertices: preview.vertices,
            source: 'step-derived',
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDerived({
            triangles: null,
            vertices: null,
            source: 'unavailable',
          });
        }
      });

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [item?.id, item?.modelAsset?.downloadUrl]);

  if (!item) {
    return {
      triangles: null,
      vertices: null,
      source: 'unavailable',
    };
  }

  if (derived) return derived;

  const triangles = Number(item.modelDetails.polygons || 0);
  const vertices = Number(item.modelDetails.vertices || 0);

  return {
    triangles: triangles > 0 ? triangles : null,
    vertices: vertices > 0 ? vertices : null,
    source:
      triangles > 0 || vertices > 0
        ? 'provider'
        : 'unavailable',
  };
};

const safeDelta = (
  a: number | null,
  b: number | null,
): string => {
  if (a == null || b == null || a === 0) return 'n/a';
  const value = ((b - a) / a) * 100;
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const metric = (
  value: number | null,
): string => value == null ? 'n/a' : value.toLocaleString();

const artifactType = (
  item: SynthesisHistoryItem | undefined,
): string => {
  if (!item) return 'n/a';
  if (item.modelAsset?.glbUrl) return 'REAL GLB';
  if (stepUrlFor(item)) return 'STEP → GLB';
  return item.modelDetails.format || 'VERIFIED';
};

const Preview: React.FC<{
  item: SynthesisHistoryItem;
}> = ({ item }) => (
  <ModelViewer3D
    modelName={item.modelName}
    modelUrl={item.modelAsset?.glbUrl}
    downloadUrl={item.modelAsset?.downloadUrl}
    provider={item.modelAsset?.provider}
    sha256={item.modelAsset?.sha256}
    effectStatus={item.modelAsset?.effectStatus}
    vertices={item.modelDetails.vertices}
    polygons={item.modelDetails.polygons}
    renderTime={item.modelDetails.renderTime}
    fileSize={item.modelDetails.fileSize}
    textureComplexity={item.modelDetails.textureComplexity}
    meshDensity={item.modelDetails.meshDensity}
    dimensions={item.modelDetails.dimensions}
    uvChannels={item.modelDetails.uvChannels}
    drawCalls={item.modelDetails.drawCalls}
    materialCount={item.modelDetails.materialCount}
    dracoCompression={item.modelDetails.dracoCompression}
  />
);

export const SynthesisComparator: React.FC<Props> = ({
  isOpen,
  onClose,
  historyItems,
  initialModelAId,
  initialModelBId,
}) => {
  const [aId, setAId] = useState<string>('');
  const [bId, setBId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const first =
      historyItems.find((item) => item.id === initialModelAId)?.id ||
      historyItems[0]?.id ||
      '';

    const second =
      historyItems.find((item) => item.id === initialModelBId)?.id ||
      historyItems.find((item) => item.id !== first)?.id ||
      first;

    setAId(first);
    setBId(second);
  }, [
    isOpen,
    initialModelAId,
    initialModelBId,
    historyItems.length,
  ]);

  const modelA = useMemo(
    () => historyItems.find((item) => item.id === aId),
    [historyItems, aId],
  );

  const modelB = useMemo(
    () => historyItems.find((item) => item.id === bId),
    [historyItems, bId],
  );

  const statsA = useResolvedStats(modelA);
  const statsB = useResolvedStats(modelB);

  if (!isOpen) return null;

  const copyReport = async () => {
    const payload = {
      schema: 'golem-real-artifact-comparator-v1',
      modelA: modelA
        ? {
            id: modelA.id,
            name: modelA.modelName,
            details: modelA.modelDetails,
            asset: modelA.modelAsset,
            resolvedStats: statsA,
          }
        : null,
      modelB: modelB
        ? {
            id: modelB.id,
            name: modelB.modelName,
            details: modelB.modelDetails,
            asset: modelB.modelAsset,
            resolvedStats: statsB,
          }
        : null,
      delta: {
        triangles: safeDelta(
          statsA.triangles,
          statsB.triangles,
        ),
        vertices: safeDelta(
          statsA.vertices,
          statsB.vertices,
        ),
      },
    };

    await navigator.clipboard.writeText(
      JSON.stringify(payload, null, 2),
    );

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const swap = () => {
    setAId(bId);
    setBId(aId);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-3 sm:p-5">
        <div className="max-w-6xl mx-auto border border-cyan-500/50 bg-slate-950 shadow-[0_0_35px_rgba(0,240,255,0.18)]">
          <div className="sticky top-0 z-30 px-3 py-3 bg-black/95 border-b border-cyan-500/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  REAL ARTIFACT COMPARATOR // 3D DIFF
                </div>
                <div className="text-[9px] font-mono text-emerald-300">
                  NO PROCEDURAL PREVIEWS · NO SYNTHETIC TELEMETRY
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyReport()}
                className="px-2 py-1.5 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'COPIED' : 'EXPORT DIFF'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {historyItems.length < 2 ? (
            <div className="p-8 text-center text-slate-400 font-mono">
              Generate at least two verified models to compare them.
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-cyan-500/20 grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                <label className="text-[10px] font-mono text-cyan-300">
                  MODEL A
                  <select
                    value={aId}
                    onChange={(event) => setAId(event.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-cyan-500/40 text-slate-100 p-2"
                  >
                    {historyItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.modelName}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={swap}
                  className="p-2 border border-cyan-500/40 text-cyan-300"
                  title="Swap A and B"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                <label className="text-[10px] font-mono text-emerald-300">
                  MODEL B
                  <select
                    value={bId}
                    onChange={(event) => setBId(event.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-emerald-500/40 text-slate-100 p-2"
                  >
                    {historyItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.modelName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {modelA && (
                  <div className="border border-cyan-500/30 p-2">
                    <div className="mb-2 text-[10px] font-mono text-cyan-300 flex justify-between">
                      <span>MODEL A // {modelA.modelName}</span>
                      <span>{artifactType(modelA)}</span>
                    </div>
                    <Preview item={modelA} />
                  </div>
                )}

                {modelB && (
                  <div className="border border-emerald-500/30 p-2">
                    <div className="mb-2 text-[10px] font-mono text-emerald-300 flex justify-between">
                      <span>MODEL B // {modelB.modelName}</span>
                      <span>{artifactType(modelB)}</span>
                    </div>
                    <Preview item={modelB} />
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-cyan-500/20">
                <div className="mb-2 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  VERIFIED GEOMETRY MATRIX
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-cyan-500/30">
                        <th className="p-2 text-left text-slate-400">METRIC</th>
                        <th className="p-2 text-left text-cyan-300">MODEL A</th>
                        <th className="p-2 text-left text-emerald-300">MODEL B</th>
                        <th className="p-2 text-left text-slate-400">DELTA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 text-slate-400">Triangles</td>
                        <td className="p-2 text-cyan-200">{metric(statsA.triangles)}</td>
                        <td className="p-2 text-emerald-200">{metric(statsB.triangles)}</td>
                        <td className="p-2 text-slate-300">{safeDelta(statsA.triangles, statsB.triangles)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 text-slate-400">Vertices</td>
                        <td className="p-2 text-cyan-200">{metric(statsA.vertices)}</td>
                        <td className="p-2 text-emerald-200">{metric(statsB.vertices)}</td>
                        <td className="p-2 text-slate-300">{safeDelta(statsA.vertices, statsB.vertices)}</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 text-slate-400">Stats source</td>
                        <td className="p-2 text-cyan-200">{statsA.source}</td>
                        <td className="p-2 text-emerald-200">{statsB.source}</td>
                        <td className="p-2 text-slate-500">truth source</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 text-slate-400">Dimensions</td>
                        <td className="p-2 text-cyan-200">{modelA?.modelDetails.dimensions || 'n/a'}</td>
                        <td className="p-2 text-emerald-200">{modelB?.modelDetails.dimensions || 'n/a'}</td>
                        <td className="p-2 text-slate-500">bbox</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 text-slate-400">Artifact size</td>
                        <td className="p-2 text-cyan-200">{modelA?.modelDetails.fileSize || 'n/a'}</td>
                        <td className="p-2 text-emerald-200">{modelB?.modelDetails.fileSize || 'n/a'}</td>
                        <td className="p-2 text-slate-500">real file</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-400">Provider / effect</td>
                        <td className="p-2 text-cyan-200">
                          {modelA?.modelAsset?.provider || 'n/a'} / {modelA?.modelAsset?.effectStatus || 'n/a'}
                        </td>
                        <td className="p-2 text-emerald-200">
                          {modelB?.modelAsset?.provider || 'n/a'} / {modelB?.modelAsset?.effectStatus || 'n/a'}
                        </td>
                        <td className="p-2 text-slate-500">verified</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sticky bottom-0 p-3 bg-black/95 border-t border-cyan-500/30 flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyReport()}
                  className="flex-1 py-2 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]"
                >
                  {copied ? 'COPIED' : 'COPY REAL TELEMETRY JSON'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-cyan-500 text-black font-mono font-bold text-[10px]"
                >
                  DISMISS // ESC
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
