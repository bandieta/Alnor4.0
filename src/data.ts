import type { ShapeDefinition } from './types';

// All 28 shape definitions with their dimension labels
export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  {
    symbol: 'QDa',
    name: 'Kanał prostokątny',
    labels: ['a [mm]', 'b [mm]', 'L [mm]'],
  },
  {
    symbol: 'QBa',
    name: 'Łuk symetryczny',
    labels: ['a [mm]', 'b [mm]', 'e [mm]', 'f [mm]', 'r [mm]'],
  },
  {
    symbol: 'QBNa',
    name: 'Łuk symetryczny',
    labels: ['a [mm]', 'b [mm]', 'e [mm]', 'f [mm]', 'r [mm]', 'alfa'],
  },
  {
    symbol: 'QPR6a',
    name: 'Redukcja sym.',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'L [mm]', 'h [mm]', 'm [mm]'],
  },
  {
    symbol: 'PR1a',
    name: 'Redukcja kwadrat-koło sym.',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'L [mm]', 'h [mm]', 'm [mm]'],
  },
  {
    symbol: 'PR7a',
    name: 'Redukcja kwadrat-koło asym.',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'L [mm]', 'e [mm]', 'f [mm]', 'h [mm]', 'm [mm]'],
  },
  {
    symbol: 'QPR2a',
    name: 'Redukcja asym.',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'L [mm]', 'h [mm]', 'm [mm]', 'e [mm]', 'f [mm]'],
  },
  {
    symbol: 'QBRa',
    name: 'Łuk redukcyjny',
    labels: ['a [mm]', 'd [mm]', 'b [mm]', 'e [mm]', 'f [mm]', 'r [mm]', 'alfa'],
  },
  {
    symbol: 'QBR1a',
    name: 'Łuk dyfuzorowany',
    labels: ['a [mm]', 'd [mm]', 'c [mm]', 'b [mm]', 'e [mm]', 'f [mm]', 'r [mm]', 'g [mm]', 'alfa'],
  },
  {
    symbol: 'QBFRa',
    name: 'Kolano redukcyjne',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'e [mm]', 'f [mm]', 'r [mm]'],
  },
  {
    symbol: 'QBFa',
    name: 'Kolano symetryczne',
    labels: ['a [mm]', 'b [mm]', 'e [mm]', 'f [mm]', 'r [mm]'],
  },
  {
    symbol: 'QESa',
    name: 'Zaślepka prostokątna',
    labels: ['a [mm]', 'b [mm]', 'e [mm]'],
  },
  {
    symbol: 'TR1a',
    name: 'Trójnik z odej. prostokątnym',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'w [mm]', 'L [mm]', 'e [mm]', 'f [mm]', 'l3 [mm]'],
  },
  {
    symbol: 'TR2a',
    name: 'Trójnik z odej. okrągłymi',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'L [mm]', 'l3 [mm]', 'e [mm]', 'f [mm]'],
  },
  {
    symbol: 'TRa',
    name: 'Trójnik symetryczny',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'h [mm]', 'L [mm]', 'q [mm]', 'r [mm]', 'i [mm]', 'p [mm]'],
  },
  {
    symbol: 'QPR3a',
    name: 'Odsadzka sym.',
    labels: ['a [mm]', 'b [mm]', 'e [mm]', 'L [mm]', 'm [mm]', 'h [mm]'],
  },
  {
    symbol: 'QPR4a',
    name: 'Odsadzka asym.',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'e [mm]', 'L [mm]', 'm [mm]', 'h [mm]'],
  },
  {
    symbol: 'TR6a',
    name: 'Nakładka na rurę',
    labels: ['a [mm]', 'e [mm]', 'f [mm]', 'L [mm]', 'g [mm]'],
  },
  {
    symbol: 'CZ1a',
    name: 'Czwórnik z odej. prostokątnym',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'w [mm]', 'L [mm]', 'd1 [mm]', 'w1 [mm]', 'e1 [mm]', 'f1 [mm]', 'e [mm]', 'f [mm]', 'l3 [mm]', 'l4 [mm]'],
  },
  {
    symbol: 'CZ2a',
    name: 'Czwórnik z odej. okrągłymi',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'L [mm]', 'd1 [mm]', 'e1 [mm]', 'f1 [mm]', 'e [mm]', 'f [mm]', 'l3 [mm]', 'l4 [mm]'],
  },
  {
    symbol: 'TR3a',
    name: 'Trójnik orłowy',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'm [mm]', 'k [mm]', 'i [mm]', 'j [mm]', 'g [mm]', 'f [mm]'],
  },
  {
    symbol: 'TR4a',
    name: 'Trójnik z od. łukowym',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'L [mm]', 'g [mm]', 'i [mm]', 'j [mm]'],
  },
  {
    symbol: 'TR5a',
    name: 'Trójnik portkowy',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'e [mm]', 'L [mm]', 'h [mm]', 'g [mm]', 'i [mm]', 'j [mm]', 'k [mm]'],
  },
  {
    symbol: 'QD1a',
    name: 'Kanał prost. skośny',
    labels: ['a [mm]', 'b [mm]', 'L [mm]', 'alfa', 'e [mm]', 'f [mm]'],
  },
  {
    symbol: 'QD2a',
    name: 'Kanał prostopadły',
    labels: ['a [mm]', 'b [mm]', 'L [mm]', 'e [mm]', 'f [mm]'],
  },
  {
    symbol: 'TR7a',
    name: 'Trójnik skośny',
    labels: ['a [mm]', 'b [mm]', 'd [mm]', 'h [mm]', 'e [mm]', 'r [mm]', 'q [mm]', 'i [mm]', 'j [mm]', 'p [mm]'],
  },
  {
    symbol: 'TR8a',
    name: 'Trójnik sk.współosiowy',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'w [mm]', 'g [mm]', 'l [mm]', 'l3 [mm]', 'm [mm]', 'n [mm]', 'e [mm]', 'f [mm]', 'i=j[mm]'],
  },
  {
    symbol: 'TR9a',
    name: 'Trójnik sk.współosiowy',
    labels: ['a [mm]', 'b [mm]', 'c [mm]', 'd [mm]', 'd1 [mm]', 'l [mm]', 'l3 [mm]', 'm [mm]', 'n [mm]', 'e [mm]', 'f [mm]', 'i [mm]', 'j [mm]'],
  },
];

// Material options
export const MATERIAL_OPTIONS = ['Ocynk', 'Kwasówka', 'Aluminium'];

// Sheet thickness options
export const BLACHA_OPTIONS = ['0,6', '0,7', '0,8', '0,9', '1,0', '1,1'];

// Execution type options
export const WYKONANIE_OPTIONS = ['Niskociśnieniowe', 'Średniociśnieniowe'];

// Seal class options
export const KLASA_SZCZELNOSCI_OPTIONS = ['A', 'B'];

// Reinforcement options
export const WZMOCNIENIE_OPTIONS = ['standard', '0', '1', '2', '3', '1krzyżowe', '2krzyżowe'];

// Frame options
export const RAMKI_WL_OPTIONS = ['P20', 'P30', 'P40'];
export const RAMKI_WYL_OPTIONS = ['P20', 'P30', 'P40'];
export const RAMKI_OD_OPTIONS = ['P20', 'P30', 'P40'];

// Outer coating options (for insulated)
export const PLASZCZ_OPTIONS = ['Ocynk', 'Kwasówka', 'Aluminium', 'Bez Płaszcza'];

// Insulation thickness options
export const GRUBOSC_IZOLACJI_OPTIONS = ['50 mm', '100 mm'];

// Chemical material options
export const MATERIAL_CHEMO_OPTIONS = ['PVC', 'PP', 'PPs', 'PE'];

// Chemical thickness options
export const GRUBOSC_CHEMO_OPTIONS = ['4', '5', '6', '8', '10', '12'];

// Chemical execution options
export const WYKONANIE_CHEMO_OPTIONS = ['Mufy', 'Kołnierze'];
