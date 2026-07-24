/**
 * Liquid Glass — real optical refraction for the web.
 * Adapted from https://github.com/rizroze/liquid-glass
 * Copyright (c) 2026 Riz Roze. Licensed under the MIT License.
 * See liquid-glass.LICENSE.txt in this directory.
 */
function resolveConfig(el, opts) {
  const rect = el.getBoundingClientRect();
  const ab = opts.aberration ?? [0, 10, 20];
  return {
    width: opts.width ?? Math.round(rect.width),
    height: opts.height ?? Math.round(rect.height),
    radius: opts.borderRadius ?? 50,
    scale: opts.scale ?? -180,
    border: opts.border ?? 0.07,
    lightness: opts.lightness ?? 50,
    alpha: opts.alpha ?? 0.93,
    blur: opts.blur ?? 11,
    r: ab[0], g: ab[1], b: ab[2],
    frost: opts.frost ?? 0,
    saturation: opts.saturation ?? 1,
    displace: opts.displaceBlur ?? 0
  };
}

const isChromium = typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent);
const mapCache = new Map();

function buildDisplacementMap(c) {
  const key = `${c.width}:${c.height}:${c.radius}:${c.scale}:${c.border}:${c.blur}:${c.lightness}:${c.alpha}`;
  const cached = mapCache.get(key);
  if (cached) return cached;
  const maxDisplace = Math.max(Math.abs(c.scale) * 0.5, 20);
  const padX = Math.ceil(maxDisplace);
  const padY = Math.ceil(maxDisplace);
  const totalW = c.width + padX * 2;
  const totalH = c.height + padY * 2;
  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(128, 128, 128)';
  ctx.fillRect(0, 0, totalW, totalH);
  const ox = padX, oy = padY;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ox, oy, c.width, c.height, c.radius);
  ctx.clip();
  ctx.fillStyle = '#000';
  ctx.fillRect(ox, oy, c.width, c.height);
  const redGrad = ctx.createLinearGradient(ox + c.width, oy, ox, oy);
  redGrad.addColorStop(0, '#000');
  redGrad.addColorStop(1, '#f00');
  ctx.fillStyle = redGrad;
  ctx.fillRect(ox, oy, c.width, c.height);
  ctx.globalCompositeOperation = 'difference';
  const blueGrad = ctx.createLinearGradient(ox, oy, ox, oy + c.height);
  blueGrad.addColorStop(0, '#000');
  blueGrad.addColorStop(1, '#00f');
  ctx.fillStyle = blueGrad;
  ctx.fillRect(ox, oy, c.width, c.height);
  ctx.globalCompositeOperation = 'source-over';
  const borderPx = Math.min(c.width, c.height) * (c.border * 0.5);
  ctx.filter = `blur(${c.blur}px)`;
  ctx.fillStyle = `hsla(0,0%,${c.lightness}%,${c.alpha})`;
  ctx.beginPath();
  ctx.roundRect(
    ox + borderPx, oy + borderPx,
    c.width - borderPx * 2, c.height - borderPx * 2, c.radius
  );
  ctx.fill();
  ctx.restore();
  const uri = canvas.toDataURL();
  mapCache.set(key, uri);
  return uri;
}

let instanceCount = 0;
function createFilterSVG(id) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;';
  svg.innerHTML = `
    <defs>
      <filter id="${id}" color-interpolation-filters="sRGB">
        <feImage result="map" preserveAspectRatio="none"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispRed" data-channel="red"/>
        <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispGreen" data-channel="green"/>
        <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispBlue" data-channel="blue"/>
        <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
        <feBlend in="red" in2="green" mode="screen" result="rg"/>
        <feBlend in="rg" in2="blue" mode="screen" result="output"/>
        <feGaussianBlur in="output" stdDeviation="0"/>
      </filter>
    </defs>`;
  return {
    svg,
    filter: svg.querySelector('filter'),
    feImage: svg.querySelector('feImage'),
    red: svg.querySelector('[data-channel="red"]'),
    green: svg.querySelector('[data-channel="green"]'),
    blue: svg.querySelector('[data-channel="blue"]'),
    blur: svg.querySelector('feGaussianBlur')
  };
}

function applyConfig(c, refs) {
  const uri = buildDisplacementMap(c);
  const maxD = Math.max(Math.abs(c.scale) * 0.5, 20);
  const pctX = Math.ceil(maxD / c.width * 100);
  const pctY = Math.ceil(maxD / c.height * 100);
  refs.filter.setAttribute('x', `-${pctX}%`);
  refs.filter.setAttribute('y', `-${pctY}%`);
  refs.filter.setAttribute('width', `${100 + pctX * 2}%`);
  refs.filter.setAttribute('height', `${100 + pctY * 2}%`);
  refs.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', uri);
  refs.feImage.setAttribute('href', uri);
  refs.red.setAttribute('scale', String(c.scale + c.r));
  refs.green.setAttribute('scale', String(c.scale + c.g));
  refs.blue.setAttribute('scale', String(c.scale + c.b));
  refs.blur.setAttribute('stdDeviation', String(c.displace));
}

export function createLiquidGlass(element, options = {}) {
  const fallback = options.fallbackFilter ?? 'blur(20px)';
  if (!isChromium) {
    const prev = element.style.backdropFilter;
    const prevWebkit = element.style.getPropertyValue('-webkit-backdrop-filter');
    element.style.backdropFilter = fallback;
    element.style.setProperty('-webkit-backdrop-filter', fallback);
    return {
      isActive: false,
      filterElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      update() {},
      destroy() {
        element.style.backdropFilter = prev;
        element.style.setProperty('-webkit-backdrop-filter', prevWebkit);
      }
    };
  }
  const id = options.filterId ?? `liquid-glass-${++instanceCount}`;
  const refs = createFilterSVG(id);
  document.body.appendChild(refs.svg);
  let currentOpts = { ...options };
  let config = resolveConfig(element, currentOpts);
  applyConfig(config, refs);
  function applyStyles(c) {
    element.style.backdropFilter = `url(#${id}) saturate(${c.saturation})`;
    element.style.setProperty('-webkit-backdrop-filter', `url(#${id}) saturate(${c.saturation})`);
    if (c.frost > 0) element.style.background = `hsl(0 0% 0% / ${c.frost})`;
  }
  applyStyles(config);
  let resizeRaf = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (currentOpts.width == null || currentOpts.height == null) {
        config = resolveConfig(element, currentOpts);
        applyConfig(config, refs);
        applyStyles(config);
      }
    });
  });
  observer.observe(element);
  return {
    isActive: true,
    filterElement: refs.svg,
    update(newOpts) {
      currentOpts = { ...currentOpts, ...newOpts };
      config = resolveConfig(element, currentOpts);
      applyConfig(config, refs);
      applyStyles(config);
    },
    destroy() {
      observer.disconnect();
      cancelAnimationFrame(resizeRaf);
      refs.svg.remove();
      element.style.backdropFilter = '';
      element.style.setProperty('-webkit-backdrop-filter', '');
      element.style.background = '';
    }
  };
}

export { isChromium };
