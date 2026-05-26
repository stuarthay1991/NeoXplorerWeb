import { parseDelimitedInput } from '../utils/parseDelimitedInput.js';

export const NEO_SET_GENES_EVENT = 'neo-set-genes';

export function dispatchGenesSelection(genes) {
  const list = Array.isArray(genes)
    ? genes.map((g) => String(g).trim()).filter((g) => g.length > 0)
    : parseDelimitedInput(genes);
  if (list.length === 0) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(NEO_SET_GENES_EVENT, { detail: { genes: list } }),
  );
  return true;
}
