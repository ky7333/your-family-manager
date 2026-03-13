export type ThemeName = 'light' | 'dark';

export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface TypographyTokens {
  sans: string;
  mono: string;
}

export interface ElevationTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeTokens {
  colors: ColorTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  elevation: ElevationTokens;
}

const radius: RadiusTokens = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.625rem',
  xl: '0.875rem',
};

const spacing: SpacingTokens = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
};

const typography: TypographyTokens = {
  sans:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
};

const elevation: ElevationTokens = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 10px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 24px rgba(0, 0, 0, 0.12)',
};

const lightColors: ColorTokens = {
  background: '#ffffff',
  foreground: '#09090b',
  card: '#ffffff',
  cardForeground: '#09090b',
  popover: '#ffffff',
  popoverForeground: '#09090b',
  primary: '#18181b',
  primaryForeground: '#fafafa',
  secondary: '#f4f4f5',
  secondaryForeground: '#18181b',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  accent: '#f4f4f5',
  accentForeground: '#18181b',
  destructive: '#dc2626',
  destructiveForeground: '#fafafa',
  border: '#e4e4e7',
  input: '#e4e4e7',
  ring: '#a1a1aa',
  chart1: '#f97316',
  chart2: '#0ea5e9',
  chart3: '#3b82f6',
  chart4: '#eab308',
  chart5: '#f59e0b',
  sidebar: '#fafafa',
  sidebarForeground: '#09090b',
  sidebarPrimary: '#18181b',
  sidebarPrimaryForeground: '#fafafa',
  sidebarAccent: '#f4f4f5',
  sidebarAccentForeground: '#18181b',
  sidebarBorder: '#e4e4e7',
  sidebarRing: '#a1a1aa',
};

const darkColors: ColorTokens = {
  background: '#09090b',
  foreground: '#fafafa',
  card: '#09090b',
  cardForeground: '#fafafa',
  popover: '#09090b',
  popoverForeground: '#fafafa',
  primary: '#fafafa',
  primaryForeground: '#18181b',
  secondary: '#27272a',
  secondaryForeground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  accent: '#27272a',
  accentForeground: '#fafafa',
  destructive: '#7f1d1d',
  destructiveForeground: '#fecaca',
  border: '#27272a',
  input: '#27272a',
  ring: '#52525b',
  chart1: '#22d3ee',
  chart2: '#4ade80',
  chart3: '#facc15',
  chart4: '#a78bfa',
  chart5: '#f97316',
  sidebar: '#18181b',
  sidebarForeground: '#fafafa',
  sidebarPrimary: '#3b82f6',
  sidebarPrimaryForeground: '#fafafa',
  sidebarAccent: '#27272a',
  sidebarAccentForeground: '#fafafa',
  sidebarBorder: '#27272a',
  sidebarRing: '#52525b',
};

export const themeTokens: Record<ThemeName, ThemeTokens> = {
  light: {
    colors: lightColors,
    radius,
    spacing,
    typography,
    elevation,
  },
  dark: {
    colors: darkColors,
    radius,
    spacing,
    typography,
    elevation,
  },
};

export const colorVariableNames = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  sidebar: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
} as const;

export const tokenScales = {
  radius,
  spacing,
  typography,
  elevation,
} as const;
