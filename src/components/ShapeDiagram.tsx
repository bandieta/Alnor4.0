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
    // QBFRa: L-shaped 90° reduction elbow
    // labels: a, b, d, e, f, r
    const a = values[0] || 200;   // z-width (constant)
    const b = values[1] || 200;   // vertical section radial depth (inlet)
    const d = values[2] || 150;   // horizontal section radial depth (outlet)
    const e = values[3] || 150;   // vertical leg below bend
    const f = values[4] || 150;   // horizontal leg beyond bend
    const r = values[5] || 100;   // inner bend radius

    // Use left 60% for side view
    const sideW = width * 0.6;
    const totalH = e + b + r;   // total height of vertical section
    const totalW = d + f + r;   // total horizontal extent

    const sc = Math.min(
      (height - 40) / totalH,
      (sideW - 35) / totalW
    );
    const sb = b * sc, sd = d * sc, se = e * sc, sf = f * sc, sr = r * sc;

    const cornX = 30 + sb;
    const cornY = 18;

    const vBotY = cornY + se + sb;
    const vOuterX = cornX - sb;

    const hRightX = cornX + sf + sr;
    const hOuterY = cornY + sd;

    const flangeY = vBotY;
    const flangeX = hRightX;
    // Actually looking at C# more carefully:
    // p12 = (e-r, d) → inner corner bottom-left  
    // p8 = (e, d+r) → inner corner top
    // Arc from p12 through 75,60,45,30,15 degrees to p8
    // So the arc center is at (e-r, d+r) in C# coords, i.e. shifted

    // Let me simplify: inner wall follows a quarter circle in the corner, outer wall follows approximated curve

    // Inner wall quarter arc: center at (cornX, cornY), from vertical (cornX, cornY+sr) to horizontal (cornX+sr, cornY) — but that's wrong direction
    // Actually: the vertical inner wall is at cornX, going down to cornY. 
    // The horizontal inner wall is at cornY going right from cornX.
    // The inner corner arc connects them with radius r.
    // Arc center: (cornX + sr, cornY + sr)
    // Arc from (cornX, cornY + sr) [bottom of vertical inner before arc] sweeping to (cornX + sr, cornY) [start of horizontal inner after arc]

    const arcCX = cornX + sr;
    const arcCY = cornY + sr;

    // Inner arc points (quarter circle, from 180° to 270° in standard math = from left to bottom)
    // Or more simply: from angle π (pointing left) to angle 3π/2 (pointing down)
    // But in SVG y is flipped. Let me use parametric:
    // At t=0: (cornX, cornY + sr) = vertical side
    // At t=1: (cornX + sr, cornY) = horizontal side
    const arcSteps = 12;
    const innerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const angle = Math.PI / 2 * (1 - i / arcSteps); // from π/2 to 0
      const px = arcCX - sr * Math.cos(angle);
      const py = arcCY - sr * Math.sin(angle);
      innerArc.push(`${px},${py}`);
    }

    // Outer wall: goes from (vOuterX, vBotY) up to around corner to (hRightX, hOuterY)
    // In C# the outer corner uses interpolated points (21,22 on bottom + 23,24 on right side + arc points 25-29)
    // The outer corner is more complex — a blend of straight and curved segments
    // For the 2D drawing, approximate it with a smooth curve
    // Outer path: from bottom of vertical (vOuterX, flangeY) → up to (vOuterX, cornY+sr+sd) → arc → (cornX+sr+sf, hOuterY) → right to flangeX

    // Simple approach: draw the outer path as a smooth quarter-circle-like curve too
    // Outer arc center should maintain the b→d transition
    // Use quadratic bezier as approximation
    const outerArc: string[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const t = i / arcSteps;
      // Interpolate from vertical outer position to horizontal outer position
      const angle = Math.PI / 2 * (1 - t);
      // Outer wall: at t=0 we're at vertical outer (x=vOuterX), at t=1 at horizontal outer (y=hOuterY)  
      // The outer radius effectively changes from (sr+sb) to (sr+sd) through the corner
      const outerR = sr + sb + (sd - sb) * t;
      const px = arcCX - outerR * Math.cos(angle);
      const py = arcCY - outerR * Math.sin(angle);
      outerArc.push(`${px},${py}`);
    }

    // Cross-section
    const crossAreaX = sideW + 10;
    const crossAreaW = width - crossAreaX - 10;
    const crossScale = Math.min(crossAreaW * 0.7, (height - 50) * 0.7) / Math.max(a, b);
    const ca = Math.max(a * crossScale, 14);
    const cb = Math.max(b * crossScale, 14);
    const cdCross = Math.max(d * crossScale, 14);
    const cp = Math.min(6, Math.max(3, ca * 0.08));
    const crossX = crossAreaX + (crossAreaW - ca) / 2;
    const crossY = (height - cb) / 2 + 4;

    return (
      <g>
        <text x={sideW / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">widok z boku</text>

        {/* Inner wall: vertical → arc → horizontal */}
        <line x1={cornX} y1={cornY + sr} x2={cornX} y2={flangeY} stroke="#004290" strokeWidth={1.8} />
        <polyline points={innerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <line x1={cornX + sr} y1={cornY} x2={flangeX} y2={cornY} stroke="#004290" strokeWidth={1.8} />

        {/* Outer wall: vertical → curve → horizontal */}
        <line x1={vOuterX} y1={cornY + sr + sd} x2={vOuterX} y2={flangeY} stroke="#004290" strokeWidth={1.8} />
        <polyline points={outerArc.join(' ')} fill="none" stroke="#004290" strokeWidth={1.8} />
        <line x1={cornX + sr + sf} y1={hOuterY} x2={flangeX} y2={hOuterY} stroke="#004290" strokeWidth={1.8} />

        {/* Flanges */}
        <line x1={vOuterX - 3} y1={flangeY} x2={cornX + 3} y2={flangeY} stroke="#004290" strokeWidth={2} />
        <line x1={flangeX} y1={cornY - 3} x2={flangeX} y2={hOuterY + 3} stroke="#004290" strokeWidth={2} />

        {/* b dimension — vertical leg width */}
        <line x1={vOuterX} y1={flangeY + 12} x2={cornX} y2={flangeY + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={(vOuterX + cornX) / 2} y={flangeY + 24} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* d dimension — horizontal leg width */}
        <line x1={flangeX + 12} y1={cornY} x2={flangeX + 12} y2={hOuterY}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={flangeX + 22} y={(cornY + hOuterY) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">d</text>

        {/* e dimension — vertical leg height */}
        <line x1={cornX + 10} y1={cornY + sr} x2={cornX + 10} y2={flangeY}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={cornX + 18} y={cornY + sr + (flangeY - cornY - sr) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">e</text>

        {/* f dimension — horizontal leg length */}
        <line x1={cornX + sr} y1={hOuterY + 12} x2={flangeX} y2={hOuterY + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={cornX + sr + sf / 2} y={hOuterY + 24} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* r dimension — inner radius */}
        {sr > 4 && (
          <>
            <line x1={arcCX} y1={arcCY} x2={arcCX - sr * Math.cos(Math.PI / 4)} y2={arcCY - sr * Math.sin(Math.PI / 4)}
              stroke="#9b9b9b" strokeWidth={0.7} strokeDasharray="3 2" />
            <text x={arcCX - sr * 0.3} y={arcCY - sr * 0.3 - 3} textAnchor="middle" fontSize={9} fill="#555555">r</text>
          </>
        )}

        {/* Cross-section */}
        <text x={crossX + ca / 2} y={10} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>
        {/* Solid: a×b (inlet) */}
        <rect x={crossX} y={crossY} width={ca} height={cb}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={crossX - cp} y={crossY - cp} width={ca + 2 * cp} height={cb + 2 * cp}
          fill="none" stroke="#004290" strokeWidth={1.2} strokeDasharray="4 2" />
        {/* Dashed: a×d (outlet, centered) */}
        <rect x={crossX} y={crossY + (cb - cdCross) / 2} width={ca} height={cdCross}
          fill="none" stroke="#9b9b9b" strokeWidth={1} strokeDasharray="3 2" />

        {/* a dimension */}
        <line x1={crossX} y1={crossY - cp - 10} x2={crossX + ca} y2={crossY - cp - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca / 2} y={crossY - cp - 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* b dimension (right of cross) */}
        <line x1={crossX + ca + cp + 8} y1={crossY} x2={crossX + ca + cp + 8} y2={crossY + cb}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={crossX + ca + cp + 18} y={crossY + cb / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

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
