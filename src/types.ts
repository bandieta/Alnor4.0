// Shape/element definition
export interface ShapeDefinition {
  symbol: string;
  name: string;
  labels: string[]; // dimension labels for this shape, e.g. ["a [mm]", "b [mm]", "L [mm]", ...]
}

// A single shape instance with all properties
export interface Ksztaltka {
  obcy: boolean;
  symbol: string;
  oznaczenie: string;     // designation number
  nazwa: string;          // name
  sztuk: string;          // quantity
  uwagi: string;          // notes
  przekroj: string;       // cross-section e.g. "300x200"
  material: string;       // material coating
  
  // Chemical material options
  materialChemo: string;
  gruboscChemo: string;
  wykonanieChemo: string;
  isChemo: boolean;

  // Project info
  Qnazwa: string;
  Qzamawia: string;
  Qdata: string;

  blacha: string;             // sheet thickness
  wykonanie: string;           // execution type
  klasa_szczelnosci: string;   // seal class
  l_wzmoc: string;             // reinforcement
  ramkawl: string;             // frame WL
  ramkawyl: string;            // frame WYL
  ramkaod: string;             // frame Od

  powierznia: string;          // surface area m²
  powierzniaIz: string;        // insulated surface area
  pelny_symbol: string;        // full symbol string
  pelny_symbolIz: string;      // full insulated symbol

  izolowana: boolean;          // is insulated
  plaszcz: string;             // outer coating
  gruboscIlozacji: string;     // insulation thickness

  tab: string[];               // numeric dimension values [0..16]
}

// Grid row for the data table
export interface GridRow {
  id: string;
  oznaczenie: string;    // designation
  nazwa: string;         // name
  symbol: string;        // full symbol
  sztuk: number;         // quantity
  material: string;      // material
  m2: number;            // area m²
  przekroj: string;      // cross-section
  uwagi: string;         // notes
  shapeSymbol: string;   // shape type symbol (e.g. "CZ2a")
  tab: string[];         // dimension values
  ksztaltka: Ksztaltka;  // full shape data
}

export type SystemType = 'prostokatne' | 'prostokatne_izolowane' | 'element_uzytkownika';

export type MaterialType = 'blacha' | 'chemo';

export interface ProjectInfo {
  nazwa: string;
  zamawia: string;
  data: string;
}
