/**
 * DotMatrixFlower — Nothing OS style dot-matrix
 * Reference image: rangoli tiles (filled color blocks + white dot-matrix flowers/diamonds)
 * + basic dot-matrix shapes filling gaps
 */

// ── Dot builders ───────────────────────────────────────────────

function petalDots(cx, cy, angleDeg, length, count, dotR) {
  const rad = (angleDeg * Math.PI) / 180;
  const dots = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / count;
    const r = t * length;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    const spread = Math.sin(t * Math.PI) * 6;
    const perp = rad + Math.PI / 2;
    if (i > 0 && i < count - 1) {
      dots.push({ x: x + Math.cos(perp) * spread, y: y + Math.sin(perp) * spread, r: dotR * 0.85 });
      dots.push({ x: x + Math.cos(perp) * -spread, y: y + Math.sin(perp) * -spread, r: dotR * 0.85 });
    }
    dots.push({ x, y, r: dotR });
  }
  const tipX = cx + Math.cos(rad) * (length + dotR * 1.2);
  const tipY = cy + Math.sin(rad) * (length + dotR * 1.2);
  dots.push({ x: tipX, y: tipY, r: dotR * 1.15 });
  return dots;
}

function buildFlowerDots({ petals = 8, size = 100, dotR = 2.2 }) {
  const cx = size / 2;
  const cy = size / 2;
  const petalLen = size * 0.32;
  const dots = [];
  dots.push({ x: cx, y: cy, r: dotR * 1.25 });
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p;
    const rad = (a * Math.PI) / 180;
    dots.push({ x: cx + Math.cos(rad) * (size * 0.09), y: cy + Math.sin(rad) * (size * 0.09), r: dotR * 0.9 });
  }
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p + 360 / petals / 2;
    const rad = (a * Math.PI) / 180;
    dots.push({ x: cx + Math.cos(rad) * (size * 0.16), y: cy + Math.sin(rad) * (size * 0.16), r: dotR * 0.82 });
  }
  for (let p = 0; p < petals; p++) {
    dots.push(...petalDots(cx, cy, (360 / petals) * p - 90, petalLen, 4, dotR));
  }
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p + 360 / petals / 2;
    const rad = (a * Math.PI) / 180;
    dots.push({ x: cx + Math.cos(rad) * (size * 0.42), y: cy + Math.sin(rad) * (size * 0.42), r: dotR * 0.55 });
  }
  return dots;
}

function diamondDots({ size = 100, dotR = 2 }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const dots = [];
  for (let l = 0; l < 5; l++) {
    const inset = (l / 5) * (s * 0.42);
    const pts = [[cx, inset], [s - inset, cy], [cx, s - inset], [inset, cy]];
    for (let e = 0; e < 4; e++) {
      const [x1, y1] = pts[e];
      const [x2, y2] = pts[(e + 1) % 4];
      const steps = l === 0 ? 1 : Math.max(2, Math.ceil((6 - l) * 1.2));
      for (let t = 0; t < steps; t++) {
        const f = steps === 1 ? 0.5 : t / (steps - 1);
        if (l === 0) {
          if (t !== 0) continue;
          dots.push({ x: x1, y: y1, r: dotR });
        } else {
          if (f === 0 && e > 0) continue;
          dots.push({ x: x1 + (x2 - x1) * f, y: y1 + (y2 - y1) * f, r: dotR * (l < 2 ? 1 : 0.88) });
        }
      }
    }
  }
  dots.push({ x: cx, y: cy, r: dotR * 0.9 });
  return dots;
}

// ── Basic shape dot-matrices for gap filling ──────────────────

function shapeDots({ shape = 'circle', size = 60, dotR = 2 }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const dots = [];
  if (shape === 'circle') {
    const rings = 3;
    for (let r = 0; r < rings; r++) {
      const radius = (s * 0.36 * (r + 1)) / rings;
      const count = Math.max(8, Math.round((radius * Math.PI * 2) / 7));
      for (let i = 0; i < count; i++) {
        const a = (360 / count) * i - 90;
        const rad = (a * Math.PI) / 180;
        dots.push({ x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius, r: r === 0 ? dotR * 1.1 : dotR * (r === rings - 1 ? 0.9 : 0.85) });
      }
    }
    dots.push({ x: cx, y: cy, r: dotR * 0.9 });
  } else if (shape === 'square') {
    const pad = s * 0.18;
    const pts = [[pad, pad], [s - pad, pad], [s - pad, s - pad], [pad, s - pad]];
    for (let e = 0; e < 4; e++) {
      const [x1, y1] = pts[e];
      const [x2, y2] = pts[(e + 1) % 4];
      const steps = 5;
      for (let t = 0; t < steps; t++) {
        if (t === 0 && e > 0) continue;
        dots.push({ x: x1 + (x2 - x1) * (t / (steps - 1)), y: y1 + (y2 - y1) * (t / (steps - 1)), r: dotR });
      }
    }
    // inner square
    const ip = s * 0.32;
    const ipts = [[ip, ip], [s - ip, ip], [s - ip, s - ip], [ip, s - ip]];
    for (let e = 0; e < 4; e++) {
      const [x1, y1] = ipts[e];
      const [x2, y2] = ipts[(e + 1) % 4];
      const steps = 3;
      for (let t = 0; t < steps; t++) {
        if (t === 0 && e > 0) continue;
        dots.push({ x: x1 + (x2 - x1) * (t / (steps - 1)), y: y1 + (y2 - y1) * (t / (steps - 1)), r: dotR * 0.85 });
      }
    }
  } else if (shape === 'cross') {
    // + shape — vertical and horizontal dotted lines
    const len = s * 0.32;
    const steps = 7;
    for (let i = 0; i < steps; i++) {
      const off = -len + (2 * len * i) / (steps - 1);
      if (i === Math.floor(steps / 2)) continue; // center handled once
      dots.push({ x: cx + off, y: cy, r: dotR });
      dots.push({ x: cx, y: cy + off, r: dotR });
    }
    dots.push({ x: cx, y: cy, r: dotR * 1.12 });
    // diagonal tiny accents
    const d = s * 0.22;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => dots.push({ x: cx + sx * d, y: cy + sy * d, r: dotR * 0.62 }));
  } else if (shape === 'triangle') {
    const h = s * 0.52;
    const p1 = [cx, cy - h / 2];
    const p2 = [cx - h * 0.55, cy + h / 2];
    const p3 = [cx + h * 0.55, cy + h / 2];
    const tri = [p1, p2, p3];
    for (let e = 0; e < 3; e++) {
      const [x1, y1] = tri[e];
      const [x2, y2] = tri[(e + 1) % 3];
      const steps = 6;
      for (let t = 0; t < steps; t++) {
        if (t === 0 && e > 0) continue;
        dots.push({ x: x1 + (x2 - x1) * (t / (steps - 1)), y: y1 + (y2 - y1) * (t / (steps - 1)), r: dotR });
      }
    }
  } else if (shape === 'star') {
    // 4-point star
    for (let i = 0; i < 8; i++) {
      const a = (360 / 8) * i - 90;
      const rad = (a * Math.PI) / 180;
      const r = i % 2 === 0 ? s * 0.36 : s * 0.16;
      dots.push({ x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, r: i % 2 === 0 ? dotR : dotR * 0.82 });
    }
    dots.push({ x: cx, y: cy, r: dotR * 1.05 });
    // outer dots between points
    for (let i = 0; i < 8; i++) {
      const a = (360 / 8) * i - 90 + 22.5;
      const rad = (a * Math.PI) / 180;
      dots.push({ x: cx + Math.cos(rad) * (s * 0.28), y: cy + Math.sin(rad) * (s * 0.28), r: dotR * 0.58 });
    }
  }
  return dots;
}

// ── SVG renderers ─────────────────────────────────────────────

export function FlowerSVG({ variant = 'lotus', size = 120, color = '#FFFFFF', dotR, opacity = 1 }) {
  const dr = dotR ?? (size < 80 ? 1.65 : size < 140 ? 2.05 : 2.4);
  let dots;
  if (variant === 'diamond') dots = diamondDots({ size, dotR: dr });
  else if (variant === 'small') dots = buildFlowerDots({ petals: 6, size, dotR: dr });
  else dots = buildFlowerDots({ petals: 8, size, dotR: dr });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ opacity }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} />
      ))}
    </svg>
  );
}

export function ShapeSVG({ shape = 'circle', size = 60, color = '#EAB308', dotR, opacity = 1 }) {
  const dr = dotR ?? (size < 50 ? 1.5 : 1.9);
  const dots = shapeDots({ shape, size, dotR: dr });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ opacity }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} />
      ))}
    </svg>
  );
}

// ── Tile wrapper — filled color block like reference side panels ──

const TILE_COLORS = {
  orange: '#FF6B2C',
  pink:   '#E91E63',
  green:  '#0F5E2E',
  yellow: '#FFC107',
};

export function TileFlower({
  variant = 'lotus',
  tile = 'orange',
  tileColor,
  dotColor = '#FFFFFF',
  size = 110,
  rotate = 0,
  className = '',
  style = {},
  dotR,
  rounded = 'rounded-lg',
}) {
  const bg = tileColor || TILE_COLORS[tile] || tile;
  // inner flower slightly smaller than tile
  const inner = Math.round(size * 0.78);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex items-center justify-center border-2 border-brand-900 shadow-soft-sm ${rounded} ${className}`}
      style={{ width: size, height: size, background: bg, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <FlowerSVG variant={variant} size={inner} color={dotColor} dotR={dotR} />
    </div>
  );
}

export function TileShape({
  shape = 'diamond',
  tile = 'yellow',
  tileColor,
  dotColor = '#1A1A1A',
  size = 72,
  rotate = 0,
  className = '',
  style = {},
  dotR,
  rounded = 'rounded-lg',
}) {
  const bg = tileColor || TILE_COLORS[tile] || tile;
  const inner = Math.round(size * 0.70);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex items-center justify-center border-2 border-brand-900 shadow-soft-sm ${rounded} ${className}`}
      style={{ width: size, height: size, background: bg, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <ShapeSVG shape={shape} size={inner} color={dotColor} dotR={dotR} />
    </div>
  );
}

// ── Floating (no tile) flower — for large background ghosts ──

export default function DotMatrixFlower({
  size = 120,
  color = '#FFFFFF',
  opacity = 1,
  variant = 'lotus',
  rotate = 0,
  className = '',
  style = {},
  dotR,
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ display: 'inline-flex', transform: `rotate(${rotate}deg)`, opacity, ...style }}
    >
      <FlowerSVG variant={variant} size={size} color={color} dotR={dotR} opacity={1} />
    </div>
  );
}
