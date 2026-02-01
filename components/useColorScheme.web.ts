import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

function getSystemScheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// NOTE: On web we resolve system theme via matchMedia.
export function useColorScheme(): 'light' | 'dark' {
  const mode = useThemeStore((state) => state.mode);
  const isDark = useThemeStore((state) => state.isDark);
  const resolveTheme = useThemeStore((state) => state.resolveTheme);

  useEffect(() => {
    resolveTheme(getSystemScheme());

    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => resolveTheme(getSystemScheme());

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Safari fallback
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [mode, resolveTheme]);

  return isDark ? 'dark' : 'light';
}
