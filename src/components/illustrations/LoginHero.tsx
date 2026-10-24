import { Box, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { Block3D, BubbleMascot, MascotDefs, Tone } from './BubbleMascot';
import { Cloud, Sparkle, font } from './shared';

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-16px) rotate(3deg); }
`;
const rise = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateY(-640px); opacity: 0; }
`;
const drift = keyframes`
  from { transform: translateX(-24px); }
  to { transform: translateX(24px); }
`;

const tones: readonly Tone[] = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];

const bubbles = [
  { x: 120, r: 12, delay: 0, dur: 9 },
  { x: 260, r: 8, delay: 3, dur: 7 },
  { x: 420, r: 16, delay: 1.5, dur: 11 },
  { x: 560, r: 10, delay: 5, dur: 8 },
  { x: 690, r: 14, delay: 2.5, dur: 10 },
];

// Login hero: Bubbly mascots, toy blocks and a rainbow, all coloured by the selected theme
const LoginHero = () => (
  <Box
    sx={(theme) => ({
      position: 'relative',
      width: 1,
      height: 1,
      overflow: 'hidden',
      background: `linear-gradient(155deg, ${theme.vars.palette.primary.lighter} 0%, ${theme.vars.palette.background.elevation1} 48%, ${theme.vars.palette.secondary.lighter} 100%)`,
      '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important' } },
    })}
  >
    <Box
      component="svg"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="Friendly Bubbly mascots with toy blocks under a rainbow"
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: 1,
        height: '78%',
        ...Object.fromEntries(
          tones.flatMap((tone) => [
            [`& .c-${tone}`, { fill: theme.vars.palette[tone].main }],
            [`& .s-${tone}`, { stroke: theme.vars.palette[tone].main }],
            [`& .sl-${tone}`, { stopColor: theme.vars.palette[tone].light }],
            [`& .sm-${tone}`, { stopColor: theme.vars.palette[tone].main }],
            [`& .sd-${tone}`, { stopColor: theme.vars.palette[tone].dark }],
            [`& .sl-fill-${tone}`, { fill: theme.vars.palette[tone].light }],
            [`& .sd-fill-${tone}`, { fill: theme.vars.palette[tone].dark }],
          ]),
        ),
      })}
    >
      <defs>
        <MascotDefs tones={tones} />
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* soft glow and rainbow arch */}
      <circle cx={400} cy={470} r={330} fill="url(#glow)" opacity={0.7} />
      {(['error', 'warning', 'success', 'info', 'primary'] as const).map((tone, i) => (
        <path
          key={tone}
          d={`M${60 + i * 28} 700 A${340 - i * 28} ${340 - i * 28} 0 0 1 ${740 - i * 28} 700`}
          strokeWidth={26}
          fill="none"
          opacity={0.45}
          className={`s-${tone}`}
        />
      ))}

      <Box component="g" sx={{ animation: `${drift} 16s ease-in-out infinite alternate` }}>
        <Cloud x={70} y={190} s={1.1} />
      </Box>
      <Box component="g" sx={{ animation: `${drift} 20s ease-in-out infinite alternate-reverse` }}>
        <Cloud x={590} y={130} s={0.9} />
      </Box>

      {/* ground */}
      <ellipse cx={400} cy={770} rx={380} ry={34} className="c-primary" opacity={0.16} />

      {/* floating toy blocks */}
      <Box component="g" sx={{ animation: `${float} 6s ease-in-out infinite` }}>
        <Block3D x={90} y={360} size={72} letter="A" tone="info" rot={-10} />
      </Box>
      <Box component="g" sx={{ animation: `${float} 7s ease-in-out 1.2s infinite` }}>
        <Block3D x={650} y={330} size={66} letter="C" tone="success" rot={9} />
      </Box>
      <Box component="g" sx={{ animation: `${float} 6.5s ease-in-out 0.6s infinite` }}>
        <Block3D x={560} y={218} size={54} letter="B" tone="error" rot={-6} />
      </Box>

      {/* bubbles drift up behind the characters */}
      {bubbles.map((b, i) => (
        <Box
          key={i}
          component="g"
          sx={{ opacity: 0, animation: `${rise} ${b.dur}s linear ${b.delay}s infinite` }}
        >
          <circle
            cx={b.x}
            cy={760}
            r={b.r}
            fill="#fff"
            fillOpacity={0.35}
            stroke="#fff"
            strokeWidth={2}
          />
          <circle
            cx={b.x - b.r * 0.35}
            cy={760 - b.r * 0.35}
            r={b.r * 0.2}
            fill="#fff"
            opacity={0.9}
          />
        </Box>
      ))}

      {/* the Bubbly family */}
      <BubbleMascot cx={168} cy={640} r={86} tone="secondary" face="open" delay={1} />
      <BubbleMascot cx={640} cy={628} r={96} tone="warning" face="wink" delay={2} />
      <BubbleMascot cx={400} cy={560} r={178} tone="primary" face="smile" cap wave />

      {/* sparkles and drifting bubbles */}
      <Sparkle x={300} y={250} s={1.2} color="#fff" />
      <Sparkle x={700} y={470} s={1} color="#fff" />
      <Sparkle x={60} y={540} s={0.9} color="#fff" />
      <Sparkle x={500} y={190} s={0.8} color="#fff" />
    </Box>

    <Stack
      direction="column"
      sx={{
        position: 'absolute',
        top: { md: '13%' },
        left: { md: 48, lg: 64 },
        right: 48,
        gap: 1.5,
        zIndex: 1,
      }}
    >
      <Typography
        sx={{
          fontFamily: font,
          fontWeight: 800,
          fontSize: { md: 38, lg: 50 },
          lineHeight: 1.06,
          letterSpacing: '-1px',
          color: 'text.primary',
        }}
      >
        Welcome back!
      </Typography>
      <Typography
        sx={{
          fontFamily: font,
          fontWeight: 500,
          fontSize: { md: 15, lg: 18 },
          maxWidth: 380,
          color: 'text.secondary',
        }}
      >
        Every preschool, every little learner, all in one happy place.
      </Typography>
    </Stack>
  </Box>
);

export default LoginHero;
