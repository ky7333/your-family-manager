import { themeTokens, tokenScales, type ThemeName } from './index';

type DpScale<T extends string> = Record<T, number>;

export interface ExpoShadowToken {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: {
    width: number;
    height: number;
  };
  elevation: number;
}

export interface ExpoThemeTokens {
  colorSchemes: Record<ThemeName, (typeof themeTokens)[ThemeName]['colors']>;
  spacing: DpScale<keyof typeof tokenScales.spacing>;
  radius: DpScale<keyof typeof tokenScales.radius>;
  typography: typeof tokenScales.typography;
  elevation: {
    sm: ExpoShadowToken;
    md: ExpoShadowToken;
    lg: ExpoShadowToken;
  };
}

const remToDp = (value: string): number => {
  if (!value.endsWith('rem')) {
    return Number.parseFloat(value);
  }
  return Number.parseFloat(value) * 16;
};

const toDpScale = <T extends string>(source: Record<T, string>): DpScale<T> => {
  const entries = Object.entries(source).map(([key, value]) => [key, remToDp(value)]);
  return Object.fromEntries(entries) as DpScale<T>;
};

const spacing = toDpScale(tokenScales.spacing);
const radius = toDpScale(tokenScales.radius);

const elevation = {
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;

export const expoThemeTokens: ExpoThemeTokens = {
  colorSchemes: {
    light: themeTokens.light.colors,
    dark: themeTokens.dark.colors,
  },
  spacing,
  radius,
  typography: tokenScales.typography,
  elevation,
};

export const nativeWindTokenTheme = {
  spacing: expoThemeTokens.spacing,
  borderRadius: expoThemeTokens.radius,
  fontFamily: expoThemeTokens.typography,
  colors: expoThemeTokens.colorSchemes.light,
} as const;

export const getExpoColorScheme = (theme: ThemeName) =>
  expoThemeTokens.colorSchemes[theme];
