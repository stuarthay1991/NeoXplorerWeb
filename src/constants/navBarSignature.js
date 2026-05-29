export const NEO_SET_SIGNATURE_EVENT = 'neo-set-signature';

/**
 * @param {{ signature: string; simpleName?: string }} payload
 */
export function dispatchSignatureSelection(payload) {
  const signature = payload?.signature;
  if (typeof signature !== 'string' || signature.trim() === '') {
    return false;
  }
  const simpleName =
    typeof payload?.simpleName === 'string' && payload.simpleName.trim() !== ''
      ? payload.simpleName
      : signature;
  window.dispatchEvent(
    new CustomEvent(NEO_SET_SIGNATURE_EVENT, {
      detail: { signature, simpleName },
    }),
  );
  return true;
}
