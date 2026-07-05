import { createTheme } from '@mui/material/styles';

// =====================================================================
// DESIGN TOKENS — single source of truth.
// This is the ONLY file where hex color literals are permitted
// (enforced by ESLint no-restricted-syntax in package.json).
// All contrast pairs verified WCAG 2.1 AA (>= 4.5:1); ratios noted.
// =====================================================================

// ---------- 1. PRIMITIVE TOKENS ----------
const ink = {
  900: '#111827', // text.primary          (17.7:1 on white)
  700: '#374151',
  500: '#4B5563', // text.secondary        (7.6:1 on white)
  300: '#D1D5DB', // borders / divider
  100: '#F3F4F6', // subtle fills
  50: '#F9FAFB', // page background
};

const plum = {
  main: '#5B21B6', // 9.0:1 with white text; 9.0:1 as link on white
  dark: '#4C1D95',
  light: '#7C3AED', // large text / icons only
  bg: '#F5F3FF', // selected rows, subtle highlights
};

// Semantic status pairs — `main` for icons/borders/solid accents,
// `bg` + `text` for chips and tinted surfaces (6.8:1 – 9.4:1).
const semantic = {
  success: { main: '#047857', bg: '#ECFDF5', text: '#065F46' }, // completed
  warning: { main: '#B45309', bg: '#FFFBEB', text: '#92400E' }, // pending
  error: { main: '#B91C1C', bg: '#FEF2F2', text: '#991B1B' }, // canceled
  info: { main: '#1D4ED8', bg: '#EFF6FF', text: '#1E40AF' }, // confirmed
  neutral: { main: '#4B5563', bg: '#F3F4F6', text: '#374151' }, // no_show
};

// Categorical palette for Recharts (colorblind-safe, muted).
export const chartPalette = ['#4E79A7', '#F28E2B', '#59A14F', '#B07AA1', '#76B7B2'];

// Single source of truth for appointment status styling.
// Replaces the old constants/STATUS_COLORS (which failed AA contrast).
export const statusTokens = {
  pending: semantic.warning,
  confirmed: semantic.info,
  completed: semantic.success,
  canceled: semantic.error,
  no_show: semantic.neutral,
};

// ---------- 2. SYSTEM TOKENS ----------
const theme = createTheme({
  palette: {
    // bg/text are custom keys, reachable in sx via e.g. 'error.bg'.
    primary: { main: plum.main, dark: plum.dark, light: plum.light, bg: plum.bg, contrastText: '#FFFFFF' },
    success: { main: semantic.success.main, bg: semantic.success.bg, text: semantic.success.text },
    warning: { main: semantic.warning.main, bg: semantic.warning.bg, text: semantic.warning.text },
    error: { main: semantic.error.main, bg: semantic.error.bg, text: semantic.error.text },
    info: { main: semantic.info.main, bg: semantic.info.bg, text: semantic.info.text },
    neutral: { main: semantic.neutral.main, bg: semantic.neutral.bg, text: semantic.neutral.text },
    text: { primary: ink[900], secondary: ink[500] },
    divider: ink[300],
    background: { default: ink[50], paper: '#FFFFFF' },
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    // Dense B2B scale — existing markup uses h4 for page titles and h6 for
    // card titles; sizes are remapped so no component changes are needed.
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem', color: ink[500] },
    button: { textTransform: 'none', fontWeight: 500 },
  },

  spacing: 8, // canonical unit; use whole/half steps (0.5–6), no raw px
  shape: { borderRadius: 6 },

  // ---------- 3. COMPONENT DEFAULTS ----------
  // Whitespace + borders as structure; shadows only for functional
  // elevation (dialogs, menus keep their MUI defaults).
  components: {
    MuiPaper: { defaultProps: { variant: 'outlined' } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    // MUI X DataGrid: align with the token scale wherever a grid is used.
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderColor: ink[300],
        },
        columnHeaders: {
          backgroundColor: ink[50],
        },
        columnHeaderTitle: {
          fontWeight: 600,
        },
        cell: {
          fontSize: '0.875rem',
        },
      },
    },
  },
});

export default theme;
