import { VisionMeasurement } from '../types';

export type VisionScaleProvider =
  | 'aruco'
  | 'metric_ruler'
  | 'measuring_tape'
  | 'imperial_ruler'
  | 'manual_scale';

export interface VisionScaleResult {
  provider: VisionScaleProvider;
  unit: 'mm' | 'cm' | 'in';
  mmPerPixel: number;
  confidence: number;
  verified: boolean;
  markerId?: number;
  rulerLengthMm?: number;
}

export interface VisionBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisionObjectLock {
  objectId: string;
  bbox: VisionBoundingBox;
  contour?: Array<[number, number]>;
  confidence: number;
  locked: boolean;
  label?: string;
}

export interface VisionMeasurementV2 {
  measurementId: string;
  widthMm: number;
  heightMm: number;
  areaMm2?: number;
  shapeHint?: string;
  confidence: number;
  verified: boolean;
  scaleProvider: VisionScaleProvider;
  limitations?: string[];
  // Backwards compatibility with V1 fields
  v1Compat?: VisionMeasurement;
}

export type VisionAttachmentState =
  | 'PROCESSING'
  | 'VERIFIED'
  | 'APPROXIMATE'
  | 'REFERENCE ONLY'
  | 'NEED MORE INPUT'
  | 'FAILED';

export type VisionCameraMode = 'auto' | 'measure' | 'capture' | 'drawing';

export type CameraLifecycleState =
  | 'idle'
  | 'opening'
  | 'live'
  | 'capturing'
  | 'processing'
  | 'closing'
  | 'error';

export type CameraErrorCode =
  | 'permission_denied'
  | 'not_found'
  | 'in_use'
  | 'interrupted'
  | 'unsupported'
  | 'unknown';

export type ObjectCaptureStage =
  | 'setup'
  | 'waiting_for_object'
  | 'capturing'
  | 'coverage_progress'
  | 'processing'
  | 'complete'
  | 'error';

export interface CaptureSector {
  id: string;
  name: string;
  yawDeg: number;
  pitchDeg: number;
  completed: boolean;
  required: boolean;
}

export interface DrawingReviewDimension {
  id: string;
  name: string;
  nominalValue: number;
  unit: 'mm' | 'deg' | 'count';
  confidence: number;
  status: 'pending' | 'confirmed' | 'edited' | 'rejected';
  originalOcrText?: string;
}

export interface DrawingAnalysisResult {
  drawingId: string;
  dimensions: DrawingReviewDimension[];
  rawImageUrl?: string;
  line_count?: number;
  ocr_text?: string;
  truth_state?: string;
  confidence: number;
  verified: boolean;
  targetCadTool: 'FreeCAD' | 'OpenSCAD';
  status: 'analyzing' | 'ready_for_review' | 'need_more_input' | 'confirmed' | 'error';
}
