// small building blocks shared by the preschool scenes
export const font = 'Poppins, "Plus Jakarta Sans", sans-serif';

export const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" stroke="#CFE6F7" strokeWidth={2}>
    <circle cx={0} cy={0} r={18} />
    <circle cx={22} cy={-8} r={24} />
    <circle cx={50} cy={0} r={18} />
    <rect x={-12} y={0} width={74} height={18} rx={9} stroke="none" />
    <rect x={-10} y={4} width={70} height={12} rx={6} stroke="none" />
  </g>
);

export const Sun = ({ x, y, r = 36 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 10 }).map((_, i) => (
      <line
        key={i}
        x1={0}
        y1={-(r + 8)}
        x2={0}
        y2={-(r + 20)}
        stroke="#FFC21A"
        strokeWidth={6}
        strokeLinecap="round"
        transform={`rotate(${i * 36})`}
      />
    ))}
    <circle r={r} fill="#FFD23F" />
    <circle cx={-r * 0.32} cy={-r * 0.1} r={r * 0.08} fill="#2B2118" />
    <circle cx={r * 0.32} cy={-r * 0.1} r={r * 0.08} fill="#2B2118" />
    <path
      d={`M${-r * 0.3} ${r * 0.2} Q0 ${r * 0.55} ${r * 0.3} ${r * 0.2}`}
      stroke="#2B2118"
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    <circle cx={-r * 0.55} cy={r * 0.2} r={r * 0.12} fill="#FF8FA3" opacity={0.6} />
    <circle cx={r * 0.55} cy={r * 0.2} r={r * 0.12} fill="#FF8FA3" opacity={0.6} />
  </g>
);

export const Balloon = ({
  x,
  y,
  color,
  stringTo,
}: {
  x: number;
  y: number;
  color: string;
  stringTo: { x: number; y: number };
}) => (
  <g>
    <path
      d={`M${x} ${y + 26} Q${(x + stringTo.x) / 2 + 8} ${(y + stringTo.y) / 2} ${stringTo.x} ${stringTo.y}`}
      stroke="#7A6A5A"
      strokeWidth={1.8}
      fill="none"
    />
    <ellipse cx={x} cy={y} rx={20} ry={25} fill={color} />
    <path d={`M${x - 3} ${y + 25} l3 6 l3 -6z`} fill={color} />
    <ellipse
      cx={x - 7}
      cy={y - 9}
      rx={4}
      ry={7}
      transform={`rotate(25 ${x - 7} ${y - 9})`}
      fill="#fff"
      opacity={0.45}
    />
  </g>
);

export const Sparkle = ({
  x,
  y,
  s = 1,
  color = '#FFC21A',
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10z"
    fill={color}
  />
);

export const Bubble = ({
  x,
  y,
  r,
  color = '#4DB8FF',
}: {
  x: number;
  y: number;
  r: number;
  color?: string;
}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.38} stroke={color} strokeWidth={2} />
    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.18} fill="#fff" opacity={0.8} />
  </g>
);
