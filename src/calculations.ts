// Thickness calculator - auto-select sheet thickness based on largest dimension
export function calculateThickness(material: string, bokA: number, bokB: number): number {
  const a = Math.max(bokA, bokB);

  if (material === 'PVC') {
    if (a <= 499) return 4;
    if (a <= 799) return 5;
    if (a <= 999) return 6;
    if (a <= 1199) return 8;
    if (a <= 1500) return 10;
    return 12;
  }

  if (a <= 400) return 4;
  if (a <= 600) return 5;
  if (a <= 800) return 6;
  if (a <= 1000) return 8;
  if (a <= 1200) return 10;
  return 12;
}

// Surface area calculation functions (Blacha.cs port)
// All return area in m²

export function rozwiniecie_QDa(a: number, b: number, l: number): number {
  return (2 * (a + b) * l) / 1_000_000;
}

export function rozwiniecie_QBa(a: number, b: number, f: number, e: number, r: number): number {
  return (2 * (a + b) * (Math.PI / 2 * (r + b) + e + f)) / 1_000_000;
}

export function rozwiniecie_QBNa(a: number, b: number, f: number, e: number, alfa: number, r: number): number {
  return (2 * (a + b) * (alfa * Math.PI / 180 * (r + b) + e + f)) / 1_000_000;
}

export function rozwiniecie_QPR6a(a: number, b: number, l: number, c: number, d: number, p: number): number {
  if (c + d > a + b) {
    return (2 * (c + d) * Math.sqrt(l * l + p * p)) / 1_000_000;
  }
  return (2 * (a + b) * Math.sqrt(l * l + p * p)) / 1_000_000;
}

export function rozwiniecie_QPR1a(a: number, b: number, l: number, d: number): number {
  const pp = Math.max((b - d) / 2, (a - d) / 2);
  const pp0 = Math.max(2 * (a + b), Math.PI * d);
  return pp0 * Math.sqrt(l * l + pp * pp) / 1_000_000;
}

export function rozwiniecie_PR7a(a: number, b: number, l: number, d: number, e: number, f: number): number {
  let pp = Math.max(Math.abs(b - d + e), Math.abs(e));
  pp = Math.max(pp, Math.abs(a - d + f));
  pp = Math.max(pp, Math.abs(f));
  const ll1 = Math.sqrt(l * l + pp * pp);
  const pp0 = Math.max(2 * (a + b), Math.PI * d);
  return pp0 * ll1 / 1_000_000;
}

export function rozwiniecie_QPR2a(a: number, b: number, l: number, c: number, d: number, e: number, f: number): number {
  let pp = Math.max(Math.abs(b - d + e), Math.abs(e));
  pp = Math.max(pp, Math.abs(a - c + f));
  pp = Math.max(pp, Math.abs(f));
  const ll1 = Math.sqrt(l * l + pp * pp);
  return 2 * (a + b) * ll1 / 1_000_000;
}

export function rozwiniecie_QESa(a: number, b: number): number {
  return (a * b) / 1_000_000;
}

export function rozwiniecie_QBFRa(a: number, b: number, d: number, e: number, f: number): number {
  return (2 * (a + b) * (b + d + e + f)) / 1_000_000;
}

export function rozwiniecie_QBFa(a: number, b: number, d: number, e: number, f: number): number {
  return (2 * (a + b) * (b + d + e + f)) / 1_000_000;
}

export function rozwiniecie_QBRa(a: number, b: number, e: number, f: number, alfa: number, r: number): number {
  return 2 * (a + b) * ((alfa / 180.0) * Math.PI * (r + b) + e + f) / 1_000_000;
}

export function rozwiniecie_QBR1a(a: number, b: number, e: number, f: number, alfa: number, r: number): number {
  return 2 * (a + b) * ((alfa / 180.0) * Math.PI * (r + b) + e + f) / 1_000_000;
}

export function rozwiniecie_TR1a(a: number, b: number, d: number, w: number, B: number, l: number): number {
  return (2 * (a + b) * l + 2 * (w + d) * B) / 1_000_000;
}

export function rozwiniecie_TR2a(a: number, b: number, d: number, B: number, l: number): number {
  return (2 * (a + b) * l + Math.PI * d * B) / 1_000_000;
}

export function rozwiniecie_CZ1a(a: number, b: number, B: number, B1: number, d: number, w: number, d1: number, w1: number, l: number): number {
  return (2 * (a + b) * l + 2 * (w + d) * B + 2 * (w1 + d1) * B1) / 1_000_000;
}

export function rozwiniecie_CZ2a(a: number, b: number, B: number, B1: number, d: number, d1: number, l: number): number {
  return (2 * (a + b) * l + Math.PI * d * B + Math.PI * d1 * B1) / 1_000_000;
}

export function rozwiniecie_QD2a(a: number, b: number, l: number): number {
  return (2 * (a + b) * l) / 1_000_000;
}

export function rozwiniecie_QD1a(a: number, b: number, l: number, alfa: number): number {
  return (2 * (a + b) * (l + b / Math.tan(alfa * Math.PI / 180.0))) / 1_000_000;
}

export function rozwiniecie_TR6a(a: number, e: number, f: number, g: number): number {
  return (2 * (e + f) * (g + (a - Math.sqrt(a * a - f * f) / 2))) / 1_000_000;
}

export function rozwiniecie_TRa(a: number, b: number, l: number, r: number, d: number, h: number, p: number): number {
  const m = b + r + p - d;
  return (2 * (a + b) * l + 2 * (a + h) * m) / 1_000_000;
}

export function rozwiniecie_TR4a(a: number, b: number, d: number, i: number, j: number, g: number, l: number): number {
  return (2 * (b + g + j) * l + 2 * a * (Math.PI * (g + d) / 2 + i + j)) / 1_000_000;
}

export function rozwiniecie_TR7a(a: number, b: number, d: number, h: number, i: number, j: number, e: number, r: number, q: number, p: number): number {
  const pq = h + r + i + q + j;
  return (2 * (a + d) * Math.sqrt(pq * pq + e * e) + 2 * (a + h) * (d + q + p - e - b)) / 1_000_000;
}

export function rozwiniecie_TR5a(a: number, b: number, l: number, i: number): number {
  return (2 * a + 4 * b) * Math.sqrt(l * l + i * i) / 1_000_000;
}

export function rozwiniecie_QPR3a(a: number, b: number, e: number, l: number): number {
  return (2 * (a + b) * Math.sqrt(l * l + e * e)) / 1_000_000;
}

export function rozwiniecie_QPR4a(a: number, b: number, d: number, e: number, l: number): number {
  let val: number;
  if (b - d + e >= e) {
    val = 2 * (a + b) * Math.sqrt(l * l + (b - d + e) * (b - d + e));
  } else {
    val = 2 * (a + b) * Math.sqrt(l * l + e * e);
  }
  return val / 1_000_000;
}

export function rozwiniecie_TR3a(a: number, b: number, c: number, d: number, m: number, k: number, i: number, g: number, f: number): number {
  let pp = c + f + k;
  if (c < d) pp = d + g + k;
  return (2 * (b + g + m + f + i) * pp + 2 * a * ((Math.PI * (f + c) / 2 + k + i) + (Math.PI * (g + d) / 2 + k + m))) / 1_000_000;
}

export function rozwiniecie_TR8(a: number, b: number, c: number, d: number, w: number, g: number, l: number, l3: number, m: number, n: number): number {
  let ab = a + a + b + b;
  let pp = Math.sqrt(m * m + l * l);
  if (a + b < c + d) ab = c + c + d + d;
  if (m < n) pp = Math.sqrt(n * n + l * l);
  return (ab * pp + 2 * (w + g) * l3) / 1_000_000;
}

export function rozwiniecie_TR9a(a: number, b: number, c: number, d: number, d1: number, l: number, l3: number, m: number, n: number): number {
  let ab = a + a + b + b;
  let pp = Math.sqrt(m * m + l * l);
  if (a + b < c + d) ab = c + c + d + d;
  if (m < n) pp = Math.sqrt(n * n + l * l);
  return (ab * pp + 2 * Math.PI * d1 * l3) / 1_000_000;
}

// Calculate area for a given shape type and its dimension values
export function calculateArea(symbol: string, tab: number[]): number {
  try {
    switch (symbol) {
      case 'QDa':
        return rozwiniecie_QDa(tab[0], tab[1], tab[2]);
      case 'QBa':
        return rozwiniecie_QBa(tab[0], tab[1], tab[3], tab[2], tab[4]);
      case 'QBNa':
        return rozwiniecie_QBNa(tab[0], tab[1], tab[3], tab[2], tab[5], tab[4]);
      case 'QPR6a':
        return rozwiniecie_QPR6a(tab[0], tab[1], tab[4], tab[2], tab[3], tab[6]);
      case 'PR1a':
        return rozwiniecie_QPR1a(tab[0], tab[1], tab[3], tab[2]);
      case 'PR7a':
        return rozwiniecie_PR7a(tab[0], tab[1], tab[3], tab[2], tab[4], tab[5]);
      case 'QPR2a':
        return rozwiniecie_QPR2a(tab[0], tab[1], tab[4], tab[2], tab[3], tab[7], tab[8]);
      case 'QBRa':
        return rozwiniecie_QBRa(tab[0], tab[2], tab[3], tab[4], tab[6], tab[5]);
      case 'QBR1a':
        return rozwiniecie_QBR1a(tab[0], tab[3], tab[4], tab[5], tab[8], tab[6]);
      case 'QBFRa':
        return rozwiniecie_QBFRa(tab[0], tab[1], tab[2], tab[3], tab[4]);
      case 'QBFa':
        return rozwiniecie_QBFa(tab[0], tab[1], tab[1], tab[2], tab[3]);
      case 'QESa':
        return rozwiniecie_QESa(tab[0], tab[1]);
      case 'TR1a':
        return rozwiniecie_TR1a(tab[0], tab[1], tab[2], tab[3], tab[4], tab[7]);
      case 'TR2a':
        return rozwiniecie_TR2a(tab[0], tab[1], tab[2], tab[4], tab[3]);
      case 'TRa':
        return rozwiniecie_TRa(tab[0], tab[1], tab[4], tab[6], tab[2], tab[3], tab[8]);
      case 'QPR3a':
        return rozwiniecie_QPR3a(tab[0], tab[1], tab[2], tab[3]);
      case 'QPR4a':
        return rozwiniecie_QPR4a(tab[0], tab[1], tab[2], tab[3], tab[4]);
      case 'TR6a':
        return rozwiniecie_TR6a(tab[0], tab[1], tab[2], tab[4]);
      case 'CZ1a':
        return rozwiniecie_CZ1a(tab[0], tab[1], tab[11], tab[12], tab[2], tab[3], tab[5], tab[6], tab[4]);
      case 'CZ2a':
        return rozwiniecie_CZ2a(tab[0], tab[1], tab[9], tab[10], tab[2], tab[4], tab[3]);
      case 'TR3a':
        return rozwiniecie_TR3a(tab[0], tab[1], tab[2], tab[3], tab[4], tab[5], tab[6], tab[8], tab[9]);
      case 'TR4a':
        return rozwiniecie_TR4a(tab[0], tab[1], tab[3], tab[6], tab[7], tab[5], tab[4]);
      case 'TR5a':
        return rozwiniecie_TR5a(tab[0], tab[1], tab[5], tab[8]);
      case 'QD1a':
        return rozwiniecie_QD1a(tab[0], tab[1], tab[2], tab[3]);
      case 'QD2a':
        return rozwiniecie_QD2a(tab[0], tab[1], tab[2]);
      case 'TR7a':
        return rozwiniecie_TR7a(tab[0], tab[1], tab[2], tab[3], tab[7], tab[8], tab[4], tab[5], tab[6], tab[9]);
      case 'TR8a':
        return rozwiniecie_TR8(tab[0], tab[1], tab[2], tab[3], tab[4], tab[5], tab[6], tab[7], tab[8], tab[9]);
      case 'TR9a':
        return rozwiniecie_TR9a(tab[0], tab[1], tab[2], tab[3], tab[4], tab[5], tab[6], tab[7], tab[8]);
      default:
        return 0;
    }
  } catch {
    return 0;
  }
}

// Generate the full symbol string for a shape
export function generateSymbol(
  shapeSymbol: string,
  material: string,
  wykonanie: string,
  tab: number[]
): string {
  const materialCode = material === 'Aluminium' ? 'A' : material === 'Kwasówka' ? 'KW' : 'OCY';
  const wykonanieCode = wykonanie === 'Niskociśnieniowe' ? 'N' : 'S';
  
  const dims = tab.filter(v => v > 0).join('-');
  return `${shapeSymbol}-${wykonanieCode}-${materialCode}-${dims}`;
}

// Generate cross-section string
export function generatePrzekroj(tab: number[], _symbol: string): string {
  if (tab[0] > 0 && tab[1] > 0) {
    return `${tab[0]}x${tab[1]}`;
  }
  if (tab[0] > 0) {
    return `${tab[0]}`;
  }
  return '';
}
