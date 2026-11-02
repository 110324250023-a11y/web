export const KEY_CONFIG = {
  home: [0.43, -0.105, -0.04] as [number, number, number],
  scale: 0.68,
  hoverScale: 1.08,
  floatAmplitude: 0.009,
  floatFrequency: 1.65,
  rotationSpeed: 0.55,
  dragDamping: 18,
  dragBounds: { x: [-0.62, 0.62] as [number, number], y: [-0.34, 0.29] as [number, number] },
  tip: [0.31, 0, 0] as [number, number, number],
  idleGlow: 0.035,
  hoverGlow: 0.12,
  brassColor: '#B18448',
  highlightColor: '#D2A84B',
  darkBrassColor: '#5A3920',
} as const;

export const CHEST_CONFIG = {
  position: [0, 0.38, -0.42] as [number, number, number],
  dimensions: [0.6, 0.25, 0.36] as [number, number, number],
  lock: [0, 0.17, 0.195] as [number, number, number],
  lidOpenRadians: -1.83,
  woodColor: '#A95F31',
  brassColor: '#C78A3C',
  highlightColor: '#F0C66B',
  glowColor: '#F5BC56',
  glowIntensity: 0.12,
  hoverGlowIntensity: 0.42,
  nearGlowIntensity: 0.58,
  fillLightColor: '#FFD08A',
  fillLightIntensity: 0.95,
  woodRoughness: 0.56,
} as const;

export const FADE_DURATION_MS = 1500;
export const CLIP_SRC = '/media/clip.mp4';

export const TREASURE_CONFIG = {
  key: KEY_CONFIG,
  chest: CHEST_CONFIG,
  unlockDistance: 0.25,
  nearDistance: 0.35,
  unlockDuration: 0.95,
  lidOpenDuration: 1.15,
  fadeDuration: FADE_DURATION_MS / 1000,
  resetDuration: 0.85,
} as const;
