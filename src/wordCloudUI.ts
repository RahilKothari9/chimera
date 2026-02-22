import type { ChangelogEntry } from './changelogParser';
import { getTopWords } from './wordCloud';

/**
 * Returns a font size (rem) based on the word weight (0–1).
 */
function weightToFontSize(weight: number): string {
  const min = 0.75;
  const max = 2.5;
  return `${(min + (max - min) * weight).toFixed(2)}rem`;
}

/**
 * Returns an opacity value based on the word weight.
 */
function weightToOpacity(weight: number): string {
  return (0.5 + 0.5 * weight).toFixed(2);
}

/**
 * Creates and returns the word cloud section element.
 */
export function createWordCloudUI(entries: ChangelogEntry[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'word-cloud-section';

  if (entries.length === 0) {
    section.innerHTML = '<p class="wc-empty">No evolution data available yet.</p>';
    return section;
  }

  const words = getTopWords(entries, 60);

  if (words.length === 0) {
    section.innerHTML = '<p class="wc-empty">Not enough text data to generate word cloud.</p>';
    return section;
  }

  const topList = words.slice(0, 10);

  section.innerHTML = `
    <h2 class="section-title">🔤 Evolution Word Cloud</h2>
    <p class="wc-description">
      Visual representation of the most frequently used concepts across all ${entries.length} evolution entries.
    </p>
    <div class="wc-layout">
      <div class="wc-cloud" id="wc-cloud" aria-label="Word cloud of evolution terms"></div>
      <div class="wc-sidebar">
        <h3 class="wc-sidebar-title">Top 10 Terms</h3>
        <ol class="wc-top-list" id="wc-top-list"></ol>
      </div>
    </div>
    <p class="wc-hint">Hover over a word to see its frequency.</p>
  `;

  const cloud = section.querySelector<HTMLElement>('#wc-cloud')!;
  const topListEl = section.querySelector<HTMLOListElement>('#wc-top-list')!;

  // Shuffle words slightly for visual variety (stable Fisher-Yates with fixed seed)
  const shuffled = shuffleWords([...words]);

  for (const { word, count, weight } of shuffled) {
    const span = document.createElement('span');
    span.className = 'wc-word';
    span.textContent = word;
    span.title = `"${word}" appears ${count} time${count !== 1 ? 's' : ''}`;
    span.setAttribute('aria-label', `${word}, ${count} occurrences`);
    span.style.fontSize = weightToFontSize(weight);
    span.style.opacity = weightToOpacity(weight);
    // Use a hue derived from the word's first char code for visual variety
    const hue = (word.charCodeAt(0) * 37 + word.length * 17) % 360;
    span.style.setProperty('--wc-hue', String(hue));
    cloud.appendChild(span);
  }

  for (let i = 0; i < topList.length; i++) {
    const { word, count } = topList[i];
    const li = document.createElement('li');
    li.className = 'wc-top-item';
    li.innerHTML = `
      <span class="wc-rank">#${i + 1}</span>
      <span class="wc-term">${word}</span>
      <span class="wc-count">${count}</span>
    `;
    topListEl.appendChild(li);
  }

  return section;
}

/**
 * Deterministic pseudo-shuffle using a fixed seed so the layout is
 * consistent across renders but not purely alphabetical.
 */
function shuffleWords<T>(arr: T[]): T[] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    ;[arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
