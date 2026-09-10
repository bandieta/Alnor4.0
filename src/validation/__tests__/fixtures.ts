// "Known good" dimension sets — one per shape. Every value satisfies all rules
// for that shape (order === src/data.ts label order). Used as the baseline the
// per-shape specs start from before introducing a single violation.

export const GOOD: Record<string, number[]> = {
  //        a    b    L
  QDa: [300, 200, 500],
  //        a    b    e   f   r
  QBa: [300, 200, 50, 50, 0],
  //         a    b    e   f   r   alfa
  QBNa: [300, 200, 50, 50, 0, 60],
  //          a    b    c    d    L    h   m
  QPR6a: [300, 200, 250, 180, 500, 30, 30],
  //         a    b    d    L    h   m
  PR1a: [300, 200, 150, 500, 30, 30],
  //         a    b    d    L    e   f   h   m
  PR7a: [300, 200, 150, 500, 50, 50, 30, 30],
  //          a    b    c    d    L    h   m   e   f
  QPR2a: [300, 200, 250, 180, 500, 30, 30, 50, 50],
  //         a    d    b    e   f   r   alfa
  QBRa: [300, 200, 180, 50, 50, 0, 60],
  //          a    d    c    b    e   f   r   g    alfa
  QBR1a: [300, 250, 200, 180, 50, 50, 0, 100, 60],
  //          a    b    d    e   f   r
  QBFRa: [300, 200, 250, 50, 50, 0],
  //         a    b    e   f   r
  QBFa: [300, 200, 50, 50, 0],
  //         a    b    e
  QESa: [300, 200, 50],
  //         a    b    d    w    L    e   f   l3
  TR1a: [250, 300, 140, 180, 500, 50, 50, 80],
  //         a    b    d    L    l3  e   f
  TR2a: [300, 250, 140, 500, 80, 50, 50],
  //        a    b    d    h    L    q    r    i    p
  TRa: [300, 250, 200, 100, 800, 100, 100, 100, 100],
  //          a    b    e    L    m   h
  QPR3a: [300, 200, 100, 500, 30, 30],
  //          a    b    d    e    L    m   h
  QPR4a: [300, 200, 150, 100, 500, 30, 30],
  //         a    e    f    L    g
  TR6a: [400, 100, 200, 500, 100],
  //         a    b    d   w   L    d1   w1  e1   f1   e    f    l3  l4
  CZ1a: [200, 250, 140, 90, 500, 140, 90, 250, 110, 250, 110, 80, 80],
  //         a    b    d    L    d1   e1   f1   e    f    l3  l4
  CZ2a: [200, 250, 140, 500, 140, 250, 110, 250, 110, 80, 80],
  //         a    b    c    d    m    k    i    j    g    f
  TR3a: [500, 300, 300, 200, 100, 100, 100, 100, 150, 150],
  //         a    b    c    d    L    g    i   j
  TR4a: [300, 300, 250, 200, 800, 150, 50, 50],
  //         a    b    c    d    e    L    h    g    i   j   k
  TR5a: [300, 250, 200, 200, 100, 600, 100, 100, 50, 50, 50],
  //         a    b    L    alfa e   f
  QD1a: [300, 200, 500, 60, 50, 50],
  //         a    b    L    e   f
  QD2a: [300, 200, 500, 50, 50],
  //         a    b    d    h    e    r    q    i   j   p
  TR7a: [300, 180, 250, 100, 100, 100, 100, 50, 50, 100],
  //         a    b    c    d    w    g    l    l3   m    n    e    f    i=j
  TR8a: [300, 250, 300, 250, 150, 100, 500, 100, 100, 100, 100, 100, 100],
  //         a    b    c    d    d1   l    l3   m    n    e    f    i    j
  TR9a: [300, 250, 300, 250, 150, 500, 100, 100, 100, 100, 100, 100, 100],
};
