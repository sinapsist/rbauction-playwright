const EVENT_META =
    /^(preview|view items|timed auction|\d[\d,]*\s+items|\d+\s+day event|\+\s*\d+\s+more)$/i;

const DATE_RANGE = /\b[A-Z][a-z]{2,9}\s+\d{1,2}\s*[-–]\s*[A-Z][a-z]{2,9}\s+\d{1,2}\b/;

/**
 * Reads the inventory total from a results headline or pager, for example `3.1k results` or `1-60 of 3143`.
 * @param text The text to parse.
 * @returns The inventory total.
 */
export function parseDisplayedTotal(text: string): number {
  const ofMatch = text.match(/\bof\s+([\d,]+)\b/i);
  if (ofMatch) {
    return Number(ofMatch[1].replace(/,/g, ''));
  }

  const compact = text.match(/([\d,.]+)\s*([kKmM])\s+results\b/);
  if (compact) {
    const value = Number(compact[1].replace(/,/g, ''));
    const factor = compact[2].toLowerCase() === 'm' ? 1_000_000 : 1_000;
    return Math.round(value * factor);
  }

  const plain = text.match(/([\d,]+)\s+results\b/i);
  if (plain) {
    return Number(plain[1].replace(/,/g, ''));
  }

  throw new Error(`No inventory total found in: ${text}`);
}

/**
 * Returns true if the label contains an asterisk, which indicates that the site is a satellite location.
 * @param label
 */
export function isSatelliteLabel(label: string): boolean {
  return label.includes('*');
}

/**
 * Returns true if the text contains a date range, for example `Mar 1 - Mar 3`.
 * @param text The text to check.
 */
export function hasDateRange(text: string): boolean {
  return DATE_RANGE.test(text);
}
/**
 * Extracts the event title from a text, ignoring date ranges and event chrome.
 * @param text The text to parse.
 * @returns The event title, or undefined if not found.
 */
export function eventTitle(text: string): string | undefined {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.find((line) => {
    if (EVENT_META.test(line)) return false;
    if (DATE_RANGE.test(line)) return false;
    return /[A-Za-z]{3,}/.test(line);
  });
}
