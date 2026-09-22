# Lunis · Status und Projektraum

## Aktuelle Website

**[Lunis Projektraum öffnen](https://martin-hausleitner.github.io/lunis-status/experience/)**

Der Projektraum verwendet Supabase Auth, Postgres mit RLS, Realtime und privaten Storage. GitHub Pages liefert ausschließlich die Oberfläche aus. Benutzerkonten, Kommentare, Dokumente und Dateien liegen nicht im öffentlichen Repository.

## Verifizierter Stand · 22.09.2026

**38 Cloud-Prüfungen bestanden, 0 fehlgeschlagen.** Getestet wurde die tatsächliche öffentliche Website mit getrennten Browser-Sitzungen und synthetischen Supabase-Konten. Alle acht veröffentlichten Build-Dateien wurden zusätzlich bytegenau gegen Größen und SHA-256 aus `build.json` geprüft.

[Prüflauf 35720887432](https://github.com/Martin-Hausleitner/lunis-status/actions/runs/35720887432) · [13 echte Screenshots und JSON-Protokolle](https://github.com/Martin-Hausleitner/lunis-status/actions/runs/35720887432/artifacts/10691656355) · [Geprüftes Frontend-Paket](https://github.com/Martin-Hausleitner/lunis-status/actions/runs/35720887432/artifacts/10691451512)

| Bereich | Geprüft |
|---|---|
| Anmeldung und Rollen | Admin/Mitglied getrennt; falsches Passwort und unberechtigte Zugriffe abgewiesen |
| Kommentare | Realtime in beide Richtungen; Persistenz; vier parallele Wiederholungen erzeugen genau einen Eintrag |
| Einladungen | E-Mail-Bindung, Einmalverwendung, falsches Konto und widerrufener Link |
| Dokumente | Versteckte Entwürfe, versionierte Freigabe, synthetische Testsignatur, Ablehnung manipulierter Signaturen |
| Private Dateien | Authentifizierter Download mit Größen-/Hashprüfung; öffentliche Zugriffe und falsche Dateitypen abgewiesen |
| Sitzung | Private Dialoginhalte verschwinden nach Schließen; verspätete Downloadantwort nach Logout wird nicht ausgeliefert |
| Mobil/PWA | 390-Pixel-Chromium-Ansicht, reduzierte Bewegung, funktionierender Logout, Cache nur für die Anwendungshülle |
| Testbetrieb | Separate Cleanup-Stufe auch bei Runnerfehlern; keine verbleibenden CI-Konten oder CI-Workspaces |

Die Actions-Artefakte bleiben 14 Tage verfügbar. Das dauerhafte Prüfmanifest und die Backend-Migrationen stehen im [privaten Endbericht-Repository](https://github.com/servas-ai/lunis-endbericht/blob/main/experience/SUPABASE-READINESS.md). Keine pauschale Produktionsfreigabe: ursprüngliche SQL-Baseline/Autodeploy, SMTP/Recovery, Passwortrotation, Backup-Restore, reale Vertragstexte und physische Safari-/iOS-Prüfung bleiben gesonderte Freigaben. KI-/Slack-Anbindungen sind nicht als fertig ausgewiesen.

## Quellcode und Versionsarchiv

[Aktueller Frontend-Code](experience/) · [Build- und Cloud-Tests](experience/tests/) · [Vollständiger Versionsindex](https://github.com/servas-ai/lunis-endbericht/blob/main/versions/README.md)

Im privaten Versionsarchiv bleiben Endbericht V1 (9 Oberflächen), V2 (17), V3 (24) und die 11 früheren Experience-Clean-Prüfansichten unverändert erhalten. V1–V3 sind historische statische Render, keine nachträgliche Browserabnahme und keine produktiven Supabase-Apps. Die 13 neueren Browserbilder gehören zum oben verlinkten Readiness-Lauf.

## Weitere Seiten

`index.html` enthält den Evidenzbericht, `live.html` den früheren Live-Status und `berichte/` die ausgewählten Zwischenberichte. Vertrauliche Quelldaten werden hier nicht veröffentlicht. Die historische Statuskopie stammt vom 22.09.2026, 10:44 Uhr Europe/Vienna; daraus folgt keine Garantie einer laufenden Aktualisierung.

Keine Datenbankpasswörter, Auth-Sitzungen oder serverseitigen Secret Keys in Git. Die Cloud-Tests authentifizieren sich über kurzlebige, auf diesen Main-Workflow begrenzte GitHub-OIDC-Tokens.
