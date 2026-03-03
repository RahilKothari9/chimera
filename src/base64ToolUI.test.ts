import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBase64ToolUI } from './base64ToolUI';

vi.mock('./activityFeed', () => ({
  trackActivity: vi.fn(),
}));

const writeTextMock = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: writeTextMock },
  configurable: true,
});

describe('Base64 Tool UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    writeTextMock.mockClear();
  });

  describe('createBase64ToolUI', () => {
    it('creates a container with the correct id', () => {
      const el = createBase64ToolUI();
      expect(el.id).toBe('base64-tool-dashboard');
    });

    it('contains an input textarea', () => {
      const el = createBase64ToolUI();
      expect(el.querySelector('#b64-input')).toBeTruthy();
    });

    it('contains an output textarea', () => {
      const el = createBase64ToolUI();
      expect(el.querySelector('#b64-output')).toBeTruthy();
    });

    it('contains an Encode mode button', () => {
      const el = createBase64ToolUI();
      const btn = el.querySelector('#b64-mode-encode') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Encode');
    });

    it('contains a Decode mode button', () => {
      const el = createBase64ToolUI();
      const btn = el.querySelector('#b64-mode-decode') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Decode');
    });

    it('contains an Auto-detect mode button', () => {
      const el = createBase64ToolUI();
      const btn = el.querySelector('#b64-mode-auto') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Auto-detect');
    });

    it('contains a run button', () => {
      const el = createBase64ToolUI();
      const btn = el.querySelector('#b64-run-btn') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Encode');
    });

    it('contains a swap button', () => {
      const el = createBase64ToolUI();
      expect(el.querySelector('#b64-swap-btn')).toBeTruthy();
    });

    it('contains a clear button', () => {
      const el = createBase64ToolUI();
      expect(el.querySelector('#b64-clear-btn')).toBeTruthy();
    });

    it('contains a copy button', () => {
      const el = createBase64ToolUI();
      expect(el.querySelector('#b64-copy-btn')).toBeTruthy();
    });

    it('encode mode is active by default', () => {
      const el = createBase64ToolUI();
      const btn = el.querySelector('#b64-mode-encode') as HTMLButtonElement;
      expect(btn.classList.contains('active')).toBe(true);
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    it('decode and auto modes are inactive by default', () => {
      const el = createBase64ToolUI();
      const decode = el.querySelector('#b64-mode-decode') as HTMLButtonElement;
      const auto = el.querySelector('#b64-mode-auto') as HTMLButtonElement;
      expect(decode.classList.contains('active')).toBe(false);
      expect(auto.classList.contains('active')).toBe(false);
    });
  });

  describe('Encode operation', () => {
    it('encodes plain text when run button is clicked', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      inputTA.value = 'Hello';
      runBtn.click();

      expect(outputTA.value).toBe('SGVsbG8=');
    });

    it('shows stats after encoding', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const stats = el.querySelector<HTMLDivElement>('#b64-stats')!;

      inputTA.value = 'Hi';
      runBtn.click();

      expect(stats.hidden).toBe(false);
      expect(stats.textContent).toContain('2 bytes');
    });

    it('encodes with url-safe variant when selected', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const urlRadio = el.querySelector<HTMLInputElement>('input[value="url-safe"]')!;

      urlRadio.checked = true;
      inputTA.value = 'Hello';
      runBtn.click();

      // URL-safe strips trailing = and replaces + / with - _
      expect(outputTA.value).not.toContain('=');
    });
  });

  describe('Decode mode', () => {
    it('switches to decode mode when Decode button is clicked', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const decodeBtn = el.querySelector<HTMLButtonElement>('#b64-mode-decode')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      decodeBtn.click();

      expect(decodeBtn.classList.contains('active')).toBe(true);
      expect(runBtn.textContent).toContain('Decode');
    });

    it('decodes Base64 when in decode mode', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const decodeBtn = el.querySelector<HTMLButtonElement>('#b64-mode-decode')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      decodeBtn.click();
      inputTA.value = 'SGVsbG8=';
      runBtn.click();

      expect(outputTA.value).toBe('Hello');
    });

    it('shows an error for invalid Base64 input', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const errorEl = el.querySelector<HTMLDivElement>('#b64-error')!;
      const decodeBtn = el.querySelector<HTMLButtonElement>('#b64-mode-decode')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      decodeBtn.click();
      inputTA.value = '!!!invalid!!!';
      runBtn.click();

      expect(errorEl.hidden).toBe(false);
      expect(errorEl.textContent).toContain('Invalid Base64');
    });
  });

  describe('Clear button', () => {
    it('clears input and output', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const clearBtn = el.querySelector<HTMLButtonElement>('#b64-clear-btn')!;

      inputTA.value = 'Hello';
      runBtn.click();
      clearBtn.click();

      expect(inputTA.value).toBe('');
      expect(outputTA.value).toBe('');
    });
  });

  describe('Swap button', () => {
    it('swaps input and output values', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const swapBtn = el.querySelector<HTMLButtonElement>('#b64-swap-btn')!;

      inputTA.value = 'Hello';
      runBtn.click();
      const encoded = outputTA.value;

      swapBtn.click();

      expect(inputTA.value).toBe(encoded);
      expect(outputTA.value).toBe('Hello');
    });

    it('switches to decode mode after swapping from encode', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const swapBtn = el.querySelector<HTMLButtonElement>('#b64-swap-btn')!;
      const decodeBtn = el.querySelector<HTMLButtonElement>('#b64-mode-decode')!;

      inputTA.value = 'Hello';
      runBtn.click();
      swapBtn.click();

      expect(decodeBtn.classList.contains('active')).toBe(true);
    });
  });

  describe('Copy button', () => {
    it('calls clipboard.writeText with output value', async () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;
      const copyBtn = el.querySelector<HTMLButtonElement>('#b64-copy-btn')!;

      inputTA.value = 'Hello';
      runBtn.click();
      copyBtn.click();

      await new Promise(r => setTimeout(r, 10));
      expect(writeTextMock).toHaveBeenCalledWith('SGVsbG8=');
    });

    it('does not call clipboard when output is empty', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const copyBtn = el.querySelector<HTMLButtonElement>('#b64-copy-btn')!;

      copyBtn.click();

      expect(writeTextMock).not.toHaveBeenCalled();
    });
  });

  describe('Auto-detect mode', () => {
    it('auto-detects plain text and encodes it', () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const autoBtn = el.querySelector<HTMLButtonElement>('#b64-mode-auto')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      autoBtn.click();
      inputTA.value = 'Hello World!';
      runBtn.click();

      // Should have encoded it — 'Hello World!' → 'SGVsbG8gV29ybGQh'
      expect(outputTA.value).toBe('SGVsbG8gV29ybGQh');
    });

    it('auto-detects Base64 and decodes it', async () => {
      const el = createBase64ToolUI();
      document.body.appendChild(el);
      const inputTA = el.querySelector<HTMLTextAreaElement>('#b64-input')!;
      const outputTA = el.querySelector<HTMLTextAreaElement>('#b64-output')!;
      const autoBtn = el.querySelector<HTMLButtonElement>('#b64-mode-auto')!;
      const runBtn = el.querySelector<HTMLButtonElement>('#b64-run-btn')!;

      autoBtn.click();
      inputTA.value = 'SGVsbG8='; // 'Hello' in Base64
      runBtn.click();

      expect(outputTA.value).toBe('Hello');
    });
  });
});
