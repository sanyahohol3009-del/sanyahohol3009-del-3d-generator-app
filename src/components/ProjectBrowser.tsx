import React, { useEffect, useMemo, useState } from 'react';
import '@google/model-viewer';
import {
  CheckCircle2,
  ChevronRight,
  Download,
  FolderKanban,
  RefreshCw,
  X,
} from 'lucide-react';

import {
  organClient,
  ProjectManifest,
  ProjectVersionRecord,
} from '../services/organClient';

interface ProjectBrowserProps {
  onClose: () => void;
}

function fmtBytes(value?: number) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ProjectBrowser({ onClose }: ProjectBrowserProps) {
  const [projects, setProjects] = useState<ProjectManifest[]>([]);
  const [project, setProject] = useState<ProjectManifest | null>(null);
  const [version, setVersion] = useState<ProjectVersionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [modifyState, setModifyState] = useState('');
  const [modifying, setModifying] = useState(false);

  const loadProject = async (projectId: string, preferredVersion?: string) => {
    setLoading(true);
    setError('');
    try {
      const detail = await organClient.project(projectId);
      const nextProject = detail?.project as ProjectManifest;
      setProject(nextProject);

      const versionId =
        preferredVersion ||
        nextProject?.latest_verified_version ||
        nextProject?.versions?.at(-1)?.version_id;

      if (versionId) {
        const payload = await organClient.projectVersion(projectId, versionId);
        setVersion(payload?.version as ProjectVersionRecord);
      } else {
        setVersion(null);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await organClient.projects();
      const values = (payload?.projects || []) as ProjectManifest[];
      setProjects(values);

      const preferred =
        values.find((item) => item.project_id === 'scott') ||
        values[0];

      if (preferred) {
        await loadProject(preferred.project_id);
      } else {
        setProject(null);
        setVersion(null);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const modifySelected = async () => {
    if (!project || !version) return;

    const prompt = modifyPrompt.trim();
    if (!prompt) {
      setError('Describe the bounded change to the selected verified artifact.');
      return;
    }

    setModifying(true);
    setModifyState('SUBMITTING');
    setError('');

    try {
      const submitted = await organClient.modifyCharacter({
        projectId: project.project_id,
        versionId: version.version_id,
        prompt,
        maxTime: 300,
      });

      const jobId = String(submitted?.job?.job_id || '');
      if (!jobId) {
        throw new Error('Modify endpoint returned no job id');
      }

      const result = await organClient.waitForResult(
        jobId,
        (state) => setModifyState(state.toUpperCase()),
        360000,
      );

      if (result.status !== 'succeeded') {
        throw new Error(
          result.error_details
          || result.error_code
          || `Modify job ended as ${result.status}`,
        );
      }

      const finalJob = await organClient.job(jobId);
      const childVersion = String(
        finalJob?.job?.project?.version_id || '',
      );

      if (!childVersion) {
        throw new Error(
          'Verified child artifact was not promoted to Project Store',
        );
      }

      const projectList = await organClient.projects();
      setProjects(
        (projectList?.projects || []) as ProjectManifest[],
      );

      await loadProject(
        project.project_id,
        childVersion,
      );

      setModifyPrompt('');
      setModifyState(`VERIFIED ${childVersion}`);
    } catch (err: any) {
      setError(err?.message || String(err));
      setModifyState('FAILED');
    } finally {
      setModifying(false);
    }
  };

  const glb = useMemo(
    () => version?.artifacts?.find((item) => item.format === 'glb'),
    [version],
  );

  const blend = useMemo(
    () => version?.artifacts?.find((item) => item.format === 'blend'),
    [version],
  );

  const glbUrl =
    project && version && glb
      ? organClient.projectArtifactUrl(
          project.project_id,
          version.version_id,
          glb.filename,
        )
      : '';

  const blendUrl =
    project && version && blend
      ? organClient.projectArtifactUrl(
          project.project_id,
          version.version_id,
          blend.filename,
        )
      : '';

  const metadata = version?.metadata || {};

  return (
    <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-stretch justify-center">
      <div className="w-full max-w-6xl h-full sm:h-[94vh] sm:my-[3vh] bg-slate-950 border border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.22)] overflow-hidden flex flex-col">
        <div className="h-16 shrink-0 px-4 border-b border-cyan-500/30 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-cyan-300" />
            <div>
              <div className="font-mono text-cyan-200 tracking-[0.16em] text-sm font-bold">
                GOLEM PROJECT STORE
              </div>
              <div className="font-mono text-[9px] text-emerald-400">
                VERIFIED PROJECT HISTORY · PERMANENT ARTIFACTS
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void refresh()} className="w-10 h-10 border border-cyan-500/40 text-cyan-300 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={onClose} className="w-10 h-10 border border-slate-600 text-slate-200 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-950/40 border-b border-red-500/40 text-red-300 font-mono text-xs">
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[220px_280px_1fr]">
          <section className="border-b md:border-b-0 md:border-r border-cyan-500/20 min-h-0 overflow-auto">
            <div className="px-3 py-2 text-[9px] font-mono tracking-[0.2em] text-slate-500 border-b border-cyan-500/20">
              PROJECTS
            </div>
            {projects.map((item) => (
              <button
                key={item.project_id}
                type="button"
                onClick={() => void loadProject(item.project_id)}
                className={`w-full text-left px-3 py-3 border-b border-cyan-500/10 font-mono ${
                  project?.project_id === item.project_id
                    ? 'bg-cyan-950/40 text-cyan-200'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-[9px] text-emerald-400">
                    {item.latest_verified_version || '—'}
                  </span>
                </div>
                <div className="mt-1 text-[9px] text-slate-500">
                  {item.versions?.length || 0} VERIFIED VERSION(S)
                </div>
              </button>
            ))}
          </section>

          <section className="border-b md:border-b-0 md:border-r border-cyan-500/20 min-h-0 overflow-auto">
            <div className="px-3 py-2 text-[9px] font-mono tracking-[0.2em] text-slate-500 border-b border-cyan-500/20">
              VERIFIED VERSIONS
            </div>
            {project?.versions?.slice().reverse().map((item) => {
              const active = version?.version_id === item.version_id;
              const latest = project.latest_verified_version === item.version_id;
              return (
                <button
                  key={item.version_id}
                  type="button"
                  onClick={() => void loadProject(project.project_id, item.version_id)}
                  className={`w-full text-left px-3 py-3 border-b border-cyan-500/10 ${
                    active ? 'bg-fuchsia-950/20' : 'hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-200 font-bold">{item.version_id}</span>
                    {latest && (
                      <span className="text-[8px] px-1.5 py-0.5 border border-emerald-500/40 text-emerald-300">LATEST</span>
                    )}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-slate-500">
                    PARENT {item.parent_version_id || 'ROOT'}
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-cyan-300 break-words">
                    {(item.modifiers || []).length ? item.modifiers.join(' · ') : 'BASE'}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="min-h-0 overflow-auto p-3 sm:p-4">
            {loading && !version ? (
              <div className="h-full flex items-center justify-center text-cyan-300 font-mono text-xs">
                READING VERIFIED PROJECT STORE...
              </div>
            ) : version && project ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-lg text-cyan-200 font-bold">
                      {project.name} // {version.version_id}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 mt-1">
                      VERIFIED · EFFECT CONFIRMED
                    </div>
                  </div>
                  <div className="text-right text-[9px] font-mono text-slate-500">
                    <div>JOB {version.source_job_id}</div>
                    <div>PROFILE {version.profile_id || 'n/a'}</div>
                  </div>
                </div>

                <div className="border border-cyan-500/30 bg-black min-h-[280px] relative overflow-hidden">
                  {glbUrl ? (
                    React.createElement('model-viewer' as any, {
                      src: glbUrl,
                      'camera-controls': true,
                      'auto-rotate': true,
                      'rotation-per-second': '18deg',
                      'shadow-intensity': '1',
                      style: {
                        width: '100%',
                        height: '340px',
                        background: '#020617',
                      },
                    })
                  ) : (
                    <div className="h-[280px] flex items-center justify-center font-mono text-slate-500 text-xs">
                      NO GLB PREVIEW
                    </div>
                  )}
                  <div className="absolute left-3 bottom-3 px-2 py-1 bg-black/80 border border-emerald-500/50 text-[9px] font-mono text-emerald-300">
                    VERIFIED PROJECT ARTIFACT
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-[10px]">
                  <div className="border border-cyan-500/20 p-2">
                    <div className="text-slate-500">MESHES / PARTS</div>
                    <div className="text-cyan-200">{metadata.mesh_count ?? 'n/a'} / {metadata.modular_part_count ?? 'n/a'}</div>
                  </div>
                  <div className="border border-cyan-500/20 p-2">
                    <div className="text-slate-500">TAIL / SPINES</div>
                    <div className="text-cyan-200">{metadata.tail_segment_count ?? 'n/a'} / {metadata.back_spine_count ?? 'n/a'}</div>
                  </div>
                  <div className="border border-cyan-500/20 p-2">
                    <div className="text-slate-500">VERTICES / TRIANGLES</div>
                    <div className="text-cyan-200">{metadata.vertices ?? 'n/a'} / {metadata.polygons ?? 'n/a'}</div>
                  </div>
                  <div className="border border-cyan-500/20 p-2">
                    <div className="text-slate-500">RIG</div>
                    <div className="text-cyan-200">{metadata.rig_present ? 'YES' : 'NO'}</div>
                  </div>
                </div>

                <div className="border border-fuchsia-500/30 bg-fuchsia-950/10 p-3">
                  <div className="text-[9px] font-mono text-fuchsia-300">VERSION LINEAGE</div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-200">
                    <span>{version.parent_version_id || 'ROOT'}</span>
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-200">{version.version_id}</span>
                  </div>
                  <div className="mt-2 text-[9px] font-mono text-cyan-300">
                    {(version.modifiers || []).length ? version.modifiers.join(' · ') : 'BASE'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {glbUrl && (
                    <a href={glbUrl} download={`${project.name}_${version.version_id}.glb`} className="h-11 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      DOWNLOAD GLB · {fmtBytes(glb?.size)}
                    </a>
                  )}
                  {blendUrl && (
                    <a href={blendUrl} download={`${project.name}_${version.version_id}.blend`} className="h-11 border border-cyan-500/50 text-cyan-300 font-mono text-xs flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      DOWNLOAD BLEND · {fmtBytes(blend?.size)}
                    </a>
                  )}
                </div>

                            <div className="border border-amber-500/30 bg-amber-950/10 p-3">
              <div className="text-[9px] font-mono tracking-[0.16em] text-amber-300">
                VERIFIED ARTIFACT MODIFY
              </div>

              <div className="mt-2 text-[9px] font-mono text-slate-400 break-all">
                BASE {project.project_id}/{version.version_id}
                {' · '}
                SHA {blend?.sha256?.slice(0, 16) || 'n/a'}…
              </div>

              <textarea
                value={modifyPrompt}
                onChange={(event) => setModifyPrompt(event.target.value)}
                placeholder="Example: Увеличь глаза и укороти морду"
                className="mt-3 w-full min-h-[82px] bg-black border border-amber-500/30 p-2 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400"
                disabled={modifying}
              />

              <button
                type="button"
                onClick={() => void modifySelected()}
                disabled={
                  modifying
                  || !blend
                  || !version.verified
                  || !modifyPrompt.trim()
                }
                className="mt-2 w-full h-11 border border-amber-400/60 text-amber-200 font-mono text-xs disabled:opacity-30 hover:bg-amber-950/30"
              >
                {modifying
                  ? `MODIFYING VERIFIED BLEND · ${modifyState || 'RUNNING'}`
                  : 'USE THIS VERIFIED BLEND AS BASE'}
              </button>

              {modifyState && !modifying && (
                <div className="mt-2 text-[9px] font-mono text-emerald-300">
                  {modifyState}
                </div>
              )}
            </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-slate-500 text-xs">
                SELECT A VERIFIED VERSION
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
