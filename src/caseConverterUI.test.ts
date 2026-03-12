import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCaseConverterUI } from './caseConverterUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('createCaseConverterUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('returns an element with the correct id', () => {
    const el = createCaseConverterUI();
    expect(el.id).toBe('case-converter-dashboard');
  });

  it('contains a text input', () => {
    const el = createCaseConverterUI();
    expect(el.querySelector('#case-converter-input')).toBeTruthy();
  });

  it('contains a Clear button', () => {
    const el = createCaseConverterUI();
    expect(el.querySelector('#case-converter-clear-btn')).toBeTruthy();
  });

  it('shows empty state message initially', () => {
    const el = createCaseConverterUI();
    expect(el.querySelector('.case-converter-empty-state')).toBeTruthy();
  });

  it('renders conversion rows when text is typed', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'helloWorld';
    input.dispatchEvent(new Event('input'));

    const rows = el.querySelectorAll('.case-converter-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('shows camelCase result for "hello world"', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'hello world';
    input.dispatchEvent(new Event('input'));

    const camelRow = el.querySelector('[data-case="camel"] .case-converter-value');
    expect(camelRow?.textContent).toBe('helloWorld');
  });

  it('shows snake_case result for "helloWorld"', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'helloWorld';
    input.dispatchEvent(new Event('input'));

    const snakeRow = el.querySelector('[data-case="snake"] .case-converter-value');
    expect(snakeRow?.textContent).toBe('hello_world');
  });

  it('shows SCREAMING_SNAKE result', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'helloWorld';
    input.dispatchEvent(new Event('input'));

    const screamRow = el.querySelector('[data-case="screaming_snake"] .case-converter-value');
    expect(screamRow?.textContent).toBe('HELLO_WORLD');
  });

  it('shows kebab-case result', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'MyComponent';
    input.dispatchEvent(new Event('input'));

    const kebabRow = el.querySelector('[data-case="kebab"] .case-converter-value');
    expect(kebabRow?.textContent).toBe('my-component');
  });

  it('clears results when Clear button is clicked', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'helloWorld';
    input.dispatchEvent(new Event('input'));

    expect(el.querySelectorAll('.case-converter-row').length).toBeGreaterThan(0);

    el.querySelector<HTMLButtonElement>('#case-converter-clear-btn')!.click();
    expect(el.querySelector('.case-converter-empty-state')).toBeTruthy();
    expect(input.value).toBe('');
  });

  it('shows empty state when input is cleared to empty string', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));

    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(el.querySelector('.case-converter-empty-state')).toBeTruthy();
  });

  it('each row has a copy button', () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));

    const copyBtns = el.querySelectorAll('.case-converter-copy-btn');
    expect(copyBtns.length).toBeGreaterThan(0);
  });

  it('copies the correct value when a copy button is clicked', async () => {
    const el = createCaseConverterUI();
    document.body.appendChild(el);

    const input = el.querySelector<HTMLInputElement>('#case-converter-input')!;
    input.value = 'hello world';
    input.dispatchEvent(new Event('input'));

    const snakeCopyBtn = el.querySelector<HTMLButtonElement>('[data-case="snake"].case-converter-copy-btn')!;
    snakeCopyBtn.click();

    await Promise.resolve();
    expect(writeTextMock).toHaveBeenCalledWith('hello_world');
  });
});
