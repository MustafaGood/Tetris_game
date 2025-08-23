# PWA-skärmdumpar

Denna mapp innehåller skärmdumpar som används i PWA-manifestet för app-butikslistor och installationsprompts.

## Krävda skärmdumpar

Följande skärmdumpar refereras i PWA-manifestet:

### Desktop-skärmdumpar
- `desktop.png` - 1280x720 pixlar (16:9 bildförhållande)
- **Syfte**: Desktop app-butikslistor
- **Innehåll**: Spel i desktop-vy med fullständigt UI synligt

### Mobilskärmdumpar
- `mobile.png` - 375x667 pixlar (9:16 bildförhållande)
- **Syfte**: Mobil app-butikslistor
- **Innehåll**: Spel i mobilvy med touch-kontroller

## Skärmdumpsspecifikationer

### Tekniska krav
- **Format**: PNG (rekommenderat) eller JPEG
- **Kvalitet**: Hög upplösning, tydlig och skarp
- **Filstorlek**: Optimerad för webb (under 500KB var)
- **Komprimering**: Förlustfri eller högkvalitativ förlustbehållande

### Innehållsriktlinjer
- **Spelstatus**: Visa aktiv spelupplevelse, inte menyskärmar
- **UI-element**: Säkerställ att alla viktiga UI-element är synliga
- **Visuell tilltalande**: Välj visuellt tilltalande spelstatusar
- **Varumärke**: Inkludera speltitel eller logo om möjligt

### Designöverväganden
- **Belysning**: Bra kontrast och synlighet
- **Färger**: Representativ för faktiskt spelutseende
- **Komposition**: Balanserad och professionell layout
- **Text**: Säkerställ att all text är läsbar

## Genereringsprocess

### Manuella skärmdumpar
1. **Uppsättning**: Konfigurera spelet till optimal visuell status
2. **Fångst**: Använd webbläsarens utvecklarverktyg eller skärmdumpsverktyg
3. **Redigering**: Beskär och justera efter behov
4. **Optimering**: Komprimera för webbanvändning
5. **Testning**: Verifiera i olika sammanhang

### Automatiserade skärmdumpar
- **Playwright**: Automatiserad skärmdumpscapture under testning
- **Lighthouse**: Prestandatestskärmdumpar
- **CI/CD**: Automatiserad skärmdumpsgenerering i pipeline

## Implementation

### Manifest-integration
```json
{
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "375x667",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### HTML-användning
```html
<!-- Valfritt: Visa skärmdumpar på webbplatsen -->
<div class="screenshots">
  <img src="/screenshots/desktop.png" alt="Tetris Desktop-vy" />
  <img src="/screenshots/mobile.png" alt="Tetris Mobil-vy" />
</div>
```

## Bästa praxis

### Innehållsval
- **Spelupplevelse**: Visa faktisk spelupplevelse, inte statiska bilder
- **Funktioner**: Framhäv viktiga spelfunktioner
- **Kvalitet**: Använd högpoäng eller intressanta spelstatusar
- **Variation**: Överväg flera skärmdumpar för olika aspekter

### Teknisk kvalitet
- **Upplösning**: Använd lämplig upplösning för målenheter
- **Format**: PNG för skärmdumpar, JPEG för foton
- **Optimering**: Balansera kvalitet och filstorlek
- **Tillgänglighet**: Säkerställ bra kontrast och läsbarhet

### Uppdateringsstrategi
- **Regelbundna uppdateringar**: Uppdatera skärmdumpar med nya funktioner
- **Versionskontroll**: Spåra skärmdumpsändringar
- **Testning**: Verifiera att skärmdumpar fungerar över plattformar
- **Säkerhetskopiering**: Behåll original högupplösta versioner

## Testing

### PWA Audit
- Use Lighthouse to verify screenshot integration
- Test on different devices and browsers
- Verify screenshots appear in installation prompts

### Quality Assurance
- Check screenshot clarity and readability
- Verify file sizes are reasonable
- Test loading performance
- Ensure accessibility compliance

## Notes

- Screenshots are cached by the service worker
- Different form factors ensure optimal display
- High-quality screenshots improve app store appearance
- Regular updates keep screenshots current with game features

---

*Screenshots should be updated whenever significant UI changes are made to maintain accurate representation of the game.*
