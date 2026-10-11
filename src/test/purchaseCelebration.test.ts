import { describe, expect, it } from 'vitest';
import { claimPurchaseCelebration } from '@/lib/purchaseCelebration';

const purchase = { id: 'purchase-1', provider_order_id: 'order-1', status: 'completed' };
function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
describe('purchase celebration', () => {
  it('fires at most once per order, including refreshes', () => {
    const session = storage();
    expect(claimPurchaseCelebration(purchase, true, false, session)).toBe(true);
    expect(claimPurchaseCelebration({ ...purchase }, true, false, session)).toBe(false);
    expect(claimPurchaseCelebration({ ...purchase, provider_order_id: 'order-2' }, true, false, session)).toBe(true);
  });
  it('does not celebrate loading or unconfirmed purchases', () => {
    expect(claimPurchaseCelebration(null, true, false, storage())).toBe(false);
    expect(claimPurchaseCelebration({ ...purchase, status: 'pending' }, true, false, storage())).toBe(false);
    expect(claimPurchaseCelebration({ ...purchase, status: 'refunded' }, true, false, storage())).toBe(false);
  });
  it('requires confirmed access', () => {
    expect(claimPurchaseCelebration(purchase, false, false, storage())).toBe(false);
  });
  it('disables confetti for reduced motion without consuming the order', () => {
    const session = storage();
    expect(claimPurchaseCelebration(purchase, true, true, session)).toBe(false);
    expect(claimPurchaseCelebration(purchase, true, false, session)).toBe(true);
  });
  it('fails closed if session storage is unavailable', () => {
    expect(claimPurchaseCelebration(purchase, true, false, { getItem: () => { throw new Error('blocked'); }, setItem: () => {} })).toBe(false);
  });
});