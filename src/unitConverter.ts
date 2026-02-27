export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data';

export interface Unit {
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface UnitGroup {
  label: string;
  units: Unit[];
}

export const UNIT_GROUPS: Record<UnitCategory, UnitGroup> = {
  length: {
    label: 'Length',
    units: [
      { label: 'Millimetre', symbol: 'mm', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { label: 'Centimetre', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
      { label: 'Metre', symbol: 'm', toBase: v => v, fromBase: v => v },
      { label: 'Kilometre', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { label: 'Inch', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { label: 'Foot', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { label: 'Yard', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { label: 'Mile', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    ],
  },
  weight: {
    label: 'Weight / Mass',
    units: [
      { label: 'Milligram', symbol: 'mg', toBase: v => v / 1_000_000, fromBase: v => v * 1_000_000 },
      { label: 'Gram', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { label: 'Kilogram', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { label: 'Metric tonne', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { label: 'Ounce', symbol: 'oz', toBase: v => v * 0.028349523125, fromBase: v => v / 0.028349523125 },
      { label: 'Pound', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
    ],
  },
  temperature: {
    label: 'Temperature',
    units: [
      { label: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
      { label: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      { label: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  area: {
    label: 'Area',
    units: [
      { label: 'Square millimetre', symbol: 'mm²', toBase: v => v / 1_000_000, fromBase: v => v * 1_000_000 },
      { label: 'Square centimetre', symbol: 'cm²', toBase: v => v / 10_000, fromBase: v => v * 10_000 },
      { label: 'Square metre', symbol: 'm²', toBase: v => v, fromBase: v => v },
      { label: 'Square kilometre', symbol: 'km²', toBase: v => v * 1_000_000, fromBase: v => v / 1_000_000 },
      { label: 'Square inch', symbol: 'in²', toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
      { label: 'Square foot', symbol: 'ft²', toBase: v => v * 0.09290304, fromBase: v => v / 0.09290304 },
      { label: 'Acre', symbol: 'ac', toBase: v => v * 4046.8564224, fromBase: v => v / 4046.8564224 },
      { label: 'Hectare', symbol: 'ha', toBase: v => v * 10_000, fromBase: v => v / 10_000 },
    ],
  },
  volume: {
    label: 'Volume',
    units: [
      { label: 'Millilitre', symbol: 'ml', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { label: 'Litre', symbol: 'L', toBase: v => v, fromBase: v => v },
      { label: 'Teaspoon (US)', symbol: 'tsp', toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
      { label: 'Tablespoon (US)', symbol: 'tbsp', toBase: v => v * 0.01478676, fromBase: v => v / 0.01478676 },
      { label: 'Fluid ounce (US)', symbol: 'fl oz', toBase: v => v * 0.02957353, fromBase: v => v / 0.02957353 },
      { label: 'Cup (US)', symbol: 'cup', toBase: v => v * 0.2365882, fromBase: v => v / 0.2365882 },
      { label: 'Pint (US)', symbol: 'pt', toBase: v => v * 0.4731765, fromBase: v => v / 0.4731765 },
      { label: 'Quart (US)', symbol: 'qt', toBase: v => v * 0.9463529, fromBase: v => v / 0.9463529 },
      { label: 'Gallon (US)', symbol: 'gal', toBase: v => v * 3.7854118, fromBase: v => v / 3.7854118 },
    ],
  },
  speed: {
    label: 'Speed',
    units: [
      { label: 'Metres per second', symbol: 'm/s', toBase: v => v, fromBase: v => v },
      { label: 'Kilometres per hour', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { label: 'Miles per hour', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { label: 'Knots', symbol: 'kn', toBase: v => v * 0.5144444, fromBase: v => v / 0.5144444 },
      { label: 'Feet per second', symbol: 'ft/s', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    ],
  },
  time: {
    label: 'Time',
    units: [
      { label: 'Millisecond', symbol: 'ms', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { label: 'Second', symbol: 's', toBase: v => v, fromBase: v => v },
      { label: 'Minute', symbol: 'min', toBase: v => v * 60, fromBase: v => v / 60 },
      { label: 'Hour', symbol: 'h', toBase: v => v * 3600, fromBase: v => v / 3600 },
      { label: 'Day', symbol: 'd', toBase: v => v * 86400, fromBase: v => v / 86400 },
      { label: 'Week', symbol: 'wk', toBase: v => v * 604800, fromBase: v => v / 604800 },
      { label: 'Year (365d)', symbol: 'yr', toBase: v => v * 31_536_000, fromBase: v => v / 31_536_000 },
    ],
  },
  data: {
    label: 'Digital Storage',
    units: [
      { label: 'Byte', symbol: 'B', toBase: v => v, fromBase: v => v },
      { label: 'Kilobyte', symbol: 'KB', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { label: 'Megabyte', symbol: 'MB', toBase: v => v * 1024 ** 2, fromBase: v => v / 1024 ** 2 },
      { label: 'Gigabyte', symbol: 'GB', toBase: v => v * 1024 ** 3, fromBase: v => v / 1024 ** 3 },
      { label: 'Terabyte', symbol: 'TB', toBase: v => v * 1024 ** 4, fromBase: v => v / 1024 ** 4 },
      { label: 'Petabyte', symbol: 'PB', toBase: v => v * 1024 ** 5, fromBase: v => v / 1024 ** 5 },
    ],
  },
};

export function convert(
  value: number,
  fromSymbol: string,
  toSymbol: string,
  category: UnitCategory
): number {
  const group = UNIT_GROUPS[category];
  const from = group.units.find(u => u.symbol === fromSymbol);
  const to = group.units.find(u => u.symbol === toSymbol);
  if (!from || !to) throw new Error(`Unknown unit symbols: ${fromSymbol}, ${toSymbol}`);
  if (fromSymbol === toSymbol) return value;
  const base = from.toBase(value);
  return to.fromBase(base);
}

export function formatResult(value: number): string {
  if (!isFinite(value)) return 'Invalid';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) {
    return value.toExponential(6);
  }
  // Up to 10 significant figures, strip trailing zeros
  const formatted = parseFloat(value.toPrecision(10)).toString();
  return formatted;
}

export function getUnitsByCategory(category: UnitCategory): Unit[] {
  return UNIT_GROUPS[category].units;
}

export function getCategoryLabel(category: UnitCategory): string {
  return UNIT_GROUPS[category].label;
}
