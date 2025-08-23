# PWA-ikoner

Denna mapp innehåller alla ikoner som krävs för Progressive Web App-funktionaliteten.

## Krävda ikoner

Följande ikoner krävs för fullständigt PWA-stöd:

### Standardikoner
- `icon-16x16.png` - 16x16 pixlar (favicon)
- `icon-32x32.png` - 32x32 pixlar (favicon)
- `icon-72x72.png` - 72x72 pixlar (Android)
- `icon-96x96.png` - 96x96 pixlar (Android)
- `icon-128x128.png` - 128x128 pixlar (Chrome)
- `icon-144x144.png` - 144x144 pixlar (Android)
- `icon-152x152.png` - 152x152 pixlar (iOS)
- `icon-192x192.png` - 192x192 pixlar (Android)
- `icon-384x384.png` - 384x384 pixlar (Android)
- `icon-512x512.png` - 512x512 pixlar (Android)

### Apple Touch-ikoner
- `icon-180x180.png` - 180x180 pixlar (iOS)

### Maskikoner
- `icon-mask.svg` - SVG-maskikon för Safari

## Ikonkrav

### Format
- **PNG**: För alla rasterikoner (rekommenderat)
- **SVG**: För maskikoner och skalbar grafik

### Designriktlinjer
- **Bakgrund**: Transparent eller solid färg
- **Form**: Fyrkant med rundade hörn (valfritt)
- **Stil**: Konsekvent med appdesign
- **Färger**: Matcha apptema

### Tekniska krav
- **Upplösning**: Hög upplösning för skarp visning
- **Filstorlek**: Optimerad för webb (under 50KB var)
- **Transparens**: PNG med alfakanal-stöd

## Genereringsverktyg

### Onlinverktyg
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Icon Generator](https://appicon.co/)

### Kommandoradsverktyg
- [Sharp](https://sharp.pixelplumbing.com/) - Bildbehandling
- [ImageMagick](https://imagemagick.org/) - Bildmanipulation
- [PWA Builder CLI](https://github.com/pwa-builder/pwa-builder-cli)

## Implementation

### HTML
```html
<!-- Standard icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />

<!-- Apple touch icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

<!-- Mask icon -->
<link rel="mask-icon" href="/icons/icon-mask.svg" color="#0f172a" />
```

### Manifest
```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

## Testning

### PWA-revision
- Använd Lighthouse för att testa PWA-poäng
- Verifiera ikonvisning i webbläsare
- Testa installation på mobila enheter

### Webbläsarstöd
- **Chrome**: Fullständigt PWA-stöd
- **Firefox**: Grundläggande PWA-stöd
- **Safari**: Begränsat PWA-stöd
- **Edge**: Fullständigt PWA-stöd

## Anteckningar

- Ikoner cachas automatiskt av service workern
- Olika storlekar säkerställer optimal visning på olika enheter
- Maskikoner ger konsekvent utseende över plattformar
- Apple touch-ikoner krävs för iOS hemskärm-installation

---

*Platshållarikoner ska ersättas med faktiska Tetris-tematiserade grafik innan produktionsdistribution.*
