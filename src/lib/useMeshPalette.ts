import { useEffect } from 'react';
import { meshVars, type MeshPaletteName } from '../theme';

/**
 * Drive the swirling gradient-mesh background by writing the active palette's
 * CSS custom properties onto <html>. The GradientMesh (mounted once in App)
 * inherits them, and index.css transitions the orb/accent colors so screen and
 * block changes crossfade smoothly.
 */
export function useMeshPalette(name: MeshPaletteName, mode: 'home' | 'session' | 'paused' = 'home') {
  useEffect(() => {
    const root = document.documentElement;
    const vars = meshVars(name, mode);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, [name, mode]);
}
