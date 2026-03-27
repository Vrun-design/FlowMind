import { describe, expect, it } from 'vitest';
import { getAnimatedExportFileExtension, selectSupportedVideoMimeType } from './animatedExport';

describe('animated export helpers', () => {
  it('chooses the first supported recorder mime type', () => {
    const mimeType = selectSupportedVideoMimeType({
      isTypeSupported: (candidate) => candidate === 'video/webm;codecs=vp8',
    });

    expect(mimeType).toBe('video/webm;codecs=vp8');
  });

  it('derives a video file extension from the recorder mime type', () => {
    expect(getAnimatedExportFileExtension('video/webm;codecs=vp8')).toBe('webm');
    expect(getAnimatedExportFileExtension('video/mp4')).toBe('mp4');
    expect(getAnimatedExportFileExtension(null)).toBe('webm');
  });
});
