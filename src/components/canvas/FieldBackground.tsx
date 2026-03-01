type Props = {
  width?: number;
  height?: number;
};

export function FieldBackground({ width = 800, height = 600 }: Props) {
  const midY = height / 2;

  return (
    <>
      <rect x="0" y="0" width={width} height={height} fill="#1f7a3c" />
      <rect x="0" y="0" width={width} height={height} fill="none" stroke="#ffffff" strokeWidth="4" />
      {[...Array(13)].map((_, i) => (
        <line key={`yard-${i}`} x1={i * (width / 12)} y1={0} x2={i * (width / 12)} y2={height} stroke="#ffffff" opacity={0.45} />
      ))}
      {[120, 180, 420, 480].map((y) => (
        <line key={`hash-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#ffffff" opacity={0.25} />
      ))}
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="#ffffff" strokeWidth="3" opacity={0.95} />
      <text x={12} y={midY - 8} fill="#ffffff" fontSize="13" fontWeight="700" opacity={0.95}>
        LOS
      </text>
      <rect x="0" y="0" width="80" height={height} fill="#14532d" opacity={0.75} />
    </>
  );
}