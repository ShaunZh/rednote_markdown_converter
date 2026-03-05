import React from 'react';
import { THEMES, ThemeConfig } from '../lib/themeConfig';
import { Check, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ThemeSidebarProps {
  currentTheme: ThemeConfig;
  onSelect: (theme: ThemeConfig) => void;
}

export const ThemeSidebar: React.FC<ThemeSidebarProps> = ({ currentTheme, onSelect }) => {
  return (
    <div className="w-[320px] bg-white border-l border-neutral-200 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-neutral-100">
        <h2 className="font-semibold text-slate-800">主题库</h2>
        <p className="text-xs text-slate-500 mt-1">为图片卡片选择展示风格</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {THEMES.map((theme) => {
          const isActive = currentTheme.id === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme)}
              className={cn(
                "group w-full text-left relative transition-all duration-200 rounded-xl overflow-hidden border-2",
                isActive 
                  ? "border-red-500 ring-2 ring-red-500/20" 
                  : "border-transparent hover:border-slate-200"
              )}
            >
              {/* Mini Preview Card */}
              <div 
                className="w-full aspect-[4/3] relative p-4 flex flex-col gap-2 overflow-hidden"
                style={{ 
                  background: theme.container.background,
                  color: theme.typography.textColor
                }}
              >
                 {/* Mock Content */}
                 <div 
                   className="w-3/4 h-3 rounded-full mb-1" 
                   style={{ backgroundColor: theme.typography.titleColor, opacity: 0.9 }} 
                 />
                 <div 
                   className="w-full h-2 rounded-full opacity-60" 
                   style={{ backgroundColor: theme.typography.textColor }} 
                 />
                 <div 
                   className="w-5/6 h-2 rounded-full opacity-60" 
                   style={{ backgroundColor: theme.typography.textColor }} 
                 />
                 
                 {/* Mock Component (Blockquote or Code) */}
                 <div 
                    className="mt-3 p-2 rounded text-[10px] opacity-80"
                    style={{
                        background: theme.components.codeBlock.background,
                        color: theme.components.codeBlock.textColor,
                        fontFamily: theme.typography.fontFamily
                    }}
                 >
                    <div className="flex gap-1 mb-1 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>
                    <span>const style = "cool";</span>
                 </div>

                 {/* "Pro" Badge */}
                 {theme.type === 'pro' && (
                   <div className="absolute top-2 right-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                     进阶
                   </div>
                 )}
                 
                 {/* Active Indicator */}
                 {isActive && (
                    <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white rounded-full p-2 text-red-500 shadow-lg">
                            <Check size={20} strokeWidth={3} />
                        </div>
                    </div>
                 )}
              </div>
              
              <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                {theme.type === 'pro' && !isActive && <Lock size={12} className="text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
