type Props = {
  width?: number;
  height?: number;
};

export function FieldBackground({ width = 1000, height = 560 }: Props) {
  const midY = height / 2;

  return (
    <>
      <rect x="0" y="0" width={width} height={height} fill="#1C1C2E" />
      <rect x="0" y="0" width="90" height={height} fill="#252538" />
      <rect x={width - 90} y="0" width="90" height={height} fill="#252538" />
      <rect x="0" y="0" width={width} height={height} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {[...Array(11)].map((_, i) => {
        const x = 90 + i * ((width - 180) / 10);
        return <line key={`yard-${i}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.12)" />;
      })}

      {[120, 140, 160, 400, 420, 440].map((y) => (
        <line key={`hash-${y}`} x1={90} y1={y} x2={width - 90} y2={y} stroke="rgba(255,255,255,0.12)" />
      ))}

      <line x1={0} y1={midY} x2={width} y2={midY} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
    </>
  );
}
