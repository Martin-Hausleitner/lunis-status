# Lunis UI-System

Die aktive Statusseite, der Supabase-Projektraum und Bericht V4 teilen dieselbe UI-Sprache.

- Rot: `#fe0942`
- Navy: `#091a40`
- Logo: Flammenkachel + Lunis Wortmarke
- Keine neue Verwendung von `#dc2438`
- Buttons/Filter/Icon-Controls: ruhige Fläche + 2 px rote Keyline
- Aktive Navigation: rote Seitenlinie
- Fokus: sichtbarer roter Focus-Ring

Die vollständige Repo-/UI-Source-of-Truth liegt im privaten Endbericht-Repo unter `ui/` und `docs/REPO-STRUCTURE.md`.

## Schutz gegen Drift
`experience/tests/ui-contract.mjs` läuft im Main-Workflow und schlägt fehl, wenn:
1. das alte Rot wieder auftaucht,
2. die kanonische Keyline fehlt,
3. Experience- und Status-Logo auseinanderlaufen.

Historische Screenshots und Archivstände werden nicht rückwirkend als neue UI ausgegeben.
