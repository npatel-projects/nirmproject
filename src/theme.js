/**
 * Design tokens — single source of truth for the portal UI.
 *
 * CSS custom properties (usable as Tailwind classes like `bg-brand-primary`)
 * are defined in style.css via @theme.
 *
 * Use this JS object for inline styles, MUI sx props, or any programmatic
 * context where Tailwind classes aren't applicable.
 */

export const colors = {
  // Brand
  brandPrimary:      '#00853e',
  brandPrimaryDark:  '#00602c',
  brandAccent:       '#ffcd00',

  // Navigation
  navActiveBg:       '#eef2fa',
  navActiveText:     '#3b5ea6',
  navHoverBg:        '#f3f4f6',
  navText:           '#4b5563',

  // Surface
  surface:           '#ffffff',
  surfaceSubtle:     '#f9fafb',
  border:            '#e5e7eb',
  borderSubtle:      '#f3f4f6',

  // Text
  textPrimary:       '#111827',
  textSecondary:     '#6b7280',
  textMuted:         '#9ca3af',

  // Link / interactive
  link:              '#3b5ea6',
  linkHover:         '#2d4a85',

  // Status
  success:           '#16a34a',
  warning:           '#d97706',
  error:             '#dc2626',
}
