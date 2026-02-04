export interface ChangelogEntry {
  date: string;
  day: string;
  feature: string;
  description: string;
  filesModified: string;
}

export interface EvolutionEntry {
  date: string;
  day: number;
  feature: string;
  description: string;
  files: string[];
}

/**
 * Parses the README changelog section and extracts evolution entries
 */
export function parseChangelog(readmeContent: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  
  // Split by changelog entries (### Day X: YYYY-MM-DD)
  const entryPattern = /### Day (\d+): (\d{4}-\d{2}-\d{2})\s*\n\*\*Feature\/Change\*\*: (.+?)\n\*\*Description\*\*: (.+?)\n\*\*Files Modified\*\*: (.+?)(?=\n---|$)/gs;
  
  let match;
  while ((match = entryPattern.exec(readmeContent)) !== null) {
    entries.push({
      day: match[1],
      date: match[2],
      feature: match[3].trim(),
      description: match[4].trim(),
      filesModified: match[5].trim()
    });
  }
  
  return entries;
}

/**
 * Fetches and parses the changelog from the README
 */
export async function fetchChangelog(): Promise<ChangelogEntry[]> {
  try {
    const response = await fetch('/README.md');
    const content = await response.text();
    return parseChangelog(content);
  } catch (error) {
    console.error('Failed to fetch changelog:', error);
    return [];
  }
}
