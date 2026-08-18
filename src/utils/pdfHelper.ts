/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Math-based fallback converter for OKLCH to RGB
export function oklchToRgb(oklchStr: string): string {
  const match = oklchStr.match(/oklch\(\s*([\d.]+%?)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[\/,]\s*([\d.]+%?))?\s*\)/i);
  if (!match) return "rgb(100, 100, 100)";

  let L = parseFloat(match[1]);
  if (match[1].endsWith('%')) {
    L = L / 100;
  }
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]); // hue in degrees (0 to 360)
  
  let A = match[4] ? parseFloat(match[4]) : 1;
  if (match[4] && match[4].endsWith('%')) {
    A = A / 100;
  }

  // Convert Hue to Radians
  const hRad = (H * Math.PI) / 180;

  // OKLab coordinates
  const a = C * Math.cos(hRad);
  const oklabB = C * Math.sin(hRad);

  // OKLab to LMS (non-linear)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * oklabB;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * oklabB;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * oklabB;

  // LMS non-linear to LMS linear (cube)
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS linear to linear sRGB
  const rL = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gL = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bL = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // Linear sRGB to standard sRGB gamma compression
  const compress = (c: number) => {
    if (c <= 0.0031308) {
      return 12.92 * c;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  const r = Math.max(0, Math.min(255, Math.round(compress(rL) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(compress(gL) * 255)));
  const rgbB = Math.max(0, Math.min(255, Math.round(compress(bL) * 255)));

  if (A === 1) {
    return `rgb(${r}, ${g}, ${rgbB})`;
  } else {
    return `rgba(${r}, ${g}, ${rgbB}, ${A})`;
  }
}

// Resolves oklch, color-mix, etc. colors to safe standard hex/rgb colors using DOM / Canvas
export function resolveColorToRgb(colorStr: string): string {
  if (!colorStr) return colorStr;
  
  const normalized = colorStr.toLowerCase();
  
  // Only convert if it looks like a complex color function to avoid overhead
  if (!normalized.includes('oklch') && !normalized.includes('color-mix') && !normalized.includes('lab') && !normalized.includes('lch')) {
    return colorStr;
  }
  
  try {
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
    
    if (computed && !computed.includes('oklch') && computed !== '') {
      return computed;
    }
  } catch (e) {
    // fallback
  }

  if (normalized.includes('oklch')) {
    return oklchToRgb(colorStr);
  }
  
  return 'rgb(100, 100, 100)';
}

// Sanitizes a DOM Document (used in html2canvas onclone callback) by stripping/converting all oklch color function occurrences
export function sanitizeDocumentForHtml2Canvas(doc: Document) {
  const replaceOklchInString = (str: string): string => {
    if (!str || !str.includes('oklch')) return str;
    return str.replace(/oklch\([^)]+\)/gi, (match) => {
      try {
        const rgb = resolveColorToRgb(match);
        if (rgb && !rgb.includes('oklch')) {
          return rgb;
        }
      } catch (e) {}
      return 'rgba(100, 100, 100, 0.5)';
    });
  };

  // 1. Process all <style> elements in the cloned document
  try {
    const styleElements = doc.querySelectorAll('style');
    styleElements.forEach((styleEl) => {
      if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
        styleEl.textContent = replaceOklchInString(styleEl.textContent);
      }
    });
  } catch (err) {
    console.warn("Failed sanitizing style elements:", err);
  }

  // 2. Process all inline style attributes in the cloned document
  try {
    const elementsWithStyle = doc.querySelectorAll('*[style*="oklch"]');
    elementsWithStyle.forEach((el) => {
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        el.setAttribute('style', replaceOklchInString(styleAttr));
      }
    });
  } catch (err) {
    console.warn("Failed sanitizing element style attributes:", err);
  }
}

// Setup temporary getComputedStyle interception
export function setupSafeGetComputedStyle(): () => void {
  const originalGetComputedStyle = window.getComputedStyle;
  
  window.getComputedStyle = function (element, pseudoElt) {
    const style = originalGetComputedStyle(element, pseudoElt);
    
    return new Proxy(style, {
      get(target, prop) {
        if (typeof prop === 'string') {
          // Intercept color-related properties
          if (
            prop === 'color' ||
            prop === 'backgroundColor' ||
            prop === 'borderColor' ||
            prop === 'borderTopColor' ||
            prop === 'borderBottomColor' ||
            prop === 'borderLeftColor' ||
            prop === 'borderRightColor' ||
            prop === 'outlineColor' ||
            prop === 'fill' ||
            prop === 'stroke'
          ) {
            const cssPropName = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            const val = target.getPropertyValue(cssPropName);
            return resolveColorToRgb(val);
          }
          
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              const normalizedProp = propertyName.toLowerCase();
              if (
                normalizedProp === 'color' ||
                normalizedProp === 'background-color' ||
                normalizedProp === 'border-color' ||
                normalizedProp === 'border-top-color' ||
                normalizedProp === 'border-bottom-color' ||
                normalizedProp === 'border-left-color' ||
                normalizedProp === 'border-right-color' ||
                normalizedProp === 'outline-color' ||
                normalizedProp === 'fill' ||
                normalizedProp === 'stroke'
              ) {
                return resolveColorToRgb(val);
              }
              return val;
            };
          }
        }
        
        const value = Reflect.get(target, prop);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    });
  };
  
  return () => {
    window.getComputedStyle = originalGetComputedStyle;
  };
}
