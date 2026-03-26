# Security Policy

## Supported Versions

OpenFlowKit is currently a pre-1.0 project. Security fixes are applied on a best-effort basis to the latest active code line only.

Current support policy:

| Version / Branch | Supported |
|---|---|
| Latest `main` / `master` branch state | Yes |
| Latest deployed app/docs surfaces | Best effort |
| Older commits, forks, and historical pre-1.0 snapshots | No |

If the project starts publishing stable release lines, this policy should be updated to list supported versions explicitly.

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for a security vulnerability.

Instead, report it here:

- https://docs.google.com/forms/d/e/1FAIpQLSd0hE_WTHEM8frJyZ_WlDQI8jrkGNpFu3RGCiJCmC-xp-Wm6g/viewform

When possible, include:

- a short description of the issue
- impact and affected surface
- reproduction steps
- browser/environment details
- proof-of-concept material if safe to share

## Scope Notes

OpenFlowKit is a browser-first, local-first application. Relevant security areas include:

- persisted local application data
- imported/exported files
- AI provider API key handling
- collaboration transport behavior
- third-party asset ingestion and rendering

## Data Storage Model

OpenFlowKit is **fully local-first**. No diagram data, API keys, or user content is sent to OpenFlowKit servers. There are no OpenFlowKit servers.

### Diagram data

Diagram state is persisted in **IndexedDB** (with localStorage as a fallback). It never leaves the browser unless you explicitly export or share it.

### AI provider API keys (BYOK)

OpenFlowKit uses a Bring-Your-Own-Key (BYOK) model:

- API keys are entered in **Settings → AI** and stored in **localStorage** under a dedicated namespace.
- Keys are sent **directly from your browser to the AI provider** (OpenAI, Anthropic, Google, etc.) — not proxied through any OpenFlowKit service.
- Keys are never logged, never included in exports, and never transmitted to anyone other than the provider you configured.

**Important:** Do not put API keys in `.env` or `.env.local` files. The settings modal is the only supported key entry point. Keys set via environment variables are a development-only convenience and should not be used in shared or deployed environments.

### Collaboration

Real-time collaboration uses **WebRTC peer-to-peer transport** (via a public signalling server for initial handshake). Once connected, diagram data flows directly between peers — it is not stored on or readable by the signalling server. Room links contain the room ID; anyone with the link can join the session.

### Third-party assets

Cloud provider icon packs (AWS, Azure, GCP, CNCF) are fetched from a CDN at runtime. No user data is sent in those requests — they are plain asset fetches.

## Response Policy

The maintainers will review reports and aim to:

1. confirm the issue
2. assess severity and impacted surfaces
3. prepare a fix or mitigation
4. ship the patch on the latest supported code line

Response and remediation timing is best effort and depends on issue severity and maintainer availability.

