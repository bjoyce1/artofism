import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PurchaseConfetti } from '@/components/ui/confetti';

const mocks = vi.hoisted(() => ({ burst: Object.assign(vi.fn(), { reset: vi.fn() }), reduced: false }));
vi.mock('canvas-confetti', () => ({ default: { create: () => mocks.burst } }));
vi.mock('framer-motion', () => ({ useReducedMotion: () => mocks.reduced }));
const purchase = { id: 'confirmed', provider_order_id: 'confirmed-order', status: 'completed' };

describe('gold purchase confetti', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); mocks.reduced = false; });
  afterEach(cleanup);
  it('fires two angled bursts totaling 120 particles only after confirmation', () => {
    const view = render(<PurchaseConfetti purchase={null} hasAccess={false} />);
    expect(mocks.burst).not.toHaveBeenCalled();
    view.rerender(<PurchaseConfetti purchase={purchase} hasAccess={true} />);
    expect(mocks.burst).toHaveBeenCalledTimes(2);
    expect(mocks.burst.mock.calls[0][0]).toMatchObject({ particleCount: 60, angle: 60, disableForReducedMotion: true });
    expect(mocks.burst.mock.calls[1][0]).toMatchObject({ particleCount: 60, angle: 120, disableForReducedMotion: true });
  });
  it('does not replay on page remount for the same order', () => {
    const view = render(<PurchaseConfetti purchase={purchase} hasAccess />);
    view.unmount();
    render(<PurchaseConfetti purchase={purchase} hasAccess />);
    expect(mocks.burst).toHaveBeenCalledTimes(2);
  });
  it('never fires in error/pending states or reduced motion', () => {
    const view = render(<PurchaseConfetti purchase={{ ...purchase, status: 'failed' }} hasAccess />);
    expect(mocks.burst).not.toHaveBeenCalled();
    mocks.reduced = true;
    view.rerender(<PurchaseConfetti purchase={purchase} hasAccess />);
    expect(mocks.burst).not.toHaveBeenCalled();
  });
});