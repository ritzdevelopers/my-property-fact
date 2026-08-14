const CHAKRA_SPOKES = Array.from({ length: 24 }, (_, index) => index * 15);

/**
 * "80" Independence Day emblem for the home hero.
 * Drawn from geometry rather than a font so the mark keeps its proportions
 * regardless of which webfont has loaded.
 */
export default function IndependenceEmblem({ className = "" }) {
  return (
    <svg
      className={`i80-emblem ${className}`.trim()}
      viewBox="0 0 340 252"
      role="img"
      aria-label="Celebrating 80 years of Indian independence, 1947 to 2027"
      focusable="false"
    >
      <defs>
        <linearGradient id="i80Saffron" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F9A836" />
          <stop offset="55%" stopColor="#F08A1D" />
          <stop offset="100%" stopColor="#DE6F0B" />
        </linearGradient>
        <linearGradient id="i80Ring" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#F9A836" />
          <stop offset="38%" stopColor="#EF8A1C" />
          <stop offset="62%" stopColor="#1B8B45" />
          <stop offset="100%" stopColor="#0B5C2E" />
        </linearGradient>
      </defs>

      <g fill="none" strokeLinecap="round">
        <circle cx="76" cy="56" r="29" stroke="url(#i80Saffron)" strokeWidth="18" />
        <circle cx="76" cy="118" r="37" stroke="url(#i80Saffron)" strokeWidth="18" />
        <circle cx="214" cy="91" r="64" stroke="url(#i80Ring)" strokeWidth="18" />
      </g>

      <g className="i80-emblem__chakra">
        <circle cx="214" cy="91" r="48" fill="none" stroke="#0F2E62" strokeWidth="3.4" />
        <circle cx="214" cy="91" r="43" fill="none" stroke="#0F2E62" strokeWidth="1.2" opacity="0.55" />
        {CHAKRA_SPOKES.map((angle) => (
          <line
            key={angle}
            x1="214"
            y1="81"
            x2="214"
            y2="48"
            stroke="#0F2E62"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${angle} 214 91)`}
          />
        ))}
        <circle cx="214" cy="91" r="7.5" fill="#0F2E62" />
      </g>

      <text className="i80-emblem__th" x="300" y="42" textAnchor="middle" fill="#0B5C2E">
        TH
      </text>

      <text className="i80-emblem__label" x="170" y="206" textAnchor="middle" fill="#0F2E62">
        INDEPENDENCE DAY
      </text>

      {/* <g stroke="currentColor" strokeLinecap="round">
        <line x1="42" y1="234" x2="104" y2="234" stroke="#EF8A1C" strokeWidth="2.4" />
        <line x1="236" y1="234" x2="298" y2="234" stroke="#1B8B45" strokeWidth="2.4" />
      </g> */}

      {/* <text className="i80-emblem__years" x="170" y="240" textAnchor="middle" fill="#0F2E62">
        1947
        <tspan className="i80-emblem__dot" dx="9" dy="-1">
          •
        </tspan>
        <tspan dx="9" dy="1">
          2027
        </tspan>
      </text> */}
    </svg>
  );
}
