import { Box, BoxProps } from '@mui/material';
import Kid from './Kid';
import { Balloon, Bubble, Cloud, Sparkle, Sun, font } from './shared';

const rainbow = ['#FF6B6B', '#FF9F43', '#FFD23F', '#4FD99B', '#4DB8FF', '#9B7BFF'];

const Block = ({
  x,
  y,
  letter,
  color,
  dark,
}: {
  x: number;
  y: number;
  letter: string;
  color: string;
  dark: string;
}) => (
  <g>
    <rect x={x} y={y} width={70} height={70} rx={12} fill={color} />
    <rect x={x} y={y + 54} width={70} height={16} rx={8} fill={dark} opacity={0.35} />
    <text
      x={x + 35}
      y={y + 50}
      textAnchor="middle"
      fontFamily={font}
      fontWeight={800}
      fontSize={44}
      fill="#fff"
    >
      {letter}
    </text>
  </g>
);

// Starter page: a sunny playground with a rainbow, ABC blocks, balloons and two kids
const PlaygroundScene = (props: BoxProps) => (
  <Box
    component="svg"
    viewBox="0 0 520 520"
    style={{ clipPath: 'inset(0 round 36px)' }}
    role="img"
    aria-label="Children playing with ABC blocks and balloons under a rainbow"
    {...props}
  >
    <circle cx={260} cy={270} r={238} fill="#FFB84D" opacity={0.16} />

    {/* rainbow */}
    {rainbow.map((color, i) => (
      <path
        key={color}
        d={`M${40 + i * 14} 300 A${130 - i * 14} ${130 - i * 14} 0 0 1 ${300 - i * 14} 300`}
        stroke={color}
        strokeWidth={15}
        fill="none"
        strokeLinecap="round"
        transform="translate(0 -30)"
      />
    ))}

    <Sun x={425} y={95} r={38} />
    <Cloud x={300} y={60} s={1.1} />
    <Cloud x={70} y={96} s={0.8} />
    <Cloud x={380} y={190} s={0.7} />

    {/* hills */}
    <ellipse cx={270} cy={500} rx={290} ry={96} fill="#6FD26B" />
    <ellipse cx={90} cy={515} rx={170} ry={70} fill="#52BE5E" />
    <ellipse cx={470} cy={520} rx={150} ry={64} fill="#52BE5E" />

    {/* ABC blocks */}
    <ellipse cx={295} cy={452} rx={92} ry={9} fill="#000" opacity={0.14} />
    <Block x={222} y={382} letter="A" color="#FF8A00" dark="#B35E00" />
    <Block x={294} y={382} letter="B" color="#2F9BEA" dark="#1A6BAA" />
    <Block x={258} y={312} letter="C" color="#F2546B" dark="#A82E42" />

    {/* kids */}
    <Balloon x={78} y={238} color="#FF6B81" stringTo={{ x: 124, y: 340 }} />
    <Balloon x={112} y={206} color="#FFD23F" stringTo={{ x: 124, y: 340 }} />
    <Balloon x={146} y={240} color="#4FD99B" stringTo={{ x: 124, y: 340 }} />
    <Kid
      x={164}
      y={462}
      skin="#F2C9A0"
      hair="#6B3E26"
      shirt="#4DB8FF"
      pants="#3A4A8C"
      hairStyle="pony"
      leftArm="up"
      rightArm="down"
    />
    <Kid
      x={410}
      y={462}
      skin="#8D5A3B"
      hair="#2B1B12"
      shirt="#FF8A00"
      pants="#5B4BC4"
      hairStyle="curly"
      leftArm="down"
      rightArm="wave"
    />

    {/* flowers and sparkles */}
    {[
      [60, 478, '#FF6B81'],
      [96, 492, '#FFD23F'],
      [486, 482, '#FF6B81'],
      [452, 496, '#fff'],
    ].map(([fx, fy, color]) => (
      <g key={`${fx}-${fy}`}>
        <line
          x1={Number(fx)}
          y1={Number(fy)}
          x2={Number(fx)}
          y2={Number(fy) + 14}
          stroke="#2E9A4B"
          strokeWidth={3}
        />
        <circle cx={Number(fx)} cy={Number(fy)} r={6} fill={String(color)} />
        <circle cx={Number(fx)} cy={Number(fy)} r={2.4} fill="#FFC21A" />
      </g>
    ))}
    <Sparkle x={210} y={250} s={1.2} />
    <Sparkle x={470} y={290} s={0.9} color="#FF6B8B" />
    <Sparkle x={36} y={330} s={0.8} color="#4DB8FF" />
    <Bubble x={360} y={140} r={13} />
    <Bubble x={338} y={250} r={9} color="#FF6B8B" />
    <Bubble x={60} y={170} r={10} color="#FFC21A" />
  </Box>
);

export default PlaygroundScene;
