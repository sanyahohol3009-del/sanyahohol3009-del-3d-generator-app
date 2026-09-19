export type MessageSender = 'user' | 'golem';

export interface ModelDetails {
  name: string;
  vertices: number;
  polygons: number;
  format: string;
  renderTime: string;
  fileSize?: string;
  textureComplexity?: string;
  meshDensity?: string;
  dimensions?: string;
  uvChannels?: number;
  drawCalls?: number;
  materialCount?: number;
  rigged?: boolean;
  dracoCompression?: string;
  characterName?: string;
  species?: string;
  profileId?: string;
  variantOf?: string;
  modifiers?: string[];
  modularParts?: number;
  tailSegments?: number;
  backSpines?: number;
  rigPresent?: boolean;
}

export type SynthesisStage = 'ingestion' | 'mesh_synthesis' | 'complete';

export interface SynthesisProgressData {
  stage: SynthesisStage;
  progress: number; // 0 to 100
  statusText: string;
  subDetail?: string;
  tflops?: number;
  polygons?: number;
  vertices?: number;
}

export interface ModelArtifactRef {
  jobId: string;
  provider: string;
  glbUrl?: string;
  downloadUrl?: string;
  sha256?: string;
  effectStatus?: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  source?: string;
  is3DModel?: boolean;
  modelDetails?: ModelDetails;
  modelAsset?: ModelArtifactRef;
  attachedImage?: string;
  isSynthesizing?: boolean;
  synthesisProgress?: SynthesisProgressData;
}

export interface SynthesisHistoryItem {
  id: string;
  messageId: string;
  modelName: string;
  timestamp: string;
  promptSnippet?: string;
  modelDetails: ModelDetails;
  modelAsset?: ModelArtifactRef;
}

export type AppLanguage = 'en' | 'ru' | 'de';

export interface StorageFolder {
  id: string;
  name: {
    en: string;
    ru: string;
    de: string;
  };
  count: number;
  size: string;
  icon: 'box' | 'file-text' | 'share-2' | 'cpu';
}

export interface FlutterCodeFile {
  path: string;
  name: string;
  category: 'core' | 'screens' | 'widgets' | 'theme' | 'models' | 'config';
  description: string;
  code: string;
}
