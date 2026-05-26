/**
 * Parse comma- or newline-separated text (genes, coordinates, etc.).
 * Matches NavBarDropdown onChangeGene / onChangeCoord behavior.
 */
export function parseDelimitedInput(raw) {
  if (raw == null) {
    return [];
  }
  let text = String(raw).trim();
  if (text.length === 0) {
    return [];
  }

  let delimiter = '\n';
  if (text.indexOf('\n') !== -1 && text.indexOf(',') === -1) {
    delimiter = '\n';
  } else if (text.indexOf('\n') === -1 && text.indexOf(',') !== -1) {
    delimiter = ',';
  } else if (text.indexOf('\n') !== -1 && text.indexOf(',') !== -1) {
    if (text.split(',').length > text.split('\n').length) {
      delimiter = ',';
      text = text.replace(/\n/g, '');
    } else {
      delimiter = '\n';
    }
  }

  return text
    .split(delimiter)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
