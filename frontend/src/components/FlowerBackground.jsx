import { TileFlower, TileShape, ShapeSVG } from './DotMatrixFlower.jsx';

/**
 * Global decorative pattern for authenticated app pages.
 * Filled tiles (orange/pink/green/yellow with white dot-matrix) + basic dot-matrix
 * shapes in the gaps — directly mirrors reference's tile side-panels.
 * Pointer-events none; never obstructs UI.
 */
export default function FlowerBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* ── Top cluster ── */}
      <div className="absolute top-16 right-6 hidden lg:flex items-center gap-2">
        <TileFlower tile="orange" variant="lotus" size={82} />
        <ShapeSVG shape="star" size={20} color="#1A1A1A" />
        <TileShape tile="pink" shape="square" size={60} />
      </div>

      {/* ── Left mid ── */}
      <div className="absolute top-[32%] left-3 hidden lg:flex flex-col items-center gap-2">
        <TileFlower tile="green" variant="diamond" size={72} />
        <ShapeSVG shape="circle" size={18} color="#1A1A1A" />
        <TileShape tile="yellow" shape="circle" size={52} dotColor="#880E4F" />
        <ShapeSVG shape="cross" size={16} color="#E91E63" />
      </div>

      {/* ── Right mid ── */}
      <div className="absolute top-[48%] right-3 hidden lg:flex flex-col items-center gap-2">
        <TileShape tile="orange" shape="star" size={52} />
        <ShapeSVG shape="triangle" size={16} color="#1A1A1A" />
        <TileFlower tile="pink" variant="small" size={64} />
      </div>

      {/* ── Bottom clusters ── */}
      <div className="absolute bottom-20 left-8 hidden md:flex items-center gap-2">
        <TileFlower tile="yellow" variant="small" size={62} dotColor="#880E4F" />
        <ShapeSVG shape="star" size={18} color="#1A1A1A" />
        <TileShape tile="green" shape="square" size={50} />
      </div>

      <div className="absolute bottom-10 right-12 hidden md:flex items-center gap-2">
        <TileShape tile="orange" shape="diamond" size={56} />
        <ShapeSVG shape="circle" size={16} color="#1A1A1A" />
        <TileFlower tile="pink" variant="lotus" size={68} />
      </div>

      {/* ── Scattered single basic shapes in open whitespace ── */}
      <div className="absolute top-[18%] left-[28%] hidden xl:block">
        <ShapeSVG shape="diamond" size={18} color="#1A1A1A" />
      </div>
      <div className="absolute top-[62%] left-[42%] hidden xl:block">
        <ShapeSVG shape="cross" size={20} color="#E91E63" />
      </div>
      <div className="absolute bottom-[36%] right-[28%] hidden xl:block">
        <ShapeSVG shape="circle" size={16} color="#0F5E2E" />
      </div>
      <div className="absolute top-[74%] right-[18%] hidden xl:block">
        <ShapeSVG shape="triangle" size={18} color="#1A1A1A" />
      </div>
    </div>
  );
}
