type BBoxLike = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const PATCH_FLAG = Symbol.for('flowmind.mermaidMeasurementSupportPatched');
const ELEMENT_PATCH_FLAG = Symbol.for('flowmind.mermaidMeasurementSupportElementPatched');
const CREATE_NS_PATCH_FLAG = Symbol.for('flowmind.mermaidMeasurementSupportCreateElementNSPatched');
const SVG_NS = 'http://www.w3.org/2000/svg';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function estimateBBoxFromTextContent(textContent: string): BBoxLike {
  const lines = textContent.split(/\r?\n/);
  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);

  return {
    x: 0,
    y: 0,
    width: Math.max(24, longestLine * 8),
    height: Math.max(18, lines.length * 18),
  };
}

function measureElementBBox(target: Element): BBoxLike {
  if (typeof target.getBoundingClientRect === 'function') {
    const rect = target.getBoundingClientRect();
    if (isFiniteNumber(rect.width) && isFiniteNumber(rect.height) && (rect.width > 0 || rect.height > 0)) {
      return {
        x: isFiniteNumber(rect.x) ? rect.x : 0,
        y: isFiniteNumber(rect.y) ? rect.y : 0,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  return estimateBBoxFromTextContent(target.textContent?.trim() ?? '');
}

function defineMeasurementMethods(target: object): void {
  const patchable = target as {
    getBBox?: unknown;
    getComputedTextLength?: unknown;
  };

  const originalGetBBox =
    typeof patchable.getBBox === 'function'
      ? (patchable.getBBox as (this: Element) => BBoxLike)
      : null;
  Object.defineProperty(patchable, 'getBBox', {
    configurable: true,
    writable: true,
    value: function getBBox(this: Element): BBoxLike {
      if (originalGetBBox) {
        try {
          const bbox = originalGetBBox.call(this);
          if (isFiniteNumber(bbox.width) && isFiniteNumber(bbox.height)) {
            return bbox;
          }
        } catch {
          // Fall through to DOMRect/text-based estimation when native measurement fails.
        }
      }

      return measureElementBBox(this);
    },
  });

  const originalGetComputedTextLength =
    typeof patchable.getComputedTextLength === 'function'
      ? (patchable.getComputedTextLength as (this: Element) => number)
      : null;
  Object.defineProperty(patchable, 'getComputedTextLength', {
    configurable: true,
    writable: true,
    value: function getComputedTextLength(this: Element): number {
      if (originalGetComputedTextLength) {
        try {
          const length = originalGetComputedTextLength.call(this);
          if (isFiniteNumber(length)) {
            return length;
          }
        } catch {
          // Fall through to DOMRect/text-based estimation when native measurement fails.
        }
      }

      return measureElementBBox(this).width;
    },
  });
}

function patchSvgElementInstance(element: Element): void {
  const patchable = element as Element & { [ELEMENT_PATCH_FLAG]?: boolean };
  if (patchable[ELEMENT_PATCH_FLAG]) {
    return;
  }

  defineMeasurementMethods(patchable);
  Object.defineProperty(patchable, ELEMENT_PATCH_FLAG, {
    configurable: true,
    writable: true,
    value: true,
  });
}

function installBBoxShim(proto: object | undefined): void {
  if (!proto) {
    return;
  }

  const patchable = proto as {
    getBBox?: unknown;
    getComputedTextLength?: unknown;
    [PATCH_FLAG]?: boolean;
  };

  if (patchable[PATCH_FLAG]) {
    return;
  }

  defineMeasurementMethods(patchable);

  Object.defineProperty(patchable, PATCH_FLAG, {
    configurable: true,
    writable: true,
    value: true,
  });
}

function patchDocumentCreateElementNS(doc: Document): void {
  const patchable = doc as Document & {
    [CREATE_NS_PATCH_FLAG]?: boolean;
    createElementNS: Document['createElementNS'];
  };

  if (patchable[CREATE_NS_PATCH_FLAG]) {
    return;
  }

  const originalCreateElementNS = doc.createElementNS.bind(doc);
  Object.defineProperty(patchable, 'createElementNS', {
    configurable: true,
    writable: true,
    value(namespaceURI: string | null, qualifiedName: string, options?: ElementCreationOptions): Element {
      const element = originalCreateElementNS(namespaceURI, qualifiedName, options);
      if (namespaceURI === SVG_NS) {
        patchSvgElementInstance(element);
      }
      return element;
    },
  });

  Object.defineProperty(patchable, CREATE_NS_PATCH_FLAG, {
    configurable: true,
    writable: true,
    value: true,
  });
}

export function ensureMermaidMeasurementSupport(): void {
  if (typeof window === 'undefined') {
    return;
  }

  installBBoxShim(window.Element?.prototype);
  installBBoxShim(window.SVGElement?.prototype);
  installBBoxShim((window as Window & { SVGGraphicsElement?: { prototype?: object } }).SVGGraphicsElement?.prototype);
  installBBoxShim((window as Window & { SVGForeignObjectElement?: { prototype?: object } }).SVGForeignObjectElement?.prototype);
  installBBoxShim((window as Window & { SVGTextElement?: { prototype?: object } }).SVGTextElement?.prototype);
  if (document) {
    patchDocumentCreateElementNS(document);
  }
}
