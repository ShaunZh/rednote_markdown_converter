export type ThemeKey = 'minimalist' | 'geek' | 'morandi';

export interface Theme {
  name: string;
  background: string;
  textColor: string;
  headingColor: string;
  fontFamily: string;
  padding: string;
  border?: string;
  accentColor: string;
}

export const themes: Record<ThemeKey, Theme> = {
  minimalist: {
    name: 'Minimalist White',
    background: '#ffffff',
    textColor: '#334155', // Slate 700
    headingColor: 'text-slate-900',
    fontFamily: '"Inter", sans-serif',
    padding: '24px',
    border: '1px solid #e2e8f0', // Slate 200
    accentColor: '#000000',
  },
  geek: {
    name: 'Geek Dark',
    background: '#1e1e1e', // VS Code Darkish
    textColor: '#e2e8f0', // Slate 200
    headingColor: 'text-green-400',
    fontFamily: '"JetBrains Mono", monospace',
    padding: '24px',
    border: '1px solid #333',
    accentColor: '#4ade80',
  },
  morandi: {
    name: 'Morandi',
    background: '#f3f0e9', // Warm Beige/Grey
    textColor: '#57534e', // Stone 600
    headingColor: 'text-stone-800',
    fontFamily: '"Playfair Display", serif',
    padding: '28px', // Slightly more padding
    border: 'none',
    accentColor: '#a8a29e',
  },
};