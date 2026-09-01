/**
 * DotMatrixFlower — Nothing OS style dot-matrix floral decoration
 * Reference: warm rangoli/mandala flowers rendered purely with dots (circles)
 * Colors follow reference image: yellow (#FFC107) on varied backgrounds
 */

// Generate dot positions for a petal radiating from center
function petalDots(cx, cy, angleDeg, length, count, dotR) {
  const rad = (angleDeg * Math.PI) / 180;
  const dots = [];
  // Stem dots along petal length
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / count;
    const r = t * length;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    // Petal widens then narrows — two dots per ring offset
    const spread = Math.sin(t * Math.PI) * 6;
    const perp = rad + Math.PI / 2;
    if (i > 0 && i < count - 1) {
      dots.push({ x: x + Math.cos(perp) * spread, y: y + Math.sin(perp) * spread, r: dotR * 0.85 });
      dots.push({ x: x + Math.cos(perp) * -spread, y: y + Math.sin(perp) * -spread, r: dotR * 0.85 });
    }
    dots.push({ x, y, r: dotR });
  }
  // Petal tip dot
  const tipX = cx + Math.cos(rad) * (length + dotR * 1.2);
  const tipY = cy + Math.sin(rad) * (length + dotR * 1.2);
  dots.push({ x: tipX, y: tipY, r: dotR * 1.15 });
  return dots;
}

// Build a full flower from petals + center + inner ring
function buildFlowerDots({ petals = 8, size = 100, dotR = 2.2 }) {
  const cx = size / 2;
  const cy = size / 2;
  const petalLen = size * 0.32;
  const dots = [];

  // Center dot
  dots.push({ x: cx, y: cy, r: dotR * 1.25 });

  // Inner ring (around center)
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p;
    const rad = (a * Math.PI) / 180;
    const r = size * 0.09;
    dots.push({ x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, r: dotR * 0.9 });
  }

  // Second ring
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p + 360 / petals / 2;
    const rad = (a * Math.PI) / 180;
    const r = size * 0.16;
    dots.push({ x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, r: dotR * 0.82 });
  }

  // Petals
  for (let p = 0; p < petals; p++) {
    const angle = (360 / petals) * p - 90;
    const pdots = petalDots(cx, cy, angle, petalLen, 4, dotR);
    dots.push(...pdots);
  }

  // Outer accent dots between petals (tiny)
  for (let p = 0; p < petals; p++) {
    const a = (360 / petals) * p + 360 / petals / 2;
    const rad = (a * Math.PI) / 180;
    const r = size * 0.42;
    dots.push({ x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, r: dotR * 0.55 });
  }

  return { dots, cx, cy };
}

function DiamondDots({ size = 100, dotR = 2, color }) {
  // Diamond (tilted square) dot-matrix — like the pink/yellow tiles in reference
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const layers = 5;
  const dots = [];
  for (let l = 0; l < layers; l++) {
    const inset = (l / layers) * (s * 0.42);
    const pts = [
      [cx, inset],
      [s - inset, cy],
      [cx, s - inset],
      [inset, cy],
    ];
    // Edges: dots along each edge
    for (let e = 0; e < 4; e++) {
      const [x1, y1] = pts[e];
      const [x2, y2] = pts[(e + 1) % 4];
      const steps = l === 0 ? 1 : Math.max(2, Math.ceil((6 - l) * 1.2));
      for (let t = 0; t < steps; t++) {
        const f = steps === 1 ? 0.5 : t / (steps - 1);
        // first layer: corners only
        if (l === 0) {
          if (t !== 0) continue;
          dots.push({ x: x1, y: y1, r: dotR });
        } else {
          // interpolate
          const x = x1 + (x2 - x1) * f;
          const y = y1 + (y2 - y1) * f;
          // skip duplicate corners except first edge
          if (f === 0 && e > 0) continue;
          dots.push({ x, y, r: l < 2 ? dotR : dotR * 0.88 });
        }
      }
    }
  }
  // Center
  dots.push({ x: cx, y: cy, r: dotR * 0.9 });
  return dots;
}

export function FlowerSVG({ variant = 'lotus', size = 120, color = '#E8B800', dotR, opacity = 1 }) {
  const dr = dotR ?? (size < 80 ? 1.6 : size < 140 ? 2 : 2.4);
  let dots;
  if (variant === 'diamond') {
    dots = DiamondDots({ size, dotR: dr, color });
  } else if (variant === 'small') {
    const built = buildFlowerDots({ petals: 6, size, dotR: dr });
    dots = built.dots;
  } else {
    // lotus: 8 petals
    const built = buildFlowerDots({ petals: 8, size, dotR: dr });
    dots = built.dots;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ opacity }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} />
      ))}
    </svg>
  );
}

/**
 * Single decorative dot-matrix flower — absolute positioned.
 * Props: className for positioning, size, color, opacity, variant, rotate
 */
export default function DotMatrixFlower({
  size = 120,
  color = '#E8B800',
  opacity = 0.95,
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
