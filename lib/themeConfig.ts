import React from 'react';

// --- 1. The Schema ---

export interface ThemeConfig {
  id: string;
  name: string;
  type: 'free' | 'pro';

  container: {
    background: string; // Supports CSS colors, gradients, or patterns (shorthand allowed)
    backgroundImage?: string; // Optional image URL or gradient for background
    padding: string;
    radius: string;
    shadow: string;
    border: string;
    headerStyle?: 'none' | 'iphone' | 'mac';
  };

  typography: {
    fontFamily: string;
    baseFontSize: string;
    lineHeight: string;
    titleColor: string;
    textColor: string;
  };

  palette: {
    accent: string; // Used for links, primary buttons, accents
    secondary: string; // Used for borders, subtle text
  };

  components: {
    codeBlock: {
      style: 'mac' | 'simple' | 'minimal';
      background: string;
      textColor: string;
    };
    blockquote: {
      style: 'bar' | 'card' | 'none';
      color: string; // Border color or accent
      background: string;
    };
  };
}

// --- 2. The Themes ---

export const THEMES: ThemeConfig[] = [
  // 1. Minimal White (Default)
  {
    id: 'minimal',
    name: '极简白',
    type: 'free',
    container: {
      background: '#ffffff',
      padding: '24px',
      radius: '0px',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      border: '1px solid #e2e8f0',
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      baseFontSize: '16px',
      lineHeight: '1.6',
      titleColor: '#0f172a',
      textColor: '#334155',
    },
    palette: {
      accent: '#0f172a',
      secondary: '#94a3b8',
    },
    components: {
      codeBlock: {
        style: 'simple',
        background: '#f8fafc',
        textColor: '#334155',
      },
      blockquote: {
        style: 'bar',
        color: '#0f172a',
        background: '#f8fafc',
      },
    },
  },

  // 2. Geek Dark
  {
    id: 'geek',
    name: '极客暗色',
    type: 'free',
    container: {
      background: '#1e1e1e',
      padding: '24px',
      radius: '4px',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
      border: '1px solid #333333',
    },
    typography: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      baseFontSize: '15px',
      lineHeight: '1.7',
      titleColor: '#4ade80',
      textColor: '#e2e8f0',
    },
    palette: {
      accent: '#4ade80', // Bright Green
      secondary: '#64748b',
    },
    components: {
      codeBlock: {
        style: 'mac',
        background: '#2d2d2d',
        textColor: '#f8fafc',
      },
      blockquote: {
        style: 'bar',
        color: '#4ade80',
        background: 'rgba(74, 222, 128, 0.1)',
      },
    },
  },

  // 3. Morandi (Instagram/Lifestyle)
  {
    id: 'morandi',
    name: '莫兰迪',
    type: 'pro',
    container: {
      background: '#fdfbf7', // Warm Beige
      padding: '32px',
      radius: '24px',
      shadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.01)',
      border: 'none',
    },
    typography: {
      fontFamily: '"Playfair Display", "Merriweather", serif',
      baseFontSize: '16px',
      lineHeight: '1.8',
      titleColor: '#44403c', // Stone 700
      textColor: '#57534e', // Stone 600
    },
    palette: {
      accent: '#a8a29e', // Stone 400
      secondary: '#d6d3d1',
    },
    components: {
      codeBlock: {
        style: 'minimal',
        background: '#f5f5f4',
        textColor: '#57534e',
      },
      blockquote: {
        style: 'card',
        color: '#d6d3d1',
        background: '#ffffff',
      },
    },
  },

  // 4. Vintage Paper (Retro)
  {
    id: 'vintage',
    name: '复古纸张',
    type: 'pro',
    container: {
      background: '#fdf6e3',
      padding: '28px',
      radius: '2px',
      shadow: '1px 1px 5px rgba(0,0,0,0.1)',
      border: '1px solid #d6d3c9',
    },
    typography: {
      fontFamily: '"Times New Roman", Times, serif',
      baseFontSize: '17px',
      lineHeight: '1.6',
      titleColor: '#433422',
      textColor: '#5c4b37',
    },
    palette: {
      accent: '#b58900',
      secondary: '#d3ba7f',
    },
    components: {
      codeBlock: {
        style: 'minimal',
        background: 'rgba(0,0,0,0.03)',
        textColor: '#433422',
      },
      blockquote: {
        style: 'bar',
        color: '#8b4513',
        background: 'rgba(139, 69, 19, 0.05)',
      },
    },
  },

  // 5. iPhone Memo (Dotted Style)
  {
    id: 'memo',
    name: 'iPhone 备忘录',
    type: 'free',
    container: {
      background: '#fbfbf9', // Slightly off-white paper
      // Dotted grid pattern simulation
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
      padding: '28px',
      radius: '12px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: 'none',
      headerStyle: 'iphone',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      baseFontSize: '17px',
      lineHeight: '1.6',
      titleColor: '#1a1a1a',
      textColor: '#333333',
    },
    palette: {
      accent: '#f59e0b', // Amber-500
      secondary: '#d4d4d4',
    },
    components: {
      codeBlock: {
        style: 'minimal',
        background: 'rgba(0,0,0,0.03)',
        textColor: '#333333',
      },
      blockquote: {
        style: 'bar',
        color: '#f59e0b',
        background: 'rgba(245, 158, 11, 0.08)',
      },
    },
  },

  // 6. Typst-inspired editorial theme
  {
    id: 'typst',
    name: 'Typst 风',
    type: 'free',
    container: {
      background: 'linear-gradient(180deg, #fffdf8 0%, #fff6ee 100%)',
      backgroundImage: [
        'radial-gradient(circle at top left, rgba(255, 135, 92, 0.18), transparent 34%)',
        'radial-gradient(circle at bottom right, rgba(255, 203, 134, 0.22), transparent 28%)',
        'linear-gradient(135deg, rgba(94, 62, 45, 0.06) 0, rgba(94, 62, 45, 0.06) 1px, transparent 1px, transparent 14px)',
      ].join(', '),
      padding: '30px',
      radius: '26px',
      shadow: '0 28px 50px -26px rgba(61, 34, 18, 0.38)',
      border: '1px solid rgba(164, 104, 75, 0.18)',
    },
    typography: {
      fontFamily: '"Inter", "Noto Sans SC", sans-serif',
      baseFontSize: '16px',
      lineHeight: '1.68',
      titleColor: '#2f241d',
      textColor: '#5a4a40',
    },
    palette: {
      accent: '#e05a33',
      secondary: '#d5b9a4',
    },
    components: {
      codeBlock: {
        style: 'simple',
        background: 'rgba(118, 74, 49, 0.08)',
        textColor: '#52372a',
      },
      blockquote: {
        style: 'card',
        color: '#e05a33',
        background: 'rgba(224, 90, 51, 0.08)',
      },
    },
  },
];

// --- 3. Helper Function ---

export const getThemeStyles = (theme: ThemeConfig): React.CSSProperties => {
  return {
    // Container
    '--theme-bg': theme.container.background,
    '--theme-bg-image': theme.container.backgroundImage || 'none', // New CSS Variable
    '--theme-padding': theme.container.padding,
    '--theme-radius': theme.container.radius,
    '--theme-shadow': theme.container.shadow,
    '--theme-border': theme.container.border,

    // Typography
    '--theme-font': theme.typography.fontFamily,
    '--theme-text-base': theme.typography.baseFontSize,
    '--theme-line-height': theme.typography.lineHeight,
    '--theme-title-color': theme.typography.titleColor,
    '--theme-text-color': theme.typography.textColor,

    // Palette
    '--theme-accent': theme.palette.accent,
    '--theme-secondary': theme.palette.secondary,

    // Code Blocks
    '--code-bg': theme.components.codeBlock.background,
    '--code-text': theme.components.codeBlock.textColor,

    // Blockquotes
    '--quote-bg': theme.components.blockquote.background,
    '--quote-accent': theme.components.blockquote.color,
  } as React.CSSProperties;
};
