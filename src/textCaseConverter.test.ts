import { describe, it, expect } from 'vitest';
import {
  splitWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  toTitleCase,
  toSentenceCase,
  toDotCase,
  toLowerCaseText,
  toUpperCaseText,
  convertCase,
  convertAllCases,
  CASE_LABELS,
  type TextCase,
} from './textCaseConverter';

// ---------------------------------------------------------------------------
// splitWords
// ---------------------------------------------------------------------------
describe('splitWords', () => {
  it('splits a space-separated string', () => {
    expect(splitWords('hello world')).toEqual(['hello', 'world']);
  });

  it('splits a snake_case string', () => {
    expect(splitWords('hello_world')).toEqual(['hello', 'world']);
  });

  it('splits a kebab-case string', () => {
    expect(splitWords('hello-world')).toEqual(['hello', 'world']);
  });

  it('splits a dot.case string', () => {
    expect(splitWords('hello.world')).toEqual(['hello', 'world']);
  });

  it('splits a camelCase string', () => {
    expect(splitWords('helloWorld')).toEqual(['hello', 'world']);
  });

  it('splits a PascalCase string', () => {
    expect(splitWords('HelloWorld')).toEqual(['hello', 'world']);
  });

  it('splits a SCREAMING_SNAKE_CASE string', () => {
    expect(splitWords('HELLO_WORLD')).toEqual(['hello', 'world']);
  });

  it('handles multiple consecutive separators', () => {
    expect(splitWords('hello--world__foo')).toEqual(['hello', 'world', 'foo']);
  });

  it('handles mixed separators', () => {
    expect(splitWords('hello_world-foo.bar')).toEqual(['hello', 'world', 'foo', 'bar']);
  });

  it('returns an empty array for an empty string', () => {
    expect(splitWords('')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only string', () => {
    expect(splitWords('   ')).toEqual([]);
  });

  it('handles a single word', () => {
    expect(splitWords('hello')).toEqual(['hello']);
  });

  it('handles three words in camelCase', () => {
    expect(splitWords('myVariableName')).toEqual(['my', 'variable', 'name']);
  });

  it('handles acronyms in PascalCase (e.g. XMLParser)', () => {
    expect(splitWords('XMLParser')).toEqual(['xml', 'parser']);
  });

  it('preserves digits as word characters', () => {
    expect(splitWords('base64Encoder')).toEqual(['base64', 'encoder']);
  });
});

// ---------------------------------------------------------------------------
// toCamelCase
// ---------------------------------------------------------------------------
describe('toCamelCase', () => {
  it('converts space-separated words', () => {
    expect(toCamelCase('hello world').output).toBe('helloWorld');
  });

  it('converts snake_case', () => {
    expect(toCamelCase('hello_world').output).toBe('helloWorld');
  });

  it('converts kebab-case', () => {
    expect(toCamelCase('hello-world').output).toBe('helloWorld');
  });

  it('converts PascalCase', () => {
    expect(toCamelCase('HelloWorld').output).toBe('helloWorld');
  });

  it('converts SCREAMING_SNAKE_CASE', () => {
    expect(toCamelCase('HELLO_WORLD').output).toBe('helloWorld');
  });

  it('handles a single word', () => {
    expect(toCamelCase('hello').output).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(toCamelCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toCamelCase('my variable name').output).toBe('myVariableName');
  });

  it('reports correct word count', () => {
    expect(toCamelCase('hello world foo').wordCount).toBe(3);
  });

  it('handles empty input word count', () => {
    expect(toCamelCase('').wordCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// toPascalCase
// ---------------------------------------------------------------------------
describe('toPascalCase', () => {
  it('converts space-separated words', () => {
    expect(toPascalCase('hello world').output).toBe('HelloWorld');
  });

  it('converts snake_case', () => {
    expect(toPascalCase('hello_world').output).toBe('HelloWorld');
  });

  it('converts camelCase', () => {
    expect(toPascalCase('helloWorld').output).toBe('HelloWorld');
  });

  it('converts kebab-case', () => {
    expect(toPascalCase('hello-world').output).toBe('HelloWorld');
  });

  it('handles a single word', () => {
    expect(toPascalCase('hello').output).toBe('Hello');
  });

  it('handles an empty string', () => {
    expect(toPascalCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toPascalCase('my variable name').output).toBe('MyVariableName');
  });
});

// ---------------------------------------------------------------------------
// toSnakeCase
// ---------------------------------------------------------------------------
describe('toSnakeCase', () => {
  it('converts space-separated words', () => {
    expect(toSnakeCase('hello world').output).toBe('hello_world');
  });

  it('converts camelCase', () => {
    expect(toSnakeCase('helloWorld').output).toBe('hello_world');
  });

  it('converts PascalCase', () => {
    expect(toSnakeCase('HelloWorld').output).toBe('hello_world');
  });

  it('converts kebab-case', () => {
    expect(toSnakeCase('hello-world').output).toBe('hello_world');
  });

  it('handles a single word', () => {
    expect(toSnakeCase('hello').output).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(toSnakeCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toSnakeCase('my variable name').output).toBe('my_variable_name');
  });
});

// ---------------------------------------------------------------------------
// toKebabCase
// ---------------------------------------------------------------------------
describe('toKebabCase', () => {
  it('converts space-separated words', () => {
    expect(toKebabCase('hello world').output).toBe('hello-world');
  });

  it('converts camelCase', () => {
    expect(toKebabCase('helloWorld').output).toBe('hello-world');
  });

  it('converts PascalCase', () => {
    expect(toKebabCase('HelloWorld').output).toBe('hello-world');
  });

  it('converts snake_case', () => {
    expect(toKebabCase('hello_world').output).toBe('hello-world');
  });

  it('handles a single word', () => {
    expect(toKebabCase('hello').output).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(toKebabCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toKebabCase('my variable name').output).toBe('my-variable-name');
  });
});

// ---------------------------------------------------------------------------
// toScreamingSnakeCase
// ---------------------------------------------------------------------------
describe('toScreamingSnakeCase', () => {
  it('converts space-separated words', () => {
    expect(toScreamingSnakeCase('hello world').output).toBe('HELLO_WORLD');
  });

  it('converts camelCase', () => {
    expect(toScreamingSnakeCase('helloWorld').output).toBe('HELLO_WORLD');
  });

  it('converts kebab-case', () => {
    expect(toScreamingSnakeCase('hello-world').output).toBe('HELLO_WORLD');
  });

  it('handles a single word', () => {
    expect(toScreamingSnakeCase('hello').output).toBe('HELLO');
  });

  it('handles an empty string', () => {
    expect(toScreamingSnakeCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toScreamingSnakeCase('my variable name').output).toBe('MY_VARIABLE_NAME');
  });
});

// ---------------------------------------------------------------------------
// toTitleCase
// ---------------------------------------------------------------------------
describe('toTitleCase', () => {
  it('converts space-separated words', () => {
    expect(toTitleCase('hello world').output).toBe('Hello World');
  });

  it('converts snake_case', () => {
    expect(toTitleCase('hello_world').output).toBe('Hello World');
  });

  it('converts camelCase', () => {
    expect(toTitleCase('helloWorld').output).toBe('Hello World');
  });

  it('handles a single word', () => {
    expect(toTitleCase('hello').output).toBe('Hello');
  });

  it('handles an empty string', () => {
    expect(toTitleCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toTitleCase('my variable name').output).toBe('My Variable Name');
  });
});

// ---------------------------------------------------------------------------
// toSentenceCase
// ---------------------------------------------------------------------------
describe('toSentenceCase', () => {
  it('converts space-separated words', () => {
    expect(toSentenceCase('hello world').output).toBe('Hello world');
  });

  it('converts SCREAMING_SNAKE_CASE', () => {
    expect(toSentenceCase('HELLO_WORLD').output).toBe('Hello world');
  });

  it('converts camelCase', () => {
    expect(toSentenceCase('helloWorld').output).toBe('Hello world');
  });

  it('handles a single word', () => {
    expect(toSentenceCase('hello').output).toBe('Hello');
  });

  it('handles an empty string', () => {
    expect(toSentenceCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toSentenceCase('my variable name').output).toBe('My variable name');
  });
});

// ---------------------------------------------------------------------------
// toDotCase
// ---------------------------------------------------------------------------
describe('toDotCase', () => {
  it('converts space-separated words', () => {
    expect(toDotCase('hello world').output).toBe('hello.world');
  });

  it('converts camelCase', () => {
    expect(toDotCase('helloWorld').output).toBe('hello.world');
  });

  it('converts snake_case', () => {
    expect(toDotCase('hello_world').output).toBe('hello.world');
  });

  it('handles a single word', () => {
    expect(toDotCase('hello').output).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(toDotCase('').output).toBe('');
  });

  it('handles three words', () => {
    expect(toDotCase('my variable name').output).toBe('my.variable.name');
  });
});

// ---------------------------------------------------------------------------
// toLowerCaseText
// ---------------------------------------------------------------------------
describe('toLowerCaseText', () => {
  it('converts UPPERCASE to lowercase', () => {
    expect(toLowerCaseText('HELLO WORLD').output).toBe('hello world');
  });

  it('converts PascalCase to lowercase', () => {
    expect(toLowerCaseText('HelloWorld').output).toBe('hello world');
  });

  it('handles a single word', () => {
    expect(toLowerCaseText('HELLO').output).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(toLowerCaseText('').output).toBe('');
  });
});

// ---------------------------------------------------------------------------
// toUpperCaseText
// ---------------------------------------------------------------------------
describe('toUpperCaseText', () => {
  it('converts lowercase to UPPERCASE', () => {
    expect(toUpperCaseText('hello world').output).toBe('HELLO WORLD');
  });

  it('converts camelCase to UPPERCASE', () => {
    expect(toUpperCaseText('helloWorld').output).toBe('HELLO WORLD');
  });

  it('handles a single word', () => {
    expect(toUpperCaseText('hello').output).toBe('HELLO');
  });

  it('handles an empty string', () => {
    expect(toUpperCaseText('').output).toBe('');
  });
});

// ---------------------------------------------------------------------------
// convertCase (dispatcher)
// ---------------------------------------------------------------------------
describe('convertCase', () => {
  const cases: Array<[TextCase, string, string]> = [
    ['camel',           'hello world', 'helloWorld'],
    ['pascal',          'hello world', 'HelloWorld'],
    ['snake',           'hello world', 'hello_world'],
    ['kebab',           'hello world', 'hello-world'],
    ['screaming_snake', 'hello world', 'HELLO_WORLD'],
    ['title',           'hello world', 'Hello World'],
    ['sentence',        'hello world', 'Hello world'],
    ['dot',             'hello world', 'hello.world'],
    ['lower',           'HELLO WORLD', 'hello world'],
    ['upper',           'hello world', 'HELLO WORLD'],
  ];

  cases.forEach(([targetCase, input, expected]) => {
    it(`converts to ${targetCase}`, () => {
      expect(convertCase(input, targetCase).output).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// convertAllCases
// ---------------------------------------------------------------------------
describe('convertAllCases', () => {
  it('returns all 10 case formats', () => {
    const result = convertAllCases('hello world');
    expect(Object.keys(result)).toHaveLength(10);
  });

  it('produces correct values for "hello world"', () => {
    const result = convertAllCases('hello world');
    expect(result.camel).toBe('helloWorld');
    expect(result.pascal).toBe('HelloWorld');
    expect(result.snake).toBe('hello_world');
    expect(result.kebab).toBe('hello-world');
    expect(result.screaming_snake).toBe('HELLO_WORLD');
    expect(result.title).toBe('Hello World');
    expect(result.sentence).toBe('Hello world');
    expect(result.dot).toBe('hello.world');
    expect(result.lower).toBe('hello world');
    expect(result.upper).toBe('HELLO WORLD');
  });

  it('handles an empty string', () => {
    const result = convertAllCases('');
    Object.values(result).forEach((v) => expect(v).toBe(''));
  });

  it('handles camelCase input', () => {
    const result = convertAllCases('myVariableName');
    expect(result.snake).toBe('my_variable_name');
    expect(result.kebab).toBe('my-variable-name');
    expect(result.pascal).toBe('MyVariableName');
  });
});

// ---------------------------------------------------------------------------
// CASE_LABELS
// ---------------------------------------------------------------------------
describe('CASE_LABELS', () => {
  it('has labels for all 10 case formats', () => {
    expect(Object.keys(CASE_LABELS)).toHaveLength(10);
  });

  it('has human-readable label for camelCase', () => {
    expect(CASE_LABELS.camel).toBe('camelCase');
  });

  it('has human-readable label for PascalCase', () => {
    expect(CASE_LABELS.pascal).toBe('PascalCase');
  });

  it('has human-readable label for snake_case', () => {
    expect(CASE_LABELS.snake).toBe('snake_case');
  });

  it('has human-readable label for kebab-case', () => {
    expect(CASE_LABELS.kebab).toBe('kebab-case');
  });
});
