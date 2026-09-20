# Lunis-Status-Website

Statische Website (kein Server nötig) aus den Zwischenberichten + `LIVE-STATUS.md` gebaut.

Bauen: `python3 tools/site-build.py` (liest `docs/zwischenberichte/*.md`, `docs/LIVE-STATUS.md`
und die Marken-Tokens unter `shots/D1/brand/`, erneut ausführen überschreibt `site/` sauber).

Ergebnis liegt in `site/index.html`, `site/live.html`, `site/berichte/*.html` — alle Dateien
sind reine `file://`-taugliche HTML/CSS/JS-Dateien, nur `mermaid.js` kommt von einem CDN.
