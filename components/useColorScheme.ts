import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
    const systemColorScheme = useSystemColorScheme();
    const mode = useThemeStore((state) => state.mode);
    const isDark = useThemeStore((state) => state.isDark);
    const resolveTheme = useThemeStore((state) => state.resolveTheme);

    useEffect(() => {
        resolveTheme(systemColorScheme ?? null);
    }, [systemColorScheme, mode, resolveTheme]);

    return isDark ? 'dark' : 'light';
}

export { useSystemColorScheme };
