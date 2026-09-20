export interface OrganSettings {
  endpoint: string;
  token: string;
}

export interface ArtifactEvidence {
  artifact_id: string;
  format: string;
  kind: string;
  path: string;
  sha256: string;
  size: number;
  provider: string;
  provider_version: string;
  authoritative: boolean;
  derived_from: string[];
}

export interface OrganResult {
  protocol_version: string;
  request_id: string;
  job_id: string;
  capability_id: string;
  status: string;
  receipt?: {
    provider_id: string;
    provider_version: string;
    worker_version: string;
    start_timestamp: number;
    end_timestamp: number;
    exit_code: number | null;
    evidence: {
      execution_evidence: Record<string, unknown>;
      artifact_evidence: ArtifactEvidence[];
      effect_verification: {
        verified: boolean;
        checks?: Record<string, boolean>;
        metadata?: Record<string, any>;
      };
    };
    execution_status: string;
    effect_status: string;
    error_code?: string | null;
  } | null;
  error_code?: string | null;
  error_details?: string | null;
}

export interface ProjectVersionSummary {
  project_id: string;
  version_id: string;
  version_dir: string;
  parent_version_id: string | null;
  source_job_id: string;
  created_at: number;
  modifiers: string[];
  verified: boolean;
}

export interface ProjectManifest {
  schema: string;
  project_id: string;
  name: string;
  kind: string;
  created_at: number;
  updated_at: number;
  latest_verified_version: string | null;
  versions: ProjectVersionSummary[];
}

export interface ProjectVersionArtifact {
  artifact_id?: string;
  format: string;
  filename: string;
  sha256?: string;
  size?: number;
  authoritative?: boolean;
  provider?: string;
  provider_version?: string;
}

export interface ProjectVersionRecord {
  schema: string;
  project_id: string;
  project_name: string;
  version_id: string;
  version_dir: string;
  parent_version_id: string | null;
  source_job_id: string;
  request_id: string;
  trace_id: string;
  capability_id: string;
  created_at: number;
  verified: boolean;
  effect_status: string;
  profile_id?: string;
  species?: string;
  modifiers: string[];
  artifacts: ProjectVersionArtifact[];
  metadata: Record<string, any>;
}

const ENDPOINT_KEY = 'golem.organ.endpoint';
const TOKEN_KEY = 'golem.organ.token';

function cleanEndpoint(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function envValue(name: 'VITE_MAKSIMAR_3D_ENDPOINT' | 'VITE_MAKSIMAR_3D_TOKEN'): string {
  return String((import.meta as any).env?.[name] ?? '').trim();
}

export class OrganClient {
  settings(): OrganSettings {
    const endpoint =
      localStorage.getItem(ENDPOINT_KEY) ||
      envValue('VITE_MAKSIMAR_3D_ENDPOINT') ||
      'http://127.0.0.1:8765';
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      envValue('VITE_MAKSIMAR_3D_TOKEN') ||
      '';
    return { endpoint: cleanEndpoint(endpoint), token };
  }

  saveSettings(value: OrganSettings) {
    localStorage.setItem(ENDPOINT_KEY, cleanEndpoint(value.endpoint));
    localStorage.setItem(TOKEN_KEY, value.token.trim());
  }

  private async request(path: string, init: RequestInit = {}, auth = false) {
    const settings = this.settings();
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');
    if (auth && settings.token) {
      headers.set('X-MAKSIMAR-3D-TOKEN', settings.token);
    }
    const response = await fetch(`${settings.endpoint}${path}`, { ...init, headers });
    const text = await response.text();
    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
    if (!response.ok) {
      const detail =
        payload?.error ||
        payload?.error_details ||
        payload?.error_code ||
        `HTTP ${response.status}`;
      throw new Error(String(detail));
    }
    return payload;
  }

  health() { return this.request('/v1/health'); }
  llmHealth() { return this.request('/v1/llm/health', {}, true); }
  voiceStatus() { return this.request('/v1/voice/status', {}, true); }
  runtimeSnapshot() { return this.request('/v1/runtime/snapshot', {}, true); }

  chat(input: {
    message: string;
    imageDataUrl?: string;
    preferredProvider?: string;
    traceId?: string;
    maxTime?: number;
  }) {
    return this.request('/v1/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: input.message,
        image_data_url: input.imageDataUrl,
        preferred_provider: input.preferredProvider || 'auto',
        trace_id: input.traceId,
        max_time: input.maxTime ?? 180,
      }),
    }, true);
  }

  narrate(text: string, systemId = 'golem') {
    return this.request('/v1/voice/narrate', {
      method: 'POST',
      body: JSON.stringify({ text, system_id: systemId }),
    }, true);
  }
  readiness() { return this.request('/v1/readiness'); }
  telemetry() { return this.request('/v1/system/telemetry'); }
  capabilities() { return this.request('/v1/capabilities'); }
  toolbelt() { return this.request('/v1/toolbelt', {}, true); }
  projects() { return this.request('/v1/projects', {}, true); }

  project(projectId: string) {
    return this.request(
      `/v1/projects/${encodeURIComponent(projectId)}`,
      {},
      true,
    );
  }

  projectLatest(projectId: string) {
    return this.request(
      `/v1/projects/${encodeURIComponent(projectId)}/latest`,
      {},
      true,
    );
  }

  projectVersion(projectId: string, versionId: string) {
    return this.request(
      `/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}`,
      {},
      true,
    );
  }

  modifyCharacter(input: {
    projectId: string;
    versionId: string;
    prompt: string;
    maxTime?: number;
  }) {
    return this.request(
      `/v1/projects/${encodeURIComponent(input.projectId)}/versions/${encodeURIComponent(input.versionId)}/modify`,
      {
        method: 'POST',
        body: JSON.stringify({
          prompt: input.prompt,
          max_time: input.maxTime ?? 240,
        }),
      },
      true,
    );
  }

  projectArtifactUrl(
    projectId: string,
    versionId: string,
    filename: string,
  ): string {
    const { endpoint, token } = this.settings();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${endpoint}/v1/projects/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(versionId)}/artifacts/${encodeURIComponent(filename)}${query}`;
  }

  history() { return this.request('/v1/history', {}, true); }
  vaults() { return this.request('/v1/vaults', {}, true); }

  synthesize(input: {
    prompt: string;
    imageDataUrl?: string;
    preferredProvider?: string;
    maxTime?: number;
  }) {
    return this.request(
      '/v1/synthesize',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt: input.prompt,
          image_data_url: input.imageDataUrl,
          preferred_provider: input.preferredProvider || 'auto',
          max_time: input.maxTime ?? 180,
        }),
      },
      true,
    );
  }

  job(jobId: string) {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, {}, true);
  }

  result(jobId: string) {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}/result`, {}, true);
  }

  cancel(jobId: string) {
    return this.request(
      `/v1/jobs/${encodeURIComponent(jobId)}/cancel`,
      { method: 'POST', body: '{}' },
      true,
    );
  }

  purgeCache() {
    return this.request(
      '/v1/runtime/cache/purge',
      { method: 'POST', body: '{}' },
      true,
    );
  }

  async importFile(file: File) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      binary += String.fromCharCode(...buffer.subarray(i, i + chunkSize));
    }
    return this.request(
      '/v1/import',
      {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          content_base64: btoa(binary),
        }),
      },
      true,
    );
  }

  artifactUrl(jobId: string, artifactPath: string): string {
    const { endpoint, token } = this.settings();
    const filename = artifactPath.split('/').pop() || artifactPath;
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${endpoint}/v1/artifacts/${encodeURIComponent(jobId)}/${encodeURIComponent(filename)}${query}`;
  }

  async waitForResult(
    jobId: string,
    onState?: (state: string) => void,
    timeoutMs = 240000,
  ): Promise<OrganResult> {
    const started = Date.now();
    let lastState = '';
    while (Date.now() - started < timeoutMs) {
      const status = await this.job(jobId);
      const state = String(status?.job?.state || 'queued');
      if (state !== lastState) {
        lastState = state;
        onState?.(state);
      }
      if (['succeeded', 'failed', 'cancelled'].includes(state)) {
        const payload = await this.result(jobId);
        if (!payload?.result) {
          throw new Error(`Job ${state} without result`);
        }
        return payload.result as OrganResult;
      }
      await new Promise((resolve) => setTimeout(resolve, 650));
    }
    throw new Error('3D synthesis timed out');
  }
}

export const organClient = new OrganClient();

export function pickArtifact(
  result: OrganResult,
  format: string,
): ArtifactEvidence | undefined {
  return result.receipt?.evidence?.artifact_evidence?.find(
    (item) => item.format.toLowerCase() === format.toLowerCase(),
  );
}
