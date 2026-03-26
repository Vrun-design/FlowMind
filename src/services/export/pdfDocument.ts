function encodePdfText(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concatenatePdfParts(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function base64ToUint8Array(base64Value: string): Uint8Array {
  const binaryValue = atob(base64Value);
  const output = new Uint8Array(binaryValue.length);

  for (let index = 0; index < binaryValue.length; index += 1) {
    output[index] = binaryValue.charCodeAt(index);
  }

  return output;
}

function extractJpegBytes(jpegDataUrl: string): Uint8Array {
  const match = jpegDataUrl.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!match) {
    throw new Error('PDF export requires a JPEG data URL.');
  }

  return base64ToUint8Array(match[1]);
}

function buildPdfObject(objectId: number, body: Uint8Array): Uint8Array {
  const header = encodePdfText(`${objectId} 0 obj\n`);
  const footer = encodePdfText('\nendobj\n');
  return concatenatePdfParts([header, body, footer]);
}

function buildXrefTable(objectOffsets: number[], startOffset: number): Uint8Array {
  const lines = [
    'xref',
    `0 ${objectOffsets.length + 1}`,
    '0000000000 65535 f ',
    ...objectOffsets.map((offset) => `${offset.toString().padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objectOffsets.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(startOffset),
    '%%EOF',
  ];

  return encodePdfText(`${lines.join('\n')}\n`);
}

export function createPdfFromJpeg(params: {
  jpegDataUrl: string;
  width: number;
  height: number;
  title?: string;
}): Blob {
  const jpegBytes = extractJpegBytes(params.jpegDataUrl);
  const width = Math.max(1, Math.round(params.width));
  const height = Math.max(1, Math.round(params.height));
  const pageCommands = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ`;
  const escapedTitle = params.title?.replace(/[()\\]/g, '\\$&');
  const objectBodies: Uint8Array[] = [
    encodePdfText('<< /Type /Catalog /Pages 2 0 R >>'),
    encodePdfText('<< /Type /Pages /Count 1 /Kids [3 0 R] >>'),
    encodePdfText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
    concatenatePdfParts([
      encodePdfText(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      encodePdfText('\nendstream'),
    ]),
    encodePdfText(`<< /Length ${pageCommands.length} >>\nstream\n${pageCommands}\nendstream`),
  ];

  if (escapedTitle) {
    objectBodies.push(encodePdfText(`<< /Title (${escapedTitle}) >>`));
  }

  const header = encodePdfText('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
  const parts: Uint8Array[] = [header];
  const objectOffsets: number[] = [];
  let currentOffset = header.length;

  for (let index = 0; index < objectBodies.length; index += 1) {
    const objectBytes = buildPdfObject(index + 1, objectBodies[index]);
    objectOffsets.push(currentOffset);
    parts.push(objectBytes);
    currentOffset += objectBytes.length;
  }

  parts.push(buildXrefTable(objectOffsets, currentOffset));

  return new Blob([concatenatePdfParts(parts)], { type: 'application/pdf' });
}
