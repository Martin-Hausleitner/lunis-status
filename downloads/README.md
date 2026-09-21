# Lunis public source candidate

This directory is the public download surface for the local build preview.

- `[internes Repository entfernt]-public-source-candidate-2026-09-21.zip` — deterministic source candidate.
- `public-manifest.json` — six-file allowlist with sizes, hashes and open license fields.
- `SHA256SUMS` — checksum record for the ZIP and package artifacts.

The package intentionally excludes internal inventory/runtime data, local paths,
credentials, raw transcripts and unverified Hard-M-11/Kira-Garage artifacts.
`PRIV-01`, browser E2E, accessibility and PDF gates remain open until separately
verified against the assembled site.
