import { createLiquidGlass, isChromium } from './vendor/liquid-glass.js';

const instances = [];
const desktop = matchMedia('(min-width: 768px)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const opticalRequested = new URLSearchParams(location.search).get('optical') === '1';
const startedAt = performance.now();

function attach(selector, options) {
  const element = document.querySelector(selector);
  if (!element) return;
  const resolved = { ...options };
  if (resolved.lockSize) {
    const rect = element.getBoundingClientRect();
    resolved.width = Math.round(rect.width);
    resolved.height = Math.round(rect.height);
    delete resolved.lockSize;
  }
  const instance = createLiquidGlass(element, {
    fallbackFilter: 'blur(20px) saturate(130%)',
    frost: 0,
    displaceBlur: 0,
    ...resolved
  });
  instances.push(instance);
  element.dataset.opticalGlass = instance.isActive ? 'active' : 'fallback';
}

if (desktop && opticalRequested && !reducedMotion) {
  attach('.mini-product.seller .optical-surface', {
    lockSize: true,
    borderRadius: 35,
    scale: -36,
    aberration: [0, 2, 4],
    border: 0.095,
    blur: 12,
    alpha: 0.95,
    saturation: 1.12
  });
  attach('.mini-product.scout .optical-surface', {
    lockSize: true,
    borderRadius: 35,
    scale: -36,
    aberration: [0, 2, 4],
    border: 0.095,
    blur: 12,
    alpha: 0.95,
    saturation: 1.12
  });
}

document.documentElement.dataset.opticalGlass = instances.some(instance => instance.isActive)
  ? 'active'
  : (desktop && isChromium && !reducedMotion ? 'available' : 'fallback');
document.documentElement.dataset.opticalGlassCount = String(instances.length);
document.documentElement.dataset.opticalGlassInitMs =
  (performance.now() - startedAt).toFixed(1);

addEventListener('pagehide', () => {
  instances.forEach(instance => instance.destroy());
}, { once: true });
