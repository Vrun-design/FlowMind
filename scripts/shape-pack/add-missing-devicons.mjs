/**
 * Fetches missing infrastructure/dev tool icons from Simple Icons CDN
 * and appends them to the developer-icons-v1 manifest.
 *
 * Simple Icons: https://simpleicons.org — CC0 license for most icons.
 * Run: node scripts/shape-pack/add-missing-devicons.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.resolve(__dirname, '../../assets/third-party-icons/developer/processed/developer-icons-v1.manifest.json');

// Missing icons: { id suffix, display label, category, simpleicons slug }
const MISSING_ICONS = [
  // Network / Proxy / Service Mesh
  { id: 'infra-nginx',        label: 'Nginx',         category: 'Infra',     slug: 'nginx' },
  { id: 'infra-traefik',      label: 'Traefik',       category: 'Infra',     slug: 'traefikproxy' },
  { id: 'infra-haproxy',      label: 'HAProxy',       category: 'Infra',     slug: 'haproxy' },
  { id: 'infra-envoy',        label: 'Envoy',         category: 'Infra',     slug: 'envoyproxy' },
  { id: 'infra-istio',        label: 'Istio',         category: 'Infra',     slug: 'istio' },
  { id: 'infra-consul',       label: 'Consul',        category: 'Infra',     slug: 'consul' },
  { id: 'infra-kong',         label: 'Kong',          category: 'Infra',     slug: 'kong' },
  { id: 'infra-etcd',         label: 'etcd',          category: 'Infra',     slug: 'etcd' },
  { id: 'infra-linkerd',      label: 'Linkerd',       category: 'Infra',     slug: 'linkerd' },
  { id: 'infra-zookeeper',    label: 'Zookeeper',     category: 'Infra',     slug: 'apachezookeeper' },
  { id: 'infra-caddy',        label: 'Caddy',         category: 'Infra',     slug: 'caddy' },
  { id: 'infra-gunicorn',     label: 'Gunicorn',      category: 'Infra',     slug: 'gunicorn' },
  { id: 'infra-tomcat',       label: 'Tomcat',        category: 'Infra',     slug: 'apachetomcat' },

  // Monitoring / Observability
  { id: 'monitoring-prometheus',  label: 'Prometheus',    category: 'Monitoring', slug: 'prometheus' },
  { id: 'monitoring-sentry',      label: 'Sentry',        category: 'Monitoring', slug: 'sentry' },
  { id: 'monitoring-newrelic',    label: 'New Relic',     category: 'Monitoring', slug: 'newrelic' },
  { id: 'monitoring-datadog',     label: 'Datadog',       category: 'Monitoring', slug: 'datadog' },
  { id: 'monitoring-dynatrace',   label: 'Dynatrace',     category: 'Monitoring', slug: 'dynatrace' },
  { id: 'monitoring-splunk',      label: 'Splunk',        category: 'Monitoring', slug: 'splunk' },
  { id: 'monitoring-nagios',      label: 'Nagios',        category: 'Monitoring', slug: 'nagios' },
  { id: 'monitoring-zabbix',      label: 'Zabbix',        category: 'Monitoring', slug: 'zabbix' },
  { id: 'monitoring-jaeger',      label: 'Jaeger',        category: 'Monitoring', slug: 'jaegertracing' },

  // Databases
  { id: 'database-influxdb',      label: 'InfluxDB',      category: 'Database',   slug: 'influxdb' },
  { id: 'database-cockroachdb',   label: 'CockroachDB',   category: 'Database',   slug: 'cockroachlabs' },
  { id: 'database-neo4j',         label: 'Neo4j',         category: 'Database',   slug: 'neo4j' },
  { id: 'database-couchdb',       label: 'CouchDB',       category: 'Database',   slug: 'apachecouchdb' },
  { id: 'database-couchbase',     label: 'Couchbase',     category: 'Database',   slug: 'couchbase' },
  { id: 'database-duckdb',        label: 'DuckDB',        category: 'Database',   slug: 'duckdb' },
  { id: 'database-qdrant',        label: 'Qdrant',        category: 'Database',   slug: 'qdrant' },
  { id: 'database-scylla',        label: 'ScyllaDB',      category: 'Database',   slug: 'scylladb' },
  { id: 'database-druid',         label: 'Apache Druid',  category: 'Database',   slug: 'apachedruid' },

  // Queues / Messaging
  { id: 'queue-rabbitmq',     label: 'RabbitMQ',      category: 'Queue',     slug: 'rabbitmq' },
  { id: 'queue-nats',         label: 'NATS',          category: 'Queue',     slug: 'nats-io' },
  { id: 'queue-activemq',     label: 'ActiveMQ',      category: 'Queue',     slug: 'apacheactivemq' },
  { id: 'queue-celery',       label: 'Celery',        category: 'Queue',     slug: 'celery' },
  { id: 'queue-emqx',         label: 'EMQX',          category: 'Queue',     slug: 'emqx' },

  // Containers / Runtime
  { id: 'container-containerd',   label: 'containerd',    category: 'Container', slug: 'containerd' },
  { id: 'container-k3s',          label: 'K3s',           category: 'Container', slug: 'k3s' },
  { id: 'container-lxc',          label: 'LXC',           category: 'Container', slug: 'linuxcontainers' },

  // Logging
  { id: 'logging-loki',       label: 'Loki',          category: 'Logging',   slug: 'grafanaloki' },
  { id: 'logging-fluentbit',  label: 'Fluent Bit',    category: 'Logging',   slug: 'fluentbit' },
  { id: 'logging-fluentd',    label: 'Fluentd',       category: 'Logging',   slug: 'fluentd' },
  { id: 'logging-graylog',    label: 'Graylog',       category: 'Logging',   slug: 'graylog' },

  // CI
  { id: 'ci-travisci',    label: 'Travis CI',     category: 'CI-CD',     slug: 'travisci' },
  { id: 'ci-teamcity',    label: 'TeamCity',      category: 'CI-CD',     slug: 'teamcity' },
  { id: 'ci-droneci',     label: 'Drone CI',      category: 'CI-CD',     slug: 'drone' },

  // GitOps
  { id: 'gitops-argocd',  label: 'Argo CD',       category: 'GitOps',    slug: 'argo' },
  { id: 'gitops-flux',    label: 'Flux',          category: 'GitOps',    slug: 'flux' },

  // IaC / Infra Management
  { id: 'iac-puppet',     label: 'Puppet',        category: 'IaC',       slug: 'puppet' },
  { id: 'iac-ansible',    label: 'Ansible',       category: 'IaC',       slug: 'ansible' },
  { id: 'iac-chef',       label: 'Chef',          category: 'IaC',       slug: 'chef' },
  { id: 'iac-nomad',      label: 'Nomad',         category: 'IaC',       slug: 'hashicorpnomad' },

  // Storage
  { id: 'storage-ceph',       label: 'Ceph',          category: 'Storage',   slug: 'ceph' },
  { id: 'storage-portworx',   label: 'Portworx',      category: 'Storage',   slug: 'portworx' },
  { id: 'storage-glusterfs',  label: 'GlusterFS',     category: 'Storage',   slug: 'gluster' },
  { id: 'storage-minio',      label: 'MinIO',         category: 'Storage',   slug: 'minio' },

  // Cache / In-Memory
  { id: 'cache-memcached',    label: 'Memcached',     category: 'Cache',     slug: 'memcached' },
  { id: 'cache-hazelcast',    label: 'Hazelcast',     category: 'Cache',     slug: 'hazelcast' },

  // Auth / Identity
  { id: 'auth-vault',         label: 'Vault',         category: 'Security',  slug: 'vault' },
  { id: 'auth-keycloak',      label: 'Keycloak',      category: 'Security',  slug: 'keycloak' },
  { id: 'auth-oauth2',        label: 'OAuth 2.0',     category: 'Security',  slug: 'auth0' },

  // Certs
  { id: 'infra-letsencrypt',  label: "Let's Encrypt", category: 'Infra',     slug: 'letsencrypt' },

  // Workflow / Orchestration
  { id: 'workflow-airflow',   label: 'Apache Airflow', category: 'Workflow',  slug: 'apacheairflow' },
  { id: 'workflow-kubeflow',  label: 'Kubeflow',       category: 'Workflow',  slug: 'kubeflow' },
  { id: 'workflow-prefect',   label: 'Prefect',        category: 'Workflow',  slug: 'prefect' },
  { id: 'workflow-temporal',  label: 'Temporal',       category: 'Workflow',  slug: 'temporal' },

  // Registry
  { id: 'registry-harbor',    label: 'Harbor',        category: 'Registry',  slug: 'harbor' },
  { id: 'registry-jfrog',     label: 'JFrog',         category: 'Registry',  slug: 'jfrog' },

  // Analytics / Data
  { id: 'analytics-spark',        label: 'Apache Spark',  category: 'Analytics', slug: 'apachespark' },
  { id: 'analytics-flink',        label: 'Apache Flink',  category: 'Analytics', slug: 'apacheflink' },
  { id: 'analytics-hadoop',       label: 'Hadoop',        category: 'Analytics', slug: 'apachehadoop' },
  { id: 'analytics-hive',         label: 'Apache Hive',   category: 'Analytics', slug: 'apachehive' },
  { id: 'analytics-databricks',   label: 'Databricks',    category: 'Analytics', slug: 'databricks' },
  { id: 'analytics-dbt',          label: 'dbt',           category: 'Analytics', slug: 'dbt' },
  { id: 'analytics-superset',     label: 'Superset',      category: 'Analytics', slug: 'apachesuperset' },
  { id: 'analytics-tableau',      label: 'Tableau',       category: 'Analytics', slug: 'tableau' },
  { id: 'analytics-powerbi',      label: 'Power BI',      category: 'Analytics', slug: 'powerbi' },
  { id: 'analytics-trino',        label: 'Trino',         category: 'Analytics', slug: 'trino' },
  { id: 'analytics-solr',         label: 'Apache Solr',   category: 'Analytics', slug: 'apachesolr' },

  // MLOps
  { id: 'ml-mlflow',      label: 'MLflow',        category: 'ML',        slug: 'mlflow' },
  { id: 'ml-wandb',       label: 'Weights & Biases', category: 'ML',     slug: 'weightsandbiases' },
  { id: 'ml-bentoml',     label: 'BentoML',       category: 'ML',        slug: 'bentoml' },

  // Frameworks
  { id: 'backend-dotnet',     label: '.NET',          category: 'Backend',   slug: 'dotnet' },
  { id: 'backend-quarkus',    label: 'Quarkus',       category: 'Backend',   slug: 'quarkus' },
  { id: 'backend-micronaut',  label: 'Micronaut',     category: 'Backend',   slug: 'micronaut' },
  { id: 'backend-phoenix',    label: 'Phoenix',       category: 'Backend',   slug: 'phoenixframework' },
  { id: 'backend-camel',      label: 'Apache Camel',  category: 'Backend',   slug: 'apachecamel' },
  { id: 'backend-dapr',       label: 'Dapr',          category: 'Backend',   slug: 'dapr' },

  // Languages
  { id: 'lang-cpp',       label: 'C++',           category: 'Languages', slug: 'cplusplus' },
  { id: 'lang-latex',     label: 'LaTeX',         category: 'Languages', slug: 'latex' },
  { id: 'lang-matlab',    label: 'MATLAB',        category: 'Languages', slug: 'matlab' },
  { id: 'lang-zig',       label: 'Zig',           category: 'Languages', slug: 'zig' },
  { id: 'lang-lua',       label: 'Lua',           category: 'Languages', slug: 'lua' },
  { id: 'lang-dart',      label: 'Dart',          category: 'Languages', slug: 'dart' },
];

async function fetchSvg(slug) {
  const url = `https://cdn.simpleicons.org/${slug}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const svg = await res.text();
    // Simple Icons SVGs are black by default — good for our use case
    return svg.trim();
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Reading manifest from ${MANIFEST_PATH}`);
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);

  const existingIds = new Set(manifest.shapes.map(s => s.id));
  console.log(`Existing shapes: ${manifest.shapes.length}`);

  let added = 0;
  let failed = [];

  for (const icon of MISSING_ICONS) {
    if (existingIds.has(icon.id)) {
      console.log(`  SKIP (exists): ${icon.id}`);
      continue;
    }

    process.stdout.write(`  Fetching ${icon.label} (${icon.slug})... `);
    const svgContent = await fetchSvg(icon.slug);

    if (!svgContent) {
      console.log(`FAILED`);
      failed.push(icon);
      continue;
    }

    manifest.shapes.push({
      id: icon.id,
      label: icon.label,
      category: icon.category,
      svgContent,
      defaultWidth: 160,
      defaultHeight: 96,
      nodeType: 'custom',
      defaultData: {},
    });

    existingIds.add(icon.id);
    added++;
    console.log(`OK`);

    // Small delay to be polite to CDN
    await new Promise(r => setTimeout(r, 50));
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. Added ${added} icons. Total: ${manifest.shapes.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed to fetch (${failed.length}):`);
    failed.forEach(f => console.log(`  - ${f.label} (slug: ${f.slug})`));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
