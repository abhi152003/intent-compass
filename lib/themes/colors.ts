/**
 * Anthropic Brand Color Palette
 * Central color system for consistent brand application
 */

export const colors = {
  // Primary Colors (Anthropic Brand)
  dark: '#141413',
  light: '#faf9f5',
  midGray: '#b0aea5',
  lightGray: '#e8e6dc',

  // Accent Colors (Anthropic Brand)
  accent: {
    orange: '#d97757',
    blue: '#6a9bcc',
    green: '#788c5d',
  },

  // Semantic Colors
  semantic: {
    success: '#788c5d',    // Green - same as Anthropic green
    warning: '#d97757',    // Orange - same as Anthropic orange
    error: '#e85d5d',      // Red - for destructive actions
    info: '#6a9bcc',       // Blue - same as Anthropic blue
  },

  // Background Colors (Dark Mode)
  background: {
    primary: '#141413',    // Darkest, primary background
    secondary: '#1c1b1a',  // Slightly lighter
    tertiary: '#27262422', // Even lighter for contrast
    elevated: '#2f2e2d',   // Elevated surfaces (cards, panels)
    hover: '#35343322',    // Hover state backgrounds
  },

  // Text Colors
  text: {
    primary: '#faf9f5',    // Light text on dark
    secondary: '#b0aea5',  // Secondary text (mid gray)
    muted: '#7c7a72',      // Muted text
    inverse: '#141413',    // Dark text on light (if needed)
  },

  // Border Colors
  border: {
    light: '#35343322',    // Subtle borders
    medium: '#7c7a72',     // Standard borders
    dark: '#b0aea5',       // Prominent borders
  },

  // Overlay/Transparency
  overlay: {
    light: 'rgba(250, 249, 245, 0.05)',
    medium: 'rgba(20, 20, 19, 0.5)',
    dark: 'rgba(20, 20, 19, 0.8)',
  },
} as const;

/**
 * Color roles for different node types
 * Maps functional roles to the accent color palette
 */
export const nodeColors = {
  start: colors.accent.orange,      // Primary action (start)
  bridge: colors.accent.blue,       // Secondary action (bridge)
  transfer: colors.accent.green,    // Success action (transfer)
  execute: colors.accent.orange,    // Execute action
} as const;

/**
 * State-based colors
 */
export const stateColors = {
  pending: colors.accent.blue,
  executing: colors.accent.orange,
  completed: colors.accent.green,
  failed: '#e85d5d',
  idle: colors.midGray,
} as const;
