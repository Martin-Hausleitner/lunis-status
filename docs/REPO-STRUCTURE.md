# Repository Map

## 1. Live
`experience/`

Aktuelle Supabase-gestützte Anwendung: Auth, Rollen, Realtime, Kommentare, Dokumente und private Dateien.

## 2. Bericht
`experience/bericht/`

Generierte, mehrseitige V4-Berichtswebsite. Änderungen an Layout/Design gehören zuerst nach `experience/report-src/`; generierte Dateien werden nur als Deploy-Artefakt mitgeführt.

## 3. Bericht-Quelle
`experience/report-src/`

Quellcode und Generatoren des Berichts. Keine Supabase-Secrets, keine Produktivdaten.

## 4. Tests
`experience/tests/`

Build-, UI-, Readiness- und Cloud-E2E-Prüfungen. Änderungen am aktuellen Projektraum müssen hier regressionsfest gemacht werden.

## 5. Öffentliche Statusseite
`index.html`, `live.html`, `assets/`

Projektstatus und öffentliche Nachweise. Verwendet dasselbe Lunis UI Contract wie Experience/Report.

## 6. Archive
Historische Endberichtstände V1–V3 liegen zentral im privaten `servas-ai/lunis-endbericht` Repository. Sie sind Beleg-/Archivstände und werden nicht als aktuelle Produktoberfläche behandelt.

## Regel
Neue aktive UI gehört nicht in historische Archive. Neue Backend-/Schema-Änderungen gehören ins private Endbericht/Supabase-Repo; aktuelle Browser-App und Deploy-E2E bleiben hier.
