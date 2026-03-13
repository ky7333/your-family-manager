# @yfm/design-tokens

Shared design tokens for Your Family Manager web and mobile apps.

## Includes

- `src/index.ts`: token scales for TypeScript consumers (web app logic and future Expo app)
- `src/expo.ts`: Expo/NativeWind export shape (dp spacing/radius, color schemes, RN elevation)
- `web.css`: CSS variables for web theme integration

## Web Usage

1. Add dependency in `web/package.json`:

```json
"@yfm/design-tokens": "file:../packages/design-tokens"
```

2. Import CSS variables in `web/src/styles.css`:

```css
@import '@yfm/design-tokens/web.css';
```

## Expo Usage (Future)

Use Expo-shaped exports:

```ts
import { expoThemeTokens, nativeWindTokenTheme } from '@yfm/design-tokens/expo';
```

- `expoThemeTokens.colorSchemes.light|dark`: semantic colors per theme
- `expoThemeTokens.spacing` and `expoThemeTokens.radius`: numeric dp values
- `expoThemeTokens.elevation`: React Native shadow/elevation tokens
- `nativeWindTokenTheme`: direct theme-extension shape for NativeWind config
