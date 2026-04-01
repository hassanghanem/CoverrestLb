// hooks/useDynamicTheme.ts
import { useEffect } from 'react';

interface ThemeColors {
  primary?: string;
  accent?: string;
  secondary?: string;
}

export const useDynamicTheme = (color1?: string, color2?: string) => {
  useEffect(() => {
    if (color1 || color2) {
      updateThemeVariables({ primary: color1, accent: color2 });
    }
  }, [color1, color2]);

  const updateThemeVariables = (colors: ThemeColors) => {
    const root = document.documentElement;
    
    if (colors.primary) {
      const primaryHsl = hexToHsl(colors.primary);
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--brand-purple', primaryHsl);
      root.style.setProperty('--ring', primaryHsl);
      
      // Generate lighter/darker variants
      const primaryLight = adjustLightness(primaryHsl, 15);
      const primaryDark = adjustLightness(primaryHsl, -15);
      root.style.setProperty('--brand-purple-light', primaryLight);
      root.style.setProperty('--brand-purple-dark', primaryDark);
      root.style.setProperty('--accent', primaryLight); // Use light variant as accent
    }
    
    if (colors.accent) {
      const accentHsl = hexToHsl(colors.accent);
      root.style.setProperty('--accent-foreground', accentHsl);
      root.style.setProperty('--brand-orange', accentHsl);
      
      const accentLight = adjustLightness(accentHsl, 15);
      root.style.setProperty('--brand-orange-light', accentLight);
    }
  };

  const hexToHsl = (hex: string): string => {
    hex = hex.replace('#', '');
    
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  };

  const adjustLightness = (hsl: string, adjustment: number): string => {
    const [h, s, l] = hsl.split(' ').map(val => {
      if (val.includes('%')) return parseInt(val);
      return val;
    });
    
    const newLightness = Math.max(0, Math.min(100, parseInt(l as string) + adjustment));
    return `${h} ${s}% ${newLightness}%`;
  };

  return { primaryColor: color1, accentColor: color2 };
};