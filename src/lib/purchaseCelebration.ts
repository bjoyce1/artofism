export interface CelebrationPurchase { id: string; provider_order_id: string | null; status: string }

/** Claims a confirmed order once per browser session; unavailable storage fails closed. */
export function claimPurchaseCelebration(purchase: CelebrationPurchase | null, hasAccess: boolean, reducedMotion: boolean, storage: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  if (!hasAccess || reducedMotion || !purchase || purchase.status !== 'completed') return false;
  const key = `ism:purchase-celebration:${purchase.provider_order_id || purchase.id}`;
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}