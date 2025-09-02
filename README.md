### ROLE & TONE
Skrivet som mig själv (Mustafa Salahuddin). Kort, konkret, med små fingeravtryck från bygget. Blandar svenska/engelska där det känns naturligt.

## Tetris (Examensarbete)

Jag byggde ett Tetris-inspirerat spel i React/TypeScript + HTML5 Canvas. Fokuset: snabb känsla, tydlig 3×3 info-panel, och high-scores lagrade i MongoDB via ett litet Node/Express-API. CI/CD kör på Railway, och jag planerade features i Trello som EPICs (ghost piece, hold, levels, paus).

### Varför
- Ville nöta Canvas-rendering och egen game loop utan stora motorer.
- Behövde ett lagom scope för examensarbetet: ghost piece, hold, level-ökning, paus, leaderboard.

### Teknik
- Frontend: React + TS, Canvas rendering, liten state-maskin för spelstatus.
- Backend: Node.js/Express API, MongoDB (scores), validering + rate limit.
- CI/CD: GitHub Actions → Railway deploy (monorepo-ish setup).
- Test: Vitest/Playwright (frontend) + Jest (backend).

### Problem → lösning → resultat
- Rotation nära höger vägg bröt T-piece (klippte in i väggen).
  - Lösning: enkel “wall kick” med retry-offsets.
  - Resultat: stabila rotationer, inga klipp, bättre flow.
- High-score API fick skräpinmatning och bots.
  - Lösning: server-side validering, rate-limit, och normalisering av namn.
  - Resultat: ren leaderboard, inga orimliga tider/poäng.
- Ghost piece var först för ljus och störde fokus.
  - Lösning: justerade alpha + ritordning.
  - Resultat: tydlig men inte påträngande preview (bättre decision speed).

### Kör lokalt
1. `pnpm install`
2. Frontend: `pnpm dev`
3. Backend: `pnpm start`
4. Config: se `.env.example` för API URL och Mongo.
5. Öppna `http://localhost:3000`

### Features (kort)
- Ghost piece (translucent), hold-system, level-scaling, paus.
- 3×3 info-panel (score/level/next/hold etc.) – funkar bra på mobil.
- Leaderboard: MongoDB med enkel fusk-säkring.

### Dev notes (Mustafa)
- Valde grid för 3×3 panelen (snabbare att skala än flex i detta case).
- Svårighetskurvan är medvetet snäll första tre nivåerna, nybörjare studsar annars.

### Commit highlights
- feat(game): add ghost piece preview
  - Snabbare beslut; valde translucent draw för mindre visuellt brus.
- fix(rotation): wall kick on right edge
  - Lade in boundary check + retry-offsets för att stoppa clipping.

### Snippet
```ts
// Intentionally keep speed low on first 3 levels.
// Too fast här gör att nya spelare studsar.
const levelSpeedMs = [800, 650, 500, 400, 320, 260];

// Wall-kick: testa små offsets innan rotationen ger upp.
// (Fixade bug #47 där T-piece fastnade i högra väggen.)
```

### Dev diary (kort)
- 2025-08-28: Ghost piece klart. Första versionen var för ljus → justerade alfa.
- 2025-08-30: API: la till server-side validering och rate-limit. Fångade tomma namn.
- 2025-09-01: 3×3 UI-panel. Valde grid över flex – enklare att skala upp/ner.

### CI lint för text (frivilligt)
Jag kör ibland `textlint` på `.md` för att slippa slentrianfraser.
```json
{
  "rules": {
    "no-start-duplicated-conjunction": true,
    "write-good": {
      "passive": false,
      "weasel": true,
      "tooWordy": true
    }
  }
}
```

```yaml
name: lint-text
on:
  pull_request:
    paths:
      - "**/*.md"
jobs:
  textlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm i -D textlint textlint-rule-write-good textlint-rule-no-start-duplicated-conjunction
      - run: npx textlint "**/*.md"
```

### Licens
MIT