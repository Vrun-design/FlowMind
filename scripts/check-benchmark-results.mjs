import fs from 'node:fs';
import path from 'node:path';

const RESULTS_DIR = path.resolve(process.cwd(), 'benchmarks', 'results');
const MODE_SET = new Set(['dry-run', 'initial-render', 'drag-frame-budget', 'layout', 'routing-hotspot', 'heap-growth']);
const MODE_FILE_RE = /^(.+)\.(dry-run|initial-render|drag-frame-budget|layout|routing-hotspot|heap-growth)\.latest\.json$/;
const SUMMARY_FILE_RE = /^(.+)\.summary\.latest\.json$/;

function fail(message) {
  console.error(`bench:check failed: ${message}`);
  process.exit(1);
}

function requireNumber(value, field, file) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    fail(`${file}: ${field} must be a number`);
  }
}

function requireString(value, field, file) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${file}: ${field} must be a non-empty string`);
  }
}

function requireArray(value, field, file) {
  if (!Array.isArray(value)) {
    fail(`${file}: ${field} must be an array`);
  }
}

function validateCommonResult(data, file) {
  requireNumber(data.harnessVersion, 'harnessVersion', file);
  requireNumber(data.resultSchemaVersion, 'resultSchemaVersion', file);
  requireString(data.timestamp, 'timestamp', file);
}

function validateModeFile(data, file, expectedMode) {
  validateCommonResult(data, file);
  requireString(data.mode, 'mode', file);
  if (data.mode !== expectedMode) {
    fail(`${file}: mode mismatch. expected=${expectedMode} actual=${data.mode}`);
  }
  if (!MODE_SET.has(data.mode)) {
    fail(`${file}: unsupported mode ${data.mode}`);
  }
  if (!data.fixture || typeof data.fixture !== 'object') {
    fail(`${file}: fixture object missing`);
  }
  requireString(data.fixture.name, 'fixture.name', file);
  requireNumber(data.fixture.nodes, 'fixture.nodes', file);
  requireNumber(data.fixture.edges, 'fixture.edges', file);
  if (!data.metrics || typeof data.metrics !== 'object') {
    fail(`${file}: metrics object missing`);
  }

  if (data.mode === 'initial-render') {
    requireNumber(data.metrics.initialRenderMs, 'metrics.initialRenderMs', file);
    requireNumber(data.metrics.initialRenderP95Ms, 'metrics.initialRenderP95Ms', file);
    requireArray(data.metrics.initialRenderSamples, 'metrics.initialRenderSamples', file);
  }

  if (data.mode === 'drag-frame-budget') {
    const drag = data.metrics.dragFrameBudget;
    if (!drag || typeof drag !== 'object') {
      fail(`${file}: metrics.dragFrameBudget missing`);
    }
    requireNumber(drag.medianFrameMs, 'metrics.dragFrameBudget.medianFrameMs', file);
    requireNumber(drag.p95FrameMs, 'metrics.dragFrameBudget.p95FrameMs', file);
    requireNumber(drag.sampleCount, 'metrics.dragFrameBudget.sampleCount', file);
    requireNumber(drag.framesOver16ms, 'metrics.dragFrameBudget.framesOver16ms', file);
    requireArray(drag.samples, 'metrics.dragFrameBudget.samples', file);
  }

  if (data.mode === 'layout') {
    const layout = data.metrics.layoutMs;
    if (!layout || typeof layout !== 'object') {
      fail(`${file}: metrics.layoutMs missing`);
    }
    requireNumber(layout.medianMs, 'metrics.layoutMs.medianMs', file);
    requireNumber(layout.p95Ms, 'metrics.layoutMs.p95Ms', file);
    requireNumber(layout.sampleCount, 'metrics.layoutMs.sampleCount', file);
    requireArray(layout.samples, 'metrics.layoutMs.samples', file);
  }

  if (data.mode === 'heap-growth') {
    const heap = data.metrics.heapGrowthMb;
    if (!heap || typeof heap !== 'object') {
      fail(`${file}: metrics.heapGrowthMb missing`);
    }
    requireNumber(heap.startMb, 'metrics.heapGrowthMb.startMb', file);
    requireNumber(heap.endMb, 'metrics.heapGrowthMb.endMb', file);
    requireNumber(heap.deltaMb, 'metrics.heapGrowthMb.deltaMb', file);
    requireNumber(heap.peakMb, 'metrics.heapGrowthMb.peakMb', file);
    requireNumber(heap.sampleCount, 'metrics.heapGrowthMb.sampleCount', file);
    requireArray(heap.samples, 'metrics.heapGrowthMb.samples', file);
  }

  if (data.mode === 'routing-hotspot') {
    const routing = data.metrics.routingHotspotMs;
    if (!routing || typeof routing !== 'object') {
      fail(`${file}: metrics.routingHotspotMs missing`);
    }
    requireNumber(routing.medianMs, 'metrics.routingHotspotMs.medianMs', file);
    requireNumber(routing.p95Ms, 'metrics.routingHotspotMs.p95Ms', file);
    requireNumber(routing.sampleCount, 'metrics.routingHotspotMs.sampleCount', file);
    requireNumber(routing.processedEdgesPerRun, 'metrics.routingHotspotMs.processedEdgesPerRun', file);
    requireArray(routing.samples, 'metrics.routingHotspotMs.samples', file);
  }
}

function validateSummaryFile(data, file) {
  validateCommonResult(data, file);
  requireString(data.fixture, 'fixture', file);
  if (!data.modes || typeof data.modes !== 'object') {
    fail(`${file}: modes object missing`);
  }
  for (const mode of ['initial-render', 'drag-frame-budget', 'layout', 'routing-hotspot', 'heap-growth']) {
    const modeData = data.modes[mode];
    if (!modeData || typeof modeData !== 'object') {
      fail(`${file}: modes.${mode} missing`);
    }
    requireString(modeData.status, `modes.${mode}.status`, file);
    requireString(modeData.file, `modes.${mode}.file`, file);
  }
}

function main() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fail(`results directory not found: ${RESULTS_DIR}`);
  }

  const files = fs.readdirSync(RESULTS_DIR).filter(name => name.endsWith('.json')).sort();
  if (files.length === 0) {
    fail('no benchmark result files found');
  }

  let validated = 0;

  for (const filename of files) {
    if (filename.endsWith('.latest.json') && !MODE_FILE_RE.test(filename) && !SUMMARY_FILE_RE.test(filename)) {
      // Ignore legacy/non-standard artifacts while preserving backward compatibility.
      continue;
    }

    const fullPath = path.join(RESULTS_DIR, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(raw);

    const modeMatch = filename.match(MODE_FILE_RE);
    if (modeMatch) {
      validateModeFile(data, filename, modeMatch[2]);
      validated += 1;
      continue;
    }

    const summaryMatch = filename.match(SUMMARY_FILE_RE);
    if (summaryMatch) {
      validateSummaryFile(data, filename);
      validated += 1;
    }
  }

  if (validated === 0) {
    fail('no files matched benchmark schema patterns');
  }

  console.log(`bench:check passed. validated ${validated} files.`);
}

main();
