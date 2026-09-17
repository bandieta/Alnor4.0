import React from 'react';

// SVG shape diagrams for each shape type
// These are schematic technical drawings similar to the original WinForms pictureBox

interface ShapeDiagramProps {
  symbol: string;
  values: number[];
  labels: string[];
  t?: (text: string) => string;
  /** "Kreska rysunku" (Form1.cs kreskaToolStripMenuItem_Click / colorDialog2) — the 2D drawing's outline color, legacy default Color.Blue. */
  lineColor?: string;
  /** "Tło rysunku" (Form1.cs tłoToolStripMenuItem_Click / pictureBox2.BackColor). */
  backgroundColor?: string;
}

const ShapeDiagram: React.FC<ShapeDiagramProps> = ({ symbol, values, labels: _labels, t = (text) => text, lineColor = '#004290', backgroundColor }) => {
  const width = 360;
  const height = 160;

  // Every per-shape renderer below lays its drawing out in its own local coordinate
  // space, inherited from the WinForms Bitmap(358, 141) canvas of the original app.
  // Rather than re-deriving the framing inside 28 separate layout functions, the
  // finished drawing is measured after paint and the viewBox is fitted around it,
  // so the content is always centred and never clipped by the frame.
  const contentRef = React.useRef<SVGGElement | null>(null);
  const [viewBox, setViewBox] = React.useState(`0 0 ${width} ${height}`);
  const valuesKey = values.join(',');

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    let box: DOMRect;
    try {
      box = node.getBBox();
    } catch {
      return;
    }
    if (!(box.width > 0) || !(box.height > 0)) return;

    // getBBox() ignores stroke width and marker geometry; pad so arrowheads and
    // half-strokes on the outermost elements stay inside the frame.
    const pad = 7;
    let x = box.x - pad;
    let y = box.y - pad;
    let w = box.width + 2 * pad;
    let h = box.height + 2 * pad;

    // Grow the shorter axis to the frame aspect ratio so the drawing keeps its
    // proportions and ends up centred on both axes.
    const aspect = width / height;
    if (w / h < aspect) {
      const grown = h * aspect;
      x -= (grown - w) / 2;
      w = grown;
    } else {
      const grown = w / aspect;
      y -= (grown - h) / 2;
      h = grown;
    }

    // A compact drawing would otherwise be blown up until its labels dwarfed those of
    // every other shape. Cap how far the frame may zoom IN so label size stays roughly
    // uniform across the shape list; zooming OUT is left unbounded so nothing is clipped.
    const minSpan = 250;
    if (w < minSpan) {
      const grown = minSpan;
      const grownH = grown / aspect;
      x -= (grown - w) / 2;
      y -= (grownH - h) / 2;
      w = grown;
      h = grownH;
    }

    const next = `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
    setViewBox((prev) => (prev === next ? prev : next));
  }, [symbol, valuesKey, t]);

  // Dimension line in the shared style. The arrowheads are 8 units long, so on a line
  // shorter than ~20 units they overlap into a dotted-looking blob; such short lines get
  // their end ticks only.
  const dimLine = (x1: number, y1: number, x2: number, y2: number) => {
    const withArrows = Math.hypot(x2 - x1, y2 - y1) >= 20;
    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9b9b9b" strokeWidth={0.9}
        markerEnd={withArrows ? 'url(#arrowhead)' : undefined}
        markerStart={withArrows ? 'url(#arrowhead-start)' : undefined} />
    );
  };

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

    const small = {
      x0: 190 + pushX,
      y0: 20 + pushY,
      x1: 190 + pushX + a,
      y1: 20 + pushY + b,
    };

    const big = {
      x0: 190 - p + pushX,
      y0: 20 - p + pushY,
      x1: 190 + p + a + pushX,
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

    // Keep the "a" callout clear of the flange (big) rect's top edge — for small
    // ducts p is large relative to a/b/L, so the flange can otherwise poke above
    // the dimension line's nominal position and collide with its label.
    const aDimY = Math.min(small.y0 - 15, big.y0 - 8);
    const lDimY = sidePoly.y1 + 15;
    const bDimX = side.x1 + 15;
    const bDimY2 = side.y1;

    return (
      <g>
        {/* Form1 flange extension lines around side view */}
        <line x1={flangeRight.x1} y1={flangeRight.y1} x2={flangeRight.x2} y2={flangeRight.y2} stroke={lineColor} strokeWidth={1.4} />
        <line x1={flangeInnerLeft.x1} y1={flangeInnerLeft.y1} x2={flangeInnerLeft.x2} y2={flangeInnerLeft.y2} stroke={lineColor} strokeWidth={1.2} />
        <line x1={flangeInnerRight.x1} y1={flangeInnerRight.y1} x2={flangeInnerRight.x2} y2={flangeInnerRight.y2} stroke={lineColor} strokeWidth={1.2} />
        <line x1={flangeLeft.x1} y1={flangeLeft.y1} x2={flangeLeft.x2} y2={flangeLeft.y2} stroke={lineColor} strokeWidth={1.4} />

        {/* Main outlines */}
        <rect x={small.x0} y={small.y0} width={small.x1 - small.x0} height={small.y1 - small.y0}
          fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={big.x0} y={big.y0} width={big.x1 - big.x0} height={big.y1 - big.y0}
          fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={sidePoly.x0} y={sidePoly.y0} width={sidePoly.x1 - sidePoly.x0} height={sidePoly.y1 - sidePoly.y0}
          fill="none" stroke={lineColor} strokeWidth={1.6} />

        {/* a dimension (top of right view) */}
        {dimLine(small.x0, aDimY, small.x1, aDimY)}
        <line x1={small.x0} y1={aDimY - 3} x2={small.x0} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={small.x1} y1={aDimY - 3} x2={small.x1} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(small.x0 + small.x1) / 2} y={aDimY - 11} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* L dimension (below side view) */}
        {dimLine(sidePoly.x1, lDimY, sidePoly.x0, lDimY)}
        <line x1={sidePoly.x1} y1={lDimY - 3} x2={sidePoly.x1} y2={lDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={sidePoly.x0} y1={lDimY - 3} x2={sidePoly.x0} y2={lDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(sidePoly.x0 + sidePoly.x1) / 2} y={lDimY + 16} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* b dimension (right of side view). Label sits on the side-view side of the
            tick marks, not between them and the cross-section view: that gap is only
            ~15 units wide (independent of a/b/L), too narrow to fit the glyph next to
            the neighboring flange rect without the two colliding. */}
        {dimLine(bDimX, side.y0, bDimX, bDimY2)}
        <line x1={bDimX - 3} y1={side.y0} x2={bDimX + 3} y2={side.y0} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={bDimX - 3} y1={bDimY2} x2={bDimX + 3} y2={bDimY2} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={bDimX - 6} y={(side.y0 + bDimY2) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderQBa = () => {
    // QBa port of the Form1.cs `if (symbol == "QBa")` GDI block (kolano / łuk symetryczny).
    // Legacy layout: plan view on the left (inlet leg of length f pointing left, 90° bend of
    // inner radius r, outlet leg of length e pointing down, both legs b wide), and an end
    // view on the right (a×b section inside its flange, with the r+e extent hanging below).
    const rawA = values[0] || 200;
    const rawB = values[1] || 200;
    const rawE = values[2] || 150;
    const rawF = values[3] || 150;
    const rawR = values[4] || 200;

    const toInt = (v: number) => Math.trunc(v);

    let a = Math.max(toInt(rawA), 1);
    let b = Math.max(toInt(rawB), 1);
    let e = Math.max(toInt(rawE), 1);
    let f = Math.max(toInt(rawF), 1);
    // Form1: `if (r < 100) r = 0;` — a sharp inner corner below 100 mm.
    let r = rawR < 100 ? 0 : Math.max(toInt(rawR), 0);

    let p = 25;
    const maxAB = Math.max(a, b);
    if (maxAB > 1000) p = 30;
    if (maxAB > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    maxNorm += r + e;
    if (p > maxNorm) maxNorm = p;
    if (f > maxNorm) maxNorm = f;
    if (e > maxNorm) maxNorm = e;

    const mnoznik = 80;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    e = toInt((e / maxNorm) * mnoznik);
    f = toInt((f / maxNorm) * mnoznik);
    r = toInt((r / maxNorm) * mnoznik);

    const l = 3;
    let pushX = toInt(((110 - a - l) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    // ---- plan view -------------------------------------------------------------
    // punkty2: inlet leg, f long, b wide.
    const left = {
      x0: 20 + pushX,
      y0: 20 + pushY,
      x1: 20 + f + pushX,
      y1: 20 + b + pushY,
    };

    // punkty3: outlet leg, b wide, e long, hanging r below/right of the inlet leg's corner.
    const lower = {
      x0: left.x1 + r,
      y0: left.y1 + r,
      x1: left.x1 + r + b,
      y1: left.y1 + r + e,
    };

    // Both arcs are centred on (left.x1, lower.y0); inner radius r, outer radius r+b.
    // Form1's r==0 special case draws a single arc of radius b centred on the inlet's
    // bottom-right corner (a sharp inner corner, rounded outside) and skips the outer arc.
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

    // DrawArc(rect, 270, 90): from the top of the ellipse clockwise to its right.
    const quarterArcPath = (rect: { x: number; y: number; w: number; h: number }) => {
      const rx = rect.w / 2;
      const ry = rect.h / 2;
      const cx = rect.x + rx;
      const cy = rect.y + ry;
      return `M ${cx} ${cy - ry} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
    };

    // Form1 draws each leg as a closed polygon and then overdraws the edge shared with
    // the bend (inlet's right side, outlet's top side) with the background pen (myPen2 =
    // colorDialog1 = pictureBox2.BackColor), so the legs run seamlessly into the arcs.
    // Draw them as open three-sided paths for the same result.
    const inletPath = `M ${left.x1} ${left.y0} L ${left.x0} ${left.y0} L ${left.x0} ${left.y1} L ${left.x1} ${left.y1}`;
    const outletPath = `M ${lower.x0} ${lower.y0} L ${lower.x0} ${lower.y1} L ${lower.x1} ${lower.y1} L ${lower.x1} ${lower.y0}`;

    // Dimensions. f above the inlet, b left of the inlet (both as in Form1); e sits to the
    // right of the outlet leg as in Form1 (which offsets it by a+r+10 from the leg's left
    // edge — a fixed 15 past the leg's right edge keeps the same side without the drift).
    const fDimY = left.y0 - 15;
    const bDimX = left.x0 - 15;
    const eDimX = lower.x1 + 15;

    // ---- end view --------------------------------------------------------------
    // Form1 pins the section at x=190; nudge it right only if the plan view's "e"
    // callout would otherwise run into the flange rect (large f together with large r+b).
    const eLabelRight = eDimX + 14;
    const sectionShift = Math.max(0, eLabelRight - (190 - p + pushX) + 6);
    const sx = 190 + pushX + sectionShift;

    // punkty: a×b section; punkty1: its flange, p wider on every side.
    const small = { x0: sx, y0: 20 + pushY, x1: sx + a, y1: 20 + pushY + b };
    const big = { x0: sx - p, y0: 20 - p + pushY, x1: sx + a + p, y1: 20 + p + b + pushY };

    // podmalym + podmalyme: the r and e extents stacked under the section. Form1 erases
    // the divider between them with the background pen, and FillPolygon(myBrush, punkty1)
    // paints the flange rect over the top of the r block, so what remains visible is one
    // a×(r+e) outline emerging from under the flange.
    const underBottom = small.y1 + r + e;
    const underTop = Math.min(big.y1, underBottom);
    const underPath = `M ${small.x0} ${underTop} L ${small.x0} ${underBottom} L ${small.x1} ${underBottom} L ${small.x1} ${underTop}`;
    const underFlangeY = underBottom - p;

    const aDimY = Math.min(small.y0 - 15, big.y0 - 8);

    return (
      <g>
        {/* ---- plan view ---- */}
        <path d={inletPath} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {/* Inlet flange: face line at the open end (±p past the duct) and its inner edge p in. */}
        <line x1={left.x0} y1={left.y0 - p} x2={left.x0} y2={left.y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={left.x0 + p} y1={left.y0} x2={left.x0 + p} y2={left.y1} stroke={lineColor} strokeWidth={1.2} />

        <path d={outletPath} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {/* Outlet flange: face line at the open end (±p past the duct) and its inner edge p in. */}
        <line x1={lower.x0 - p} y1={lower.y1} x2={lower.x1 + p} y2={lower.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={lower.x0} y1={lower.y1 - p} x2={lower.x1} y2={lower.y1 - p} stroke={lineColor} strokeWidth={1.2} />

        <path d={quarterArcPath(innerRect)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {r !== 0 && <path d={quarterArcPath(outerRect)} fill="none" stroke={lineColor} strokeWidth={1.6} />}

        {/* r leader from the arc centre out along 45°, label past the outer arc. */}
        <line x1={left.x1} y1={lower.y0} x2={left.x1 + r} y2={left.y1}
          stroke="#9b9b9b" strokeWidth={0.9} />
        <text
          x={left.x1 + (Math.max(r * Math.SQRT2, r + b) + 10) * Math.SQRT1_2}
          y={lower.y0 - (Math.max(r * Math.SQRT2, r + b) + 10) * Math.SQRT1_2}
          fontSize={10} fill="#555555">r</text>

        {/* f dimension (above inlet leg) */}
        {dimLine(left.x0, fDimY, left.x1, fDimY)}
        <line x1={left.x0} y1={fDimY - 3} x2={left.x0} y2={fDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={left.x1} y1={fDimY - 3} x2={left.x1} y2={fDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(left.x0 + left.x1) / 2} y={fDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* b dimension (left of inlet leg) */}
        {dimLine(bDimX, left.y0, bDimX, left.y1)}
        <line x1={bDimX - 3} y1={left.y0} x2={bDimX + 3} y2={left.y0} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={bDimX - 3} y1={left.y1} x2={bDimX + 3} y2={left.y1} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={bDimX - 6} y={(left.y0 + left.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">b</text>

        {/* e dimension (right of outlet leg) */}
        {dimLine(eDimX, lower.y0, eDimX, lower.y1)}
        <line x1={eDimX - 3} y1={lower.y0} x2={eDimX + 3} y2={lower.y0} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={eDimX - 3} y1={lower.y1} x2={eDimX + 3} y2={lower.y1} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={eDimX + 6} y={(lower.y0 + lower.y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">e</text>

        {/* ---- end view ---- */}
        <path d={underPath} fill="none" stroke={lineColor} strokeWidth={1.2} />
        {underFlangeY > big.y1 && (
          <line x1={small.x0} y1={underFlangeY} x2={small.x1} y2={underFlangeY} stroke={lineColor} strokeWidth={1.2} />
        )}
        <line x1={small.x0 - p} y1={underBottom} x2={small.x1 + p} y2={underBottom} stroke={lineColor} strokeWidth={1.4} />

        <rect x={big.x0} y={big.y0} width={big.x1 - big.x0} height={big.y1 - big.y0}
          fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={small.x0} y={small.y0} width={small.x1 - small.x0} height={small.y1 - small.y0}
          fill="none" stroke={lineColor} strokeWidth={1.6} />

        {/* a dimension (above the section) */}
        {dimLine(small.x0, aDimY, small.x1, aDimY)}
        <line x1={small.x0} y1={aDimY - 3} x2={small.x0} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <line x1={small.x1} y1={aDimY - 3} x2={small.x1} y2={aDimY + 3} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={(small.x0 + small.x1) / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderSymmetricBend = () => {
    // QBNa port of the Form1.cs `if (symbol == "QBNa")` GDI block: the QBa elbow with a
    // variable bend angle. Plan view on the left (outlet leg of length e pointing down,
    // bend of inner radius r sweeping alfa degrees, inlet leg of length f leaving the
    // bend at that angle), end view on the right (a-wide box whose height is Form1's
    // sin(alfa)-projected f+b extent, with the projected r and the e extents below it).
    const rawA = values[0] || 200;
    const rawB = values[1] || 200;
    const rawE = values[2] || 150;
    const rawF = values[3] || 150;
    const rawR = values[4] || 200;
    const alfa = values[5] || 60;

    const toInt = (v: number) => Math.trunc(v);
    const alfaRad = (alfa * Math.PI) / 180;
    const sin = Math.sin(alfaRad);
    const cos = Math.cos(alfaRad);

    let a = Math.max(toInt(rawA), 1);
    let b = Math.max(toInt(rawB), 1);
    let e = Math.max(toInt(rawE), 1);
    let f = Math.max(toInt(rawF), 1);
    let r = Math.max(toInt(rawR), 0);

    let p = 25;
    const maxAB = Math.max(a, b);
    if (maxAB > 1000) p = 30;
    if (maxAB > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    maxNorm += r + e;
    if (p > maxNorm) maxNorm = p;
    if (f > maxNorm) maxNorm = f;
    if (e > maxNorm) maxNorm = e;

    const mnoznik = 80;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    e = toInt((e / maxNorm) * mnoznik);
    f = toInt((f / maxNorm) * mnoznik);
    r = toInt((r / maxNorm) * mnoznik);
    // Form1: `if (r < 1) r = 1;` — unlike QBa there is no sharp-corner special case.
    if (r < 1) r = 1;

    const l = 3;
    let pushX = toInt(((110 - a - l) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    // Form1 truncates each sin(alfa)-scaled length to int before using it.
    const sB = toInt(sin * b);
    const sR = toInt(sin * r);
    const sF = toInt(sin * f);

    // ---- plan view -------------------------------------------------------------
    // punkty3: outlet leg, b wide, e long, pointing straight down.
    const lower = {
      x0: 20 + pushX + f + r,
      y0: 20 + pushY + sB + sR,
      x1: 20 + pushX + f + r + b,
      y1: 20 + pushY + sB + sR + e,
    };

    // Both arcs are centred r to the left of the outlet leg's top-left corner and sweep
    // from -alfa (up-right of the centre) clockwise to 0 (the outlet leg's top edge).
    const cx = lower.x0 - r;
    const cy = lower.y0;
    const innerStart = { x: cx + r * cos, y: cy - r * sin };
    const outerStart = { x: cx + (r + b) * cos, y: cy - (r + b) * sin };
    const innerArc = `M ${innerStart.x} ${innerStart.y} A ${r} ${r} 0 0 1 ${lower.x0} ${lower.y0}`;
    const outerArc = `M ${outerStart.x} ${outerStart.y} A ${r + b} ${r + b} 0 0 1 ${lower.x1} ${lower.y0}`;

    // punkty2 (as Form1 recomputes it before drawing): inlet leg, b wide, f long, running
    // from the arc start points away from the bend along (-sin, -cos).
    const legDir = { x: sin, y: cos };          // from the open end toward the bend
    const acrossDir = { x: cos, y: -sin };      // from the inner edge toward the outer edge
    const p3 = innerStart;                      // inner edge, bend end
    const p2 = outerStart;                      // outer edge, bend end
    const p0 = { x: p3.x - legDir.x * f, y: p3.y - legDir.y * f }; // inner edge, open end
    const p1 = { x: p2.x - legDir.x * f, y: p2.y - legDir.y * f }; // outer edge, open end

    // Form1 draws each leg as a closed polygon, then overdraws the edge it shares with
    // the bend (inlet: p3–p2, outlet: its top edge) with the background pen so the legs
    // run seamlessly into the arcs. Draw them as open three-sided paths instead.
    const inletPath = `M ${p3.x} ${p3.y} L ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    const outletPath = `M ${lower.x0} ${lower.y0} L ${lower.x0} ${lower.y1} L ${lower.x1} ${lower.y1} L ${lower.x1} ${lower.y0}`;

    // Inlet flange: face line at the open end (p past each edge) and its inner edge p in.
    const inletFace = {
      x1: p0.x - acrossDir.x * p, y1: p0.y - acrossDir.y * p,
      x2: p1.x + acrossDir.x * p, y2: p1.y + acrossDir.y * p,
    };
    const inletInner = {
      x1: p0.x + legDir.x * p, y1: p0.y + legDir.y * p,
      x2: p1.x + legDir.x * p, y2: p1.y + legDir.y * p,
    };

    // b dimension: across the inlet's open end, 15 outside it (Form1's qwe1/qwe2 -15 step).
    const bDim = {
      x1: p0.x - legDir.x * 15, y1: p0.y - legDir.y * 15,
      x2: p1.x - legDir.x * 15, y2: p1.y - legDir.y * 15,
    };
    // f dimension: along the inlet's outer edge, 15 outside it.
    const fDim = {
      x1: p1.x + acrossDir.x * 15, y1: p1.y + acrossDir.y * 15,
      x2: p2.x + acrossDir.x * 15, y2: p2.y + acrossDir.y * 15,
    };
    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // e dimension: right of the outlet leg (Form1 offsets it by a+r+10 from the leg's
    // left edge — a fixed 15 past its right edge keeps the same side without the drift).
    const eDimX = lower.x1 + 15;

    // r leader from the arc centre along the bend's bisector to the inner arc, label
    // just past the outer arc on the same ray.
    const bis = { x: Math.cos(alfaRad / 2), y: -Math.sin(alfaRad / 2) };
    const rLabelDist = r + b + 10;

    // ---- end view --------------------------------------------------------------
    const eLabelRight = eDimX + 14;
    const sectionShift = Math.max(0, eLabelRight - (190 - p + pushX) + 6);
    const sx = 190 + pushX + sectionShift;

    // punkty: Form1 stretches the box from sin(alfa)·f above the QBa baseline to
    // sin(alfa)·b below it; punkty1 is its flange, p wider on every side.
    const small = { x0: sx, y0: 20 + pushY - sF, x1: sx + a, y1: 20 + pushY + sB };
    const big = { x0: sx - p, y0: small.y0 - p, x1: sx + a + p, y1: small.y1 + p };

    // podmalym + podmalyme: sin(alfa)·r and e extents stacked under the box. Form1 erases
    // the divider between them with the background pen and FillPolygon(myBrush, punkty1)
    // paints the flange rect over the top of the r block, so what remains visible is one
    // outline emerging from under the flange.
    const underBottom = small.y1 + sR + e;
    const underTop = Math.min(big.y1, underBottom);
    const underPath = `M ${small.x0} ${underTop} L ${small.x0} ${underBottom} L ${small.x1} ${underBottom} L ${small.x1} ${underTop}`;
    const underFlangeY = underBottom - p;

    const aDimY = Math.min(small.y0 - 15, big.y0 - 8);

    return (
      <g>
        {/* ---- plan view ---- */}
        <path d={inletPath} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={inletFace.x1} y1={inletFace.y1} x2={inletFace.x2} y2={inletFace.y2} stroke={lineColor} strokeWidth={1.4} />
        <line x1={inletInner.x1} y1={inletInner.y1} x2={inletInner.x2} y2={inletInner.y2} stroke={lineColor} strokeWidth={1.2} />

        <path d={outletPath} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={lower.x0 - p} y1={lower.y1} x2={lower.x1 + p} y2={lower.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={lower.x0} y1={lower.y1 - p} x2={lower.x1} y2={lower.y1 - p} stroke={lineColor} strokeWidth={1.2} />

        <path d={innerArc} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={outerArc} fill="none" stroke={lineColor} strokeWidth={1.6} />

        <line x1={cx} y1={cy} x2={cx + bis.x * r} y2={cy + bis.y * r} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={cx + bis.x * rLabelDist} y={cy + bis.y * rLabelDist + 4} textAnchor="middle" fontSize={10} fill="#555555">r</text>

        {/* b dimension (across the inlet's open end) */}
        {dimLine(bDim.x1, bDim.y1, bDim.x2, bDim.y2)}
        {tick(bDim.x1, bDim.y1, legDir.x, legDir.y)}
        {tick(bDim.x2, bDim.y2, legDir.x, legDir.y)}
        <text x={(bDim.x1 + bDim.x2) / 2 - legDir.x * 9} y={(bDim.y1 + bDim.y2) / 2 - legDir.y * 9 + 4}
          textAnchor="middle" fontSize={10} fill="#555555">b</text>

        {/* f dimension (along the inlet's outer edge) */}
        {dimLine(fDim.x1, fDim.y1, fDim.x2, fDim.y2)}
        {tick(fDim.x1, fDim.y1, acrossDir.x, acrossDir.y)}
        {tick(fDim.x2, fDim.y2, acrossDir.x, acrossDir.y)}
        <text x={(fDim.x1 + fDim.x2) / 2 + acrossDir.x * 9} y={(fDim.y1 + fDim.y2) / 2 + acrossDir.y * 9 + 4}
          textAnchor="middle" fontSize={10} fill="#555555">f</text>

        {/* e dimension (right of outlet leg) */}
        {dimLine(eDimX, lower.y0, eDimX, lower.y1)}
        {tick(eDimX, lower.y0, 1, 0)}
        {tick(eDimX, lower.y1, 1, 0)}
        <text x={eDimX + 6} y={(lower.y0 + lower.y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">e</text>

        {/* ---- end view ---- */}
        <path d={underPath} fill="none" stroke={lineColor} strokeWidth={1.2} />
        {underFlangeY > big.y1 && (
          <line x1={small.x0} y1={underFlangeY} x2={small.x1} y2={underFlangeY} stroke={lineColor} strokeWidth={1.2} />
        )}
        <line x1={small.x0 - p} y1={underBottom} x2={small.x1 + p} y2={underBottom} stroke={lineColor} strokeWidth={1.4} />

        <rect x={big.x0} y={big.y0} width={big.x1 - big.x0} height={big.y1 - big.y0}
          fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={small.x0} y={small.y0} width={small.x1 - small.x0} height={small.y1 - small.y0}
          fill="none" stroke={lineColor} strokeWidth={1.6} />

        {/* a dimension (above the box) */}
        {dimLine(small.x0, aDimY, small.x1, aDimY)}
        {tick(small.x0, aDimY, 0, 1)}
        {tick(small.x1, aDimY, 0, 1)}
        <text x={(small.x0 + small.x1) / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  // ---------------------------------------------------------------------------
  // Reducers: QPR6a, QPR2a, PR1a, PR7a. Form1.cs draws all four with one near-identical
  // GDI sequence: side view on the left (small end + its m straight on the left, taper of
  // length L, a×b end + its h straight on the right) and end view on the right (the a×b
  // opening in its flange plus the small opening). Each renderer does its own Form1
  // normalisation and hands the scaled integers to `renderReducerLike`.
  // ---------------------------------------------------------------------------
  type ReducerLayout = {
    a: number; b: number; l: number; h: number; m: number; p: number;
    pushX: number; pushY: number;
    /** Small opening: its size and its top-left offset from the a×b opening's top-left. */
    small: { w: number; h: number; offX: number; offY: number };
    /** Round small end (PR1a/PR7a): circle in the end view, plain spigot, fold lines. */
    round: boolean;
    /** L runs from the small end's face (QPR6a/QPR2a) or only from the taper (PR1a/PR7a), as Form1 draws it. */
    lFromFace: boolean;
    /** Asymmetric variants (QPR2a/PR7a): a under the box, e/f offset dimensions in the end view. */
    asym: boolean;
  };

  const renderReducerLike = (cfg: ReducerLayout) => {
    const { a, b, l, h, m, p, pushX, pushY, small, round, lFromFace, asym } = cfg;
    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const leftFace = 20 + pushX;
    const left = leftFace + m;
    const right = left + l;
    const rightFace = right + h;
    const yb0 = 20 + pushY;
    const yb1 = yb0 + b;
    const ys0 = yb0 + small.offY;
    const ys1 = ys0 + small.h;
    const yc = (ys0 + ys1) / 2;

    // Form1 draws the taper closed and then overdraws the a×b end's vertical (and, for the
    // rectangular reducers, the small end's too) with the background pen, so each end runs
    // seamlessly into its straight. Drawn here as one open path per wall.
    const topWall = `M ${leftFace} ${ys0} L ${left} ${ys0} L ${right} ${yb0} L ${rightFace} ${yb0}`;
    const bottomWall = `M ${leftFace} ${ys1} L ${left} ${ys1} L ${right} ${yb1} L ${rightFace} ${yb1}`;
    // ccc → punkty2[1] / punkty2[2]: fold lines of a square-to-round transition.
    const folds = `M ${right} ${yb0} L ${left} ${yc} L ${right} ${yb1}`;

    const dDimX = leftFace - 15;
    const mDimY = Math.min(ys0 - 12, ys0 - p - 5);
    const hDimY = Math.min(yb0 - 12, yb0 - p - 5);
    const lDimY = Math.max(yb1, ys1) + Math.max(15, p + 8);
    const lStart = lFromFace ? leftFace : left;
    const bDimX = rightFace + 15;

    // ---- end view --------------------------------------------------------------
    const smallPad = round ? 0 : p;
    const leftMostRel = Math.min(-p, small.offX - smallPad);
    const sectionShift = Math.max(0, bDimX + 14 - (190 + pushX + leftMostRel) + 6);
    const sx = 190 + pushX + sectionShift;

    const box = { x0: sx, y0: yb0, x1: sx + a, y1: yb1 };
    const boxFl = { x0: box.x0 - p, y0: box.y0 - p, x1: box.x1 + p, y1: box.y1 + p };
    const sm = { x0: sx + small.offX, y0: yb0 + small.offY, x1: sx + small.offX + small.w, y1: yb0 + small.offY + small.h };
    const smFl = { x0: sm.x0 - smallPad, y0: sm.y0 - smallPad, x1: sm.x1 + smallPad, y1: sm.y1 + smallPad };
    const circle = { cx: (sm.x0 + sm.x1) / 2, cy: (sm.y0 + sm.y1) / 2, r: small.w / 2 };

    const topMost = Math.min(boxFl.y0, smFl.y0);
    const bottomMost = Math.max(boxFl.y1, smFl.y1);
    const rightMost = Math.max(boxFl.x1, smFl.x1);

    // Form1 puts a above the box for the symmetric reducers and below it for the
    // asymmetric ones (their e sits right of the box and f above it); c goes under the
    // small opening. The stacking keeps them clear of each other and of both flanges.
    const cDimY = asym ? bottomMost + 15 : Math.max(sm.y1 + 15, bottomMost + 8);
    const aDimY = asym
      ? (round ? bottomMost + 15 : cDimY + 16)
      : Math.min(box.y0 - 15, boxFl.y0 - 8);
    const fDimY = topMost - 15;
    const eDimX = rightMost + 15;

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={topWall} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={bottomWall} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {round ? (
          <>
            <path d={folds} fill="none" stroke={lineColor} strokeWidth={1.2} />
            {/* Round end: seam at the transition and a plain end line at the spigot (no flange). */}
            <line x1={left} y1={ys0} x2={left} y2={ys1} stroke={lineColor} strokeWidth={1.2} />
            <line x1={leftFace} y1={ys0} x2={leftFace} y2={ys1} stroke={lineColor} strokeWidth={1.4} />
          </>
        ) : (
          <>
            {/* Small end flange: face line (p past each wall) and its inner edge p in. */}
            <line x1={leftFace} y1={ys0 - p} x2={leftFace} y2={ys1 + p} stroke={lineColor} strokeWidth={1.4} />
            <line x1={leftFace + p} y1={ys0} x2={leftFace + p} y2={ys1} stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        {/* a×b end flange. */}
        <line x1={rightFace} y1={yb0 - p} x2={rightFace} y2={yb1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={rightFace - p} y1={yb0} x2={rightFace - p} y2={yb1} stroke={lineColor} strokeWidth={1.2} />

        {/* d dimension (left of the small end) */}
        {dimLine(dDimX, ys0, dDimX, ys1)}
        {tick(dDimX, ys0, 1, 0)}
        {tick(dDimX, ys1, 1, 0)}
        <text x={dDimX - 6} y={(ys0 + ys1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>

        {/* m dimension (above the small end's straight) */}
        {m > 0 && (
          <>
            {dimLine(leftFace, mDimY, left, mDimY)}
            {tick(leftFace, mDimY, 0, 1)}
            {tick(left, mDimY, 0, 1)}
            <text x={(leftFace + left) / 2} y={mDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}

        {/* h dimension (above the a×b end's straight) */}
        {h > 0 && (
          <>
            {dimLine(right, hDimY, rightFace, hDimY)}
            {tick(right, hDimY, 0, 1)}
            {tick(rightFace, hDimY, 0, 1)}
            <text x={(right + rightFace) / 2} y={hDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}

        {/* L dimension (under the side view, spanning what Form1 spans) */}
        {dimLine(lStart, lDimY, rightFace, lDimY)}
        {tick(lStart, lDimY, 0, 1)}
        {tick(rightFace, lDimY, 0, 1)}
        <text x={(lStart + rightFace) / 2} y={lDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">L</text>

        {/* b dimension (right of the a×b end; Form1's own line stops 15 short — drawn full here) */}
        {dimLine(bDimX, yb0, bDimX, yb1)}
        {tick(bDimX, yb0, 1, 0)}
        {tick(bDimX, yb1, 1, 0)}
        <text x={bDimX + 6} y={(yb0 + yb1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>

        {/* ---- end view ---- */}
        {round ? (
          // Form1 sizes this DrawArc(…, 0, 360) like the d×d flange rect and nudges it a
          // pixel or two right; drawn here at diameter d in its true place.
          <circle cx={circle.cx} cy={circle.cy} r={circle.r} fill="none" stroke={lineColor} strokeWidth={1.6} />
        ) : (
          <>
            <rect x={sm.x0} y={sm.y0} width={sm.x1 - sm.x0} height={sm.y1 - sm.y0}
              fill="none" stroke={lineColor} strokeWidth={1.6} />
            <rect x={smFl.x0} y={smFl.y0} width={smFl.x1 - smFl.x0} height={smFl.y1 - smFl.y0}
              fill="none" stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        <rect x={box.x0} y={box.y0} width={box.x1 - box.x0} height={box.y1 - box.y0}
          fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={boxFl.x0} y={boxFl.y0} width={boxFl.x1 - boxFl.x0} height={boxFl.y1 - boxFl.y0}
          fill="none" stroke={lineColor} strokeWidth={1.2} />

        {/* a dimension */}
        {dimLine(box.x0, aDimY, box.x1, aDimY)}
        {tick(box.x0, aDimY, 0, 1)}
        {tick(box.x1, aDimY, 0, 1)}
        <text x={(box.x0 + box.x1) / 2} y={asym ? aDimY + 14 : aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* c dimension (under the small rectangular opening) */}
        {!round && (
          <>
            {dimLine(sm.x0, cDimY, sm.x1, cDimY)}
            {tick(sm.x0, cDimY, 0, 1)}
            {tick(sm.x1, cDimY, 0, 1)}
            <text x={(sm.x0 + sm.x1) / 2} y={cDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">c</text>
          </>
        )}

        {/* e / f: the small opening's offset from the box's top / left edge (asymmetric only) */}
        {asym && Math.abs(sm.y0 - box.y0) >= 1 && (
          <>
            {dimLine(eDimX, box.y0, eDimX, sm.y0)}
            {tick(eDimX, box.y0, 1, 0)}
            {tick(eDimX, sm.y0, 1, 0)}
            <text x={eDimX + 6} y={(box.y0 + sm.y0) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">e</text>
          </>
        )}
        {asym && Math.abs(sm.x0 - box.x0) >= 1 && (
          <>
            {dimLine(box.x0, fDimY, sm.x0, fDimY)}
            {tick(box.x0, fDimY, 0, 1)}
            {tick(sm.x0, fDimY, 0, 1)}
            <text x={(box.x0 + sm.x0) / 2} y={fDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>
          </>
        )}
      </g>
    );
  };

  const renderReducer = () => {
    // QPR6a — Form1.cs `if (symbol == "QPR6a")` (redukcja symetryczna): c×d end concentric
    // in the a×b end, both flanged.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let c = Math.max(toInt(values[2] || 150), 1);
    let d = Math.max(toInt(values[3] || 150), 1);
    let l = Math.max(toInt(values[4] || 500), 1);
    // h and m are legitimately 0 (no straight section), so no fallback for them.
    let h = Math.max(toInt(values[5] ?? 0), 0);
    let m = Math.max(toInt(values[6] ?? 0), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    if (l + m + h > maxNorm) maxNorm = l + m + h;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 80;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    l = toInt((l / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    c = toInt((c / maxNorm) * mnoznik);
    d = toInt((d / maxNorm) * mnoznik);
    m = toInt((m / maxNorm) * mnoznik);
    h = toInt((h / maxNorm) * mnoznik);
    while ((l + m + h + 20) < 160 && (a + 20) < 100 && (b + 20) < 100) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); c = toInt(c * 1.1); d = toInt(d * 1.1);
      m = toInt(m * 1.1); h = toInt(h * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }

    let pushX = toInt(((110 - a - l - m - h) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    return renderReducerLike({
      a, b, l, h, m, p, pushX, pushY,
      small: { w: c, h: d, offX: toInt((a - c) / 2), offY: toInt((b - d) / 2) },
      round: false, lFromFace: true, asym: false,
    });
  };

  const renderAsymReducer = () => {
    // QPR2a — Form1.cs `if (symbol == "QPR2a")` (redukcja asymetryczna): c×d end whose
    // top-left sits f left of and e above the a×b end's top-left, both flanged.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let c = Math.max(toInt(values[2] || 150), 1);
    let d = Math.max(toInt(values[3] || 150), 1);
    let l = Math.max(toInt(values[4] || 500), 1);
    let h = Math.max(toInt(values[5] ?? 0), 0);
    let m = Math.max(toInt(values[6] ?? 0), 0);
    let ee = toInt(values[7] ?? 0);
    let f = toInt(values[8] ?? 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    // Form1 slip kept as-is: the sum is tested but only l is taken.
    if (l + m + h > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 70;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    l = toInt((l / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    d = toInt((d / maxNorm) * mnoznik);
    c = toInt((c / maxNorm) * mnoznik);
    m = toInt((m / maxNorm) * mnoznik);
    h = toInt((h / maxNorm) * mnoznik);
    ee = toInt((ee / maxNorm) * mnoznik);
    f = toInt((f / maxNorm) * mnoznik);
    while ((l + m + h + 20 + ee + f) < 100 && (a + 20) < 80 && (b + 20) < 80) {
      a = toInt(a * 1.25); b = toInt(b * 1.25); d = toInt(d * 1.25); c = toInt(c * 1.25);
      m = toInt(m * 1.25); h = toInt(h * 1.25); l = toInt(l * 1.25); p = toInt(p * 1.25);
      ee = toInt(ee * 1.25); f = toInt(f * 1.25);
      if (a === 0 || b === 0 || l === 0) break;
    }

    let pushX = toInt(((110 - a - l) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    return renderReducerLike({
      a, b, l, h, m, p, pushX, pushY,
      small: { w: c, h: d, offX: -f, offY: -ee },
      round: false, lFromFace: true, asym: true,
    });
  };

  const renderSquareToRoundReducer = () => {
    // PR1a — Form1.cs `if (symbol == "PR1a")` (redukcja kwadrat-koło symetryczna): round
    // end of diameter d concentric in the a×b end.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = Math.max(toInt(values[2] || 150), 1);
    let l = Math.max(toInt(values[3] || 500), 1);
    let h = Math.max(toInt(values[4] ?? 0), 0);
    let m = Math.max(toInt(values[5] ?? 0), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    if (l + m + h > maxNorm) maxNorm = l + m + h;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 80;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    l = toInt((l / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    d = toInt((d / maxNorm) * mnoznik);
    m = toInt((m / maxNorm) * mnoznik);
    h = toInt((h / maxNorm) * mnoznik);
    while ((l + m + h + 20) < 160 && (a + 20) < 100 && (b + 20) < 100) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); d = toInt(d * 1.1);
      m = toInt(m * 1.1); h = toInt(h * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }

    let pushX = toInt(((110 - a - l - m - h) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    return renderReducerLike({
      a, b, l, h, m, p, pushX, pushY,
      small: { w: d, h: d, offX: toInt((a - d) / 2), offY: toInt((b - d) / 2) },
      round: true, lFromFace: false, asym: false,
    });
  };

  const renderAsymSquareToRoundReducer = () => {
    // PR7a — Form1.cs `if (symbol == "PR7a")` (redukcja kwadrat-koło asymetryczna): round
    // end of diameter d whose bounding square sits f left of and e above the a×b end.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = Math.max(toInt(values[2] || 150), 1);
    let l = Math.max(toInt(values[3] || 500), 1);
    let ee = toInt(values[4] ?? 0);
    let f = toInt(values[5] ?? 0);
    let h = Math.max(toInt(values[6] ?? 0), 0);
    let m = Math.max(toInt(values[7] ?? 0), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;

    let maxNorm = Math.max(a, b);
    if (l + m + a + h + f + ee > maxNorm) maxNorm = l + m + a + h + ee + f;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 90;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    l = toInt((l / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    d = toInt((d / maxNorm) * mnoznik);
    m = toInt((m / maxNorm) * mnoznik);
    h = toInt((h / maxNorm) * mnoznik);
    ee = toInt((ee / maxNorm) * mnoznik);
    f = toInt((f / maxNorm) * mnoznik);
    while ((l + m + h + a + ee + f) < 130 && (a + 20) < 100 && (b + 20) < 100) {
      a = toInt(a * 1.25); b = toInt(b * 1.25); d = toInt(d * 1.25);
      m = toInt(m * 1.25); h = toInt(h * 1.25); l = toInt(l * 1.25); p = toInt(p * 1.25);
      ee = toInt(ee * 1.25); f = toInt(f * 1.25);
      if (a === 0 || b === 0 || l === 0) break;
    }

    let pushX = 150 - a - l - m - h;
    if (pushX < 30) pushX = 30;
    const pushY = toInt((90 - b) / 2) + 5;

    return renderReducerLike({
      a, b, l, h, m, p, pushX, pushY,
      small: { w: d, h: d, offX: -f, offY: -ee },
      round: true, lFromFace: false, asym: true,
    });
  };

  const renderReductionBendLike = (diffuser: boolean) => {
    // Port of Form1.cs `if (symbol == "QBRa")` (łuk redukcyjny) and `"QBR1a"` (łuk
    // dyfuzorowany), which share one GDI sequence. NOTE: Form1's local `b` holds the
    // dimension labelled "d" on screen and its `d` the one labelled "b" (the textbox↔label
    // tables and the drawing code disagree); the names below follow the on-screen labels:
    // `narrow` = b (inlet width), `wide` = d (outlet width). Plan view on the left: inlet
    // entering from the left (horizontally at 90°, otherwise at alfa), outlet of width d
    // leaving downward with inner radius r. End view on the right: the inlet opening in its
    // flange with the f+r extent below (QBR1a: a c-wide inlet whose walls splay to the
    // a-wide outlet, offset g).
    const toInt = (v: number) => Math.trunc(v);
    const round = (v: number) => Math.round(v);

    let a = Math.max(toInt(values[0] || 200), 1);
    let wide = Math.max(toInt(values[1] || 200), 1);
    let c = diffuser ? Math.max(toInt(values[2] || 200), 1) : a;
    let narrow = Math.max(toInt(values[diffuser ? 3 : 2] || 150), 1);
    let ee = Math.max(toInt(values[diffuser ? 4 : 3] || 150), 1);
    let f = Math.max(toInt(values[diffuser ? 5 : 4] || 150), 1);
    let r = Math.max(toInt(values[diffuser ? 6 : 5] || 200), 0);
    let g = diffuser ? toInt(values[7] ?? 0) : 0;
    let alfa = toInt(values[diffuser ? 8 : 6] || 90);
    if (alfa > 90) alfa = 90;
    if (alfa < 15) alfa = 15;
    const A = (alfa * Math.PI) / 180;
    const sin = Math.sin(A);
    const cos = Math.cos(A);

    let dd = round(narrow * sin);

    let p = 25;
    let maxNorm = a > wide + ee ? a : wide + ee;
    if (narrow + f > maxNorm) maxNorm = narrow + f;
    // Outer-wall radius of the angled variant, from the unscaled sizes (Form1's r1;
    // note its `alfa / 2` is integer division).
    const ctg1 = 1 / Math.tan(A);
    const x1 = ctg1 * (narrow / cos - wide + r * (1 / cos - 1));
    const r1 = round(x1 / Math.tan((toInt(alfa / 2) * Math.PI) / 180));
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    maxNorm += r + ee;
    if (p > maxNorm) maxNorm = p;
    if (f > maxNorm) maxNorm = f;
    if (ee > maxNorm) maxNorm = ee;

    const mnoznik = diffuser ? 70 : 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); wide = sc(wide); c = sc(c); p = sc(p); ee = sc(ee); f = sc(f); r = sc(r);
    narrow = sc(narrow); dd = sc(dd); g = sc(g);
    const r1s = sc(r1);

    const l = 3;
    let pushX = toInt(((110 - a - l) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - wide) / 2) + (diffuser ? -10 : 5);

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );
    const dim = (x1_: number, y1_: number, x2_: number, y2_: number, label: string, lx: number, ly: number, anchor: 'start' | 'middle' | 'end') => {
      const len = Math.hypot(x2_ - x1_, y2_ - y1_) || 1;
      const tx = (y2_ - y1_) / len; // tick direction: perpendicular to the dimension line
      const ty = -(x2_ - x1_) / len;
      return (
        <>
          {dimLine(x1_, y1_, x2_, y2_)}
          {tick(x1_, y1_, tx, ty)}
          {tick(x2_, y2_, tx, ty)}
          <text x={lx} y={ly} textAnchor={anchor} fontSize={10} fill="#555555">{label}</text>
        </>
      );
    };

    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const es = toInt(ee * sin);

    // ---- plan view -------------------------------------------------------------
    let plan: React.ReactNode;
    let planRight: number;
    if (alfa === 90) {
      const x1_ = x0 + ee + wide + r;
      const y1_ = y0 + narrow + f + r;
      const R = narrow + r; // outer arc radius, centred (x1 - R, y0 + R)
      const outer = `M ${x0} ${y0} L ${x1_ - R} ${y0} A ${R} ${R} 0 0 1 ${x1_} ${y0 + R} L ${x1_} ${y1_}`;
      const inner = r > 0
        ? `M ${x0} ${y0 + narrow} L ${x1_ - wide - r} ${y0 + narrow} A ${r} ${r} 0 0 1 ${x1_ - wide} ${y0 + narrow + r} L ${x1_ - wide} ${y1_}`
        : `M ${x0} ${y0 + narrow} L ${x1_ - wide} ${y0 + narrow} L ${x1_ - wide} ${y1_}`;
      const icx = x1_ - wide - r;
      const icy = y0 + narrow + r;
      const rl = r * Math.SQRT2 + 10;
      planRight = x1_ + p;
      plan = (
        <>
          <path d={outer} fill="none" stroke={lineColor} strokeWidth={1.6} />
          <path d={inner} fill="none" stroke={lineColor} strokeWidth={1.6} />
          {/* inlet face + flange */}
          <line x1={x0} y1={y0 - p} x2={x0} y2={y0 + narrow + p} stroke={lineColor} strokeWidth={1.4} />
          <line x1={x0 + p} y1={y0} x2={x0 + p} y2={y0 + narrow} stroke={lineColor} strokeWidth={1.2} />
          {/* outlet face + flange */}
          <line x1={x1_ - wide - p} y1={y1_} x2={x1_ + p} y2={y1_} stroke={lineColor} strokeWidth={1.4} />
          <line x1={x1_ - wide} y1={y1_ - p} x2={x1_} y2={y1_ - p} stroke={lineColor} strokeWidth={1.2} />
          {/* r leader */}
          <line x1={icx} y1={icy} x2={icx + r} y2={icy - r} stroke="#9b9b9b" strokeWidth={0.9} />
          <text x={icx + rl * Math.SQRT1_2} y={icy - rl * Math.SQRT1_2 + 4} textAnchor="middle" fontSize={10} fill="#555555">r</text>
          {dim(x0 - 15, y0, x0 - 15, y0 + narrow, 'b', x0 - 21, y0 + narrow / 2 + 4, 'end')}
          {dim(x0 - 15, y1_ - f, x0 - 15, y1_, 'f', x0 - 21, y1_ - f / 2 + 4, 'end')}
          {dim(x0, y1_ + 15, x1_ - wide - r, y1_ + 15, 'e', (x0 + x1_ - wide - r) / 2, y1_ + 29, 'middle')}
          {dim(x1_ - wide, y1_ + 15, x1_, y1_ + 15, 'd', x1_ - wide / 2, y1_ + 29, 'middle')}
        </>
      );
    } else {
      if (r === 0) r = 1;
      const y1_ = y0 + dd + f + r + es;
      const xo0 = x0 + ee + r;
      const xo1 = xo0 + wide;
      const icx = xo0 - r;
      const icy = y1_ - f;
      const p1 = { x: icx + r * cos, y: icy - r * sin };
      const legDir = { x: sin, y: cos };
      const across = { x: cos, y: -sin };
      const p2 = { x: p1.x - legDir.x * ee, y: p1.y - legDir.y * ee };
      const p3 = { x: p2.x + across.x * narrow, y: p2.y + across.y * narrow };
      const p4 = { x: p3.x + legDir.x * ee, y: p3.y + legDir.y * ee };
      const p5 = { x: xo1, y: y1_ - f };
      // Outer wall between the inlet's outer edge and the outlet's corner: Form1 fits an arc
      // of radius r1 (tangent to the inlet) when (d + r')/cos α > b + r' and otherwise a
      // straight line (or, below that, nothing but an error box — a straight line here).
      const rr = toInt(((narrow + r) * alfa) / 90);
      const useArc = (narrow + rr) / cos > wide + rr && r1s > 0 && Number.isFinite(r1s);
      const p6 = { x: p5.x - (r1s - r1s * cos), y: p5.y - r1s * sin };
      const outerJoin = useArc
        ? `M ${p5.x} ${p5.y} A ${r1s} ${r1s} 0 0 0 ${p6.x} ${p6.y} L ${p4.x} ${p4.y}`
        : `M ${p5.x} ${p5.y} L ${p4.x} ${p4.y}`;
      const innerArc = `M ${xo0} ${icy} A ${r} ${r} 0 0 0 ${p1.x} ${p1.y}`;
      const bis = { x: Math.cos(A / 2), y: -Math.sin(A / 2) };
      planRight = Math.max(xo1 + p, p3.x + across.x * 15 + 14, p4.x + across.x * 15 + 14);
      plan = (
        <>
          {/* outlet leg */}
          <path d={`M ${xo0} ${icy} L ${xo0} ${y1_} L ${xo1} ${y1_} L ${xo1} ${icy}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
          <line x1={xo0 - p} y1={y1_} x2={xo1 + p} y2={y1_} stroke={lineColor} strokeWidth={1.4} />
          <line x1={xo0} y1={y1_ - p} x2={xo1} y2={y1_ - p} stroke={lineColor} strokeWidth={1.2} />
          {/* bend */}
          <path d={innerArc} fill="none" stroke={lineColor} strokeWidth={1.6} />
          <path d={outerJoin} fill="none" stroke={lineColor} strokeWidth={1.6} />
          {/* inlet leg */}
          <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
          <line x1={p2.x - across.x * p} y1={p2.y - across.y * p} x2={p3.x + across.x * p} y2={p3.y + across.y * p} stroke={lineColor} strokeWidth={1.4} />
          <line x1={p2.x + legDir.x * p} y1={p2.y + legDir.y * p} x2={p3.x + legDir.x * p} y2={p3.y + legDir.y * p} stroke={lineColor} strokeWidth={1.2} />
          {/* r leader along the bisector */}
          <line x1={icx} y1={icy} x2={icx + bis.x * r} y2={icy + bis.y * r} stroke="#9b9b9b" strokeWidth={0.9} />
          {r > 1 && (
            <text x={icx + bis.x * (r + 12)} y={icy + bis.y * (r + 12) + 4} textAnchor="middle" fontSize={10} fill="#555555">r</text>
          )}
          {dim(xo0, y1_ + 15, xo1, y1_ + 15, 'd', (xo0 + xo1) / 2, y1_ + 29, 'middle')}
          {dim(xo0 - 15, icy, xo0 - 15, y1_, 'f', xo0 - 21, (icy + y1_) / 2 + 4, 'end')}
          {dim(p2.x - legDir.x * 15, p2.y - legDir.y * 15, p3.x - legDir.x * 15, p3.y - legDir.y * 15, 'b',
            (p2.x + p3.x) / 2 - legDir.x * 24, (p2.y + p3.y) / 2 - legDir.y * 24 + 4, 'middle')}
          {dim(p3.x + across.x * 15, p3.y + across.y * 15, p4.x + across.x * 15, p4.y + across.y * 15, 'e',
            (p3.x + p4.x) / 2 + across.x * 24, (p3.y + p4.y) / 2 + across.y * 24 + 4, 'middle')}
        </>
      );
    }

    // ---- end view --------------------------------------------------------------
    const secW = diffuser ? c : a;
    const secH = alfa === 90 ? narrow : dd;
    const sectionShift = Math.max(0, planRight + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const sec = { x0: sx, y0: y0, x1: sx + secW, y1: y0 + secH };
    const fl = { x0: sec.x0 - p, y0: sec.y0 - p, x1: sec.x1 + p, y1: sec.y1 + p };
    const aDimY = Math.min(sec.y0 - 15, fl.y0 - 8);

    let endView: React.ReactNode;
    if (!diffuser) {
      // podmalym: the f+r (angled: f+r+e·sinα) extent below the opening; Form1's flange fill
      // hides its top, and its bottom carries the outlet flange lines.
      const bottom = sec.y1 + f + r + (alfa === 90 ? 0 : es);
      const top = Math.min(fl.y1, bottom);
      endView = (
        <>
          <path d={`M ${sec.x0} ${top} L ${sec.x0} ${bottom} L ${sec.x1} ${bottom} L ${sec.x1} ${top}`} fill="none" stroke={lineColor} strokeWidth={1.2} />
          {bottom - p > fl.y1 && <line x1={sec.x0} y1={bottom - p} x2={sec.x1} y2={bottom - p} stroke={lineColor} strokeWidth={1.2} />}
          <line x1={sec.x0 - p} y1={bottom} x2={sec.x1 + p} y2={bottom} stroke={lineColor} strokeWidth={1.4} />
          {dim(sec.x0, aDimY, sec.x1, aDimY, 'a', (sec.x0 + sec.x1) / 2, aDimY - 4, 'middle')}
        </>
      );
    } else {
      // QBR1a: the c-wide inlet's walls splay over the r (+e·sinα) depth to the a-wide
      // outlet, whose right edge sits g right of the inlet's; the outlet leg (length f)
      // and its flange hang below.
      const yTr = sec.y1 + r + (alfa === 90 ? 0 : es);
      const xr = sec.x1 + g;
      const xl = xr - a;
      const yBot = yTr + f;
      const gDimY = aDimY;
      endView = (
        <>
          <line x1={sec.x0} y1={sec.y1} x2={xl} y2={yTr} stroke={lineColor} strokeWidth={1.2} />
          <line x1={sec.x1} y1={sec.y1} x2={xr} y2={yTr} stroke={lineColor} strokeWidth={1.2} />
          <line x1={xl} y1={yTr} x2={xr} y2={yTr} stroke={lineColor} strokeWidth={1.2} />
          <line x1={xl} y1={yTr} x2={xl} y2={yBot} stroke={lineColor} strokeWidth={1.2} />
          <line x1={xr} y1={yTr} x2={xr} y2={yBot} stroke={lineColor} strokeWidth={1.2} />
          <line x1={xl} y1={yBot - p} x2={xr} y2={yBot - p} stroke={lineColor} strokeWidth={1.2} />
          <line x1={xl - p} y1={yBot} x2={xr + p} y2={yBot} stroke={lineColor} strokeWidth={1.4} />
          {dim(sec.x0, aDimY, sec.x1, aDimY, 'c', (sec.x0 + sec.x1) / 2, aDimY - 4, 'middle')}
          {Math.abs(g) >= 1 && dim(sec.x1, gDimY, xr, gDimY, 'g', (sec.x1 + xr) / 2, gDimY - 4, 'middle')}
          {dim(xl, yBot + 15, xr, yBot + 15, 'a', (xl + xr) / 2, yBot + 29, 'middle')}
        </>
      );
    }

    return (
      <g>
        {plan}
        {endView}
        <rect x={fl.x0} y={fl.y0} width={fl.x1 - fl.x0} height={fl.y1 - fl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={sec.x0} y={sec.y0} width={sec.x1 - sec.x0} height={sec.y1 - sec.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
      </g>
    );
  };

  const renderReductionBendParametric = () => renderReductionBendLike(false);

  const renderDiffuserBend = () => renderReductionBendLike(true);

  const renderElbowLike = (reduction: boolean) => {
    // Port of Form1.cs `if (symbol == "QBFRa")` (kolano redukcyjne) and `"QBFa"` (kolano
    // symetryczne, which is the same block with d = b). Plan view on the left: an L with a
    // sharp outer corner — inlet of width d entering from the left (length e), outlet of
    // width b leaving downward (length f), inner radius r. End view on the right: the a×d
    // inlet opening in its flange with the f extent hanging below.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = reduction ? Math.max(toInt(values[2] || 150), 1) : b;
    let ee = Math.max(toInt(values[reduction ? 3 : 2] || 150), 1);
    let f = Math.max(toInt(values[reduction ? 4 : 3] || 150), 1);
    let r = Math.max(toInt(values[reduction ? 5 : 4] || 100), 0);

    let p = 25;
    let maxNorm = a > b + ee ? a : b + ee;
    if (d + f > maxNorm) maxNorm = d + f;
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    maxNorm += r + ee;
    if (p > maxNorm) maxNorm = p;
    if (f > maxNorm) maxNorm = f;
    if (ee > maxNorm) maxNorm = ee;

    const mnoznik = 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); p = sc(p); ee = sc(ee); f = sc(f); r = sc(r); d = sc(d);

    const l = 3;
    let pushX = toInt(((110 - a - l) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- plan view (punkty2 + wyczysc) ------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const x1 = x0 + ee + b;
    const y1 = y0 + d + f;
    const icx = x1 - b - r;
    const icy = y0 + d + r;
    const outer = `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1}`;
    const inner = r > 0
      ? `M ${x0} ${y0 + d} L ${icx} ${y0 + d} A ${r} ${r} 0 0 1 ${x1 - b} ${icy} L ${x1 - b} ${y1}`
      : `M ${x0} ${y0 + d} L ${x1 - b} ${y0 + d} L ${x1 - b} ${y1}`;
    const rl = r * Math.SQRT2 + 10;
    const inletLabel = reduction ? 'd' : 'b';

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, x1 + p + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const sec = { x0: sx, y0: y0, x1: sx + a, y1: y0 + d };
    const fl = { x0: sec.x0 - p, y0: sec.y0 - p, x1: sec.x1 + p, y1: sec.y1 + p };
    const bottom = sec.y1 + f;
    const top = Math.min(fl.y1, bottom);
    const aDimY = Math.min(sec.y0 - 15, fl.y0 - 8);

    return (
      <g>
        <path d={outer} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={inner} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {/* inlet face + flange */}
        <line x1={x0} y1={y0 - p} x2={x0} y2={y0 + d + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x0 + p} y1={y0} x2={x0 + p} y2={y0 + d} stroke={lineColor} strokeWidth={1.2} />
        {/* outlet face + flange */}
        <line x1={x1 - b - p} y1={y1} x2={x1 + p} y2={y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x1 - b} y1={y1 - p} x2={x1} y2={y1 - p} stroke={lineColor} strokeWidth={1.2} />
        {/* r leader */}
        <line x1={icx} y1={icy} x2={icx + r} y2={icy - r} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={icx + rl * Math.SQRT1_2} y={icy - rl * Math.SQRT1_2 + 4} textAnchor="middle" fontSize={10} fill="#555555">r</text>

        {/* inlet width (left, top part) and f (left, bottom part) */}
        {dimLine(x0 - 15, y0, x0 - 15, y0 + d)}
        {tick(x0 - 15, y0, 1, 0)}
        {tick(x0 - 15, y0 + d, 1, 0)}
        <text x={x0 - 21} y={y0 + d / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">{inletLabel}</text>
        {dimLine(x0 - 15, y1 - f, x0 - 15, y1)}
        {tick(x0 - 15, y1 - f, 1, 0)}
        {tick(x0 - 15, y1, 1, 0)}
        <text x={x0 - 21} y={y1 - f / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">f</text>

        {/* e (bottom, left part) and outlet width b (bottom, right part) */}
        {dimLine(x0, y1 + 15, x1 - b, y1 + 15)}
        {tick(x0, y1 + 15, 0, 1)}
        {tick(x1 - b, y1 + 15, 0, 1)}
        <text x={(x0 + x1 - b) / 2} y={y1 + 29} textAnchor="middle" fontSize={10} fill="#555555">e</text>
        {reduction && (
          <>
            {dimLine(x1 - b, y1 + 15, x1, y1 + 15)}
            {tick(x1, y1 + 15, 0, 1)}
            <text x={x1 - b / 2} y={y1 + 29} textAnchor="middle" fontSize={10} fill="#555555">b</text>
          </>
        )}

        {/* ---- end view ---- */}
        <path d={`M ${sec.x0} ${top} L ${sec.x0} ${bottom} L ${sec.x1} ${bottom} L ${sec.x1} ${top}`} fill="none" stroke={lineColor} strokeWidth={1.2} />
        {bottom - p > fl.y1 && <line x1={sec.x0} y1={bottom - p} x2={sec.x1} y2={bottom - p} stroke={lineColor} strokeWidth={1.2} />}
        <line x1={sec.x0 - p} y1={bottom} x2={sec.x1 + p} y2={bottom} stroke={lineColor} strokeWidth={1.4} />
        <rect x={fl.x0} y={fl.y0} width={fl.x1 - fl.x0} height={fl.y1 - fl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={sec.x0} y={sec.y0} width={sec.x1 - sec.x0} height={sec.y1 - sec.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {dimLine(sec.x0, aDimY, sec.x1, aDimY)}
        {tick(sec.x0, aDimY, 0, 1)}
        {tick(sec.x1, aDimY, 0, 1)}
        <text x={(sec.x0 + sec.x1) / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderReductionElbow = () => renderElbowLike(true);

  const renderAngleBend = () => renderElbowLike(false);

  const renderEndCap = () => {
    // QESa port of Form1.cs `if (symbol == "QESa")` (zaślepka prostokątna). Side view on
    // the left: the cap body e deep (Form1 widens it by the flange p and puts the flange
    // face on its left edge), end view on the right: the a×b opening in its flange.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let ee = Math.max(toInt(values[2] || 30), 1);

    let p = 25;
    let maxNorm = Math.max(a, b);
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    if (ee > maxNorm) maxNorm = ee;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 80;
    a = toInt((a / maxNorm) * mnoznik);
    b = toInt((b / maxNorm) * mnoznik);
    ee = toInt((ee / maxNorm) * mnoznik);
    p = toInt((p / maxNorm) * mnoznik);
    while ((a + 20) < 100 && (b + 20) < 100) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); ee = toInt(ee * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0) break;
    }

    let pushX = toInt(((110 - a) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - b) / 2) + 5;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // punkty2 after Form1's `punkty2[0].X -= p; punkty2[3].X -= p`.
    const side = { x0: 20 + pushX - p, y0: 20 + pushY, x1: 20 + pushX + ee, y1: 20 + pushY + b };
    const eDimY = side.y1 + Math.max(15, p + 8);
    const bDimX = side.x1 + 15;

    const sectionShift = Math.max(0, bDimX + 14 + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const sec = { x0: sx, y0: 20 + pushY, x1: sx + a, y1: 20 + pushY + b };
    const fl = { x0: sec.x0 - p, y0: sec.y0 - p, x1: sec.x1 + p, y1: sec.y1 + p };
    const aDimY = Math.min(sec.y0 - 15, fl.y0 - 8);

    return (
      <g>
        <rect x={side.x0} y={side.y0} width={side.x1 - side.x0} height={side.y1 - side.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={side.x0} y1={side.y0 - p} x2={side.x0} y2={side.y1 + p} stroke={lineColor} strokeWidth={1.4} />

        {dimLine(side.x0, eDimY, side.x1, eDimY)}
        {tick(side.x0, eDimY, 0, 1)}
        {tick(side.x1, eDimY, 0, 1)}
        <text x={(side.x0 + side.x1) / 2} y={eDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {dimLine(bDimX, side.y0, bDimX, side.y1)}
        {tick(bDimX, side.y0, 1, 0)}
        {tick(bDimX, side.y1, 1, 0)}
        <text x={bDimX + 6} y={(side.y0 + side.y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>

        <rect x={sec.x0} y={sec.y0} width={sec.x1 - sec.x0} height={sec.y1 - sec.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={fl.x0} y={fl.y0} width={fl.x1 - fl.x0} height={fl.y1 - fl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        {dimLine(sec.x0, aDimY, sec.x1, aDimY)}
        {tick(sec.x0, aDimY, 0, 1)}
        {tick(sec.x1, aDimY, 0, 1)}
        <text x={(sec.x0 + sec.x1) / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderTeeLike = (round: boolean, cross = false) => {
    // Port of Form1.cs `if (symbol == "TR1a")` (trójnik z odejściem prostokątnym) and
    // `"TR2a"` (z odejściem okrągłym — the same block with a d-wide round branch and no
    // branch flanges). NOTE: Form1 reads the on-screen "a" from textBox5 and "b" from
    // textBox4, so its local `a`/`b` are swapped until it swaps them back halfway through;
    // the names here follow the on-screen labels. Side view on the left: the main duct
    // (length L, height a) with the branch (w or d wide, l3 tall) standing on it, its axis
    // e from the left flange face. End view on the right: the b-wide, a-tall opening in its
    // flange with the d-wide branch on top, its axis f from the right edge.
    // CZ1a / CZ2a (czwórniki) are the same drawing with a second branch (w1×l4 / d1×l4)
    // hanging under the duct, its axis e1 from the left face (f1 from the right edge in
    // the end view).
    const toInt = (v: number) => Math.trunc(v);
    const idx = cross
      ? (round ? { d: 2, w: -1, l: 3, l3: 9, e: 7, f: 8, d1: 4, w1: -1, l4: 10, e1: 5, f1: 6 }
               : { d: 2, w: 3, l: 4, l3: 11, e: 9, f: 10, d1: 5, w1: 6, l4: 12, e1: 7, f1: 8 })
      : (round ? { d: 2, w: -1, l: 3, l3: 4, e: 5, f: 6, d1: -1, w1: -1, l4: -1, e1: -1, f1: -1 }
               : { d: 2, w: 3, l: 4, l3: 7, e: 5, f: 6, d1: -1, w1: -1, l4: -1, e1: -1, f1: -1 });
    const val = (i: number, dflt: number) => (i < 0 ? dflt : values[i] || dflt);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = Math.max(toInt(val(idx.d, 100)), 1);
    let w = round ? d : Math.max(toInt(val(idx.w, 100)), 1);
    let l = Math.max(toInt(val(idx.l, 500)), 1);
    let l3 = Math.max(toInt(val(idx.l3, 100)), 1);
    let ee = Math.max(toInt(val(idx.e, 150)), 0);
    let f = Math.max(toInt(val(idx.f, 100)), 0);
    let d1 = cross ? Math.max(toInt(val(idx.d1, 100)), 1) : 0;
    let w1 = cross ? (round ? d1 : Math.max(toInt(val(idx.w1, 100)), 1)) : 0;
    let l4 = cross ? Math.max(toInt(val(idx.l4, 100)), 1) : 0;
    let ee1 = cross ? Math.max(toInt(val(idx.e1, 150)), 0) : 0;
    let f1 = cross ? Math.max(toInt(val(idx.f1, 100)), 0) : 0;

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = cross
      ? (b + l3 + l4 > a ? b + l3 + l4 : a)
      : round
        ? (a + l3 > b ? a + l3 : b)
        : (b + l3 > a ? b + l3 : a);
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;

    const mnoznik = 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); d = sc(d); w = sc(w); l3 = sc(l3); ee = sc(ee); f = sc(f); l = sc(l); p = sc(p);
    d1 = sc(d1); w1 = sc(w1); l4 = sc(l4); ee1 = sc(ee1); f1 = sc(f1);
    const grow = () => {
      a = toInt(a * 1.1); b = toInt(b * 1.1); d = toInt(d * 1.1); w = toInt(w * 1.1); l3 = toInt(l3 * 1.1);
      ee = toInt(ee * 1.1); f = toInt(f * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      d1 = toInt(d1 * 1.1); w1 = toInt(w1 * 1.1); l4 = toInt(l4 * 1.1); ee1 = toInt(ee1 * 1.1); f1 = toInt(f1 * 1.1);
      return a > 0 && b > 0 && l > 0;
    };
    if (cross) {
      while ((l + 20) < 150 && (a + 20 + l4 + l3) < 90 && (b + 20) < 90) { if (!grow()) break; }
    } else if (round) {
      while ((l + 20) < 150 && b < 90 && (a + l3) < 70) { if (!grow()) break; }
    } else {
      while ((l + 20) < 130 && (b + l3) < 80 && (a + 20) < 90) { if (!grow()) break; }
    }

    let pushX: number;
    let pushY: number;
    if (cross) {
      pushX = toInt(((110 - b - l) % 110) / 2); if (pushX < 0) pushX = -pushX;
      pushY = toInt((90 - a - 5) / 2) + 5;
    } else if (round) {
      pushX = 110 - b; if (pushX < 0) pushX = 20;
      pushY = 80 - a; if (pushY < 0) pushY = 20;
    } else {
      pushX = toInt(((110 - b - l) % 110) / 2); if (pushX < 0) pushX = -pushX;
      pushY = toInt((90 - a) / 2) + 5;
    }

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view: main duct (punkty2 with its left edge pulled out by p) + branch (punkty3)
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const x1 = x0 + l;
    const y1 = y0 + a;
    const faceL = x0 - p;
    const axis = faceL + ee;
    const br = { x0: axis - w / 2, y0: y0 - l3, x1: axis + w / 2, y1: y0 };
    const axis1 = faceL + ee1;
    const lbr = { x0: axis1 - w1 / 2, y0: y1, x1: axis1 + w1 / 2, y1: y1 + l4 };
    const lDimY = (cross ? lbr.y1 : y1) + Math.max(15, p + 8);
    const aDimX = x1 + 15;
    const wDimY = br.y0 - Math.max(9, round ? 6 : p + 6);
    const l3DimX = Math.min(br.x0, faceL) - 12;

    // ---- end view: b-wide × a-tall opening (punkty) + branch (punkty4)
    const sectionShift = Math.max(0, aDimX + 14 + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const sec = { x0: sx, y0: y0, x1: sx + b, y1: y0 + a };
    const fl = { x0: sec.x0 - p, y0: sec.y0 - p, x1: sec.x1 + p, y1: sec.y1 + p };
    const bAxis = sec.x1 - f;
    const br2 = { x0: bAxis - d / 2, y0: sec.y0 - l3, x1: bAxis + d / 2, y1: sec.y0 - p };
    const bAxis1 = sec.x1 - f1;
    const lbr2 = { x0: bAxis1 - d1 / 2, y0: sec.y1 + p, x1: bAxis1 + d1 / 2, y1: sec.y1 + l4 };
    const bDimY = cross ? lbr2.y1 + Math.max(15, p + 8) : Math.max(sec.y1 + 15, fl.y1 + 8);
    const w1DimY = lbr.y1 + Math.max(9, round ? 6 : p + 6);
    const d1DimY = lbr2.y1 + Math.max(9, round ? 6 : p + 6);
    const l4DimX = Math.min(lbr.x0, faceL) - 12;
    const dDimY = br2.y0 - Math.max(9, p + 6);
    const fDimY = sec.y0 + 15;

    return (
      <g>
        {/* main duct + flanges */}
        <rect x={faceL} y={y0} width={x1 - faceL} height={y1 - y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={x1} y1={y0 - p} x2={x1} y2={y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x1 - p} y1={y0} x2={x1 - p} y2={y1} stroke={lineColor} strokeWidth={1.2} />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={lineColor} strokeWidth={1.2} />
        <line x1={faceL} y1={y0 - p} x2={faceL} y2={y1 + p} stroke={lineColor} strokeWidth={1.4} />
        {/* branch (+ flange for the rectangular one) */}
        <path d={`M ${br.x0} ${br.y1} L ${br.x0} ${br.y0} L ${br.x1} ${br.y0} L ${br.x1} ${br.y1}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {!round && (
          <>
            <line x1={br.x0 - p} y1={br.y0} x2={br.x1 + p} y2={br.y0} stroke={lineColor} strokeWidth={1.4} />
            <line x1={br.x0} y1={br.y0 + p} x2={br.x1} y2={br.y0 + p} stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        {cross && (
          <>
            <path d={`M ${lbr.x0} ${lbr.y0} L ${lbr.x0} ${lbr.y1} L ${lbr.x1} ${lbr.y1} L ${lbr.x1} ${lbr.y0}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
            {!round && (
              <>
                <line x1={lbr.x0 - p} y1={lbr.y1} x2={lbr.x1 + p} y2={lbr.y1} stroke={lineColor} strokeWidth={1.4} />
                <line x1={lbr.x0} y1={lbr.y1 - p} x2={lbr.x1} y2={lbr.y1 - p} stroke={lineColor} strokeWidth={1.2} />
              </>
            )}
            {dimLine(lbr.x0, w1DimY, lbr.x1, w1DimY)}
            {tick(lbr.x0, w1DimY, 0, 1)}
            {tick(lbr.x1, w1DimY, 0, 1)}
            <text x={(lbr.x0 + lbr.x1) / 2} y={w1DimY + 14} textAnchor="middle" fontSize={10} fill="#555555">{round ? 'd1' : 'w1'}</text>
            {dimLine(l4DimX, y1, l4DimX, lbr.y1)}
            {tick(l4DimX, y1, 1, 0)}
            {tick(l4DimX, lbr.y1, 1, 0)}
            <text x={l4DimX - 6} y={(y1 + lbr.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">l4</text>
            {ee1 > 0 && (
              <>
                {dimLine(faceL, y1 - 15, axis1, y1 - 15)}
                {tick(faceL, y1 - 15, 0, 1)}
                {tick(axis1, y1 - 15, 0, 1)}
                <text x={(faceL + axis1) / 2} y={y1 - 19} textAnchor="middle" fontSize={10} fill="#555555">e1</text>
              </>
            )}
          </>
        )}

        {/* L, a, e, w/d, l3 */}
        {dimLine(faceL, lDimY, x1, lDimY)}
        {tick(faceL, lDimY, 0, 1)}
        {tick(x1, lDimY, 0, 1)}
        <text x={(faceL + x1) / 2} y={lDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">L</text>
        {dimLine(aDimX, y0, aDimX, y1)}
        {tick(aDimX, y0, 1, 0)}
        {tick(aDimX, y1, 1, 0)}
        <text x={aDimX + 6} y={(y0 + y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">a</text>
        {ee > 0 && (
          <>
            {dimLine(faceL, y0 + 15, axis, y0 + 15)}
            {tick(faceL, y0 + 15, 0, 1)}
            {tick(axis, y0 + 15, 0, 1)}
            <text x={(faceL + axis) / 2} y={y0 + 27} textAnchor="middle" fontSize={10} fill="#555555">e</text>
          </>
        )}
        {dimLine(br.x0, wDimY, br.x1, wDimY)}
        {tick(br.x0, wDimY, 0, 1)}
        {tick(br.x1, wDimY, 0, 1)}
        <text x={(br.x0 + br.x1) / 2} y={wDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">{round ? 'd' : 'w'}</text>
        {dimLine(l3DimX, br.y0, l3DimX, y0)}
        {tick(l3DimX, br.y0, 1, 0)}
        {tick(l3DimX, y0, 1, 0)}
        <text x={l3DimX - 6} y={(br.y0 + y0) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">l3</text>

        {/* end view */}
        <rect x={sec.x0} y={sec.y0} width={sec.x1 - sec.x0} height={sec.y1 - sec.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={fl.x0} y={fl.y0} width={fl.x1 - fl.x0} height={fl.y1 - fl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <path d={`M ${br2.x0} ${br2.y1} L ${br2.x0} ${br2.y0} L ${br2.x1} ${br2.y0} L ${br2.x1} ${br2.y1}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {!round && (
          <>
            <line x1={br2.x0 - p} y1={br2.y0} x2={br2.x1 + p} y2={br2.y0} stroke={lineColor} strokeWidth={1.4} />
            <line x1={br2.x0} y1={br2.y0 + p} x2={br2.x1} y2={br2.y0 + p} stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        {cross && (
          <>
            <path d={`M ${lbr2.x0} ${lbr2.y0} L ${lbr2.x0} ${lbr2.y1} L ${lbr2.x1} ${lbr2.y1} L ${lbr2.x1} ${lbr2.y0}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
            {!round && (
              <>
                <line x1={lbr2.x0 - p} y1={lbr2.y1} x2={lbr2.x1 + p} y2={lbr2.y1} stroke={lineColor} strokeWidth={1.4} />
                <line x1={lbr2.x0} y1={lbr2.y1 - p} x2={lbr2.x1} y2={lbr2.y1 - p} stroke={lineColor} strokeWidth={1.2} />
                {dimLine(lbr2.x0, d1DimY, lbr2.x1, d1DimY)}
                {tick(lbr2.x0, d1DimY, 0, 1)}
                {tick(lbr2.x1, d1DimY, 0, 1)}
                <text x={(lbr2.x0 + lbr2.x1) / 2} y={d1DimY + 14} textAnchor="middle" fontSize={10} fill="#555555">d1</text>
              </>
            )}
            {f1 > 0 && (
              <>
                {dimLine(bAxis1, sec.y1 - 15, sec.x1, sec.y1 - 15)}
                {tick(bAxis1, sec.y1 - 15, 0, 1)}
                {tick(sec.x1, sec.y1 - 15, 0, 1)}
                <text x={(bAxis1 + sec.x1) / 2} y={sec.y1 - 19} textAnchor="middle" fontSize={10} fill="#555555">f1</text>
              </>
            )}
          </>
        )}

        {dimLine(sec.x0, bDimY, sec.x1, bDimY)}
        {tick(sec.x0, bDimY, 0, 1)}
        {tick(sec.x1, bDimY, 0, 1)}
        <text x={(sec.x0 + sec.x1) / 2} y={bDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">b</text>
        {!round && (
          <>
            {dimLine(br2.x0, dDimY, br2.x1, dDimY)}
            {tick(br2.x0, dDimY, 0, 1)}
            {tick(br2.x1, dDimY, 0, 1)}
            <text x={(br2.x0 + br2.x1) / 2} y={dDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>
          </>
        )}
        {f > 0 && (
          <>
            {dimLine(bAxis, fDimY, sec.x1, fDimY)}
            {tick(bAxis, fDimY, 0, 1)}
            {tick(sec.x1, fDimY, 0, 1)}
            <text x={(bAxis + sec.x1) / 2} y={fDimY + 12} textAnchor="middle" fontSize={10} fill="#555555">f</text>
          </>
        )}
      </g>
    );
  };

  const renderTR1a = () => renderTeeLike(false);

  const renderTeeJunction = () => renderTeeLike(true);

  const renderSymmetricTee = () => {
    // TRa port of Form1.cs `if (symbol == "TRa")` (trójnik symetryczny). Side view on the
    // left: the run (length L, d tall at its left end, b tall at its right end, flat
    // bottom) with the h-wide branch rising from it — its left wall blends into the run's
    // top with radius q, its right wall drops a straight p and blends with radius r into
    // the i-long top of the right end. End view on the right: the a×d run opening in its
    // flange with the a-wide branch standing on it (Form1 steps the branch outline out by
    // the flange width below the p+r neck).
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = Math.max(toInt(values[2] || 150), 1);
    let h = Math.max(toInt(values[3] || 150), 1);
    let l = Math.max(toInt(values[4] || 600), 1);
    let q = Math.max(toInt(values[5] || 50), 0);
    let r = Math.max(toInt(values[6] || 50), 0);
    let i = Math.max(toInt(values[7] || 100), 0);
    let ps = Math.max(toInt(values[8] || 50), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = Math.max(a, b);
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (r + ps + b > maxNorm) maxNorm = r + ps + b;

    const mnoznik = 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); d = sc(d); h = sc(h); i = sc(i); ps = sc(ps); l = sc(l); p = sc(p); q = sc(q); r = sc(r);
    while (l < 100 && a < 100 && (b + r + ps) < 90) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); d = toInt(d * 1.1); h = toInt(h * 1.1); i = toInt(i * 1.1);
      ps = toInt(ps * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1); q = toInt(q * 1.1); r = toInt(r * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }
    if (q < 1) q = 1;
    if (r < 1) r = 1;

    let pushX = 150 - l;
    if (pushX < 0) pushX = 10;
    const pushY = toInt((90 - b - r - ps) / 2) + 5;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const x1 = x0 + l;
    const yBot = y0 + ps + r + b;
    const yTop = yBot - d;
    const ybr = yBot - b - r - ps;      // branch open end
    const xr = x1 - i - r;              // branch right wall
    const xl = xr - h;                  // branch left wall
    const outline = [
      `M ${x0} ${yTop}`,
      `L ${xl - q} ${yTop}`,
      `A ${q} ${q} 0 0 0 ${xl} ${yTop - q}`,
      `L ${xl} ${ybr}`,
      `L ${xr} ${ybr}`,
      `L ${xr} ${ybr + ps}`,
      `A ${r} ${r} 0 0 0 ${x1 - i} ${yBot - b}`,
      `L ${x1} ${yBot - b}`,
    ].join(' ');
    const qc = { x: xl - q, y: yTop - q };
    const rc = { x: x1 - i, y: yBot - b - r };
    const lDimY = yBot + Math.max(15, p + 8);
    const hDimY = ybr - Math.max(15, p + 8);
    const rightDimX = x1 + 15;

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, rightDimX + 14 + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const secBot = y0 + b + ps + r;
    const run = { x0: sx, y0: secBot - d, x1: sx + a, y1: secBot };
    const runFl = { x0: run.x0 - p, y0: run.y0 - p, x1: run.x1 + p, y1: run.y1 + p };
    const neckBot = Math.min(y0 + Math.max(ps + r - p, 0), runFl.y0);
    const branchOutline = [
      `M ${sx - p} ${runFl.y0} L ${sx - p} ${neckBot} L ${sx} ${neckBot} L ${sx} ${y0}`,
      `L ${sx + a} ${y0} L ${sx + a} ${neckBot} L ${sx + a + p} ${neckBot} L ${sx + a + p} ${runFl.y0}`,
    ].join(' ');
    const aDimY = runFl.y1 + 8 > run.y1 + 15 ? runFl.y1 + 8 : run.y1 + 15;

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={outline} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={x0} y1={yBot} x2={x1} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        {/* left end (d tall) face + flange */}
        <line x1={x0} y1={yTop} x2={x0} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={x0} y1={yTop - p} x2={x0} y2={yBot + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x0 + p} y1={yTop} x2={x0 + p} y2={yBot} stroke={lineColor} strokeWidth={1.2} />
        {/* right end (b tall) face + flange */}
        <line x1={x1} y1={yBot - b} x2={x1} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={x1} y1={yBot - b - p} x2={x1} y2={yBot + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x1 - p} y1={yBot - b} x2={x1 - p} y2={yBot} stroke={lineColor} strokeWidth={1.2} />
        {/* branch flange */}
        <line x1={xl - p} y1={ybr} x2={xr + p} y2={ybr} stroke={lineColor} strokeWidth={1.4} />
        <line x1={xl} y1={ybr + p} x2={xr} y2={ybr + p} stroke={lineColor} strokeWidth={1.2} />
        {/* q / r leaders (centre → corner) */}
        <line x1={qc.x} y1={qc.y} x2={xl} y2={yTop} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={qc.x - 5} y={qc.y - 4} textAnchor="end" fontSize={10} fill="#555555">q</text>
        <line x1={rc.x} y1={rc.y} x2={xr} y2={yBot - b} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={rc.x + 5} y={rc.y - 4} textAnchor="start" fontSize={10} fill="#555555">r</text>

        {/* d (left), L (below), b, p (right), i (under the right end's top), h (above branch) */}
        {dimLine(x0 - 15, yTop, x0 - 15, yBot)}
        {tick(x0 - 15, yTop, 1, 0)}
        {tick(x0 - 15, yBot, 1, 0)}
        <text x={x0 - 21} y={(yTop + yBot) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>
        {dimLine(x0, lDimY, x1, lDimY)}
        {tick(x0, lDimY, 0, 1)}
        {tick(x1, lDimY, 0, 1)}
        <text x={(x0 + x1) / 2} y={lDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">L</text>
        {dimLine(rightDimX, yBot - b, rightDimX, yBot)}
        {tick(rightDimX, yBot - b, 1, 0)}
        {tick(rightDimX, yBot, 1, 0)}
        <text x={rightDimX + 6} y={yBot - b / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>
        {ps > 0 && (
          <>
            {dimLine(rightDimX, ybr, rightDimX, ybr + ps)}
            {tick(rightDimX, ybr, 1, 0)}
            {tick(rightDimX, ybr + ps, 1, 0)}
            <text x={rightDimX + 6} y={ybr + ps / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">p</text>
          </>
        )}
        {i > 0 && (
          <>
            {dimLine(x1 - i, yBot - b + 15, x1, yBot - b + 15)}
            {tick(x1 - i, yBot - b + 15, 0, 1)}
            {tick(x1, yBot - b + 15, 0, 1)}
            <text x={x1 - i / 2} y={yBot - b + 27} textAnchor="middle" fontSize={10} fill="#555555">i</text>
          </>
        )}
        {dimLine(xl, hDimY, xr, hDimY)}
        {tick(xl, hDimY, 0, 1)}
        {tick(xr, hDimY, 0, 1)}
        <text x={(xl + xr) / 2} y={hDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">h</text>

        {/* ---- end view ---- */}
        <path d={branchOutline} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx - p} y1={y0} x2={sx + a + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx} y1={y0 + p} x2={sx + a} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <rect x={run.x0} y={run.y0} width={run.x1 - run.x0} height={run.y1 - run.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={runFl.x0} y={runFl.y0} width={runFl.x1 - runFl.x0} height={runFl.y1 - runFl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        {dimLine(run.x0, aDimY, run.x1, aDimY)}
        {tick(run.x0, aDimY, 0, 1)}
        {tick(run.x1, aDimY, 0, 1)}
        <text x={(run.x0 + run.x1) / 2} y={aDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderOffsetLike = (asym: boolean) => {
    // Port of Form1.cs `if (symbol == "QPR3a")` (odsadzka symetryczna) and `"QPR4a"`
    // (odsadzka asymetryczna — the same block with a d-tall left end). Side view on the
    // left: the lower-left end (straight m, then a mitre) rising by e over the length L to
    // the upper-right end (straight h). End view on the right: the two a-wide openings
    // offset by e, the lower one drawn in front of the upper one's flange.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = asym ? Math.max(toInt(values[2] || 150), 1) : b;
    let ee = Math.max(toInt(values[asym ? 3 : 2] || 100), 0);
    let l = Math.max(toInt(values[asym ? 4 : 3] || 500), 1);
    let m = Math.max(toInt(values[asym ? 5 : 4] ?? 0), 0);
    let h = Math.max(toInt(values[asym ? 6 : 5] ?? 0), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = Math.max(a, b);
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (asym && d + ee > maxNorm) maxNorm = d + ee;
    if (b + ee > maxNorm) maxNorm = b + ee;

    const mnoznik = 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); d = sc(d); ee = sc(ee); h = sc(h); m = sc(m); l = sc(l); p = sc(p);
    while (l < 70 && (asym ? (d + ee) < 70 && b < 70 : (b + ee) < 70)) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); d = toInt(d * 1.1); ee = toInt(ee * 1.1);
      h = toInt(h * 1.1); m = toInt(m * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }

    let pushX = 110 - l;
    if (pushX < 0) pushX = 10;
    let pushY = 90 - b - ee;
    if (pushY < 0) pushY = 10;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    // Form1's mitre: half the offset angle, applied to the (b-tall) wall.
    const alfa = toInt((Math.atan(ee / l) * 180) / Math.PI);
    const beta = toInt(alfa / 2);
    const m1 = toInt(Math.tan((beta * Math.PI) / 180) * b);
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const x1 = x0 + l;
    const yl0 = y0 + ee;          // left (lower) end
    const yl1 = yl0 + d;
    const yr0 = y0;               // right (upper) end
    const yr1 = y0 + b;
    const topWall = `M ${x0} ${yl0} L ${x0 + m} ${yl0} L ${x1 - h - m1} ${yr0} L ${x1} ${yr0}`;
    const bottomWall = `M ${x0} ${yl1} L ${x0 + m + m1} ${yl1} L ${x1 - h} ${yr1} L ${x1} ${yr1}`;
    const lDimY = Math.min(yr0 - 15, yr0 - p - 8);
    const mDimY = yl1 + Math.max(15, p + 8);
    const hDimY = yr1 + 15;
    const rightDimX = x1 + 15;

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, (asym ? rightDimX + 14 : x1 + p) + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const up = { x0: sx, y0: y0, x1: sx + a, y1: y0 + b };
    const upFl = { x0: up.x0 - p, y0: up.y0 - p, x1: up.x1 + p, y1: up.y1 + p };
    const lo = { x0: sx, y0: y0 + ee, x1: sx + a, y1: y0 + ee + d };
    const loFl = { x0: lo.x0 - p, y0: lo.y0 - p, x1: lo.x1 + p, y1: lo.y1 + p };
    // Form1 fills the lower flange with the background before outlining it, so whatever
    // of the upper opening and its flange falls inside that rect is hidden.
    const vis = (yA: number, yB: number): Array<[number, number]> => {
      const out: Array<[number, number]> = [];
      if (yA < loFl.y0) out.push([yA, Math.min(yB, loFl.y0)]);
      if (yB > loFl.y1) out.push([Math.max(yA, loFl.y1), yB]);
      return out.filter(([s, e]) => e > s);
    };
    const hidden = (y: number) => y >= loFl.y0 && y <= loFl.y1;
    const aDimY = Math.min(up.y0 - 15, upFl.y0 - 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={topWall} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={bottomWall} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={x0} y1={yl0} x2={x0} y2={yl1} stroke={lineColor} strokeWidth={1.6} />
        <line x1={x0} y1={yl0 - p} x2={x0} y2={yl1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x0 + p} y1={yl0} x2={x0 + p} y2={yl1} stroke={lineColor} strokeWidth={1.2} />
        <line x1={x1} y1={yr0} x2={x1} y2={yr1} stroke={lineColor} strokeWidth={1.6} />
        <line x1={x1} y1={yr0 - p} x2={x1} y2={yr1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x1 - p} y1={yr0} x2={x1 - p} y2={yr1} stroke={lineColor} strokeWidth={1.2} />

        {dimLine(x0, lDimY, x1, lDimY)}
        {tick(x0, lDimY, 0, 1)}
        {tick(x1, lDimY, 0, 1)}
        <text x={(x0 + x1) / 2} y={lDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">L</text>
        {m > 0 && (
          <>
            {dimLine(x0, mDimY, x0 + m, mDimY)}
            {tick(x0, mDimY, 0, 1)}
            {tick(x0 + m, mDimY, 0, 1)}
            <text x={x0 + m / 2} y={mDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}
        {h > 0 && (
          <>
            {dimLine(x1 - h, hDimY, x1, hDimY)}
            {tick(x1 - h, hDimY, 0, 1)}
            {tick(x1, hDimY, 0, 1)}
            <text x={x1 - h / 2} y={hDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">h</text>
          </>
        )}
        {dimLine(x0 - 15, yl0, x0 - 15, yl1)}
        {tick(x0 - 15, yl0, 1, 0)}
        {tick(x0 - 15, yl1, 1, 0)}
        <text x={x0 - 21} y={(yl0 + yl1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">{asym ? 'd' : 'b'}</text>
        {ee > 0 && (
          <>
            {dimLine(x0 - 15, yr0, x0 - 15, yl0)}
            {tick(x0 - 15, yr0, 1, 0)}
            <text x={x0 - 21} y={(yr0 + yl0) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">e</text>
          </>
        )}
        {asym && (
          <>
            {dimLine(rightDimX, yr0, rightDimX, yr1)}
            {tick(rightDimX, yr0, 1, 0)}
            {tick(rightDimX, yr1, 1, 0)}
            <text x={rightDimX + 6} y={(yr0 + yr1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">b</text>
          </>
        )}

        {/* ---- end view ---- */}
        {/* upper opening + flange, minus what the lower flange covers */}
        <line x1={upFl.x0} y1={upFl.y0} x2={upFl.x1} y2={upFl.y0} stroke={lineColor} strokeWidth={1.2} />
        {vis(upFl.y0, upFl.y1).map(([s, e], k) => (
          <React.Fragment key={`ufl${k}`}>
            <line x1={upFl.x0} y1={s} x2={upFl.x0} y2={e} stroke={lineColor} strokeWidth={1.2} />
            <line x1={upFl.x1} y1={s} x2={upFl.x1} y2={e} stroke={lineColor} strokeWidth={1.2} />
          </React.Fragment>
        ))}
        {!hidden(upFl.y1) && <line x1={upFl.x0} y1={upFl.y1} x2={upFl.x1} y2={upFl.y1} stroke={lineColor} strokeWidth={1.2} />}
        <line x1={up.x0} y1={up.y0} x2={up.x1} y2={up.y0} stroke={lineColor} strokeWidth={1.6} />
        {vis(up.y0, up.y1).map(([s, e], k) => (
          <React.Fragment key={`up${k}`}>
            <line x1={up.x0} y1={s} x2={up.x0} y2={e} stroke={lineColor} strokeWidth={1.6} />
            <line x1={up.x1} y1={s} x2={up.x1} y2={e} stroke={lineColor} strokeWidth={1.6} />
          </React.Fragment>
        ))}
        {!hidden(up.y1) && <line x1={up.x0} y1={up.y1} x2={up.x1} y2={up.y1} stroke={lineColor} strokeWidth={1.6} />}
        {/* lower opening + flange (in front) */}
        <rect x={loFl.x0} y={loFl.y0} width={loFl.x1 - loFl.x0} height={loFl.y1 - loFl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={lo.x0} y={lo.y0} width={lo.x1 - lo.x0} height={lo.y1 - lo.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {dimLine(up.x0, aDimY, up.x1, aDimY)}
        {tick(up.x0, aDimY, 0, 1)}
        {tick(up.x1, aDimY, 0, 1)}
        <text x={(up.x0 + up.x1) / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };

  const renderSymmetricOffset = () => renderOffsetLike(false);

  const renderAsymmetricOffset = () => renderOffsetLike(true);

  const renderPipeSaddle = () => {
    // TR6a port of Form1.cs `if (symbol == "TR6a")` (nakładka na rurę). End view on the
    // right: the f-wide neck standing g above the pipe (diameter a), its sides run down to
    // the pipe and only the pipe's top arc between them is drawn. Side view on the left:
    // the e-long saddle from its flange down to the pipe, with the pipe's top drawn dotted
    // (Form1's myPen3, DashStyle.Dot). Form1 draws no pipe body in the side view — only
    // its a and L dimensions — so the pipe outline is added here dotted for context.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let ee = Math.max(toInt(values[1] || 300), 1);
    let f = Math.max(toInt(values[2] || 150), 1);
    let l = Math.max(toInt(values[3] || 600), 1);
    let g = Math.max(toInt(values[4] || 100), 0);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = 0;
    if (a > maxNorm) maxNorm = a;
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (ee > maxNorm) maxNorm = ee;
    if (f > maxNorm) maxNorm = f;
    if (g + a > maxNorm) maxNorm = g + a;

    const mnoznik = 60;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); l = sc(l); ee = sc(ee); f = sc(f); g = sc(g); p = sc(p);
    while (f < 40 && ee < 80 && l < 80 && (a + g) < 60) {
      a = toInt(a * 1.1); l = toInt(l * 1.1); ee = toInt(ee * 1.1); f = toInt(f * 1.1); g = toInt(g * 1.1); p = toInt(p * 1.1);
      if (a === 0 || l === 0) break;
    }
    if (f > a) f = a; // the neck cannot be wider than the pipe (Form1 rejects f > a)

    let pushX = toInt((200 - l) / 2);
    if (pushX < 0) pushX = -pushX;
    let pushY = toInt((100 - g - a) / 2) + 5;
    if (pushY < 0) pushY = 10;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const x1 = x0 + l;
    const pipeTop = y0 + g;
    const pipeBot = pipeTop + a;
    const R = a / 2;
    const drop = R - Math.sqrt(Math.max(R * R - (f / 2) * (f / 2), 0)); // how far the pipe's top arc sits below its crown at the neck's edge
    const yEdge = pipeTop + toInt(drop);
    const sx0 = x0 + toInt((l - ee) / 2);
    const sx1 = sx0 + ee;
    const lDimY = pipeBot + 15;
    const eDimY = Math.min(y0 - 15, y0 - p - 8);

    // ---- end view --------------------------------------------------------------
    const rightExtent = Math.max(x1, sx1 + 15 + 14);
    const sectionShift = Math.max(0, rightExtent + 6 - (190 - p + pushX));
    const nx0 = 190 + pushX + sectionShift;
    const nx1 = nx0 + f;
    const cx = nx0 + f / 2;
    const cy = pipeTop + R;
    const kat = Math.atan((f / 2) / Math.max(cy - yEdge, 0.001));
    const arcL = { x: cx - R * Math.sin(kat), y: cy - R * Math.cos(kat) };
    const arcR = { x: cx + R * Math.sin(kat), y: cy - R * Math.cos(kat) };
    const fDimY = Math.min(y0 - 15, y0 - p - 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={`M ${sx0} ${yEdge} L ${sx0} ${y0} L ${sx1} ${y0} L ${sx1} ${yEdge}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx0 - p} y1={y0} x2={sx1 + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx0} y1={y0 + p} x2={sx1} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={sx0} y1={pipeTop} x2={sx1} y2={pipeTop} stroke={lineColor} strokeWidth={1.2} strokeDasharray="1.5 2.5" />
        <path d={`M ${sx0} ${pipeTop} L ${x0} ${pipeTop} L ${x0} ${pipeBot} L ${x1} ${pipeBot} L ${x1} ${pipeTop} L ${sx1} ${pipeTop}`}
          fill="none" stroke={lineColor} strokeWidth={0.9} strokeDasharray="1.5 2.5" />
        {dimLine(x0, lDimY, x1, lDimY)}
        {tick(x0, lDimY, 0, 1)}
        {tick(x1, lDimY, 0, 1)}
        <text x={(x0 + x1) / 2} y={lDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">L</text>
        {dimLine(x0 - 15, pipeTop, x0 - 15, pipeBot)}
        {tick(x0 - 15, pipeTop, 1, 0)}
        {tick(x0 - 15, pipeBot, 1, 0)}
        <text x={x0 - 21} y={(pipeTop + pipeBot) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">a</text>
        {g > 0 && (
          <>
            {dimLine(sx1 + 15, y0, sx1 + 15, pipeTop)}
            {tick(sx1 + 15, y0, 1, 0)}
            {tick(sx1 + 15, pipeTop, 1, 0)}
            <text x={sx1 + 21} y={(y0 + pipeTop) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">g</text>
          </>
        )}
        {dimLine(sx0, eDimY, sx1, eDimY)}
        {tick(sx0, eDimY, 0, 1)}
        {tick(sx1, eDimY, 0, 1)}
        <text x={(sx0 + sx1) / 2} y={eDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">e</text>

        {/* ---- end view ---- */}
        <path d={`M ${nx0} ${pipeTop} L ${nx0} ${y0} L ${nx1} ${y0} L ${nx1} ${pipeTop}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={nx0} y1={pipeTop} x2={arcL.x} y2={arcL.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={nx1} y1={pipeTop} x2={arcR.x} y2={arcR.y} stroke={lineColor} strokeWidth={1.6} />
        <path d={`M ${arcL.x} ${arcL.y} A ${R} ${R} 0 0 1 ${arcR.x} ${arcR.y}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={nx0 - p} y1={y0} x2={nx1 + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={nx0} y1={y0 + p} x2={nx1} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        {dimLine(nx0, fDimY, nx1, fDimY)}
        {tick(nx0, fDimY, 0, 1)}
        {tick(nx1, fDimY, 0, 1)}
        <text x={(nx0 + nx1) / 2} y={fDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>
      </g>
    );
  };

  const renderRectCrossJunction = () => renderTeeLike(false, true);

  const renderRoundCrossJunction = () => renderTeeLike(true, true);

  const renderEagleTee = () => {
    // TR3a port of Form1.cs `if (symbol == "TR3a")` (trójnik orłowy). NOTE: Form1 reads
    // the on-screen "a" from textBox5 and "b" from textBox4, so its local `a`/`b` are the
    // other way round; the names here follow the labels. Side view on the left: the inlet
    // stub (m long, d tall) curves down with radius g into a k-deep drop onto the a-wide
    // bottom opening, which rises j on the far side and curves with radius f into the
    // outlet stub (i long, c tall); the outer wall is the two concentric arcs (g+d and
    // c+f) meeting at their intersection, which Form1 approximates with integer angles
    // and is computed exactly here. End view on the right: the b-wide inlet (c tall) and
    // outlet (d tall) openings in their flanges over the g+k drop.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 300), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let c = Math.max(toInt(values[2] || 200), 1);
    let d = Math.max(toInt(values[3] || 200), 1);
    let m = Math.max(toInt(values[4] || 100), 1);
    let k = Math.max(toInt(values[5] || 50), 0);
    let i = Math.max(toInt(values[6] || 100), 1);
    let j = Math.max(toInt(values[7] || 50), 0);
    let g = Math.max(toInt(values[8] || 50), 0);
    let f = Math.max(toInt(values[9] || 50), 0);

    let p = 25;
    let l = c + f + j;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = Math.max(a, b);
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (c + f + j > maxNorm) maxNorm = c + f + j;
    if (d + g + k > maxNorm) maxNorm = d + g + k;
    const mnoznik = 55;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); c = sc(c); d = sc(d); m = sc(m); k = sc(k); i = sc(i); j = sc(j); g = sc(g); f = sc(f); l = sc(l); p = sc(p);
    while ((d + k + g) < 60 && (c + f + j) < 60 && (b + 20) < 80 && a < 60) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); c = toInt(c * 1.1); d = toInt(d * 1.1); m = toInt(m * 1.1); k = toInt(k * 1.1);
      i = toInt(i * 1.1); j = toInt(j * 1.1); g = toInt(g * 1.1); f = toInt(f * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || c === 0 || d === 0) break;
    }
    if (g < 1) g = 1;
    if (f < 1) f = 1;
    let pushX = 140 - a - m - g - f - j;
    if (pushX < 0) pushX = 10;
    const pushY = c + f + j > d + g + k ? 90 - c - f - j : 90 - d - g - k;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const yA = y0 + (c + f + j) - (d + g + k);
    const stub = { x0: x0, y0: yA, x1: x0 + m, y1: yA + d };
    const C1 = { x: stub.x1, y: stub.y1 + g };
    const Q = { x: C1.x + g, y: C1.y + k };               // bottom opening, left end
    const QR = { x: Q.x + a, y: Q.y };                     // bottom opening, right end
    const C2 = { x: QR.x + f, y: QR.y - j };
    const out = { x0: C2.x, y0: C2.y - f - c, x1: C2.x + i, y1: C2.y - f };
    const R1 = g + d;
    const R2 = c + f;
    const top1 = { x: C1.x, y: C1.y - R1 };
    const top2 = { x: C2.x, y: C2.y - R2 };
    // upper intersection of the two outer circles
    const dx = C2.x - C1.x, dy = C2.y - C1.y;
    const D = Math.hypot(dx, dy);
    let outer: string;
    if (D > 0 && D <= R1 + R2 && D >= Math.abs(R1 - R2)) {
      const aa = (R1 * R1 - R2 * R2 + D * D) / (2 * D);
      const hh = Math.sqrt(Math.max(R1 * R1 - aa * aa, 0));
      const mx = C1.x + (aa * dx) / D, my = C1.y + (aa * dy) / D;
      const P1 = { x: mx + (hh * dy) / D, y: my - (hh * dx) / D };
      const P2 = { x: mx - (hh * dy) / D, y: my + (hh * dx) / D };
      const P = P1.y < P2.y ? P1 : P2;
      outer = `M ${top1.x} ${top1.y} A ${R1} ${R1} 0 0 1 ${P.x} ${P.y} A ${R2} ${R2} 0 0 1 ${top2.x} ${top2.y}`;
    } else {
      outer = `M ${top1.x} ${top1.y} L ${top2.x} ${top2.y}`;
    }
    const inner = [
      `M ${stub.x1} ${stub.y1} A ${g} ${g} 0 0 1 ${Q.x} ${C1.y} L ${Q.x} ${Q.y}`,
      `M ${QR.x} ${QR.y} L ${QR.x} ${C2.y} A ${f} ${f} 0 0 1 ${C2.x} ${out.y1}`,
    ].join(' ');
    const aDimY = Q.y + Math.max(15, p + 8);
    const sideRight = out.x1 + 15 + 14;

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, sideRight + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const top = { x0: sx, y0: y0, x1: sx + b, y1: y0 + c };
    const topFl = { x0: top.x0 - p, y0: top.y0 - p, x1: top.x1 + p, y1: top.y1 + p };
    const yBot = y0 + c + f + j;
    const lo = { x0: sx, y0: yBot - g - k - d, x1: sx + b, y1: yBot - g - k };
    const loFl = { x0: lo.x0 - p, y0: lo.y0 - p, x1: lo.x1 + p, y1: lo.y1 + p };
    const vis = (yA_: number, yB_: number): Array<[number, number]> => {
      const res: Array<[number, number]> = [];
      if (yA_ < loFl.y0) res.push([yA_, Math.min(yB_, loFl.y0)]);
      if (yB_ > loFl.y1) res.push([Math.max(yA_, loFl.y1), yB_]);
      return res.filter(([s, e]) => e > s);
    };
    const hidden = (y: number) => y >= loFl.y0 && y <= loFl.y1;
    const bDimY = yBot + 15;

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={`M ${stub.x1} ${stub.y0} L ${stub.x0} ${stub.y0} L ${stub.x0} ${stub.y1} L ${stub.x1} ${stub.y1}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={stub.x0} y1={stub.y0 - p} x2={stub.x0} y2={stub.y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={stub.x0 + p} y1={stub.y0} x2={stub.x0 + p} y2={stub.y1} stroke={lineColor} strokeWidth={1.2} />
        <path d={inner} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={Q.x - p} y1={Q.y} x2={QR.x + p} y2={QR.y} stroke={lineColor} strokeWidth={1.4} />
        <line x1={Q.x} y1={Q.y - p} x2={QR.x} y2={QR.y - p} stroke={lineColor} strokeWidth={1.2} />
        <path d={`M ${out.x0} ${out.y1} L ${out.x1} ${out.y1} L ${out.x1} ${out.y0} L ${out.x0} ${out.y0}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={out.x1} y1={out.y0 - p} x2={out.x1} y2={out.y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={out.x1 - p} y1={out.y0} x2={out.x1 - p} y2={out.y1} stroke={lineColor} strokeWidth={1.2} />
        <path d={outer} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {/* g / f leaders */}
        <line x1={C1.x} y1={C1.y} x2={C1.x + g} y2={C1.y - g} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={C1.x + g + 4} y={C1.y - g - 4} textAnchor="start" fontSize={10} fill="#555555">g</text>
        <line x1={C2.x} y1={C2.y} x2={C2.x - f} y2={C2.y - f} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={C2.x - f - 4} y={C2.y - f - 4} textAnchor="end" fontSize={10} fill="#555555">f</text>
        {/* d, m, k, a, j, c, i */}
        {dimLine(stub.x0 - 15, stub.y0, stub.x0 - 15, stub.y1)}
        {tick(stub.x0 - 15, stub.y0, 1, 0)}
        {tick(stub.x0 - 15, stub.y1, 1, 0)}
        <text x={stub.x0 - 21} y={(stub.y0 + stub.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>
        {dimLine(stub.x0, stub.y0 - 15, stub.x1, stub.y0 - 15)}
        {tick(stub.x0, stub.y0 - 15, 0, 1)}
        {tick(stub.x1, stub.y0 - 15, 0, 1)}
        <text x={(stub.x0 + stub.x1) / 2} y={stub.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">m</text>
        {k > 0 && (
          <>
            {dimLine(Q.x - 15, C1.y, Q.x - 15, Q.y)}
            {tick(Q.x - 15, C1.y, 1, 0)}
            {tick(Q.x - 15, Q.y, 1, 0)}
            <text x={Q.x - 21} y={(C1.y + Q.y) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">k</text>
          </>
        )}
        {dimLine(Q.x, aDimY, QR.x, aDimY)}
        {tick(Q.x, aDimY, 0, 1)}
        {tick(QR.x, aDimY, 0, 1)}
        <text x={(Q.x + QR.x) / 2} y={aDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>
        {j > 0 && (
          <>
            {dimLine(QR.x + 15, C2.y, QR.x + 15, QR.y)}
            {tick(QR.x + 15, C2.y, 1, 0)}
            {tick(QR.x + 15, QR.y, 1, 0)}
            <text x={QR.x + 21} y={(C2.y + QR.y) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">j</text>
          </>
        )}
        {dimLine(out.x1 + 15, out.y0, out.x1 + 15, out.y1)}
        {tick(out.x1 + 15, out.y0, 1, 0)}
        {tick(out.x1 + 15, out.y1, 1, 0)}
        <text x={out.x1 + 21} y={(out.y0 + out.y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">c</text>
        {dimLine(out.x0, out.y0 - 15, out.x1, out.y0 - 15)}
        {tick(out.x0, out.y0 - 15, 0, 1)}
        {tick(out.x1, out.y0 - 15, 0, 1)}
        <text x={(out.x0 + out.x1) / 2} y={out.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">i</text>

        {/* ---- end view ---- */}
        <path d={`M ${lo.x0} ${Math.max(loFl.y1, lo.y1)} L ${lo.x0} ${yBot} L ${lo.x1} ${yBot} L ${lo.x1} ${Math.max(loFl.y1, lo.y1)}`} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <line x1={topFl.x0} y1={topFl.y0} x2={topFl.x1} y2={topFl.y0} stroke={lineColor} strokeWidth={1.2} />
        {vis(topFl.y0, topFl.y1).map(([s, e], k2) => (
          <React.Fragment key={`tfl${k2}`}>
            <line x1={topFl.x0} y1={s} x2={topFl.x0} y2={e} stroke={lineColor} strokeWidth={1.2} />
            <line x1={topFl.x1} y1={s} x2={topFl.x1} y2={e} stroke={lineColor} strokeWidth={1.2} />
          </React.Fragment>
        ))}
        {!hidden(topFl.y1) && <line x1={topFl.x0} y1={topFl.y1} x2={topFl.x1} y2={topFl.y1} stroke={lineColor} strokeWidth={1.2} />}
        <line x1={top.x0} y1={top.y0} x2={top.x1} y2={top.y0} stroke={lineColor} strokeWidth={1.6} />
        {vis(top.y0, top.y1).map(([s, e], k2) => (
          <React.Fragment key={`top${k2}`}>
            <line x1={top.x0} y1={s} x2={top.x0} y2={e} stroke={lineColor} strokeWidth={1.6} />
            <line x1={top.x1} y1={s} x2={top.x1} y2={e} stroke={lineColor} strokeWidth={1.6} />
          </React.Fragment>
        ))}
        {!hidden(top.y1) && <line x1={top.x0} y1={top.y1} x2={top.x1} y2={top.y1} stroke={lineColor} strokeWidth={1.6} />}
        <rect x={loFl.x0} y={loFl.y0} width={loFl.x1 - loFl.x0} height={loFl.y1 - loFl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={lo.x0} y={lo.y0} width={lo.x1 - lo.x0} height={lo.y1 - lo.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {dimLine(lo.x0, bDimY, lo.x1, bDimY)}
        {tick(lo.x0, bDimY, 0, 1)}
        {tick(lo.x1, bDimY, 0, 1)}
        <text x={(lo.x0 + lo.x1) / 2} y={bDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderRadiusTee = () => {
    // TR4a port of Form1.cs `if (symbol == "TR4a")` (trójnik z odejściem łukowym). NOTE:
    // Form1 reads the on-screen "a" from textBox5 and "b" from textBox4, so its local
    // `a`/`b` are the other way round; the names here follow the labels. Side view on the
    // left: the run (j long, d tall) enters from the left and curves down with radius g
    // into the a-wide bottom outlet (i tall); the c-wide top outlet sits at the top right,
    // its right wall running straight down to the bottom outlet and its left wall dropping
    // onto the outer arc (radius g+d) that continues the run's top. End view on the right:
    // the three b-wide openings stacked over the height L, each in its flange.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let c = Math.max(toInt(values[2] || 150), 1);
    let d = Math.max(toInt(values[3] || 200), 1);
    let l = Math.max(toInt(values[4] || 600), 1);
    let g = Math.max(toInt(values[5] || 50), 0);
    let i = Math.max(toInt(values[6] || 100), 1);
    let j = Math.max(toInt(values[7] || 100), 1);

    let p = 25;
    let maxNorm = Math.max(a, b);
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (i > maxNorm) maxNorm = i;
    if (j > maxNorm) maxNorm = j;
    if (c > maxNorm) maxNorm = c;
    if (d > maxNorm) maxNorm = d;
    if (a + j + g > maxNorm) maxNorm = a + j + g;
    const mnoznik = 80;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); c = sc(c); d = sc(d); p = sc(p); i = sc(i); j = sc(j); g = sc(g); l = sc(l);
    while (l < 70 && b < 100 && (a + j + g) < 100) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); c = toInt(c * 1.1); d = toInt(d * 1.1); p = toInt(p * 1.1);
      i = toInt(i * 1.1); j = toInt(j * 1.1); g = toInt(g * 1.1); l = toInt(l * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }
    if (g < 1) g = 1;
    let pushX = 130 - a - g - j;
    if (pushX < 0) pushX = -pushX;
    const pushY = 90 - l;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const yr = y0 + l - d - g - i;
    const run = { x0: x0, y0: yr, x1: x0 + j, y1: yr + d };
    const gc = { x: run.x1, y: run.y1 + g };
    const low = { x0: run.x1 + g, y0: run.y1 + g, x1: run.x1 + g + a, y1: run.y1 + g + i };
    const xR = low.x1;
    const xq = xR - c;
    const R = g + d;
    const dx = xq - gc.x;
    const onArc = R * R - dx * dx >= 0 && dx >= 0;
    const yq = onArc ? gc.y - Math.sqrt(R * R - dx * dx) : gc.y;
    const outerWall = onArc
      ? `M ${run.x1} ${run.y0} A ${R} ${R} 0 0 1 ${xq} ${yq} L ${xq} ${y0}`
      : `M ${run.x1} ${run.y0} A ${R} ${R} 0 0 1 ${gc.x + R} ${gc.y} L ${xq} ${gc.y} L ${xq} ${y0}`;
    const outline = [
      `M ${run.x1} ${run.y0} L ${run.x0} ${run.y0} L ${run.x0} ${run.y1} L ${run.x1} ${run.y1}`,
      `A ${g} ${g} 0 0 1 ${low.x0} ${low.y0}`,
      `L ${low.x0} ${low.y1} L ${low.x1} ${low.y1} L ${xR} ${y0} L ${xq} ${y0}`,
    ].join(' ');
    const lDimX = xR + 15;

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, lDimX + 14 + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const top = { y0: y0, y1: y0 + l - d - i - g - p };
    const mid = { y0: y0 + l - d - g - i, y1: y0 + l - g - i };
    const bot = { y0: mid.y1 + p, y1: y0 + l };
    const bDimY = Math.min(y0 - 15, y0 - p - 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={outline} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={outerWall} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={run.x0} y1={run.y0 - p} x2={run.x0} y2={run.y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={run.x0 + p} y1={run.y0} x2={run.x0 + p} y2={run.y1} stroke={lineColor} strokeWidth={1.2} />
        <line x1={low.x0 - p} y1={low.y1} x2={low.x1 + p} y2={low.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={low.x0} y1={low.y1 - p} x2={low.x1} y2={low.y1 - p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={xq - p} y1={y0} x2={xR + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={xq} y1={y0 + p} x2={xR} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={gc.x} y1={gc.y} x2={gc.x + g} y2={gc.y - g} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={gc.x + g + 4} y={gc.y - g - 4} textAnchor="start" fontSize={10} fill="#555555">g</text>
        {dimLine(run.x0, run.y0 - 15, run.x1, run.y0 - 15)}
        {tick(run.x0, run.y0 - 15, 0, 1)}
        {tick(run.x1, run.y0 - 15, 0, 1)}
        <text x={(run.x0 + run.x1) / 2} y={run.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">j</text>
        {dimLine(run.x0 - 15, run.y0, run.x0 - 15, run.y1)}
        {tick(run.x0 - 15, run.y0, 1, 0)}
        {tick(run.x0 - 15, run.y1, 1, 0)}
        <text x={run.x0 - 21} y={(run.y0 + run.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">d</text>
        {dimLine(low.x0, low.y1 + 15, low.x1, low.y1 + 15)}
        {tick(low.x0, low.y1 + 15, 0, 1)}
        {tick(low.x1, low.y1 + 15, 0, 1)}
        <text x={(low.x0 + low.x1) / 2} y={low.y1 + 29} textAnchor="middle" fontSize={10} fill="#555555">a</text>
        {dimLine(low.x0 - 15, low.y0, low.x0 - 15, low.y1)}
        {tick(low.x0 - 15, low.y0, 1, 0)}
        {tick(low.x0 - 15, low.y1, 1, 0)}
        <text x={low.x0 - 21} y={(low.y0 + low.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">i</text>
        {dimLine(xq, y0 - 15, xR, y0 - 15)}
        {tick(xq, y0 - 15, 0, 1)}
        {tick(xR, y0 - 15, 0, 1)}
        <text x={(xq + xR) / 2} y={y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">c</text>
        {dimLine(lDimX, y0, lDimX, y0 + l)}
        {tick(lDimX, y0, 1, 0)}
        {tick(lDimX, y0 + l, 1, 0)}
        <text x={lDimX + 6} y={y0 + l / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">L</text>

        {/* ---- end view ---- */}
        <path d={`M ${sx} ${top.y1} L ${sx} ${top.y0} L ${sx + b} ${top.y0} L ${sx + b} ${top.y1}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx - p} y1={top.y0} x2={sx + b + p} y2={top.y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx} y1={top.y0 + p} x2={sx + b} y2={top.y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <rect x={sx} y={mid.y0} width={b} height={mid.y1 - mid.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={sx - p} y={mid.y0 - p} width={b + 2 * p} height={mid.y1 - mid.y0 + 2 * p} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <path d={`M ${sx} ${bot.y0} L ${sx} ${bot.y1} L ${sx + b} ${bot.y1} L ${sx + b} ${bot.y0}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx - p} y1={bot.y1} x2={sx + b + p} y2={bot.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx} y1={bot.y1 - p} x2={sx + b} y2={bot.y1 - p} stroke={lineColor} strokeWidth={1.2} />
        {dimLine(sx, bDimY, sx + b, bDimY)}
        {tick(sx, bDimY, 0, 1)}
        {tick(sx + b, bDimY, 0, 1)}
        <text x={sx + b / 2} y={bDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>
      </g>
    );
  };

  const renderPortTee = () => {
    // TR5a port of Form1.cs `if (symbol == "TR5a")` (trójnik portkowy). Side view on the
    // left: the pants — two top openings (c and d wide, g apart, their stubs k tall, the
    // left one starting h left of the bottom opening) meeting in a V and running down to
    // the a-wide bottom opening (stub j tall). End view on the right: the e-wide top
    // opening (k tall) tapering to the b-wide bottom opening (j tall) offset i to the left,
    // L being the overall height.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 300), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let c = Math.max(toInt(values[2] || 150), 1);
    let d = Math.max(toInt(values[3] || 150), 1);
    let ee = Math.max(toInt(values[4] || 200), 1);
    let l = Math.max(toInt(values[5] || 500), 1);
    let h = toInt(values[6] ?? 0);
    let g = Math.max(toInt(values[7] ?? 0), 0);
    let i = toInt(values[8] ?? 0);
    let j = Math.max(toInt(values[9] || 30), 1);
    let k = Math.max(toInt(values[10] || 30), 1);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = Math.max(a, b);
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    if (Math.abs(h) + c + g + d > maxNorm) maxNorm = Math.abs(h) + c + g + d;
    const mnoznik = 70;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); c = sc(c); d = sc(d); ee = sc(ee); j = sc(j); k = sc(k); l = sc(l); h = sc(h); i = sc(i); g = sc(g); p = sc(p);
    while (l < 70 && (a + 20) < 90 && (b + 20) < 90) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); c = toInt(c * 1.1); d = toInt(d * 1.1); ee = toInt(ee * 1.1); j = toInt(j * 1.1);
      k = toInt(k * 1.1); l = toInt(l * 1.1); h = toInt(h * 1.1); i = toInt(i * 1.1); g = toInt(g * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }
    let pushX = 120 - a;
    if (pushX < 0) pushX = 10;
    let pushY = 80 - l;
    if (pushY < 0) pushY = 10;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view (punkty2) ---------------------------------------------------
    const x0 = 20 + pushX + Math.max(0, h + 15);
    const y0 = 20 + pushY;
    const yTop = y0 + k;             // where the top stubs meet the body
    const yBot = y0 + l - j;         // where the bottom stub starts
    const cL = x0 - h, cR = cL + c;
    const dL = cR + g, dR = dL + d;
    const aL = x0, aR = x0 + a;
    const crotch = { x: cR + g / 2, y: yTop + (l - k - j) / 2 };
    const body = `M ${cL} ${yTop} L ${aL} ${yBot} M ${dR} ${yTop} L ${aR} ${yBot} M ${cR} ${yTop} L ${crotch.x} ${crotch.y} L ${dL} ${yTop}`;
    const stub = (xl: number, xr: number, yFrom: number, yTo: number) =>
      `M ${xl} ${yFrom} L ${xl} ${yTo} L ${xr} ${yTo} L ${xr} ${yFrom}`;
    const topDimY = Math.min(y0 - 15, y0 - p - 8);
    const sideRight = Math.max(dR + p, aR + p) + 6;

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, sideRight + Math.max(0, i) + 20 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const eTop = { x0: sx, x1: sx + ee, y0: y0, y1: y0 + k };
    const eBot = { x0: sx - i, x1: sx - i + b, y0: y0 + l - j, y1: y0 + l };
    const lDimX = Math.max(eTop.x1, eBot.x1) + 15;
    const botDimY = eBot.y1 + Math.max(15, p + 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={body} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <path d={stub(cL, cR, yTop, y0)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={cL - p} y1={y0} x2={cR + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={cL} y1={y0 + p} x2={cR} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <path d={stub(dL, dR, yTop, y0)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={dL - p} y1={y0} x2={dR + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={dL} y1={y0 + p} x2={dR} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <path d={stub(aL, aR, yBot, y0 + l)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={aL - p} y1={y0 + l} x2={aR + p} y2={y0 + l} stroke={lineColor} strokeWidth={1.4} />
        <line x1={aL} y1={y0 + l - p} x2={aR} y2={y0 + l - p} stroke={lineColor} strokeWidth={1.2} />
        {/* a below; -h / c / g / d along one line above the top openings */}
        {dimLine(aL, y0 + l + 15, aR, y0 + l + 15)}
        {tick(aL, y0 + l + 15, 0, 1)}
        {tick(aR, y0 + l + 15, 0, 1)}
        <text x={(aL + aR) / 2} y={y0 + l + 29} textAnchor="middle" fontSize={10} fill="#555555">a</text>
        {dimLine(Math.min(cL, aL), topDimY, dR, topDimY)}
        {tick(cL, topDimY, 0, 1)}
        {tick(aL, topDimY, 0, 1)}
        {tick(cR, topDimY, 0, 1)}
        {tick(dL, topDimY, 0, 1)}
        {tick(dR, topDimY, 0, 1)}
        {h !== 0 && <text x={(cL + aL) / 2} y={topDimY + 12} textAnchor="middle" fontSize={10} fill="#555555">-h</text>}
        <text x={(cL + cR) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">c</text>
        {g > 0 && <text x={(cR + dL) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">g</text>}
        <text x={(dL + dR) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>

        {/* ---- end view ---- */}
        <path d={stub(eTop.x0, eTop.x1, eTop.y1, eTop.y0)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={eTop.x0 - p} y1={eTop.y0} x2={eTop.x1 + p} y2={eTop.y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={eTop.x0} y1={eTop.y0 + p} x2={eTop.x1} y2={eTop.y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={eTop.x0} y1={eTop.y1} x2={eBot.x0} y2={eBot.y0} stroke={lineColor} strokeWidth={1.6} />
        <line x1={eTop.x1} y1={eTop.y1} x2={eBot.x1} y2={eBot.y0} stroke={lineColor} strokeWidth={1.6} />
        <path d={stub(eBot.x0, eBot.x1, eBot.y0, eBot.y1)} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={eBot.x0 - p} y1={eBot.y1} x2={eBot.x1 + p} y2={eBot.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={eBot.x0} y1={eBot.y1 - p} x2={eBot.x1} y2={eBot.y1 - p} stroke={lineColor} strokeWidth={1.2} />
        {dimLine(eTop.x0, topDimY, eTop.x1, topDimY)}
        {tick(eTop.x0, topDimY, 0, 1)}
        {tick(eTop.x1, topDimY, 0, 1)}
        <text x={(eTop.x0 + eTop.x1) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">e</text>
        {dimLine(eTop.x0 - 15, eTop.y0, eTop.x0 - 15, eTop.y1)}
        {tick(eTop.x0 - 15, eTop.y0, 1, 0)}
        {tick(eTop.x0 - 15, eTop.y1, 1, 0)}
        <text x={eTop.x0 - 21} y={(eTop.y0 + eTop.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">k</text>
        {dimLine(eBot.x0 - 15, eBot.y0, eBot.x0 - 15, eBot.y1)}
        {tick(eBot.x0 - 15, eBot.y0, 1, 0)}
        {tick(eBot.x0 - 15, eBot.y1, 1, 0)}
        <text x={eBot.x0 - 21} y={(eBot.y0 + eBot.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">j</text>
        {dimLine(Math.min(eBot.x0, sx), botDimY, eBot.x1, botDimY)}
        {tick(eBot.x0, botDimY, 0, 1)}
        {tick(sx, botDimY, 0, 1)}
        {tick(eBot.x1, botDimY, 0, 1)}
        {i !== 0 && <text x={(eBot.x0 + sx) / 2} y={botDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">-i</text>}
        <text x={(eBot.x0 + eBot.x1) / 2} y={botDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">b</text>
        {dimLine(lDimX, y0, lDimX, y0 + l)}
        {tick(lDimX, y0, 1, 0)}
        {tick(lDimX, y0 + l, 1, 0)}
        <text x={lDimX + 6} y={y0 + l / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">L</text>
      </g>
    );
  };


  const renderAngledDuct = () => {
    // QD1a port of Form1.cs `if (symbol == "QD1a")` (kanał prostokątny skośny). As for
    // QD2a, Form1's local `a`/`b` are the other way round from the on-screen labels; the
    // names here follow the labels. Side view on the left: the a-wide duct leaving its
    // flange at alfa below the horizontal for a length L and cut off horizontally, the cut
    // drawn e long; end view on the right: the b-wide opening (a·cos alfa tall) with the
    // L·sin alfa drop below it and the cut drawn f wide.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let l = Math.max(toInt(values[2] || 500), 1);
    let alfa = toInt(values[3] || 45);
    if (alfa > 89) alfa = 89;
    if (alfa < 1) alfa = 1;
    let ee = Math.max(toInt(values[4] || 300), 1);
    let f = Math.max(toInt(values[5] || 200), 1);
    const A = (alfa * Math.PI) / 180;
    const sin = Math.sin(A);
    const cos = Math.cos(A);

    let p = 25;
    let maxNorm = Math.max(a, b);
    if (ee > maxNorm) maxNorm = ee;
    if (f > maxNorm) maxNorm = f;
    if (l * sin + a * cos > maxNorm) maxNorm = l * sin + a * cos;
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    if (p > maxNorm) maxNorm = p;
    if (toInt(a / sin) > maxNorm) maxNorm = toInt(a / sin);
    const mnoznik = 50;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); p = sc(p); ee = sc(ee); f = sc(f); l = sc(l);
    while (ee < 100 && b < 100 && f < 100 && toInt(a / sin) < 100) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); p = toInt(p * 1.1); f = toInt(f * 1.1); ee = toInt(ee * 1.1); l = toInt(l * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }
    const pushX = 30;
    const pushY = 15;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view (punkty2) ---------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const aCos = toInt(a * cos);
    const aSin = toInt(a * sin);
    const lCos = toInt(l * cos);
    const lSin = toInt(l * sin);
    const cut = toInt(a / sin);
    const P0 = { x: x0, y: y0 + aCos };
    const P1 = { x: x0 + aSin, y: y0 };
    const P3 = { x: x0 + lCos, y: y0 + aCos + lSin };
    const P2 = { x: P3.x + cut, y: P3.y };
    const u = { x: cos, y: sin };          // duct axis, from the flange down the duct
    const n = { x: sin, y: -cos };         // along the flange face, P0 → P1
    const cutLine = { x0: P3.x - toInt((ee - cut) / 2), x1: P2.x + toInt((ee - cut) / 2) };
    const lDim = {
      x1: P0.x - n.x * 15, y1: P0.y - n.y * 15,
      x2: P3.x - n.x * 15, y2: P3.y - n.y * 15,
    };
    const aDim = {
      x1: P0.x - u.x * 15, y1: P0.y - u.y * 15,
      x2: P1.x - u.x * 15, y2: P1.y - u.y * 15,
    };
    const arcR = 20;
    const arcEnd = { x: P2.x - arcR * cos, y: P2.y - arcR * sin };
    const sideRight = Math.max(P2.x, cutLine.x1, P1.x + 6);

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, sideRight + 6 - (190 - p + pushX));
    const ex0 = 190 + pushX + sectionShift;
    const sec = { x0: ex0, y0: y0, x1: ex0 + b, y1: y0 + aCos };
    const fl = { x0: sec.x0 - p, y0: sec.y0 - p, x1: sec.x1 + p, y1: sec.y1 + p };
    const under = { top: Math.min(fl.y1, sec.y1 + lSin), bottom: sec.y1 + lSin };
    const cutEnd = { x0: sec.x0 - toInt((f - b) / 2), x1: sec.x1 + toInt((f - b) / 2) };
    const bDimY = Math.min(sec.y0 - 15, fl.y0 - 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={`M ${P0.x} ${P0.y} L ${P1.x} ${P1.y} L ${P2.x} ${P2.y} L ${P3.x} ${P3.y} Z`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={P0.x - n.x * p} y1={P0.y - n.y * p} x2={P1.x + n.x * p} y2={P1.y + n.y * p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={P0.x + u.x * p} y1={P0.y + u.y * p} x2={P1.x + u.x * p} y2={P1.y + u.y * p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={cutLine.x0} y1={P3.y} x2={cutLine.x1} y2={P3.y} stroke={lineColor} strokeWidth={1.6} />
        {dimLine(cutLine.x0, P3.y + 15, cutLine.x1, P3.y + 15)}
        {tick(cutLine.x0, P3.y + 15, 0, 1)}
        {tick(cutLine.x1, P3.y + 15, 0, 1)}
        <text x={(cutLine.x0 + cutLine.x1) / 2} y={P3.y + 29} textAnchor="middle" fontSize={10} fill="#555555">e</text>
        {/* alfa: between the horizontal and the duct's wall at the cut's right corner */}
        <path d={`M ${P2.x - arcR} ${P2.y} A ${arcR} ${arcR} 0 0 1 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={P2.x - arcR - 4} y={P2.y - 6} textAnchor="end" fontSize={10} fill="#555555">α</text>
        {dimLine(lDim.x1, lDim.y1, lDim.x2, lDim.y2)}
        {tick(lDim.x1, lDim.y1, n.x, n.y)}
        {tick(lDim.x2, lDim.y2, n.x, n.y)}
        <text x={(lDim.x1 + lDim.x2) / 2 - n.x * 9} y={(lDim.y1 + lDim.y2) / 2 - n.y * 9 + 4} textAnchor="middle" fontSize={10} fill="#555555">L</text>
        {dimLine(aDim.x1, aDim.y1, aDim.x2, aDim.y2)}
        {tick(aDim.x1, aDim.y1, u.x, u.y)}
        {tick(aDim.x2, aDim.y2, u.x, u.y)}
        <text x={(aDim.x1 + aDim.x2) / 2 - u.x * 9} y={(aDim.y1 + aDim.y2) / 2 - u.y * 9 + 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>

        {/* ---- end view ---- */}
        <path d={`M ${sec.x0} ${under.top} L ${sec.x0} ${under.bottom} L ${sec.x1} ${under.bottom} L ${sec.x1} ${under.top}`} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <line x1={cutEnd.x0} y1={under.bottom} x2={cutEnd.x1} y2={under.bottom} stroke={lineColor} strokeWidth={1.6} />
        <rect x={fl.x0} y={fl.y0} width={fl.x1 - fl.x0} height={fl.y1 - fl.y0} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <rect x={sec.x0} y={sec.y0} width={sec.x1 - sec.x0} height={sec.y1 - sec.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        {dimLine(sec.x0, bDimY, sec.x1, bDimY)}
        {tick(sec.x0, bDimY, 0, 1)}
        {tick(sec.x1, bDimY, 0, 1)}
        <text x={(sec.x0 + sec.x1) / 2} y={bDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">b</text>
        {dimLine(cutEnd.x0, under.bottom + 15, cutEnd.x1, under.bottom + 15)}
        {tick(cutEnd.x0, under.bottom + 15, 0, 1)}
        {tick(cutEnd.x1, under.bottom + 15, 0, 1)}
        <text x={(cutEnd.x0 + cutEnd.x1) / 2} y={under.bottom + 29} textAnchor="middle" fontSize={10} fill="#555555">f</text>
      </g>
    );
  };


  const renderPerpendicularDuct = () => {
    // QD2a port of Form1.cs `if (symbol == "QD2a")` (kanał prostopadły). NOTE: Form1 reads
    // the on-screen "a" from textBox5 and "b" from textBox4, so its local `a`/`b` are the
    // other way round; the names here follow the on-screen labels. Side view on the left:
    // an a-wide, L-tall duct hanging from its flange, its bottom line drawn e wide; end
    // view on the right: the same duct b wide with its bottom line drawn f wide.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let l = Math.max(toInt(values[2] || 500), 1);
    let ee = Math.max(toInt(values[3] || 200), 1);
    let f = Math.max(toInt(values[4] || 200), 1);

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = Math.max(a, b);
    if (ee > maxNorm) maxNorm = ee;
    if (f > maxNorm) maxNorm = f;
    if (l > maxNorm) maxNorm = l;
    if (p > maxNorm) maxNorm = p;
    const mnoznik = 70;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); ee = sc(ee); f = sc(f); l = sc(l); p = sc(p);
    while (f < 110 && b < 110 && ee < 110 && a < 110 && l < 70) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); ee = toInt(ee * 1.1); f = toInt(f * 1.1); l = toInt(l * 1.1); p = toInt(p * 1.1);
      if (a === 0 || b === 0 || l === 0) break;
    }
    let pushX = toInt((150 - ee) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - l) / 2) + 5;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );
    const y0 = 20 + pushY;
    const y1 = y0 + l;
    const sx0 = 20 + pushX;
    const sx1 = sx0 + a;
    const sBot = { x0: sx0 - toInt((ee - a) / 2), x1: sx1 + toInt((ee - a) / 2) };
    const lDimX = Math.max(sx1, sBot.x1) + 15;
    const sectionShift = Math.max(0, lDimX + 14 + 6 - (190 - p + pushX));
    const ex0 = 190 + pushX + sectionShift;
    const ex1 = ex0 + b;
    const eBot = { x0: ex0 - toInt((f - b) / 2), x1: ex1 + toInt((f - b) / 2) };
    const topDimY = Math.min(y0 - 15, y0 - p - 8);

    const view = (x0: number, x1: number, bot: { x0: number; x1: number }, top: string, bottom: string) => (
      <>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={x0 - p} y1={y0} x2={x1 + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={x0} y1={y0 + p} x2={x1} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={bot.x0} y1={y1} x2={bot.x1} y2={y1} stroke={lineColor} strokeWidth={1.6} />
        {dimLine(x0, topDimY, x1, topDimY)}
        {tick(x0, topDimY, 0, 1)}
        {tick(x1, topDimY, 0, 1)}
        <text x={(x0 + x1) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">{top}</text>
        {dimLine(bot.x0, y1 + 15, bot.x1, y1 + 15)}
        {tick(bot.x0, y1 + 15, 0, 1)}
        {tick(bot.x1, y1 + 15, 0, 1)}
        <text x={(bot.x0 + bot.x1) / 2} y={y1 + 29} textAnchor="middle" fontSize={10} fill="#555555">{bottom}</text>
      </>
    );

    return (
      <g>
        {view(sx0, sx1, sBot, 'a', 'e')}
        {dimLine(lDimX, y0, lDimX, y1)}
        {tick(lDimX, y0, 1, 0)}
        {tick(lDimX, y1, 1, 0)}
        <text x={lDimX + 6} y={(y0 + y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">L</text>
        {view(ex0, ex1, eBot, 'b', 'f')}
      </g>
    );
  };


  const renderSkewTee = () => {
    // TR7a port of Form1.cs `if (symbol == "TR7a")` (trójnik skośny). Side view on the
    // left: the run (p long, h tall) enters from the left; its top wall blends with radius
    // r up into the b-wide top outlet (i tall), its bottom wall with radius q down into the
    // d-wide bottom outlet (j tall); a skew wall joins the top outlet's bottom-right corner
    // to the bottom outlet's top-right corner, e being their horizontal offset. End view on
    // the right: the three a-wide openings stacked, each in its flange.
    const toInt = (v: number) => Math.trunc(v);
    let a = Math.max(toInt(values[0] || 200), 1);
    let b = Math.max(toInt(values[1] || 200), 1);
    let d = Math.max(toInt(values[2] || 200), 1);
    let h = Math.max(toInt(values[3] || 200), 1);
    let ee = Math.max(toInt(values[4] || 150), 0);
    let r = Math.max(toInt(values[5] || 50), 0);
    let q = Math.max(toInt(values[6] || 50), 0);
    let i = Math.max(toInt(values[7] || 100), 1);
    let j = Math.max(toInt(values[8] || 100), 1);
    let ps = Math.max(toInt(values[9] || 150), 1);

    let p = 25;
    let maxNorm = Math.max(a, b);
    if (maxNorm > 1000) p = 30;
    if (maxNorm > 2501) p = 40;
    if (p > maxNorm) maxNorm = p;
    if (i > maxNorm) maxNorm = i;
    if (j > maxNorm) maxNorm = j;
    if (d > maxNorm) maxNorm = d;
    if (h + j + q + r + i > maxNorm) maxNorm = h + j + q + r + i;
    if (ps + b + ee > maxNorm) maxNorm = ps + b + ee;
    const mnoznik = 70;
    const sc = (v: number) => toInt((v / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); d = sc(d); h = sc(h); i = sc(i); j = sc(j); ps = sc(ps); p = sc(p); q = sc(q); r = sc(r); ee = sc(ee);
    while ((ps + b + ee) < 100 && (h + j + q + r + i) < 60) {
      a = toInt(a * 1.1); b = toInt(b * 1.1); d = toInt(d * 1.1); h = toInt(h * 1.1); i = toInt(i * 1.1); j = toInt(j * 1.1);
      ps = toInt(ps * 1.1); p = toInt(p * 1.1); q = toInt(q * 1.1); r = toInt(r * 1.1); ee = toInt(ee * 1.1);
      if (a === 0 || b === 0 || h === 0) break;
    }
    if (q < 1) q = 1;
    if (r < 1) r = 1;
    let pushX = 130 - ps - b - ee;
    if (pushX < 0) pushX = 10;
    let pushY = 85 - i - r - h - q - j;
    if (pushY < 0) pushY = 10;

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view -------------------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const run = { x0: x0, y0: y0 + i + r, x1: x0 + ps, y1: y0 + i + r + h };
    const qc = { x: run.x1, y: run.y1 + q };
    const low = { x0: run.x1 + q, y0: run.y1 + q, x1: run.x1 + q + d, y1: run.y1 + q + j };
    const up = { x0: low.x1 - ee - b, y0: y0, x1: low.x1 - ee, y1: y0 + i };
    const rc = { x: up.x0 - r, y: up.y1 };
    const outline = [
      `M ${run.x1} ${run.y0} L ${run.x0} ${run.y0} L ${run.x0} ${run.y1} L ${run.x1} ${run.y1}`,
      `A ${q} ${q} 0 0 1 ${low.x0} ${low.y0}`,
      `L ${low.x0} ${low.y1} L ${low.x1} ${low.y1} L ${low.x1} ${low.y0}`,
      `L ${up.x1} ${up.y1} L ${up.x1} ${up.y0} L ${up.x0} ${up.y0} L ${up.x0} ${up.y1}`,
      `A ${r} ${r} 0 0 1 ${rc.x} ${rc.y + r}`,
      `L ${run.x1} ${run.y0}`,
    ].join(' ');
    const sideRight = Math.max(low.x1 + p, up.x1 + 15 + 14, up.x1 + ee);

    // ---- end view --------------------------------------------------------------
    const sectionShift = Math.max(0, sideRight + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const H = i + r + h + q + j;
    const top = { y0: y0, y1: y0 + i + r - p };
    const mid = { y0: y0 + i + r, y1: y0 + i + r + h };
    const bot = { y0: mid.y1 + p, y1: y0 + H };
    const aDimY = Math.min(y0 - 15, y0 - p - 8);

    return (
      <g>
        {/* ---- side view ---- */}
        <path d={outline} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={run.x0} y1={run.y0 - p} x2={run.x0} y2={run.y1 + p} stroke={lineColor} strokeWidth={1.4} />
        <line x1={run.x0 + p} y1={run.y0} x2={run.x0 + p} y2={run.y1} stroke={lineColor} strokeWidth={1.2} />
        <line x1={low.x0 - p} y1={low.y1} x2={low.x1 + p} y2={low.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={low.x0} y1={low.y1 - p} x2={low.x1} y2={low.y1 - p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={up.x0 - p} y1={up.y0} x2={up.x1 + p} y2={up.y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={up.x0} y1={up.y0 + p} x2={up.x1} y2={up.y0 + p} stroke={lineColor} strokeWidth={1.2} />
        {/* q / r leaders */}
        <line x1={qc.x} y1={qc.y} x2={qc.x + q} y2={qc.y - q} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={qc.x + q + 4} y={qc.y - q - 4} textAnchor="start" fontSize={10} fill="#555555">q</text>
        <line x1={rc.x} y1={rc.y} x2={rc.x + r} y2={rc.y + r} stroke="#9b9b9b" strokeWidth={0.9} />
        <text x={rc.x + r + 4} y={rc.y + r + 12} textAnchor="start" fontSize={10} fill="#555555">r</text>
        {/* p (run length), h, d, j, i, b, e */}
        {dimLine(run.x0, run.y0 - 15, run.x1, run.y0 - 15)}
        {tick(run.x0, run.y0 - 15, 0, 1)}
        {tick(run.x1, run.y0 - 15, 0, 1)}
        <text x={(run.x0 + run.x1) / 2} y={run.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">p</text>
        {dimLine(run.x0 - 15, run.y0, run.x0 - 15, run.y1)}
        {tick(run.x0 - 15, run.y0, 1, 0)}
        {tick(run.x0 - 15, run.y1, 1, 0)}
        <text x={run.x0 - 21} y={(run.y0 + run.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">h</text>
        {dimLine(low.x0, low.y1 + 15, low.x1, low.y1 + 15)}
        {tick(low.x0, low.y1 + 15, 0, 1)}
        {tick(low.x1, low.y1 + 15, 0, 1)}
        <text x={(low.x0 + low.x1) / 2} y={low.y1 + 29} textAnchor="middle" fontSize={10} fill="#555555">d</text>
        {dimLine(low.x0 - 15, low.y0, low.x0 - 15, low.y1)}
        {tick(low.x0 - 15, low.y0, 1, 0)}
        {tick(low.x0 - 15, low.y1, 1, 0)}
        <text x={low.x0 - 21} y={(low.y0 + low.y1) / 2 + 4} textAnchor="end" fontSize={10} fill="#555555">j</text>
        {dimLine(up.x1 + 15, up.y0, up.x1 + 15, up.y1)}
        {tick(up.x1 + 15, up.y0, 1, 0)}
        {tick(up.x1 + 15, up.y1, 1, 0)}
        <text x={up.x1 + 21} y={(up.y0 + up.y1) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">i</text>
        {dimLine(up.x0, up.y0 - 15, up.x1, up.y0 - 15)}
        {tick(up.x0, up.y0 - 15, 0, 1)}
        {tick(up.x1, up.y0 - 15, 0, 1)}
        <text x={(up.x0 + up.x1) / 2} y={up.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">b</text>
        {ee > 0 && (
          <>
            {dimLine(up.x1, up.y0 - 15, low.x1, up.y0 - 15)}
            {tick(low.x1, up.y0 - 15, 0, 1)}
            <text x={(up.x1 + low.x1) / 2} y={up.y0 - 19} textAnchor="middle" fontSize={10} fill="#555555">e</text>
          </>
        )}

        {/* ---- end view ---- */}
        <path d={`M ${sx} ${top.y1} L ${sx} ${top.y0} L ${sx + a} ${top.y0} L ${sx + a} ${top.y1}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx - p} y1={top.y0} x2={sx + a + p} y2={top.y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx} y1={top.y0 + p} x2={sx + a} y2={top.y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <rect x={sx} y={mid.y0} width={a} height={mid.y1 - mid.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <rect x={sx - p} y={mid.y0 - p} width={a + 2 * p} height={mid.y1 - mid.y0 + 2 * p} fill="none" stroke={lineColor} strokeWidth={1.2} />
        <path d={`M ${sx} ${bot.y0} L ${sx} ${bot.y1} L ${sx + a} ${bot.y1} L ${sx + a} ${bot.y0}`} fill="none" stroke={lineColor} strokeWidth={1.6} />
        <line x1={sx - p} y1={bot.y1} x2={sx + a + p} y2={bot.y1} stroke={lineColor} strokeWidth={1.4} />
        <line x1={sx} y1={bot.y1 - p} x2={sx + a} y2={bot.y1 - p} stroke={lineColor} strokeWidth={1.2} />
        {dimLine(sx, aDimY, sx + a, aDimY)}
        {tick(sx, aDimY, 0, 1)}
        {tick(sx + a, aDimY, 0, 1)}
        <text x={sx + a / 2} y={aDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">a</text>
      </g>
    );
  };


  const renderCoaxialLike = (round: boolean) => {
    // Port of Form1.cs `if (symbol == "TR8a")` (trójnik skośny współosiowy, w×g branch) and
    // `"TR9a"` (the same with a round d1 branch and separate i / j stubs). Side view on
    // the left: a skewed transition from the c-wide top opening (stub i) to the a-wide
    // bottom opening (stub j) whose right edge is m right of the top's; the branch leaves
    // the left wall perpendicularly, e below the top stub, l3 long. End view on the right:
    // the d-wide top opening to the b-wide bottom one, n back from the top's right edge,
    // with the branch f from the bottom-left corner.
    const toInt = (v: number) => Math.trunc(v);
    const v = (k: number, dflt: number) => Math.max(toInt(values[k] || dflt), 1);
    let a = v(0, 300), b = v(1, 200), c = v(2, 300), d = v(3, 200);
    let w = round ? v(4, 150) : v(4, 150);
    let g = round ? w : v(5, 150);
    let l = round ? v(5, 600) : v(6, 600);
    let l3 = round ? v(6, 150) : v(7, 150);
    let m = round ? toInt(values[7] ?? 0) : toInt(values[8] ?? 0);
    let n = round ? toInt(values[8] ?? 0) : toInt(values[9] ?? 0);
    let ee = round ? v(9, 250) : v(10, 250);
    let f = round ? v(10, 100) : v(11, 100);
    let i = round ? v(11, 50) : v(12, 50);
    let j = round ? v(12, 50) : i;

    let p = 25;
    if (l > 1000) p = 30;
    if (l > 2501) p = 40;
    let maxNorm = l;
    if (c + m > maxNorm) maxNorm = c + m;
    const mnoznik = 60;
    const sc = (x: number) => toInt((x / maxNorm) * mnoznik);
    a = sc(a); b = sc(b); c = sc(c); d = sc(d); w = sc(w); g = sc(g); l = sc(l); l3 = sc(l3);
    m = sc(m); n = sc(n); ee = sc(ee); f = sc(f); i = sc(i); j = sc(j); p = sc(p);
    let pushX = toInt(((110 - b) % 110) / 2);
    if (pushX < 0) pushX = -pushX;
    const pushY = toInt((90 - l) / 2);

    const tick = (px: number, py: number, dx: number, dy: number) => (
      <line x1={px - dx * 3} y1={py - dy * 3} x2={px + dx * 3} y2={py + dy * 3} stroke="#9b9b9b" strokeWidth={0.9} />
    );

    // ---- side view (punkty2) ---------------------------------------------------
    const x0 = 20 + pushX;
    const y0 = 20 + pushY;
    const yBot = y0 + l;
    const S0 = { x: x0, y: y0 + i };
    const S1 = { x: x0 + c, y: y0 + i };
    const S2 = { x: x0 + c + m, y: yBot - j };
    const S3 = { x: x0 + c + m - a, y: yBot - j };
    const alfa = Math.atan((c - a + m) / Math.max(l - i - j, 1));
    const sinA = Math.sin(alfa);
    const cosA = Math.cos(alfa);
    const w1 = toInt(Math.cos(alfa) * w);
    const wdir = { x: sinA, y: cosA };        // down the left wall
    const nrm = { x: -cosA, y: sinA };        // out of the left wall
    const wallX = (y: number) => S0.x + (y - S0.y) * Math.tan(alfa);
    const p1 = { y: y0 + i + ee - w1 / 2, x: 0 };
    p1.x = wallX(p1.y);
    const p2 = { y: p1.y + w1, x: 0 };
    p2.x = wallX(p2.y);
    const p4 = { x: p1.x + nrm.x * l3, y: p1.y + nrm.y * l3 };
    const p3 = { x: p2.x + nrm.x * l3, y: p2.y + nrm.y * l3 };
    const sideRight = Math.max(S1.x, S2.x) + 20 + 14;
    const topDimY = Math.min(y0 - 20, y0 - p - 8);
    const botDimY = yBot + Math.max(20, p + 8);

    // ---- end view (punkty) ---------------------------------------------------
    const sectionShift = Math.max(0, sideRight + 6 - (190 - p + pushX));
    const sx = 190 + pushX + sectionShift;
    const T0 = { x: sx, y: y0 + i };
    const T1 = { x: sx + d, y: y0 + i };
    const B2 = { x: sx + d - n, y: yBot - j };
    const B3 = { x: sx + d - n - b, y: yBot - j };
    const brC = { x: B3.x + f, y: y0 + i + ee };
    const br = { x0: brC.x - g / 2, y0: brC.y - w1 / 2, x1: brC.x + g / 2, y1: brC.y + w1 / 2 };
    const lDimX = Math.max(B2.x, T1.x) + 15;
    const gDimY = (round ? brC.y - w / 2 : br.y0 - p) - 10;

    return (
      <g>
        {/* ---- side view ---- */}
        <line x1={S0.x} y1={S0.y} x2={S3.x} y2={S3.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S1.x} y1={S1.y} x2={S2.x} y2={S2.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S0.x} y1={S0.y} x2={S0.x} y2={y0} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S1.x} y1={S1.y} x2={S1.x} y2={y0} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S0.x - p} y1={y0} x2={S1.x + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={S0.x} y1={y0 + p} x2={S1.x} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={S3.x} y1={S3.y} x2={S3.x} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S2.x} y1={S2.y} x2={S2.x} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={S3.x - p} y1={yBot} x2={S2.x + p} y2={yBot} stroke={lineColor} strokeWidth={1.4} />
        <line x1={S3.x} y1={yBot - p} x2={S2.x} y2={yBot - p} stroke={lineColor} strokeWidth={1.2} />
        {/* branch off the left wall */}
        <line x1={p1.x} y1={p1.y} x2={p4.x} y2={p4.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke={lineColor} strokeWidth={1.6} />
        {round ? (
          <line x1={p4.x} y1={p4.y} x2={p3.x} y2={p3.y} stroke={lineColor} strokeWidth={1.4} />
        ) : (
          <>
            <line x1={p4.x - wdir.x * p} y1={p4.y - wdir.y * p} x2={p3.x + wdir.x * p} y2={p3.y + wdir.y * p} stroke={lineColor} strokeWidth={1.4} />
            <line x1={p4.x - nrm.x * p} y1={p4.y - nrm.y * p} x2={p3.x - nrm.x * p} y2={p3.y - nrm.y * p} stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        {/* c, i, j, a, m, e, w/d1, l3 */}
        {dimLine(S0.x, topDimY, S1.x, topDimY)}
        {tick(S0.x, topDimY, 0, 1)}
        {tick(S1.x, topDimY, 0, 1)}
        <text x={(S0.x + S1.x) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">c</text>
        {dimLine(S1.x + 20, y0, S1.x + 20, S1.y)}
        {tick(S1.x + 20, y0, 1, 0)}
        {tick(S1.x + 20, S1.y, 1, 0)}
        <text x={S1.x + 26} y={(y0 + S1.y) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">{round ? 'i' : 'i=j'}</text>
        {dimLine(S2.x + 20, S2.y, S2.x + 20, yBot)}
        {tick(S2.x + 20, S2.y, 1, 0)}
        {tick(S2.x + 20, yBot, 1, 0)}
        <text x={S2.x + 26} y={(S2.y + yBot) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">{round ? 'j' : 'i=j'}</text>
        {dimLine(S3.x, botDimY, S2.x, botDimY)}
        {tick(S3.x, botDimY, 0, 1)}
        {tick(S2.x, botDimY, 0, 1)}
        <text x={(S3.x + S2.x) / 2} y={botDimY + 14} textAnchor="middle" fontSize={10} fill="#555555">a</text>
        {m !== 0 && (
          <>
            {dimLine(S1.x, topDimY - 14, S2.x, topDimY - 14)}
            {tick(S1.x, topDimY - 14, 0, 1)}
            {tick(S2.x, topDimY - 14, 0, 1)}
            <text x={(S1.x + S2.x) / 2} y={topDimY - 18} textAnchor="middle" fontSize={10} fill="#555555">m</text>
          </>
        )}
        {dimLine(x0 + c / 2, S0.y, x0 + c / 2, S0.y + ee)}
        {tick(x0 + c / 2, S0.y, 1, 0)}
        {tick(x0 + c / 2, S0.y + ee, 1, 0)}
        <text x={x0 + c / 2 + 6} y={S0.y + ee / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">e</text>
        <text x={(p4.x + p3.x) / 2 + nrm.x * 12} y={(p4.y + p3.y) / 2 + nrm.y * 12 + 4} textAnchor="middle" fontSize={10} fill="#555555">{round ? 'd1' : 'w'}</text>
        {dimLine(p2.x + wdir.x * 15, p2.y + wdir.y * 15, p3.x + wdir.x * 15, p3.y + wdir.y * 15)}
        {tick(p2.x + wdir.x * 15, p2.y + wdir.y * 15, wdir.x, wdir.y)}
        {tick(p3.x + wdir.x * 15, p3.y + wdir.y * 15, wdir.x, wdir.y)}
        <text x={(p2.x + p3.x) / 2 + wdir.x * 24} y={(p2.y + p3.y) / 2 + wdir.y * 24 + 4} textAnchor="middle" fontSize={10} fill="#555555">l3</text>

        {/* ---- end view ---- */}
        <line x1={T0.x} y1={T0.y} x2={B3.x} y2={B3.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={T1.x} y1={T1.y} x2={B2.x} y2={B2.y} stroke={lineColor} strokeWidth={1.6} />
        <line x1={T0.x} y1={T0.y} x2={T0.x} y2={y0} stroke={lineColor} strokeWidth={1.6} />
        <line x1={T1.x} y1={T1.y} x2={T1.x} y2={y0} stroke={lineColor} strokeWidth={1.6} />
        <line x1={T0.x - p} y1={y0} x2={T1.x + p} y2={y0} stroke={lineColor} strokeWidth={1.4} />
        <line x1={T0.x} y1={y0 + p} x2={T1.x} y2={y0 + p} stroke={lineColor} strokeWidth={1.2} />
        <line x1={B3.x} y1={B3.y} x2={B3.x} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={B2.x} y1={B2.y} x2={B2.x} y2={yBot} stroke={lineColor} strokeWidth={1.6} />
        <line x1={B3.x - p} y1={yBot} x2={B2.x + p} y2={yBot} stroke={lineColor} strokeWidth={1.4} />
        <line x1={B3.x} y1={yBot - p} x2={B2.x} y2={yBot - p} stroke={lineColor} strokeWidth={1.2} />
        {round ? (
          <circle cx={brC.x} cy={brC.y} r={w / 2} fill="none" stroke={lineColor} strokeWidth={1.6} />
        ) : (
          <>
            <rect x={br.x0} y={br.y0} width={br.x1 - br.x0} height={br.y1 - br.y0} fill="none" stroke={lineColor} strokeWidth={1.6} />
            <rect x={br.x0 - p} y={br.y0 - p} width={br.x1 - br.x0 + 2 * p} height={br.y1 - br.y0 + 2 * p} fill="none" stroke={lineColor} strokeWidth={1.2} />
          </>
        )}
        {dimLine(T0.x, topDimY, T1.x, topDimY)}
        {tick(T0.x, topDimY, 0, 1)}
        {tick(T1.x, topDimY, 0, 1)}
        <text x={(T0.x + T1.x) / 2} y={topDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">d</text>
        {dimLine(lDimX, y0, lDimX, yBot)}
        {tick(lDimX, y0, 1, 0)}
        {tick(lDimX, yBot, 1, 0)}
        <text x={lDimX + 6} y={(y0 + yBot) / 2 + 4} textAnchor="start" fontSize={10} fill="#555555">l</text>
        {dimLine(B3.x, botDimY, B3.x + f, botDimY)}
        {tick(B3.x, botDimY, 0, 1)}
        {tick(B3.x + f, botDimY, 0, 1)}
        <text x={B3.x + f / 2} y={botDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">f</text>
        {dimLine(B3.x, botDimY + 16, B2.x, botDimY + 16)}
        {tick(B3.x, botDimY + 16, 0, 1)}
        {tick(B2.x, botDimY + 16, 0, 1)}
        <text x={(B3.x + B2.x) / 2} y={botDimY + 30} textAnchor="middle" fontSize={10} fill="#555555">b</text>
        {n !== 0 && (
          <>
            {dimLine(B2.x, botDimY + 16, T1.x, botDimY + 16)}
            {tick(T1.x, botDimY + 16, 0, 1)}
            <text x={(B2.x + T1.x) / 2} y={botDimY + 30} textAnchor="middle" fontSize={10} fill="#555555">n</text>
          </>
        )}
        {dimLine(brC.x - g / 2, gDimY, brC.x + g / 2, gDimY)}
        {tick(brC.x - g / 2, gDimY, 0, 1)}
        {tick(brC.x + g / 2, gDimY, 0, 1)}
        <text x={brC.x} y={gDimY - 4} textAnchor="middle" fontSize={10} fill="#555555">{round ? 'd1' : 'g'}</text>
      </g>
    );
  };


  const renderCoaxialTee = () => renderCoaxialLike(true);


  const renderCoaxialSkewTee = () => renderCoaxialLike(false);


  return (
    <div className="shape-diagram" style={backgroundColor ? { backgroundColor } : undefined}>
      <svg viewBox={viewBox} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="8" refY="2.5" orient="auto">
            <polygon points="0 0, 8 2.5, 0 5" fill="#555555" />
          </marker>
          <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="0" refY="2.5" orient="auto">
            <polygon points="8 0, 0 2.5, 8 5" fill="#555555" />
          </marker>
        </defs>
        <g ref={contentRef}>{renderShape()}</g>
      </svg>
    </div>
  );
};

export default ShapeDiagram;
