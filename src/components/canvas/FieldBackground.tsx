type Props = {
  width?: number;
  height?: number;
};

export function FieldBackground({ width = 1000, height = 560 }: Props) {
  const midY = height / 2;

  return (
    <>
      <rect x="0" y="0" width={width} height={height} fill="#1C1C2E" />
      <rect x="0" y="0" width={width} height="90" fill="#252538" />
      <rect x="0" y={height - 90} width={width} height="90" fill="#252538" />

      {[120, 140, 160, 400, 420, 440].map((y) => (
        <line key={`hash-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}

      <line x1={0} y1={midY} x2={width} y2={midY} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
    </>
  );
}
