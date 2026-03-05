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

// --- 2. The Themes (6 Presets) ---

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

  // 4. Simple Grid (Note Paper)
  {
    id: 'grid',
    name: '简约网格',
    type: 'free',
    container: {
      // Linear gradient grid pattern
      background: `
        linear-gradient(#e5e7eb 1px, transparent 1px) 0 0 / 24px 24px, 
        linear-gradient(90deg, #e5e7eb 1px, transparent 1px) 0 0 / 24px 24px 
        #ffffff
      `,
      padding: '32px',
      radius: '0px',
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      border: '1px solid #e5e7eb',
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      baseFontSize: '16px',
      lineHeight: '1.6',
      titleColor: '#2563eb', // Blue 600
      textColor: '#374151', // Gray 700
    },
    palette: {
      accent: '#3b82f6',
      secondary: '#93c5fd',
    },
    components: {
      codeBlock: {
        style: 'simple',
        background: '#f1f5f9',
        textColor: '#0f172a',
      },
      blockquote: {
        style: 'bar',
        color: '#3b82f6',
        background: '#eff6ff',
      },
    },
  },

  // 5. Vintage Paper (Retro)
  {
    id: 'vintage',
    name: '复古纸张',
    type: 'pro',
    container: {
      background: '#fdf6e3', // Solarized Light base / Old paper
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
      accent: '#b58900', // Yellow/Gold
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
        color: '#8b4513', // SaddleBrown
        background: 'rgba(139, 69, 19, 0.05)',
      },
    },
  },

  // 6. Modern Gradient
  {
    id: 'modern',
    name: '现代渐变',
    type: 'pro',
    container: {
      // Soft mesh gradient: Pink -> Blue
      background: 'linear-gradient(135deg, #ffe6fa 0%, #e3f2fd 100%)',
      padding: '32px',
      radius: '16px',
      shadow: '0 10px 30px -5px rgba(255, 105, 180, 0.15)',
      border: '1px solid rgba(255,255,255,0.6)',
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      baseFontSize: '16px',
      lineHeight: '1.7',
      titleColor: '#1e293b', // Dark Slate
      textColor: '#334155', // Slate
    },
    palette: {
      accent: '#ec4899', // Pink
      secondary: '#ffffff',
    },
    components: {
      codeBlock: {
        style: 'simple',
        background: 'rgba(255,255,255,0.6)', // Glassmorphic
        textColor: '#0f172a',
      },
      blockquote: {
        style: 'card',
        color: '#ec4899',
        background: 'rgba(255,255,255,0.5)',
      },
    },
  },

  // 7. iPhone Memo (Dotted Style)
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

  // 8. Cute Paw (Image Background Example)
  {
    id: 'cute-paw',
    name: '可爱爪印',
    type: 'pro',
    container: {
      background: '#eef2ff', // Fallback color
      // Example decorative background image
      backgroundImage: 'radial-gradient(circle at top right, #fb7185 0%, transparent 20%), radial-gradient(circle at bottom left, #60a5fa 0%, transparent 20%)',
      padding: '32px',
      radius: '24px',
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '4px solid #ffffff',
    },
    typography: {
      fontFamily: '"Nunito", sans-serif', // Rounded font
      baseFontSize: '16px',
      lineHeight: '1.7',
      titleColor: '#3730a3', // Indigo 800
      textColor: '#4f46e5', // Indigo 600
    },
    palette: {
      accent: '#f43f5e', // Rose 500
      secondary: '#c7d2fe',
    },
    components: {
      codeBlock: {
        style: 'simple', // 'card' was invalid, changed to 'simple'
        background: '#ffffff',
        textColor: '#3730a3',
      },
      blockquote: {
        style: 'card',
        color: '#f43f5e',
        background: '#ffffff',
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
