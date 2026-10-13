// NexHire Mobile App — Premium Dark Theme Design System
export const COLORS = {
  // Core backgrounds
  bg: '#0a0e1a',
  bgCard: '#111827',
  bgCardHover: '#1a2332',
  bgGlass: 'rgba(17, 24, 39, 0.85)',
  bgOverlay: 'rgba(0, 0, 0, 0.7)',
  bgInput: '#1e293b',
  bgAccent: '#0f172a',

  // Primary brand gradient
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Accent colors
  accent: '#22d3ee',
  accentGreen: '#34d399',
  accentOrange: '#fb923c',
  accentPink: '#f472b6',
  accentPurple: '#a78bfa',

  // Source branding
  linkedin: '#0a66c2',
  linkedinLight: '#60a5fa',
  naukri: '#f97316',
  naukriLight: '#fb923c',
  unstop: '#8b5cf6',
  unstopLight: '#c084fc',

  // City branding
  bangalore: '#38bdf8',
  hyderabad: '#a78bfa',
  pune: '#06b6d4',
  mumbai: '#f59e0b',

  // Status
  success: '#22c55e',
  error: '#ef4444',
  warning: '#eab308',
  info: '#3b82f6',

  // Text
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textDim: '#475569',
  textWhite: '#ffffff',

  // Borders
  border: '#1e293b',
  borderLight: '#334155',
  borderAccent: 'rgba(99, 102, 241, 0.3)',

  // Gradients (used as arrays for LinearGradient)
  gradientPrimary: ['#6366f1', '#8b5cf6', '#a855f7'],
  gradientHero: ['#0f0c29', '#302b63', '#24243e'],
  gradientCard: ['rgba(17, 24, 39, 0.95)', 'rgba(15, 23, 42, 0.95)'],
  gradientLinkedin: ['#0a66c2', '#0077b5'],
  gradientNaukri: ['#f97316', '#ea580c'],
  gradientSuccess: ['#22c55e', '#16a34a'],
  gradientDanger: ['#ef4444', '#dc2626'],
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semiBold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  extraBold: { fontFamily: 'System', fontWeight: '800' },
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  h3: 24,
  h2: 28,
  h1: 34,
  hero: 42,

  // Spacing
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 12,
  paddingLg: 16,
  paddingXl: 20,
  paddingXxl: 24,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 100,

  // Component sizes
  headerHeight: 56,
  tabBarHeight: 65,
  cardMinHeight: 180,
  buttonHeight: 48,
  inputHeight: 50,
  chipHeight: 34,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
};
