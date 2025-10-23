/**
 * Anthropic Brand Typography System
 * Font families, sizes, weights, and line heights
 */

export const fontFamily = {
  heading: 'Poppins, ui-sans-serif, system-ui, -apple-system, sans-serif',
  body: 'Lora, ui-serif, Georgia, serif',
  mono: '"Geist Mono", monospace',
} as const;

export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.5,
  relaxed: 1.625,
  loose: 1.75,
} as const;

/**
 * Typography Scale
 * Defines font sizes for different text roles
 */
export const fontSize = {
  // Headings
  h1: {
    size: '2.5rem',      // 40px
    weight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.heading,
  },
  h2: {
    size: '2rem',        // 32px
    weight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.heading,
  },
  h3: {
    size: '1.5rem',      // 24px
    weight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.heading,
  },
  h4: {
    size: '1.25rem',     // 20px
    weight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.heading,
  },

  // Body Text
  body: {
    size: '1rem',        // 16px
    weight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.body,
  },
  sm: {
    size: '0.875rem',    // 14px
    weight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.body,
  },
  xs: {
    size: '0.75rem',     // 12px
    weight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.body,
  },

  // Code/Monospace
  code: {
    size: '0.875rem',
    weight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.mono,
  },

  // Label/Button Text
  label: {
    size: '0.875rem',
    weight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.heading,
  },

  // Caption
  caption: {
    size: '0.75rem',
    weight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.body,
  },
} as const;

/**
 * Typography helpers for CSS
 */
export const typographyClass = {
  h1: 'text-4xl font-bold leading-tight',
  h2: 'text-3xl font-bold leading-tight',
  h3: 'text-2xl font-semibold leading-normal',
  h4: 'text-xl font-semibold leading-normal',
  body: 'text-base font-normal leading-relaxed',
  sm: 'text-sm font-normal leading-relaxed',
  xs: 'text-xs font-normal leading-normal',
  label: 'text-sm font-semibold leading-normal',
  caption: 'text-xs font-normal leading-normal',
} as const;
