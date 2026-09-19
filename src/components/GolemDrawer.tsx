import React, { useState } from 'react';
import { GolemHoloLogo } from './GolemHoloLogo';
import { AppLanguage, StorageFolder, SynthesisHistoryItem } from '../types';
import { 
  Folder, 
  Layers, 
  Share2, 
  Globe, 
  X, 
  ChevronRight, 
  Cpu, 
  Database,
  Radio,
  History,
  Box,
  Code2,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HardDrive,
  Scale,
  FileDown,
  Terminal
} from 'lucide-react';

interface GolemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onSelectFolder: (folderName: string) => void;
  historyItems?: SynthesisHistoryItem[];
  onReaccessModel?: (item: SynthesisHistoryItem) => void;
  onShareSynthesis?: (item: SynthesisHistoryItem, shareLink: string) => void;
  onOpenComparator?: (initialModelId?: string) => void;
  onDiagnosticLogDownloaded?: (filename: string) => void;
}

export const GolemDrawer: React.FC<GolemDrawerProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onSelectFolder,
  historyItems = [],
  onReaccessModel,
  onShareSynthesis,
  onOpenComparator,
  onDiagnosticLogDownloaded,
}) => {
  const [activeTab, setActiveTab] = useState<'vaults' | 'history'>('vaults');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [sharedModelId, setSharedModelId] = useState<string | null>(null);
  const [isLogDownloaded, setIsLogDownloaded] = useState(false);

  const folders: StorageFolder[] = [
    {
      id: 'models',
      name: {
        en: 'Generated Models',
        ru: 'Сгенерированные модели',
        de: 'Generierte Modelle',
      },
      count: 14,
      size: '284 MB',
      icon: 'box',
    },
    {
      id: 'blueprints',
      name: {
        en: 'Blueprints',
        ru: 'Чертежи и топологии',
        de: 'Baupläne & Topologien',
      },
      count: 8,
      size: '62 MB',
      icon: 'file-text',
    },
    {
      id: 'exports',
      name: {
        en: 'Exports',
        ru: 'Экспортированные файлы',
        de: 'Exporte (.OBJ/.GLB)',
      },
      count: 22,
      size: '512 MB',
      icon: 'share-2',
    },
  ];

  const translations = {
    en: {
      tagline: 'AUTONOMOUS 3D SYNTHESIS COMPANION',
      tabVaults: 'VAULTS & SYSTEM',
      tabHistory: 'SYNTHESIS HISTORY',
      settingsSection: 'SYSTEM LOCALIZATION',
      storageSection: 'MEMORY & STORAGE VAULTS',
      status: 'CORE ONLINE',
      version: 'v2.4-LOCAL',
      searchPlaceholder: 'Filter synthesized models...',
      reaccessBtn: 'RE-ACCESS IN CHAT',
      inspectBtn: 'INSPECT TELEMETRY',
      collapseBtn: 'HIDE TELEMETRY',
      copyJsonBtn: 'COPY FLUTTER JSON',
      copiedJson: 'COPIED JSON',
      emptyHistory: 'No synthesized models found.',
      totalCount: 'Synthesized Assets',
      shareBtn: 'SHARE',
      shareSynthesis: 'SHARE SYNTHESIS',
      copiedShareLink: 'LINK COPIED',
      telemetryLinkHeader: 'STRUCTURED TELEMETRY LINK',
      comparatorBtn: 'SYNTHESIS COMPARATOR // 3D DIFF',
      compareSingleBtn: 'COMPARE',
      diagnosticSection: 'SESSION DIAGNOSTICS & LOGS',
      downloadLogBtn: 'GENERATE & DOWNLOAD LOG',
      downloadingLog: 'LOG GENERATED',
      logSubtitle: 'Structured telemetry of current synthesis events, geometry metadata & timestamps.',
      logStatsAssets: 'Logged Assets',
      logStatsPolygons: 'Total Polygons',
      quickLogBtn: 'EXPORT SESSION LOG',
    },
    ru: {
      tagline: 'АВТОНОМНЫЙ ХРАНИТЕЛЬ 3D СИНТЕЗА',
      tabVaults: 'ХРАНИЛИЩЕ И СИСТЕМА',
      tabHistory: 'ИСТОРИЯ СИНТЕЗА',
      settingsSection: 'ЛОКАЛИЗАЦИЯ СИСТЕМЫ',
      storageSection: 'ХРАНИЛИЩЕ И ПАМЯТЬ КВАНТОВ',
      status: 'ЯДРО АКТИВНО',
      version: 'v2.4-ЛОКАЛ',
      searchPlaceholder: 'Поиск по 3D моделям...',
      reaccessBtn: 'ОТКРЫТЬ В ЧАТЕ',
      inspectBtn: 'ТЕЛЕМЕТРИЯ СЕТКИ',
      collapseBtn: 'СВЕРНУТЬ ДЕТАЛИ',
      copyJsonBtn: 'FLUTTER JSON',
      copiedJson: 'СКОПИРОВАНО',
      emptyHistory: 'Сгенерированных моделей не найдено.',
      totalCount: '3D-активов в памяти',
      shareBtn: 'ПОДЕЛИТЬСЯ',
      shareSynthesis: 'ПОДЕЛИТЬСЯ СИНТЕЗОМ',
      copiedShareLink: 'ССЫЛКА СКОПИРОВАНА',
      telemetryLinkHeader: 'ССЫЛКА ТЕЛЕМЕТРИИ СЕТКИ',
      comparatorBtn: 'СИНТЕЗ-КОМПАРАТОР // 3D СРАВНЕНИЕ',
      compareSingleBtn: 'СРАВНИТЬ',
      diagnosticSection: 'ДИАГНОСТИКА И ЛОГИ СЕССИИ',
      downloadLogBtn: 'СКАЧАТЬ ЛОГ ДИАГНОСТИКИ',
      downloadingLog: 'ЛОГ СКАЧАН',
      logSubtitle: 'Структурированная телеметрия синтеза, метаданные геометрии и таймстемпы.',
      logStatsAssets: '3D-активов',
      logStatsPolygons: 'Всего полигонов',
      quickLogBtn: 'СКАЧАТЬ ЛОГ СЕССИИ',
    },
    de: {
      tagline: 'AUTONOMER 3D-SYNTHESE BEGLEITER',
      tabVaults: 'VAULTS & SYSTEM',
      tabHistory: 'SYNTHESE-HISTORIE',
      settingsSection: 'SYSTEM-LOKALISIERUNG',
      storageSection: 'SPEICHER- & DATEN-VAULTS',
      status: 'KERN ONLINE',
      version: 'v2.4-LOKAL',
      searchPlaceholder: 'Modelle durchsuchen...',
      reaccessBtn: 'IM CHAT ÖFFNEN',
      inspectBtn: 'TELEMETRIE ANZEIGEN',
      collapseBtn: 'DETAILS EINKLAPPEN',
      copyJsonBtn: 'FLUTTER JSON',
      copiedJson: 'KOPIERT',
      emptyHistory: 'Keine 3D-Modelle gefunden.',
      totalCount: 'Generierte Modelle',
      shareBtn: 'TEILEN',
      shareSynthesis: 'SYNTHESE TEILEN',
      copiedShareLink: 'LINK KOPIERT',
      telemetryLinkHeader: 'STRUKTURIERTER TELEMETRIE-LINK',
      comparatorBtn: 'SYNTHESE-KOMPARATOR // 3D DIFF',
      compareSingleBtn: 'VERGLEICHEN',
      diagnosticSection: 'SESSION-DIAGNOSE & LOGS',
      downloadLogBtn: 'DIAGNOSE-LOG HERUNTERLADEN',
      downloadingLog: 'LOG HERUNTERGELADEN',
      logSubtitle: 'Strukturierte Telemetrie der Synthese-Aktivität, Geometrie-Metadaten & Zeitstempel.',
      logStatsAssets: 'Erfasste Assets',
      logStatsPolygons: 'Gesamtpolygone',
      quickLogBtn: 'SESSION-LOG EXPORTIEREN',
    },
  };

  const t = translations[currentLanguage];

  const handleDownloadDiagnosticLog = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const timestampIso = new Date().toISOString();
    const dateFormatted = timestampIso.replace(/[:.]/g, '-');

    const totalPolygons = historyItems.reduce((acc, item) => acc + (item.modelDetails.polygons || 0), 0);
    const totalVertices = historyItems.reduce((acc, item) => acc + (item.modelDetails.vertices || 0), 0);

    const logData = {
      diagnostic_header: {
        system: 'GOLEM 3D Holographic Synthesis Engine',
        engine_version: 'v2.4-LOCAL (Spatial Tensor Core)',
        session_id: `golem-session-${Date.now()}`,
        export_timestamp_iso: timestampIso,
        active_locale: currentLanguage,
        diagnostic_status: 'OPTIMAL // INTEGRITY_VERIFIED',
        runtime_environment: {
          platform: 'WebGL2 / Three.js Procedural Tessellator',
          viewport_raster: 'Hardware-accelerated PBR + Wireframe Projection',
          geometry_pipeline: 'Draco L7 Quantization Decompressor',
          max_texture_resolution: '4096 x 4096',
        },
      },
      session_telemetry_summary: {
        total_synthesis_events: historyItems.length,
        cumulative_polygons: totalPolygons,
        cumulative_vertices: totalVertices,
        compression_profile: 'Google Draco Geometry L7 Mesh Quantization',
        formats_supported: ['GLB', 'USDZ', 'OBJ'],
        average_mesh_density: '32.1 tris/cm²',
      },
      synthesis_activity_log: historyItems.map((item, index) => ({
        event_index: index + 1,
        id: item.id,
        message_id: item.messageId,
        timestamp: item.timestamp,
        model_name: item.modelName,
        user_prompt_snippet: item.promptSnippet || null,
        geometry_metadata: {
          polygons: item.modelDetails.polygons,
          vertices: item.modelDetails.vertices,
          format: item.modelDetails.format,
          render_latency: item.modelDetails.renderTime,
          file_size: item.modelDetails.fileSize,
          mesh_density: item.modelDetails.meshDensity,
          bounding_box_dimensions: item.modelDetails.dimensions,
          draco_compression_ratio: item.modelDetails.dracoCompression,
          uv_channels: item.modelDetails.uvChannels,
          draw_calls: item.modelDetails.drawCalls,
          material_count: item.modelDetails.materialCount,
          texture_complexity: item.modelDetails.textureComplexity,
          rigged: item.modelDetails.rigged ?? false,
        },
        pipeline_telemetry: {
          stage: 'complete',
          wireframe_mode: 'Indexed Triangulated Mesh',
          shader_target: 'PBR Metallic-Roughness (Stone Lithic / Obsidian)',
        },
      })),
    };

    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `golem-synthesis-diagnostic-log-${dateFormatted}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsLogDownloaded(true);
    onDiagnosticLogDownloaded?.(filename);

    setTimeout(() => {
      setIsLogDownloaded(false);
    }, 2800);
  };

  const filteredHistory = historyItems.filter((item) =>
    item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.promptSnippet && item.promptSnippet.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const generateStructuredShareLink = (item: SynthesisHistoryItem): string => {
    const origin = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://golem-3d.app';

    const details = item.modelDetails;
    const cleanModelSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const params = new URLSearchParams({
      synthesis_id: item.id,
      model_name: details.name,
      format: details.format || 'GLB / USDZ',
      polygons: String(details.polygons || 12480),
      vertices: String(details.vertices || 6420),
      file_size: details.fileSize || '4.82 MB',
      mesh_density: details.meshDensity || '28.4 tris/cm²',
      dimensions: details.dimensions || '1.85m × 1.20m × 2.40m',
      compression: details.dracoCompression || 'Draco L7 (-64%)',
      materials: String(details.materialCount || 3),
      uv_channels: String(details.uvChannels || 2),
      draw_calls: String(details.drawCalls || 1),
      texture_complexity: details.textureComplexity || '4K PBR Multi-channel',
      timestamp: item.timestamp,
    });

    return `${origin}/#synthesis/${cleanModelSlug}?${params.toString()}`;
  };

  const fallbackClipboardCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // ignore
    }
  };

  const handleShareSynthesis = (item: SynthesisHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareLink = generateStructuredShareLink(item);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareLink).catch(() => {
        fallbackClipboardCopy(shareLink);
      });
    } else {
      fallbackClipboardCopy(shareLink);
    }

    setSharedModelId(item.id);
    onShareSynthesis?.(item, shareLink);

    setTimeout(() => {
      setSharedModelId((prev) => (prev === item.id ? null : prev));
    }, 2400);
  };

  const handleCopyFlutterJson = (item: SynthesisHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = {
      modelName: item.modelDetails.name,
      format: item.modelDetails.format || 'GLB / USDZ',
      assetPath: `assets/models/${item.modelDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.glb`,
      geometryTelemetry: {
        fileSize: item.modelDetails.fileSize,
        compression: item.modelDetails.dracoCompression,
        polygons: item.modelDetails.polygons,
        vertices: item.modelDetails.vertices,
        renderLatency: item.modelDetails.renderTime,
        meshDensity: item.modelDetails.meshDensity,
        dimensions: item.modelDetails.dimensions,
        uvChannels: item.modelDetails.uvChannels,
        drawCalls: item.modelDetails.drawCalls,
        materials: item.modelDetails.materialCount,
      },
      textureTelemetry: {
        complexity: item.modelDetails.textureComplexity,
      },
      synthesizedAt: item.timestamp,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedModelId(item.id);
    setTimeout(() => setCopiedModelId(null), 2200);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[310px] sm:w-[335px] bg-slate-950 border-r border-cyan-500/40 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-out shadow-[10px_0_30px_rgba(0,0,0,0.8)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header with Close */}
        <div className="p-3.5 flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-cyan-300 tracking-wider">
              GOLEM // SYSTEM INTERFACE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {/* Mascot Header: Name + Glowing Faceted Logo Placeholder */}
          <div className="flex flex-col items-center text-center pb-3 border-b border-cyan-500/20">
            <div className="mb-2 transform hover:scale-105 transition-transform">
              <GolemHoloLogo size={70} glow={true} />
            </div>

            <h2 className="text-xl font-bold font-display tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
              G O L E M
            </h2>
            <p className="mt-0.5 text-[9.5px] font-mono text-slate-400 tracking-widest max-w-[240px]">
              {t.tagline}
            </p>
          </div>

          {/* Tab Navigation: Vaults vs Synthesis History */}
          <div className="p-1 bg-slate-900 border border-cyan-500/30 clip-faceted-sm flex gap-1">
            <button
              type="button"
              id="drawer-tab-vaults"
              onClick={() => setActiveTab('vaults')}
              className={`flex-1 py-1.5 px-2 text-[10.5px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'vaults'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{t.tabVaults}</span>
            </button>

            <button
              type="button"
              id="drawer-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 text-[10.5px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all relative ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <History className="w-3 h-3" />
              <span>{t.tabHistory}</span>
              {historyItems.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-mono ${
                  activeTab === 'history' ? 'bg-black text-cyan-300' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {historyItems.length}
                </span>
              )}
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: VAULTS & CONFIGURATION */}
          {/* ========================================================= */}
          {activeTab === 'vaults' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Settings Section: Language Dropdown / Toggle */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold font-mono tracking-wider text-cyan-300 mb-2">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.settingsSection}</span>
                </div>

                <div className="p-1 bg-slate-900 border border-cyan-500/40 clip-faceted-sm">
                  <div className="grid grid-cols-3 gap-1">
                    {(['en', 'ru', 'de'] as AppLanguage[]).map((lang) => {
                      const isActive = currentLanguage === lang;
                      const labels = {
                        en: 'EN (US)',
                        ru: 'RU (Рус)',
                        de: 'DE (Ger)',
                      };

                      return (
                        <button
                          key={lang}
                          onClick={() => onLanguageChange(lang)}
                          className={`py-1.5 px-1 text-xs font-mono font-semibold transition-all text-center ${
                            isActive
                              ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
                          }`}
                        >
                          {labels[lang]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Memory / Storage Section */}
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold font-mono tracking-wider text-cyan-300 mb-2">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.storageSection}</span>
                </div>

                <div className="space-y-2">
                  {folders.map((folder) => {
                    const folderTitle = folder.name[currentLanguage];

                    return (
                      <button
                        key={folder.id}
                        onClick={() => onSelectFolder(folderTitle)}
                        className="w-full text-left p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/80 clip-faceted-sm transition-all group flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-950 border border-cyan-500/40 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-300 transition-colors">
                            {folder.icon === 'box' && <Layers className="w-3.5 h-3.5" />}
                            {folder.icon === 'file-text' && <Folder className="w-3.5 h-3.5" />}
                            {folder.icon === 'share-2' && <Share2 className="w-3.5 h-3.5" />}
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 transition-colors">
                              {folderTitle}
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-400">
                              {folder.count} items • {folder.size}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Session Diagnostics & Telemetry Log Section */}
              <div className="pt-1 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-[11px] font-bold font-mono tracking-wider text-cyan-300 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.diagnosticSection}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-500/40 clip-faceted-sm">
                    ONLINE
                  </span>
                </div>

                <div className="p-3 bg-slate-900/90 border border-cyan-500/30 clip-faceted-sm space-y-2.5 shadow-xs">
                  <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                    {t.logSubtitle}
                  </p>

                  {/* Live Session Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 py-0.5 text-[9.5px] font-mono">
                    <div className="p-2 bg-slate-950/80 border border-slate-700/60 clip-faceted-sm">
                      <span className="text-slate-500 block text-[8.5px] uppercase">{t.logStatsAssets}</span>
                      <span className="text-cyan-300 font-bold text-xs">{historyItems.length} active</span>
                    </div>
                    <div className="p-2 bg-slate-950/80 border border-slate-700/60 clip-faceted-sm">
                      <span className="text-slate-500 block text-[8.5px] uppercase">{t.logStatsPolygons}</span>
                      <span className="text-emerald-400 font-bold text-xs">
                        {historyItems.reduce((acc, i) => acc + (i.modelDetails.polygons || 0), 0).toLocaleString()} tris
                      </span>
                    </div>
                  </div>

                  {/* Primary Diagnostic Download Button */}
                  <button
                    type="button"
                    id="drawer-download-diagnostic-log-btn"
                    onClick={handleDownloadDiagnosticLog}
                    className={`w-full py-2 px-3 text-xs font-mono font-bold flex items-center justify-center gap-2 clip-faceted-sm border transition-all cursor-pointer ${
                      isLogDownloaded
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-900 hover:from-cyan-900 hover:to-cyan-800 border-cyan-400 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    }`}
                    title="Generate and download structured diagnostic log file of session synthesis activity"
                  >
                    {isLogDownloaded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span>{t.downloadingLog}</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4 text-cyan-400" />
                        <span>{t.downloadLogBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SYNTHESIS HISTORY */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-900 border border-cyan-500/30 text-slate-100 placeholder:text-slate-500 font-mono focus:outline-hidden focus:border-cyan-400 clip-faceted-sm"
                />
              </div>

              {/* Assets Count Header & Comparator Action */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>{t.totalCount}:</span>
                <span className="text-cyan-300 font-bold">{filteredHistory.length} / {historyItems.length}</span>
              </div>

              {/* Quick Diagnostic Log Download */}
              <button
                type="button"
                id="drawer-history-download-log-btn"
                onClick={handleDownloadDiagnosticLog}
                className={`w-full py-1.5 px-2.5 text-[10px] font-mono flex items-center justify-between border clip-faceted-sm transition-all cursor-pointer ${
                  isLogDownloaded
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 hover:border-cyan-400 text-slate-300 hover:text-cyan-200'
                }`}
                title="Download structured session log file (JSON) with geometry metadata and timestamps"
              >
                <div className="flex items-center gap-2">
                  {isLogDownloaded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="font-semibold tracking-wider">
                    {isLogDownloaded ? t.downloadingLog : t.quickLogBtn}
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-400 font-mono">.JSON LOG</span>
              </button>

              {/* Synthesis Comparator Launcher Banner */}
              <button
                type="button"
                id="drawer-open-comparator-btn"
                onClick={() => {
                  onClose();
                  onOpenComparator?.();
                }}
                className="w-full py-2 px-3 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-emerald-950/90 hover:from-cyan-900 hover:to-emerald-900 border border-cyan-400/80 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono font-bold text-[10.5px] clip-faceted-sm flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-black border border-cyan-400 text-cyan-300 group-hover:scale-110 transition-transform">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="tracking-wider">{t.comparatorBtn}</div>
                    <div className="text-[8.5px] text-slate-400 font-normal">Side-by-side telemetry & geometry diff</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* History List */}
              {filteredHistory.length === 0 ? (
                <div className="p-4 text-center bg-slate-900/60 border border-cyan-500/20 clip-faceted-sm">
                  <Box className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs font-mono text-slate-400">{t.emptyHistory}</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHistory.map((item) => {
                    const isExpanded = expandedModelId === item.id;
                    const isCopied = copiedModelId === item.id;
                    const details = item.modelDetails;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/95 border border-cyan-500/40 clip-faceted-sm p-2.5 hover:border-cyan-400 transition-all space-y-2"
                      >
                        {/* Header: Title + Timestamp */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <div className="font-mono font-bold text-xs text-cyan-200 truncate max-w-[170px]">
                              {details.name}
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1 py-0.5 border border-cyan-500/20 shrink-0">
                            {item.timestamp}
                          </span>
                        </div>

                        {/* Quick Telemetry Pills */}
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                          <div className="bg-black/50 p-1 rounded-xs border border-cyan-500/20 text-center">
                            <span className="text-slate-400 block text-[8px]">SIZE</span>
                            <span className="text-cyan-300 font-bold">{details.fileSize || '4.8 MB'}</span>
                          </div>
                          <div className="bg-black/50 p-1 rounded-xs border border-cyan-500/20 text-center">
                            <span className="text-slate-400 block text-[8px]">POLYS</span>
                            <span className="text-cyan-300 font-bold">{details.polygons?.toLocaleString()}</span>
                          </div>
                          <div className="bg-black/50 p-1 rounded-xs border border-cyan-500/20 text-center">
                            <span className="text-slate-400 block text-[8px]">DENSITY</span>
                            <span className="text-cyan-300 font-bold">{details.meshDensity?.split(' ')[0] || '28.4'}</span>
                          </div>
                        </div>

                          {/* Expandable Technical Telemetry */}
                          {isExpanded && (
                            <div className="p-2 bg-black/70 border border-cyan-500/30 rounded-xs space-y-1.5 text-[9.5px] font-mono text-slate-300 animate-fadeIn">
                              <div className="flex justify-between border-b border-cyan-500/10 pb-0.5">
                                <span className="text-slate-400">Dimensions:</span>
                                <span className="text-cyan-300">{details.dimensions || '1.85m × 1.20m × 2.40m'}</span>
                              </div>
                              <div className="flex justify-between border-b border-cyan-500/10 pb-0.5">
                                <span className="text-slate-400">Texture Specs:</span>
                                <span className="text-cyan-300 truncate max-w-[140px]">{details.textureComplexity || '4K PBR Multi-channel'}</span>
                              </div>
                              <div className="flex justify-between border-b border-cyan-500/10 pb-0.5">
                                <span className="text-slate-400">Vertices:</span>
                                <span className="text-cyan-300">{details.vertices?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-b border-cyan-500/10 pb-0.5">
                                <span className="text-slate-400">Compression:</span>
                                <span className="text-cyan-300">{details.dracoCompression || 'Draco L7 (-64%)'}</span>
                              </div>
                              <div className="flex justify-between border-b border-cyan-500/10 pb-0.5">
                                <span className="text-slate-400">UV / Shaders:</span>
                                <span className="text-cyan-300">{details.uvChannels || 2} UVs • {details.materialCount || 3} Mats</span>
                              </div>

                              {/* Structured Telemetry Link Section */}
                              <div className="pt-1.5 border-t border-cyan-500/20 space-y-1">
                                <div className="flex items-center justify-between text-[9px]">
                                  <span className="text-slate-400 flex items-center gap-1 font-bold">
                                    <Share2 className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>{t.telemetryLinkHeader}</span>
                                  </span>
                                  <span className="text-[8px] px-1 py-0.2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-xs">
                                    URL HASH
                                  </span>
                                </div>
                                <div className="p-1 bg-black/90 border border-cyan-500/25 rounded-xs text-[8px] text-slate-400 break-all select-all font-mono leading-tight">
                                  {generateStructuredShareLink(item)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons: Primary Re-access & Expand */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => onReaccessModel?.(item)}
                              className="flex-1 py-1 px-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[9.5px] font-mono flex items-center justify-center gap-1 clip-faceted-sm transition-colors cursor-pointer"
                              title="Navigate directly to message in chat"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>{t.reaccessBtn}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedModelId(isExpanded ? null : item.id)}
                              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9.5px] font-mono flex items-center justify-center gap-0.5 clip-faceted-sm border border-cyan-500/30 transition-colors cursor-pointer"
                              title="Toggle technical specs"
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Action Buttons: Share Synthesis Option, Comparator & Flutter JSON Export */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              id={`share-synthesis-btn-${item.id}`}
                              onClick={(e) => handleShareSynthesis(item, e)}
                              className={`flex-1 py-1.5 px-2 text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 clip-faceted-sm border transition-all cursor-pointer ${
                                sharedModelId === item.id
                                  ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                  : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-400/80 hover:border-cyan-300 text-cyan-300 hover:text-white shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                              }`}
                              title="Share Synthesis: Copy structured 3D telemetry link to clipboard"
                            >
                              {sharedModelId === item.id ? (
                                <Check className="w-3 h-3 text-black" />
                              ) : (
                                <Share2 className="w-3 h-3 text-cyan-300" />
                              )}
                              <span>{sharedModelId === item.id ? t.copiedShareLink : t.shareSynthesis}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenComparator?.(item.id);
                              }}
                              className="py-1.5 px-2 text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 clip-faceted-sm border bg-emerald-950/70 hover:bg-emerald-900 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                              title="Compare this model in the Synthesis Comparator"
                            >
                              <Scale className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{t.compareSingleBtn}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleCopyFlutterJson(item, e)}
                              className={`py-1.5 px-2 text-[9.5px] font-mono flex items-center justify-center gap-1 clip-faceted-sm border transition-colors cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
                              }`}
                              title="Copy Flutter JSON telemetry block"
                            >
                              {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Code2 className="w-2.5 h-2.5" />}
                              <span>{isCopied ? t.copiedJson : 'JSON'}</span>
                            </button>
                          </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hardware Status */}
        <div className="p-3 bg-black border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">{t.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="drawer-footer-download-log-btn"
              onClick={handleDownloadDiagnosticLog}
              className={`p-1 border clip-faceted-sm transition-colors cursor-pointer ${
                isLogDownloaded
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-cyan-500/40 hover:border-cyan-400 text-cyan-400 hover:text-white'
              }`}
              title="Download Session Diagnostic Log (.JSON)"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-cyan-400">{t.version}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

