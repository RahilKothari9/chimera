import { describe, it, expect } from 'vitest';
import {
  convert,
  formatResult,
  getUnitsByCategory,
  getCategoryLabel,
  UNIT_GROUPS,
} from './unitConverter';

describe('unitConverter', () => {
  describe('convert – length', () => {
    it('converts metres to kilometres', () => {
      expect(convert(1000, 'm', 'km', 'length')).toBeCloseTo(1);
    });

    it('converts kilometres to miles', () => {
      expect(convert(1, 'km', 'mi', 'length')).toBeCloseTo(0.621371, 4);
    });

    it('converts inches to centimetres', () => {
      expect(convert(1, 'in', 'cm', 'length')).toBeCloseTo(2.54, 5);
    });

    it('converts feet to metres', () => {
      expect(convert(1, 'ft', 'm', 'length')).toBeCloseTo(0.3048, 5);
    });

    it('returns same value when from === to', () => {
      expect(convert(42, 'm', 'm', 'length')).toBe(42);
    });
  });

  describe('convert – weight', () => {
    it('converts kilograms to pounds', () => {
      expect(convert(1, 'kg', 'lb', 'weight')).toBeCloseTo(2.20462, 4);
    });

    it('converts grams to ounces', () => {
      expect(convert(100, 'g', 'oz', 'weight')).toBeCloseTo(3.52740, 4);
    });

    it('converts metric tonnes to kilograms', () => {
      expect(convert(1, 't', 'kg', 'weight')).toBeCloseTo(1000, 3);
    });
  });

  describe('convert – temperature', () => {
    it('converts Celsius to Fahrenheit (0°C = 32°F)', () => {
      expect(convert(0, '°C', '°F', 'temperature')).toBeCloseTo(32, 5);
    });

    it('converts Celsius to Fahrenheit (100°C = 212°F)', () => {
      expect(convert(100, '°C', '°F', 'temperature')).toBeCloseTo(212, 5);
    });

    it('converts Fahrenheit to Celsius (32°F = 0°C)', () => {
      expect(convert(32, '°F', '°C', 'temperature')).toBeCloseTo(0, 5);
    });

    it('converts Celsius to Kelvin (0°C = 273.15K)', () => {
      expect(convert(0, '°C', 'K', 'temperature')).toBeCloseTo(273.15, 4);
    });

    it('converts Kelvin to Celsius (0K = -273.15°C)', () => {
      expect(convert(0, 'K', '°C', 'temperature')).toBeCloseTo(-273.15, 4);
    });
  });

  describe('convert – area', () => {
    it('converts square metres to square feet', () => {
      expect(convert(1, 'm²', 'ft²', 'area')).toBeCloseTo(10.7639, 3);
    });

    it('converts hectares to acres', () => {
      expect(convert(1, 'ha', 'ac', 'area')).toBeCloseTo(2.47105, 4);
    });
  });

  describe('convert – volume', () => {
    it('converts litres to gallons (US)', () => {
      expect(convert(1, 'L', 'gal', 'volume')).toBeCloseTo(0.264172, 4);
    });

    it('converts cups to millilitres', () => {
      expect(convert(1, 'cup', 'ml', 'volume')).toBeCloseTo(236.588, 2);
    });
  });

  describe('convert – speed', () => {
    it('converts km/h to mph', () => {
      expect(convert(100, 'km/h', 'mph', 'speed')).toBeCloseTo(62.1371, 3);
    });

    it('converts m/s to km/h', () => {
      expect(convert(1, 'm/s', 'km/h', 'speed')).toBeCloseTo(3.6, 5);
    });
  });

  describe('convert – time', () => {
    it('converts hours to minutes', () => {
      expect(convert(1, 'h', 'min', 'time')).toBeCloseTo(60, 5);
    });

    it('converts days to seconds', () => {
      expect(convert(1, 'd', 's', 'time')).toBeCloseTo(86400, 5);
    });

    it('converts weeks to days', () => {
      expect(convert(1, 'wk', 'd', 'time')).toBeCloseTo(7, 5);
    });
  });

  describe('convert – data', () => {
    it('converts kilobytes to bytes', () => {
      expect(convert(1, 'KB', 'B', 'data')).toBeCloseTo(1024, 5);
    });

    it('converts gigabytes to megabytes', () => {
      expect(convert(1, 'GB', 'MB', 'data')).toBeCloseTo(1024, 5);
    });
  });

  describe('convert – error handling', () => {
    it('throws for unknown unit symbols', () => {
      expect(() => convert(1, 'xyz', 'm', 'length')).toThrow();
    });
  });

  describe('formatResult', () => {
    it('formats zero', () => {
      expect(formatResult(0)).toBe('0');
    });

    it('formats a normal number', () => {
      expect(formatResult(1.5)).toBe('1.5');
    });

    it('formats a large number in exponential notation', () => {
      const result = formatResult(1e16);
      expect(result).toContain('e');
    });

    it('formats a tiny number in exponential notation', () => {
      const result = formatResult(1e-7);
      expect(result).toContain('e');
    });

    it('returns "Invalid" for Infinity', () => {
      expect(formatResult(Infinity)).toBe('Invalid');
    });

    it('returns "Invalid" for NaN', () => {
      expect(formatResult(NaN)).toBe('Invalid');
    });
  });

  describe('getUnitsByCategory', () => {
    it('returns all length units', () => {
      const units = getUnitsByCategory('length');
      expect(units.length).toBeGreaterThan(0);
      expect(units.some(u => u.symbol === 'm')).toBe(true);
      expect(units.some(u => u.symbol === 'km')).toBe(true);
    });

    it('returns all temperature units', () => {
      const units = getUnitsByCategory('temperature');
      expect(units.some(u => u.symbol === '°C')).toBe(true);
      expect(units.some(u => u.symbol === '°F')).toBe(true);
      expect(units.some(u => u.symbol === 'K')).toBe(true);
    });
  });

  describe('getCategoryLabel', () => {
    it('returns human-readable label for each category', () => {
      expect(getCategoryLabel('length')).toBe('Length');
      expect(getCategoryLabel('temperature')).toBe('Temperature');
      expect(getCategoryLabel('data')).toBe('Digital Storage');
    });
  });

  describe('UNIT_GROUPS', () => {
    it('has all expected categories', () => {
      const categories = Object.keys(UNIT_GROUPS);
      expect(categories).toContain('length');
      expect(categories).toContain('weight');
      expect(categories).toContain('temperature');
      expect(categories).toContain('area');
      expect(categories).toContain('volume');
      expect(categories).toContain('speed');
      expect(categories).toContain('time');
      expect(categories).toContain('data');
    });

    it('each unit group has a label and at least 2 units', () => {
      for (const key of Object.keys(UNIT_GROUPS)) {
        const group = UNIT_GROUPS[key as keyof typeof UNIT_GROUPS];
        expect(group.label).toBeTruthy();
        expect(group.units.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('each unit has toBase and fromBase functions', () => {
      for (const key of Object.keys(UNIT_GROUPS)) {
        const group = UNIT_GROUPS[key as keyof typeof UNIT_GROUPS];
        for (const unit of group.units) {
          expect(typeof unit.toBase).toBe('function');
          expect(typeof unit.fromBase).toBe('function');
        }
      }
    });

    it('toBase and fromBase are inverse operations', () => {
      for (const key of Object.keys(UNIT_GROUPS)) {
        const group = UNIT_GROUPS[key as keyof typeof UNIT_GROUPS];
        for (const unit of group.units) {
          const input = 42;
          const roundTrip = unit.fromBase(unit.toBase(input));
          expect(roundTrip).toBeCloseTo(input, 6);
        }
      }
    });
  });
});
