export interface TextBoxEstimateOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  charWidth?: number;
  lineHeight?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface TextBoxEstimate {
  width: number;
  height: number;
  lineCount: number;
}

const DEFAULT_CHAR_WIDTH = 9.5;
const DEFAULT_LINE_HEIGHT = 22;
const DEFAULT_HORIZONTAL_PADDING = 12;
const DEFAULT_VERTICAL_PADDING = 16;
export const DEFAULT_MAX_WIDTH = 200;

function splitLongToken(token: string, maxCharsPerLine: number): string[] {
  if (token.length <= maxCharsPerLine) {
    return [token];
  }

  const parts: string[] = [];
  for (let index = 0; index < token.length; index += maxCharsPerLine) {
    parts.push(token.slice(index, index + maxCharsPerLine));
  }
  return parts;
}

function estimateWrappedLineLengths(
  label: string,
  maxCharsPerLine: number
): number[] {
  const normalized = label.trim();
  if (!normalized) {
    return [0];
  }

  const paragraphs = normalized.split(/\r?\n/);
  const lineLengths: number[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lineLengths.push(0);
      continue;
    }

    let currentLineLength = 0;
    for (const word of words) {
      const parts = splitLongToken(word, maxCharsPerLine);
      for (const part of parts) {
        if (currentLineLength === 0) {
          currentLineLength = part.length;
          continue;
        }

        const nextLength = currentLineLength + 1 + part.length;
        if (nextLength <= maxCharsPerLine) {
          currentLineLength = nextLength;
          continue;
        }

        lineLengths.push(currentLineLength);
        currentLineLength = part.length;
      }
    }

    lineLengths.push(currentLineLength);
  }

  return lineLengths.length > 0 ? lineLengths : [0];
}

export function estimateWrappedTextBox(
  label: string,
  options: TextBoxEstimateOptions = {}
): TextBoxEstimate {
  const charWidth = options.charWidth ?? DEFAULT_CHAR_WIDTH;
  const lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const horizontalPadding = options.horizontalPadding ?? DEFAULT_HORIZONTAL_PADDING;
  const verticalPadding = options.verticalPadding ?? DEFAULT_VERTICAL_PADDING;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const minWidth = options.minWidth ?? 0;
  const minHeight = options.minHeight ?? 0;
  const usableTextWidth = Math.max(maxWidth - horizontalPadding * 2, charWidth);
  const maxCharsPerLine = Math.max(1, Math.floor(usableTextWidth / charWidth));
  const lineLengths = estimateWrappedLineLengths(label, maxCharsPerLine);
  const longestLine = Math.max(...lineLengths, 0);
  const lineCount = Math.max(1, lineLengths.length);
  const estimatedWidth = Math.min(
    maxWidth,
    Math.ceil(longestLine * charWidth + horizontalPadding * 2)
  );
  const estimatedHeight = Math.ceil(lineCount * lineHeight + verticalPadding * 2);

  return {
    width: Math.max(minWidth, estimatedWidth),
    height: Math.max(minHeight, estimatedHeight),
    lineCount,
  };
}
