export function FieldBackground() {
  const W = 1000;
  const H = 560;
  const LOS = 320;

  const yardMarkers = [
    { y: LOS - 40, label: '5' },
    { y: LOS - 80, label: '10' },
    { y: LOS - 120, label: '15' },
    { y: LOS - 160, label: '20' },
    { y: LOS + 40, label: '5' },
    { y: LOS + 80, label: '10' }
  ];

  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill="#FFFFFF" />
      <rect x={0} y={0} width={W} height={60} fill="#F3F4F6" />
      <rect x={0} y={H - 60} width={W} height={60} fill="#F3F4F6" />

      <line x1={20} y1={0} x2={20} y2={H} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
      <line x1={980} y1={0} x2={980} y2={H} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />

      {yardMarkers.map((m) => (
        <g key={`${m.label}-${m.y}`}>
          <line x1={20} y1={m.y} x2={980} y2={m.y} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
          <text x={28} y={m.y - 4} fontSize={10} fontWeight="600" fill="rgba(0,0,0,0.45)" fontFamily="sans-serif">
            {m.label}
          </text>
        </g>
      ))}

      {[100, 140, 180, 220, 320, 360, 400, 440].map((y) => (
        <g key={y}>
          <line x1={440} y1={y} x2={480} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
          <line x1={520} y1={y} x2={560} y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
        </g>
      ))}

      <line x1={0} y1={LOS} x2={W} y2={LOS} stroke="#000000" strokeWidth={2.5} />
      <text x={18} y={LOS - 6} fontSize={11} fontWeight="700" fill="#000000" fontFamily="sans-serif">
        LOS
      </text>
    </>
  );
}
