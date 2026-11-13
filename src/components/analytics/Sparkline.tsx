import { useId } from 'react';
import { Box } from '@mui/material';

interface SparklineProps {
  values: number[];
  height?: number;
}

// A tiny trend line for a KPI card. Drawn as SVG in the current text colour, so it follows the theme.
const Sparkline = ({ values, height = 36 }: SparklineProps) => {
  const id = useId();
  if (values.length < 2) return null;

  const width = 120;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => ({
    x: pad + (index / (values.length - 1)) * (width - pad * 2),
    y: height - pad - ((value - min) / span) * (height - pad * 2),
  }));
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`;
  const last = points[points.length - 1];

  return (
    <Box sx={{ color: 'primary.main', width: 1, height }} aria-hidden>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last.x} cy={last.y} r="2.6" fill="currentColor" />
      </svg>
    </Box>
  );
};

export default Sparkline;
