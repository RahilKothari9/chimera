import { describe, it, expect } from 'vitest';
import {
  splitIntoWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  toTitleCase,
  toSentenceCase,
  toDotCase,
  toPathCase,
  toLowerCase,
  toUpperCase,
  convertAllCases,
  CASE_LABELS,
} from './caseConverter';

describe('splitIntoWords', () => {
  it('splits a simple space-separated string', () => {
    expect(splitIntoWords('hello world')).toEqual(['hello', 'world']);
  });

  it('splits camelCase', () => {
    expect(splitIntoWords('helloWorld')).toEqual(['hello', 'world']);
  });

  it('splits PascalCase', () => {
    expect(splitIntoWords('HelloWorld')).toEqual(['hello', 'world']);
  });

  it('splits snake_case', () => {
    expect(splitIntoWords('hello_world')).toEqual(['hello', 'world']);
  });

  it('splits kebab-case', () => {
    expect(splitIntoWords('hello-world')).toEqual(['hello', 'world']);
  });

  it('splits SCREAMING_SNAKE', () => {
    expect(splitIntoWords('HELLO_WORLD')).toEqual(['hello', 'world']);
  });

  it('splits dot.case', () => {
    expect(splitIntoWords('hello.world')).toEqual(['hello', 'world']);
  });

  it('splits path/case', () => {
    expect(splitIntoWords('hello/world')).toEqual(['hello', 'world']);
  });

  it('handles acronyms like XMLParser', () => {
    const words = splitIntoWords('XMLParser');
    expect(words).toContain('xml');
    expect(words).toContain('parser');
  });

  it('returns empty array for empty string', () => {
    expect(splitIntoWords('')).toEqual([]);
  });

  it('trims extra spaces', () => {
    expect(splitIntoWords('  hello   world  ')).toEqual(['hello', 'world']);
  });

  it('handles mixed separators', () => {
    expect(splitIntoWords('hello_world-foo')).toEqual(['hello', 'world', 'foo']);
  });

  it('handles numbers in camelCase', () => {
    expect(splitIntoWords('get5Records')).toEqual(['get5', 'records']);
  });
});

describe('toCamelCase', () => {
  it('converts words to camelCase', () => {
    expect(toCamelCase(['hello', 'world'])).toBe('helloWorld');
  });

  it('handles a single word', () => {
    expect(toCamelCase(['hello'])).toBe('hello');
  });

  it('handles empty array', () => {
    expect(toCamelCase([])).toBe('');
  });

  it('handles three words', () => {
    expect(toCamelCase(['my', 'variable', 'name'])).toBe('myVariableName');
  });
});

describe('toPascalCase', () => {
  it('converts words to PascalCase', () => {
    expect(toPascalCase(['hello', 'world'])).toBe('HelloWorld');
  });

  it('handles a single word', () => {
    expect(toPascalCase(['hello'])).toBe('Hello');
  });

  it('handles empty array', () => {
    expect(toPascalCase([])).toBe('');
  });
});

describe('toSnakeCase', () => {
  it('joins words with underscores', () => {
    expect(toSnakeCase(['hello', 'world'])).toBe('hello_world');
  });

  it('handles empty array', () => {
    expect(toSnakeCase([])).toBe('');
  });
});

describe('toKebabCase', () => {
  it('joins words with hyphens', () => {
    expect(toKebabCase(['hello', 'world'])).toBe('hello-world');
  });

  it('handles empty array', () => {
    expect(toKebabCase([])).toBe('');
  });
});

describe('toScreamingSnakeCase', () => {
  it('joins words with underscores and uppercases', () => {
    expect(toScreamingSnakeCase(['hello', 'world'])).toBe('HELLO_WORLD');
  });

  it('handles empty array', () => {
    expect(toScreamingSnakeCase([])).toBe('');
  });
});

describe('toTitleCase', () => {
  it('capitalises each word separated by spaces', () => {
    expect(toTitleCase(['hello', 'world'])).toBe('Hello World');
  });

  it('handles single word', () => {
    expect(toTitleCase(['hello'])).toBe('Hello');
  });

  it('handles empty array', () => {
    expect(toTitleCase([])).toBe('');
  });
});

describe('toSentenceCase', () => {
  it('capitalises only the first word', () => {
    expect(toSentenceCase(['hello', 'world'])).toBe('Hello world');
  });

  it('handles empty array', () => {
    expect(toSentenceCase([])).toBe('');
  });
});

describe('toDotCase', () => {
  it('joins words with dots', () => {
    expect(toDotCase(['hello', 'world'])).toBe('hello.world');
  });

  it('handles empty array', () => {
    expect(toDotCase([])).toBe('');
  });
});

describe('toPathCase', () => {
  it('joins words with slashes', () => {
    expect(toPathCase(['hello', 'world'])).toBe('hello/world');
  });

  it('handles empty array', () => {
    expect(toPathCase([])).toBe('');
  });
});

describe('toLowerCase', () => {
  it('joins words with spaces in lowercase', () => {
    expect(toLowerCase(['hello', 'world'])).toBe('hello world');
  });
});

describe('toUpperCase', () => {
  it('joins words with spaces in uppercase', () => {
    expect(toUpperCase(['hello', 'world'])).toBe('HELLO WORLD');
  });
});

describe('convertAllCases', () => {
  it('converts a camelCase input to all formats', () => {
    const result = convertAllCases('helloWorld');
    expect(result.input).toBe('helloWorld');
    expect(result.results.camel).toBe('helloWorld');
    expect(result.results.pascal).toBe('HelloWorld');
    expect(result.results.snake).toBe('hello_world');
    expect(result.results.kebab).toBe('hello-world');
    expect(result.results.screaming_snake).toBe('HELLO_WORLD');
    expect(result.results.title).toBe('Hello World');
    expect(result.results.sentence).toBe('Hello world');
    expect(result.results.dot).toBe('hello.world');
    expect(result.results.path).toBe('hello/world');
    expect(result.results.lower).toBe('hello world');
    expect(result.results.upper).toBe('HELLO WORLD');
  });

  it('handles empty input', () => {
    const result = convertAllCases('');
    expect(result.results.camel).toBe('');
    expect(result.results.snake).toBe('');
  });

  it('converts snake_case input', () => {
    const result = convertAllCases('my_variable_name');
    expect(result.results.camel).toBe('myVariableName');
    expect(result.results.kebab).toBe('my-variable-name');
    expect(result.results.pascal).toBe('MyVariableName');
  });

  it('converts kebab-case input', () => {
    const result = convertAllCases('my-component-name');
    expect(result.results.pascal).toBe('MyComponentName');
    expect(result.results.snake).toBe('my_component_name');
  });

  it('converts SCREAMING_SNAKE input', () => {
    const result = convertAllCases('MY_CONSTANT_VALUE');
    expect(result.results.camel).toBe('myConstantValue');
    expect(result.results.kebab).toBe('my-constant-value');
  });
});

describe('CASE_LABELS', () => {
  it('has a label for every case type', () => {
    const expectedTypes = [
      'camel', 'pascal', 'snake', 'kebab', 'screaming_snake',
      'title', 'sentence', 'dot', 'path', 'lower', 'upper',
    ];
    expectedTypes.forEach((t) => {
      expect(CASE_LABELS).toHaveProperty(t);
      expect(typeof CASE_LABELS[t as keyof typeof CASE_LABELS]).toBe('string');
    });
  });
});
