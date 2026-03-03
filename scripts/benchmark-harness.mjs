import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    fixture: 'small-100',
    mode: 'dry-run',
    out: '',
    iterations: 10,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === '--fixture' && value) {
      args.fixture = value;
      i += 1;
      continue;
    }

    if (key === '--mode' && value) {
      args.mode = value;
      i += 1;
      continue;
    }

    if (key === '--out' && value) {
      args.out = value;
      i += 1;
      continue;
    }

    if (key === '--iterations' && value) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.iterations = parsed;
      }
      i += 1;
    }
  }

  return args;
}

function resolveFixturePath(fixtureArg) {
  const hasJsonExtension = fixtureArg.endsWith('.json');
  const filename = hasJsonExtension ? fixtureArg : `${fixtureArg}.json`;

  if (path.isAbsolute(filename)) {
    return filename;
  }

  return path.resolve(process.cwd(), 'benchmarks', 'fixtures', filename);
}

function fail(message) {
  console.error(`benchmark-harness failed: ${message}`);
  process.exit(1);
}

function loadFixture(fixturePath) {
  if (!fs.existsSync(fixturePath)) {
    fail(`fixture not found: ${fixturePath}`);
  }

  const raw = fs.readFileSync(fixturePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.nodes)) {
    fail('fixture.nodes must be an array');
  }

  if (!Array.isArray(parsed.edges)) {
    fail('fixture.edges must be an array');
  }

  return parsed;
}

function createResult(fixtureName, fixture, mode) {
  return {
    harnessVersion: 1,
    resultSchemaVersion: 1,
    timestamp: new Date().toISOString(),
    mode,
    fixture: {
      name: fixtureName,
      nodes: fixture.nodes.length,
      edges: fixture.edges.length,
    },
    metrics: {
      initialRenderMs: null,
      dragFrameBudget: null,
      layoutMs: null,
      routingHotspotMs: null,
      heapGrowthMb: null,
    },
    notes: mode === 'dry-run'
      ? ['Scaffold mode only: no runtime instrumentation executed.']
      : ['Measurement mode values are harness-proxy metrics, not browser paint timings.'],
  };
}

function resolveOutputPath(outArg, fixtureName, mode) {
  const safeFixtureName = path.basename(fixtureName, '.json');
  if (outArg) {
    return path.isAbsolute(outArg)
      ? outArg
      : path.resolve(process.cwd(), outArg);
  }

  const safeMode = mode.replace(/[^a-z0-9-]/gi, '-');
  return path.resolve(process.cwd(), 'benchmarks', 'results', `${safeFixtureName}.${safeMode}.latest.json`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (
    args.mode !== 'dry-run'
    && args.mode !== 'initial-render'
    && args.mode !== 'drag-frame-budget'
    && args.mode !== 'layout'
    && args.mode !== 'routing-hotspot'
    && args.mode !== 'heap-growth'
  ) {
    fail('unsupported mode. Use --mode dry-run, --mode initial-render, --mode drag-frame-budget, --mode layout, --mode routing-hotspot, or --mode heap-growth.');
  }

  const fixturePath = resolveFixturePath(args.fixture);
  const fixture = loadFixture(fixturePath);
  const fixtureName = path.basename(fixturePath);
  const result = createResult(fixtureName, fixture, args.mode);
  const outputPath = resolveOutputPath(args.out, fixtureName, args.mode);

  if (args.mode === 'initial-render') {
    const samples = [];
    for (let i = 0; i < args.iterations; i += 1) {
      const started = performance.now();

      // Proxy for initial render workload: clone fixture payload and build edge adjacency.
      const nodes = fixture.nodes.map(node => ({ ...node, data: { ...(node.data || {}) } }));
      const edges = fixture.edges.map(edge => ({ ...edge }));
      const adjacency = new Map();
      for (const node of nodes) {
        adjacency.set(node.id, 0);
      }
      for (const edge of edges) {
        adjacency.set(edge.source, (adjacency.get(edge.source) || 0) + 1);
        adjacency.set(edge.target, (adjacency.get(edge.target) || 0) + 1);
      }

      // Keep optimizer from discarding work.
      if (adjacency.size === 0) {
        fail('adjacency build failed');
      }

      const ended = performance.now();
      samples.push(ended - started);
    }

    const sorted = samples.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];

    result.metrics.initialRenderMs = Number(median.toFixed(3));
    result.metrics.initialRenderP95Ms = Number(p95.toFixed(3));
    result.metrics.initialRenderSamples = samples.map(sample => Number(sample.toFixed(3)));
    result.notes.push(`iterations=${args.iterations}`);
  }

  if (args.mode === 'drag-frame-budget') {
    const frameSamples = [];
    const nodes = fixture.nodes;
    const edges = fixture.edges;

    for (let frame = 0; frame < args.iterations; frame += 1) {
      const started = performance.now();

      // Proxy drag-frame workload: move one node and recompute connected-edge fanout map.
      const movingNode = nodes[frame % nodes.length];
      const movedX = (movingNode.position?.x || 0) + frame;
      const movedY = (movingNode.position?.y || 0) + frame;
      let touchedEdges = 0;

      for (const edge of edges) {
        if (edge.source === movingNode.id || edge.target === movingNode.id) {
          touchedEdges += 1;
        }
      }

      // Keep the loop semantically tied to the moved node.
      if (Number.isNaN(movedX) || Number.isNaN(movedY)) {
        fail('invalid moved node coordinates');
      }

      const ended = performance.now();
      frameSamples.push({
        frame: frame + 1,
        frameMs: ended - started,
        touchedEdges,
      });
    }

    const msSamples = frameSamples.map(sample => sample.frameMs).sort((a, b) => a - b);
    const middle = Math.floor(msSamples.length / 2);
    const median = msSamples.length % 2 === 0
      ? (msSamples[middle - 1] + msSamples[middle]) / 2
      : msSamples[middle];
    const p95 = msSamples[Math.max(0, Math.ceil(msSamples.length * 0.95) - 1)];

    result.metrics.dragFrameBudget = {
      medianFrameMs: Number(median.toFixed(3)),
      p95FrameMs: Number(p95.toFixed(3)),
      sampleCount: frameSamples.length,
      framesOver16ms: frameSamples.filter(sample => sample.frameMs > 16).length,
      samples: frameSamples.map(sample => ({
        frame: sample.frame,
        frameMs: Number(sample.frameMs.toFixed(3)),
        touchedEdges: sample.touchedEdges,
      })),
    };
    result.notes.push(`iterations=${args.iterations}`);
  }

  if (args.mode === 'layout') {
    const layoutSamples = [];
    const edgesBySource = new Map();
    const edgesByTarget = new Map();

    for (const edge of fixture.edges) {
      edgesBySource.set(edge.source, (edgesBySource.get(edge.source) || 0) + 1);
      edgesByTarget.set(edge.target, (edgesByTarget.get(edge.target) || 0) + 1);
    }

    for (let i = 0; i < args.iterations; i += 1) {
      const started = performance.now();

      // Proxy layout workload: compute layered ordering and deterministic coordinates.
      const ordered = fixture.nodes
        .map(node => {
          const fanOut = edgesBySource.get(node.id) || 0;
          const fanIn = edgesByTarget.get(node.id) || 0;
          return {
            id: node.id,
            score: fanOut - fanIn,
          };
        })
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.id.localeCompare(b.id);
        });

      const positioned = ordered.map((item, index) => ({
        id: item.id,
        x: (index % 20) * 180,
        y: Math.floor(index / 20) * 140,
      }));

      if (positioned.length !== fixture.nodes.length) {
        fail('layout positioning mismatch');
      }

      const ended = performance.now();
      layoutSamples.push(ended - started);
    }

    const sorted = layoutSamples.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];

    result.metrics.layoutMs = {
      medianMs: Number(median.toFixed(3)),
      p95Ms: Number(p95.toFixed(3)),
      sampleCount: layoutSamples.length,
      samples: layoutSamples.map(sample => Number(sample.toFixed(3))),
    };
    result.notes.push(`iterations=${args.iterations}`);
  }

  if (args.mode === 'routing-hotspot') {
    const samples = [];
    const nodesById = new Map(fixture.nodes.map(node => [node.id, node]));
    const edgeAdjacency = new Map();

    for (const edge of fixture.edges) {
      if (!edgeAdjacency.has(edge.source)) edgeAdjacency.set(edge.source, []);
      if (!edgeAdjacency.has(edge.target)) edgeAdjacency.set(edge.target, []);
      edgeAdjacency.get(edge.source).push(edge.id);
      edgeAdjacency.get(edge.target).push(edge.id);
    }

    let processedEdgeCount = 0;
    for (let i = 0; i < args.iterations; i += 1) {
      const started = performance.now();
      let iterationCost = 0;

      // Proxy routing hotspot: path-segment and collision-style checks on connected edges.
      for (const edge of fixture.edges) {
        const sourceNode = nodesById.get(edge.source);
        const targetNode = nodesById.get(edge.target);

        if (!sourceNode || !targetNode) {
          fail('routing-hotspot fixture edge references missing node');
        }

        const sourceX = sourceNode.position?.x || 0;
        const sourceY = sourceNode.position?.y || 0;
        const targetX = targetNode.position?.x || 0;
        const targetY = targetNode.position?.y || 0;

        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const manhattan = Math.abs(dx) + Math.abs(dy);
        const fanoutPressure = (edgeAdjacency.get(edge.source)?.length || 0) + (edgeAdjacency.get(edge.target)?.length || 0);

        // Simulate multi-segment route refinement and light collision penalties.
        const bendCost = Math.ceil(manhattan / 140);
        const collisionPenalty = fanoutPressure > 10 ? fanoutPressure - 10 : 0;
        iterationCost += bendCost + collisionPenalty;
        processedEdgeCount += 1;
      }

      if (iterationCost < 0) {
        fail('routing-hotspot invalid iteration cost');
      }

      const ended = performance.now();
      samples.push(ended - started);
    }

    const sorted = samples.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];

    result.metrics.routingHotspotMs = {
      medianMs: Number(median.toFixed(3)),
      p95Ms: Number(p95.toFixed(3)),
      sampleCount: samples.length,
      processedEdgesPerRun: processedEdgeCount,
      samples: samples.map(sample => Number(sample.toFixed(3))),
    };
    result.notes.push(`iterations=${args.iterations}`);
    result.notes.push('routing-hotspot simulates routing CPU pressure; values are Node.js proxy metrics.');
  }

  if (args.mode === 'heap-growth') {
    const toMb = (bytes) => Number((bytes / (1024 * 1024)).toFixed(3));
    const samples = [];
    const retained = [];
    const startHeap = process.memoryUsage().heapUsed;
    let peakHeap = startHeap;

    for (let i = 0; i < args.iterations; i += 1) {
      // Proxy memory workload: allocate a transformed copy and retain it for session-style growth.
      const transformed = {
        iteration: i + 1,
        nodes: fixture.nodes.map(node => ({
          id: node.id,
          x: node.position?.x || 0,
          y: node.position?.y || 0,
          label: node.data?.label || '',
        })),
        edges: fixture.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };
      retained.push(transformed);

      const heapNow = process.memoryUsage().heapUsed;
      peakHeap = Math.max(peakHeap, heapNow);
      samples.push(toMb(heapNow));
    }

    const endHeap = process.memoryUsage().heapUsed;
    result.metrics.heapGrowthMb = {
      startMb: toMb(startHeap),
      endMb: toMb(endHeap),
      deltaMb: toMb(endHeap - startHeap),
      peakMb: toMb(peakHeap),
      sampleCount: samples.length,
      samples,
    };
    result.notes.push(`iterations=${args.iterations}`);
    result.notes.push('heap-growth uses Node.js heap proxies, not browser heap snapshots.');
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

  console.log(`benchmark-harness ${args.mode} complete.`);
  console.log(`fixture: ${fixtureName}`);
  console.log(`nodes: ${result.fixture.nodes}, edges: ${result.fixture.edges}`);
  if (result.metrics.initialRenderMs !== null) {
    console.log(`initialRenderMs (median): ${result.metrics.initialRenderMs}`);
    console.log(`initialRenderP95Ms: ${result.metrics.initialRenderP95Ms}`);
  }
  if (result.metrics.dragFrameBudget !== null) {
    console.log(`dragFrame median(ms): ${result.metrics.dragFrameBudget.medianFrameMs}`);
    console.log(`dragFrame p95(ms): ${result.metrics.dragFrameBudget.p95FrameMs}`);
    console.log(`dragFrame >16ms: ${result.metrics.dragFrameBudget.framesOver16ms}`);
  }
  if (result.metrics.layoutMs !== null) {
    console.log(`layout median(ms): ${result.metrics.layoutMs.medianMs}`);
    console.log(`layout p95(ms): ${result.metrics.layoutMs.p95Ms}`);
  }
  if (result.metrics.routingHotspotMs !== null) {
    console.log(`routing-hotspot median(ms): ${result.metrics.routingHotspotMs.medianMs}`);
    console.log(`routing-hotspot p95(ms): ${result.metrics.routingHotspotMs.p95Ms}`);
    console.log(`routing-hotspot processedEdgesPerRun: ${result.metrics.routingHotspotMs.processedEdgesPerRun}`);
  }
  if (result.metrics.heapGrowthMb !== null) {
    console.log(`heap start(MB): ${result.metrics.heapGrowthMb.startMb}`);
    console.log(`heap end(MB): ${result.metrics.heapGrowthMb.endMb}`);
    console.log(`heap delta(MB): ${result.metrics.heapGrowthMb.deltaMb}`);
    console.log(`heap peak(MB): ${result.metrics.heapGrowthMb.peakMb}`);
  }
  console.log(`output: ${outputPath}`);
}

main();
