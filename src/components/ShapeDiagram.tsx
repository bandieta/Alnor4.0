import React from 'react';

// SVG shape diagrams for each shape type
// These are schematic technical drawings similar to the original WinForms pictureBox

interface ShapeDiagramProps {
  symbol: string;
  values: number[];
  labels: string[];
}

const ShapeDiagram: React.FC<ShapeDiagramProps> = ({ symbol, values, labels: _labels }) => {
  const width = 360;
  const height = 160;

  const renderShape = () => {
    switch (symbol) {
      case 'QDa': return renderRectangularDuct();
      case 'QBa':
      case 'QBNa': return renderSymmetricBend();
      case 'QPR6a':
      case 'QPR2a': return renderReducer();
      case 'PR1a':
      case 'PR7a': return renderSquareToRoundReducer();
      case 'QBRa':
      case 'QBR1a': return renderReductionBend();
      case 'QBFRa':
      case 'QBFa': return renderAngleBend();
      case 'QESa': return renderEndCap();
      case 'TR1a':
      case 'TR2a': return renderTeeJunction();
      case 'TRa': return renderSymmetricTee();
      case 'QPR3a':
      case 'QPR4a': return renderOffset();
      case 'TR6a': return renderPipeSaddle();
      case 'CZ1a':
      case 'CZ2a': return renderCrossJunction();
      case 'TR3a': return renderEagleTee();
      case 'TR4a': return renderRadiusTee();
      case 'TR5a': return renderPortTee();
      case 'QD1a': return renderAngledDuct();
      case 'QD2a': return renderPerpendicularDuct();
      case 'TR7a': return renderSkewTee();
      case 'TR8a':
      case 'TR9a': return renderCoaxialTee();
      default: return renderRectangularDuct();
    }
  };

  const renderRectangularDuct = () => {
    // Two-view technical drawing like the original: side view (L x b) + front cross-section (a x b)
    const a = values[0] || 200;
    const b = values[1] || 200;
    const l = values[2] || 500;

    // Normalize dimensions to fit the viewport
    const maxDim = Math.max(a, b, l);
    const scale = 90 / maxDim;
    let sa = Math.max(a * scale, 12);
    let sb = Math.max(b * scale, 12);
    let sl = Math.max(l * scale, 20);

    // Flange size proportional
    const p = Math.min(8, Math.max(4, sl * 0.08));

    // Side view position (left part)
    const sideX = 25;
    const sideY = Math.max(20, (height - sb) / 2 - 10);

    // Front cross-section position (right part)
    const frontX = sideX + sl + 60;
    const frontY = sideY;

    return (
      <g>
        {/* Side view - rectangular duct showing L × b */}
        <rect x={sideX} y={sideY} width={sl} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Left flange */}
        <line x1={sideX} y1={sideY - p} x2={sideX} y2={sideY + sb + p}
          stroke="#004290" strokeWidth={2.2} />
        {/* Left flange cap top */}
        <line x1={sideX - p} y1={sideY - p} x2={sideX + p} y2={sideY - p}
          stroke="#004290" strokeWidth={1.5} />
        {/* Left flange cap bottom */}
        <line x1={sideX - p} y1={sideY + sb + p} x2={sideX + p} y2={sideY + sb + p}
          stroke="#004290" strokeWidth={1.5} />

        {/* Right flange */}
        <line x1={sideX + sl} y1={sideY - p} x2={sideX + sl} y2={sideY + sb + p}
          stroke="#004290" strokeWidth={2.2} />
        {/* Right flange cap top */}
        <line x1={sideX + sl - p} y1={sideY - p} x2={sideX + sl + p} y2={sideY - p}
          stroke="#004290" strokeWidth={1.5} />
        {/* Right flange cap bottom */}
        <line x1={sideX + sl - p} y1={sideY + sb + p} x2={sideX + sl + p} y2={sideY + sb + p}
          stroke="#004290" strokeWidth={1.5} />

        {/* L dimension line (below side view) */}
        <line x1={sideX} y1={sideY + sb + p + 15} x2={sideX + sl} y2={sideY + sb + p + 15}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sideX + sl / 2} y={sideY + sb + p + 28}
          textAnchor="middle" fontSize={11} fill="#555555">L</text>

        {/* b dimension line (right of side view) */}
        <line x1={sideX + sl + p + 12} y1={sideY} x2={sideX + sl + p + 12} y2={sideY + sb}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sideX + sl + p + 26} y={sideY + sb / 2 + 4}
          textAnchor="middle" fontSize={11} fill="#555555">b</text>

        {/* Front cross-section view (a × b rectangle) */}
        <rect x={frontX} y={frontY} width={sa} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Front flange frame (larger rectangle around cross-section) */}
        <rect x={frontX - p} y={frontY - p} width={sa + 2 * p} height={sb + 2 * p}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />

        {/* a dimension line (above front view) */}
        <line x1={frontX} y1={frontY - p - 12} x2={frontX + sa} y2={frontY - p - 12}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={frontX + sa / 2} y={frontY - p - 16}
          textAnchor="middle" fontSize={11} fill="#555555">a</text>

        {/* View labels */}
        <text x={sideX + sl / 2} y={12} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>
        <text x={frontX + sa / 2} y={12} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
      </g>
    );
  };

  const renderSymmetricBend = () => (
    <g>
      {/* Bend path */}
      <path d="M 60,140 L 60,80 Q 60,30 110,30 L 300,30" fill="none" stroke="#004290" strokeWidth={2} />
      <path d="M 90,140 L 90,80 Q 90,60 110,60 L 300,60" fill="none" stroke="#004290" strokeWidth={2} />
      {/* a label */}
      <line x1={40} y1={140} x2={40} y2={80} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={30} y={110} textAnchor="middle" fontSize={11} fill="#555555">a</text>
      {/* b label */}
      <line x1={110} y1={15} x2={300} y2={15} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={205} y={12} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      {/* r label */}
      <text x={95} y={50} fontSize={11} fill="#555555">r</text>
    </g>
  );

  const renderReducer = () => (
    <g>
      {/* Larger end */}
      <line x1={60} y1={20} x2={60} y2={140} stroke="#004290" strokeWidth={2} />
      {/* Smaller end */}
      <line x1={300} y1={40} x2={300} y2={120} stroke="#004290" strokeWidth={2} />
      {/* Top slant */}
      <line x1={60} y1={20} x2={300} y2={40} stroke="#004290" strokeWidth={2} />
      {/* Bottom slant */}
      <line x1={60} y1={140} x2={300} y2={120} stroke="#004290" strokeWidth={2} />
      {/* a label */}
      <line x1={40} y1={20} x2={40} y2={140} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={30} y={85} textAnchor="middle" fontSize={11} fill="#555555">a</text>
      {/* b label */}
      <line x1={320} y1={40} x2={320} y2={120} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={335} y={85} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      {/* L label */}
      <line x1={60} y1={152} x2={300} y2={152} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={180} y={148} textAnchor="middle" fontSize={11} fill="#555555">L</text>
    </g>
  );

  const renderSquareToRoundReducer = () => (
    <g>
      {/* Square end */}
      <rect x={40} y={20} width={10} height={120} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Transition body */}
      <line x1={50} y1={20} x2={260} y2={50} stroke="#004290" strokeWidth={2} />
      <line x1={50} y1={140} x2={260} y2={110} stroke="#004290" strokeWidth={2} />
      {/* Round end */}
      <ellipse cx={270} cy={80} rx={12} ry={30} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <line x1={25} y1={20} x2={25} y2={140} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={15} y={85} textAnchor="middle" fontSize={11} fill="#555555">a</text>
      <line x1={300} y1={50} x2={300} y2={110} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={315} y={85} textAnchor="middle" fontSize={11} fill="#555555">d</text>
      <line x1={50} y1={152} x2={270} y2={152} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={160} y={148} textAnchor="middle" fontSize={11} fill="#555555">L</text>
    </g>
  );

  const renderReductionBend = () => (
    <g>
      <path d="M 60,140 L 60,80 Q 60,30 110,30 L 300,30" fill="none" stroke="#004290" strokeWidth={2} />
      <path d="M 80,140 L 80,80 Q 80,55 120,55 L 300,55" fill="none" stroke="#004290" strokeWidth={2} />
      <text x={30} y={110} fontSize={11} fill="#555555">a</text>
      <text x={200} y={22} fontSize={11} fill="#555555">d</text>
      <text x={95} y={50} fontSize={11} fill="#555555">r</text>
    </g>
  );

  const renderAngleBend = () => (
    <g>
      {/* L-shaped bend with sharp corners */}
      <polyline points="60,140 60,30 300,30" fill="none" stroke="#004290" strokeWidth={2} />
      <polyline points="90,140 90,60 300,60" fill="none" stroke="#004290" strokeWidth={2} />
      <line x1={60} y1={140} x2={90} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={300} y1={30} x2={300} y2={60} stroke="#004290" strokeWidth={2} />
      <text x={30} y={100} fontSize={11} fill="#555555">a</text>
      <text x={200} y={22} fontSize={11} fill="#555555">b</text>
    </g>
  );

  const renderEndCap = () => (
    <g>
      <rect x={100} y={30} width={160} height={100} fill="none" stroke="#004290" strokeWidth={2} />
      <line x1={100} y1={30} x2={260} y2={130} stroke="#004290" strokeWidth={1} strokeDasharray="4,4" />
      <line x1={260} y1={30} x2={100} y2={130} stroke="#004290" strokeWidth={1} strokeDasharray="4,4" />
      <text x={80} y={85} fontSize={11} fill="#555555">a</text>
      <text x={180} y={25} fontSize={11} fill="#555555">b</text>
    </g>
  );

  const renderTeeJunction = () => (
    <g>
      {/* Main duct */}
      <rect x={40} y={30} width={280} height={50} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Branch */}
      <rect x={130} y={80} width={50} height={60} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <line x1={40} y1={150} x2={320} y2={150} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={180} y={148} textAnchor="middle" fontSize={11} fill="#555555">L</text>
      <text x={25} y={60} fontSize={11} fill="#555555">a</text>
      <text x={115} y={115} fontSize={11} fill="#555555">d</text>
      <line x1={130} y1={82} x2={130} y2={140} stroke="#9b9b9b" strokeWidth={1} strokeDasharray="2,2" />
      <text x={335} y={60} fontSize={11} fill="#555555">b</text>
    </g>
  );

  const renderSymmetricTee = () => (
    <g>
      {/* Main horizontal duct */}
      <line x1={40} y1={50} x2={320} y2={50} stroke="#004290" strokeWidth={2} />
      <line x1={40} y1={80} x2={140} y2={80} stroke="#004290" strokeWidth={2} />
      <line x1={220} y1={80} x2={320} y2={80} stroke="#004290" strokeWidth={2} />
      {/* Branch down */}
      <line x1={140} y1={80} x2={140} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={220} y1={80} x2={220} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={140} y1={140} x2={220} y2={140} stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <text x={25} y={70} fontSize={11} fill="#555555">a</text>
      <text x={170} y={158} textAnchor="middle" fontSize={11} fill="#555555">d</text>
      <text x={180} y={42} textAnchor="middle" fontSize={11} fill="#555555">b</text>
    </g>
  );

  const renderOffset = () => (
    <g>
      {/* Offset duct shape */}
      <line x1={60} y1={30} x2={60} y2={60} stroke="#004290" strokeWidth={2} />
      <line x1={90} y1={30} x2={90} y2={60} stroke="#004290" strokeWidth={2} />
      <line x1={60} y1={60} x2={260} y2={110} stroke="#004290" strokeWidth={2} />
      <line x1={90} y1={60} x2={290} y2={110} stroke="#004290" strokeWidth={2} />
      <line x1={260} y1={110} x2={260} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={290} y1={110} x2={290} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={60} y1={30} x2={90} y2={30} stroke="#004290" strokeWidth={2} />
      <line x1={260} y1={140} x2={290} y2={140} stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <text x={40} y={50} fontSize={11} fill="#555555">a</text>
      <text x={300} y={130} fontSize={11} fill="#555555">b</text>
      <text x={180} y={75} fontSize={11} fill="#555555">L</text>
    </g>
  );

  const renderPipeSaddle = () => (
    <g>
      {/* Main pipe (circle) */}
      <circle cx={180} cy={80} r={50} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Saddle rectangle */}
      <rect x={140} y={25} width={80} height={20} fill="none" stroke="#004290" strokeWidth={2} />
      <text x={120} y={90} fontSize={11} fill="#555555">a</text>
      <text x={230} y={35} fontSize={11} fill="#555555">e</text>
    </g>
  );

  const renderCrossJunction = () => (
    <g>
      {/* Main horizontal duct */}
      <rect x={30} y={50} width={300} height={40} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Top branch */}
      <rect x={120} y={5} width={40} height={45} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Bottom branch */}
      <rect x={200} y={90} width={40} height={45} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <text x={15} y={75} fontSize={11} fill="#555555">a</text>
      <text x={170} y={158} textAnchor="middle" fontSize={11} fill="#555555">L</text>
      <text x={105} y={30} fontSize={11} fill="#555555">d</text>
      <text x={250} y={118} fontSize={11} fill="#555555">d1</text>
      <line x1={30} y1={150} x2={330} y2={150} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={345} y={75} fontSize={11} fill="#555555">b</text>
      {/* l3 dimension line (top branch) */}
      <line x1={165} y1={5} x2={165} y2={50} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2,2" />
      <text x={168} y={30} fontSize={9} fill="#555555">l3</text>
      {/* l4 dimension line (bottom branch) */}
      <text x={243} y={108} fontSize={9} fill="#555555">l4</text>
    </g>
  );

  const renderEagleTee = () => (
    <g>
      {/* Y-shape tee */}
      <line x1={180} y1={140} x2={180} y2={80} stroke="#004290" strokeWidth={2} />
      <line x1={180} y1={80} x2={100} y2={30} stroke="#004290" strokeWidth={2} />
      <line x1={180} y1={80} x2={260} y2={30} stroke="#004290" strokeWidth={2} />
      <line x1={165} y1={140} x2={165} y2={80} stroke="#004290" strokeWidth={2} />
      <line x1={165} y1={80} x2={85} y2={30} stroke="#004290" strokeWidth={2} />
      <line x1={195} y1={140} x2={195} y2={80} stroke="#004290" strokeWidth={2} />
      <line x1={195} y1={80} x2={275} y2={30} stroke="#004290" strokeWidth={2} />
      <text x={150} y={155} fontSize={11} fill="#555555">a</text>
      <text x={70} y={25} fontSize={11} fill="#555555">c</text>
      <text x={280} y={25} fontSize={11} fill="#555555">d</text>
    </g>
  );

  const renderRadiusTee = () => (
    <g>
      <rect x={40} y={40} width={280} height={40} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Curved branch */}
      <path d="M 160,80 Q 160,130 200,130" fill="none" stroke="#004290" strokeWidth={2} />
      <path d="M 200,80 Q 200,110 220,110 L 220,130" fill="none" stroke="#004290" strokeWidth={2} />
      <line x1={200} y1={130} x2={220} y2={130} stroke="#004290" strokeWidth={2} />
      <text x={20} y={65} fontSize={11} fill="#555555">a</text>
      <text x={180} y={35} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={230} y={115} fontSize={11} fill="#555555">d</text>
    </g>
  );

  const renderPortTee = () => (
    <g>
      {/* Main duct */}
      <rect x={40} y={40} width={280} height={40} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Port branch going down at angle */}
      <line x1={160} y1={80} x2={120} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={200} y1={80} x2={160} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={120} y1={140} x2={160} y2={140} stroke="#004290" strokeWidth={2} />
      <text x={20} y={65} fontSize={11} fill="#555555">a</text>
      <text x={180} y={35} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={100} y={120} fontSize={11} fill="#555555">e</text>
    </g>
  );

  const renderAngledDuct = () => (
    <g>
      {/* Angled rectangular duct */}
      <line x1={60} y1={30} x2={300} y2={30} stroke="#004290" strokeWidth={2} />
      <line x1={60} y1={30} x2={60} y2={130} stroke="#004290" strokeWidth={2} />
      <line x1={300} y1={30} x2={260} y2={130} stroke="#004290" strokeWidth={2} />
      <line x1={60} y1={130} x2={260} y2={130} stroke="#004290" strokeWidth={2} />
      <text x={40} y={85} fontSize={11} fill="#555555">a</text>
      <text x={180} y={25} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={180} y={148} textAnchor="middle" fontSize={11} fill="#555555">L</text>
      <text x={290} y={85} fontSize={10} fill="#555555">α</text>
    </g>
  );

  const renderPerpendicularDuct = () => (
    <g>
      <rect x={80} y={30} width={200} height={100} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Perpendicular inner lines */}
      <line x1={80} y1={60} x2={280} y2={60} stroke="#004290" strokeWidth={1} strokeDasharray="4,4" />
      <line x1={80} y1={100} x2={280} y2={100} stroke="#004290" strokeWidth={1} strokeDasharray="4,4" />
      <text x={60} y={85} fontSize={11} fill="#555555">a</text>
      <text x={180} y={25} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={180} y={152} textAnchor="middle" fontSize={11} fill="#555555">L</text>
    </g>
  );

  const renderSkewTee = () => (
    <g>
      {/* Main duct */}
      <rect x={40} y={40} width={280} height={35} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Skewed branch */}
      <line x1={180} y1={75} x2={140} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={220} y1={75} x2={180} y2={140} stroke="#004290" strokeWidth={2} />
      <line x1={140} y1={140} x2={180} y2={140} stroke="#004290" strokeWidth={2} />
      <text x={20} y={62} fontSize={11} fill="#555555">a</text>
      <text x={180} y={35} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={120} y={120} fontSize={11} fill="#555555">d</text>
    </g>
  );

  const renderCoaxialTee = () => (
    <g>
      {/* Main duct */}
      <rect x={40} y={50} width={280} height={40} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Coaxial branch up */}
      <rect x={130} y={5} width={50} height={45} fill="none" stroke="#004290" strokeWidth={2} />
      {/* Labels */}
      <text x={20} y={75} fontSize={11} fill="#555555">a</text>
      <text x={180} y={45} textAnchor="middle" fontSize={11} fill="#555555">b</text>
      <text x={115} y={30} fontSize={11} fill="#555555">w</text>
      <line x1={40} y1={100} x2={320} y2={100} stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
      <text x={180} y={115} textAnchor="middle" fontSize={11} fill="#555555">l</text>
    </g>
  );

  return (
    <div className="shape-diagram">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#555555" />
          </marker>
          <marker id="arrowhead-start" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto-start-reverse">
            <polygon points="6 0, 0 2, 6 4" fill="#555555" />
          </marker>
        </defs>
        {renderShape()}
      </svg>
    </div>
  );
};

export default ShapeDiagram;
