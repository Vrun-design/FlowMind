import type { PlaybackSequence } from './playback/contracts';

export type AnimatedExportKind = 'video' | 'gif' | 'reveal-video' | 'reveal-gif';

export interface AnimatedExportPreset {
  id: 'social-gif' | 'docs-loop' | 'presentation-video';
  label: string;
  kind: AnimatedExportKind;
  fps: number;
  maxDimension: number;
  pixelRatio: number;
}

export interface AnimatedExportPlan {
  preset: AnimatedExportPreset;
  frameWidth: number;
  frameHeight: number;
  estimatedBytes: number;
}

const VIDEO_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
] as const;

export function getAnimatedExportPreset(kind: AnimatedExportKind): AnimatedExportPreset {
  if (kind === 'gif') {
    return {
      id: 'social-gif',
      label: 'Social GIF',
      kind: 'gif',
      fps: 8,
      maxDimension: 960,
      pixelRatio: 1,
    };
  }

  return {
    id: 'presentation-video',
    label: 'Presentation Video',
    kind: 'video',
    fps: 12,
    maxDimension: 1440,
    pixelRatio: 1.5,
  };
}

export function scaleToFitBounds(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const longestSide = Math.max(safeWidth, safeHeight);
  if (longestSide <= maxDimension) {
    return {
      width: safeWidth,
      height: safeHeight,
    };
  }

  const scale = maxDimension / longestSide;
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}

export function estimateAnimatedExportBytes(plan: {
  kind: AnimatedExportKind;
  width: number;
  height: number;
  sequence: PlaybackSequence;
  fps: number;
}): number {
  const totalDurationMs = plan.sequence.steps.reduce((total, step) => total + step.durationMs, 0);
  const totalFrames = Math.max(1, Math.round((totalDurationMs / 1000) * plan.fps));
  const pixelsPerFrame = plan.width * plan.height;
  const bytesPerPixel = plan.kind === 'gif' ? 1.15 : 0.18;
  return Math.round(totalFrames * pixelsPerFrame * bytesPerPixel);
}

export function buildAnimatedExportPlan(params: {
  kind: AnimatedExportKind;
  width: number;
  height: number;
  sequence: PlaybackSequence;
}): AnimatedExportPlan {
  const preset = getAnimatedExportPreset(params.kind);
  const scaled = scaleToFitBounds(params.width, params.height, preset.maxDimension);
  return {
    preset,
    frameWidth: scaled.width,
    frameHeight: scaled.height,
    estimatedBytes: estimateAnimatedExportBytes({
      kind: params.kind,
      width: scaled.width,
      height: scaled.height,
      sequence: params.sequence,
      fps: preset.fps,
    }),
  };
}

export function selectSupportedVideoMimeType(
  recorderRef: Pick<typeof MediaRecorder, 'isTypeSupported'> | undefined
): string | null {
  if (!recorderRef || typeof recorderRef.isTypeSupported !== 'function') {
    return null;
  }

  for (const mimeType of VIDEO_MIME_TYPES) {
    if (recorderRef.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return null;
}

export function getAnimatedExportFileExtension(mimeType: string | null, kind: AnimatedExportKind): string {
  if (kind === 'gif') {
    return 'gif';
  }

  if (mimeType?.includes('mp4')) {
    return 'mp4';
  }

  return 'webm';
}
