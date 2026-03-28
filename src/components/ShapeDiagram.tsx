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

        {/* Right flange */}
        <line x1={sideX + sl} y1={sideY - p} x2={sideX + sl} y2={sideY + sb + p}
          stroke="#004290" strokeWidth={2.2} />

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

  const renderSymmetricBend = () => {
    // QBa: 90° symmetric bend — parameters: a (width), b (duct depth), e (top leg), f (left leg), r (inner radius)
    const b = values[1] || 200;
    const e = values[2] || 150;
    const f = values[3] || 150;
    const r = values[4] || 200;

    // Scale to fit viewport with label margins
    // Vertical extent (relative to arc center): up = e + 16(label), down = r + b + 24(label)
    // Horizontal extent (relative to arc center): left = f + 3(flange), right = r + b + 22(label)
    const labelMarginV = 40; // top 16 + bottom 24
    const labelMarginH = 25; // left 3 + right 22
    const sc = Math.min(
      (height - labelMarginV) / (e + r + b),
      (width - labelMarginH) / (f + r + b)
    );
    const sb = b * sc;
    const se = e * sc;
    const sf = f * sc;
    const sr = r * sc;

    // Total drawing extents
    const drawH = se + 16 + sr + sb + 24;
    const drawW = sf + 3 + sr + sb + 22;

    // Origin: center of bend arc, positioned to center the drawing in viewBox
    const ox = (width - drawW) / 2 + sf + 3;
    const oy = (height - drawH) / 2 + se + 16;

    // Arc segments (inner and outer, from 0° to 90°—right to bottom)
    const arcSteps = 20;
    const innerArc: string[] = [];
    const outerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = (i / arcSteps) * Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerArc.push(`${ox + sr * cos},${oy + sr * sin}`);
      outerArc.push(`${ox + (sr + sb) * cos},${oy + (sr + sb) * sin}`);
    }

    // Vertical leg (top): from bend top upward by length e
    const vInnerX = ox + sr;       // inner wall x
    const vOuterX = ox + sr + sb;  // outer wall x
    const vTop = oy;               // bend top y
    const vTopEnd = vTop - se;     // top of vertical leg

    // Horizontal leg (left): from bend left leftward by length f
    const hInnerY = oy + sr;      // inner wall y
    const hOuterY = oy + sr + sb; // outer wall y
    const hLeft = ox;             // bend left x
    const hLeftEnd = hLeft - sf;  // end of horizontal leg

    return (
      <g>
        {/* Outer wall path: top leg → outer arc → left leg */}
        <polyline points={`${vOuterX},${vTopEnd} ${vOuterX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={outerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${hLeft},${hOuterY} ${hLeftEnd},${hOuterY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Inner wall path: top leg → inner arc → left leg */}
        <polyline points={`${vInnerX},${vTopEnd} ${vInnerX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${hLeft},${hInnerY} ${hLeftEnd},${hInnerY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges at leg ends */}
        {/* Top flange */}
        <line x1={vInnerX - 3} y1={vTopEnd} x2={vOuterX + 3} y2={vTopEnd} stroke="#004290" strokeWidth={2} />
        {/* Left flange */}
        <line x1={hLeftEnd} y1={hInnerY - 3} x2={hLeftEnd} y2={hOuterY + 3} stroke="#004290" strokeWidth={2} />

        {/* b dimension — across duct at top leg */}
        <line x1={vInnerX} y1={vTopEnd - 10} x2={vOuterX} y2={vTopEnd - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(vInnerX + vOuterX) / 2} y={vTopEnd - 13} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* e dimension — vertical leg length (right side) */}
        <line x1={vOuterX + 12} y1={vTopEnd} x2={vOuterX + 12} y2={vTop}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={vOuterX + 22} y={(vTopEnd + vTop) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* f dimension — horizontal leg length (below) */}
        <line x1={hLeftEnd} y1={hOuterY + 12} x2={hLeft} y2={hOuterY + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(hLeftEnd + hLeft) / 2} y={hOuterY + 24} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* r dimension — inner radius dashed line from center */}
        <line x1={ox} y1={oy} x2={ox + sr * 0.707} y2={oy + sr * 0.707}
          stroke="#9b9b9b" strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={ox + sr * 0.35 + 5} y={oy + sr * 0.35 + 2} fontSize={10} fill="#555555">r</text>

        {/* a label — at front cross-section (shown next to top flange) */}
        <text x={vInnerX - 14} y={vTopEnd + 12} fontSize={10} fill="#555555" textAnchor="end">a</text>

        {/* Centerline of bend (dashed) */}
        <line x1={ox} y1={oy} x2={ox + sr + sb / 2} y2={oy} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + sr + sb / 2} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />
      </g>
    );
  };

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
          <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="8" refY="2.5" orient="auto">
            <polygon points="0 0, 8 2.5, 0 5" fill="#555555" />
          </marker>
          <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="0" refY="2.5" orient="auto">
            <polygon points="8 0, 0 2.5, 8 5" fill="#555555" />
          </marker>
        </defs>
        {renderShape()}
      </svg>
    </div>
  );
};

export default ShapeDiagram;
