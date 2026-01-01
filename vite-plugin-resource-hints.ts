import type { Plugin } from 'vite';

/**
 * Vite plugin to add resource hints (preload, prefetch, modulepreload)
 * This helps reduce network dependency chains and improve page load
 */
export function resourceHintsPlugin(): Plugin {
  return {
    name: 'resource-hints',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const scripts: Array<{ src: string; type: string }> = [];
        const styles: Array<{ href: string }> = [];
        
        // Find all script tags
        const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
        let match;
        while ((match = scriptRegex.exec(html)) !== null) {
          const src = match[1];
          const isModule = match[0].includes('type="module"') || match[0].includes("type='module'");
          scripts.push({ src, type: isModule ? 'module' : 'script' });
        }
        
        // Find all CSS links
        const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
        while ((match = cssRegex.exec(html)) !== null) {
          styles.push({ href: match[1] });
        }
        
        // Find vendor chunk (contains React) and ensure it loads first
        const vendorScript = scripts.find(s => s.src.includes('vendor'));
        const otherScripts = scripts.filter(s => !s.src.includes('vendor'));
        
        // Build modulepreloads - vendor first, then others
        const modulePreloads = [];
        if (vendorScript && vendorScript.type === 'module') {
          modulePreloads.push(`    <link rel="modulepreload" crossorigin href="${vendorScript.src}" />`);
        }
        
        // Add other critical scripts (first 2 after vendor)
        const criticalScripts = otherScripts.slice(0, 2);
        criticalScripts.forEach(s => {
          if (s.type === 'module') {
            modulePreloads.push(`    <link rel="modulepreload" crossorigin href="${s.src}" />`);
          }
        });
        
        // Add prefetch for non-critical scripts
        const nonCriticalScripts = otherScripts.slice(2);
        const prefetches = nonCriticalScripts
          .map(s => `    <link rel="prefetch" href="${s.src}" as="script" />`)
          .join('\n');
        
        // Insert resource hints before script tag (vendor must load first)
        const resourceHints = [modulePreloads.join('\n'), prefetches]
          .filter(Boolean)
          .join('\n');
        
        if (resourceHints) {
          // Find the script tag and insert modulepreloads before it
          // Remove any existing modulepreloads for the same scripts first
          const existingPreloads = html.match(/<link rel="modulepreload"[^>]*>/g) || [];
          existingPreloads.forEach(preload => {
            if (preload.includes('vendor') || preload.includes('index-')) {
              html = html.replace(preload + '\n', '');
              html = html.replace(preload, '');
            }
          });
          
          // Insert before the first script tag
          html = html.replace(/(<script type="module"[^>]*>)/, resourceHints + '\n    $1');
        }
        
        return html;
      },
    },
  };
}

