import { alpha, createTheme } from '@mui/material/styles';

const colors = {
  canvas: '#F6F2F6',
  paper: '#FFFCFF',
  ink: '#261F2A',
  muted: '#756A79',
  line: '#E1D8E2',
  charcoal: '#18131B',
  charcoalSoft: '#2B222E',
  coral: '#C43F7A',
  coralDark: '#96305D',
  violet: '#7557D6',
  violetDark: '#5A3DB5',
  violetSoft: '#EEE9FC',
  green: '#3F7D65',
  greenSoft: '#E6F2ED',
  amber: '#AF7522',
  amberSoft: '#FFF3DE',
  red: '#BC3E4A',
  redSoft: '#FCE8EC',
  blue: '#5A6EAF',
  blueSoft: '#E9EDFA',
  graySoft: '#F0EBF1',
};

export const chartPalette = [colors.coral, colors.violet, colors.blue, colors.amber, colors.green];

export const statusTokens = {
  pending: { main: colors.amber, bg: colors.amberSoft, text: '#764708' },
  confirmed: { main: colors.blue, bg: colors.blueSoft, text: '#245181' },
  completed: { main: colors.green, bg: colors.greenSoft, text: '#2E604D' },
  canceled: { main: colors.red, bg: colors.redSoft, text: '#8E2D2D' },
  no_show: { main: colors.muted, bg: colors.graySoft, text: '#485250' },
};

const theme = createTheme({
  palette: {
    primary: { main: colors.coral, dark: colors.coralDark, contrastText: '#FFFFFF', bg: '#FBE8F1' },
    secondary: { main: colors.violet, dark: colors.violetDark, contrastText: '#FFFFFF', bg: colors.violetSoft },
    success: { main: colors.green, bg: colors.greenSoft, text: '#2E604D' },
    warning: { main: colors.amber, bg: colors.amberSoft, text: '#764708' },
    error: { main: colors.red, bg: colors.redSoft, text: '#8E2D2D' },
    info: { main: colors.blue, bg: colors.blueSoft, text: '#245181' },
    neutral: { main: colors.muted, bg: colors.graySoft, text: '#485250' },
    studio: { nav: colors.charcoal, navSoft: colors.charcoalSoft },
    text: { primary: colors.ink, secondary: colors.muted },
    divider: colors.line,
    background: { default: colors.canvas, paper: colors.paper },
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 750, lineHeight: 1.15 },
    h4: { fontSize: '1.75rem', fontWeight: 750, lineHeight: 1.2 },
    h5: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 },
    h6: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.35 },
    subtitle1: { fontSize: '0.9rem', fontWeight: 600 },
    body1: { fontSize: '0.9rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
        '*': { boxSizing: 'border-box' },
        '::selection': { backgroundColor: alpha(colors.coral, 0.22) },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiCard: { defaultProps: { elevation: 0 } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 38, paddingInline: 14 },
        contained: { '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiInputBase: { styleOverrides: { root: { backgroundColor: colors.paper } } },
    MuiChip: {
      styleOverrides: {
        root: { height: 26, borderRadius: 4, fontWeight: 700 },
        label: { paddingInline: 9 },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 8 } } },
    MuiDataGrid: {
      styleOverrides: {
        root: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 6 },
        columnHeaders: { backgroundColor: '#F4EFF5', borderBottomColor: colors.line },
        columnHeaderTitle: { fontWeight: 700 },
        cell: { borderBottomColor: '#F0EBF1' },
        row: { '&:hover': { backgroundColor: '#FAF7FA' } },
      },
    },
  },
});

export default theme;
