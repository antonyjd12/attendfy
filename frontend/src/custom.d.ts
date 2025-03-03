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

// Extend the theme to avoid TypeScript errors
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

export {};