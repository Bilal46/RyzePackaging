import type { Plugin } from 'vite';

/**
 * Vite plugin to add preload links for CSS files
 * This helps reduce render-blocking CSS by loading CSS asynchronously
 */
export function cssPreloadPlugin(): Plugin {
  return {
    name: 'css-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // Remove duplicate preload links that might be added by resource hints plugin
        // Keep only the stylesheet link, remove duplicate preloads
        const cssLinkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+\.css[^"']*)["'][^>]*>/g;
        const matches: Array<{ full: string; href: string }> = [];
        let match;
        
        while ((match = cssLinkRegex.exec(html)) !== null) {
          matches.push({ full: match[0], href: match[1] });
        }
        
        // Remove crossorigin from CSS links (not needed for same-origin)
        matches.forEach(({ full, href }) => {
          const cleanLink = full.replace(/\s*crossorigin[^>]*/i, '');
          html = html.replace(full, cleanLink);
        });
        
        // Remove duplicate preload links for CSS
        const preloadRegex = /<link[^>]*rel=["']preload["'][^>]*as=["']style["'][^>]*>/gi;
        const preloadMatches = html.match(preloadRegex) || [];
        if (preloadMatches.length > 1) {
          // Keep only the first preload, remove others
          for (let i = 1; i < preloadMatches.length; i++) {
            html = html.replace(preloadMatches[i], '');
          }
        }
        
        return html;
      },
    },
  };
}

