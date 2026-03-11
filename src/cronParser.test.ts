import { describe, it, expect } from 'vitest';
import {
  parseCronExpression,
  validateCronExpression,
  describeCronExpression,
  getNextExecutions,
  CRON_PRESETS,
  CRON_FIELDS,
} from './cronParser';

describe('parseCronExpression', () => {
  it('parses a 5-field expression correctly', () => {
    const result = parseCronExpression('*/5 0 1 * 1');
    expect(result).not.toBeNull();
    expect(result!.minute).toBe('*/5');
    expect(result!.hour).toBe('0');
    expect(result!.dayOfMonth).toBe('1');
    expect(result!.month).toBe('*');
    expect(result!.dayOfWeek).toBe('1');
  });

  it('returns null for expressions with wrong field count', () => {
    expect(parseCronExpression('* * * *')).toBeNull();
    expect(parseCronExpression('* * * * * *')).toBeNull();
    expect(parseCronExpression('')).toBeNull();
  });

  it('handles extra whitespace', () => {
    const result = parseCronExpression('  0   12   *   *   1  ');
    expect(result).not.toBeNull();
    expect(result!.minute).toBe('0');
    expect(result!.hour).toBe('12');
  });
});

describe('validateCronExpression', () => {
  it('validates a wildcard expression as valid', () => {
    const result = validateCronExpression('* * * * *');
    expect(result.valid).toBe(true);
    expect(result.descriptions).toHaveLength(5);
  });

  it('validates a standard preset expression', () => {
    const result = validateCronExpression('0 9 * * 1-5');
    expect(result.valid).toBe(true);
  });

  it('returns invalid for wrong number of fields', () => {
    const result = validateCronExpression('* * * *');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5 fields/);
  });

  it('returns invalid for out-of-range minute', () => {
    const result = validateCronExpression('60 * * * *');
    expect(result.valid).toBe(false);
    expect(result.descriptions[0].valid).toBe(false);
  });

  it('returns invalid for out-of-range hour', () => {
    const result = validateCronExpression('0 25 * * *');
    expect(result.valid).toBe(false);
    expect(result.descriptions[1].valid).toBe(false);
  });

  it('returns invalid for out-of-range day of month', () => {
    const result = validateCronExpression('0 0 32 * *');
    expect(result.valid).toBe(false);
    expect(result.descriptions[2].valid).toBe(false);
  });

  it('returns invalid for out-of-range month', () => {
    const result = validateCronExpression('0 0 * 13 *');
    expect(result.valid).toBe(false);
    expect(result.descriptions[3].valid).toBe(false);
  });

  it('returns invalid for out-of-range day of week', () => {
    const result = validateCronExpression('0 0 * * 8');
    expect(result.valid).toBe(false);
    expect(result.descriptions[4].valid).toBe(false);
  });

  it('validates step expressions', () => {
    expect(validateCronExpression('*/5 * * * *').valid).toBe(true);
    expect(validateCronExpression('*/15 * * * *').valid).toBe(true);
    expect(validateCronExpression('0 */6 * * *').valid).toBe(true);
  });

  it('validates range expressions', () => {
    expect(validateCronExpression('0 9 * * 1-5').valid).toBe(true);
    expect(validateCronExpression('0 9-17 * * *').valid).toBe(true);
  });

  it('validates list expressions', () => {
    expect(validateCronExpression('0 9,12,18 * * *').valid).toBe(true);
    expect(validateCronExpression('0 0 1,15 * *').valid).toBe(true);
  });

  it('validates month aliases (JAN, FEB, etc.)', () => {
    expect(validateCronExpression('0 0 1 JAN *').valid).toBe(true);
    expect(validateCronExpression('0 0 1 DEC *').valid).toBe(true);
  });

  it('validates day-of-week aliases (MON, TUE, etc.)', () => {
    expect(validateCronExpression('0 9 * * MON').valid).toBe(true);
    expect(validateCronExpression('0 9 * * MON-FRI').valid).toBe(true);
  });

  it('validates day-of-week 7 (Sunday alias)', () => {
    expect(validateCronExpression('0 0 * * 7').valid).toBe(true);
  });

  it('provides a description for each field', () => {
    const result = validateCronExpression('0 12 * * 1');
    expect(result.descriptions[0].field).toBe('Minute');
    expect(result.descriptions[1].field).toBe('Hour');
    expect(result.descriptions[2].field).toBe('Day of Month');
    expect(result.descriptions[3].field).toBe('Month');
    expect(result.descriptions[4].field).toBe('Day of Week');
  });

  it('returns invalid step value', () => {
    const result = validateCronExpression('*/0 * * * *');
    expect(result.valid).toBe(false);
  });

  it('returns invalid for reversed range', () => {
    const result = validateCronExpression('0 17-9 * * *');
    expect(result.valid).toBe(false);
  });
});

describe('describeCronExpression', () => {
  it('describes every minute expression', () => {
    const desc = describeCronExpression('* * * * *');
    expect(desc.toLowerCase()).toContain('every minute');
  });

  it('describes every 5 minutes expression', () => {
    const desc = describeCronExpression('*/5 * * * *');
    expect(desc.toLowerCase()).toContain('5');
  });

  it('describes daily at midnight', () => {
    const desc = describeCronExpression('0 0 * * *');
    expect(desc.toLowerCase()).toMatch(/midnight|12:00 am/i);
  });

  it('describes weekday expression', () => {
    const desc = describeCronExpression('0 9 * * 1-5');
    expect(desc).toBeTruthy();
    expect(typeof desc).toBe('string');
  });

  it('returns "Invalid expression" for bad input', () => {
    const desc = describeCronExpression('invalid');
    expect(desc).toBe('Invalid expression');
  });

  it('describes a monthly expression', () => {
    const desc = describeCronExpression('0 0 1 * *');
    expect(desc).toBeTruthy();
  });
});

describe('getNextExecutions', () => {
  const referenceDate = new Date('2024-01-15T10:00:00.000Z'); // Monday

  it('returns an array of Date objects', () => {
    const results = getNextExecutions('* * * * *', 3, referenceDate);
    expect(results).toHaveLength(3);
    results.forEach((d) => expect(d).toBeInstanceOf(Date));
  });

  it('returns empty array for invalid expression', () => {
    const results = getNextExecutions('invalid expression', 5, referenceDate);
    expect(results).toHaveLength(0);
  });

  it('returns the correct count of executions', () => {
    const results = getNextExecutions('* * * * *', 5, referenceDate);
    expect(results).toHaveLength(5);
  });

  it('returns executions in ascending order', () => {
    const results = getNextExecutions('*/10 * * * *', 5, referenceDate);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].getTime()).toBeGreaterThan(results[i - 1].getTime());
    }
  });

  it('returns dates in the future relative to fromDate', () => {
    const results = getNextExecutions('* * * * *', 3, referenceDate);
    results.forEach((d) => {
      expect(d.getTime()).toBeGreaterThan(referenceDate.getTime());
    });
  });

  it('handles hourly expression', () => {
    const results = getNextExecutions('0 * * * *', 3, referenceDate);
    expect(results).toHaveLength(3);
    results.forEach((d) => expect(d.getMinutes()).toBe(0));
  });

  it('handles daily expression', () => {
    const results = getNextExecutions('0 0 * * *', 3, referenceDate);
    expect(results).toHaveLength(3);
    results.forEach((d) => {
      expect(d.getUTCHours() === 0 || d.getHours() === 0).toBeTruthy();
    });
  });

  it('handles minute-list expression', () => {
    const results = getNextExecutions('0,30 * * * *', 4, referenceDate);
    expect(results).toHaveLength(4);
    results.forEach((d) => {
      expect([0, 30]).toContain(d.getMinutes());
    });
  });

  it('handles specific day-of-week expression', () => {
    const results = getNextExecutions('0 9 * * 1', 2, referenceDate);
    expect(results).toHaveLength(2);
    results.forEach((d) => expect(d.getDay()).toBe(1)); // Monday
  });

  it('returns default 5 executions when count omitted', () => {
    const results = getNextExecutions('* * * * *');
    expect(results).toHaveLength(5);
  });
});

describe('CRON_PRESETS', () => {
  it('contains at least 10 presets', () => {
    expect(CRON_PRESETS.length).toBeGreaterThanOrEqual(10);
  });

  it('each preset has label, expression, and description', () => {
    CRON_PRESETS.forEach((preset) => {
      expect(preset.label).toBeTruthy();
      expect(preset.expression).toBeTruthy();
      expect(preset.description).toBeTruthy();
    });
  });

  it('all preset expressions are valid', () => {
    CRON_PRESETS.forEach((preset) => {
      const result = validateCronExpression(preset.expression);
      expect(result.valid, `Preset "${preset.label}" (${preset.expression}) should be valid`).toBe(true);
    });
  });
});

describe('CRON_FIELDS', () => {
  it('contains exactly 5 fields', () => {
    expect(CRON_FIELDS).toHaveLength(5);
  });

  it('defines correct ranges for each field', () => {
    expect(CRON_FIELDS[0]).toMatchObject({ name: 'Minute', min: 0, max: 59 });
    expect(CRON_FIELDS[1]).toMatchObject({ name: 'Hour', min: 0, max: 23 });
    expect(CRON_FIELDS[2]).toMatchObject({ name: 'Day of Month', min: 1, max: 31 });
    expect(CRON_FIELDS[3]).toMatchObject({ name: 'Month', min: 1, max: 12 });
    expect(CRON_FIELDS[4]).toMatchObject({ name: 'Day of Week', min: 0, max: 7 });
  });

  it('provides month aliases', () => {
    expect(CRON_FIELDS[3].aliases).toBeDefined();
    expect(CRON_FIELDS[3].aliases!['JAN']).toBe(1);
    expect(CRON_FIELDS[3].aliases!['DEC']).toBe(12);
  });

  it('provides day-of-week aliases', () => {
    expect(CRON_FIELDS[4].aliases).toBeDefined();
    expect(CRON_FIELDS[4].aliases!['MON']).toBe(1);
    expect(CRON_FIELDS[4].aliases!['SUN']).toBe(0);
  });
});
