export type VisualMode = 'orbital' | 'spectral' | 'glitch' | 'nebula' | 'vortex' | 'matrix' | 'kinetic' | 'acid_flow';
export type ShaderMode = 'none' | 'bloom' | 'vhs' | 'pixel' | 'liquid' | 'crt';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface VisualSettings {
  mode: VisualMode;
  shaderMode: ShaderMode;
  sensitivity: number;
  colorPalette: 'neon' | 'ocean' | 'embers' | 'mono' | 'acid' | 'cyberpunk' | 'noir' | 'forest' | 'vaporwave' | 'sunset' | 'custom';
  particleCount: number;
  textOverlay: string;
  glowAmount: number;
  rotationSpeed: number;
  lineWeight: number;
  textScale: number;
  textFont: 'serif' | 'sans' | 'display' | 'mono';
  textWeight: number;
  customTextColor: string;
  customBgColor: string;
  uiFontSize: number;
  autoSize: boolean;
  effectStrength: number; // For mode-specific quirks
  mirrorMode: boolean;
  chromaticAberration: number;
  noiseAmount: number;
  gridOverlay: boolean;
  textGlitch: boolean;
  trailAmount: number;
  hueShift: number;
  saturation: number;
  contrast: number;
  pulseStrength: number;
}

export const PALETTES: Record<VisualSettings['colorPalette'], ThemeColors> = {
  neon: {
    primary: '#ff2266',
    secondary: '#3311ff',
    accent: '#00ff88',
    bg: '#050505',
  },
  ocean: {
    primary: '#00D4FF',
    secondary: '#004BFF',
    accent: '#00FF90',
    bg: '#000814',
  },
  embers: {
    primary: '#FF4D00',
    secondary: '#FFB800',
    accent: '#FF0000',
    bg: '#0F0500',
  },
  mono: {
    primary: '#FFFFFF',
    secondary: '#888888',
    accent: '#AAAAAA',
    bg: '#000000',
  },
  acid: {
    primary: '#DFFF00',
    secondary: '#9DFF00',
    accent: '#00FF41',
    bg: '#050a00',
  },
  cyberpunk: {
    primary: '#F0FF00',
    secondary: '#00E0FF',
    accent: '#FF00FA',
    bg: '#0a000f',
  },
  noir: {
    primary: '#E60000',
    secondary: '#333333',
    accent: '#111111',
    bg: '#000000',
  },
  forest: {
    primary: '#00FF88',
    secondary: '#004d2e',
    accent: '#9DFF00',
    bg: '#000804',
  },
  vaporwave: {
    primary: '#FF71CE',
    secondary: '#01CDFE',
    accent: '#05FFA1',
    bg: '#1a0521',
  },
  sunset: {
    primary: '#FF4E50',
    secondary: '#FC913A',
    accent: '#F9D423',
    bg: '#1a0a00',
  },
  custom: {
    primary: '#FF71CE',
    secondary: '#01CDFE',
    accent: '#05FFA1',
    bg: '#000000',
  },
};
