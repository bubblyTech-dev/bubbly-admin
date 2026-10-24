import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

export type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
export type Face = 'smile' | 'open' | 'wink';

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
`;
const blink = keyframes`
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
`;
const waveArm = keyframes`
  0%, 100% { transform: rotate(-14deg); }
  50% { transform: rotate(14deg); }
`;

// gradients for every tone; colours come from the theme through the classes set in LoginHero
export const MascotDefs = ({ tones }: { tones: readonly Tone[] }) => (
  <>
    {tones.map((tone) => (
      <radialGradient key={tone} id={`bubble-${tone}`} cx="36%" cy="28%" r="85%">
        <stop offset="0%" className={`sl-${tone}`} />
        <stop offset="55%" className={`sm-${tone}`} />
        <stop offset="100%" className={`sd-${tone}`} />
      </radialGradient>
    ))}
    {tones.map((tone) => (
      <linearGradient key={`cube-${tone}`} id={`cube-${tone}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" className={`sl-${tone}`} />
        <stop offset="100%" className={`sm-${tone}`} />
      </linearGradient>
    ))}
  </>
);

interface MascotProps {
  cx: number;
  cy: number;
  r: number;
  tone: Tone;
  face?: Face;
  cap?: boolean;
  wave?: boolean;
  delay?: number;
}

const ink = '#2B1B3D';

// A glossy, friendly bubble character
export const BubbleMascot = ({
  cx,
  cy,
  r,
  tone,
  face = 'smile',
  cap = false,
  wave = false,
  delay = 0,
}: MascotProps) => {
  const eyeX = r * 0.3;
  const eyeY = -r * 0.04;
  const fill = `url(#bubble-${tone})`;

  return (
    <g>
      {/* ground shadow stays put while the bubble bobs */}
      <ellipse cx={cx} cy={cy + r * 1.06} rx={r * 0.8} ry={r * 0.11} fill="#000" opacity={0.14} />
      <Box
        component="g"
        sx={{ animation: `${bob} ${4.2 + delay * 0.4}s ease-in-out ${delay}s infinite` }}
      >
        <g transform={`translate(${cx} ${cy})`}>
          {/* little feet */}
          <ellipse
            cx={-r * 0.3}
            cy={r * 0.98}
            rx={r * 0.2}
            ry={r * 0.11}
            className={`sd-fill-${tone}`}
          />
          <ellipse
            cx={r * 0.3}
            cy={r * 0.98}
            rx={r * 0.2}
            ry={r * 0.11}
            className={`sd-fill-${tone}`}
          />

          {/* arms */}
          <circle cx={-r * 0.97} cy={r * 0.2} r={r * 0.15} fill={fill} />
          {wave ? (
            <Box
              component="g"
              sx={{
                transformOrigin: `${r * 0.86}px ${r * 0.1}px`,
                animation: `${waveArm} 1.6s ease-in-out infinite`,
              }}
            >
              <circle cx={r * 1.02} cy={-r * 0.2} r={r * 0.16} fill={fill} />
            </Box>
          ) : (
            <circle cx={r * 0.97} cy={r * 0.2} r={r * 0.15} fill={fill} />
          )}

          {/* body */}
          <circle r={r} fill={fill} />
          <ellipse
            cx={-r * 0.38}
            cy={-r * 0.56}
            rx={r * 0.26}
            ry={r * 0.14}
            transform="rotate(-32)"
            fill="#fff"
            opacity={0.55}
          />
          <circle cx={-r * 0.62} cy={-r * 0.3} r={r * 0.05} fill="#fff" opacity={0.7} />

          {/* graduation cap */}
          {cap && (
            <g transform={`translate(0 ${-r * 0.86})`}>
              <path
                d={`M${-r * 0.42} ${r * 0.02} L0 ${r * 0.2} L${r * 0.42} ${r * 0.02} L${r * 0.38} ${r * 0.2} Q0 ${r * 0.36} ${-r * 0.38} ${r * 0.2}Z`}
                fill="#2B2D42"
              />
              <path
                d={`M${-r * 0.62} ${-r * 0.1} L0 ${-r * 0.34} L${r * 0.62} ${-r * 0.1} L0 ${r * 0.14}Z`}
                fill="#3A3D5C"
              />
              <path
                d={`M${r * 0.5} ${-r * 0.06} L${r * 0.5} ${r * 0.3}`}
                stroke="#FFC21A"
                strokeWidth={r * 0.035}
                strokeLinecap="round"
              />
              <circle cx={r * 0.5} cy={r * 0.33} r={r * 0.05} fill="#FFC21A" />
            </g>
          )}

          {/* face */}
          {face === 'wink' ? (
            <>
              <Eye x={-eyeX} y={eyeY} r={r} delay={delay} />
              <path
                d={`M${eyeX - r * 0.1} ${eyeY} Q${eyeX} ${eyeY - r * 0.1} ${eyeX + r * 0.1} ${eyeY}`}
                stroke={ink}
                strokeWidth={r * 0.045}
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            <>
              <Eye x={-eyeX} y={eyeY} r={r} delay={delay} />
              <Eye x={eyeX} y={eyeY} r={r} delay={delay} />
            </>
          )}
          <circle cx={-r * 0.5} cy={r * 0.2} r={r * 0.11} fill="#FF7F96" opacity={0.5} />
          <circle cx={r * 0.5} cy={r * 0.2} r={r * 0.11} fill="#FF7F96" opacity={0.5} />
          {face === 'open' ? (
            <>
              <path
                d={`M${-r * 0.16} ${r * 0.18} Q0 ${r * 0.5} ${r * 0.16} ${r * 0.18}Z`}
                fill={ink}
              />
              <path
                d={`M${-r * 0.08} ${r * 0.32} Q0 ${r * 0.24} ${r * 0.08} ${r * 0.32} Q0 ${r * 0.4} ${-r * 0.08} ${r * 0.32}Z`}
                fill="#FF7F96"
              />
            </>
          ) : (
            <path
              d={`M${-r * 0.15} ${r * 0.2} Q0 ${r * 0.36} ${r * 0.15} ${r * 0.2}`}
              stroke={ink}
              strokeWidth={r * 0.045}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>
      </Box>
    </g>
  );
};

const Eye = ({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) => (
  <Box
    component="g"
    sx={{
      transformOrigin: `${x}px ${y}px`,
      animation: `${blink} 5s ease-in-out ${delay}s infinite`,
    }}
  >
    <ellipse cx={x} cy={y} rx={r * 0.095} ry={r * 0.125} fill={ink} />
    <circle cx={x - r * 0.03} cy={y - r * 0.05} r={r * 0.04} fill="#fff" />
    <circle cx={x + r * 0.035} cy={y + r * 0.04} r={r * 0.018} fill="#fff" opacity={0.85} />
  </Box>
);

// A toy block with a visible top and side
export const Block3D = ({
  x,
  y,
  size,
  letter,
  tone,
  rot = 0,
}: {
  x: number;
  y: number;
  size: number;
  letter: string;
  tone: Tone;
  rot?: number;
}) => {
  const d = size * 0.26;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 L${d} ${-d} L${size + d} ${-d} L${size} 0Z`} className={`sl-fill-${tone}`} />
      <path
        d={`M${size} 0 L${size + d} ${-d} L${size + d} ${size - d} L${size} ${size}Z`}
        className={`sd-fill-${tone}`}
      />
      <rect width={size} height={size} rx={size * 0.1} fill={`url(#cube-${tone})`} />
      <text
        x={size / 2}
        y={size * 0.72}
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontWeight={800}
        fontSize={size * 0.58}
        fill="#fff"
      >
        {letter}
      </text>
    </g>
  );
};
