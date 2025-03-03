import { createTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';

// Extend the theme interface
declare module '@mui/material/styles' {
  interface Palette {
    gradient?: {
      primary: string;
    };
    neutral: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    gradient?: {
      primary: string;
    };
    neutral?: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
}

// Update the theme configuration
const theme = createTheme({
  palette: {
    mode: 'light', // This will be overridden by ColorModeContext
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    neutral: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    gradient: {
      primary: 'linear-gradient(to right, #2563eb, #10b981)',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6366f1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            background: '#f8fafc',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
        },
      },
    },
  },
});

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    ...theme,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode colors
            primary: theme.palette.primary,
            secondary: theme.palette.secondary,
            background: {
              default: '#f9fafb',
              paper: '#ffffff',
            },
            text: {
              primary: '#111827',
              secondary: '#4b5563',
            },
          }
        : {
            // Enhanced dark mode colors
            primary: {
              main: '#3b82f6',
              light: '#60a5fa',
              dark: '#2563eb',
            },
            secondary: {
              main: '#34d399',
              light: '#6ee7b7',
              dark: '#10b981',
            },
            background: {
              default: '#000000',
              paper: '#111827',
            },
            text: {
              primary: '#f3f4f6',
              secondary: '#d1d5db',
            },
          }),
      neutral: theme.palette.neutral,
      gradient: {
        primary: mode === 'dark'
          ? 'linear-gradient(to right, #3b82f6, #34d399)'
          : theme.palette.gradient?.primary || 'linear-gradient(to right, #2563eb, #10b981)',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'dark' 
              ? 'linear-gradient(180deg, #111827 0%, #000000 100%)' 
              : '#ffffff',
            color: mode === 'dark' ? '#f3f4f6' : '#111827',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#111827' : '#ffffff',
            borderColor: mode === 'dark' ? '#1f2937' : 'rgba(0, 0, 0, 0.12)',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#111827' : '#ffffff',
            borderBottom: `1px solid ${mode === 'dark' ? '#1f2937' : 'rgba(0, 0, 0, 0.12)'}`,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              backgroundColor: mode === 'dark' ? '#1f2937' : '#f8fafc',
              color: mode === 'dark' ? '#f3f4f6' : 'inherit',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(59, 130, 246, 0.08)'
                : 'rgba(99, 102, 241, 0.04)',
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#000000' : '#f8fafc',
            scrollbarColor: mode === 'dark' ? '#4b5563 #1f2937' : undefined,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: mode === 'dark' ? '#1f2937' : '#f1f5f9',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? '#4b5563' : '#94a3b8',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#6b7280' : '#64748b',
              },
            },
          },
        },
      },
    },
  });

export default theme; 