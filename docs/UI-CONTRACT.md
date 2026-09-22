# Lunis UI Contract

Kanonischer Stand für alle **aktuellen** Lunis-Oberflächen. Historische V1–V3-Archive bleiben unverändert und werden nicht rückwirkend umgestaltet.

## Marke
- Logo: rote Kachel/Flamme + Lunis-Wortmarke.
- Rot: `#fe0942`
- Navy: `#091a40`
- Weiß: `#ffffff`
- Kein altes Rot `#dc2438`, kein Grün als Statusfarbe, keine alternative Mond-/Slogan-Marke.

## Bedienelemente
- Controls haben denselben Radius: 10 px.
- Jede klickbare Schaltfläche trägt eine dezente rote Unterkante als durchgängige Lunis-Leitlinie.
- Primäraktionen dürfen vollflächig Navy oder Rot sein; die rote Leitlinie bleibt das gemeinsame Detail.
- Aktive Navigation erhält zusätzlich eine rote linke Leitlinie.
- Icon-only Controls brauchen immer ein `aria-label`.
- Keine dekorativen Sonderbuttons außerhalb dieses Systems.

## Oberfläche
- Ruhige weiße Flächen, Navy-Text, graue Linien.
- Rot markiert Richtung/Aktion, nicht Erfolg.
- Karten nutzen dieselbe Linienfarbe und konsistente Radien.
- Keine eigenständigen Farbsysteme je Unterseite.
- `prefers-reduced-motion` bleibt unterstützt.

## Kanonische Implementierungen
- Live Projektraum: `/experience/`
- Bericht V4: `/experience/bericht/`
- Öffentliche Statusseite: `/`
- CSS-Quelle Projektraum: `experience/style.css`
- CSS-Quelle Bericht: `experience/report-src/style.css`
- Generierter Bericht: `experience/bericht/assets/style.css`
- Öffentliche Statusseite: `assets/style.css`

## Logo-Integrität
Das kanonische Logo entspricht byteinhaltlich dem zentralen Lunis-Logo aus `servas-ai/lunis-endbericht/brand/lunis-logo.svg`. Doppelte Dateien dürfen nur als Deployment-Kopie existieren; sie dürfen visuell nicht abweichen.
