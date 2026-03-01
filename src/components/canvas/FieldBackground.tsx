export function FieldBackground() {
  const W = 1000;
  const H = 560;
  const LOS = 280;

  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />
      <rect x={0} y={0} width={W} height={60} fill="#F3F4F6" />
      <rect x={0} y={H - 60} width={W} height={60} fill="#F3F4F6" />

      {[100, 140, 180, 220, 320, 360, 400, 440].map((y) => (
        <g key={y}>
          <line x1={440} y1={y} x2={480} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
          <line x1={520} y1={y} x2={560} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
        </g>
      ))}

      <line x1={0} y1={LOS} x2={W} y2={LOS} stroke="#000000" strokeWidth={2.5} />
      <text x={18} y={LOS - 6} fontSize={11} fontWeight="700" fill="#000000" fontFamily="sans-serif">LOS</text>
    </>
  );
}
