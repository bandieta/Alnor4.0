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
      case 'QBa': return renderQBa();
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
      case 'QPR3a': return renderSymmetricOffset();
      case 'QPR4a': return renderAsymmetricOffset();
      case 'TR6a': return renderPipeSaddle();
      case 'CZ1a': return renderRectCrossJunction();
      case 'CZ2a': return renderRoundCrossJunction();
      case 'TR3a': return renderEagleTee();
      case 'TR4a': return renderRadiusTee();
      case 'TR5a': return renderPortTee();
      case 'QD1a': return renderAngledDuct();
      case 'QD2a': return renderPerpendicularDuct();
      case 'TR7a': return renderSkewTee();
      case 'TR8a': return renderCoaxialSkewTee();
      case 'TR9a': return renderCoaxialTee();
      default: return renderRectangularDuct();
    }
  };

  const renderRectangularDuct = () => {
    // QDa port aligned to Form1.cs drawing sequence.
    let a = values[0] || 200;
    let b = values[1] || 200;
    let l = values[2] || 500;

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let max = Math.max(a, b, l, p);
    const mnoznik = 80;
    a = (a / max) * mnoznik;
    b = (b / max) * mnoznik;
    l = (l / max) * mnoznik;
    p = (p / max) * mnoznik;

    while ((l + 20) < 150 && (a + 20) < 100 && (b + 20) < 100) {
      a *= 1.1;
      b *= 1.1;
      l *= 1.1;
      p *= 1.1;
    }

    let pushX = ((110 - a - l) % 110) / 2;
    if (pushX < 0) pushX = -pushX;
    const pushY = ((90 - b) / 2) + 5;

    const rightViewOffset = 20;

    const small = {
      x0: 190 + pushX + rightViewOffset,
      y0: 20 + pushY,
      x1: 190 + pushX + rightViewOffset + a,
      y1: 20 + pushY + b,
    };

    const big = {
      x0: 190 - p + pushX + rightViewOffset,
      y0: 20 - p + pushY,
      x1: 190 + p + a + pushX + rightViewOffset,
      y1: 20 + p + b + pushY,
    };

    const side = {
      x0: 20 + pushX,
      y0: 20 + pushY,
      x1: 20 + l + pushX,
      y1: 20 + b + pushY,
    };

    // Form1 mutates punkty2[0]/[3] by -p before drawing the side polygon.
    const sidePoly = {
      x0: side.x0 - p,
      y0: side.y0,
      x1: side.x1,
      y1: side.y1,
    };

    const flangeRight = {
      x1: side.x1,
      y1: side.y0 - p,
      x2: side.x1,
      y2: side.y1 + p,
    };
    const flangeInnerLeft = {
      x1: side.x1 - p,
      y1: side.y0,
      x2: side.x1 - p,
      y2: side.y1,
    };
    const flangeInnerRight = {
      x1: side.x0,
      y1: side.y0,
      x2: side.x0,
      y2: side.y1,
    };
    const flangeLeft = {
      x1: side.x0 - p,
      y1: side.y0 - p,
      x2: side.x0 - p,
      y2: side.y1 + p,
    };

    const aDimY = small.y0 - 15;
    const lDimY = sidePoly.y1 + 15;
    const bDimX = side.x1 + 15;
    const bDimY2 = side.y1;

    return (
      <g>
        {/* Form1 flange extension lines around side view */}
        <line x1={flangeRight.x1} y1={flangeRight.y1} x2={flangeRight.x2} y2={flangeRight.y2} stroke="#004290" strokeWidth={1.4} />
        <line x1={flangeInnerLeft.x1} y1={flangeInnerLeft.y1} x2={flangeInnerLeft.x2} y2={flangeInnerLeft.y2} stroke="#004290" strokeWidth={1.2} />
        <line x1={flangeInnerRight.x1} y1={flangeInnerRight.y1} x2={flangeInnerRight.x2} y2={flangeInnerRight.y2} stroke="#004290" strokeWidth={1.2} />
        <line x1={flangeLeft.x1} y1={flangeLeft.y1} x2={flangeLeft.x2} y2={flangeLeft.y2} stroke="#004290" strokeWidth={1.4} />

        {/* Main outlines */}
        <rect x={small.x0} y={small.y0} width={small.x1 - small.x0} height={small.y1 - small.y0}
          fill="none" stroke="#004290" strokeWidth={1.6} />
        <rect x={big.x0} y={big.y0} width={big.x1 - big.x0} height={big.y1 - big.y0}
          fill="none" stroke="#004290" strokeWidth={1.2} />
        <rect x={sidePoly.x0} y={sidePoly.y0} width={sidePoly.x1 - sidePoly.x0} height={sidePoly.y1 - sidePoly.y0}
          fill="none" stroke="#004290" strokeWidth={1.6} />

        {/* a dimension (top of right view) */}
        <line x1={small.x0} y1={aDimY} x2={small.x1} y2={aDimY}
          stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <line x1={small.x0} y1={aDimY - 3} x2={small.x0} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={small.x1} y1={aDimY - 3} x2={small.x1} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(small.x0 + small.x1) / 2} y={aDimY - 11} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* L dimension (below side view) */}
        <line x1={sidePoly.x1} y1={lDimY} x2={sidePoly.x0} y2={lDimY}
          stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <line x1={sidePoly.x1} y1={lDimY - 3} x2={sidePoly.x1} y2={lDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={sidePoly.x0} y1={lDimY - 3} x2={sidePoly.x0} y2={lDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(sidePoly.x0 + sidePoly.x1) / 2} y={lDimY + 16} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* b dimension (right of side view) */}
        <line x1={bDimX} y1={side.y0} x2={bDimX} y2={bDimY2}
          stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <line x1={bDimX - 3} y1={side.y0} x2={bDimX + 3} y2={side.y0} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={bDimX - 3} y1={bDimY2} x2={bDimX + 3} y2={bDimY2} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={bDimX + 5} y={(side.y0 + bDimY2) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderQBa = () => {
    // QBa port aligned with Form1.cs geometry block.
    const rawA = values[0] || 200;
    const rawB = values[1] || 200;
    const rawE = values[2] || 150;
    const rawF = values[3] || 150;
    const rawR = values[4] || 200;

    let a = Math.max(rawA, 1);
    let b = Math.max(rawB, 1);
    let e = Math.max(rawE, 1);
    let f = Math.max(rawF, 1);
    let r = rawR < 100 ? 0 : Math.max(rawR, 0);

      let pRaw = Math.max(rawA, rawB) > 2501 ? 40 : Math.max(rawA, rawB) > 1000 ? 30 : 25;
      let maxNorm = Math.max(a, b) + r + e;
      maxNorm = Math.max(maxNorm, pRaw, f, e, 1);

      const scale = 80 / maxNorm;
      a *= scale;
      b *= scale;
      e *= scale;
      f *= scale;
      r *= scale;
      const p = pRaw * scale;

      const l = 3;
      let pushX = ((110 - a - l) % 110) / 2;
      if (pushX < 0) pushX = -pushX;
      const pushY = (90 - b) / 2 + 5;

      const small = {
        x0: 190 + pushX,
        y0: 20 + pushY,
        x1: 190 + pushX + a,
        y1: 20 + pushY + b,
      };

      const big = {
        x0: 190 + pushX - p,
        y0: 20 + pushY - p,
        x1: 190 + pushX + a + p,
        y1: 20 + pushY + b + p,
      };

      const left = {
        x0: 20 + pushX,
        y0: 20 + pushY,
        x1: 20 + pushX + f,
        y1: 20 + pushY + b,
      };

      const underSmall = {
        x0: small.x0,
        y0: small.y1,
        x1: small.x1,
        y1: small.y1 + r,
      };

      const underSmallE = {
        x0: underSmall.x0,
        y0: underSmall.y1,
        x1: underSmall.x1,
        y1: underSmall.y1 + e,
      };

      const lower = {
        x0: left.x1 + r,
        y0: left.y1 + r,
        x1: left.x1 + r + b,
        y1: left.y1 + r + e,
      };

      const innerRect = r === 0
        ? { x: left.x1 - b, y: left.y0, w: 2 * b, h: 2 * b }
        : {
            x: 2 * left.x1 - lower.x0,
            y: left.y1,
            w: 2 * (lower.x0 - left.x1),
            h: 2 * (lower.y0 - left.y1),
          };

      const outerRect = {
        x: 2 * left.x1 - lower.x1,
        y: left.y0,
        w: 2 * (lower.x1 - left.x1),
        h: 2 * (lower.y0 - left.y0),
      };

      const quarterArcPath = (rect: { x: number; y: number; w: number; h: number }) => {
        const rx = rect.w / 2;
        const ry = rect.h / 2;
        const cx = rect.x + rx;
        const cy = rect.y + ry;
        const startX = cx;
        const startY = cy - ry;
        const endX = cx + rx;
        const endY = cy;
        return `M ${startX} ${startY} A ${rx} ${ry} 0 0 1 ${endX} ${endY}`;
      };

      return (
        <g>
          <rect x={left.x0} y={left.y0} width={left.x1 - left.x0} height={left.y1 - left.y0}
            fill="none" stroke="#004290" strokeWidth={1.6} />
          <line x1={left.x1} y1={left.y0} x2={left.x1} y2={left.y1} stroke="#004290" strokeWidth={1.2} />
          <line x1={left.x0 + p} y1={left.y0} x2={left.x0 + p} y2={left.y1} stroke="#004290" strokeWidth={1.1} />

          <rect x={lower.x0} y={lower.y0} width={lower.x1 - lower.x0} height={lower.y1 - lower.y0}
            fill="none" stroke="#004290" strokeWidth={1.6} />
          <line x1={lower.x0} y1={lower.y0} x2={lower.x1} y2={lower.y0} stroke="#004290" strokeWidth={1.2} />
          <line x1={lower.x0} y1={lower.y1 - p} x2={lower.x1} y2={lower.y1 - p} stroke="#004290" strokeWidth={1.1} />

          <rect x={underSmall.x0} y={underSmall.y0} width={underSmall.x1 - underSmall.x0} height={underSmall.y1 - underSmall.y0}
            fill="none" stroke="#004290" strokeWidth={1.2} />
          <rect x={underSmallE.x0} y={underSmallE.y0} width={underSmallE.x1 - underSmallE.x0} height={underSmallE.y1 - underSmallE.y0}
            fill="none" stroke="#004290" strokeWidth={1.2} />

          <path d={quarterArcPath(innerRect)} fill="none" stroke="#004290" strokeWidth={1.6} />
          {r > 0 && <path d={quarterArcPath(outerRect)} fill="none" stroke="#004290" strokeWidth={1.6} />}

          <line x1={left.x1} y1={lower.y0} x2={left.x1 + r} y2={left.y1}
            stroke="#9b9b9b" strokeWidth={0.9} />
          <text x={left.x1 + r + 3} y={left.y1 - 8} fontSize={10} fill="#555555">r</text>

          <rect x={big.x0} y={big.y0} width={big.x1 - big.x0} height={big.y1 - big.y0}
            fill="none" stroke="#004290" strokeWidth={1.2} />
          <rect x={small.x0} y={small.y0} width={small.x1 - small.x0} height={small.y1 - small.y0}
            fill="none" stroke="#004290" strokeWidth={1.6} />

          <line x1={left.x0} y1={left.y0 - 15} x2={left.x1} y2={left.y0 - 15}
            stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
          <text x={(left.x0 + left.x1) / 2} y={left.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">f</text>

          <line x1={left.x0 - 15} y1={left.y0} x2={left.x0 - 15} y2={left.y1}
            stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
          <text x={left.x0 - 24} y={(left.y0 + left.y1) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>

          <line x1={lower.x0 - 15} y1={lower.y0} x2={lower.x0 - 15} y2={lower.y1}
            stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
          <text x={lower.x0 - 7} y={(lower.y0 + lower.y1) / 2 + 4} textAnchor="middle" fontSize={10} fill="#555555">e</text>

          <line x1={small.x0} y1={small.y0 - 15} x2={small.x1} y2={small.y0 - 15}
            stroke="#9b9b9b" strokeWidth={0.9} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
          <text x={(small.x0 + small.x1) / 2} y={small.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">a</text>
        </g>
      );
  };

  const renderSymmetricBend = () => {
    // QBNa: symmetric bend — variable angle — parameters: a, b, e, f, r, alfa (degrees)
    const a = values[0] || 200;
    const b = values[1] || 200;
    const e = values[2] || 150;
    const f = values[3] || 150;
    const r = values[4] || 200;
    const alfa = values[5] || 60;
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

  const renderSymmetricOffset = () => {
    // QPR3a: symmetric offset — side view + cross-section
    // Params: a, b, e, L, m, h
    const a_val = values[0] || 200;
    const b_val = values[1] || 200;
    const e_val = values[2] || 100;
    const L_val = values[3] || 500;
    const m_val = values[4] || 80;
    const h_val = values[5] || 80;

    const alfa = Math.atan(e_val / L_val);
    const beta = alfa / 2;
    const m1 = Math.tan(beta) * b_val;

    // Side view (left ~55% of width)
    const sideW = width * 0.55;
    const totalW = L_val;
    const totalH = b_val + e_val;
    const sc = Math.min((sideW - 55) / totalW, (height - 50) / totalH);

    const sL = L_val * sc;
    const sb = b_val * sc;
    const se = e_val * sc;
    const sm = m_val * sc;
    const sh = h_val * sc;
    const sm1 = m1 * sc;
    const fl = Math.min(6, Math.max(3, sb * 0.08));

    const ox = 28;
    const oy = 12;

    // Upper inlet section (top-left, shifted down by e from top)
    const u0 = { x: ox, y: oy + se };              // top-left
    const u7 = { x: ox, y: oy + se + sb };           // bottom-left

    // Lower outlet section (bottom-right)
    const l1 = { x: ox + sL, y: oy };                // top-right
    const l2 = { x: ox + sL, y: oy + sb };           // bottom-right

    // Diagonal connections: u1→l0 (top), u6→l3 (bottom)
    // But C# shows: punkty2[1,2] is upper section, punkty3[0,3] is lower section
    // Actually from C#: upper section top-right = (m, e), connects to lower section top-left = (l-h-m1, 0)
    // And upper section bottom-right = (m+m1, e+b), connects to lower section bottom-left = (l-h, b)

    const diagTopStart = { x: ox + sm, y: oy + se };
    const diagTopEnd = { x: ox + sL - sh - sm1, y: oy };
    const diagBotStart = { x: ox + sm + sm1, y: oy + se + sb };
    const diagBotEnd = { x: ox + sL - sh, y: oy + sb };

    // Cross-section panel (right side)
    const csAreaX = sideW + 12;
    const csAreaW = width - csAreaX - 8;
    const csFullH = b_val + e_val;
    const csSc = Math.min(csAreaW * 0.55 / a_val, (height - 40) * 0.55 / csFullH);
    const ca = Math.max(a_val * csSc, 14);
    const cb = Math.max(b_val * csSc, 10);
    const ce = Math.max(e_val * csSc, 5);
    const cf = Math.min(5, Math.max(2, ca * 0.08));

    const csX = csAreaX + (csAreaW - ca) / 2;
    const csY = (height - cb - ce) / 2;
    const csBotY = csY + cb + ce;

    return (
      <g>
        {/* === SIDE VIEW === */}
        {/* Upper inlet section */}
        <polygon
          points={`${u0.x},${u0.y} ${diagTopStart.x},${diagTopStart.y} ${diagBotStart.x},${diagBotStart.y} ${u7.x},${u7.y}`}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Lower outlet section */}
        <polygon
          points={`${diagTopEnd.x},${diagTopEnd.y} ${l1.x},${l1.y} ${l2.x},${l2.y} ${diagBotEnd.x},${diagBotEnd.y}`}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Diagonal connections */}
        <line x1={diagTopStart.x} y1={diagTopStart.y} x2={diagTopEnd.x} y2={diagTopEnd.y}
          stroke="#004290" strokeWidth={1.8} />
        <line x1={diagBotStart.x} y1={diagBotStart.y} x2={diagBotEnd.x} y2={diagBotEnd.y}
          stroke="#004290" strokeWidth={1.8} />

        {/* Left flange (upper inlet) */}
        <line x1={u0.x} y1={u0.y - fl} x2={u0.x} y2={u7.y + fl} stroke="#004290" strokeWidth={2} />
        <line x1={u0.x + fl} y1={u0.y} x2={u0.x + fl} y2={u7.y} stroke="#004290" strokeWidth={1.2} />

        {/* Right flange (lower outlet) */}
        <line x1={l1.x} y1={l1.y - fl} x2={l1.x} y2={l2.y + fl} stroke="#004290" strokeWidth={2} />
        <line x1={l1.x - fl} y1={l1.y} x2={l1.x - fl} y2={l2.y} stroke="#004290" strokeWidth={1.2} />

        {/* === DIMENSIONS === */}
        {/* L — above everything */}
        <line x1={ox} y1={oy - 12} x2={ox + sL} y2={oy - 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL / 2} y={oy - 16} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* b — left side of upper section */}
        <line x1={ox - 12} y1={u0.y} x2={ox - 12} y2={u7.y}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 18} y={(u0.y + u7.y) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">b</text>

        {/* e — left side, offset distance */}
        <line x1={ox - 12} y1={oy} x2={ox - 12} y2={oy + se}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 18} y={oy + se / 2 + 4} textAnchor="end" fontSize={9} fill="#555555">e</text>

        {/* m — below upper section */}
        <line x1={ox} y1={u7.y + 12} x2={ox + sm} y2={u7.y + 12}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sm / 2} y={u7.y + 23} textAnchor="middle" fontSize={9} fill="#555555">m</text>

        {/* h — below lower section */}
        <line x1={ox + sL - sh} y1={l2.y + 12} x2={ox + sL} y2={l2.y + 12}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL - sh / 2} y={l2.y + 23} textAnchor="middle" fontSize={9} fill="#555555">h</text>

        {/* === CROSS-SECTION === */}
        <text x={csX + ca / 2} y={csY - cf - 12} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* Full rectangle a × (b+e) */}
        <rect x={csX} y={csY} width={ca} height={cb + ce}
          fill="none" stroke="#004290" strokeWidth={1.2} />

        {/* Top flange */}
        <line x1={csX - cf} y1={csY} x2={csX + ca + cf} y2={csY} stroke="#004290" strokeWidth={1.5} />
        <line x1={csX - cf} y1={csY} x2={csX - cf} y2={csY + cb + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca + cf} y1={csY} x2={csX + ca + cf} y2={csY + cb + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX} y1={csY + cb + cf} x2={csX - cf} y2={csY + cb + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca} y1={csY + cb + cf} x2={csX + ca + cf} y2={csY + cb + cf} stroke="#004290" strokeWidth={0.8} />

        {/* b section line */}
        <line x1={csX} y1={csY + ce} x2={csX + ca} y2={csY + ce}
          stroke="#004290" strokeWidth={0.8} strokeDasharray="3 2" />

        {/* a dimension — below */}
        <line x1={csX} y1={csBotY + cf + 10} x2={csX + ca} y2={csBotY + cf + 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csX + ca / 2} y={csBotY + cf + 22} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderAsymmetricOffset = () => {
    // QPR4a: asymmetric offset — inlet d, outlet b, offset e
    const a_val = values[0] || 200;
    const b_val = values[1] || 200;
    const d_val = values[2] || 150;
    const e_val = values[3] || 100;
    const L_val = values[4] || 500;
    const m_val = values[5] || 80;
    const h_val = values[6] || 80;

    const alfa = Math.atan(e_val / L_val);
    const beta = alfa / 2;
    const m1 = Math.tan(beta) * b_val;

    // Side view (left ~55% of width)
    const sideW = width * 0.55;
    const maxH = Math.max(d_val + e_val, b_val + e_val);
    const sc = Math.min((sideW - 55) / L_val, (height - 50) / maxH);

    const sL = L_val * sc;
    const sb = b_val * sc;
    const sd = d_val * sc;
    const se = e_val * sc;
    const sm = m_val * sc;
    const sh = h_val * sc;
    const sm1 = m1 * sc;
    const fl = Math.min(6, Math.max(3, Math.max(sb, sd) * 0.08));

    const ox = 28;
    const oy = 12;

    // Inlet section (left, height d, shifted down by e)
    const inTop = oy + se;
    const inBot = oy + se + sd;

    // Outlet section (right, height b)
    const outTop = oy;
    const outBot = oy + sb;

    // Inlet quad: trapezoid with top going to diagonal
    const i0 = { x: ox, y: inTop };                     // inlet top-left
    const i1 = { x: ox + sm, y: inTop };                 // inlet top at m
    const i1d = { x: ox + sm + sm1, y: inBot };           // diagonal bottom start
    const i7 = { x: ox, y: inBot };                       // inlet bottom-left

    // Outlet quad
    const o0 = { x: ox + sL - sh - sm1, y: outTop };     // outlet top, diagonal end
    const o1 = { x: ox + sL, y: outTop };                 // outlet top-right
    const o2 = { x: ox + sL, y: outBot };                 // outlet bottom-right
    const o3 = { x: ox + sL - sh, y: outBot };            // outlet bottom-left

    // Cross-section panel
    const csAreaX = sideW + 12;
    const csAreaW = width - csAreaX - 8;
    const csFullH = Math.max(d_val, b_val) + e_val;
    const csSc = Math.min(csAreaW * 0.55 / a_val, (height - 40) * 0.55 / csFullH);
    const ca = Math.max(a_val * csSc, 14);
    const cbd = Math.max(d_val * csSc, 8);
    const cbb = Math.max(b_val * csSc, 8);
    const ce = Math.max(e_val * csSc, 5);
    const cf = Math.min(5, Math.max(2, ca * 0.08));

    const csX = csAreaX + (csAreaW - ca) / 2;
    const csY = (height - Math.max(cbd, cbb) - ce) / 2;
    const csBotY = csY + cbd + ce;

    return (
      <g>
        {/* === SIDE VIEW === */}
        {/* Inlet section (trapezoid) */}
        <polygon
          points={`${i0.x},${i0.y} ${i1.x},${i1.y} ${i1d.x},${i1d.y} ${i7.x},${i7.y}`}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Outlet section */}
        <polygon
          points={`${o0.x},${o0.y} ${o1.x},${o1.y} ${o2.x},${o2.y} ${o3.x},${o3.y}`}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Diagonal connections */}
        <line x1={i1.x} y1={i1.y} x2={o0.x} y2={o0.y}
          stroke="#004290" strokeWidth={1.8} />
        <line x1={i1d.x} y1={i1d.y} x2={o3.x} y2={o3.y}
          stroke="#004290" strokeWidth={1.8} />

        {/* Left flange (inlet) */}
        <line x1={i0.x} y1={i0.y - fl} x2={i0.x} y2={i7.y + fl} stroke="#004290" strokeWidth={2} />
        <line x1={i0.x + fl} y1={i0.y} x2={i0.x + fl} y2={i7.y} stroke="#004290" strokeWidth={1.2} />

        {/* Right flange (outlet) */}
        <line x1={o1.x} y1={o1.y - fl} x2={o1.x} y2={o2.y + fl} stroke="#004290" strokeWidth={2} />
        <line x1={o1.x - fl} y1={o1.y} x2={o1.x - fl} y2={o2.y} stroke="#004290" strokeWidth={1.2} />

        {/* === DIMENSIONS === */}
        {/* L — above */}
        <line x1={ox} y1={oy - 12} x2={ox + sL} y2={oy - 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL / 2} y={oy - 16} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* d — left side (inlet height) */}
        <line x1={ox - 12} y1={inTop} x2={ox - 12} y2={inBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 18} y={(inTop + inBot) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>

        {/* b — right side (outlet height) */}
        <line x1={o1.x + 12} y1={outTop} x2={o1.x + 12} y2={outBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={o1.x + 18} y={(outTop + outBot) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>

        {/* e — left side, offset distance */}
        <line x1={ox - 12} y1={oy} x2={ox - 12} y2={oy + se}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 18} y={oy + se / 2 + 4} textAnchor="end" fontSize={9} fill="#555555">e</text>

        {/* m — below inlet */}
        <line x1={ox} y1={inBot + 12} x2={ox + sm} y2={inBot + 12}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sm / 2} y={inBot + 23} textAnchor="middle" fontSize={9} fill="#555555">m</text>

        {/* h — below outlet */}
        <line x1={ox + sL - sh} y1={outBot + 12} x2={ox + sL} y2={outBot + 12}
          stroke="#9b9b9b" strokeWidth={0.7} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL - sh / 2} y={outBot + 23} textAnchor="middle" fontSize={9} fill="#555555">h</text>

        {/* === CROSS-SECTION === */}
        <text x={csX + ca / 2} y={csY - cf - 12} textAnchor="middle" fontSize={9} fill="#9b9b9b">przekrój</text>

        {/* Inlet cross-section a × d (top) */}
        <rect x={csX} y={csY} width={ca} height={cbd}
          fill="none" stroke="#004290" strokeWidth={1.2} />
        {/* Inlet flange */}
        <line x1={csX - cf} y1={csY} x2={csX + ca + cf} y2={csY} stroke="#004290" strokeWidth={1.5} />
        <line x1={csX - cf} y1={csY} x2={csX - cf} y2={csY + cbd + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca + cf} y1={csY} x2={csX + ca + cf} y2={csY + cbd + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX} y1={csY + cbd + cf} x2={csX - cf} y2={csY + cbd + cf} stroke="#004290" strokeWidth={0.8} />
        <line x1={csX + ca} y1={csY + cbd + cf} x2={csX + ca + cf} y2={csY + cbd + cf} stroke="#004290" strokeWidth={0.8} />

        {/* Outlet cross-section a × b (bottom) */}
        <rect x={csX} y={csY + ce} width={ca} height={cbb}
          fill="none" stroke="#004290" strokeWidth={1.2} />
        {/* Outlet flange */}
        <rect x={csX - cf} y={csY + ce - cf} width={ca + 2 * cf} height={cbb + 2 * cf}
          fill="none" stroke="#004290" strokeWidth={0.8} />

        {/* a dimension — below */}
        <line x1={csX} y1={csBotY + cf + 10} x2={csX + ca} y2={csBotY + cf + 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csX + ca / 2} y={csBotY + cf + 22} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderPipeSaddle = () => {
    // TR6a: pipe saddle — side view (left) + cross-section (right)
    // Params: a (pipe diameter), e (saddle width along pipe), f (saddle rect width), L (pipe length), g (saddle rect height)
    const a_val = values[0] || 300;
    const e_val = values[1] || 150;
    const f_val = values[2] || 100;
    const L_val = values[3] || 500;
    const g_val = values[4] || 80;

    // Pipe wrap depth: how far saddle extends into pipe at f/2
    const r = a_val / 2;
    const wrapDepth = r - Math.sqrt(Math.max(0, r * r - (f_val / 2) * (f_val / 2)));
    // Scale for side view (left ~60%)
    const sideW = width * 0.55;
    const sideSc = Math.min((sideW - 60) / L_val, (height - 55) / (g_val + a_val));
    const sL = L_val * sideSc;
    const sA = a_val * sideSc;
    const sE = e_val * sideSc;
    const sG = g_val * sideSc;
    const sWrap = wrapDepth * sideSc;
    const sSaddleH = sG + sWrap;
    const sP = Math.min(8, Math.max(3, sE * 0.06));

    const pushY = 18;
    const sideOx = 28;

    // Saddle rect in side view: e wide, centered on L
    const sadX = sideOx + (sL - sE) / 2;
    const sadY = pushY;
    const pipeTop = pushY + sG;
    const pipeBot = pushY + sG + sA;

    // Scale for cross-section (right panel)
    const csOx = sideOx + sL + 50;
    const csAvailW = width - csOx - 25;
    const totalCsH = g_val + a_val;
    const csSc = Math.min((csAvailW - 10) / f_val, (height - 55) / totalCsH);
    const sF = f_val * csSc;
    const csG = g_val * csSc;
    const csR = a_val * csSc / 2;
    const csP = Math.min(8, Math.max(3, sF * 0.08));

    // Cross-section rect top-left
    const csRX = csOx;
    const csRY = pushY;
    // Pipe center in cross-section
    const csCy = csRY + csG + csR;
    // Connection points on pipe circle
    const yAtEdge = Math.sqrt(Math.max(0, csR * csR - (sF / 2) * (sF / 2)));
    const connY = csCy - yAtEdge;

    return (
      <g>
        {/* === SIDE VIEW (left) === */}

        {/* Saddle rect in side view: e wide, extends g + wrapDepth deep */}
        <rect x={sadX} y={sadY} width={sE} height={sSaddleH}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flanges at saddle top */}
        <line x1={sadX - sP} y1={sadY} x2={sadX + sE + sP} y2={sadY}
          stroke="#004290" strokeWidth={2} />
        <line x1={sadX} y1={sadY + sP} x2={sadX + sE} y2={sadY + sP}
          stroke="#004290" strokeWidth={1} />

        {/* Dashed line at g height (boundary between flat and wrapped portions) */}
        <line x1={sadX} y1={sadY + sG} x2={sadX + sE} y2={sadY + sG}
          stroke="#004290" strokeWidth={0.8} strokeDasharray="3 2" />

        {/* e dimension — above saddle */}
        <line x1={sadX} y1={sadY - 10} x2={sadX + sE} y2={sadY - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sadX + sE / 2} y={sadY - 14} textAnchor="middle" fontSize={9} fill="#555555">e</text>

        {/* g dimension — right of saddle (from top to dashed g line) */}
        <line x1={sadX + sE + 12} y1={sadY} x2={sadX + sE + 12} y2={sadY + sG}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sadX + sE + 18} y={sadY + sG / 2 + 4} textAnchor="start" fontSize={9} fill="#555555">g</text>

        {/* L dimension — below pipe area */}
        <line x1={sideOx} y1={pipeBot + 12} x2={sideOx + sL} y2={pipeBot + 12}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sideOx + sL / 2} y={pipeBot + 24} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* a dimension — left of pipe area */}
        <line x1={sideOx - 12} y1={pipeTop} x2={sideOx - 12} y2={pipeBot}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={sideOx - 18} y={pipeTop + sA / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">a</text>

        {/* === CROSS-SECTION (right) === */}

        {/* Saddle f×g rectangle */}
        <rect x={csRX} y={csRY} width={sF} height={csG}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Flange accent at bottom of saddle rect */}
        <line x1={csRX + 1} y1={csRY + csG} x2={csRX + sF - 1} y2={csRY + csG}
          stroke="#004290" strokeWidth={2} />

        {/* Connection lines from saddle bottom corners down to pipe circle */}
        <line x1={csRX} y1={csRY + csG} x2={csRX} y2={connY}
          stroke="#004290" strokeWidth={1.5} />
        <line x1={csRX + sF} y1={csRY + csG} x2={csRX + sF} y2={connY}
          stroke="#004290" strokeWidth={1.5} />

        {/* Pipe arc between connection points (top of pipe) */}
        <path d={`M ${csRX} ${connY} A ${csR} ${csR} 0 0 1 ${csRX + sF} ${connY}`}
          fill="none" stroke="#004290" strokeWidth={1.5} />

        {/* Flanges at top of saddle rect */}
        <line x1={csRX - csP} y1={csRY} x2={csRX + sF + csP} y2={csRY}
          stroke="#004290" strokeWidth={2} />
        <line x1={csRX} y1={csRY + csP} x2={csRX + sF} y2={csRY + csP}
          stroke="#004290" strokeWidth={1} />

        {/* f dimension — above cross-section */}
        <line x1={csRX} y1={csRY - 10} x2={csRX + sF} y2={csRY - 10}
          stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csRX + sF / 2} y={csRY - 14} textAnchor="middle" fontSize={9} fill="#555555">f</text>
      </g>
    );
  };

  const renderRectCrossJunction = () => {
    // CZ1a: cross-junction with rectangular branches
    // Side view (left) + cross-section (right)
    // labels: a, b, d, w, L, d1, w1, e1, f1, e, f, l3, l4
    const a_val  = values[0] || 400;
    const b_val  = values[1] || 300;
    const d_val  = values[2] || 200;
    const w_val  = values[3] || 150;
    const L_val  = values[4] || 800;
    const d1_val = values[5] || 200;
    const w1_val = values[6] || 150;
    const e1_val = values[7] || 200;
    const f1_val = values[8] || 200;
    const e_val  = values[9] || 200;
    const f_val  = values[10] || 200;
    const l3_val = values[11] || 250;
    const l4_val = values[12] || 250;

    const totalH = l3_val + b_val + l4_val;

    // Side view scaling (left ~55%)
    const svW = width * 0.52;
    const svSc = Math.min((svW - 50) / L_val, (height - 50) / totalH);
    const sL = L_val * svSc;
    const sB = b_val * svSc;
    const sW = w_val * svSc;
    const sW1 = w1_val * svSc;
    const sL3 = l3_val * svSc;
    const sL4 = l4_val * svSc;
    const sE = e_val * svSc;
    const sE1 = e1_val * svSc;
    const sP = Math.min(6, Math.max(2, sB * 0.06));

    const ox = 25;
    const oy = 16 + sL3;

    // Cross-section scaling (right panel)
    const csOx = ox + sL + 45;
    const csAvail = width - csOx - 20;
    const csSc = Math.min((csAvail - 10) / a_val, (height - 50) / totalH);
    const csA = a_val * csSc;
    const csB = b_val * csSc;
    const csD = d_val * csSc;
    const csD1 = d1_val * csSc;
    const csF = f_val * csSc;
    const csF1 = f1_val * csSc;
    const csL3 = l3_val * csSc;
    const csL4 = l4_val * csSc;
    const csP = Math.min(6, Math.max(2, csA * 0.06));

    const csx = csOx;
    const csy = 16 + csL3;

    return (
      <g>
        {/* === SIDE VIEW (left) === */}
        {/* Main duct */}
        <rect x={ox} y={oy} width={sL} height={sB}
          fill="none" stroke="#004290" strokeWidth={1.8} />

        {/* Left flange */}
        <line x1={ox} y1={oy - sP} x2={ox} y2={oy + sB + sP}
          stroke="#004290" strokeWidth={2} />
        <line x1={ox + sP} y1={oy} x2={ox + sP} y2={oy + sB}
          stroke="#004290" strokeWidth={1} />
        {/* Right flange */}
        <line x1={ox + sL} y1={oy - sP} x2={ox + sL} y2={oy + sB + sP}
          stroke="#004290" strokeWidth={2} />
        <line x1={ox + sL - sP} y1={oy} x2={ox + sL - sP} y2={oy + sB}
          stroke="#004290" strokeWidth={1} />

        {/* Top branch (w wide, l3 tall, offset e from left) */}
        <rect x={ox + sE - sW / 2} y={oy - sL3} width={sW} height={sL3}
          fill="none" stroke="#004290" strokeWidth={1.5} />
        {/* Top branch flanges */}
        <line x1={ox + sE - sW / 2 - sP} y1={oy - sL3}
              x2={ox + sE + sW / 2 + sP} y2={oy - sL3}
              stroke="#004290" strokeWidth={2} />
        <line x1={ox + sE - sW / 2} y1={oy - sL3 + sP}
              x2={ox + sE + sW / 2} y2={oy - sL3 + sP}
              stroke="#004290" strokeWidth={1} />

        {/* Bottom branch (w1 wide, l4 tall, offset e1 from left) */}
        <rect x={ox + sE1 - sW1 / 2} y={oy + sB} width={sW1} height={sL4}
          fill="none" stroke="#004290" strokeWidth={1.5} />
        {/* Bottom branch flanges */}
        <line x1={ox + sE1 - sW1 / 2 - sP} y1={oy + sB + sL4}
              x2={ox + sE1 + sW1 / 2 + sP} y2={oy + sB + sL4}
              stroke="#004290" strokeWidth={2} />
        <line x1={ox + sE1 - sW1 / 2} y1={oy + sB + sL4 - sP}
              x2={ox + sE1 + sW1 / 2} y2={oy + sB + sL4 - sP}
              stroke="#004290" strokeWidth={1} />

        {/* w dimension — top branch width */}
        <line x1={ox + sE - sW / 2} y1={oy - sL3 - 8}
              x2={ox + sE + sW / 2} y2={oy - sL3 - 8}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sE} y={oy - sL3 - 12} textAnchor="middle" fontSize={8} fill="#555555">w</text>

        {/* w1 dimension — bottom branch width */}
        <line x1={ox + sE1 - sW1 / 2} y1={oy + sB + sL4 + 8}
              x2={ox + sE1 + sW1 / 2} y2={oy + sB + sL4 + 8}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sE1} y={oy + sB + sL4 + 18} textAnchor="middle" fontSize={8} fill="#555555">w1</text>

        {/* l3 dimension — left of top branch */}
        <line x1={ox - 10} y1={oy} x2={ox - 10} y2={oy - sL3}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 16} y={oy - sL3 / 2 + 4} textAnchor="end" fontSize={8} fill="#555555">l3</text>

        {/* l4 dimension — left of bottom branch */}
        <line x1={ox - 10} y1={oy + sB} x2={ox - 10} y2={oy + sB + sL4}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 16} y={oy + sB + sL4 / 2 + 4} textAnchor="end" fontSize={8} fill="#555555">l4</text>

        {/* L dimension — below everything */}
        <line x1={ox} y1={oy + sB + sL4 + 10}
              x2={ox + sL} y2={oy + sB + sL4 + 10}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL / 2} y={oy + sB + sL4 + 22} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* a dimension — right of side view */}
        <line x1={ox + sL + 10} y1={oy} x2={ox + sL + 10} y2={oy + sB}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL + 16} y={oy + sB / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">a</text>

        {/* e dimension snippet — offset from left on top */}
        <line x1={ox} y1={oy + sP + 2} x2={ox + sE} y2={oy + sP + 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={ox + sE / 2} y={oy + sP + 12} textAnchor="middle" fontSize={7} fill="#999">e</text>

        {/* e1 dimension snippet — offset from left on bottom */}
        <line x1={ox} y1={oy + sB - sP - 2} x2={ox + sE1} y2={oy + sB - sP - 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={ox + sE1 / 2} y={oy + sB - sP - 5} textAnchor="middle" fontSize={7} fill="#999">e1</text>

        {/* === CROSS-SECTION (right) === */}
        {/* Main duct cross-section */}
        <rect x={csx} y={csy} width={csA} height={csB}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Flange frame */}
        <rect x={csx - csP} y={csy - csP} width={csA + 2 * csP} height={csB + 2 * csP}
          fill="none" stroke="#004290" strokeWidth={1.3} />

        {/* Top branch stub (d wide, extends upward by l3) */}
        {/* Offset from right: f; centerX = csx + csA - csF - csD/2 */}
        <rect x={csx + csA - csF - csD / 2} y={csy - csL3 + csP}
              width={csD} height={csL3 - csP}
              fill="none" stroke="#004290" strokeWidth={1.5} />
        {/* Top branch flange */}
        <line x1={csx + csA - csF - csD / 2 - csP} y1={csy - csL3 + csP}
              x2={csx + csA - csF + csD / 2 + csP} y2={csy - csL3 + csP}
              stroke="#004290" strokeWidth={2} />
        <line x1={csx + csA - csF - csD / 2} y1={csy - csL3 + 2 * csP}
              x2={csx + csA - csF + csD / 2} y2={csy - csL3 + 2 * csP}
              stroke="#004290" strokeWidth={1} />

        {/* Bottom branch stub (d1 wide, extends downward by l4) */}
        <rect x={csx + csA - csF1 - csD1 / 2} y={csy + csB}
              width={csD1} height={csL4 - csP}
              fill="none" stroke="#004290" strokeWidth={1.5} />
        {/* Bottom branch flange */}
        <line x1={csx + csA - csF1 - csD1 / 2 - csP} y1={csy + csB + csL4 - csP}
              x2={csx + csA - csF1 + csD1 / 2 + csP} y2={csy + csB + csL4 - csP}
              stroke="#004290" strokeWidth={2} />
        <line x1={csx + csA - csF1 - csD1 / 2} y1={csy + csB + csL4 - 2 * csP}
              x2={csx + csA - csF1 + csD1 / 2} y2={csy + csB + csL4 - 2 * csP}
              stroke="#004290" strokeWidth={1} />

        {/* b dimension — below cross-section */}
        <line x1={csx} y1={csy + csB + csL4 + 10}
              x2={csx + csA} y2={csy + csB + csL4 + 10}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA / 2} y={csy + csB + csL4 + 22} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* d dimension — top branch width in cross-section */}
        <line x1={csx + csA - csF - csD / 2} y1={csy - csL3}
              x2={csx + csA - csF + csD / 2} y2={csy - csL3}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA - csF} y={csy - csL3 - 4} textAnchor="middle" fontSize={8} fill="#555555">d</text>

        {/* d1 dimension — bottom branch width */}
        <line x1={csx + csA - csF1 - csD1 / 2} y1={csy + csB + csL4 + 2}
              x2={csx + csA - csF1 + csD1 / 2} y2={csy + csB + csL4 + 2}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA - csF1} y={csy + csB + csL4 + 12} textAnchor="middle" fontSize={8} fill="#555555">d1</text>

        {/* f dimension snippet — from right edge (top) */}
        <line x1={csx + csA} y1={csy + csP + 2}
              x2={csx + csA - csF} y2={csy + csP + 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={csx + csA - csF / 2} y={csy + csP + 12} textAnchor="middle" fontSize={7} fill="#999">f</text>

        {/* f1 dimension snippet — from right edge (bottom) */}
        <line x1={csx + csA} y1={csy + csB - csP - 2}
              x2={csx + csA - csF1} y2={csy + csB - csP - 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={csx + csA - csF1 / 2} y={csy + csB - csP - 5} textAnchor="middle" fontSize={7} fill="#999">f1</text>
      </g>
    );
  };

  const renderRoundCrossJunction = () => {
    // CZ2a: cross-junction with round branches
    // Side view (left) + cross-section (right)
    // labels: a, b, d, L, d1, e1, f1, e, f, l3, l4
    const a_val  = values[0] || 400;
    const b_val  = values[1] || 300;
    const d_val  = values[2] || 200;
    const L_val  = values[3] || 800;
    const d1_val = values[4] || 200;
    const e1_val = values[5] || 200;
    const f1_val = values[6] || 200;
    const e_val  = values[7] || 200;
    const f_val  = values[8] || 200;
    const l3_val = values[9] || 250;
    const l4_val = values[10] || 250;

    // Round branches: w = d, w1 = d1
    const w_val = d_val;
    const w1_val = d1_val;

    const totalH = l3_val + b_val + l4_val;

    // Side view scaling (left ~55%)
    const svW = width * 0.52;
    const svSc = Math.min((svW - 50) / L_val, (height - 50) / totalH);
    const sL = L_val * svSc;
    const sB = b_val * svSc;
    const sW = w_val * svSc;
    const sW1 = w1_val * svSc;
    const sL3 = l3_val * svSc;
    const sL4 = l4_val * svSc;
    const sE = e_val * svSc;
    const sE1 = e1_val * svSc;
    const sP = Math.min(6, Math.max(2, sB * 0.06));

    const ox = 25;
    const oy = 16 + sL3;

    // Cross-section scaling (right panel)
    const csOx = ox + sL + 45;
    const csAvail = width - csOx - 20;
    const csSc = Math.min((csAvail - 10) / a_val, (height - 50) / totalH);
    const csA = a_val * csSc;
    const csB = b_val * csSc;
    const csD = d_val * csSc;
    const csD1 = d1_val * csSc;
    const csF = f_val * csSc;
    const csF1 = f1_val * csSc;
    const csL3 = l3_val * csSc;
    const csL4 = l4_val * csSc;
    const csP = Math.min(6, Math.max(2, csA * 0.06));

    const csx = csOx;
    const csy = 16 + csL3;

    return (
      <g>
        {/* === SIDE VIEW (left) === */}
        {/* Main duct */}
        <rect x={ox} y={oy} width={sL} height={sB}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        {/* Left flange */}
        <line x1={ox} y1={oy - sP} x2={ox} y2={oy + sB + sP}
          stroke="#004290" strokeWidth={2} />
        <line x1={ox + sP} y1={oy} x2={ox + sP} y2={oy + sB}
          stroke="#004290" strokeWidth={1} />
        {/* Right flange */}
        <line x1={ox + sL} y1={oy - sP} x2={ox + sL} y2={oy + sB + sP}
          stroke="#004290" strokeWidth={2} />
        <line x1={ox + sL - sP} y1={oy} x2={ox + sL - sP} y2={oy + sB}
          stroke="#004290" strokeWidth={1} />

        {/* Top branch (w=d wide, l3 tall, offset e from left) */}
        <rect x={ox + sE - sW / 2} y={oy - sL3} width={sW} height={sL3}
          fill="none" stroke="#004290" strokeWidth={1.5} />
        <line x1={ox + sE - sW / 2 - sP} y1={oy - sL3}
              x2={ox + sE + sW / 2 + sP} y2={oy - sL3}
              stroke="#004290" strokeWidth={2} />
        <line x1={ox + sE - sW / 2} y1={oy - sL3 + sP}
              x2={ox + sE + sW / 2} y2={oy - sL3 + sP}
              stroke="#004290" strokeWidth={1} />

        {/* Bottom branch (w1=d1 wide, l4 tall, offset e1 from left) */}
        <rect x={ox + sE1 - sW1 / 2} y={oy + sB} width={sW1} height={sL4}
          fill="none" stroke="#004290" strokeWidth={1.5} />
        <line x1={ox + sE1 - sW1 / 2 - sP} y1={oy + sB + sL4}
              x2={ox + sE1 + sW1 / 2 + sP} y2={oy + sB + sL4}
              stroke="#004290" strokeWidth={2} />
        <line x1={ox + sE1 - sW1 / 2} y1={oy + sB + sL4 - sP}
              x2={ox + sE1 + sW1 / 2} y2={oy + sB + sL4 - sP}
              stroke="#004290" strokeWidth={1} />

        {/* l3 dimension */}
        <line x1={ox - 10} y1={oy} x2={ox - 10} y2={oy - sL3}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 16} y={oy - sL3 / 2 + 4} textAnchor="end" fontSize={8} fill="#555555">l3</text>

        {/* l4 dimension */}
        <line x1={ox - 10} y1={oy + sB} x2={ox - 10} y2={oy + sB + sL4}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox - 16} y={oy + sB + sL4 / 2 + 4} textAnchor="end" fontSize={8} fill="#555555">l4</text>

        {/* L dimension */}
        <line x1={ox} y1={oy + sB + sL4 + 10}
              x2={ox + sL} y2={oy + sB + sL4 + 10}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL / 2} y={oy + sB + sL4 + 22} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* a dimension — right */}
        <line x1={ox + sL + 10} y1={oy} x2={ox + sL + 10} y2={oy + sB}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={ox + sL + 16} y={oy + sB / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">a</text>

        {/* e dimension snippet */}
        <line x1={ox} y1={oy + sP + 2} x2={ox + sE} y2={oy + sP + 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={ox + sE / 2} y={oy + sP + 12} textAnchor="middle" fontSize={7} fill="#999">e</text>

        {/* e1 dimension snippet */}
        <line x1={ox} y1={oy + sB - sP - 2} x2={ox + sE1} y2={oy + sB - sP - 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={ox + sE1 / 2} y={oy + sB - sP - 5} textAnchor="middle" fontSize={7} fill="#999">e1</text>

        {/* === CROSS-SECTION (right) === */}
        {/* Main duct cross-section */}
        <rect x={csx} y={csy} width={csA} height={csB}
          fill="none" stroke="#004290" strokeWidth={1.8} />
        <rect x={csx - csP} y={csy - csP} width={csA + 2 * csP} height={csB + 2 * csP}
          fill="none" stroke="#004290" strokeWidth={1.3} />

        {/* Top branch stub (d wide, l3 tall, offset from right by f) */}
        <rect x={csx + csA - csF - csD / 2} y={csy - csL3 + csP}
              width={csD} height={csL3 - csP}
              fill="none" stroke="#004290" strokeWidth={1.5} />
        <line x1={csx + csA - csF - csD / 2 - csP} y1={csy - csL3 + csP}
              x2={csx + csA - csF + csD / 2 + csP} y2={csy - csL3 + csP}
              stroke="#004290" strokeWidth={2} />
        <line x1={csx + csA - csF - csD / 2} y1={csy - csL3 + 2 * csP}
              x2={csx + csA - csF + csD / 2} y2={csy - csL3 + 2 * csP}
              stroke="#004290" strokeWidth={1} />

        {/* Bottom branch stub (d1 wide, l4 tall, offset from right by f1) */}
        <rect x={csx + csA - csF1 - csD1 / 2} y={csy + csB}
              width={csD1} height={csL4 - csP}
              fill="none" stroke="#004290" strokeWidth={1.5} />
        <line x1={csx + csA - csF1 - csD1 / 2 - csP} y1={csy + csB + csL4 - csP}
              x2={csx + csA - csF1 + csD1 / 2 + csP} y2={csy + csB + csL4 - csP}
              stroke="#004290" strokeWidth={2} />
        <line x1={csx + csA - csF1 - csD1 / 2} y1={csy + csB + csL4 - 2 * csP}
              x2={csx + csA - csF1 + csD1 / 2} y2={csy + csB + csL4 - 2 * csP}
              stroke="#004290" strokeWidth={1} />

        {/* b dimension — below cross-section */}
        <line x1={csx} y1={csy + csB + csL4 + 10}
              x2={csx + csA} y2={csy + csB + csL4 + 10}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA / 2} y={csy + csB + csL4 + 22} textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* d dimension — top branch */}
        <line x1={csx + csA - csF - csD / 2} y1={csy - csL3}
              x2={csx + csA - csF + csD / 2} y2={csy - csL3}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA - csF} y={csy - csL3 - 4} textAnchor="middle" fontSize={8} fill="#555555">d</text>

        {/* d1 dimension — bottom branch */}
        <line x1={csx + csA - csF1 - csD1 / 2} y1={csy + csB + csL4 + 2}
              x2={csx + csA - csF1 + csD1 / 2} y2={csy + csB + csL4 + 2}
              stroke="#9b9b9b" strokeWidth={0.8} markerEnd="url(#arrowhead)" markerStart="url(#arrowhead-start)" />
        <text x={csx + csA - csF1} y={csy + csB + csL4 + 12} textAnchor="middle" fontSize={8} fill="#555555">d1</text>

        {/* f dimension snippet */}
        <line x1={csx + csA} y1={csy + csP + 2}
              x2={csx + csA - csF} y2={csy + csP + 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={csx + csA - csF / 2} y={csy + csP + 12} textAnchor="middle" fontSize={7} fill="#999">f</text>

        {/* f1 dimension snippet */}
        <line x1={csx + csA} y1={csy + csB - csP - 2}
              x2={csx + csA - csF1} y2={csy + csB - csP - 2}
              stroke="#9b9b9b" strokeWidth={0.6} />
        <text x={csx + csA - csF1 / 2} y={csy + csB - csP - 5} textAnchor="middle" fontSize={7} fill="#999">f1</text>
      </g>
    );
  };

  const renderEagleTee = () => {
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const c_raw = values[2] || 200;
    const d_raw = values[3] || 200;
    const m_raw = values[4] || 100;
    const k_raw = values[5] || 50;
    const i_raw = values[6] || 100;
    const j_raw = values[7] || 50;
    const g_raw = values[8] || 80;
    const f_raw = values[9] || 80;

    // Heron's formula (direct from C#)
    const r0 = g_raw + d_raw, r1 = f_raw + c_raw;
    const bb = Math.sqrt((b_raw + g_raw + f_raw) ** 2 + (k_raw - j_raw) ** 2);
    const ppp = (r0 + r1 + bb) / 2;
    const pole = Math.sqrt(Math.max(0, ppp * (ppp - r0) * (ppp - r1) * (ppp - bb)));
    const pom_h = 2 * pole / (bb || 1);
    const pom_a = Math.sqrt(Math.max(0, r0 * r0 - pom_h * pom_h));

    // C# scaling
    let max = Math.max(a_raw, b_raw);
    const l = c_raw + f_raw + j_raw;
    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    if (l > max) max = l;
    if (p > max) max = p;
    if (c_raw + f_raw + j_raw > max) max = c_raw + f_raw + j_raw;
    if (d_raw + g_raw + k_raw > max) max = d_raw + g_raw + k_raw;

    const mnoznik = 55;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let c = Math.trunc(c_raw / max * mnoznik);
    let d = Math.trunc(d_raw / max * mnoznik);
    let m = Math.trunc(m_raw / max * mnoznik);
    let k = Math.trunc(k_raw / max * mnoznik);
    let ii = Math.trunc(i_raw / max * mnoznik);
    let j = Math.trunc(j_raw / max * mnoznik);
    let g = Math.trunc(g_raw / max * mnoznik);
    let f = Math.trunc(f_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);
    let poma = Math.trunc(pom_a / max * mnoznik);
    let pomb = Math.trunc((b_raw + g_raw + f_raw - pom_a) / max * mnoznik);
    let pomh = Math.trunc(pom_h / max * mnoznik);

    while ((d + k + g) < 60 && (c + f + j) < 60 && (a + 20) < 80 && b < 60) {
      a = Math.trunc(a * 1.1); b = Math.trunc(b * 1.1);
      c = Math.trunc(c * 1.1); d = Math.trunc(d * 1.1);
      m = Math.trunc(m * 1.1); k = Math.trunc(k * 1.1);
      ii = Math.trunc(ii * 1.1); j = Math.trunc(j * 1.1);
      g = Math.trunc(g * 1.1); f = Math.trunc(f * 1.1);
      p = Math.trunc(p * 1.1);
      poma = Math.trunc(poma * 1.1); pomb = Math.trunc(pomb * 1.1);
      pomh = Math.trunc(pomh * 1.1);
    }
    if (g < 1) g = 1;
    if (f < 1) f = 1;

    // C# bitmap ~300×200, our viewBox 360×160 → scale ~0.53
    const S = 0.53;
    const sx = (v: number) => v * S;
    const sy = (v: number) => v * S;

    let push_x = 140 - b - m - g - f - j;
    if (push_x < 0) push_x = 10;
    let push_y = 10;
    if (c + f + j > d + g + k) push_y = 90 - c - f - j;
    else push_y = 90 - d - g - k;

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // ── Cross-section c×a ("maly z tylu") ──
    const csX = 190 + push_x, csY = 20 + push_y;
    els.push(<rect key={K()} x={sx(csX-p)} y={sy(csY-p)} width={sx(a+2*p)} height={sy(c+2*p)} fill="none" stroke="#004290" strokeWidth={0.5}/>);
    els.push(<rect key={K()} x={sx(csX)} y={sy(csY)} width={sx(a)} height={sy(c)} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── Cross-section d×a ("maly z przodu") ──
    const cs0Y = 20 + push_y + c + f + j - d - g - k;
    els.push(<rect key={K()} x={sx(csX-p)} y={sy(cs0Y-p)} width={sx(a+2*p)} height={sy(d+2*p)} fill="none" stroke="#004290" strokeWidth={0.5}/>);
    els.push(<rect key={K()} x={sx(csX)} y={sy(cs0Y)} width={sx(a)} height={sy(d)} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── Body rect (g+k tall, "pod tymi powyzej") ──
    const p02Y = 20 + push_y + c + f + j - g - k;
    els.push(<rect key={K()} x={sx(csX)} y={sy(p02Y)} width={sx(a)} height={sy(g+k)} fill="none" stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(csX-p)} y1={sy(p02Y+g+k)} x2={sx(csX+a+p)} y2={sy(p02Y+g+k)} stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(csX-p)} y1={sy(p02Y+g+k-p)} x2={sx(csX+a+p)} y2={sy(p02Y+g+k-p)} stroke="#004290" strokeWidth={0.5}/>);

    // ── "b" dim on body rect ──
    {const dy=p02Y+g+k+15;
    els.push(<line key={K()} x1={sx(csX)} y1={sy(dy)} x2={sx(csX+a)} y2={sy(dy)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(csX)} y1={sy(dy-3)} x2={sx(csX)} y2={sy(dy+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(csX+a)} y1={sy(dy-3)} x2={sx(csX+a)} y2={sy(dy+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(csX+a/2)} y={sy(dy-1)} fontSize={7} fill="#333" textAnchor="middle">b</text>);}

    // ── Left branch d×m ("poziomy") ──
    const lbX = 20+push_x, lbY = 20+push_y+c+f+j-d-g-k;
    els.push(<rect key={K()} x={sx(lbX)} y={sy(lbY)} width={sx(m)} height={sy(d)} fill="none" stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(lbX+m)} y1={sy(lbY+1)} x2={sx(lbX+m)} y2={sy(lbY+d-1)} stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // flange
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(lbY-p)} x2={sx(lbX)} y2={sy(lbY+d+p)} stroke="#004290" strokeWidth={0.8}/>);
    els.push(<line key={K()} x1={sx(lbX+p)} y1={sy(lbY-p)} x2={sx(lbX+p)} y2={sy(lbY+d+p)} stroke="#004290" strokeWidth={0.4}/>);

    // ── d dim ──
    {const dx=lbX-15;
    els.push(<line key={K()} x1={sx(dx)} y1={sy(lbY)} x2={sx(dx)} y2={sy(lbY+d)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(dx-3)} y1={sy(lbY)} x2={sx(dx+3)} y2={sy(lbY)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(dx-3)} y1={sy(lbY+d)} x2={sx(dx+3)} y2={sy(lbY+d)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lbX-25)} y={sy(lbY+d/2+2)} fontSize={7} fill="#333">d</text>);}

    // ── m dim ──
    {const my=lbY-15;
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(my)} x2={sx(lbX+m)} y2={sy(my)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(my-3)} x2={sx(lbX)} y2={sy(my+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lbX+m)} y1={sy(my-3)} x2={sx(lbX+m)} y2={sy(my+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lbX+m/2)} y={sy(lbY-30)} fontSize={7} fill="#333" textAnchor="middle">m</text>);}

    // ── g-arc: C# DrawArc(lbX+m-g, lbY+d, 2g, 2g, 270, 90) ──
    // center=(lbX+m, lbY+d+g), start 270°=(0,-g)→top, sweep 90° CW →(g,0)=right
    const gCx = lbX+m, gCy = lbY+d+g;
    els.push(<path key={K()} d={`M ${sx(gCx)},${sy(gCy-g)} A ${sx(g)},${sy(g)} 0 0,1 ${sx(gCx+g)},${sy(gCy)}`} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── k-line (vertical after arc) ──
    const klX = gCx+g, klY1 = gCy, klY2 = gCy+k;
    els.push(<line key={K()} x1={sx(klX)} y1={sy(klY1)} x2={sx(klX)} y2={sy(klY2)} stroke="#004290" strokeWidth={1.2}/>);

    // ── g label ──
    els.push(<line key={K()} x1={sx(klX)} y1={sy(klY1-g)} x2={sx(klX-g/2)} y2={sy(klY1-g/2)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(klX)} y={sy(klY1-g-8)} fontSize={7} fill="#333" textAnchor="middle">g</text>);

    // ── k dim ──
    {const kdx=klX-15;
    els.push(<line key={K()} x1={sx(kdx)} y1={sy(klY1)} x2={sx(kdx)} y2={sy(klY2)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(kdx-3)} y1={sy(klY1)} x2={sx(kdx+3)} y2={sy(klY1)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(kdx-3)} y1={sy(klY2)} x2={sx(kdx+3)} y2={sy(klY2)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(klX-35)} y={sy(klY1+k/2+2)} fontSize={7} fill="#333">k</text>);}

    // ── qwe = bottom of k-line = junction ──
    const qX = klX, qY = klY2;

    // ── b-line + flanges ──
    els.push(<line key={K()} x1={sx(qX)} y1={sy(qY)} x2={sx(qX+b)} y2={sy(qY)} stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(qX-p)} y1={sy(qY)} x2={sx(qX+b+p)} y2={sy(qY)} stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(qX-p)} y1={sy(qY-p)} x2={sx(qX+b+p)} y2={sy(qY-p)} stroke="#004290" strokeWidth={0.5}/>);

    // ── "a" dim (C# labels b-section as "a") ──
    {const ady=qY+15;
    els.push(<line key={K()} x1={sx(qX)} y1={sy(ady)} x2={sx(qX+b)} y2={sy(ady)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(qX)} y1={sy(ady-3)} x2={sx(qX)} y2={sy(ady+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(qX+b)} y1={sy(ady-3)} x2={sx(qX+b)} y2={sy(ady+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(qX+b/2)} y={sy(ady-1)} fontSize={7} fill="#333" textAnchor="middle">a</text>);}

    // ── j-line (vertical from qwe+b upward by j) ──
    const jX = qX+b;
    els.push(<line key={K()} x1={sx(jX)} y1={sy(qY-j)} x2={sx(jX)} y2={sy(qY)} stroke="#004290" strokeWidth={1.2}/>);

    // ── j dim ──
    {const jdx=jX+15;
    els.push(<line key={K()} x1={sx(jdx)} y1={sy(qY-j)} x2={sx(jdx)} y2={sy(qY)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(jdx-3)} y1={sy(qY-j)} x2={sx(jdx+3)} y2={sy(qY-j)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(jdx-3)} y1={sy(qY)} x2={sx(jdx+3)} y2={sy(qY)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(jX+25)} y={sy(qY-j/2+2)} fontSize={7} fill="#333">j</text>);}

    // ── f-arc: C# DrawArc(jX, qY-j-f, 2f, 2f, 180, 90) ──
    // center=(jX+f, qY-j-f+f)=(jX+f, qY-j), start 180°=(-f,0)=left, sweep 90° CW to 270°=(0,-f)=up
    // Actually GDI: 180°=left, 270°=up. Start at left, end at top.
    // start: (jX, qY-j), end: (jX+f, qY-j-f)
    els.push(<path key={K()} d={`M ${sx(jX)},${sy(qY-j)} A ${sx(f)},${sy(f)} 0 0,1 ${sx(jX+f)},${sy(qY-j-f)}`} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── f label ──
    els.push(<line key={K()} x1={sx(jX)} y1={sy(qY-j-f)} x2={sx(jX+f/2)} y2={sy(qY-j-f/2)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(jX-8)} y={sy(qY-j-f-4)} fontSize={7} fill="#333">f</text>);

    // ── Right branch c×i ──
    const rbX = jX+f, rbY = qY-j-f-c;
    els.push(<rect key={K()} x={sx(rbX)} y={sy(rbY)} width={sx(ii)} height={sy(c)} fill="none" stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(rbY+1)} x2={sx(rbX)} y2={sy(rbY+c-1)} stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // flange
    els.push(<line key={K()} x1={sx(rbX+ii)} y1={sy(rbY-p)} x2={sx(rbX+ii)} y2={sy(rbY+c+p)} stroke="#004290" strokeWidth={0.8}/>);
    els.push(<line key={K()} x1={sx(rbX+ii-p)} y1={sy(rbY-p)} x2={sx(rbX+ii-p)} y2={sy(rbY+c+p)} stroke="#004290" strokeWidth={0.4}/>);

    // ── c dim ──
    {const cdx=rbX+ii+15;
    els.push(<line key={K()} x1={sx(cdx)} y1={sy(rbY)} x2={sx(cdx)} y2={sy(rbY+c)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(cdx-3)} y1={sy(rbY)} x2={sx(cdx+3)} y2={sy(rbY)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(cdx-3)} y1={sy(rbY+c)} x2={sx(cdx+3)} y2={sy(rbY+c)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(rbX+ii+20)} y={sy(rbY+c/2+2)} fontSize={7} fill="#333">c</text>);}

    // ── i dim ──
    {const idy=rbY-15;
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(idy)} x2={sx(rbX+ii)} y2={sy(idy)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(idy-3)} x2={sx(rbX)} y2={sy(idy+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(rbX+ii)} y1={sy(idy-3)} x2={sx(rbX+ii)} y2={sy(idy+3)} stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(rbX+ii/2)} y={sy(rbY-26)} fontSize={7} fill="#333" textAnchor="middle">i</text>);}

    // ── Outer arcs ──
    // C#: qwe = {qX-g, qY-k}, qwe1 = {qX+b+f, qY-j}
    const oLx = qX-g, oLy = qY-k;
    const oRx = qX+b+f, oRy = qY-j;
    const gamma = Math.trunc(Math.atan(Math.abs(k-j)/(b||1))*180/Math.PI);
    const alfa = Math.trunc(Math.atan((pomh||1)/(poma||1))*180/Math.PI);
    const beta = Math.trunc(Math.atan((pomh||1)/(pomb||1))*180/Math.PI);

    let lStart=270, lSweep: number, rStart: number, rSweep: number;
    if (Math.abs(k-j) < 1) {
      lSweep = 90-alfa;
      rStart = 270-(90-beta); rSweep = 90-beta;
    } else if (j > k) {
      lSweep = 90-alfa-gamma;
      rStart = 270-(90-beta)-gamma; rSweep = 90-beta+gamma;
    } else {
      lSweep = 90-alfa+gamma;
      rStart = 270-(90-beta)+gamma; rSweep = 90-beta-gamma;
    }

    const gdiArc = (cx: number, cy: number, r: number, startDeg: number, sweepDeg: number) => {
      if (Math.abs(sweepDeg) < 0.5) return '';
      const s1 = startDeg*Math.PI/180, s2 = (startDeg+sweepDeg)*Math.PI/180;
      return `M ${sx(cx+r*Math.cos(s1))},${sy(cy+r*Math.sin(s1))} A ${sx(r)},${sy(r)} 0 ${Math.abs(sweepDeg)>180?1:0},${sweepDeg>0?1:0} ${sx(cx+r*Math.cos(s2))},${sy(cy+r*Math.sin(s2))}`;
    };

    const oLR = g+d, oRR = c+f;
    const lArc = gdiArc(oLx, oLy, oLR, lStart, lSweep);
    const rArc = gdiArc(oRx, oRy, oRR, rStart, rSweep);
    if (lArc) els.push(<path key={K()} d={lArc} fill="none" stroke="#004290" strokeWidth={1.2}/>);
    if (rArc) els.push(<path key={K()} d={rArc} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    return <g>{els}</g>;
  };

  const renderRadiusTee = () => {
    const a_raw = values[0] || 100;
    const b_raw = values[1] || 300;
    const c_raw = values[2] || 200;
    const d_raw = values[3] || 200;
    const L_raw = values[4] || 550;
    const g_raw = values[5] || 100;
    const i_raw = values[6] || 100;
    const j_raw = values[7] || 100;

    let max = Math.max(a_raw, b_raw);
    let p = 25;
    if (max > 1000) p = 30;
    if (max > 2501) p = 40;
    if (L_raw > max) max = L_raw;
    if (p > max) max = p;
    if (i_raw > max) max = i_raw;
    if (j_raw > max) max = j_raw;
    if (c_raw > max) max = c_raw;
    if (d_raw > max) max = d_raw;
    if (b_raw + j_raw + g_raw > max) max = b_raw + j_raw + g_raw;

    const mnoznik = 80;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let c = Math.trunc(c_raw / max * mnoznik);
    let d = Math.trunc(d_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);
    let ii = Math.trunc(i_raw / max * mnoznik);
    let j = Math.trunc(j_raw / max * mnoznik);
    let g = Math.trunc(g_raw / max * mnoznik);
    let l = Math.trunc(L_raw / max * mnoznik);

    while (l < 70 && a < 100 && (b + j + g) < 100) {
      a = Math.trunc(a * 1.1); b = Math.trunc(b * 1.1);
      c = Math.trunc(c * 1.1); d = Math.trunc(d * 1.1);
      p = Math.trunc(p * 1.1); ii = Math.trunc(ii * 1.1);
      j = Math.trunc(j * 1.1); g = Math.trunc(g * 1.1);
      l = Math.trunc(l * 1.1);
    }
    if (g < 1) g = 1;

    const S = 1.0;
    const sx = (v: number) => v * S;
    const sy = (v: number) => v * S;

    const push_x = Math.abs(Math.trunc(130 - b - g - j));
    const push_y = Math.trunc(90 - l);

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // punkty12: d×a cross-section rect (maly z prawej)
    const csX = 190 + push_x;
    const csY0 = 20 + push_y + l - d - g - ii;
    // punkty13: flange around cross-section
    els.push(<rect key={K()} x={sx(csX-p)} y={sy(csY0-p)} width={sx(a+2*p)} height={sy(d+2*p)}
      fill="none" stroke="#004290" strokeWidth={0.5}/>);
    els.push(<rect key={K()} x={sx(csX)} y={sy(csY0)} width={sx(a)} height={sy(d)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // punkty14: body section below flange → bottom of fitting
    const bodyY = csY0 + d;
    els.push(<rect key={K()} x={sx(csX)} y={sy(bodyY+p)} width={sx(a)} height={sy(ii+g-p)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Bottom flange lines at Y = bodyY+ii+g = 20+push_y+l
    els.push(<line key={K()} x1={sx(csX-p)} y1={sy(bodyY+ii+g)} x2={sx(csX+a+p)} y2={sy(bodyY+ii+g)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(csX)} y1={sy(bodyY+ii+g-p)} x2={sx(csX+a)} y2={sy(bodyY+ii+g-p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // punkty15: top section from top of fitting to d-section
    const topY = 20 + push_y;
    const topH = l - d - ii - g - p;
    els.push(<rect key={K()} x={sx(csX)} y={sy(topY)} width={sx(a)} height={sy(topH)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Top flange: outer extended, inner not extended
    els.push(<line key={K()} x1={sx(csX-p)} y1={sy(topY)} x2={sx(csX+a+p)} y2={sy(topY)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(csX)} y1={sy(topY+p)} x2={sx(csX+a)} y2={sy(topY+p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "b" dim label (C# labels the a-parameter as "b")
    {const dy2 = topY - 15;
    els.push(<line key={K()} x1={sx(csX)} y1={sy(dy2)} x2={sx(csX+a)} y2={sy(dy2)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(csX)} y1={sy(dy2-3)} x2={sx(csX)} y2={sy(dy2+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(csX+a)} y1={sy(dy2-3)} x2={sx(csX+a)} y2={sy(dy2+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(csX+a/2)} y={sy(dy2-5)} fontSize={7} fill="#333" textAnchor="middle">b</text>);}

    // punkty2: j×d left branch rect (poziomy z lewej)
    const lbX = 20 + push_x, lbY = csY0;
    els.push(<rect key={K()} x={sx(lbX)} y={sy(lbY)} width={sx(j)} height={sy(d)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Centerline on right edge of branch
    els.push(<line key={K()} x1={sx(lbX+j)} y1={sy(lbY+1)} x2={sx(lbX+j)} y2={sy(lbY+d-1)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // Left flange: inner line NOT extended
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(lbY-p)} x2={sx(lbX)} y2={sy(lbY+d+p)}
      stroke="#004290" strokeWidth={0.8}/>);
    els.push(<line key={K()} x1={sx(lbX+p)} y1={sy(lbY)} x2={sx(lbX+p)} y2={sy(lbY+d)}
      stroke="#004290" strokeWidth={0.4}/>);

    // j dim
    {const my = lbY - 15;
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(my)} x2={sx(lbX+j)} y2={sy(my)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lbX)} y1={sy(my-3)} x2={sx(lbX)} y2={sy(my+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lbX+j)} y1={sy(my-3)} x2={sx(lbX+j)} y2={sy(my+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lbX+j/2)} y={sy(my-8)} fontSize={7} fill="#333" textAnchor="middle">j</text>);}

    // d dim
    {const dx2 = lbX - 15;
    els.push(<line key={K()} x1={sx(dx2)} y1={sy(lbY)} x2={sx(dx2)} y2={sy(lbY+d)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(dx2-3)} y1={sy(lbY)} x2={sx(dx2+3)} y2={sy(lbY)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(dx2-3)} y1={sy(lbY+d)} x2={sx(dx2+3)} y2={sy(lbY+d)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lbX-30)} y={sy(lbY+d/2+2)} fontSize={7} fill="#333">d</text>);}

    // g-arc: quarter circle, center at (lbX+j, csY0+d+g)
    // C# DrawArc(lbX+j-g, csY0+d, 2g, 2g, 270, 90) → top to right
    const p0x = lbX + j, p0y = lbY + d + g;
    els.push(<path key={K()} d={`M ${sx(p0x)},${sy(p0y-g)} A ${sx(g)},${sy(g)} 0 0,1 ${sx(p0x+g)},${sy(p0y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // g label: diagonal line from (p0x+g, p0y-g) to center (p0x, p0y)
    els.push(<line key={K()} x1={sx(p0x+g)} y1={sy(p0y-g)} x2={sx(p0x)} y2={sy(p0y)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(p0x+g)} y={sy(p0y-g-10)} fontSize={7} fill="#333" textAnchor="middle">g</text>);

    // punkty22: b×i horizontal section at bottom of arc
    const bx1 = p0x + g, by1 = p0y;
    els.push(<rect key={K()} x={sx(bx1)} y={sy(by1)} width={sx(b)} height={sy(ii)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Centerline on top edge
    els.push(<line key={K()} x1={sx(bx1+1)} y1={sy(by1)} x2={sx(bx1+b-1)} y2={sy(by1)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // Bottom flanges: inner NOT extended, outer extended
    els.push(<line key={K()} x1={sx(bx1)} y1={sy(by1+ii-p)} x2={sx(bx1+b)} y2={sy(by1+ii-p)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(bx1-p)} y1={sy(by1+ii)} x2={sx(bx1+b+p)} y2={sy(by1+ii)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "a" dim (C# labels the b-section width as "a")
    {const ady = by1 + ii + 15;
    els.push(<line key={K()} x1={sx(bx1)} y1={sy(ady)} x2={sx(bx1+b)} y2={sy(ady)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(bx1)} y1={sy(ady-3)} x2={sx(bx1)} y2={sy(ady+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(bx1+b)} y1={sy(ady-3)} x2={sx(bx1+b)} y2={sy(ady+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(bx1+b/2)} y={sy(ady+10)} fontSize={7} fill="#333" textAnchor="middle">a</text>);}

    // L dim (vertical, between top of fitting and bottom of b-section)
    {const lx = (csX + bx1 + b) / 2;
    els.push(<line key={K()} x1={sx(lx)} y1={sy(topY)} x2={sx(lx)} y2={sy(topY+l)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lx-3)} y1={sy(topY)} x2={sx(lx+3)} y2={sy(topY)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lx-3)} y1={sy(topY+l)} x2={sx(lx+3)} y2={sy(topY+l)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lx+5)} y={sy(topY+l/2+2)} fontSize={7} fill="#333">L</text>);}

    // i dim
    {const idx = bx1 - 15;
    els.push(<line key={K()} x1={sx(idx)} y1={sy(by1)} x2={sx(idx)} y2={sy(by1+ii)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(idx-3)} y1={sy(by1)} x2={sx(idx+3)} y2={sy(by1)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(idx-3)} y1={sy(by1+ii)} x2={sx(idx+3)} y2={sy(by1+ii)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(idx-12)} y={sy(by1+ii/2+2)} fontSize={7} fill="#333">i</text>);}

    // Right vertical line from top of fitting to b-section
    const rbX = bx1 + b, rbY = by1 - (l - ii);
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(rbY)} x2={sx(rbX)} y2={sy(by1)}
      stroke="#004290" strokeWidth={1.2}/>);
    // c-branch horizontal at top
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(rbY)} x2={sx(rbX-c)} y2={sy(rbY)}
      stroke="#004290" strokeWidth={1.2}/>);
    // Top flanges: outer extended, inner NOT extended
    els.push(<line key={K()} x1={sx(rbX+p)} y1={sy(rbY)} x2={sx(rbX-c-p)} y2={sy(rbY)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(rbY+p)} x2={sx(rbX-c)} y2={sy(rbY+p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // c dim
    {const cdy = rbY - 15;
    els.push(<line key={K()} x1={sx(rbX-c)} y1={sy(cdy)} x2={sx(rbX)} y2={sy(cdy)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(rbX-c)} y1={sy(cdy-3)} x2={sx(rbX-c)} y2={sy(cdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(rbX)} y1={sy(cdy-3)} x2={sx(rbX)} y2={sy(cdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(rbX-c/2)} y={sy(cdy-5)} fontSize={7} fill="#333" textAnchor="middle">c</text>);}

    // Outer arc: from c-branch end to outer arc, center at p0
    const oArcCx = p0x, oArcCy = p0y;
    const qwe11X = rbX - c;
    const discrim = (g+d)*(g+d) - (qwe11X - oArcCx)*(qwe11X - oArcCx);
    if (discrim >= 0) {
      const qwe21Y = oArcCy - Math.trunc(Math.sqrt(discrim));
      // Vertical connection line from c-branch to arc intersection
      els.push(<line key={K()} x1={sx(qwe11X)} y1={sy(rbY)} x2={sx(qwe11X)} y2={sy(qwe21Y)}
        stroke="#004290" strokeWidth={1.2}/>);
      const x2 = qwe11X - oArcCx;
      const y2 = oArcCy - qwe21Y;
      const alfa2 = Math.trunc(Math.atan(y2 / (x2 || 1)) * 180 / Math.PI);
      const r2 = g + d;
      const startA = 270 * Math.PI / 180;
      const endA = (270 + 90 - alfa2) * Math.PI / 180;
      const arcSx = oArcCx + r2 * Math.cos(startA), arcSy = oArcCy + r2 * Math.sin(startA);
      const arcEx = oArcCx + r2 * Math.cos(endA), arcEy = oArcCy + r2 * Math.sin(endA);
      els.push(<path key={K()} d={`M ${sx(arcSx)},${sy(arcSy)} A ${sx(r2)},${sy(r2)} 0 0,1 ${sx(arcEx)},${sy(arcEy)}`}
        fill="none" stroke="#004290" strokeWidth={1.2}/>);
    }

    return <g>{els}</g>;
  };

  const renderPortTee = () => {
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const c_raw = values[2] || 200;
    const d_raw = values[3] || 200;
    const e_raw = values[4] || 200;
    const L_raw = values[5] || 500;
    const h_raw = values[6] || 50;
    const g_raw = values[7] || 50;
    const i_raw = values[8] || 50;
    const j_raw = values[9] || 100;
    const k_raw = values[10] || 100;

    let max = Math.max(a_raw, b_raw);
    let p = 25;
    if (L_raw > 1000) p = 30;
    if (L_raw > 2501) p = 40;
    if (L_raw > max) max = L_raw;
    if (p > max) max = p;
    if ((Math.abs(h_raw) + c_raw + g_raw + d_raw) > max) max = Math.abs(h_raw) + c_raw + g_raw + d_raw;

    const mnoznik = 70;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let c = Math.trunc(c_raw / max * mnoznik);
    let d = Math.trunc(d_raw / max * mnoznik);
    let ee = Math.trunc(e_raw / max * mnoznik);
    let j = Math.trunc(j_raw / max * mnoznik);
    let k = Math.trunc(k_raw / max * mnoznik);
    let l = Math.trunc(L_raw / max * mnoznik);
    let h = Math.trunc(h_raw / max * mnoznik);
    let ii = Math.trunc(i_raw / max * mnoznik);
    let g = Math.trunc(g_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);

    while (l < 70 && (a + 20) < 90 && (b + 20) < 90) {
      a = Math.trunc(a * 1.1); b = Math.trunc(b * 1.1);
      c = Math.trunc(c * 1.1); d = Math.trunc(d * 1.1);
      ee = Math.trunc(ee * 1.1); j = Math.trunc(j * 1.1);
      k = Math.trunc(k * 1.1); l = Math.trunc(l * 1.1);
      h = Math.trunc(h * 1.1); ii = Math.trunc(ii * 1.1);
      g = Math.trunc(g * 1.1); p = Math.trunc(p * 1.1);
    }

    const S = 1.0;
    const sx = (v: number) => v * S;
    const sy = (v: number) => v * S;

    let push_x = 120 - a;
    if (push_x < 0) push_x = 10;
    let push_y = 80 - l;
    if (push_y < 0) push_y = 10;

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // ── Front view (right side): e×k stub at top ──
    // punkty: e×k rect
    const sX = 190 + push_x, sY = 20 + push_y;
    els.push(<rect key={K()} x={sx(sX)} y={sy(sY)} width={sx(ee)} height={sy(k)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Centerline at bottom of stub
    els.push(<line key={K()} x1={sx(sX+1)} y1={sy(sY+k)} x2={sx(sX+ee-1)} y2={sy(sY+k)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // Top flange: outer extended, inner at +p
    els.push(<line key={K()} x1={sx(sX-p)} y1={sy(sY)} x2={sx(sX+ee+p)} y2={sy(sY)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(sX)} y1={sy(sY+p)} x2={sx(sX+ee)} y2={sy(sY+p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // e dim
    {const edy = sY - 15;
    els.push(<line key={K()} x1={sx(sX)} y1={sy(edy)} x2={sx(sX+ee)} y2={sy(edy)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(sX)} y1={sy(edy-3)} x2={sx(sX)} y2={sy(edy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(sX+ee)} y1={sy(edy-3)} x2={sx(sX+ee)} y2={sy(edy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(sX+ee/2)} y={sy(edy-5)} fontSize={7} fill="#333" textAnchor="middle">e</text>);}

    // k dim
    {const kdx = sX - 15;
    els.push(<line key={K()} x1={sx(kdx)} y1={sy(sY)} x2={sx(kdx)} y2={sy(sY+k)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(kdx-3)} y1={sy(sY)} x2={sx(kdx+3)} y2={sy(sY)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(kdx-3)} y1={sy(sY+k)} x2={sx(kdx+3)} y2={sy(sY+k)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(sX-30)} y={sy(sY+k/2+2)} fontSize={7} fill="#333">k</text>);}

    // ── Main body trapezoid (punkty1) ──
    const p1_0x = sX, p1_0y = sY + k;
    const p1_1x = sX + ee, p1_1y = sY + k;
    const p1_3x = sX - ii, p1_3y = sY + k + (l - k - j);
    const p1_2x = p1_3x + b, p1_2y = p1_3y;

    els.push(<polygon key={K()} points={`${sx(p1_0x)},${sy(p1_0y)} ${sx(p1_1x)},${sy(p1_1y)} ${sx(p1_2x)},${sy(p1_2y)} ${sx(p1_3x)},${sy(p1_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Center lines
    els.push(<line key={K()} x1={sx(p1_0x+1)} y1={sy(p1_0y)} x2={sx(p1_1x-1)} y2={sy(p1_1y)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    els.push(<line key={K()} x1={sx(p1_3x+1)} y1={sy(p1_3y)} x2={sx(p1_2x-1)} y2={sy(p1_2y)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);

    // ── Bottom rect: b×j (punkty12) ──
    els.push(<rect key={K()} x={sx(p1_3x)} y={sy(p1_3y)} width={sx(b)} height={sy(j)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Center line at top of bottom rect
    els.push(<line key={K()} x1={sx(p1_3x+1)} y1={sy(p1_3y)} x2={sx(p1_2x-1)} y2={sy(p1_2y)}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    // Bottom flanges
    els.push(<line key={K()} x1={sx(p1_3x-p)} y1={sy(p1_3y+j)} x2={sx(p1_3x+b+p)} y2={sy(p1_3y+j)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(p1_3x)} y1={sy(p1_3y+j-p)} x2={sx(p1_3x+b)} y2={sy(p1_3y+j-p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // j dim
    {const jdx = p1_3x - 15;
    els.push(<line key={K()} x1={sx(jdx)} y1={sy(p1_3y)} x2={sx(jdx)} y2={sy(p1_3y+j)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(jdx-3)} y1={sy(p1_3y)} x2={sx(jdx+3)} y2={sy(p1_3y)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(jdx-3)} y1={sy(p1_3y+j)} x2={sx(jdx+3)} y2={sy(p1_3y+j)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(jdx-10)} y={sy(p1_3y+j/2+2)} fontSize={7} fill="#333">j</text>);}

    // -i and b dims at bottom
    {const bdy = sY + l + 15;
    // line from sX across to sX-ii+b
    els.push(<line key={K()} x1={sx(sX)} y1={sy(bdy)} x2={sx(sX-ii+b)} y2={sy(bdy)}
      stroke="#333" strokeWidth={0.4}/>);
    // tick at sX
    els.push(<line key={K()} x1={sx(sX)} y1={sy(bdy-3)} x2={sx(sX)} y2={sy(bdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    // tick at sX-ii
    els.push(<line key={K()} x1={sx(sX-ii)} y1={sy(bdy-3)} x2={sx(sX-ii)} y2={sy(bdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    // tick at sX-ii+b
    els.push(<line key={K()} x1={sx(sX-ii+b)} y1={sy(bdy-3)} x2={sx(sX-ii+b)} y2={sy(bdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(sX-ii/2)} y={sy(bdy+10)} fontSize={7} fill="#333" textAnchor="middle">-i</text>);
    els.push(<text key={K()} x={sx(p1_3x+b/2)} y={sy(bdy+10)} fontSize={7} fill="#333" textAnchor="middle">b</text>);}

    // L dim (right side)
    {const lx = Math.max(p1_1x, p1_2x) + 15;
    els.push(<line key={K()} x1={sx(lx)} y1={sy(sY)} x2={sx(lx)} y2={sy(sY+l)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lx-3)} y1={sy(sY)} x2={sx(lx+3)} y2={sy(sY)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(lx-3)} y1={sy(sY+l)} x2={sx(lx+3)} y2={sy(sY+l)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(lx+5)} y={sy(sY+l/2+2)} fontSize={7} fill="#333">L</text>);}

    // ── Side view (left side): heptagonal polygon ──
    const lvX = 20 + push_x - h, lvY = sY + k;

    const p2: [number, number][] = [];
    p2[0] = [lvX, lvY];
    p2[1] = [lvX + c, lvY];
    p2[2] = [p2[1][0] + g/2, p2[1][1] + (l - k - j)/2];
    p2[3] = [p2[1][0] + g, p2[1][1]];
    p2[4] = [p2[3][0] + d, p2[3][1]];
    p2[5] = [lvX + h + a, p2[4][1] + l - j - k];
    p2[6] = [p2[5][0] - a, p2[5][1]];

    const polyPts = p2.map(([x,y]) => `${sx(x)},${sy(y)}`).join(' ');
    els.push(<polygon key={K()} points={polyPts} fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // Center lines (dashed)
    els.push(<line key={K()} x1={sx(p2[0][0]+1)} y1={sy(p2[0][1])} x2={sx(p2[1][0]-1)} y2={sy(p2[1][1])}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    els.push(<line key={K()} x1={sx(p2[3][0]+1)} y1={sy(p2[3][1])} x2={sx(p2[4][0]-1)} y2={sy(p2[4][1])}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);
    els.push(<line key={K()} x1={sx(p2[6][0]+1)} y1={sy(p2[6][1])} x2={sx(p2[5][0]-1)} y2={sy(p2[5][1])}
      stroke="#c00" strokeWidth={0.4} strokeDasharray="2,2"/>);

    // 0-1 nasadka (c section flanges, goes UP by k)
    els.push(<line key={K()} x1={sx(p2[0][0])} y1={sy(p2[0][1]-k)} x2={sx(p2[0][0])} y2={sy(p2[0][1])}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[1][0])} y1={sy(p2[1][1]-k)} x2={sx(p2[1][0])} y2={sy(p2[1][1])}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[0][0])} y1={sy(p2[0][1]-k)} x2={sx(p2[1][0])} y2={sy(p2[1][1]-k)}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[0][0]-p)} y1={sy(p2[0][1]-k)} x2={sx(p2[1][0]+p)} y2={sy(p2[1][1]-k)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(p2[0][0])} y1={sy(p2[0][1]-k+p)} x2={sx(p2[1][0])} y2={sy(p2[1][1]-k+p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // 3-4 nasadka (d section flanges, goes UP by k)
    els.push(<line key={K()} x1={sx(p2[3][0])} y1={sy(p2[3][1]-k)} x2={sx(p2[3][0])} y2={sy(p2[3][1])}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[4][0])} y1={sy(p2[4][1]-k)} x2={sx(p2[4][0])} y2={sy(p2[4][1])}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[3][0])} y1={sy(p2[3][1]-k)} x2={sx(p2[4][0])} y2={sy(p2[4][1]-k)}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[3][0]-p)} y1={sy(p2[3][1]-k)} x2={sx(p2[4][0]+p)} y2={sy(p2[4][1]-k)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(p2[3][0])} y1={sy(p2[3][1]-k+p)} x2={sx(p2[4][0])} y2={sy(p2[4][1]-k+p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // 6-5 nasadka (a section flanges, goes DOWN by j)
    els.push(<line key={K()} x1={sx(p2[6][0])} y1={sy(p2[6][1])} x2={sx(p2[6][0])} y2={sy(p2[6][1]+j)}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[5][0])} y1={sy(p2[5][1])} x2={sx(p2[5][0])} y2={sy(p2[5][1]+j)}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[6][0])} y1={sy(p2[6][1]+j)} x2={sx(p2[5][0])} y2={sy(p2[5][1]+j)}
      stroke="#004290" strokeWidth={1.2}/>);
    els.push(<line key={K()} x1={sx(p2[6][0]-p)} y1={sy(p2[6][1]+j)} x2={sx(p2[5][0]+p)} y2={sy(p2[5][1]+j)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(p2[6][0])} y1={sy(p2[6][1]+j-p)} x2={sx(p2[5][0])} y2={sy(p2[5][1]+j-p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // a dim
    {const ady2 = p2[6][1] + j + 15;
    els.push(<line key={K()} x1={sx(p2[6][0])} y1={sy(ady2)} x2={sx(p2[5][0])} y2={sy(ady2)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(p2[6][0])} y1={sy(ady2-3)} x2={sx(p2[6][0])} y2={sy(ady2+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<line key={K()} x1={sx(p2[5][0])} y1={sy(ady2-3)} x2={sx(p2[5][0])} y2={sy(ady2+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(p2[6][0]+a/2)} y={sy(ady2+10)} fontSize={7} fill="#333" textAnchor="middle">a</text>);}

    // -h, c, g, d dims at top
    {const tdy = p2[0][1] - k - 15;
    const baseX2 = p2[0][0] + h;
    // horizontal dim line from baseX2 to p2[4]
    els.push(<line key={K()} x1={sx(baseX2)} y1={sy(tdy)} x2={sx(p2[4][0])} y2={sy(tdy)}
      stroke="#333" strokeWidth={0.4}/>);
    // tick at baseX2
    els.push(<line key={K()} x1={sx(baseX2)} y1={sy(tdy-3)} x2={sx(baseX2)} y2={sy(tdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    // tick at p2[0] for -h
    els.push(<line key={K()} x1={sx(p2[0][0])} y1={sy(tdy-3)} x2={sx(p2[0][0])} y2={sy(tdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(p2[0][0]+h/2)} y={sy(tdy-8)} fontSize={7} fill="#333" textAnchor="middle">-h</text>);
    // tick at baseX2+c
    els.push(<line key={K()} x1={sx(baseX2+c)} y1={sy(tdy-3)} x2={sx(baseX2+c)} y2={sy(tdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(baseX2+c/2)} y={sy(tdy-8)} fontSize={7} fill="#333" textAnchor="middle">c</text>);
    // tick at baseX2+c+g
    els.push(<line key={K()} x1={sx(baseX2+c+g)} y1={sy(tdy-3)} x2={sx(baseX2+c+g)} y2={sy(tdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(baseX2+c+g/2)} y={sy(tdy-8)} fontSize={7} fill="#333" textAnchor="middle">g</text>);
    // tick at p2[4]
    els.push(<line key={K()} x1={sx(p2[4][0])} y1={sy(tdy-3)} x2={sx(p2[4][0])} y2={sy(tdy+3)}
      stroke="#333" strokeWidth={0.4}/>);
    els.push(<text key={K()} x={sx(baseX2+c+g+d/2)} y={sy(tdy-8)} fontSize={7} fill="#333" textAnchor="middle">d</text>);}

    return <g>{els}</g>;
  };

  const renderAngledDuct = () => {
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const L_raw = values[2] || 500;
    const alfa_raw = values[3] || 45;
    const e_raw = values[4] || 200;
    const f_raw = values[5] || 200;

    // ── max & p matching C# ──
    let max = Math.max(a_raw, b_raw);
    let p = 25;
    if (e_raw > max) max = e_raw;
    if (f_raw > max) max = f_raw;
    const hTotal = L_raw * Math.sin(alfa_raw * Math.PI / 180) + b_raw * Math.sin((90 - alfa_raw) * Math.PI / 180);
    if (hTotal > max) max = hTotal;
    if (max > 1000) p = 30;
    if (max > 2501) p = 40;
    if (p > max) max = p;
    if (f_raw > max) max = f_raw;
    if (e_raw > max) max = e_raw;
    const b1Check = Math.trunc(b_raw / Math.sin(alfa_raw * Math.PI / 180));
    if (b1Check > max) max = b1Check;

    const mnoznik = 50;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);
    let ee = Math.trunc(e_raw / max * mnoznik);
    let f = Math.trunc(f_raw / max * mnoznik);
    let l = Math.trunc(L_raw / max * mnoznik);

    const alfaRad = alfa_raw * Math.PI / 180;
    const sinA = Math.sin(alfaRad);
    const cosA = Math.cos(alfaRad);

    while (ee < 100 && a < 100 && f < 100 && Math.trunc(b / sinA) < 100) {
      a = Math.trunc(a * 1.1);
      b = Math.trunc(b * 1.1);
      p = Math.trunc(p * 1.1);
      f = Math.trunc(f * 1.1);
      ee = Math.trunc(ee * 1.1);
      l = Math.trunc(l * 1.1);
    }

    const push_x = 30;
    const push_y = 15;

    // ── Derived values ──
    const bProj = Math.trunc(b * cosA);
    const b1 = Math.trunc(b / sinA);
    const bodyH = Math.trunc(l * sinA);

    // ── Left side: parallelogram ──
    const p2x0 = 20 + push_x;
    const p2y0 = 20 + push_y + bProj;
    const p2x1 = 20 + push_x + Math.trunc(sinA * b);
    const p2y1 = 20 + push_y;
    const p2x2 = 20 + push_x + Math.trunc(cosA * l) + b1;
    const p2y2 = 20 + push_y + bProj + bodyH;
    const p2x3 = 20 + push_x + Math.trunc(cosA * l);
    const p2y3 = p2y2;

    // ── Right side: cross-section + body — positioned to the right of the parallelogram ──
    const paraRightX = Math.max(p2x1, p2x2) + 20; // gap between parallelogram and cross-section
    const csX = Math.max(190 + push_x, paraRightX);
    const csY = 20 + push_y;

    // f-line coords
    const fBotY = csY + bProj + bodyH;
    const fX1 = csX - Math.trunc((f - a) / 2);
    const fX2 = csX + a + Math.trunc((f - a) / 2);

    // e-line coords
    const eDiff = Math.trunc((ee - b1) / 2);
    const eX1 = p2x3 - eDiff;
    const eX2 = p2x2 + eDiff;

    // Flange offsets on parallelogram
    const fi = Math.trunc(sinA * p);
    const fj = Math.trunc(cosA * p);

    // L dim perpendicular offset (C# wekt = pt0 - pt1, reduced)
    let lwx = p2x0 - p2x1;
    let lwy = p2y0 - p2y1;
    while (Math.abs(lwx) > 6) { lwx = Math.trunc(lwx / 2); lwy = Math.trunc(lwy / 2); }
    lwx = Math.abs(lwx); lwy = Math.abs(lwy);

    // a dim perpendicular offset (C# wekt = pt0 - pt3, reduced)
    let awx = p2x0 - p2x3;
    let awy = p2y0 - p2y3;
    while (Math.abs(awx) > 6) { awx = Math.trunc(awx / 2); awy = Math.trunc(awy / 2); }
    awx = Math.abs(awx); awy = Math.abs(awy);

    // ── Bounding box of all content ──
    const bbPad = 12;
    const contentMinX = Math.min(
      csX - p, fX1, p2x0 - fi, eX1,
      p2x0 - lwx - Math.trunc(lwx / 3),
      p2x0 - awx - 15, p2x2 - 40
    ) - bbPad;
    const contentMaxX = Math.max(
      csX + a + p, fX2, p2x1 + fi, eX2, p2x2 + 20
    ) + bbPad;
    const contentMinY = Math.min(
      csY - p - 20, p2y1 - fj, p2y1 - awy - 10
    ) - bbPad;
    const contentMaxY = Math.max(
      fBotY + 30, p2y2 + 35
    ) + bbPad;

    const contentW = contentMaxX - contentMinX;
    const contentH = contentMaxY - contentMinY;
    const S = Math.min((width - 4) / contentW, (height - 4) / contentH);
    const baseOffX = 2 + ((width - 4) - contentW * S) / 2;
    const baseOffY = 2 + ((height - 4) - contentH * S) / 2;
    const sx = (v: number) => baseOffX + (v - contentMinX) * S;
    const sy = (v: number) => baseOffY + (v - contentMinY) * S;
    const sd = (v: number) => v * S;

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // ── Draw in C# order ──

    // 1. Body rect below cross-section (podmalym)
    els.push(<rect key={K()} x={sx(csX)} y={sy(csY + bProj)} width={sd(a)} height={sd(bodyH)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // 2. Filled flange rect (covers body overlap, C# FillPolygon)
    els.push(<rect key={K()} x={sx(csX - p)} y={sy(csY - p)}
      width={sd(a + 2 * p)} height={sd(bProj + 2 * p)}
      fill="white" stroke="none"/>);

    // 3. Inner cross-section rect
    els.push(<rect key={K()} x={sx(csX)} y={sy(csY)} width={sd(a)} height={sd(bProj)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // 4. Outer flange rect
    els.push(<rect key={K()} x={sx(csX - p)} y={sy(csY - p)}
      width={sd(a + 2 * p)} height={sd(bProj + 2 * p)}
      fill="none" stroke="#004290" strokeWidth={0.5}/>);

    // 5. "b" dim above cross-section
    {
      const dimY = csY - 15;
      els.push(<line key={K()} x1={sx(csX)} y1={sy(dimY)} x2={sx(csX + a)} y2={sy(dimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(csX)} y1={sy(dimY - 3)} x2={sx(csX)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(csX + a)} y1={sy(dimY - 3)} x2={sx(csX + a)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(csX + a / 2)} y={sy(dimY) - 4}
        fontSize={7} fill="#333" textAnchor="middle">b</text>);
    }

    // 6. "f" line and dim below body
    {
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(fBotY)} x2={sx(fX2)} y2={sy(fBotY)}
        stroke="#004290" strokeWidth={1.2}/>);
      const fDimY = fBotY + 15;
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(fDimY)} x2={sx(fX2)} y2={sy(fDimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(fDimY - 3)} x2={sx(fX1)} y2={sy(fDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(fX2)} y1={sy(fDimY - 3)} x2={sx(fX2)} y2={sy(fDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((fX1 + fX2) / 2)} y={sy(fDimY) + 10}
        fontSize={7} fill="#333" textAnchor="middle">f</text>);
    }

    // 7. Parallelogram (side view)
    els.push(<polygon key={K()}
      points={`${sx(p2x0)},${sy(p2y0)} ${sx(p2x1)},${sy(p2y1)} ${sx(p2x2)},${sy(p2y2)} ${sx(p2x3)},${sy(p2y3)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // 8. Flanges on edge 0→1
    {
      // Inner flange (both pts shifted +fi, +fj)
      els.push(<line key={K()}
        x1={sx(p2x0 + fi)} y1={sy(p2y0 + fj)} x2={sx(p2x1 + fi)} y2={sy(p2y1 + fj)}
        stroke="#004290" strokeWidth={0.5}/>);
      // Outer flange (pt0: -fi,+fj; pt1: +fi,-fj)
      els.push(<line key={K()}
        x1={sx(p2x0 - fi)} y1={sy(p2y0 + fj)} x2={sx(p2x1 + fi)} y2={sy(p2y1 - fj)}
        stroke="#004290" strokeWidth={0.5}/>);
    }

    // 9. "e" line and dim below parallelogram
    {
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(p2y3)} x2={sx(eX2)} y2={sy(p2y2)}
        stroke="#004290" strokeWidth={1.2}/>);
      const eDimY = p2y3 + 15;
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(eDimY)} x2={sx(eX2)} y2={sy(eDimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(eDimY - 3)} x2={sx(eX1)} y2={sy(eDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(eX2)} y1={sy(eDimY - 3)} x2={sx(eX2)} y2={sy(eDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((eX1 + eX2) / 2)} y={sy(eDimY) - 3}
        fontSize={7} fill="#333" textAnchor="middle">e</text>);
    }

    // 10. alfa arc at vertex 2 (bottom-right of parallelogram)
    {
      const r = 20;
      const arcSx = p2x2 - r;
      const arcSy = p2y2;
      const endAngle = Math.PI + alfaRad;
      const arcEx = p2x2 + r * Math.cos(endAngle);
      const arcEy = p2y2 + r * Math.sin(endAngle);
      els.push(<path key={K()}
        d={`M ${sx(arcSx)},${sy(arcSy)} A ${sd(r)},${sd(r)} 0 0,1 ${sx(arcEx)},${sy(arcEy)}`}
        fill="none" stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(p2x2 - 40)} y={sy(p2y2 - 15)}
        fontSize={6} fill="#333">alfa</text>);
    }

    // 11. "alfa" dim along left edge (0→3)
    {
      const lx1 = p2x0 - lwx, ly1 = p2y0 + lwy;
      const lx2 = p2x3 - lwx, ly2 = p2y3 + lwy;
      els.push(<line key={K()} x1={sx(lx1)} y1={sy(ly1)} x2={sx(lx2)} y2={sy(ly2)}
        stroke="#333" strokeWidth={0.4}/>);
      const lt = Math.trunc(lwx / 3);
      const lu = Math.trunc(lwy / 3);
      els.push(<line key={K()}
        x1={sx(lx1 - lt)} y1={sy(ly1 + lu)} x2={sx(lx1 + lt)} y2={sy(ly1 - lu)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()}
        x1={sx(lx2 - lt)} y1={sy(ly2 + lu)} x2={sx(lx2 + lt)} y2={sy(ly2 - lu)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()}
        x={sx(Math.trunc((lx1 + lx2) / 2)) - 5}
        y={sy(Math.trunc((ly1 + ly2) / 2))}
        fontSize={7} fill="#333">alfa</text>);
    }

    // 12. "a" dim along top-left edge (0→1) of parallelogram
    {
      const ax1 = p2x0 - awx, ay1 = p2y0 - awy;
      const ax2 = p2x1 - awx, ay2 = p2y1 - awy;
      els.push(<line key={K()} x1={sx(ax1)} y1={sy(ay1)} x2={sx(ax2)} y2={sy(ay2)}
        stroke="#333" strokeWidth={0.4}/>);
      const at2 = Math.trunc(awx / 3);
      const au = Math.trunc(awy / 3);
      els.push(<line key={K()}
        x1={sx(ax1 - at2)} y1={sy(ay1 - au)} x2={sx(ax1 + at2)} y2={sy(ay1 + au)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()}
        x1={sx(ax2 - at2)} y1={sy(ay2 - au)} x2={sx(ax2 + at2)} y2={sy(ay2 + au)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()}
        x={sx(Math.trunc((ax1 + ax2) / 2)) - 8}
        y={sy(Math.trunc((ay1 + ay2) / 2)) - 6}
        fontSize={7} fill="#333">a</text>);
    }

    return <g>{els}</g>;
  };

  const renderPerpendicularDuct = () => {
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const L_raw = values[2] || 500;
    const e_raw = values[3] || 200;
    const f_raw = values[4] || 200;

    let max = Math.max(a_raw, b_raw);
    let p = 25;
    if (e_raw > max) max = e_raw;
    if (f_raw > max) max = f_raw;
    if (L_raw > 1000) p = 30;
    if (L_raw > 2501) p = 40;
    if (L_raw > max) max = L_raw;
    if (p > max) max = p;

    const mnoznik = 70;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let ee = Math.trunc(e_raw / max * mnoznik);
    let f = Math.trunc(f_raw / max * mnoznik);
    let l = Math.trunc(L_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);

    while (f < 110 && a < 110 && ee < 110 && b < 110 && l < 70) {
      a = Math.trunc(a * 1.1);
      b = Math.trunc(b * 1.1);
      ee = Math.trunc(ee * 1.1);
      f = Math.trunc(f * 1.1);
      l = Math.trunc(l * 1.1);
      p = Math.trunc(p * 1.1);
    }

    let push_x = Math.trunc((150 - ee) / 2);
    if (push_x < 0) push_x = -push_x;
    const push_y = Math.trunc((90 - l) / 2) + 5;

    // Right side: front view (a×l) — "punkty"
    const r0x = 190 + push_x, r0y = 20 + push_y;
    const r1x = 190 + a + push_x, r1y = 20 + push_y;
    const r2x = r1x, r2y = 20 + push_y + l;
    const r3x = r0x, r3y = r2y;

    // Left side: side view (b×l) — "punkty2"
    const s0x = 20 + push_x, s0y = 20 + push_y;
    const s1x = 20 + b + push_x, s1y = 20 + push_y;
    const s2x = s1x, s2y = 20 + l + push_y;
    const s3x = s0x, s3y = s2y;

    // f-line at bottom of right side
    const fX1 = r3x - Math.trunc((f - a) / 2);
    const fX2 = r2x + Math.trunc((f - a) / 2);

    // e-line at bottom of left side
    const eX1 = s3x - Math.trunc((ee - b) / 2);
    const eX2 = s2x + Math.trunc((ee - b) / 2);

    // ── Bounding box for auto-fit ──
    const bbPad = 10;
    const contentMinX = Math.min(r0x - p, s0x - p, fX1, eX1) - bbPad;
    const contentMaxX = Math.max(r1x + p, s1x + p, fX2, eX2) + bbPad;
    const contentMinY = Math.min(r0y - 20, s0y - 20) - bbPad;
    const contentMaxY = Math.max(r3y + 30, s3y + 30) + bbPad;

    const contentW = contentMaxX - contentMinX;
    const contentH = contentMaxY - contentMinY;
    const S = Math.min((width - 4) / contentW, (height - 4) / contentH);
    const baseOffX = 2 + ((width - 4) - contentW * S) / 2;
    const baseOffY = 2 + ((height - 4) - contentH * S) / 2;
    const sx = (v: number) => baseOffX + (v - contentMinX) * S;
    const sy = (v: number) => baseOffY + (v - contentMinY) * S;
    const sd = (v: number) => v * S;

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // ── Right side: top flange lines ──
    // Horizontal line from (r0x-p) to (r1x+p) at r0y
    els.push(<line key={K()} x1={sx(r0x - p)} y1={sy(r0y)} x2={sx(r1x + p)} y2={sy(r0y)}
      stroke="#004290" strokeWidth={0.5}/>);
    // Horizontal line at r0y+p
    els.push(<line key={K()} x1={sx(r0x)} y1={sy(r0y + p)} x2={sx(r1x)} y2={sy(r1y + p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // Right side: main rect (a×l)
    els.push(<rect key={K()} x={sx(r0x)} y={sy(r0y)} width={sd(a)} height={sd(l)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── Left side: top flange lines ──
    els.push(<line key={K()} x1={sx(s0x - p)} y1={sy(s0y)} x2={sx(s1x + p)} y2={sy(s0y)}
      stroke="#004290" strokeWidth={0.5}/>);
    els.push(<line key={K()} x1={sx(s0x)} y1={sy(s0y + p)} x2={sx(s1x)} y2={sy(s1y + p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // Left side: main rect (b×l)
    els.push(<rect key={K()} x={sx(s0x)} y={sy(s0y)} width={sd(b)} height={sd(l)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);

    // ── "b" dim above right side (C# labels this "b") ──
    {
      const dimY = r0y - 15;
      els.push(<line key={K()} x1={sx(r0x)} y1={sy(dimY)} x2={sx(r1x)} y2={sy(dimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(r0x)} y1={sy(dimY - 3)} x2={sx(r0x)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(r1x)} y1={sy(dimY - 3)} x2={sx(r1x)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((r0x + r1x) / 2)} y={sy(dimY) - 4}
        fontSize={7} fill="#333" textAnchor="middle">b</text>);
    }

    // ── "f" line + dim below right side ──
    {
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(r3y)} x2={sx(fX2)} y2={sy(r2y)}
        stroke="#004290" strokeWidth={1.2}/>);
      const fDimY = r3y + 15;
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(fDimY)} x2={sx(fX2)} y2={sy(fDimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(fX1)} y1={sy(fDimY - 3)} x2={sx(fX1)} y2={sy(fDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(fX2)} y1={sy(fDimY - 3)} x2={sx(fX2)} y2={sy(fDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((fX1 + fX2) / 2)} y={sy(fDimY) + 10}
        fontSize={7} fill="#333" textAnchor="middle">f</text>);
    }

    // ── "a" dim above left side ──
    {
      const dimY2 = s0y - 15;
      els.push(<line key={K()} x1={sx(s0x)} y1={sy(dimY2)} x2={sx(s1x)} y2={sy(dimY2)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(s0x)} y1={sy(dimY2 - 3)} x2={sx(s0x)} y2={sy(dimY2 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(s1x)} y1={sy(dimY2 - 3)} x2={sx(s1x)} y2={sy(dimY2 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((s0x + s1x) / 2)} y={sy(dimY2) - 4}
        fontSize={7} fill="#333" textAnchor="middle">a</text>);
    }

    // ── "L" dim between left and right views ──
    {
      const lx = Math.trunc((s1x + r0x) / 2);
      const ly1 = s0y;
      const ly2 = s2y;
      els.push(<line key={K()} x1={sx(lx)} y1={sy(ly1)} x2={sx(lx)} y2={sy(ly2)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(lx - 3)} y1={sy(ly1)} x2={sx(lx + 3)} y2={sy(ly1)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(lx - 3)} y1={sy(ly2)} x2={sx(lx + 3)} y2={sy(ly2)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(lx) + 5} y={sy(Math.trunc((ly1 + ly2) / 2)) - 4}
        fontSize={7} fill="#333">L</text>);
    }

    // ── "e" line + dim below left side ──
    {
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(s3y)} x2={sx(eX2)} y2={sy(s2y)}
        stroke="#004290" strokeWidth={1.2}/>);
      const eDimY = s3y + 15;
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(eDimY)} x2={sx(eX2)} y2={sy(eDimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(eX1)} y1={sy(eDimY - 3)} x2={sx(eX1)} y2={sy(eDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(eX2)} y1={sy(eDimY - 3)} x2={sx(eX2)} y2={sy(eDimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((eX1 + eX2) / 2)} y={sy(eDimY) + 10}
        fontSize={7} fill="#333" textAnchor="middle">e</text>);
    }

    return <g>{els}</g>;
  };

  const renderSkewTee = () => {
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const d_raw = values[2] || 200;
    const h_raw = values[3] || 200;
    const e_raw = values[4] || 100;
    const r_raw = values[5] || 100;
    const q_raw = values[6] || 100;
    const i_raw = values[7] || 100;
    const j_raw = values[8] || 100;
    const pp_raw = values[9] || 100;

    let max = Math.max(a_raw, b_raw);
    let p = 25;
    if (max > 1000) p = 30;
    if (max > 2501) p = 40;
    if (p > max) max = p;
    if (i_raw > max) max = i_raw;
    if (j_raw > max) max = j_raw;
    if (d_raw > max) max = d_raw;
    if (h_raw + j_raw + q_raw + r_raw + i_raw > max) max = h_raw + j_raw + q_raw + r_raw + i_raw;
    if (pp_raw + b_raw + e_raw > max) max = pp_raw + b_raw + e_raw;

    const mnoznik = 70;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let d = Math.trunc(d_raw / max * mnoznik);
    let h = Math.trunc(h_raw / max * mnoznik);
    let i = Math.trunc(i_raw / max * mnoznik);
    let j = Math.trunc(j_raw / max * mnoznik);
    let pp = Math.trunc(pp_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);
    let q = Math.trunc(q_raw / max * mnoznik);
    let r = Math.trunc(r_raw / max * mnoznik);
    let ee = Math.trunc(e_raw / max * mnoznik);

    while ((pp + b + ee) < 100 && (h + j + q + r + i) < 60) {
      a = Math.trunc(a * 1.1);
      b = Math.trunc(b * 1.1);
      d = Math.trunc(d * 1.1);
      h = Math.trunc(h * 1.1);
      i = Math.trunc(i * 1.1);
      j = Math.trunc(j * 1.1);
      pp = Math.trunc(pp * 1.1);
      p = Math.trunc(p * 1.1);
      q = Math.trunc(q * 1.1);
      r = Math.trunc(r * 1.1);
      ee = Math.trunc(ee * 1.1);
    }
    if (q < 1) q = 1;
    if (r < 1) r = 1;

    let push_x = 130 - pp - b - ee;
    if (push_x < 0) push_x = 10;
    let push_y = 85 - i - r - h - q - j;
    if (push_y < 0) push_y = 10;

    // ── C# punkt coordinates (literal port) ──
    // punkty (right-side outer rect corners, 4 points)
    const pkt0x = 190 + push_x,                pkt0y = 20 + push_y;
    const pkt1x = 190 + a + push_x,            pkt1y = 20 + push_y;
    // punkty12 (right-side inner duct rect)
    const p12_0x = 190 + push_x,               p12_0y = 20 + push_y + i + r;
    const p12_1x = 190 + a + push_x,           p12_1y = 20 + push_y + i + r;
    const p12_2x = 190 + a + push_x,           p12_2y = 20 + push_y + i + r + h;
    const p12_3x = 190 + push_x,               p12_3y = 20 + push_y + i + r + h;

    // punkty13 (right-side outer flange rect) 
    const p13_0x = p12_0x - p,                  p13_0y = p12_0y - p;
    const p13_1x = p12_1x + p,                  p13_1y = p12_1y - p;
    const p13_2x = p12_2x + p,                  p13_2y = p12_2y + p;
    const p13_3x = p12_3x - p,                  p13_3y = p12_3y + p;

    // punkty14 (below duct+flange on right)
    const p14_0x = p12_3x,                      p14_0y = p13_3y;
    const p14_1x = p12_2x,                      p14_1y = p13_2y;
    const p14_2x = p12_2x,                      p14_2y = p12_2y + q + j;
    const p14_3x = p12_3x,                      p14_3y = p12_3y + q + j;

    // punkty15 (above duct on right)
    const p15_0x = pkt0x,                       p15_0y = pkt0y;
    const p15_1x = pkt1x,                       p15_1y = pkt1y;
    const p15_2x = pkt1x,                       p15_2y = pkt1y + i + r - p;
    const p15_3x = pkt0x,                       p15_3y = pkt0y + i + r - p;

    // punkty2 (horizontal duct on left)
    const s2_0x = 20 + push_x,                  s2_0y = 20 + push_y + i + r;
    const s2_1x = 20 + pp + push_x,             s2_1y = 20 + push_y + i + r;
    const s2_2x = 20 + pp + push_x,             s2_2y = 20 + push_y + i + r + h;
    const s2_3x = 20 + push_x,                  s2_3y = 20 + push_y + i + r + h;

    // punkty22 (bottom branch d × j)
    const p22_0x = s2_2x + q,                   p22_0y = s2_2y + q;
    const p22_1x = p22_0x + d,                  p22_1y = p22_0y;
    const p22_2x = p22_0x + d,                  p22_2y = p22_0y + j;
    const p22_3x = p22_0x,                      p22_3y = p22_0y + j;

    // Connecting line: from punkty22[1] offset up
    const lineTopX = p22_1x - ee;
    const lineTopY = p22_0y - r - h - q;

    // punkty23 (upper-right branch b × i)
    const p23_2x = lineTopX,                    p23_2y = lineTopY;
    const p23_0x = lineTopX - b,                p23_0y = lineTopY - i;
    const p23_1x = p23_0x + b,                  p23_1y = p23_0y;
    const p23_3x = p23_0x,                      p23_3y = p23_0y + i;

    // ── Bounding box for auto-fit ──
    const bbPad = 10;
    const contentMinX = Math.min(s2_0x - p, p13_0x, p23_0x - p, p22_0x - p) - bbPad - 20;
    const contentMaxX = Math.max(p13_1x, p23_1x + 20 + ee, p22_1x + p) + bbPad;
    const contentMinY = Math.min(pkt0y - 20, p23_0y - p - 20) - bbPad;
    const contentMaxY = Math.max(p14_3y + 30, p22_3y + 30) + bbPad;

    const contentW = contentMaxX - contentMinX;
    const contentH = contentMaxY - contentMinY;
    const S = Math.min((width - 4) / contentW, (height - 4) / contentH);
    const baseOffX = 2 + ((width - 4) - contentW * S) / 2;
    const baseOffY = 2 + ((height - 4) - contentH * S) / 2;
    const sx = (v: number) => baseOffX + (v - contentMinX) * S;
    const sy = (v: number) => baseOffY + (v - contentMinY) * S;
    const sd = (v: number) => v * S;

    const els: React.ReactElement[] = [];
    let _k = 0;
    const K = () => _k++;

    // ── Right side ──
    // punkty12: inner duct rect
    els.push(<rect key={K()} x={sx(p12_0x)} y={sy(p12_0y)} width={sd(a)} height={sd(h)}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // punkty13: outer flange rect
    els.push(<polygon key={K()}
      points={`${sx(p13_0x)},${sy(p13_0y)} ${sx(p13_1x)},${sy(p13_1y)} ${sx(p13_2x)},${sy(p13_2y)} ${sx(p13_3x)},${sy(p13_3y)}`}
      fill="none" stroke="#004290" strokeWidth={0.5}/>);

    // punkty14: below duct rect
    els.push(<polygon key={K()}
      points={`${sx(p14_0x)},${sy(p14_0y)} ${sx(p14_1x)},${sy(p14_1y)} ${sx(p14_2x)},${sy(p14_2y)} ${sx(p14_3x)},${sy(p14_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // punkty14 bottom flange: horizontal line at p14_3y with ±p
    els.push(<line key={K()} x1={sx(p14_3x - p)} y1={sy(p14_3y)} x2={sx(p14_2x + p)} y2={sy(p14_2y)}
      stroke="#004290" strokeWidth={0.5}/>);
    // punkty14 inner flange: line at p14_3y - p
    els.push(<line key={K()} x1={sx(p14_3x)} y1={sy(p14_3y - p)} x2={sx(p14_2x)} y2={sy(p14_2y - p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // punkty15: above duct rect
    els.push(<polygon key={K()}
      points={`${sx(p15_0x)},${sy(p15_0y)} ${sx(p15_1x)},${sy(p15_1y)} ${sx(p15_2x)},${sy(p15_2y)} ${sx(p15_3x)},${sy(p15_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // punkty15 top flange: horizontal line at p15_0y with ±p
    els.push(<line key={K()} x1={sx(p15_0x - p)} y1={sy(p15_0y)} x2={sx(p15_1x + p)} y2={sy(p15_1y)}
      stroke="#004290" strokeWidth={0.5}/>);
    // punkty15 inner flange: line at p15_0y + p
    els.push(<line key={K()} x1={sx(p15_0x)} y1={sy(p15_0y + p)} x2={sx(p15_1x)} y2={sy(p15_1y + p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "a" dim above right side
    {
      const dimY = pkt0y - 15;
      els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(dimY)} x2={sx(pkt1x)} y2={sy(dimY)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(dimY - 3)} x2={sx(pkt0x)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(pkt1x)} y1={sy(dimY - 3)} x2={sx(pkt1x)} y2={sy(dimY + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((pkt0x + pkt1x) / 2)} y={sy(dimY) - 4}
        fontSize={7} fill="#333" textAnchor="middle">a</text>);
    }

    // ── Left side: horizontal duct (punkty2) ──
    els.push(<polygon key={K()}
      points={`${sx(s2_0x)},${sy(s2_0y)} ${sx(s2_1x)},${sy(s2_1y)} ${sx(s2_2x)},${sy(s2_2y)} ${sx(s2_3x)},${sy(s2_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Colored line on right edge (punkty2[1]→punkty2[2])
    els.push(<line key={K()} x1={sx(s2_1x)} y1={sy(s2_1y)} x2={sx(s2_2x)} y2={sy(s2_2y)}
      stroke="#8a2048" strokeWidth={0.5}/>);
    // Left flange: vertical inner line at x+p
    els.push(<line key={K()} x1={sx(s2_0x + p)} y1={sy(s2_0y)} x2={sx(s2_3x + p)} y2={sy(s2_3y)}
      stroke="#004290" strokeWidth={0.5}/>);
    // Left flange: outer vertical line extended ±p
    els.push(<line key={K()} x1={sx(s2_0x)} y1={sy(s2_0y - p)} x2={sx(s2_3x)} y2={sy(s2_3y + p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "p" dim above horizontal duct
    {
      const dimY2 = s2_0y - 15;
      els.push(<line key={K()} x1={sx(s2_0x)} y1={sy(dimY2)} x2={sx(s2_1x)} y2={sy(dimY2)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(s2_0x)} y1={sy(dimY2 - 3)} x2={sx(s2_0x)} y2={sy(dimY2 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(s2_1x)} y1={sy(dimY2 - 3)} x2={sx(s2_1x)} y2={sy(dimY2 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx((s2_0x + s2_1x) / 2)} y={sy(dimY2) - 4}
        fontSize={7} fill="#333" textAnchor="middle">p</text>);
    }

    // "h" dim left of horizontal duct
    {
      const dimX = s2_0x - 15;
      els.push(<line key={K()} x1={sx(dimX)} y1={sy(s2_0y)} x2={sx(dimX)} y2={sy(s2_3y)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(dimX - 3)} y1={sy(s2_0y)} x2={sx(dimX + 3)} y2={sy(s2_0y)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(dimX - 3)} y1={sy(s2_3y)} x2={sx(dimX + 3)} y2={sy(s2_3y)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(dimX) - 8} y={sy((s2_0y + s2_3y) / 2) + 3}
        fontSize={7} fill="#333">h</text>);
    }

    // ── q arc (from horizontal duct bottom-right corner to bottom branch top-left) ──
    {
      // C#: DrawArc(punkty2[2].X-q, punkty2[2].Y, 2*q, 2*q, 270, 90)
      // center = (s2_2x, s2_2y+q), start at top (s2_2x, s2_2y), end at right (s2_2x+q, s2_2y+q)
      els.push(<path key={K()}
        d={`M ${sx(s2_2x)},${sy(s2_2y)} A ${sd(q)},${sd(q)} 0 0,1 ${sx(s2_2x + q)},${sy(s2_2y + q)}`}
        fill="none" stroke="#004290" strokeWidth={1.0}/>);
      // q radius line: from (center+q, center-q) to center
      const qcx = s2_2x, qcy = s2_2y + q;
      els.push(<line key={K()} x1={sx(qcx + q)} y1={sy(qcy - q)} x2={sx(qcx)} y2={sy(qcy)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(qcx + q)} y={sy(qcy - q) - 5}
        fontSize={6} fill="#333">q</text>);
    }

    // ── Bottom branch (punkty22: d×j) ──
    els.push(<polygon key={K()}
      points={`${sx(p22_0x)},${sy(p22_0y)} ${sx(p22_1x)},${sy(p22_1y)} ${sx(p22_2x)},${sy(p22_2y)} ${sx(p22_3x)},${sy(p22_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Top colored line
    els.push(<line key={K()} x1={sx(p22_0x + 1)} y1={sy(p22_0y)} x2={sx(p22_1x - 1)} y2={sy(p22_1y)}
      stroke="#8a2048" strokeWidth={0.5}/>);
    // Bottom branch flange: inner horizontal at y-p
    els.push(<line key={K()} x1={sx(p22_3x)} y1={sy(p22_3y - p)} x2={sx(p22_2x)} y2={sy(p22_2y - p)}
      stroke="#004290" strokeWidth={0.5}/>);
    // Bottom branch flange: outer horizontal with ±p
    els.push(<line key={K()} x1={sx(p22_3x - p)} y1={sy(p22_3y)} x2={sx(p22_2x + p)} y2={sy(p22_2y)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "d" dim below bottom branch
    {
      const dimY3 = p22_3y + 15;
      els.push(<line key={K()} x1={sx(p22_3x)} y1={sy(dimY3)} x2={sx(p22_2x)} y2={sy(dimY3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(p22_3x)} y1={sy(dimY3 - 3)} x2={sx(p22_3x)} y2={sy(dimY3 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(p22_3x + d)} y1={sy(dimY3 - 3)} x2={sx(p22_3x + d)} y2={sy(dimY3 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(p22_3x + d / 2)} y={sy(dimY3) + 10}
        fontSize={7} fill="#333" textAnchor="middle">d</text>);
    }

    // "j" dim left of bottom branch
    {
      const dimX2 = p22_0x - 15;
      els.push(<line key={K()} x1={sx(dimX2)} y1={sy(p22_0y)} x2={sx(dimX2)} y2={sy(p22_3y)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<line key={K()} x1={sx(dimX2 - 3)} y1={sy(p22_0y)} x2={sx(dimX2 + 3)} y2={sy(p22_0y)}
        stroke="#333" strokeWidth={0.4}/>);
      // C# bottom tick uses "i" offset from top: aaa.Y += i
      els.push(<line key={K()} x1={sx(dimX2 - 3)} y1={sy(p22_0y + i)} x2={sx(dimX2 + 3)} y2={sy(p22_0y + i)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(dimX2) - 6} y={sy(p22_0y + i / 2) + 3}
        fontSize={7} fill="#333">j</text>);
    }

    // ── Connecting line from punkty22[1] up to punkty23[2] ──
    els.push(<line key={K()} x1={sx(lineTopX)} y1={sy(lineTopY)} x2={sx(p22_1x)} y2={sy(p22_1y)}
      stroke="#004290" strokeWidth={1.2}/>);

    // ── Upper-right branch (punkty23: b×i) ──
    els.push(<polygon key={K()}
      points={`${sx(p23_0x)},${sy(p23_0y)} ${sx(p23_1x)},${sy(p23_1y)} ${sx(p23_2x)},${sy(p23_2y)} ${sx(p23_3x)},${sy(p23_3y)}`}
      fill="none" stroke="#004290" strokeWidth={1.2}/>);
    // Bottom colored line (punkty23[3]→punkty23[2])
    els.push(<line key={K()} x1={sx(p23_3x + 1)} y1={sy(p23_3y)} x2={sx(p23_2x - 1)} y2={sy(p23_2y)}
      stroke="#8a2048" strokeWidth={0.5}/>);
    // Top flange: outer horizontal with ±p
    els.push(<line key={K()} x1={sx(p23_0x - p)} y1={sy(p23_0y)} x2={sx(p23_1x + p)} y2={sy(p23_1y)}
      stroke="#004290" strokeWidth={0.5}/>);
    // Top flange: inner horizontal at y+p
    els.push(<line key={K()} x1={sx(p23_0x)} y1={sy(p23_0y + p)} x2={sx(p23_1x)} y2={sy(p23_1y + p)}
      stroke="#004290" strokeWidth={0.5}/>);

    // "i" dim right of upper-right branch
    {
      const dimX3 = p23_2x + 15;
      // C#: vertical line from punkty23[1] to punkty23[2], offset right by 15
      els.push(<line key={K()} x1={sx(dimX3)} y1={sy(p23_1y)} x2={sx(dimX3)} y2={sy(p23_2y)}
        stroke="#333" strokeWidth={0.4}/>);
      // bottom tick
      els.push(<line key={K()} x1={sx(dimX3 - 3)} y1={sy(p23_2y)} x2={sx(dimX3 + 3)} y2={sy(p23_2y)}
        stroke="#333" strokeWidth={0.4}/>);
      // top tick
      els.push(<line key={K()} x1={sx(dimX3 - 3)} y1={sy(p23_2y - i)} x2={sx(dimX3 + 3)} y2={sy(p23_2y - i)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(dimX3) + 4} y={sy(p23_2y - i / 2) + 3}
        fontSize={7} fill="#333">i</text>);
    }

    // "b" + "e" dims above upper-right branch
    {
      const dimY4 = p23_0y - 15;
      // b dim line
      els.push(<line key={K()} x1={sx(p23_0x)} y1={sy(dimY4)} x2={sx(p23_1x)} y2={sy(dimY4)}
        stroke="#333" strokeWidth={0.4}/>);
      // left tick
      els.push(<line key={K()} x1={sx(p23_0x)} y1={sy(dimY4 - 3)} x2={sx(p23_0x)} y2={sy(dimY4 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      // middle tick (b end)
      els.push(<line key={K()} x1={sx(p23_0x + b)} y1={sy(dimY4 - 3)} x2={sx(p23_0x + b)} y2={sy(dimY4 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      // right tick (ee end)
      els.push(<line key={K()} x1={sx(p23_0x + b + ee)} y1={sy(dimY4 - 3)} x2={sx(p23_0x + b + ee)} y2={sy(dimY4 + 3)}
        stroke="#333" strokeWidth={0.4}/>);
      // e dim line
      els.push(<line key={K()} x1={sx(p23_0x + b)} y1={sy(dimY4)} x2={sx(p23_0x + b + ee)} y2={sy(dimY4)}
        stroke="#333" strokeWidth={0.4}/>);
      // labels
      els.push(<text key={K()} x={sx(p23_0x + b / 2)} y={sy(dimY4) - 4}
        fontSize={7} fill="#333" textAnchor="middle">b</text>);
      els.push(<text key={K()} x={sx(p23_0x + b + ee / 2)} y={sy(dimY4) - 4}
        fontSize={7} fill="#333" textAnchor="middle">e</text>);
    }

    // ── r arc (from punkty23[3] bottom-left, curving to horizontal duct top-right) ──
    {
      // C#: DrawArc(punkty23[3].X - 2*r, punkty23[3].Y - r, 2*r, 2*r, 0, 90)
      // center = (p23_3x - r, p23_3y)
      // start (0° = right): (p23_3x, p23_3y) = bottom-left of upper branch
      // end (90° = bottom in GDI+): (p23_3x - r, p23_3y + r)
      els.push(<path key={K()}
        d={`M ${sx(p23_3x)},${sy(p23_3y)} A ${sd(r)},${sd(r)} 0 0,1 ${sx(p23_3x - r)},${sy(p23_3y + r)}`}
        fill="none" stroke="#004290" strokeWidth={1.0}/>);
      // Connecting line from arc end to horizontal duct right edge (punkty2[1])
      els.push(<line key={K()} x1={sx(p23_3x - r)} y1={sy(p23_3y + r)} x2={sx(s2_1x)} y2={sy(s2_1y)}
        stroke="#004290" strokeWidth={1.2}/>);
      // r label: line from (p23_3x - r, p23_3y) to (p23_3x, p23_3y + r)
      els.push(<line key={K()} x1={sx(p23_3x - r)} y1={sy(p23_3y)} x2={sx(p23_3x)} y2={sy(p23_3y + r)}
        stroke="#333" strokeWidth={0.4}/>);
      els.push(<text key={K()} x={sx(p23_3x)} y={sy(p23_3y + r) + 8}
        fontSize={6} fill="#333">r</text>);
    }

    return <g>{els}</g>;
  };

  const renderCoaxialSkewTee = () => {
    // TR8a: Coaxial skew tee - 1:1 C# port
    // params: a, b, c, d, w, g, l, l3, m, n, ee, f, i
    const a_raw = values[0] || 200;
    const b_raw = values[1] || 200;
    const c_raw = values[2] || 200;
    const d_raw = values[3] || 200;
    const w_raw = values[4] || 100;
    const g_raw = values[5] || 100;
    const l_raw = values[6] || 500;
    const l3_raw = values[7] || 200;
    const m_raw = values[8] || 50;
    const n_raw = values[9] || 50;
    const ee_raw = values[10] || 150;
    const f_raw = values[11] || 50;
    const i_raw = values[12] || 25;

    let p = 25;
    if (l_raw > 1000) p = 30;
    if (l_raw > 2501) p = 40;

    let max = l_raw;
    if (c_raw + m_raw > max) max = c_raw + m_raw;

    const mnoznik = 60;
    let a = Math.trunc(a_raw / max * mnoznik);
    let b = Math.trunc(b_raw / max * mnoznik);
    let c = Math.trunc(c_raw / max * mnoznik);
    let d = Math.trunc(d_raw / max * mnoznik);
    let w = Math.trunc(w_raw / max * mnoznik);
    let g = Math.trunc(g_raw / max * mnoznik);
    let l = Math.trunc(l_raw / max * mnoznik);
    let l3 = Math.trunc(l3_raw / max * mnoznik);
    let m = Math.trunc(m_raw / max * mnoznik);
    let n = Math.trunc(n_raw / max * mnoznik);
    let ee = Math.trunc(ee_raw / max * mnoznik);
    let f = Math.trunc(f_raw / max * mnoznik);
    let i = Math.trunc(i_raw / max * mnoznik);
    p = Math.trunc(p / max * mnoznik);

    let push_x = Math.trunc((110 - b) % 110 / 2);
    if (push_x < 0) push_x = -push_x;
    let push_y = Math.trunc((90 - l) / 2);

    const alfa = Math.atan((c - a + m) / (l - 2 * i));
    const w1 = Math.trunc(Math.cos(alfa) * w);

    // ── RIGHT-SIDE VIEW (front cross-section) ──
    // punkty: trapezoid with d width top, b width bottom, offset n
    const pkt0x = 190 + push_x;
    const pkt0y = 20 + push_y + i;
    const pkt1x = 190 + d + push_x;
    const pkt1y = 20 + push_y + i;
    const pkt2x = 190 + d - n + push_x;
    const pkt2y = 20 + push_y + l - i;
    const pkt3x = pkt2x - b;
    const pkt3y = 20 + push_y + l - i;

    // Flange outer corners (after adjusting by ±i, ±p)
    const fl_t0x = pkt0x - p;
    const fl_t0y = pkt0y - i;
    const fl_t1x = pkt1x + p;
    const fl_t1y = pkt1y - i;
    const fl_b2x = pkt2x + p;
    const fl_b2y = pkt2y + i;
    const fl_b3x = pkt3x - p;
    const fl_b3y = pkt3y + i;

    // Inner flange lines (top at y+p, bottom at y-p from flange)
    const fli_t0x = pkt0x;
    const fli_t0y = pkt0y - i + p;
    const fli_t1x = pkt1x;
    const fli_t1y = pkt1y - i + p;
    const fli_b2x = pkt2x;
    const fli_b2y = pkt2y + i - p;
    const fli_b3x = pkt3x;
    const fli_b3y = pkt3y + i - p;

    // Branch rect (pk1) on right side
    // C# restores punkty[3].X += p back to pkt3x, and punkty[3].Y is pkt3y+i after +=i mutation
    const pk1_3x = pkt3x + f - Math.trunc(g / 2);
    const pk1_3y = (pkt3y + i) - (l - ee - Math.trunc(w1 / 2) - 2 * i);
    const pk1_2x = pk1_3x + g;
    const pk1_2y = pk1_3y;
    const pk1_1x = pk1_2x;
    const pk1_1y = pk1_2y - w1;
    const pk1_0x = pk1_1x - g;
    const pk1_0y = pk1_1y;

    // Branch flange rect (pk2) around pk1
    const pk2_0x = pk1_0x - p;
    const pk2_0y = pk1_0y - p;
    const pk2_1x = pk1_1x + p;
    const pk2_1y = pk1_1y - p;
    const pk2_2x = pk1_2x + p;
    const pk2_2y = pk1_2y + p;
    const pk2_3x = pk1_3x - p;
    const pk2_3y = pk1_3y + p;

    // ── LEFT-SIDE VIEW (side view) ──
    // punkty2: trapezoid with c width top, a width bottom, offset m
    const p2_0x = 20 + push_x;
    const p2_0y = 20 + push_y + i;
    const p2_1x = 20 + c + push_x;
    const p2_1y = 20 + push_y + i;
    const p2_2x = 20 + c + m + push_x;
    const p2_2y = 20 + l + push_y - i;
    const p2_3x = 20 + c + m - a + push_x;
    const p2_3y = 20 + l + push_y - i;

    // Left flanges
    const fl2_t0x = p2_0x - p;
    const fl2_t0y = p2_0y - i;
    const fl2_t1x = p2_1x + p;
    const fl2_t1y = p2_1y - i;
    const fl2_b2x = p2_2x + p;
    const fl2_b2y = p2_2y + i;
    const fl2_b3x = p2_3x - p;
    const fl2_b3y = p2_3y + i;

    // Left inner flange lines
    const fli2_t0x = p2_0x;
    const fli2_t0y = p2_0y - i + p;
    const fli2_t1x = p2_1x;
    const fli2_t1y = p2_1y - i + p;
    const fli2_b2x = p2_2x;
    const fli2_b2y = p2_2y + i - p;
    const fli2_b3x = p2_3x;
    const fli2_b3y = p2_3y + i - p;

    // Angled branch duct on left side
    const dd = ee - i - w1 / 2.0;
    const s1x_br = Math.tan(alfa) * dd;
    const s2x_br = Math.tan(alfa) * (dd + w1);

    const bp1x = p2_0x + Math.trunc(s1x_br);
    const bp1y = p2_0y + i + Math.trunc(dd);
    const bp2x = bp1x + Math.trunc(s2x_br) - Math.trunc(s1x_br);
    const bp2y = bp1y + w1;

    const l3_sx = Math.cos(alfa) * l3;
    const l3_sy = Math.sin(alfa) * l3;

    const bp3x = bp2x - Math.trunc(l3_sx);
    const bp3y = bp2y + Math.trunc(l3_sy);
    const bp4x = bp1x - Math.trunc(l3_sx);
    const bp4y = bp1y + Math.trunc(l3_sy);

    // Perpendicular flange at end of branch (p4-p3)
    const perp_cos = Math.cos(alfa) * (p + 1);
    const perp_sin = Math.sin(alfa) * (p + 1);

    const fl_br_ax = bp4x - Math.trunc(perp_sin) - 1;
    const fl_br_ay = bp4y - Math.trunc(perp_cos);
    const fl_br_bx = bp3x + Math.trunc(perp_sin) + 1;
    const fl_br_by = bp3y + Math.trunc(perp_cos);

    // ── Bounding box → auto-fit viewport ──
    const allX = [
      pkt0x, pkt1x, pkt2x, pkt3x,
      fl_t0x, fl_t1x, fl_b2x, fl_b3x,
      pk2_0x, pk2_1x, pk2_2x, pk2_3x,
      p2_0x, p2_1x, p2_2x, p2_3x,
      fl2_t0x, fl2_t1x, fl2_b2x, fl2_b3x,
      bp1x, bp2x, bp3x, bp4x,
      fl_br_ax, fl_br_bx,
    ];
    const allY = [
      pkt0y - i, pkt2y + i,
      fl_t0y, fl_b2y,
      pk2_0y, pk2_2y,
      p2_0y - i, p2_2y + i,
      fl2_t0y, fl2_b2y,
      bp1y, bp2y, bp3y, bp4y,
      fl_br_ay, fl_br_by,
    ];
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const W = maxX - minX;
    const H = maxY - minY;
    const padX = 35;
    const padY = 30;
    const scaleX = (width - 2 * padX) / (W || 1);
    const scaleY = (height - 2 * padY) / (H || 1);
    const sc = Math.min(scaleX, scaleY);
    const offX = padX + ((width - 2 * padX) - W * sc) / 2 - minX * sc;
    const offY = padY + ((height - 2 * padY) - H * sc) / 2 - minY * sc;
    const sx = (v: number) => v * sc + offX;
    const sy = (v: number) => v * sc + offY;

    const els: React.JSX.Element[] = [];
    let k = 0;
    const K = () => k++;
    const S = '#004290';
    const D = '#9b9b9b';
    const sw = 1.2;
    const dsw = 0.7;

    // ════════ RIGHT-SIDE VIEW ════════

    // Trapezoid side lines (not top/bottom)
    els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(pkt0y)} x2={sx(pkt3x)} y2={sy(pkt3y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(pkt1x)} y1={sy(pkt1y)} x2={sx(pkt2x)} y2={sy(pkt2y)}
      stroke={S} strokeWidth={sw} />);

    // Vertical connection lines (duct corners to flange)
    els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(pkt0y - i)} x2={sx(pkt0x)} y2={sy(pkt0y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(pkt1x)} y1={sy(pkt1y - i)} x2={sx(pkt1x)} y2={sy(pkt1y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(pkt2x)} y1={sy(pkt2y)} x2={sx(pkt2x)} y2={sy(pkt2y + i)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(pkt3x)} y1={sy(pkt3y)} x2={sx(pkt3x)} y2={sy(pkt3y + i)}
      stroke={S} strokeWidth={sw} />);

    // Inner flange lines (top)
    els.push(<line key={K()} x1={sx(fli_t0x)} y1={sy(fli_t0y)} x2={sx(fli_t1x)} y2={sy(fli_t1y)}
      stroke={S} strokeWidth={sw} />);
    // Inner flange lines (bottom)
    els.push(<line key={K()} x1={sx(fli_b3x)} y1={sy(fli_b3y)} x2={sx(fli_b2x)} y2={sy(fli_b2y)}
      stroke={S} strokeWidth={sw} />);

    // Outer flange rects (top/bottom)
    els.push(<line key={K()} x1={sx(fl_t0x)} y1={sy(fl_t0y)} x2={sx(fl_t1x)} y2={sy(fl_t1y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(fl_b3x)} y1={sy(fl_b3y)} x2={sx(fl_b2x)} y2={sy(fl_b2y)}
      stroke={S} strokeWidth={sw} />);

    // ── d dimension (top of right view) ──
    {
      const dy = pkt0y - i - 15;
      els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(dy)} x2={sx(pkt1x)} y2={sy(dy)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(pkt0x)} y1={sy(dy - 3)} x2={sx(pkt0x)} y2={sy(dy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(pkt1x)} y1={sy(dy - 3)} x2={sx(pkt1x)} y2={sy(dy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(pkt0x + d / 2 - 5)} y={sy(dy - 15)}
        fontSize={6} fill="#333">d</text>);
    }

    // ── n dimension (top-right offset) ──
    {
      const ny = pkt0y - i - 15;
      const nx = pkt1x;
      els.push(<line key={K()} x1={sx(nx)} y1={sy(ny)} x2={sx(nx - n)} y2={sy(ny)}
        stroke={D} strokeWidth={dsw} />);
      // Note: n ticks are below d ticks since we're further right
      els.push(<line key={K()} x1={sx(nx - n)} y1={sy(ny - 3)} x2={sx(nx - n)} y2={sy(ny + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(nx - n / 2 - 5)} y={sy(ny - 15)}
        fontSize={6} fill="#333">n</text>);
    }

    // ── l dimension (right side) ──
    {
      const lx = Math.max(pkt1x, pkt2x) + 15;
      const ly_top = pkt0y - i;
      const ly_bot = pkt2y + i;
      els.push(<line key={K()} x1={sx(lx)} y1={sy(ly_top)} x2={sx(lx)} y2={sy(ly_bot)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(lx - 3)} y1={sy(ly_top)} x2={sx(lx + 3)} y2={sy(ly_top)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(lx - 3)} y1={sy(ly_bot)} x2={sx(lx + 3)} y2={sy(ly_bot)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(lx + 10)} y={sy((ly_top + ly_bot) / 2 + 5)}
        fontSize={6} fill="#333">l</text>);
    }

    // ── b dimension (bottom of right view) ──
    {
      const by = pkt3y + i + 20;
      const bx_left = pkt3x;
      const bx_right = bx_left + b;
      els.push(<line key={K()} x1={sx(bx_left)} y1={sy(by)} x2={sx(bx_right)} y2={sy(by)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(bx_left)} y1={sy(by + 3)} x2={sx(bx_left)} y2={sy(by - 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(bx_right)} y1={sy(by + 3)} x2={sx(bx_right)} y2={sy(by - 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(bx_left + b / 2 - 5)} y={sy(by + 3)}
        fontSize={6} fill="green">b</text>);
    }

    // ── f dimension (bottom-left) ──
    {
      const fy = pkt3y + i + 10;
      const fx_left = pkt3x - p + 3;
      const fx_right = fx_left + f;
      els.push(<line key={K()} x1={sx(fx_left)} y1={sy(fy)} x2={sx(fx_right)} y2={sy(fy)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(fx_left)} y1={sy(fy - 3)} x2={sx(fx_left)} y2={sy(fy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(fx_right)} y1={sy(fy - 3)} x2={sx(fx_right)} y2={sy(fy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(fx_left + f / 2 - 5)} y={sy(fy + 2)}
        fontSize={6} fill="#333">f</text>);
    }

    // ── g dimension (above branch rect on right) ──
    {
      const gy = pk1_0y - 10;
      els.push(<line key={K()} x1={sx(pk1_0x)} y1={sy(gy)} x2={sx(pk1_1x)} y2={sy(gy)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(pk1_0x)} y1={sy(gy - 3)} x2={sx(pk1_0x)} y2={sy(gy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(pk1_1x)} y1={sy(gy - 3)} x2={sx(pk1_1x)} y2={sy(gy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(pk1_0x + g / 2 - 3)} y={sy(gy - 10)}
        fontSize={6} fill="#333">g</text>);
    }

    // Branch polygon pk1 (inner rect)
    els.push(<polygon key={K()} points={`${sx(pk1_0x)},${sy(pk1_0y)} ${sx(pk1_1x)},${sy(pk1_1y)} ${sx(pk1_2x)},${sy(pk1_2y)} ${sx(pk1_3x)},${sy(pk1_3y)}`}
      fill="none" stroke={S} strokeWidth={sw} />);
    // Branch flange polygon pk2 (outer rect)
    els.push(<polygon key={K()} points={`${sx(pk2_0x)},${sy(pk2_0y)} ${sx(pk2_1x)},${sy(pk2_1y)} ${sx(pk2_2x)},${sy(pk2_2y)} ${sx(pk2_3x)},${sy(pk2_3y)}`}
      fill="none" stroke={S} strokeWidth={sw} />);

    // ════════ LEFT-SIDE VIEW ════════

    // Trapezoid side lines
    els.push(<line key={K()} x1={sx(p2_0x)} y1={sy(p2_0y)} x2={sx(p2_3x)} y2={sy(p2_3y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(p2_1x)} y1={sy(p2_1y)} x2={sx(p2_2x)} y2={sy(p2_2y)}
      stroke={S} strokeWidth={sw} />);

    // Top flange connections + lines
    els.push(<line key={K()} x1={sx(p2_0x)} y1={sy(p2_0y)} x2={sx(p2_0x)} y2={sy(p2_0y - i)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(p2_1x)} y1={sy(p2_1y)} x2={sx(p2_1x)} y2={sy(p2_1y - i)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(fl2_t0x)} y1={sy(fl2_t0y)} x2={sx(fl2_t1x)} y2={sy(fl2_t1y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(fli2_t0x)} y1={sy(fli2_t0y)} x2={sx(fli2_t1x)} y2={sy(fli2_t1y)}
      stroke={S} strokeWidth={sw} />);

    // Bottom flange connections + lines
    els.push(<line key={K()} x1={sx(p2_3x)} y1={sy(p2_3y)} x2={sx(p2_3x)} y2={sy(p2_3y + i)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(p2_2x)} y1={sy(p2_2y)} x2={sx(p2_2x)} y2={sy(p2_2y + i)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(fl2_b3x)} y1={sy(fl2_b3y)} x2={sx(fl2_b2x)} y2={sy(fl2_b2y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(fli2_b3x)} y1={sy(fli2_b3y)} x2={sx(fli2_b2x)} y2={sy(fli2_b2y)}
      stroke={S} strokeWidth={sw} />);

    // ── c dimension (top of left view) ──
    {
      const cy = p2_0y - i + p - 20;
      els.push(<line key={K()} x1={sx(p2_0x)} y1={sy(cy)} x2={sx(p2_1x)} y2={sy(cy)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_0x)} y1={sy(cy - 3)} x2={sx(p2_0x)} y2={sy(cy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_1x)} y1={sy(cy - 3)} x2={sx(p2_1x)} y2={sy(cy + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(p2_0x + c / 2 - 3)} y={sy(cy - 15)}
        fontSize={6} fill="#333">c</text>);
    }

    // ── i=j top dimension (right side of left view top) ──
    {
      const ix = p2_1x + 20;
      els.push(<line key={K()} x1={sx(ix)} y1={sy(p2_1y)} x2={sx(ix)} y2={sy(p2_1y - i)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(ix - 3)} y1={sy(p2_1y - i)} x2={sx(ix + 3)} y2={sy(p2_1y - i)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(ix - 3)} y1={sy(p2_1y)} x2={sx(ix + 3)} y2={sy(p2_1y)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(ix + 5)} y={sy(p2_1y - i / 2 + 2)}
        fontSize={5} fill="#333">i=j</text>);
    }

    // ── i=j bottom dimension (right side of left view bottom) ──
    {
      const ix = p2_2x + 20;
      els.push(<line key={K()} x1={sx(ix)} y1={sy(p2_2y)} x2={sx(ix)} y2={sy(p2_2y + i)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(ix - 3)} y1={sy(p2_2y + i)} x2={sx(ix + 3)} y2={sy(p2_2y + i)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(ix - 3)} y1={sy(p2_2y)} x2={sx(ix + 3)} y2={sy(p2_2y)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(ix + 5)} y={sy(p2_2y + i / 2 + 2)}
        fontSize={5} fill="#333">i=j</text>);
    }

    // ── a dimension (bottom of left view) ──
    {
      const ay = p2_3y + 20;
      els.push(<line key={K()} x1={sx(p2_3x)} y1={sy(ay)} x2={sx(p2_3x + a)} y2={sy(ay)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_3x)} y1={sy(ay - 3)} x2={sx(p2_3x)} y2={sy(ay + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_3x + a)} y1={sy(ay - 3)} x2={sx(p2_3x + a)} y2={sy(ay + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(p2_3x + a / 2 - 5)} y={sy(ay + 3)}
        fontSize={6} fill="red">a</text>);
    }

    // ── m dimension (bottom-right of left view) ──
    {
      const my = p2_2y + 20;
      els.push(<line key={K()} x1={sx(p2_2x)} y1={sy(my)} x2={sx(p2_2x - m)} y2={sy(my)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_2x)} y1={sy(my - 3)} x2={sx(p2_2x)} y2={sy(my + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(p2_2x - m)} y1={sy(my - 3)} x2={sx(p2_2x - m)} y2={sy(my + 3)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(p2_2x - m / 2 - 5)} y={sy(my + 3)}
        fontSize={6} fill="#333">m</text>);
    }

    // ── e dimension (vertical from top center of left view) ──
    {
      const ex = p2_0x + Math.trunc(c / 2);
      els.push(<line key={K()} x1={sx(ex)} y1={sy(p2_0y)} x2={sx(ex)} y2={sy(p2_0y + ee)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<line key={K()} x1={sx(ex + 3)} y1={sy(p2_0y + ee)} x2={sx(ex - 3)} y2={sy(p2_0y + ee)}
        stroke={D} strokeWidth={dsw} />);
      els.push(<text key={K()} x={sx(ex + 3)} y={sy(p2_0y + ee / 2 + 2)}
        fontSize={6} fill="#333">e</text>);
    }

    // ── Angled branch duct lines (left view) ──
    els.push(<line key={K()} x1={sx(bp1x)} y1={sy(bp1y)} x2={sx(bp4x)} y2={sy(bp4y)}
      stroke={S} strokeWidth={sw} />);
    els.push(<line key={K()} x1={sx(bp3x)} y1={sy(bp3y)} x2={sx(bp2x)} y2={sy(bp2y)}
      stroke={S} strokeWidth={sw} />);

    // Perpendicular flange line at branch end (p4-p3)
    els.push(<line key={K()} x1={sx(fl_br_ax)} y1={sy(fl_br_ay)} x2={sx(fl_br_bx)} y2={sy(fl_br_by)}
      stroke={S} strokeWidth={sw} />);

    // ── w dimension (along angled branch, left view) ──
    {
      // Mirror of C# "aaa/bbb" lines - perpendicular ticks at branch end
      const aaa_x = bp4x - Math.trunc(l3_sx);
      const aaa_y = bp4y + Math.trunc(l3_sy);
      const bbb_x = bp3x - Math.trunc(l3_sx);
      const bbb_y = bp3y + Math.trunc(l3_sy);

      // Second perpendicular flange line
      els.push(<line key={K()} x1={sx(aaa_x)} y1={sy(aaa_y)} x2={sx(bbb_x)} y2={sy(bbb_y)}
        stroke={S} strokeWidth={sw} />);

      // w tick marks (perpendicular to branch direction)
      const w_perp_cos = Math.trunc(perp_cos);
      const w_perp_sin = Math.trunc(perp_sin);
      const w_t1_ax = aaa_x - w_perp_cos;
      const w_t1_ay = aaa_y + w_perp_sin + 1;
      const w_t1_bx = aaa_x + w_perp_cos;
      const w_t1_by = aaa_y - w_perp_sin - 1;
      els.push(<line key={K()} x1={sx(w_t1_ax)} y1={sy(w_t1_ay)} x2={sx(w_t1_bx)} y2={sy(w_t1_by)}
        stroke={D} strokeWidth={dsw} />);

      const sinAlfa_w = Math.trunc(Math.sin(alfa) * w);
      const w_t2_ax = w_t1_ax + sinAlfa_w;
      const w_t2_ay = w_t1_ay + w1;
      const w_t2_bx = w_t1_bx + sinAlfa_w;
      const w_t2_by = w_t1_by + w1;
      els.push(<line key={K()} x1={sx(w_t2_ax)} y1={sy(w_t2_ay)} x2={sx(w_t2_bx)} y2={sy(w_t2_by)}
        stroke={D} strokeWidth={dsw} />);

      els.push(<text key={K()} x={sx(aaa_x - 10)} y={sy(aaa_y + w1 / 2 - 5)}
        fontSize={6} fill="#333">w</text>);
    }

    // ── l3 dimension (along branch length, left view) ──
    {
      const l3_perp_cos = Math.trunc(Math.cos(alfa) * 10);
      const l3_perp_sin = Math.trunc(Math.sin(alfa) * 10);
      const l3_p1x = bp1x - l3_perp_sin;
      const l3_p1y = bp1y - l3_perp_cos;
      const l3_p4x = bp4x - l3_perp_sin;
      const l3_p4y = bp4y - l3_perp_cos;
      els.push(<line key={K()} x1={sx(l3_p1x)} y1={sy(l3_p1y)} x2={sx(l3_p4x)} y2={sy(l3_p4y)}
        stroke={D} strokeWidth={dsw} />);

      // Tick at p4 end
      const l3_tick_cos = Math.trunc(Math.cos(alfa) * (p + 1));
      const l3_tick_sin = Math.trunc(Math.sin(alfa) * (p + 1));
      const l3_ta_x = l3_p4x - l3_tick_sin - 1;
      const l3_ta_y = l3_p4y - l3_tick_cos;
      const l3_tb_x = l3_p4x + l3_tick_sin + 1;
      const l3_tb_y = l3_p4y + l3_tick_cos;
      els.push(<line key={K()} x1={sx(l3_ta_x)} y1={sy(l3_ta_y)} x2={sx(l3_tb_x)} y2={sy(l3_tb_y)}
        stroke={D} strokeWidth={dsw} />);

      els.push(<text key={K()} x={sx(l3_ta_x)} y={sy(l3_ta_y - 12)}
        fontSize={6} fill="#333">l3</text>);
    }

    return <g>{els}</g>;
  };

  const renderCoaxialTee = () => {
    // TR9a: Coaxial skew tee with round branch — literal C# port (Form1.cs lines 15640-15968)
    // Every mutation step matches the C# exactly. Variables aa, bb are mutable just like C# Point structs.
    let a = values[0] || 200;
    let b = values[1] || 200;
    let c = values[2] || 200;
    let d = values[3] || 200;
    let d1 = values[4] || 100;
    let l = values[5] || 500;
    let l3 = values[6] || 200;
    let m = values[7] || 50;
    let n = values[8] || 50;
    let ee = values[9] || 150;
    let f = values[10] || 50;
    let i = values[11] || 25;
    let j = values[12] || 25;

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let max: number = l;
    if (c + m > max) max = c + m;

    const mnoznik = 60;
    a = (a / max * mnoznik) | 0;
    b = (b / max * mnoznik) | 0;
    c = (c / max * mnoznik) | 0;
    d = (d / max * mnoznik) | 0;
    d1 = (d1 / max * mnoznik) | 0;
    l = (l / max * mnoznik) | 0;
    l3 = (l3 / max * mnoznik) | 0;
    m = (m / max * mnoznik) | 0;
    n = (n / max * mnoznik) | 0;
    ee = (ee / max * mnoznik) | 0;
    f = (f / max * mnoznik) | 0;
    i = (i / max * mnoznik) | 0;
    j = (j / max * mnoznik) | 0;
    p = (p / max * mnoznik) | 0;

    let push_x = ((110 - b) % 110 / 2) | 0;
    if (push_x < 0) push_x = -push_x;
    const push_y = ((90 - l) / 2) | 0;

    // Collect all lines/elements, then auto-fit at the end
    type Pt = { X: number; Y: number };
    const lines: { p1: Pt; p2: Pt; color: string; w: number }[] = [];
    const texts: { pt: Pt; text: string; color: string; sz: number }[] = [];
    const circles: { x: number; y: number; w: number; h: number; color: string; lw: number }[] = [];

    const DL = (p1: Pt, p2: Pt, color: string, w: number) => { lines.push({ p1: { ...p1 }, p2: { ...p2 }, color, w }); };
    const DS = (text: string, pt: Pt, color: string, sz: number) => { texts.push({ pt: { ...pt }, text, color, sz }); };
    const DE = (x: number, y: number, w: number, h: number, color: string, lw: number) => { circles.push({ x, y, w, h, color, lw }); };

    const S = '#004290';
    const sw = 1.2;
    const D = '#9b9b9b';
    const dsw = 0.7;

    // ════════ RIGHT-SIDE VIEW ("maly") ════════
    const punkty: Pt[] = [
      { X: 190 + push_x, Y: 20 + push_y + i },
      { X: 190 + d + push_x, Y: 20 + push_y + i },
      { X: 190 + d - n + push_x, Y: 20 + push_y + l - j },
      { X: 0, Y: 20 + push_y + l - j },
    ];
    punkty[3].X = punkty[2].X - b;

    // C#: DrawLine(punkty[0], punkty[3]); DrawLine(punkty[1], punkty[2]);
    DL(punkty[0], punkty[3], S, sw);
    DL(punkty[1], punkty[2], S, sw);

    // C#: Y mutations
    punkty[0].Y -= i; punkty[1].Y -= i;
    punkty[2].Y += j; punkty[3].Y += j;

    // C#: vertical stubs
    DL(punkty[0], { X: punkty[0].X, Y: punkty[0].Y + i }, S, sw);
    DL(punkty[1], { X: punkty[1].X, Y: punkty[1].Y + i }, S, sw);
    DL(punkty[2], { X: punkty[2].X, Y: punkty[2].Y - j }, S, sw);
    DL(punkty[3], { X: punkty[3].X, Y: punkty[3].Y - j }, S, sw);

    // ── d dimension ──
    let aa: Pt = { ...punkty[0] };
    let bb: Pt = { ...punkty[1] };
    aa.Y -= 15; bb.Y -= 15;
    DL(aa, bb, D, dsw); // d line
    aa = { ...bb };
    aa.Y -= 3; bb.Y += 3;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= d; bb.X -= d;
    DL(aa, bb, D, dsw); // left tick
    aa.X += (d / 2 - 5) | 0; aa.Y -= 15;
    DS('d', aa, '#333', 6);

    // ── n dimension (continuation from d) ──
    bb.Y -= 3;
    bb.X += d; aa = { ...bb };
    bb.X -= n;
    DL(aa, bb, D, dsw); // n line
    aa = { ...bb }; aa.Y -= 3; bb.Y += 3;
    DL(aa, bb, D, dsw); // n tick
    aa.Y -= 15; aa.X += (n / 2 - 5) | 0;
    DS('n', aa, '#333', 6);

    // ── l dimension (BEFORE X mutations, matching C#) ──
    bb = { ...punkty[2] };
    if (bb.X < punkty[1].X) bb.X = punkty[1].X;
    bb.X += 15;
    aa = { ...bb };
    aa.Y -= l;
    DL(aa, bb, D, dsw); // l vertical line
    bb = { ...aa };
    aa.X -= 3; bb.X += 3;
    DL(aa, bb, D, dsw); // top tick
    aa.Y += l; bb.Y += l;
    DL(aa, bb, D, dsw); // bottom tick
    bb.Y -= (l / 2 + 10) | 0; bb.X += 10;
    DS('l', bb, '#333', 6);

    // ── inner flange lines (before X mutation) ──
    aa = { ...punkty[0] }; bb = { ...punkty[1] };
    aa.Y += p; bb.Y += p;
    DL(aa, bb, S, sw); // top inner
    aa = { ...punkty[2] }; bb = { ...punkty[3] };
    aa.Y -= p; bb.Y -= p;
    DL(aa, bb, S, sw); // bottom inner

    // ── X mutations for outer flange ──
    punkty[0].X -= p; punkty[1].X += p;
    punkty[3].X -= p; punkty[2].X += p;

    // ── outer flange lines ──
    DL(punkty[0], punkty[1], S, sw); // top outer
    DL(punkty[2], punkty[3], S, sw); // bottom outer

    // ── b dimension ──
    aa = { ...punkty[3] }; bb = { ...punkty[2] };
    aa.X += p; bb.X -= p;
    aa.Y += 20; bb.Y += 20;
    DL(aa, bb, D, dsw); // b line
    bb = { ...aa };
    aa.Y += 3; bb.Y -= 3;
    DL(aa, bb, D, dsw); // left tick
    aa.X += b; bb.X += b;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= (b / 2 + 5) | 0;
    DS('b', aa, 'green', 6);

    // ── f dimension ──
    aa = { ...punkty[3] }; aa.X += 3; aa.Y += 10;
    bb = { ...aa }; bb.X += f;
    DL(aa, bb, D, dsw); // f line
    bb = { ...aa };
    bb.Y += 3; aa.Y -= 3;
    DL(aa, bb, D, dsw); // left tick
    bb.X += f; aa.X += f;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= (f / 2 + 5) | 0; aa.Y += 2;
    DS('f', aa, '#333', 6);

    // ── alfa, w1 ──
    const alfa = Math.atan((c - a + m) / (l - i - j));
    const w1 = (Math.cos(alfa) * d1) | 0;

    // ── pk1 (branch circle bounding rect) ──
    punkty[3].X += p; // C#: restore X
    const pk1: Pt[] = [{ X: 0, Y: 0 }, { X: 0, Y: 0 }, { X: 0, Y: 0 }, { X: 0, Y: 0 }];
    pk1[3] = { ...punkty[3] }; pk1[3].X += f - ((d1 / 2) | 0); pk1[3].Y -= l - ee - ((w1 / 2) | 0) - 2 * i;
    pk1[2] = { ...pk1[3] }; pk1[2].X += d1;
    pk1[1] = { ...pk1[2] }; pk1[1].Y -= w1;
    pk1[0] = { ...pk1[1] }; pk1[0].X -= d1;

    // ── d1 dimension (right view, above circle) ──
    aa = { ...pk1[0] }; bb = { ...pk1[1] };
    aa.Y -= 10; bb.Y -= 10;
    DL(aa, bb, D, dsw); // d1 line
    bb = { ...aa };
    aa.Y -= 3; bb.Y += 3;
    DL(aa, bb, D, dsw); // left tick
    aa.X += d1; bb.X += d1;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= ((d1 / 2 + 3) | 0); aa.Y -= 10;
    DS('d1', aa, '#333', 6);

    // ── Draw circle (branch opening) ──
    DE(pk1[0].X, pk1[0].Y, d1, d1, S, sw);

    // ════════ LEFT-SIDE VIEW ("poziomy") ════════
    const punkty2: Pt[] = [
      { X: 20 + push_x, Y: 20 + push_y + i },
      { X: 20 + c + push_x, Y: 20 + push_y + i },
      { X: 20 + c + m + push_x, Y: 20 + l + push_y - j },
      { X: 20 + c + m - a + push_x, Y: 20 + l + push_y - j },
    ];

    // C#: DrawLine(punkty2[0], punkty2[3]); DrawLine(punkty2[1], punkty2[2]);
    DL(punkty2[0], punkty2[3], S, sw);
    DL(punkty2[1], punkty2[2], S, sw);

    // ── top flange (left view) ──
    aa = { ...punkty2[0] }; aa.Y -= i;
    bb = { ...punkty2[1] }; bb.Y -= i;
    DL(punkty2[0], aa, S, sw); // vertical stub left
    DL(punkty2[1], bb, S, sw); // vertical stub right
    aa.X -= p; bb.X += p;
    DL(aa, bb, S, sw); // outer top flange
    aa = { ...punkty2[0] }; aa.Y -= i;
    bb = { ...punkty2[1] }; bb.Y -= i;
    aa.Y += p; bb.Y += p;
    DL(aa, bb, S, sw); // inner top flange

    // ── c dimension (continuation from inner top flange aa,bb) ──
    aa.Y -= 20; bb.Y -= 20;
    DL(aa, bb, D, dsw); // c line
    bb = { ...aa };
    aa.Y -= 3; bb.Y += 3;
    DL(aa, bb, D, dsw); // left tick
    aa.X += c; bb.X += c;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= ((c / 2 + 3) | 0); aa.Y -= 15;
    DS('c', aa, '#333', 6);

    // ── i dimension (top, left view) ──
    bb = { ...punkty2[1] }; aa = { ...punkty2[1] };
    aa.X = (bb.X += 20);
    bb.Y -= i;
    DL(aa, bb, D, dsw); // i vertical line
    aa = { ...bb };
    aa.X -= 3; bb.X += 3;
    DL(aa, bb, D, dsw); // top tick
    aa.Y += i; bb.Y += i;
    DL(aa, bb, D, dsw); // bottom tick
    aa.Y -= ((i / 2 + 5) | 0); aa.X += 5;
    DS('i', aa, '#333', 5);

    // ── j dimension (bottom, left view) ──
    bb = { ...punkty2[2] }; aa = { ...punkty2[2] };
    aa.X = (bb.X += 20);
    bb.Y += j;
    DL(aa, bb, D, dsw); // j vertical line
    aa = { ...bb };
    aa.X -= 3; bb.X += 3;
    DL(aa, bb, D, dsw); // bottom tick
    aa.Y -= j; bb.Y -= j;
    DL(aa, bb, D, dsw); // top tick
    aa.Y -= ((j / 2 + 5) | 0); aa.X += 5;
    DS('j', aa, '#333', 5);

    // ── bottom flange (left view) ──
    aa = { ...punkty2[3] }; aa.Y += j;
    bb = { ...punkty2[2] }; bb.Y += j;
    DL(punkty2[3], aa, S, sw); // vertical stub left
    DL(punkty2[2], bb, S, sw); // vertical stub right
    aa.X -= p; bb.X += p;
    DL(aa, bb, S, sw); // outer bottom flange
    aa = { ...punkty2[3] }; aa.Y += j;
    bb = { ...punkty2[2] }; bb.Y += j;
    aa.Y -= p; bb.Y -= p;
    DL(aa, bb, S, sw); // inner bottom flange

    // ── a dimension ──
    bb = { ...punkty2[3] }; aa = { ...punkty2[3] };
    bb.Y += 20; aa.Y += 20;
    bb.X += a;
    DL(aa, bb, D, dsw); // a line
    bb = { ...aa };
    bb.Y -= 3; aa.Y += 3;
    DL(aa, bb, D, dsw); // left tick
    bb.X += a; aa.X += a;
    DL(aa, bb, D, dsw); // right tick
    aa.X -= ((a / 2 + 5) | 0);
    DS('a', aa, 'red', 6);

    // ── m dimension ──
    bb = { ...punkty2[2] }; aa = { ...punkty2[2] };
    bb.Y += 20; aa.Y += 20;
    bb.X -= m;
    DL(aa, bb, D, dsw); // m line
    bb = { ...aa };
    bb.Y -= 3; aa.Y += 3;
    DL(aa, bb, D, dsw); // right tick
    bb.X -= m; aa.X -= m;
    DL(aa, bb, D, dsw); // left tick
    aa.X += ((m / 2 - 5) | 0);
    DS('m', aa, '#333', 6);

    // ── e dimension ──
    aa = { ...punkty2[0] };
    aa.X += (c / 2) | 0;
    bb = { ...aa };
    bb.Y += ee;
    DL(aa, bb, D, dsw); // e vertical line
    aa = { ...bb };
    bb.X -= 3; aa.X += 3;
    DL(aa, bb, D, dsw); // bottom tick
    aa.Y -= ((ee / 2 + 5) | 0);
    DS('e', aa, '#333', 6);

    // ── Angled branch duct (left view) ──
    const dd = ee - j - w1 / 2.0;
    let s1x: number = Math.tan(alfa) * dd;
    let s2x: number = Math.tan(alfa) * (dd + w1);

    let p1: Pt = { ...punkty2[0] }; p1.Y += j + (dd | 0); p1.X += s1x | 0;
    let p2: Pt = { ...p1 }; p2.Y += w1; p2.X += (s2x | 0) - (s1x | 0);

    s2x = Math.sin(alfa) * l3;
    s1x = Math.cos(alfa) * l3;

    let p3: Pt = { ...p2 }; p3.X -= s1x | 0; p3.Y += s2x | 0;
    let p4: Pt = { ...p1 }; p4.X -= s1x | 0; p4.Y += s2x | 0;

    DL(p1, p4, S, sw); // top branch line
    DL(p3, p2, S, sw); // bottom branch line

    // C#: aaa = p4; bbb = p3; shifted by -(s1x, -s2x)
    let aaa: Pt = { ...p4 }; let bbb: Pt = { ...p3 };
    aaa.X -= s1x | 0; aaa.Y += s2x | 0;
    bbb.X -= s1x | 0; bbb.Y += s2x | 0;

    // C#: branch end flange: s2x=0; s1x=-1;
    aa = { ...p4 }; bb = { ...p3 };
    s2x = 0; s1x = -1;
    aa.X -= (s1x | 0) + 1; bb.X += (s1x | 0) + 1;
    aa.Y -= s2x | 0; bb.Y += s2x | 0;
    DL(aa, bb, S, sw); // flange line (p4→p3)

    // ── d1 dimension (left view, at branch far end) ──
    s2x = Math.cos(alfa) * (p + 1);
    s1x = Math.sin(alfa) * (p + 1);

    DL(aaa, bbb, S, sw); // far dimension reference line

    bb = { ...bbb }; aa = { ...aaa };
    bbb = { ...aaa };
    aaa.X -= s2x | 0; aaa.Y += (s1x | 0) + 1;
    bbb.X += s2x | 0; bbb.Y -= (s1x | 0) + 1;
    DL(aaa, bbb, D, dsw); // top tick

    aaa.Y += w1; bbb.Y += w1;
    aaa.X += (Math.sin(alfa) * d1) | 0;
    bbb.X += (Math.sin(alfa) * d1) | 0;
    DL(aaa, bbb, D, dsw); // bottom tick

    aa.Y += ((w1 / 2 - 10) | 0); aa.X -= 20;
    DS('d1', aa, '#333', 6);

    // ── l3 dimension ──
    s2x = Math.cos(alfa) * 10;
    s1x = Math.sin(alfa) * 10;

    p1.X -= s1x | 0; p1.Y -= s2x | 0;
    p4.X -= s1x | 0; p4.Y -= s2x | 0;
    DL(p1, p4, D, dsw); // l3 dimension line

    s2x = Math.cos(alfa) * (p + 1);
    s1x = Math.sin(alfa) * (p + 1);

    p1 = { ...p4 };
    p1.X -= (s1x | 0) + 1; p1.Y -= s2x | 0;
    p4.X += (s1x | 0) + 1; p4.Y += s2x | 0;
    DL(p1, p4, D, dsw); // l3 tick

    p1.Y -= 12;
    DS('l3', p1, '#333', 6);

    // ════════ Auto-fit viewport ════════
    const allPts: Pt[] = [];
    for (const ln of lines) { allPts.push(ln.p1, ln.p2); }
    for (const t of texts) { allPts.push(t.pt); }
    for (const ci of circles) { allPts.push({ X: ci.x, Y: ci.y }, { X: ci.x + ci.w, Y: ci.y + ci.h }); }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pt of allPts) {
      if (pt.X < minX) minX = pt.X;
      if (pt.X > maxX) maxX = pt.X;
      if (pt.Y < minY) minY = pt.Y;
      if (pt.Y > maxY) maxY = pt.Y;
    }
    const W = maxX - minX || 1;
    const H = maxY - minY || 1;
    const padX = 20;
    const padY = 15;
    const scaleXv = (width - 2 * padX) / W;
    const scaleYv = (height - 2 * padY) / H;
    const sc = Math.min(scaleXv, scaleYv);
    const offX = padX + ((width - 2 * padX) - W * sc) / 2 - minX * sc;
    const offY = padY + ((height - 2 * padY) - H * sc) / 2 - minY * sc;
    const sx = (v: number) => v * sc + offX;
    const sy = (v: number) => v * sc + offY;
    const sd = (v: number) => v * sc;

    const els: React.JSX.Element[] = [];
    let k = 0;
    const K = () => k++;

    for (const ln of lines) {
      els.push(<line key={K()} x1={sx(ln.p1.X)} y1={sy(ln.p1.Y)} x2={sx(ln.p2.X)} y2={sy(ln.p2.Y)}
        stroke={ln.color} strokeWidth={ln.w} />);
    }
    for (const ci of circles) {
      const cx = ci.x + ci.w / 2;
      const cy = ci.y + ci.h / 2;
      els.push(<ellipse key={K()} cx={sx(cx)} cy={sy(cy)} rx={sd(ci.w / 2)} ry={sd(ci.h / 2)}
        fill="none" stroke={ci.color} strokeWidth={ci.lw} />);
    }
    for (const t of texts) {
      els.push(<text key={K()} x={sx(t.pt.X)} y={sy(t.pt.Y)}
        fontSize={t.sz} fill={t.color}>{t.text}</text>);
    }

    return <g>{els}</g>;
  };

  return (
    <div className="shape-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
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
