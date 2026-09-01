import DotMatrixFlower from './DotMatrixFlower.jsx';

/**
 * Global ambient flower pattern for authenticated app pages.
 * Renders fixed, low-opacity yellow dot-matrix flowers in whitespace gaps.
 * Does not block interactions; purely decorative.
 */
export default function FlowerBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Large ghost flowers — like the big yellow flower behind the subject in reference */}
      <DotMatrixFlower size={380} color="#EAB308" variant="lotus" rotate={12} className="absolute -top-24 -right-24" style={{ opacity: 0.07 }} />
      <DotMatrixFlower size={320} color="#EAB308" variant="lotus" rotate={-18} className="absolute top-[42%] -left-28" style={{ opacity: 0.06 }} />
      <DotMatrixFlower size={260} color="#EAB308" variant="lotus" rotate={28} className="absolute bottom-12 right-[8%]" style={{ opacity: 0.065 }} />

      {/* Medium accent flowers in whitespace */}
      <DotMatrixFlower size={140} color="#EAB308" variant="lotus" rotate={0} className="absolute top-[18%] right-[22%]" style={{ opacity: 0.10 }} />
      <DotMatrixFlower size={110} color="#EAB308" variant="small" rotate={22} className="absolute top-[68%] left-[18%]" style={{ opacity: 0.09 }} />
      <DotMatrixFlower size={90} color="#EAB308" variant="diamond" rotate={0} className="absolute top-[28%] left-[6%]" style={{ opacity: 0.08 }} />
      <DotMatrixFlower size={90} color="#EAB308" variant="diamond" rotate={0} className="absolute bottom-[22%] right-[16%]" style={{ opacity: 0.07 }} />

      {/* Tiny scattered dots — rangoli dust */}
      <DotMatrixFlower size={64} color="#EAB308" variant="small" rotate={45} className="absolute top-[8%] left-[38%]" style={{ opacity: 0.08 }} />
      <DotMatrixFlower size={72} color="#EAB308" variant="small" rotate={-30} className="absolute bottom-[30%] left-[42%]" style={{ opacity: 0.06 }} />
    </div>
  );
}
