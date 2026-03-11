export interface CronField {
  name: string;
  min: number;
  max: number;
  aliases?: Record<string, number>;
}

export interface ParsedCronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface CronDescription {
  field: string;
  raw: string;
  description: string;
  valid: boolean;
}

export interface CronValidationResult {
  valid: boolean;
  error?: string;
  descriptions: CronDescription[];
}

export interface CronPreset {
  label: string;
  expression: string;
  description: string;
}

export const CRON_FIELDS: CronField[] = [
  { name: 'Minute', min: 0, max: 59 },
  { name: 'Hour', min: 0, max: 23 },
  { name: 'Day of Month', min: 1, max: 31 },
  {
    name: 'Month',
    min: 1,
    max: 12,
    aliases: {
      JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
      JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
    },
  },
  {
    name: 'Day of Week',
    min: 0,
    max: 7,
    aliases: {
      SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
    },
  },
];

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every minute', expression: '* * * * *', description: 'Runs every minute' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { label: 'Every hour', expression: '0 * * * *', description: 'Runs at the start of every hour' },
  { label: 'Every 6 hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
  { label: 'Daily at midnight', expression: '0 0 * * *', description: 'Runs at midnight every day' },
  { label: 'Daily at noon', expression: '0 12 * * *', description: 'Runs at noon every day' },
  { label: 'Every Monday', expression: '0 9 * * 1', description: 'Runs at 9:00 AM every Monday' },
  { label: 'Weekdays at 9am', expression: '0 9 * * 1-5', description: 'Runs at 9:00 AM Mon-Fri' },
  { label: 'First of month', expression: '0 0 1 * *', description: 'Runs at midnight on the 1st of each month' },
  { label: 'Every Sunday midnight', expression: '0 0 * * 0', description: 'Runs at midnight every Sunday' },
  { label: 'Twice daily', expression: '0 9,18 * * *', description: 'Runs at 9:00 AM and 6:00 PM' },
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function resolveAliases(value: string, aliases?: Record<string, number>): string {
  if (!aliases) return value;
  return value.toUpperCase().replace(/[A-Z]+/g, (m) => {
    return aliases[m] !== undefined ? String(aliases[m]) : m;
  });
}

function parseFieldValue(raw: string, field: CronField): { valid: boolean; error?: string } {
  const value = resolveAliases(raw, field.aliases);
  const { min, max } = field;

  if (value === '*') return { valid: true };

  // List: a,b,c or a,b-c,...
  if (value.includes(',')) {
    const parts = value.split(',');
    for (const part of parts) {
      const result = parseFieldValue(part, { ...field, aliases: undefined });
      if (!result.valid) return { valid: false, error: `Invalid list item "${part}": ${result.error}` };
    }
    return { valid: true };
  }

  // Step: */n or a-b/n
  if (value.includes('/')) {
    const [range, stepStr] = value.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step < 1) return { valid: false, error: `Invalid step value "${stepStr}"` };
    if (range !== '*') {
      const result = parseRangeOrNumber(range, min, max);
      if (!result.valid) return result;
    }
    return { valid: true };
  }

  // Range: a-b
  if (value.includes('-')) {
    return parseRangeOrNumber(value, min, max);
  }

  // Single number
  const num = parseInt(value, 10);
  if (isNaN(num)) return { valid: false, error: `"${value}" is not a valid number` };
  if (num < min || num > max) {
    return { valid: false, error: `Value ${num} is out of range [${min}-${max}]` };
  }
  return { valid: true };
}

function parseRangeOrNumber(value: string, min: number, max: number): { valid: boolean; error?: string } {
  if (value.includes('-')) {
    const [startStr, endStr] = value.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) return { valid: false, error: `Invalid range "${value}"` };
    if (start < min || start > max) return { valid: false, error: `Range start ${start} out of range [${min}-${max}]` };
    if (end < min || end > max) return { valid: false, error: `Range end ${end} out of range [${min}-${max}]` };
    if (start > end) return { valid: false, error: `Range start ${start} > end ${end}` };
    return { valid: true };
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) return { valid: false, error: `"${value}" is not a number` };
  if (num < min || num > max) return { valid: false, error: `${num} is out of range [${min}-${max}]` };
  return { valid: true };
}

function describeField(raw: string, field: CronField): string {
  const value = resolveAliases(raw, field.aliases);
  const { name, min, max } = field;

  if (value === '*') return `Every ${name.toLowerCase()}`;

  if (value.includes(',')) {
    const parts = value.split(',').map((p) => {
      const resolved = resolveAliases(p, field.aliases);
      return describeSimpleValue(resolved, field);
    });
    return `At ${name.toLowerCase()} ${joinList(parts)}`;
  }

  if (value.includes('/')) {
    const [range, stepStr] = value.split('/');
    const step = parseInt(stepStr, 10);
    const stepLabel = `every ${step} ${name.toLowerCase()}${step > 1 ? 's' : ''}`;
    if (range === '*') return `${capitalize(stepLabel)} (${min}-${max})`;
    if (range.includes('-')) {
      const [s, e] = range.split('-').map(Number);
      return `${capitalize(stepLabel)} from ${describeSimpleValue(String(s), field)} through ${describeSimpleValue(String(e), field)}`;
    }
    return `${capitalize(stepLabel)} starting at ${describeSimpleValue(range, field)}`;
  }

  if (value.includes('-')) {
    const [s, e] = value.split('-');
    return `From ${describeSimpleValue(s, field)} through ${describeSimpleValue(e, field)}`;
  }

  return `At ${name.toLowerCase()} ${describeSimpleValue(value, field)}`;
}

function describeSimpleValue(value: string, field: CronField): string {
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;

  if (field.name === 'Month' && num >= 1 && num <= 12) {
    return MONTH_NAMES[num - 1];
  }
  if (field.name === 'Day of Week') {
    const idx = num === 7 ? 0 : num;
    if (idx >= 0 && idx <= 6) return DAY_NAMES[idx];
  }
  if (field.name === 'Hour') {
    const h = num % 12 || 12;
    const ampm = num < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  }
  return ordinal(num);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinList(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

export function parseCronExpression(expression: string): ParsedCronExpression | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  return { minute, hour, dayOfMonth, month, dayOfWeek };
}

export function validateCronExpression(expression: string): CronValidationResult {
  const parsed = parseCronExpression(expression);
  if (!parsed) {
    return {
      valid: false,
      error: 'A cron expression must have exactly 5 fields: minute hour day-of-month month day-of-week',
      descriptions: [],
    };
  }

  const rawFields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  const descriptions: CronDescription[] = [];
  let overallValid = true;

  rawFields.forEach((raw, i) => {
    const field = CRON_FIELDS[i];
    const result = parseFieldValue(raw, field);
    const valid = result.valid;
    if (!valid) overallValid = false;
    descriptions.push({
      field: field.name,
      raw,
      description: valid ? describeField(raw, field) : `Invalid: ${result.error}`,
      valid,
    });
  });

  return {
    valid: overallValid,
    descriptions,
    error: overallValid ? undefined : 'One or more fields are invalid',
  };
}

export function describeCronExpression(expression: string): string {
  const validation = validateCronExpression(expression);
  if (!validation.valid) return 'Invalid expression';

  const [min, hr, dom, mon, dow] = validation.descriptions;

  // Build a human-readable summary
  const parts: string[] = [];

  // Time part
  if (min.raw === '*' && hr.raw === '*') {
    parts.push('every minute');
  } else if (min.raw.startsWith('*/') && hr.raw === '*') {
    const step = min.raw.slice(2);
    parts.push(`every ${step} minutes`);
  } else if (hr.raw === '*') {
    parts.push(`at minute ${min.raw} of every hour`);
  } else {
    const hrDesc = describeField(hr.raw, CRON_FIELDS[1]);
    const minDesc = min.raw === '0' ? 'on the hour' : `at minute ${min.raw}`;
    parts.push(`${hrDesc}, ${minDesc}`);
  }

  // Day part
  if (dom.raw !== '*' && dow.raw !== '*') {
    parts.push(`if it's ${describeField(dom.raw, CRON_FIELDS[2])} and ${describeField(dow.raw, CRON_FIELDS[4])}`);
  } else if (dom.raw !== '*') {
    parts.push(`on ${describeField(dom.raw, CRON_FIELDS[2])}`);
  } else if (dow.raw !== '*') {
    parts.push(`on ${describeField(dow.raw, CRON_FIELDS[4])}`);
  }

  // Month part
  if (mon.raw !== '*') {
    parts.push(`in ${describeField(mon.raw, CRON_FIELDS[3])}`);
  }

  return capitalize(parts.join(', '));
}

function getMatchingValues(raw: string, field: CronField): number[] {
  const value = resolveAliases(raw, field.aliases);
  const { min, max } = field;
  const all = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  if (value === '*') return all;

  if (value.includes(',')) {
    const result = new Set<number>();
    value.split(',').forEach((part) => {
      getMatchingValues(part, { ...field, aliases: undefined }).forEach((v) => result.add(v));
    });
    return Array.from(result).sort((a, b) => a - b);
  }

  if (value.includes('/')) {
    const [range, stepStr] = value.split('/');
    const step = parseInt(stepStr, 10);
    let candidates = range === '*' ? all : getMatchingValues(range, { ...field, aliases: undefined });
    const start = candidates[0];
    return all.filter((v) => v >= start && (v - start) % step === 0);
  }

  if (value.includes('-')) {
    const [s, e] = value.split('-').map(Number);
    return all.filter((v) => v >= s && v <= e);
  }

  const num = parseInt(value, 10);
  return isNaN(num) ? [] : [num];
}

export function getNextExecutions(expression: string, count: number = 5, fromDate?: Date): Date[] {
  const validation = validateCronExpression(expression);
  if (!validation.valid) return [];

  const parsed = parseCronExpression(expression)!;
  const minutes = getMatchingValues(parsed.minute, CRON_FIELDS[0]);
  const hours = getMatchingValues(parsed.hour, CRON_FIELDS[1]);
  const doms = getMatchingValues(parsed.dayOfMonth, CRON_FIELDS[2]);
  const months = getMatchingValues(parsed.month, CRON_FIELDS[3]);
  const dows = getMatchingValues(parsed.dayOfWeek, CRON_FIELDS[4]).map((d) => (d === 7 ? 0 : d));

  const useDom = parsed.dayOfMonth !== '*';
  const useDow = parsed.dayOfWeek !== '*';

  const start = fromDate ? new Date(fromDate) : new Date();
  // Advance by 1 minute so we don't return the current moment
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  const results: Date[] = [];
  const limit = new Date(start);
  limit.setFullYear(limit.getFullYear() + 2);

  const current = new Date(start);
  current.setSeconds(0, 0);

  while (results.length < count && current < limit) {
    const m = current.getMonth() + 1;
    const dom = current.getDate();
    const dow = current.getDay();
    const h = current.getHours();
    const min = current.getMinutes();

    if (!months.includes(m)) {
      // Advance to next matching month
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
      current.setMonth(current.getMonth() + 1);
      continue;
    }

    const domMatch = doms.includes(dom);
    const dowMatch = dows.includes(dow);
    const dayMatch = useDom && useDow ? (domMatch || dowMatch) : useDom ? domMatch : useDow ? dowMatch : true;

    if (!dayMatch) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    if (!hours.includes(h)) {
      const nextHour = hours.find((hh) => hh > h);
      if (nextHour === undefined) {
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
      } else {
        current.setHours(nextHour, 0, 0, 0);
      }
      continue;
    }

    if (!minutes.includes(min)) {
      const nextMin = minutes.find((mm) => mm > min);
      if (nextMin === undefined) {
        const nextHour = hours.find((hh) => hh > h);
        if (nextHour === undefined) {
          current.setDate(current.getDate() + 1);
          current.setHours(0, 0, 0, 0);
        } else {
          current.setHours(nextHour, 0, 0, 0);
        }
      } else {
        current.setMinutes(nextMin, 0, 0);
      }
      continue;
    }

    results.push(new Date(current));
    // Advance by 1 minute
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}
