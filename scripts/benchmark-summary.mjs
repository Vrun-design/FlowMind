import fs from 'node:fs';
import path from 'node:path';

const MODES = ['initial-render', 'drag-frame-budget', 'layout', 'routing-hotspot', 'heap-growth'];

function parseArgs(argv) {
  const args = {
    fixture: 'small-100',
    out: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === '--fixture' && value) {
      args.fixture = value;
      i += 1;
      continue;
    }

    if (key === '--out' && value) {
      args.out = value;
      i += 1;
    }
  }

  return args;
}

function resolveFixtureName(fixtureArg) {
  return fixtureArg.endsWith('.json') ? path.basename(fixtureArg, '.json') : fixtureArg;
}

function resolveModePath(fixtureName, mode) {
  return path.resolve(process.cwd(), 'benchmarks', 'results', `${fixtureName}.${mode}.latest.json`);
}

function resolveOutputPath(args, fixtureName) {
  if (args.out) {
    return path.isAbsolute(args.out)
      ? args.out
      : path.resolve(process.cwd(), args.out);
  }
  return path.resolve(process.cwd(), 'benchmarks', 'results', `${fixtureName}.summary.latest.json`);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildModeSummary(mode, data) {
  if (!data) {
    return { status: 'missing' };
  }

  if (mode === 'initial-render') {
    return {
      status: 'ok',
      medianMs: data.metrics?.initialRenderMs ?? null,
      p95Ms: data.metrics?.initialRenderP95Ms ?? null,
    };
  }

  if (mode === 'drag-frame-budget') {
    const drag = data.metrics?.dragFrameBudget;
    return {
      status: 'ok',
      medianMs: drag?.medianFrameMs ?? null,
      p95Ms: drag?.p95FrameMs ?? null,
      framesOver16ms: drag?.framesOver16ms ?? null,
    };
  }

  if (mode === 'layout') {
    const layout = data.metrics?.layoutMs;
    return {
      status: 'ok',
      medianMs: layout?.medianMs ?? null,
      p95Ms: layout?.p95Ms ?? null,
    };
  }

  if (mode === 'heap-growth') {
    const heap = data.metrics?.heapGrowthMb;
    return {
      status: 'ok',
      startMb: heap?.startMb ?? null,
      endMb: heap?.endMb ?? null,
      deltaMb: heap?.deltaMb ?? null,
      peakMb: heap?.peakMb ?? null,
    };
  }

  if (mode === 'routing-hotspot') {
    const routing = data.metrics?.routingHotspotMs;
    return {
      status: 'ok',
      medianMs: routing?.medianMs ?? null,
      p95Ms: routing?.p95Ms ?? null,
      processedEdgesPerRun: routing?.processedEdgesPerRun ?? null,
    };
  }

  return { status: 'unsupported' };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const fixtureName = resolveFixtureName(args.fixture);
  const outputPath = resolveOutputPath(args, fixtureName);

  const summary = {
    harnessVersion: 1,
    resultSchemaVersion: 1,
    timestamp: new Date().toISOString(),
    fixture: fixtureName,
    modes: {},
  };

  for (const mode of MODES) {
    const modePath = resolveModePath(fixtureName, mode);
    const data = readJsonIfExists(modePath);
    summary.modes[mode] = {
      file: modePath,
      ...buildModeSummary(mode, data),
    };
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`benchmark summary complete for fixture: ${fixtureName}`);
  for (const mode of MODES) {
    const modeSummary = summary.modes[mode];
    console.log(`${mode}: ${modeSummary.status}`);
  }
  console.log(`output: ${outputPath}`);
}

main();
