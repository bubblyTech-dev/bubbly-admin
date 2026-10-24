// A simple friendly child for the preschool illustrations. Origin (0,0) is the point between the feet.
export type HairStyle = 'bob' | 'curly' | 'pony' | 'buzz';
export type ArmPose = 'down' | 'up' | 'wave';

interface KidProps {
  x: number;
  y: number;
  scale?: number;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  hairStyle?: HairStyle;
  leftArm?: ArmPose;
  rightArm?: ArmPose;
}

const ink = '#2B2118';

const armEnd = (pose: ArmPose, side: 1 | -1) => {
  if (pose === 'up') return { x: 40 * side, y: -122 };
  if (pose === 'wave') return { x: 42 * side, y: -108 };
  return { x: 34 * side, y: -60 };
};

const Arm = ({
  pose,
  side,
  shirt,
  skin,
}: {
  pose: ArmPose;
  side: 1 | -1;
  shirt: string;
  skin: string;
}) => {
  const end = armEnd(pose, side);
  return (
    <g>
      <line
        x1={20 * side}
        y1={-90}
        x2={end.x}
        y2={end.y}
        stroke={shirt}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <circle cx={end.x} cy={end.y} r={7.5} fill={skin} />
    </g>
  );
};

const Hair = ({ style, color }: { style: HairStyle; color: string }) => (
  <g fill={color}>
    <circle cx={0} cy={-128} r={28} />
    {style === 'bob' && (
      <>
        <rect x={-29} y={-130} width={13} height={34} rx={6.5} />
        <rect x={16} y={-130} width={13} height={34} rx={6.5} />
      </>
    )}
    {style === 'curly' && (
      <>
        <circle cx={-24} cy={-132} r={11} />
        <circle cx={24} cy={-132} r={11} />
        <circle cx={-14} cy={-148} r={11} />
        <circle cx={14} cy={-148} r={11} />
        <circle cx={0} cy={-152} r={11} />
      </>
    )}
    {style === 'pony' && (
      <>
        <circle cx={26} cy={-142} r={11} />
        <rect x={19} y={-146} width={7} height={9} rx={3} fill="#FF6B8B" />
      </>
    )}
  </g>
);

const Kid = ({
  x,
  y,
  scale = 1,
  skin,
  hair,
  shirt,
  pants,
  hairStyle = 'buzz',
  leftArm = 'down',
  rightArm = 'down',
}: KidProps) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={0.12} />
    {/* legs and shoes */}
    <rect x={-17} y={-50} width={15} height={44} rx={7} fill={pants} />
    <rect x={2} y={-50} width={15} height={44} rx={7} fill={pants} />
    <ellipse cx={-10} cy={-4} rx={11} ry={5.5} fill="#3B2F2F" />
    <ellipse cx={10} cy={-4} rx={11} ry={5.5} fill="#3B2F2F" />
    {/* arms behind body when raised, in front otherwise */}
    <Arm pose={leftArm} side={-1} shirt={shirt} skin={skin} />
    <Arm pose={rightArm} side={1} shirt={shirt} skin={skin} />
    {/* body */}
    <rect x={-22} y={-102} width={44} height={58} rx={17} fill={shirt} />
    <circle cx={0} cy={-80} r={4} fill="#fff" opacity={0.55} />
    <circle cx={0} cy={-66} r={4} fill="#fff" opacity={0.55} />
    {/* head */}
    <Hair style={hairStyle} color={hair} />
    <circle cx={0} cy={-122} r={25} fill={skin} />
    <circle cx={-9} cy={-124} r={3.2} fill={ink} />
    <circle cx={9} cy={-124} r={3.2} fill={ink} />
    <circle cx={-8} cy={-125} r={1} fill="#fff" />
    <circle cx={10} cy={-125} r={1} fill="#fff" />
    <path
      d="M-9 -113 Q0 -103 9 -113"
      stroke={ink}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
    <circle cx={-17} cy={-114} r={5} fill="#FF8FA3" opacity={0.55} />
    <circle cx={17} cy={-114} r={5} fill="#FF8FA3" opacity={0.55} />
  </g>
);

export default Kid;
