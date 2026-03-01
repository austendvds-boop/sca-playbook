type Props = {
  width?: number;
  height?: number;
};

export function FieldBackground({ width = 1000, height = 560 }: Props) {
  const midY = height / 2;

  return (
    <>
      <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />
      <rect x="0" y="0" width={width} height="90" fill="#F3F4F6" />
      <rect x="0" y={height - 90} width={width} height="90" fill="#F3F4F6" />

      {[120, 140, 160, 400, 420, 440].map((y) => (
        <line key={`hash-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      ))}

      <line x1={0} y1={midY} x2={width} y2={midY} stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
    </>
  );
}

