import React, { useState } from 'react';
import { FLUTTER_CODEBASE } from '../data/flutterCodebase';
import { FlutterCodeFile } from '../types';
import { 
  FileCode, 
  Copy, 
  Check, 
  FolderTree, 
  Layers, 
  Cpu, 
  Download, 
  ExternalLink,
  ChevronRight,
  Terminal,
  BookOpen
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('lib/main.dart');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'architecture'>('code');

  const selectedFile = FLUTTER_CODEBASE.find((f) => f.path === selectedFilePath) || FLUTTER_CODEBASE[1];

  const handleCopyFile = (code: string, path: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleCopyAll = () => {
    const combined = FLUTTER_CODEBASE.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const categories = [
    { key: 'core', label: 'Core & Config', files: FLUTTER_CODEBASE.filter((f) => f.category === 'core' || f.category === 'config') },
    { key: 'screens', label: 'Screens', files: FLUTTER_CODEBASE.filter((f) => f.category === 'screens') },
    { key: 'widgets', label: 'Widgets', files: FLUTTER_CODEBASE.filter((f) => f.category === 'widgets') },
    { key: 'theme', label: 'Theme & Models', files: FLUTTER_CODEBASE.filter((f) => f.category === 'theme' || f.category === 'models') },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden border-t sm:border-t-0 sm:border-l border-cyan-500/30">
      {/* Top Bar with Architecture & Code Toggle */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-300">FLUTTER // DART ARCHITECTURE</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">NULL-SAFETY COMPLIANT</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-0.5 border border-cyan-500/40 clip-faceted-sm text-xs font-mono">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Source Files
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Architecture Guide
            </button>
          </div>

          {/* Copy All Button */}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 text-xs font-mono font-semibold clip-faceted-sm transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'ALL COPIED!' : 'COPY ALL (lib/)'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'architecture' ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
          {/* Architecture Overview */}
          <div className="p-5 bg-slate-900/80 border border-cyan-500/50 clip-faceted-sm">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold mb-3">
              <Cpu className="w-5 h-5" />
              <span>SENIOR FLUTTER / DART ARCHITECTURE: GOLEM 3D COMPANION</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              The project is structured according to <strong>Flutter Clean Architecture</strong> with a strict separation of concerns, null-safety, and hardware-accelerated rendering.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-black/60 border border-slate-700">
                <h4 className="text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 1. FACETED CRYSTALLINE GEOMETRY
                </h4>
                <p className="text-slate-400">
                  Instead of default rounded rectangles, custom <code>FacetedClipper</code> and <code>FacetedBorderPainter</code> use <code>Path</code> trigonometry to create 45-degree chamfered obsidian stone facets and neon cyan edges.
                </p>
              </div>

              <div className="p-3 bg-black/60 border border-slate-700">
                <h4 className="text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 2. IN-APP CAMERA HUD
                </h4>
                <p className="text-slate-400">
                  Uses the official <code>camera: ^0.10.5</code> plugin. The controller lifecycle is handled in <code>CameraScreen</code> with an overlay painter for crosshairs, scanlines, and returns the thumbnail <code>XFile.path</code>.
                </p>
              </div>

              <div className="p-3 bg-black/60 border border-slate-700">
                <h4 className="text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 3. 3D VIEWER CONTAINER
                </h4>
                <p className="text-slate-400">
                  <code>ModelViewerPlaceholder</code> is prepared for drop-in replacement with <code>model_viewer_plus</code>, supporting GLB/gLTF with orbit controls and local synthesis telemetry.
                </p>
              </div>

              <div className="p-3 bg-black/60 border border-slate-700">
                <h4 className="text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> 4. HARDWARE & DRAWER STATE
                </h4>
                <p className="text-slate-400">
                  Global camera probing in <code>main.dart</code>, multi-language toggles (English, Русский, Deutsch), and responsive SnackBar feedback for storage vaults.
                </p>
              </div>
            </div>
          </div>

          {/* Directory Tree */}
          <div className="p-5 bg-slate-900/80 border border-slate-700 clip-faceted-sm">
            <h3 className="text-cyan-300 font-mono text-sm font-bold mb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4" /> COMPLETE PROJECT DIRECTORY TREE
            </h3>
            <pre className="p-4 bg-black border border-cyan-500/30 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
{`golem_companion/
├── pubspec.yaml
└── lib/
    ├── main.dart
    ├── theme/
    │   └── golem_theme.dart
    ├── models/
    │   └── chat_message.dart
    ├── widgets/
    │   ├── faceted_border.dart
    │   ├── golem_drawer.dart
    │   ├── chat_bubble.dart
    │   ├── model_viewer_placeholder.dart
    │   ├── action_bottom_sheet.dart
    │   └── camera_hud_overlay.dart
    └── screens/
        ├── camera_screen.dart
        └── chat_screen.dart`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-cyan-500/20 overflow-y-auto p-3 shrink-0">
            <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider mb-2 px-2">
              PROJECT ARTIFACTS ({FLUTTER_CODEBASE.length} FILES)
            </div>

            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 mb-1">
                    {cat.label}
                  </div>
                  <div className="space-y-0.5">
                    {cat.files.map((file) => {
                      const isSelected = file.path === selectedFilePath;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFilePath(file.path)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs font-mono flex items-center justify-between clip-faceted-sm transition-all ${
                            isSelected
                              ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                            <span className="truncate">{file.name}</span>
                          </div>
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Code Viewer */}
          <div className="flex-1 flex flex-col bg-black overflow-hidden">
            {/* File Info Bar */}
            <div className="px-4 py-2 bg-slate-950 border-b border-cyan-500/20 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="text-cyan-400 font-bold">{selectedFile.path}</span>
                <span className="text-slate-500 hidden sm:inline">— {selectedFile.description}</span>
              </div>

              <button
                onClick={() => handleCopyFile(selectedFile.code, selectedFile.path)}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/80 text-cyan-300 clip-faceted-sm transition-colors text-xs shrink-0"
              >
                {copiedFile === selectedFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY FILE</span>
                  </>
                )}
              </button>
            </div>

            {/* Syntax Code Container with Line Numbers */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed select-text">
              <pre className="text-slate-300">
                <code>
                  {selectedFile.code.split('\n').map((line, idx) => (
                    <div key={idx} className="table-row hover:bg-cyan-950/20">
                      <span className="table-cell pr-4 text-right select-none text-slate-600 w-10 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="table-cell whitespace-pre">
                        {highlightDart(line)}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Dart syntax colorizer for keywords & comments
function highlightDart(line: string): React.ReactNode {
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
    return <span className="text-sky-400 font-semibold">{line}</span>;
  }
  if (line.includes('class ') || line.includes('enum ') || line.includes('extends ') || line.includes('implements ')) {
    return <span className="text-cyan-300 font-semibold">{line}</span>;
  }
  if (line.includes('return ') || line.includes('final ') || line.includes('const ') || line.includes('async ') || line.includes('await ')) {
    return <span className="text-emerald-300">{line}</span>;
  }
  return line;
}
