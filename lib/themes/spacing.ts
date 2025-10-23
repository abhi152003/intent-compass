/**
 * Spacing Scale
 * Consistent spacing system based on 8px base unit
 */

export const spacing = {
  // Base scale (8px units)
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

/**
 * Semantic spacing tokens
 * Use these for specific layout purposes
 */
export const semanticSpacing = {
  // Component internal spacing
  compact: spacing[2],      // 8px - tight components
  normal: spacing[4],       // 16px - standard components
  relaxed: spacing[6],      // 24px - spacious components

  // Layout spacing
  sectionGap: spacing[8],    // 32px - between major sections
  contentGap: spacing[6],    // 24px - between content blocks
  elementGap: spacing[4],    // 16px - between elements

  // Padding
  inputPadding: spacing[3],  // 12px - input fields
  buttonPadding: spacing[4], // 16px - buttons
  cardPadding: spacing[6],   // 24px - cards
  panelPadding: spacing[8],  // 32px - panels

  // Margins
  sectionMargin: spacing[12], // 48px - between sections
  blockMargin: spacing[8],    // 32px - between blocks
  elementMargin: spacing[4],  // 16px - between elements

  // Gaps
  stackGap: spacing[4],      // 16px - vertical stacking
  flowGap: spacing[6],       // 24px - horizontal flow
} as const;

/**
 * Border radius scale
 */
export const borderRadius = {
  none: '0px',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',  // Fully rounded
} as const;

/**
 * Shadow scale
 * Depth-based shadow system
 */
export const shadows = {
  none: 'none',

  // Subtle shadows
  sm: '0 1px 2px 0 rgba(20, 20, 19, 0.05)',
  base: '0 1px 3px 0 rgba(20, 20, 19, 0.1), 0 1px 2px 0 rgba(20, 20, 19, 0.06)',
  md: '0 4px 6px -1px rgba(20, 20, 19, 0.1), 0 2px 4px -1px rgba(20, 20, 19, 0.06)',
  lg: '0 10px 15px -3px rgba(20, 20, 19, 0.1), 0 4px 6px -2px rgba(20, 20, 19, 0.05)',
  xl: '0 20px 25px -5px rgba(20, 20, 19, 0.1), 0 10px 10px -5px rgba(20, 20, 19, 0.04)',

  // Elevated/prominent
  elevated: '0 25px 50px -12px rgba(20, 20, 19, 0.25)',

  // Glow effects
  glow: {
    orange: '0 0 20px rgba(217, 119, 87, 0.3)',
    blue: '0 0 20px rgba(106, 155, 204, 0.3)',
    green: '0 0 20px rgba(120, 140, 93, 0.3)',
  },

  // Inset shadows
  inset: 'inset 0 2px 4px 0 rgba(20, 20, 19, 0.06)',
} as const;

/**
 * Transition/animation timings
 */
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

/**
 * Easing functions
 */
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
