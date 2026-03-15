import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUrlEncoderDecoderUI } from './urlEncoderDecoderUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

describe('createUrlEncoderDecoderUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('returns an element with the correct id', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.id).toBe('url-encoder-decoder-dashboard');
  });

  it('contains an input textarea', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector<HTMLTextAreaElement>('#url-input')).toBeTruthy();
  });

  it('contains an output textarea', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector<HTMLTextAreaElement>('#url-output')).toBeTruthy();
  });

  it('contains Encode and Decode buttons', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector('#url-encode-btn')).toBeTruthy();
    expect(el.querySelector('#url-decode-btn')).toBeTruthy();
  });

  it('contains Swap and Clear buttons', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector('#url-swap-btn')).toBeTruthy();
    expect(el.querySelector('#url-clear-btn')).toBeTruthy();
  });

  it('contains a Copy button', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector('#url-copy-btn')).toBeTruthy();
  });

  it('contains URL parser section', () => {
    const el = createUrlEncoderDecoderUI();
    expect(el.querySelector('#url-parse-input')).toBeTruthy();
    expect(el.querySelector('#url-parse-btn')).toBeTruthy();
    expect(el.querySelector('#url-parse-result')).toBeTruthy();
  });

  it('encodes input when Encode button is clicked', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const input = el.querySelector<HTMLTextAreaElement>('#url-input')!;
    const output = el.querySelector<HTMLTextAreaElement>('#url-output')!;
    input.value = 'hello world';
    el.querySelector<HTMLButtonElement>('#url-encode-btn')!.click();
    expect(output.value).toBe('hello%20world');
  });

  it('decodes input when Decode button is clicked', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const input = el.querySelector<HTMLTextAreaElement>('#url-input')!;
    const output = el.querySelector<HTMLTextAreaElement>('#url-output')!;
    input.value = 'hello%20world';
    el.querySelector<HTMLButtonElement>('#url-decode-btn')!.click();
    expect(output.value).toBe('hello world');
  });

  it('swaps input and output when Swap button is clicked', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const input = el.querySelector<HTMLTextAreaElement>('#url-input')!;
    const output = el.querySelector<HTMLTextAreaElement>('#url-output')!;
    input.value = 'hello';
    output.value = 'world';
    // output is readonly, override for test purposes
    Object.defineProperty(output, 'value', { value: 'world', writable: true });
    el.querySelector<HTMLButtonElement>('#url-swap-btn')!.click();
    expect(input.value).toBe('world');
  });

  it('clears both textareas when Clear button is clicked', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const input = el.querySelector<HTMLTextAreaElement>('#url-input')!;
    const output = el.querySelector<HTMLTextAreaElement>('#url-output')!;
    input.value = 'something';
    el.querySelector<HTMLButtonElement>('#url-clear-btn')!.click();
    expect(input.value).toBe('');
    expect(output.value).toBe('');
  });

  it('shows error banner for malformed percent-encoding', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const input = el.querySelector<HTMLTextAreaElement>('#url-input')!;
    input.value = '%GG';
    el.querySelector<HTMLButtonElement>('#url-decode-btn')!.click();
    const banner = el.querySelector<HTMLDivElement>('#url-error-banner')!;
    expect(banner.className).toContain('url-error-visible');
  });

  it('parses URL when Parse button is clicked', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const parseInput = el.querySelector<HTMLInputElement>('#url-parse-input')!;
    parseInput.value = 'https://example.com/?foo=bar';
    el.querySelector<HTMLButtonElement>('#url-parse-btn')!.click();
    const result = el.querySelector<HTMLDivElement>('#url-parse-result')!;
    expect(result.innerHTML).toContain('example.com');
  });

  it('shows parse error for non-URL input', () => {
    const el = createUrlEncoderDecoderUI();
    document.body.appendChild(el);
    const parseInput = el.querySelector<HTMLInputElement>('#url-parse-input')!;
    parseInput.value = 'not a url';
    el.querySelector<HTMLButtonElement>('#url-parse-btn')!.click();
    const result = el.querySelector<HTMLDivElement>('#url-parse-result')!;
    expect(result.innerHTML).toContain('❌');
  });

  it('shows mode radio buttons', () => {
    const el = createUrlEncoderDecoderUI();
    const radios = el.querySelectorAll<HTMLInputElement>('input[name="url-mode"]');
    expect(radios.length).toBe(2);
    expect(radios[0].value).toBe('component');
    expect(radios[1].value).toBe('full');
  });

  it('defaults to component mode', () => {
    const el = createUrlEncoderDecoderUI();
    const checked = el.querySelector<HTMLInputElement>('input[name="url-mode"]:checked');
    expect(checked?.value).toBe('component');
  });
});
