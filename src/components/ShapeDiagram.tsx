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
      case 'QPR6a': return renderReducer();
      case 'QPR2a': return renderAsymReducer();
      case 'PR1a': return renderSquareToRoundReducer();
      case 'PR7a': return renderAsymSquareToRoundReducer();
      case 'QBRa': return renderReductionBendParametric();
      case 'QBR1a': return renderDiffuserBend();
      case 'QBFRa': return renderReductionElbow();
      case 'QBFa': return renderAngleBend();
      case 'QESa': return renderEndCap();
      case 'TR1a': return renderTR1a();
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
    // QBa/QBNa: symmetric bend — parameters: a, b, e, f, r, alfa (degrees)
    const a = values[0] || 200;
    const b = values[1] || 200;
    const e = values[2] || 150;
    const f = values[3] || 150;
    const r = values[4] || 200;
    const alfa = (symbol === 'QBNa' && values[5]) ? values[5] : 90;
    const alfaRad = (alfa * Math.PI) / 180;

    // --- Left part: side view of the bend (use ~60% of width) ---
    const bendAreaW = width * 0.6;

    // F-leg direction (tangent at arc end)
    const fDirX = -Math.sin(alfaRad); // in drawing coords: left-ish
    const fDirY = Math.cos(alfaRad);  // in drawing coords: down-ish

    // Compute bounding box of the bend in real units (before scaling)
    // E-leg: extends from (r, 0) to (r+b, -e) — always vertical up
    // Arc: from angle 0 to alfa, radius r to r+b
    // F-leg: from arc end, extends along fDir by length f
    const arcEndIx = r * Math.cos(alfaRad);
    const arcEndIy = r * Math.sin(alfaRad);
    const arcEndOx = (r + b) * Math.cos(alfaRad);
    const arcEndOy = (r + b) * Math.sin(alfaRad);
    const fEndIx = arcEndIx + fDirX * f;
    const fEndIy = arcEndIy + fDirY * f;
    const fEndOx = arcEndOx + fDirX * f;
    const fEndOy = arcEndOy + fDirY * f;

    // Gather all x,y points to find bounds
    const allX = [r, r + b, arcEndIx, arcEndOx, fEndIx, fEndOx, 0];
    const allY = [-e, 0, arcEndIy, arcEndOy, fEndIy, fEndOy, r + b];
    // Add arc extremes
    for (let i = 0; i <= 20; i++) {
      const ang = (i / 20) * alfaRad;
      allX.push((r + b) * Math.cos(ang));
      allY.push((r + b) * Math.sin(ang));
    }
    const realMinX = Math.min(...allX);
    const realMaxX = Math.max(...allX);
    const realMinY = Math.min(...allY);
    const realMaxY = Math.max(...allY);
    const realW = realMaxX - realMinX;
    const realH = realMaxY - realMinY;

    const labelMarginV = 44;
    const labelMarginH = 30;
    const sc = Math.min(
      (height - labelMarginV) / realH,
      (bendAreaW - labelMarginH) / realW
    );
    const sb = b * sc;
    const se = e * sc;
    const sf = f * sc;
    const sr = r * sc;

    // Scaled bounds
    const sMinX = realMinX * sc;
    const sMaxX = realMaxX * sc;
    const sMinY = realMinY * sc;
    const sMaxY = realMaxY * sc;
    const sW = sMaxX - sMinX;
    const sH = sMaxY - sMinY;

    // Origin (arc center) in SVG coords — center the drawing in the left area
    const ox = (bendAreaW - sW) / 2 - sMinX + 5;
    const oy = (height - sH) / 2 - sMinY + 8;

    // Arc segments
    const arcSteps = 20;
    const innerArc: string[] = [];
    const outerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = (i / arcSteps) * alfaRad;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerArc.push(`${ox + sr * cos},${oy + sr * sin}`);
      outerArc.push(`${ox + (sr + sb) * cos},${oy + (sr + sb) * sin}`);
    }

    // E-leg (vertical, at angle=0 direction → extends in -y)
    const vInnerX = ox + sr;
    const vOuterX = ox + sr + sb;
    const vTop = oy;
    const vTopEnd = vTop - se;

    // F-leg (along alfa direction)
    const fIStartX = ox + sr * Math.cos(alfaRad);
    const fIStartY = oy + sr * Math.sin(alfaRad);
    const fOStartX = ox + (sr + sb) * Math.cos(alfaRad);
    const fOStartY = oy + (sr + sb) * Math.sin(alfaRad);
    const sfDirX = -Math.sin(alfaRad);
    const sfDirY = Math.cos(alfaRad);
    const fIEndX = fIStartX + sfDirX * sf;
    const fIEndY = fIStartY + sfDirY * sf;
    const fOEndX = fOStartX + sfDirX * sf;
    const fOEndY = fOStartY + sfDirY * sf;

    // Flange perpendicular direction at f-leg end
    const flangeNX = Math.cos(alfaRad);
    const flangeNY = Math.sin(alfaRad);

    // --- Right part: cross-section (a × b) ---
    const crossAreaX = bendAreaW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / Math.max(a, b);
    const ca = Math.max(a * crossScale, 14);
    const cb = Math.max(b * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        {/* === SIDE VIEW (left) === */}
        {/* Outer wall: e-leg → arc → f-leg */}
        <polyline points={`${vOuterX},${vTopEnd} ${vOuterX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={outerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${fOStartX},${fOStartY} ${fOEndX},${fOEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Inner wall: e-leg → arc → f-leg */}
        <polyline points={`${vInnerX},${vTopEnd} ${vInnerX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${fIStartX},${fIStartY} ${fIEndX},${fIEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges */}
        {/* E-leg flange (perpendicular to leg = horizontal) */}
        <line x1={vInnerX - 3} y1={vTopEnd} x2={vOuterX + 3} y2={vTopEnd} stroke="#004290" strokeWidth={2} />
        {/* F-leg flange (perpendicular to f-direction) */}
        <line x1={fIEndX - flangeNX * 3} y1={fIEndY - flangeNY * 3}
              x2={fOEndX + flangeNX * 3} y2={fOEndY + flangeNY * 3} stroke="#004290" strokeWidth={2} />

        {/* b dimension — across duct at e-leg top */}
        <line x1={vInnerX} y1={vTopEnd - 10} x2={vOuterX} y2={vTopEnd - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(vInnerX + vOuterX) / 2} y={vTopEnd - 13} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* e dimension — along e-leg (right side) */}
        <line x1={vOuterX + 12} y1={vTopEnd} x2={vOuterX + 12} y2={vTop}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={vOuterX + 22} y={(vTopEnd + vTop) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* f dimension — along f-leg (offset outward) */}
        {(() => {
          const fOffset = 12;
          const fDimStartX = fOStartX + flangeNX * fOffset;
          const fDimStartY = fOStartY + flangeNY * fOffset;
          const fDimEndX = fOEndX + flangeNX * fOffset;
          const fDimEndY = fOEndY + flangeNY * fOffset;
          const fLabelX = (fDimStartX + fDimEndX) / 2 + flangeNX * 10;
          const fLabelY = (fDimStartY + fDimEndY) / 2 + flangeNY * 10;
          return (
            <>
              <line x1={fDimStartX} y1={fDimStartY} x2={fDimEndX} y2={fDimEndY}
                stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
              <text x={fLabelX} y={fLabelY} textAnchor="middle" fontSize={10} fill="#555555">f</text>
            </>
          );
        })()}

        {/* r dimension — inner radius dashed line */}
        {(() => {
          const midAngle = alfaRad / 2;
          return (
            <>
              <line x1={ox} y1={oy} x2={ox + sr * Math.cos(midAngle)} y2={oy + sr * Math.sin(midAngle)}
                stroke="#9b9b9b" strokeWidth={0.8} strokeDasharray="3 2" />
              <text x={ox + sr * 0.45 * Math.cos(midAngle) + 3} y={oy + sr * 0.45 * Math.sin(midAngle)} fontSize={10} fill="#555555">r</text>
            </>
          );
        })()}

        {/* alfa arc indicator (only for QBNa) */}
        {alfa !== 90 && (() => {
          const arcR = sr * 0.3;
          const arcPts: string[] = [];
          for (let i = 0; i <= 10; i++) {
            const ang = (i / 10) * alfaRad;
            arcPts.push(`${ox + arcR * Math.cos(ang)},${oy + arcR * Math.sin(ang)}`);
          }
          return (
            <>
              <polyline points={arcPts.join(' ')} fill="none" stroke="#9b9b9b" strokeWidth={0.6} />
              <text x={ox + arcR * 1.3 * Math.cos(alfaRad / 2)} y={oy + arcR * 1.3 * Math.sin(alfaRad / 2)}
                textAnchor="middle" fontSize={9} fill="#555555">{`α=${Math.round(alfa)}°`}</text>
            </>
          );
        })()}

        {/* Centerline of bend (dashed) */}
        <line x1={ox} y1={oy} x2={ox + sr + sb / 2} y2={oy} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />
        <line x1={ox} y1={oy} x2={ox + (sr + sb / 2) * Math.cos(alfaRad)} y2={oy + (sr + sb / 2) * Math.sin(alfaRad)}
          stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />

        {/* Side view label */}
        <text x={bendAreaW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>

        {/* === CROSS-SECTION (right) === */}
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />

        {/* a dimension (above cross-section) */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* b dimension (right of cross-section) */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* Cross-section label */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
      </g>
    );
  };

  const renderReducer = () => {
    const a = values[0] || 200;   // front width
    const b = values[1] || 200;   // front height
    const c = values[2] || 150;   // rear width
    const d = values[3] || 150;   // rear height
    const l = values[4] || 500;   // total length
    const h = values[5] || 80;    // front straight section
    const m = values[6] || 80;    // rear straight section

    const maxDim = Math.max(a, b, c, d, l);
    const sc = 105 / maxDim;
    const sb = Math.max(b * sc, 12);
    const sd = Math.max(d * sc, 12);
    const sl = Math.max(l * sc, 20);
    const sh = h * sc;
    const sm = m * sc;
    const sa = Math.max(a * sc, 12);
    const sCross = Math.max(c * sc, 8);

    const p = Math.min(8, Math.max(4, sb * 0.1));

    // Side view
    const svX = 25;
    const svCY = height / 2;
    const svT1 = svCY - sb / 2;  // front top
    const svB1 = svCY + sb / 2;  // front bottom
    const svT2 = svCY - sd / 2;  // rear top
    const svB2 = svCY + sd / 2;  // rear bottom

    const dimTopY = Math.min(svT1, svT2) - p - 10;
    const dimBotY = Math.max(svB1, svB2) + p + 15;

    // Cross-section position
    const crossX = svX + sl + 45;
    const crossY = svCY - sb / 2;

    return (
      <g>
        {/* View labels */}
        <text x={svX + sl / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>
        <text x={crossX + sa / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* === Side view === */}
        {/* Front vertical + flange */}
        <line x1={svX} y1={svT1 - p} x2={svX} y2={svB1 + p} stroke="#004290" strokeWidth={2.2} />
        {/* Front straight — top */}
        <line x1={svX} y1={svT1} x2={svX + sh} y2={svT1} stroke="#004290" strokeWidth={1.8} />
        {/* Front straight — bottom */}
        <line x1={svX} y1={svB1} x2={svX + sh} y2={svB1} stroke="#004290" strokeWidth={1.8} />
        {/* Taper — top */}
        <line x1={svX + sh} y1={svT1} x2={svX + sl - sm} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        {/* Taper — bottom */}
        <line x1={svX + sh} y1={svB1} x2={svX + sl - sm} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear straight — top */}
        <line x1={svX + sl - sm} y1={svT2} x2={svX + sl} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear straight — bottom */}
        <line x1={svX + sl - sm} y1={svB2} x2={svX + sl} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear vertical + flange */}
        <line x1={svX + sl} y1={svT2 - p} x2={svX + sl} y2={svB2 + p} stroke="#004290" strokeWidth={2.2} />

        {/* Dashed division lines at h and L-m */}
        {sh > 1 && (
          <line x1={svX + sh} y1={svT1} x2={svX + sh} y2={svB1}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}
        {sm > 1 && (
          <line x1={svX + sl - sm} y1={svT2} x2={svX + sl - sm} y2={svB2}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}

        {/* b dimension — left (front height) */}
        <line x1={svX - 16} y1={svT1} x2={svX - 16} y2={svB1}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX - 20} y={svCY + 4} textAnchor="end" fontSize={11} fill="#555555">b</text>

        {/* d dimension — right (rear height) */}
        <line x1={svX + sl + 16} y1={svT2} x2={svX + sl + 16} y2={svB2}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl + 28} y={svCY + 4} textAnchor="start" fontSize={11} fill="#555555">d</text>

        {/* L dimension — below */}
        <line x1={svX} y1={dimBotY} x2={svX + sl} y2={dimBotY}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl / 2} y={dimBotY + 13} textAnchor="middle" fontSize={11} fill="#555555">L</text>

        {/* h dimension — above front section */}
        {sh > 3 && (
          <>
            <line x1={svX} y1={dimTopY} x2={svX + sh} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sh / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}

        {/* m dimension — above rear section */}
        {sm > 3 && (
          <>
            <line x1={svX + sl - sm} y1={dimTopY} x2={svX + sl} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sl - sm / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}

        {/* === Cross-section: front a×b solid, rear c×d dashed === */}
        <rect x={crossX} y={crossY} width={sa} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Flange frame */}
        <rect x={crossX - p} y={crossY - p} width={sa + 2 * p} height={sb + 2 * p}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Rear opening c×d dashed inside */}
        <rect x={crossX + (sa - sCross) / 2} y={crossY + (sb - sd) / 2} width={sCross} height={sd}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension above cross-section */}
        <line x1={crossX} y1={crossY - p - 12} x2={crossX + sa} y2={crossY - p - 12}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + sa / 2} y={crossY - p - 16} textAnchor="middle" fontSize={11} fill="#555555">a</text>

        {/* c label near dashed inner rect */}
        <text x={crossX + (sa + sCross) / 2 + 6} y={svCY + 4}
          textAnchor="start" fontSize={10} fill="#9b9b9b">c</text>
      </g>
    );
  };

  const renderAsymReducer = () => {
    // QPR2a: asymmetric reducer
    // labels: a, b, c, d, L, h, m, e, f
    const a = values[0] || 200;
    const b = values[1] || 200;
    const c = values[2] || 150;
    const d = values[3] || 150;
    const l = values[4] || 500;
    const h = values[5] || 80;
    const m = values[6] || 80;
    const e = values[7] || 20;  // offset from top
    const f = values[8] || 20;  // offset from left

    const maxDim = Math.max(a, b, c, d, l);
    const sc = 105 / maxDim;
    const sb = Math.max(b * sc, 12);
    const sd = Math.max(d * sc, 12);
    const sl = Math.max(l * sc, 20);
    const sh = h * sc;
    const sm = m * sc;
    const sa = Math.max(a * sc, 12);
    const sCross = Math.max(c * sc, 8);
    const se = e * sc;
    const sf = f * sc;

    const p = Math.min(8, Math.max(4, sb * 0.1));

    // Side view — rear rect is offset vertically by e
    const svX = 25;
    const svCY = height / 2;
    const svT1 = svCY - sb / 2;
    const svB1 = svCY + sb / 2;
    // Rear rect top = front top + se, rear bottom = rear top + sd
    const svT2 = svT1 + se;
    const svB2 = svT2 + sd;

    const dimTopY = Math.min(svT1, svT2) - p - 10;
    const dimBotY = Math.max(svB1, svB2) + p + 15;

    const crossX = svX + sl + 45;
    const crossY = svCY - sb / 2;

    return (
      <g>
        <text x={svX + sl / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>
        <text x={crossX + sa / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* Front vertical + flange */}
        <line x1={svX} y1={svT1 - p} x2={svX} y2={svB1 + p} stroke="#004290" strokeWidth={2.2} />
        <line x1={svX} y1={svT1} x2={svX + sh} y2={svT1} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX} y1={svB1} x2={svX + sh} y2={svB1} stroke="#004290" strokeWidth={1.8} />
        {/* Asymmetric taper */}
        <line x1={svX + sh} y1={svT1} x2={svX + sl - sm} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sh} y1={svB1} x2={svX + sl - sm} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sl - sm} y1={svT2} x2={svX + sl} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sl - sm} y1={svB2} x2={svX + sl} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sl} y1={svT2 - p} x2={svX + sl} y2={svB2 + p} stroke="#004290" strokeWidth={2.2} />

        {sh > 1 && (
          <line x1={svX + sh} y1={svT1} x2={svX + sh} y2={svB1}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}
        {sm > 1 && (
          <line x1={svX + sl - sm} y1={svT2} x2={svX + sl - sm} y2={svB2}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}

        {/* b dimension — left */}
        <line x1={svX - 16} y1={svT1} x2={svX - 16} y2={svB1}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX - 20} y={svCY + 4} textAnchor="end" fontSize={11} fill="#555555">b</text>

        {/* d dimension — right */}
        <line x1={svX + sl + 16} y1={svT2} x2={svX + sl + 16} y2={svB2}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl + 28} y={(svT2 + svB2) / 2 + 4} textAnchor="start" fontSize={11} fill="#555555">d</text>

        {/* L dimension */}
        <line x1={svX} y1={dimBotY} x2={svX + sl} y2={dimBotY}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl / 2} y={dimBotY + 13} textAnchor="middle" fontSize={11} fill="#555555">L</text>

        {sh > 3 && (
          <>
            <line x1={svX} y1={dimTopY} x2={svX + sh} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sh / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}
        {sm > 3 && (
          <>
            <line x1={svX + sl - sm} y1={dimTopY} x2={svX + sl} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sl - sm / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}

        {/* Cross-section: front a×b solid, rear c×d dashed offset */}
        <rect x={crossX} y={crossY} width={sa} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - p} y={crossY - p} width={sa + 2 * p} height={sb + 2 * p}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Rear c×d dashed offset by e,f */}
        <rect x={crossX + sf} y={crossY + se} width={sCross} height={sd}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - p - 12} x2={crossX + sa} y2={crossY - p - 12}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + sa / 2} y={crossY - p - 16} textAnchor="middle" fontSize={11} fill="#555555">a</text>

        {/* e dimension (right side) */}
        {se > 2 && (
          <>
            <line x1={crossX + sf + sCross + 6} y1={crossY} x2={crossX + sf + sCross + 6} y2={crossY + se}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={crossX + sf + sCross + 12} y={crossY + se / 2 + 4} textAnchor="start" fontSize={9} fill="#9b9b9b">e</text>
          </>
        )}
        {/* f dimension (bottom) */}
        {sf > 2 && (
          <>
            <line x1={crossX} y1={crossY + se + sd + 8} x2={crossX + sf} y2={crossY + se + sd + 8}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={crossX + sf / 2} y={crossY + se + sd + 20} textAnchor="middle" fontSize={9} fill="#9b9b9b">f</text>
          </>
        )}
      </g>
    );
  };

  const renderSquareToRoundReducer = () => {
    // PR1a: square-to-round symmetric reducer
    // labels: a [mm], b [mm], d [mm], L [mm], h [mm], m [mm]
    const a = values[0] || 200;   // front width
    const b = values[1] || 200;   // front height
    const d = values[2] || 150;   // rear circle diameter
    const l = values[3] || 500;   // total length
    const h = values[4] || 80;    // front straight section
    const m = values[5] || 80;    // rear straight section

    const maxDim = Math.max(a, b, d, l);
    const sc = 100 / maxDim;
    const sb = Math.max(b * sc, 12);
    const sd = Math.max(d * sc, 8);
    const sl = Math.max(l * sc, 20);
    const sh = h * sc;
    const sm = m * sc;
    const sa = Math.max(a * sc, 12);
    const sr = sd / 2; // radius in drawing

    const p = Math.min(8, Math.max(4, sb * 0.1));

    // Side view
    const svX = 25;
    const svCY = height / 2;
    const svT1 = svCY - sb / 2;  // front top
    const svB1 = svCY + sb / 2;  // front bottom
    const svT2 = svCY - sd / 2;  // rear top (circle diameter)
    const svB2 = svCY + sd / 2;  // rear bottom

    const dimTopY = Math.min(svT1, svT2) - p - 10;
    const dimBotY = Math.max(svB1, svB2) + p + 15;

    // Cross-section position (right part)
    const crossX = svX + sl + 45;
    const crossY = svCY - sb / 2;

    return (
      <g>
        {/* View labels */}
        <text x={svX + sl / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>
        <text x={crossX + sa / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* === Side view === */}
        {/* Front vertical + flange */}
        <line x1={svX} y1={svT1 - p} x2={svX} y2={svB1 + p} stroke="#004290" strokeWidth={2.2} />
        {/* Front straight — top */}
        <line x1={svX} y1={svT1} x2={svX + sh} y2={svT1} stroke="#004290" strokeWidth={1.8} />
        {/* Front straight — bottom */}
        <line x1={svX} y1={svB1} x2={svX + sh} y2={svB1} stroke="#004290" strokeWidth={1.8} />
        {/* Taper — top */}
        <line x1={svX + sh} y1={svT1} x2={svX + sl - sm} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        {/* Taper — bottom */}
        <line x1={svX + sh} y1={svB1} x2={svX + sl - sm} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear straight — top */}
        <line x1={svX + sl - sm} y1={svT2} x2={svX + sl} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear straight — bottom */}
        <line x1={svX + sl - sm} y1={svB2} x2={svX + sl} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        {/* Rear — circle symbol (small arc/ellipse at rear end) */}
        <ellipse cx={svX + sl} cy={svCY} rx={3} ry={sd / 2}
          fill="none" stroke="#004290" strokeWidth={1.5} />

        {/* Dashed division lines at h and L-m */}
        {sh > 1 && (
          <line x1={svX + sh} y1={svT1} x2={svX + sh} y2={svB1}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}
        {sm > 1 && (
          <line x1={svX + sl - sm} y1={svT2} x2={svX + sl - sm} y2={svB2}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}

        {/* b dimension — left (front height) */}
        <line x1={svX - 16} y1={svT1} x2={svX - 16} y2={svB1}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX - 20} y={svCY + 4} textAnchor="end" fontSize={11} fill="#555555">b</text>

        {/* d dimension — right (rear diameter) */}
        <line x1={svX + sl + 18} y1={svT2} x2={svX + sl + 18} y2={svB2}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl + 30} y={svCY + 4} textAnchor="start" fontSize={11} fill="#555555">d</text>

        {/* L dimension — below */}
        <line x1={svX} y1={dimBotY} x2={svX + sl} y2={dimBotY}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl / 2} y={dimBotY + 13} textAnchor="middle" fontSize={11} fill="#555555">L</text>

        {/* h dimension — above front section */}
        {sh > 3 && (
          <>
            <line x1={svX} y1={dimTopY} x2={svX + sh} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sh / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}

        {/* m dimension — above rear section */}
        {sm > 3 && (
          <>
            <line x1={svX + sl - sm} y1={dimTopY} x2={svX + sl} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sl - sm / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}

        {/* === Cross-section: front a×b rectangle + rear circle dashed === */}
        <rect x={crossX} y={crossY} width={sa} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Flange frame */}
        <rect x={crossX - p} y={crossY - p} width={sa + 2 * p} height={sb + 2 * p}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Rear circular opening dashed inside */}
        <circle cx={crossX + sa / 2} cy={svCY} r={sr}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension above cross-section */}
        <line x1={crossX} y1={crossY - p - 12} x2={crossX + sa} y2={crossY - p - 12}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + sa / 2} y={crossY - p - 16} textAnchor="middle" fontSize={11} fill="#555555">a</text>
      </g>
    );
  };

  const renderAsymSquareToRoundReducer = () => {
    // PR7a: asymmetric square-to-round reducer
    // labels: a [mm], b [mm], d [mm], L [mm], e [mm], f [mm], h [mm], m [mm]
    const a = values[0] || 200;
    const b = values[1] || 200;
    const d = values[2] || 150;
    const l = values[3] || 500;
    const e = values[4] || 30;    // offset from top edge to circle edge
    const f = values[5] || 30;    // offset from left edge to circle edge
    const h = values[6] || 80;
    const m = values[7] || 80;

    const maxDim = Math.max(a, b, d, l);
    const sc = 100 / maxDim;
    const sb = Math.max(b * sc, 12);
    const sd = Math.max(d * sc, 8);
    const sl = Math.max(l * sc, 20);
    const sh = h * sc;
    const sm = m * sc;
    const sa = Math.max(a * sc, 12);
    const se = e * sc;
    const sf = f * sc;
    const sr = sd / 2;

    const p = Math.min(8, Math.max(4, sb * 0.1));

    // Side view: circle is offset so rear top/bottom are asymmetric
    const svX = 25;
    const svCY = height / 2;
    const svT1 = svCY - sb / 2;
    const svB1 = svCY + sb / 2;
    // Circle center offset from rectangle center in drawing Y: topEdge + e + r = svT1 + se + sr
    const cirCY = svT1 + se + sr;
    const svT2 = cirCY - sr;  // rear top
    const svB2 = cirCY + sr;  // rear bottom

    const dimTopY = Math.min(svT1, svT2) - p - 10;
    const dimBotY = Math.max(svB1, svB2) + p + 15;

    const crossX = svX + sl + 45;
    const crossY = svCY - sb / 2;
    // Circle center in cross-section
    const cirCrossX = crossX + sf + sr;
    const cirCrossY = crossY + se + sr;

    return (
      <g>
        <text x={svX + sl / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>
        <text x={crossX + sa / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* === Side view === */}
        <line x1={svX} y1={svT1 - p} x2={svX} y2={svB1 + p} stroke="#004290" strokeWidth={2.2} />
        <line x1={svX} y1={svT1} x2={svX + sh} y2={svT1} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX} y1={svB1} x2={svX + sh} y2={svB1} stroke="#004290" strokeWidth={1.8} />
        {/* Asymmetric taper */}
        <line x1={svX + sh} y1={svT1} x2={svX + sl - sm} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sh} y1={svB1} x2={svX + sl - sm} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sl - sm} y1={svT2} x2={svX + sl} y2={svT2} stroke="#004290" strokeWidth={1.8} />
        <line x1={svX + sl - sm} y1={svB2} x2={svX + sl} y2={svB2} stroke="#004290" strokeWidth={1.8} />
        <ellipse cx={svX + sl} cy={cirCY} rx={3} ry={sr}
          fill="none" stroke="#004290" strokeWidth={1.5} />

        {sh > 1 && (
          <line x1={svX + sh} y1={svT1} x2={svX + sh} y2={svB1}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}
        {sm > 1 && (
          <line x1={svX + sl - sm} y1={svT2} x2={svX + sl - sm} y2={svB2}
            stroke="#004290" strokeWidth={0.7} strokeDasharray="3 2" />
        )}

        {/* b dimension — left */}
        <line x1={svX - 16} y1={svT1} x2={svX - 16} y2={svB1}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX - 20} y={svCY + 4} textAnchor="end" fontSize={11} fill="#555555">b</text>

        {/* d dimension — right */}
        <line x1={svX + sl + 18} y1={svT2} x2={svX + sl + 18} y2={svB2}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl + 30} y={cirCY + 4} textAnchor="start" fontSize={11} fill="#555555">d</text>

        {/* L dimension */}
        <line x1={svX} y1={dimBotY} x2={svX + sl} y2={dimBotY}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={svX + sl / 2} y={dimBotY + 13} textAnchor="middle" fontSize={11} fill="#555555">L</text>

        {sh > 3 && (
          <>
            <line x1={svX} y1={dimTopY} x2={svX + sh} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sh / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}
        {sm > 3 && (
          <>
            <line x1={svX + sl - sm} y1={dimTopY} x2={svX + sl} y2={dimTopY}
              stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={svX + sl - sm / 2} y={dimTopY - 3} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}

        {/* === Cross-section === */}
        <rect x={crossX} y={crossY} width={sa} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - p} y={crossY - p} width={sa + 2 * p} height={sb + 2 * p}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Asymmetric circle (offset by e,f) */}
        <circle cx={cirCrossX} cy={cirCrossY} r={sr}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - p - 12} x2={crossX + sa} y2={crossY - p - 12}
          stroke="#9b9b9b" strokeWidth={1} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + sa / 2} y={crossY - p - 16} textAnchor="middle" fontSize={11} fill="#555555">a</text>

        {/* e dimension — from top of rect to top of circle (in cross-section) */}
        {se > 2 && (
          <>
            <line x1={cirCrossX + sr + 8} y1={crossY} x2={cirCrossX + sr + 8} y2={cirCrossY - sr}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={cirCrossX + sr + 14} y={crossY + se / 2 + 4} textAnchor="start" fontSize={9} fill="#9b9b9b">e</text>
          </>
        )}

        {/* f dimension — from left of rect to left of circle (in cross-section) */}
        {sf > 2 && (
          <>
            <line x1={crossX} y1={cirCrossY + sr + 8} x2={cirCrossX - sr} y2={cirCrossY + sr + 8}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={crossX + sf / 2} y={cirCrossY + sr + 20} textAnchor="middle" fontSize={9} fill="#9b9b9b">f</text>
          </>
        )}
      </g>
    );
  };

  const renderReductionBendParametric = () => {
    // QBRa: reduction bend — params: a, d, b, e, f, r, alfa
    const a = values[0] || 200;
    const d = values[1] || 150;
    const b = values[2] || 200;
    const e = values[3] || 150;
    const f = values[4] || 150;
    const r = values[5] || 200;
    const alfa = values[6] || 90;
    const alfaRad = (alfa * Math.PI) / 180;

    const bendAreaW = width * 0.6;

    const eDirX = -Math.sin(alfaRad);
    const eDirY = Math.cos(alfaRad);

    // Arc end points (inner at r, outer at r+d)
    const arcEndIx = r * Math.cos(alfaRad);
    const arcEndIy = r * Math.sin(alfaRad);
    const arcEndOx = (r + d) * Math.cos(alfaRad);
    const arcEndOy = (r + d) * Math.sin(alfaRad);
    const eEndIx = arcEndIx + eDirX * e;
    const eEndIy = arcEndIy + eDirY * e;
    const eEndOx = arcEndOx + eDirX * e;
    const eEndOy = arcEndOy + eDirY * e;

    // Bounding box
    const allX = [r, r + b, arcEndIx, arcEndOx, eEndIx, eEndOx, 0];
    const allY = [-f, 0, arcEndIy, arcEndOy, eEndIy, eEndOy, r + b];
    for (let i = 0; i <= 20; i++) {
      const ang = (i / 20) * alfaRad;
      const t = i / 20;
      const outerR = r + b + (d - b) * t;
      allX.push(outerR * Math.cos(ang));
      allY.push(outerR * Math.sin(ang));
    }
    const realMinX = Math.min(...allX);
    const realMaxX = Math.max(...allX);
    const realMinY = Math.min(...allY);
    const realMaxY = Math.max(...allY);
    const realW = realMaxX - realMinX;
    const realH = realMaxY - realMinY;

    const labelMarginV = 44;
    const labelMarginH = 30;
    const sc = Math.min(
      (height - labelMarginV) / realH,
      (bendAreaW - labelMarginH) / realW
    );
    const sb = b * sc;
    const sd = d * sc;
    const se = e * sc;
    const sf = f * sc;
    const sr = r * sc;

    const sMinX = realMinX * sc;
    const sMaxX = realMaxX * sc;
    const sMinY = realMinY * sc;
    const sMaxY = realMaxY * sc;
    const sW = sMaxX - sMinX;
    const sH = sMaxY - sMinY;

    const ox = (bendAreaW - sW) / 2 - sMinX + 5;
    const oy = (height - sH) / 2 - sMinY + 8;

    // Arc segments with interpolated outer radius
    const arcSteps = 20;
    const innerArc: string[] = [];
    const outerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = (i / arcSteps) * alfaRad;
      const t = i / arcSteps;
      const outerR = sr + sb + (sd - sb) * t;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerArc.push(`${ox + sr * cos},${oy + sr * sin}`);
      outerArc.push(`${ox + outerR * cos},${oy + outerR * sin}`);
    }

    // F-leg (bottom, at angle=0, width b)
    const vInnerX = ox + sr;
    const vOuterX = ox + sr + sb;
    const vTop = oy;
    const vTopEnd = vTop - sf;

    // E-leg (tangent at angle alfa, width d)
    const eIStartX = ox + sr * Math.cos(alfaRad);
    const eIStartY = oy + sr * Math.sin(alfaRad);
    const eOStartX = ox + (sr + sd) * Math.cos(alfaRad);
    const eOStartY = oy + (sr + sd) * Math.sin(alfaRad);
    const sfDirX = -Math.sin(alfaRad);
    const sfDirY = Math.cos(alfaRad);
    const eIEndX = eIStartX + sfDirX * se;
    const eIEndY = eIStartY + sfDirY * se;
    const eOEndX = eOStartX + sfDirX * se;
    const eOEndY = eOStartY + sfDirY * se;

    const flangeNX = Math.cos(alfaRad);
    const flangeNY = Math.sin(alfaRad);

    // Cross-section
    const crossAreaX = bendAreaW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / Math.max(a, b);
    const ca = Math.max(a * crossScale, 14);
    const cb = Math.max(b * crossScale, 14);
    const cd = Math.max(d * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        <text x={bendAreaW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>

        {/* Outer wall: f-leg → arc → e-leg */}
        <polyline points={`${vOuterX},${vTopEnd} ${vOuterX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={outerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${eOStartX},${eOStartY} ${eOEndX},${eOEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Inner wall: f-leg → arc → e-leg */}
        <polyline points={`${vInnerX},${vTopEnd} ${vInnerX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${eIStartX},${eIStartY} ${eIEndX},${eIEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges */}
        <line x1={vInnerX - 3} y1={vTopEnd} x2={vOuterX + 3} y2={vTopEnd} stroke="#004290" strokeWidth={2} />
        <line x1={eIEndX - flangeNX * 3} y1={eIEndY - flangeNY * 3}
              x2={eOEndX + flangeNX * 3} y2={eOEndY + flangeNY * 3} stroke="#004290" strokeWidth={2} />

        {/* b dimension — f-leg width */}
        <line x1={vInnerX} y1={vTopEnd - 10} x2={vOuterX} y2={vTopEnd - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(vInnerX + vOuterX) / 2} y={vTopEnd - 13} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* d dimension — e-leg width */}
        {(() => {
          const dOff = 12;
          const dStartX = eIEndX + flangeNX * dOff;
          const dStartY = eIEndY + flangeNY * dOff;
          const dEndX = eOEndX + flangeNX * dOff;
          const dEndY = eOEndY + flangeNY * dOff;
          const dLabelX = (dStartX + dEndX) / 2 + flangeNX * 10;
          const dLabelY = (dStartY + dEndY) / 2 + flangeNY * 10;
          return (
            <>
              <line x1={dStartX} y1={dStartY} x2={dEndX} y2={dEndY}
                stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
              <text x={dLabelX} y={dLabelY} textAnchor="middle" fontSize={10} fill="#555555">d</text>
            </>
          );
        })()}

        {/* f dimension — f-leg length */}
        <line x1={vOuterX + 12} y1={vTopEnd} x2={vOuterX + 12} y2={vTop}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={vOuterX + 22} y={(vTopEnd + vTop) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* e dimension — e-leg length */}
        {(() => {
          const eOff = 12;
          const eDimStartX = eOStartX + flangeNX * eOff;
          const eDimStartY = eOStartY + flangeNY * eOff;
          const eDimEndX = eOEndX + flangeNX * eOff;
          const eDimEndY = eOEndY + flangeNY * eOff;
          const eLabelX = (eDimStartX + eDimEndX) / 2 + flangeNX * 10;
          const eLabelY = (eDimStartY + eDimEndY) / 2 + flangeNY * 10;
          return (
            <>
              <line x1={eDimStartX} y1={eDimStartY} x2={eDimEndX} y2={eDimEndY}
                stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
              <text x={eLabelX} y={eLabelY} textAnchor="middle" fontSize={10} fill="#555555">e</text>
            </>
          );
        })()}

        {/* r dimension */}
        {(() => {
          const midAngle = alfaRad / 2;
          return (
            <>
              <line x1={ox} y1={oy} x2={ox + sr * Math.cos(midAngle)} y2={oy + sr * Math.sin(midAngle)}
                stroke="#9b9b9b" strokeWidth={0.8} strokeDasharray="3 2" />
              <text x={ox + sr * 0.45 * Math.cos(midAngle) + 3} y={oy + sr * 0.45 * Math.sin(midAngle)} fontSize={10} fill="#555555">r</text>
            </>
          );
        })()}

        {/* alfa arc indicator */}
        {alfa !== 90 && (() => {
          const arcR = sr * 0.3;
          const arcPts: string[] = [];
          for (let i = 0; i <= 10; i++) {
            const ang = (i / 10) * alfaRad;
            arcPts.push(`${ox + arcR * Math.cos(ang)},${oy + arcR * Math.sin(ang)}`);
          }
          return (
            <>
              <polyline points={arcPts.join(' ')} fill="none" stroke="#9b9b9b" strokeWidth={0.6} />
              <text x={ox + arcR * 1.3 * Math.cos(alfaRad / 2)} y={oy + arcR * 1.3 * Math.sin(alfaRad / 2)}
                textAnchor="middle" fontSize={9} fill="#555555">{`α=${Math.round(alfa)}°`}</text>
            </>
          );
        })()}

        {/* Centerlines */}
        <line x1={ox} y1={oy} x2={ox + sr + sb / 2} y2={oy} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />
        <line x1={ox} y1={oy} x2={ox + (sr + sd / 2) * Math.cos(alfaRad)} y2={oy + (sr + sd / 2) * Math.sin(alfaRad)}
          stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />

        {/* Cross-section */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        {/* Solid: a×b (inlet) */}
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Dashed: a×d (outlet, centered vertically) */}
        <rect x={crossX} y={crossY + (cb - cd) / 2} width={ca} height={cd}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* b dimension */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* d dimension (inside cross-section, right side) */}
        {cd < cb - 4 && (
          <>
            <line x1={crossX + ca + 4} y1={crossY + (cb - cd) / 2} x2={crossX + ca + 4} y2={crossY + (cb + cd) / 2}
              stroke="#9b9b9b" strokeWidth={0.6} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={crossX + ca + 10} y={crossY + cb / 2 + 4} textAnchor="start" fontSize={9} fill="#9b9b9b">d</text>
          </>
        )}
      </g>
    );
  };

  const renderDiffuserBend = () => {
    // QBR1a: diffuser bend — params: a, d(inlet depth), c, b(outlet depth), e, f, r, g, alfa
    const aVal = values[0] || 200;   // inlet z-width
    const dVal = values[1] || 200;   // inlet radial depth (inner-to-outer)
    const cVal = values[2] || 250;   // outlet z-width
    const bVal = values[3] || 150;   // outlet radial depth
    const eVal = values[4] || 150;   // e-leg length
    const fVal = values[5] || 150;   // f-leg length
    const rVal = values[6] || 200;   // inner bend radius
    const gVal = values[7] || 0;     // z-offset control
    const alfa = values[8] || 90;
    const alfaRad = (alfa * Math.PI) / 180;

    const bendAreaW = width * 0.6;

    const eDirX = -Math.sin(alfaRad);
    const eDirY = Math.cos(alfaRad);

    // Arc end points — inner at r, outer transitions from r+dVal to r+bVal
    const arcEndIx = rVal * Math.cos(alfaRad);
    const arcEndIy = rVal * Math.sin(alfaRad);
    const arcEndOx = (rVal + bVal) * Math.cos(alfaRad);
    const arcEndOy = (rVal + bVal) * Math.sin(alfaRad);
    const eEndIx = arcEndIx + eDirX * eVal;
    const eEndIy = arcEndIy + eDirY * eVal;
    const eEndOx = arcEndOx + eDirX * eVal;
    const eEndOy = arcEndOy + eDirY * eVal;

    // Bounding box
    const allX = [rVal, rVal + dVal, arcEndIx, arcEndOx, eEndIx, eEndOx, 0];
    const allY = [-fVal, 0, arcEndIy, arcEndOy, eEndIy, eEndOy, rVal + dVal];
    for (let i = 0; i <= 20; i++) {
      const ang = (i / 20) * alfaRad;
      const t = i / 20;
      const outerR = rVal + dVal + (bVal - dVal) * t;
      allX.push(outerR * Math.cos(ang));
      allY.push(outerR * Math.sin(ang));
    }
    const realMinX = Math.min(...allX);
    const realMaxX = Math.max(...allX);
    const realMinY = Math.min(...allY);
    const realMaxY = Math.max(...allY);
    const realW = realMaxX - realMinX;
    const realH = realMaxY - realMinY;

    const labelMarginV = 44;
    const labelMarginH = 30;
    const sc = Math.min(
      (height - labelMarginV) / realH,
      (bendAreaW - labelMarginH) / realW
    );
    const sd = dVal * sc;
    const sb = bVal * sc;
    const se = eVal * sc;
    const sf = fVal * sc;
    const sr = rVal * sc;

    const sMinX = realMinX * sc;
    const sMaxX = realMaxX * sc;
    const sMinY = realMinY * sc;
    const sMaxY = realMaxY * sc;
    const sW = sMaxX - sMinX;
    const sH = sMaxY - sMinY;

    const ox = (bendAreaW - sW) / 2 - sMinX + 5;
    const oy = (height - sH) / 2 - sMinY + 8;

    // Arc segments with interpolated outer radius
    const arcSteps = 20;
    const innerArc: string[] = [];
    const outerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = (i / arcSteps) * alfaRad;
      const t = i / arcSteps;
      const outerR = sr + sd + (sb - sd) * t;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerArc.push(`${ox + sr * cos},${oy + sr * sin}`);
      outerArc.push(`${ox + outerR * cos},${oy + outerR * sin}`);
    }

    // F-leg (bottom, width dVal)
    const vInnerX = ox + sr;
    const vOuterX = ox + sr + sd;
    const vTop = oy;
    const vTopEnd = vTop - sf;

    // E-leg (tangent at alfa, width bVal)
    const eIStartX = ox + sr * Math.cos(alfaRad);
    const eIStartY = oy + sr * Math.sin(alfaRad);
    const eOStartX = ox + (sr + sb) * Math.cos(alfaRad);
    const eOStartY = oy + (sr + sb) * Math.sin(alfaRad);
    const sfDirX = -Math.sin(alfaRad);
    const sfDirY = Math.cos(alfaRad);
    const eIEndX = eIStartX + sfDirX * se;
    const eIEndY = eIStartY + sfDirY * se;
    const eOEndX = eOStartX + sfDirX * se;
    const eOEndY = eOStartY + sfDirY * se;

    const flangeNX = Math.cos(alfaRad);
    const flangeNY = Math.sin(alfaRad);

    // Cross-section
    const crossAreaX = bendAreaW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const maxCross = Math.max(aVal, cVal, dVal, bVal);
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / maxCross;
    const ca = Math.max(aVal * crossScale, 14);
    const cd = Math.max(dVal * crossScale, 14);
    const cc = Math.max(cVal * crossScale, 14);
    const cbv = Math.max(bVal * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - Math.max(ca, cc)) / 2;
    const crossY = (height - Math.max(cd, cbv)) / 2 + 4;

    // Outlet z-offset for cross-section
    let gg = 0;
    if (cVal <= aVal) {
      gg = (aVal - cVal) / 2 - gVal;
    } else {
      gg = (cVal - aVal) / 2 + gVal;
    }
    const crossGg = gg * crossScale;
    // Outlet rect position in cross-section (offset from inlet)
    const outX = crossX + (ca - cc) / 2 - crossGg;
    const outY = crossY + (cd - cbv) / 2;

    return (
      <g>
        <text x={bendAreaW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>

        {/* Outer wall */}
        <polyline points={`${vOuterX},${vTopEnd} ${vOuterX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={outerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${eOStartX},${eOStartY} ${eOEndX},${eOEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Inner wall */}
        <polyline points={`${vInnerX},${vTopEnd} ${vInnerX},${vTop}`} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <polyline points={`${eIStartX},${eIStartY} ${eIEndX},${eIEndY}`} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges */}
        <line x1={vInnerX - 3} y1={vTopEnd} x2={vOuterX + 3} y2={vTopEnd} stroke="#004290" strokeWidth={2} />
        <line x1={eIEndX - flangeNX * 3} y1={eIEndY - flangeNY * 3}
              x2={eOEndX + flangeNX * 3} y2={eOEndY + flangeNY * 3} stroke="#004290" strokeWidth={2} />

        {/* d dimension — f-leg width (inlet radial) */}
        <line x1={vInnerX} y1={vTopEnd - 10} x2={vOuterX} y2={vTopEnd - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(vInnerX + vOuterX) / 2} y={vTopEnd - 13} textAnchor="middle" fontSize={10} fill="#555555">d</text>

        {/* b dimension — e-leg width (outlet radial) */}
        {(() => {
          const dOff = 12;
          const dStartX = eIEndX + flangeNX * dOff;
          const dStartY = eIEndY + flangeNY * dOff;
          const dEndX = eOEndX + flangeNX * dOff;
          const dEndY = eOEndY + flangeNY * dOff;
          const dLabelX = (dStartX + dEndX) / 2 + flangeNX * 10;
          const dLabelY = (dStartY + dEndY) / 2 + flangeNY * 10;
          return (
            <>
              <line x1={dStartX} y1={dStartY} x2={dEndX} y2={dEndY}
                stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
              <text x={dLabelX} y={dLabelY} textAnchor="middle" fontSize={10} fill="#555555">b</text>
            </>
          );
        })()}

        {/* f dimension */}
        <line x1={vOuterX + 12} y1={vTopEnd} x2={vOuterX + 12} y2={vTop}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={vOuterX + 22} y={(vTopEnd + vTop) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* e dimension */}
        {(() => {
          const eOff = 12;
          const eDimStartX = eOStartX + flangeNX * eOff;
          const eDimStartY = eOStartY + flangeNY * eOff;
          const eDimEndX = eOEndX + flangeNX * eOff;
          const eDimEndY = eOEndY + flangeNY * eOff;
          const eLabelX = (eDimStartX + eDimEndX) / 2 + flangeNX * 10;
          const eLabelY = (eDimStartY + eDimEndY) / 2 + flangeNY * 10;
          return (
            <>
              <line x1={eDimStartX} y1={eDimStartY} x2={eDimEndX} y2={eDimEndY}
                stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
              <text x={eLabelX} y={eLabelY} textAnchor="middle" fontSize={10} fill="#555555">e</text>
            </>
          );
        })()}

        {/* r dimension */}
        {(() => {
          const midAngle = alfaRad / 2;
          return (
            <>
              <line x1={ox} y1={oy} x2={ox + sr * Math.cos(midAngle)} y2={oy + sr * Math.sin(midAngle)}
                stroke="#9b9b9b" strokeWidth={0.8} strokeDasharray="3 2" />
              <text x={ox + sr * 0.45 * Math.cos(midAngle) + 3} y={oy + sr * 0.45 * Math.sin(midAngle)} fontSize={10} fill="#555555">r</text>
            </>
          );
        })()}

        {/* alfa arc indicator */}
        {alfa !== 90 && (() => {
          const arcR = sr * 0.3;
          const arcPts: string[] = [];
          for (let i = 0; i <= 10; i++) {
            const ang = (i / 10) * alfaRad;
            arcPts.push(`${ox + arcR * Math.cos(ang)},${oy + arcR * Math.sin(ang)}`);
          }
          return (
            <>
              <polyline points={arcPts.join(' ')} fill="none" stroke="#9b9b9b" strokeWidth={0.6} />
              <text x={ox + arcR * 1.3 * Math.cos(alfaRad / 2)} y={oy + arcR * 1.3 * Math.sin(alfaRad / 2)}
                textAnchor="middle" fontSize={9} fill="#555555">{`α=${Math.round(alfa)}°`}</text>
            </>
          );
        })()}

        {/* Centerlines */}
        <line x1={ox} y1={oy} x2={ox + sr + sd / 2} y2={oy} stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />
        <line x1={ox} y1={oy} x2={ox + (sr + sb / 2) * Math.cos(alfaRad)} y2={oy + (sr + sb / 2) * Math.sin(alfaRad)}
          stroke="#9b9b9b" strokeWidth={0.5} strokeDasharray="2 2" />

        {/* Cross-section */}
        <text x={crossX + Math.max(ca, cc) / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        {/* Solid: a×d (inlet) */}
        <rect x={crossX} y={crossY} width={ca} height={cd}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cd + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Dashed: c×b (outlet, offset) */}
        <rect x={outX} y={outY} width={cc} height={cbv}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* d dimension (right of cross-section) */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cd}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cd / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>

        {/* c dimension (below outlet dashed rect) */}
        {cc > 8 && (
          <>
            <line x1={outX} y1={outY + cbv + 8} x2={outX + cc} y2={outY + cbv + 8}
              stroke="#9b9b9b" strokeWidth={0.6} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={outX + cc / 2} y={outY + cbv + 20} textAnchor="middle" fontSize={9} fill="#9b9b9b">c</text>
          </>
        )}
      </g>
    );
  };

  const renderReductionElbow = () => {
    // QBFRa: L-shaped 90° reduction elbow (matching C# Form1.cs)
    // Params: a (depth), b (wider duct width, b≥d), d (narrower duct width),
    //         e (straight section on d-side), f (straight section on b-side), r (inner bend radius)
    // L-shape layout: outer rect (e+b) wide × (d+f) tall, inner corner at (e, d)
    // Left opening: duct d×a. Bottom opening: duct b×a.
    const a = values[0] || 200;
    const b = values[1] || 200;
    const d = values[2] || 150;
    const e = values[3] || 150;
    const f = values[4] || 150;
    const r = values[5] || 100;

    const sideW = width * 0.6;
    const totalW = e + b;
    const totalH = d + f;

    const sc = Math.min(
      (height - 60) / totalH,
      (sideW - 55) / totalW
    );
    const sb = b * sc, sd = d * sc, se = e * sc, sf = f * sc, sr = r * sc;
    const sp = Math.min(6, Math.max(3, Math.min(sb, sd) * 0.1));

    // Origin (top-left of L-shape outer boundary)
    const ox = 38;
    const oy = 18;

    // Inner corner at (ox+se, oy+sd)
    const icx = ox + se;
    const icy = oy + sd;

    // Key coordinates
    const rightX = ox + se + sb;
    const botY = oy + sd + sf;

    // Arc center at (icx-sr, icy+sr); tangents: top (icx-sr, icy), right (icx, icy+sr)
    const arcCX = icx - sr;
    const arcCY = icy + sr;

    // Generate inner arc points: from (icx-sr, icy) CW to (icx, icy+sr)
    const arcSteps = 12;
    const innerArcPts: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const ang = (Math.PI / 2) * (i / arcSteps);
      const px = arcCX + sr * Math.sin(ang);
      const py = arcCY - sr * Math.cos(ang);
      innerArcPts.push(`${px},${py}`);
    }

    // Cross-section panel (right side): a×d rectangle
    const crossAreaX = sideW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / Math.max(a, d);
    const ca = Math.max(a * crossScale, 14);
    const cd = Math.max(d * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cd) / 2;

    return (
      <g>
        {/* === LEFT VIEW: L-shape front view === */}

        {/* Outer walls */}
        <line x1={ox} y1={oy} x2={rightX} y2={oy} stroke="#004290" strokeWidth={1.8} />
        <line x1={rightX} y1={oy} x2={rightX} y2={botY} stroke="#004290" strokeWidth={1.8} />
        <line x1={rightX} y1={botY} x2={icx} y2={botY} stroke="#004290" strokeWidth={1.8} />
        <line x1={ox} y1={oy} x2={ox} y2={icy} stroke="#004290" strokeWidth={1.8} />

        {/* Inner walls + arc */}
        <line x1={ox} y1={icy} x2={arcCX} y2={icy} stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArcPts.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <line x1={icx} y1={arcCY} x2={icx} y2={botY} stroke="#004290" strokeWidth={1.8} />

        {/* Left flange (d-opening at x=ox) */}
        <line x1={ox} y1={oy - sp} x2={ox} y2={icy + sp} stroke="#004290" strokeWidth={2} />
        <line x1={ox + sp} y1={oy} x2={ox + sp} y2={icy} stroke="#004290" strokeWidth={1.2} />

        {/* Bottom flange (b-opening at y=botY) */}
        <line x1={icx - sp} y1={botY} x2={rightX + sp} y2={botY} stroke="#004290" strokeWidth={2} />
        <line x1={icx} y1={botY - sp} x2={rightX} y2={botY - sp} stroke="#004290" strokeWidth={1.2} />

        {/* d dimension — left side, top to inner corner */}
        <line x1={ox - 12} y1={oy} x2={ox - 12} y2={icy}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 22} y={(oy + icy) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>

        {/* f dimension — left side, inner corner to bottom */}
        <line x1={ox - 12} y1={icy} x2={ox - 12} y2={botY}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 22} y={(icy + botY) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* e dimension — bottom, left edge to inner corner */}
        <line x1={ox} y1={botY + 12} x2={icx} y2={botY + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(ox + icx) / 2} y={botY + 24} textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* b dimension — bottom, inner corner to right edge */}
        <line x1={icx} y1={botY + 12} x2={rightX} y2={botY + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(icx + rightX) / 2} y={botY + 24} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* r dimension — dashed line from arc center to inner corner */}
        {sr > 4 && (
          <>
            <line x1={arcCX} y1={arcCY} x2={icx} y2={icy}
              stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2" />
            <text x={icx + 2} y={icy - 4} textAnchor="start" fontSize={9} fill="#555555">r</text>
          </>
        )}

        {/* === RIGHT PANEL: Cross-section a×d === */}
        <text x={crossX + ca / 2} y={crossY - cp - 22} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        <rect x={crossX} y={crossY} width={ca} height={cd}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cd + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} />

        {/* a dimension on cross-section */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* d dimension on cross-section */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cd}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cd / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>
      </g>
    );
  };

  const renderAngleBend = () => {
    // QBFa: symmetric 90° L-shaped elbow (d = b)
    // Left: L-shape front view. Right: cross-section a×b.
    // L outline (clockwise from top-left):
    //   (ox,oy)→(ox+e+b,oy)→(ox+e+b,oy+b+f)→(ox+e,oy+b+f)→
    //   inner vertical up to arc → ARC → inner horizontal to (ox,oy+b)→close
    // Arc center at (corner.x - r, corner.y + r) where corner = (ox+e, oy+b)
    const a = values[0] || 200;
    const b = values[1] || 200;
    const e = values[2] || 150;
    const f = values[3] || 150;
    const r = values[4] || 100;

    const sideW = width * 0.58;
    const totalW = e + b;
    const totalH = b + f;
    const sc = Math.min((height - 44) / totalH, (sideW - 36) / totalW);
    const sb = b * sc, se = e * sc, sf = f * sc, sr = r * sc;

    // Origin: top-left of outer L bounding box
    const ox = Math.max(16, (sideW - (se + sb)) / 2);
    const oy = Math.max(10, (height - (sb + sf)) / 2);

    // Inner corner point (where the L turns)
    const cornerX = ox + se;
    const cornerY = oy + sb;

    // Arc center: offset from inner corner by radius
    const arcCX = cornerX - sr;
    const arcCY = cornerY + sr;
    const fp = Math.min(8, Math.max(3, sb * 0.1)); // flange protrusion

    // Arc tangent points:
    // Top tangent: (arcCX, cornerY) = (ox+se-sr, oy+sb) — connects to horizontal inner line
    // Right tangent: (cornerX, arcCY) = (ox+se, oy+sb+sr) — connects to vertical inner line
    const arcSteps = 12;
    const innerArcPts: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = -Math.PI / 2 + (Math.PI / 2) * (i / arcSteps); // -90°→0°
      innerArcPts.push(`${(arcCX + sr * Math.cos(angle)).toFixed(1)},${(arcCY + sr * Math.sin(angle)).toFixed(1)}`);
    }
    // [0] = (arcCX, arcCY-sr) = (ox+se-sr, oy+sb) = top tangent
    // [last] = (arcCX+sr, arcCY) = (ox+se, oy+sb+sr) = right tangent

    // L-shape outline as a closed polygon (outer edges only)
    const outerPts = [
      `${ox},${oy}`,                                                  // top-left
      `${(ox + se + sb).toFixed(1)},${oy}`,                          // top-right
      `${(ox + se + sb).toFixed(1)},${(oy + sb + sf).toFixed(1)}`,  // bottom-right
      `${cornerX.toFixed(1)},${(oy + sb + sf).toFixed(1)}`,         // inner bottom-right
    ].join(' ');

    // Inner boundary: vertical from inner-bottom up to arc, arc, then horizontal to left, then left edge up
    const innerPts = [
      ...innerArcPts.reverse(),     // arc from right-tangent to top-tangent (right→up)
      `${ox},${cornerY.toFixed(1)}`, // horizontal to left wall
      `${ox},${oy}`,                 // left edge up to start (closes polygon)
    ].join(' ');

    // Cross section (right panel)
    const crossAreaX = sideW + 8;
    const crossAreaW = width - crossAreaX - 8;
    const csc = Math.min(crossAreaW * 0.72, (height - 44) * 0.72) / Math.max(a, b, 1);
    const ca = Math.max(a * csc, 12), cb = Math.max(b * csc, 12);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        <text x={sideW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z przodu</text>

        {/* Outer boundary: top→right→bottom-right→inner-bottom, then inner boundary back to start */}
        <polyline points={outerPts} fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Inner vertical: from inner-bottom-right up to arc right-tangent */}
        <line x1={cornerX} y1={oy + sb + sf} x2={cornerX} y2={arcCY}
          stroke="#004290" strokeWidth={1.8} />
        {/* Arc + horizontal inner + left edge */}
        <polyline points={innerPts} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges at the two duct openings */}
        {/* Left vertical flange (inlet): at left edge, height = b */}
        <line x1={ox - fp} y1={oy} x2={ox - fp} y2={cornerY}
          stroke="#004290" strokeWidth={2.2} />
        <line x1={ox + fp} y1={oy} x2={ox + fp} y2={cornerY}
          stroke="#004290" strokeWidth={1} />
        {/* Bottom horizontal flange (outlet): at bottom edge of right arm, width = b */}
        <line x1={cornerX} y1={oy + sb + sf + fp} x2={ox + se + sb} y2={oy + sb + sf + fp}
          stroke="#004290" strokeWidth={2.2} />
        <line x1={cornerX} y1={oy + sb + sf - fp} x2={ox + se + sb} y2={oy + sb + sf - fp}
          stroke="#004290" strokeWidth={1} />

        {/* e — horizontal leg dimension (bottom, spanning e width) */}
        <line x1={ox} y1={oy + sb + sf + fp + 13} x2={ox + se} y2={oy + sb + sf + fp + 13}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + se / 2} y={oy + sb + sf + fp + 24}
          textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* b — upper portion on left (d=b) */}
        {sb > 8 && (
          <>
            <line x1={ox - fp - 13} y1={oy} x2={ox - fp - 13} y2={cornerY}
              stroke="#9b9b9b" strokeWidth={0.8}
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={ox - fp - 22} y={oy + sb / 2 + 4}
              textAnchor="middle" fontSize={10} fill="#555555">b</text>
          </>
        )}

        {/* f — lower portion on left */}
        {sf > 8 && (
          <>
            <line x1={ox - fp - 13} y1={cornerY} x2={ox - fp - 13} y2={oy + sb + sf}
              stroke="#9b9b9b" strokeWidth={0.8}
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={ox - fp - 22} y={cornerY + sf / 2 + 4}
              textAnchor="middle" fontSize={9} fill="#555555">f</text>
          </>
        )}

        {/* r — radius line from arc center to arc */}
        {sr > 6 && (
          <>
            <line x1={arcCX} y1={arcCY}
              x2={arcCX + sr * Math.cos(-Math.PI / 4)} y2={arcCY + sr * Math.sin(-Math.PI / 4)}
              stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2" />
            <text x={arcCX + sr * 0.4} y={arcCY - sr * 0.4 - 2}
              textAnchor="middle" fontSize={9} fill="#555555">r</text>
          </>
        )}

        {/* Cross section (right panel) */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14}
          textAnchor="middle" fontSize={10} fill="#555555">a</text>
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4}
          textAnchor="start" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderEndCap = () => {
    // QESa: rectangular end cap — params: a [mm], b [mm], e [mm] (depth)
    const a = values[0] || 200;
    const b = values[1] || 200;
    const e = values[2] || 30;

    // Left 58%: side view showing e (depth) × b
    const sideW = width * 0.58;
    const sc = Math.min((height - 44) / b, (sideW - 48) / Math.max(e, 1));
    const sb = Math.max(b * sc, 12);
    const se = Math.max(e * sc, 8);
    const fp = Math.min(8, Math.max(4, sb * 0.1)); // flange protrusion

    // Side view centred in left area
    const sx = Math.max(28, (sideW - se - 40) / 2);
    const sy = (height - sb) / 2 - 4;

    // Right 42%: cross-section (a × b)
    const crossAreaX = sideW + 8;
    const crossAreaW = width - crossAreaX - 10;
    const csc = Math.min(crossAreaW * 0.72, (height - 50) * 0.72) / Math.max(a, b, 1);
    const ca = Math.max(a * csc, 12);
    const cb = Math.max(b * csc, 12);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        <text x={sideW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>

        {/* Flange line on left (open/mating end) */}
        <line x1={sx} y1={sy - fp} x2={sx} y2={sy + sb + fp}
          stroke="#004290" strokeWidth={2.2} />

        {/* Cap body rectangle (side face: e × b) */}
        <rect x={sx} y={sy} width={se} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Closed end — thick plate line on right */}
        <line x1={sx + se} y1={sy - 2} x2={sx + se} y2={sy + sb + 2}
          stroke="#004290" strokeWidth={4} />

        {/* e dimension (depth) */}
        <line x1={sx} y1={sy + sb + fp + 14} x2={sx + se} y2={sy + sb + fp + 14}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sx + se / 2} y={sy + sb + fp + 26}
          textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* b dimension (height) */}
        {sb > 10 && (
          <>
            <line x1={sx + se + 14} y1={sy} x2={sx + se + 14} y2={sy + sb}
              stroke="#9b9b9b" strokeWidth={0.8}
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={sx + se + 24} y={sy + sb / 2 + 4}
              textAnchor="start" fontSize={10} fill="#555555">b</text>
          </>
        )}

        {/* Cross-section */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14}
          textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* b dimension (cross-section side) */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4}
          textAnchor="start" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderTR1a = () => {
    // TR1a: rectangular branch tee
    // values: a, b, d, w, L, e, f, l3
    const a   = values[0] || 200;
    const b   = values[1] || 200;
    // d = values[2] — branch z-depth (shown in cross-section only)
    const w   = values[3] || 200;  // branch x-width
    const L   = values[4] || 500;  // main duct length
    const e   = values[5] || 150;  // branch x-offset from left
    const l3  = values[7] || 200;  // branch y-length (downward)

    // Left panel (~60%): front view showing main duct + branch
    const sideW = width * 0.60;
    const totalH = b + l3;
    const sc = Math.min((height - 44) / totalH, (sideW - 44) / L);
    const sL = Math.max(L * sc, 20);
    const sb = Math.max(b * sc, 8);
    const sw = Math.max(w * sc, 8);
    const sl3 = Math.max(l3 * sc, 8);
    const se = e * sc;
    const fp = Math.min(7, Math.max(3, sb * 0.1)); // flange protrusion

    const ox = Math.max(18, (sideW - sL) / 2);  // left margin
    const oy = Math.max(12, (height - sb - sl3 - 8) / 2); // top margin

    // Cross-section (right panel)
    const crossAreaX = sideW + 6;
    const crossAreaW = width - crossAreaX - 8;
    const csc = Math.min(crossAreaW * 0.7, (height - 44) * 0.7) / Math.max(a, b, 1);
    const ca = Math.max(a * csc, 12);
    const cb = Math.max(b * csc, 12);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        <text x={sideW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z przodu</text>

        {/* Main duct rectangle */}
        <rect x={ox} y={oy} width={sL} height={sb}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Left flange (main duct in) */}
        <line x1={ox} y1={oy - fp} x2={ox} y2={oy + sb + fp}
          stroke="#004290" strokeWidth={2.2} />
        {/* Right flange (main duct out) */}
        <line x1={ox + sL} y1={oy - fp} x2={ox + sL} y2={oy + sb + fp}
          stroke="#004290" strokeWidth={2.2} />

        {/* Branch rectangle below main duct */}
        <rect x={ox + se} y={oy + sb} width={sw} height={sl3}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Branch bottom flange */}
        <line x1={ox + se - fp} y1={oy + sb + sl3} x2={ox + se + sw + fp} y2={oy + sb + sl3}
          stroke="#004290" strokeWidth={2.2} />

        {/* L dimension (main duct length) */}
        <line x1={ox} y1={oy - fp - 12} x2={ox + sL} y2={oy - fp - 12}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL / 2} y={oy - fp - 14}
          textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* b dimension (main duct height) */}
        <line x1={ox + sL + 12} y1={oy} x2={ox + sL + 12} y2={oy + sb}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL + 22} y={oy + sb / 2 + 4}
          textAnchor="start" fontSize={10} fill="#555555">b</text>

        {/* w dimension (branch width) */}
        {sw > 8 && (
          <>
            <line x1={ox + se} y1={oy + sb + sl3 + 14} x2={ox + se + sw} y2={oy + sb + sl3 + 14}
              stroke="#9b9b9b" strokeWidth={0.8}
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={ox + se + sw / 2} y={oy + sb + sl3 + 24}
              textAnchor="middle" fontSize={10} fill="#555555">w</text>
          </>
        )}

        {/* l3 dimension (branch height) */}
        {sl3 > 8 && (
          <>
            <line x1={ox + se + sw + 12} y1={oy + sb} x2={ox + se + sw + 12} y2={oy + sb + sl3}
              stroke="#9b9b9b" strokeWidth={0.8}
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={ox + se + sw + 22} y={oy + sb + sl3 / 2 + 4}
              textAnchor="start" fontSize={10} fill="#555555">l3</text>
          </>
        )}

        {/* e dimension (branch offset from left) */}
        {se > 6 && (
          <>
            <line x1={ox} y1={oy + sb + sl3 / 2} x2={ox + se} y2={oy + sb + sl3 / 2}
              stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2"
              markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
            <text x={ox + se / 2} y={oy + sb + sl3 / 2 - 3}
              textAnchor="middle" fontSize={9} fill="#555555">e</text>
          </>
        )}

        {/* Cross-section */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14}
          textAnchor="middle" fontSize={10} fill="#555555">a</text>
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8}
          markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4}
          textAnchor="start" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderTeeJunction = () => {
    // TR2a: tee junction with round branch (matching C# Form1.cs)
    // Left: front view — horizontal main duct l×a, branch d×l3 going UP from top
    // Right: cross-section — a×b rectangle with branch d×l3 above
    const a  = values[0] || 200;
    const b  = values[1] || 200;
    const d  = values[2] || 150;
    const L  = values[3] || 500;
    const l3 = values[4] || 200;
    const e  = values[5] || 250;
    const f  = values[6] || 100;

    const sideW = width * 0.6;
    const sc = Math.min((sideW - 60) / L, (height - 60) / (a + l3));
    const sl = L * sc, sa = a * sc, sd = d * sc, sl3 = l3 * sc;
    const se = e * sc;
    const sp = Math.min(6, Math.max(3, Math.min(sa, sl) * 0.08));

    // Main duct origin — push down to leave room for branch above
    const ox = 30;
    const oy = 18 + sl3;

    // Main duct rectangle (l × a — front view shows length × height)
    const mRight = ox + sl;
    const mBot = oy + sa;

    // Branch rectangle: centered at e from left, extends UPWARD from main duct top
    const bCenterX = ox + se;
    const bLeft = bCenterX - sd / 2;
    const bRight = bCenterX + sd / 2;
    const bTop = oy - sl3; // branch top (above main duct)

    // Cross-section panel (right side): a×b rectangle
    const crossAreaX = sideW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / Math.max(a, b);
    const ca = Math.max(a * crossScale, 14);
    const cb = Math.max(b * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    // Branch indicator on cross-section
    const cdCross = Math.max(d * crossScale, 8);
    const cl3Cross = Math.max(l3 * crossScale * 0.4, 8);
    const cfCross = f * crossScale;
    const brCrossX = crossX + cb - cfCross - cdCross / 2;
    const brCrossLeft = brCrossX - cdCross / 2;

    return (
      <g>
        {/* === FRONT VIEW === */}
        {/* Main duct rectangle */}
        <rect x={ox} y={oy} width={sl} height={sa} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Left flange */}
        <line x1={ox} y1={oy - sp} x2={ox} y2={mBot + sp} stroke="#004290" strokeWidth={2} />
        <line x1={ox - sp} y1={oy} x2={ox - sp} y2={mBot} stroke="#004290" strokeWidth={1.2} />

        {/* Right flange */}
        <line x1={mRight} y1={oy - sp} x2={mRight} y2={mBot + sp} stroke="#004290" strokeWidth={2} />
        <line x1={mRight + sp} y1={oy} x2={mRight + sp} y2={mBot} stroke="#004290" strokeWidth={1.2} />

        {/* Branch rectangle — above main duct */}
        <rect x={bLeft} y={bTop} width={sd} height={sl3} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* a dimension — right side of main duct */}
        <line x1={mRight + sp + 10} y1={oy} x2={mRight + sp + 10} y2={mBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={mRight + sp + 18} y={(oy + mBot) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">a</text>

        {/* L dimension — below main duct */}
        <line x1={ox} y1={mBot + 12} x2={mRight} y2={mBot + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(ox + mRight) / 2} y={mBot + 24} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* d dimension — branch width, above branch */}
        <line x1={bLeft} y1={bTop - 8} x2={bRight} y2={bTop - 8}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={bCenterX} y={bTop - 12} textAnchor="middle" fontSize={10} fill="#555555">d</text>

        {/* l3 dimension — branch length, left of branch */}
        <line x1={bLeft - 10} y1={bTop} x2={bLeft - 10} y2={oy}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={bLeft - 20} y={(bTop + oy) / 2 + 4} textAnchor="middle" fontSize={9} fill="#555555">l3</text>

        {/* e dimension — from left duct edge, inside duct */}
        <line x1={ox} y1={oy + sa * 0.3} x2={bCenterX} y2={oy + sa * 0.3}
          stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2" />
        <text x={(ox + bCenterX) / 2} y={oy + sa * 0.3 + 12} textAnchor="middle" fontSize={9} fill="#555555">e</text>

        {/* f dimension — from right duct edge */}
        <line x1={bCenterX} y1={oy + sa * 0.6} x2={mRight} y2={oy + sa * 0.6}
          stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2" />
        <text x={(bCenterX + mRight) / 2} y={oy + sa * 0.6 + 12} textAnchor="middle" fontSize={9} fill="#555555">f</text>

        {/* === CROSS-SECTION === */}
        <text x={crossX + ca / 2} y={crossY - cp - 22} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* Main duct cross-section a×b */}
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Flanges */}
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} />

        {/* Branch indicator on cross-section (d×l3 rectangle above) */}
        <rect x={brCrossLeft} y={crossY - cp - cl3Cross} width={cdCross} height={cl3Cross}
          fill="none" stroke="#004290" strokeWidth={1.2} />

        {/* b dimension — below cross-section */}
        <line x1={crossX} y1={crossY + cb + cp + 10} x2={crossX + ca} y2={crossY + cb + cp + 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY + cb + cp + 22} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* a dimension on cross-section — right side */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderSymmetricTee = () => {
    // TRa: symmetric tee with curved transitions
    // Front view: L-shaped profile with branch going UP, arcs at junctions
    // Cross-section: a × (b+p+r) with d-section and flanges
    const a_val = values[0] || 200;
    const b_val = values[1] || 200;
    const d_val = values[2] || 150;
    const h_val = values[3] || 100;
    const L_val = values[4] || 500;
    const q_val = values[5] || 50;
    const r_val = values[6] || 50;
    const i_val = values[7] || 50;
    const p_val = values[8] || 25;

    // Front view sizing (left panel ~55% width)
    const sideW = width * 0.55;
    const totalW = L_val;
    const totalH = p_val + r_val + b_val;
    const sc = Math.min((sideW - 60) / totalW, (height - 50) / totalH);

    const sL = L_val * sc;
    const sb = b_val * sc;
    const sd = d_val * sc;
    const sh = h_val * sc;
    const sq = Math.max(q_val * sc, 1);
    const sr = Math.max(r_val * sc, 1);
    const si = i_val * sc;
    const sp_val = p_val * sc;
    const fl = Math.min(6, Math.max(3, sd * 0.1));

    // Origin — top-left of drawing area
    const ox = 28;
    const oy = 14;

    // Y positions (SVG: Y increases downward)
    const yBrTop = oy;                           // branch top
    const yPBot = oy + sp_val;                   // bottom of p / top of r arc
    const yILine = oy + sp_val + sr;             // i-line / right wall top
    const yDuctTop = oy + sp_val + sr + sb - sd; // top of left wall
    const yBot = oy + sp_val + sr + sb;          // bottom of duct

    // X positions
    const xL = ox;
    const xR = ox + sL;
    const xIEnd = ox + sL - si;
    const xBrR = ox + sL - si - sr;              // branch right / p section
    const xBrL = ox + sL - si - sr - sh;         // branch left
    const xQEnd = ox + sL - sh - si - sr - sq;   // end of horiz from duct top-left

    // Main profile path
    const profilePath = [
      `M ${xL} ${yBot}`,
      `H ${xR}`,
      `V ${yILine}`,
      `H ${xIEnd}`,
      `A ${sr} ${sr} 0 0 1 ${xBrR} ${yPBot}`,
      `V ${yBrTop}`,
      `H ${xBrL}`,
      `V ${yDuctTop - sq}`,
      `A ${sq} ${sq} 0 0 1 ${xQEnd} ${yDuctTop}`,
      `H ${xL}`,
      `Z`
    ].join(' ');

    // Cross-section panel (right ~45% of width)
    const csAreaX = sideW + 12;
    const csAreaW = width - csAreaX - 8;
    const csFullH_real = b_val + p_val + r_val;
    const csSc = Math.min(csAreaW * 0.55 / a_val, (height - 40) * 0.55 / csFullH_real);
    const ca = Math.max(a_val * csSc, 14);
    const cb = Math.max(b_val * csSc, 10);
    const cd = Math.max(d_val * csSc, 8);
    const cp = Math.max(p_val * csSc, 3);
    const cr = Math.max(r_val * csSc, 3);
    const cf = Math.min(5, Math.max(2, ca * 0.08));

    const csX = csAreaX + (csAreaW - ca) / 2;
    const csTotalH = cb + cp + cr;
    const csY = (height - csTotalH) / 2;
    const csDivY = csY + csTotalH - cd;  // where d section starts
    const csBotY = csY + csTotalH;

    return (
      <g>
        {/* === FRONT VIEW === */}
        <path d={profilePath} fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Left flange */}
        <line x1={xL} y1={yDuctTop - fl} x2={xL} y2={yBot + fl} stroke="#004290" strokeWidth={2} />
        <line x1={xL + fl} y1={yDuctTop} x2={xL + fl} y2={yBot} stroke="#004290" strokeWidth={1.2} />

        {/* Right flange */}
        <line x1={xR} y1={yILine - fl} x2={xR} y2={yBot + fl} stroke="#004290" strokeWidth={2} />
        <line x1={xR - fl} y1={yILine} x2={xR - fl} y2={yBot} stroke="#004290" strokeWidth={1.2} />

        {/* Branch flange (top) */}
        <line x1={xBrL - fl} y1={yBrTop} x2={xBrR + fl} y2={yBrTop} stroke="#004290" strokeWidth={2} />
        <line x1={xBrL} y1={yBrTop + fl} x2={xBrR} y2={yBrTop + fl} stroke="#004290" strokeWidth={1.2} />

        {/* === DIMENSIONS === */}
        {/* L — below duct */}
        <line x1={xL} y1={yBot + 14} x2={xR} y2={yBot + 14}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(xL + xR) / 2} y={yBot + 25} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* d — left side */}
        <line x1={xL - 14} y1={yDuctTop} x2={xL - 14} y2={yBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={xL - 20} y={(yDuctTop + yBot) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>

        {/* b — right side */}
        <line x1={xR + 14} y1={yILine} x2={xR + 14} y2={yBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={xR + 20} y={(yILine + yBot) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>

        {/* h — above branch */}
        <line x1={xBrL} y1={yBrTop - 10} x2={xBrR} y2={yBrTop - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(xBrL + xBrR) / 2} y={yBrTop - 14} textAnchor="middle" fontSize={9} fill="#555555">h</text>

        {/* i — along i-line */}
        <line x1={xIEnd} y1={yILine + 10} x2={xR} y2={yILine + 10}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(xIEnd + xR) / 2} y={yILine + 21} textAnchor="middle" fontSize={9} fill="#555555">i</text>

        {/* p — right of p section */}
        <line x1={xR + 14} y1={yBrTop} x2={xR + 14} y2={yPBot}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={xR + 20} y={(yBrTop + yPBot) / 2 + 4} textAnchor="start" fontSize={9} fill="#555555">p</text>

        {/* r label with radius line */}
        <line x1={xIEnd} y1={yPBot}
              x2={xIEnd - sr * 0.707} y2={yPBot + sr * 0.707}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={xIEnd - sr * 0.35} y={yPBot - 3} fontSize={9} fill="#555555">r</text>

        {/* q label with radius line */}
        <line x1={xQEnd} y1={yDuctTop - sq}
              x2={xQEnd + sq * 0.707} y2={yDuctTop - sq + sq * 0.707}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={xQEnd - 4} y={yDuctTop - sq - 3} textAnchor="end" fontSize={9} fill="#555555">q</text>

        {/* === CROSS-SECTION === */}
        <text x={csX + ca / 2} y={csY - cf - 12} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* Upper section (branch neck: b+p+r-d tall) */}
        <rect x={csX} y={csY} width={ca} height={csTotalH - cd}
          fill="none" stroke="#004290" strokeWidth={1.2} />
        {/* Top flange */}
        <line x1={csX - cf} y1={csY} x2={csX + ca + cf} y2={csY} stroke="#004290" strokeWidth={1.5} />
        <line x1={csX} y1={csY + cf} x2={csX + ca} y2={csY + cf} stroke="#004290" strokeWidth={0.8} />

        {/* Connector lines from neck to d-flange */}
        <line x1={csX - cf} y1={csY + cp + cr - cf} x2={csX} y2={csY + cp + cr - cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX - cf} y1={csY + cp + cr - cf} x2={csX - cf} y2={csDivY - cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca + cf} y1={csY + cp + cr - cf} x2={csX + ca} y2={csY + cp + cr - cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca + cf} y1={csY + cp + cr - cf} x2={csX + ca + cf} y2={csDivY - cf} stroke="#004290" strokeWidth={0.8} />

        {/* Lower d section */}
        <rect x={csX} y={csDivY} width={ca} height={cd}
          fill="none" stroke="#004290" strokeWidth={1.5} />
        {/* d-section flange */}
        <rect x={csX - cf} y={csDivY - cf} width={ca + 2 * cf} height={cd + 2 * cf}
          fill="none" stroke="#004290" strokeWidth={1.2} />

        {/* a dimension — below */}
        <line x1={csX} y1={csBotY + cf + 10} x2={csX + ca} y2={csBotY + cf + 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csX + ca / 2} y={csBotY + cf + 22} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

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
