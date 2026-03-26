import { describe, expect, it } from 'vitest';
import { createPdfFromJpeg } from './pdfDocument';

const TINY_JPEG_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFRUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB6gD/xAAXEAEBAQEAAAAAAAAAAAAAAAABEQAh/9oACAEBAAEFApJrj//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8BP//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8BP//Z';

describe('createPdfFromJpeg', () => {
  it('builds a PDF blob from a JPEG data URL', async () => {
    const pdfBlob = createPdfFromJpeg({
      jpegDataUrl: TINY_JPEG_DATA_URL,
      width: 320,
      height: 180,
      title: 'OpenFlowKit Diagram',
    });

    expect(pdfBlob.type).toBe('application/pdf');
    expect(pdfBlob.size).toBeGreaterThan(100);
    expect(String(pdfBlob)).toContain('Blob');
  });

  it('rejects non-JPEG data URLs', () => {
    expect(() => createPdfFromJpeg({
      jpegDataUrl: 'data:image/png;base64,abc123',
      width: 320,
      height: 180,
    })).toThrow('PDF export requires a JPEG data URL.');
  });
});
