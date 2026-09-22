# Lunis-Status-Website

## Lunis Experience · aktueller UI-Stand

- **Live:** https://martin-hausleitner.github.io/lunis-status/experience/
- **Experience-Quellcode:** [experience/](experience/)
- **Cloud-E2E:** 28 Prüfungen bestanden, 0 fehlgeschlagen; getrennte Admin-/User-Sitzungen, Supabase Auth, RLS, Realtime, Storage, Dokumente, Einladungen, PWA und Mobile wurden geprüft.
- **Prüflauf:** https://github.com/Martin-Hausleitner/lunis-status/actions/runs/35713016177
- **Vollständiges Versionsarchiv:** [servas-ai/lunis-endbericht · versions/README.md](https://github.com/servas-ai/lunis-endbericht/blob/main/versions/README.md) *(privates Projekt; Zugriff erforderlich)*

Im Versionsarchiv liegen **Endbericht V1 (9 Oberflächen), V2 (17), V3 (24) und Experience Clean (11)**. Zu jeder Oberfläche gibt es einen Screenshot; die README im Endbericht enthält zusätzlich vier Kontaktbögen mit allen Ansichten. V1–V3 sind historische statische Render der archivierten UI-Stände. Experience Clean enthält echte Chromium/Playwright-Aufnahmen aus der Cloud-Abnahme.


Statische Seite ohne Server. Sie wird alle fuenf Minuten neu aus dem
aktuellen Arbeitsbaum erzeugt und hierher veroeffentlicht.

- `index.html` — Evidenzbericht (Arbeitsstand, Quellen, Grenzen)
- `live.html` — Live-Status: Kopfstand in git, Aufrufprotokoll der
  Bruecke, freier Plattenplatz, Commits der letzten zwei Stunden
- `berichte/` — Zwischenberichte; vertrauliche Berichte fehlen hier
  absichtlich

Zustandszeichen: `●` fertig · `◐` teilweise · `○` offen. Keine
Ampelfarben, kein Gruen.

Stand dieser Kopie: 2026-09-22 10:44 (Europe/Vienna).
