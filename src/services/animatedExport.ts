const VIDEO_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
] as const;

export function selectSupportedVideoMimeType(
  recorderRef: Pick<typeof MediaRecorder, 'isTypeSupported'> | undefined,
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

export function getAnimatedExportFileExtension(mimeType: string | null): string {
  if (mimeType?.includes('mp4')) {
    return 'mp4';
  }

  return 'webm';
}
