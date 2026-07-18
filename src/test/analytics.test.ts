import { describe, it, expect, vi, beforeEach } from 'vitest';

const invokeMock = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: (...a: any[]) => invokeMock(...a) } },
}));

import { trackEvent } from '@/lib/analytics';

describe('trackEvent', () => {
  beforeEach(() => {
    invokeMock.mockClear();
  });

  it('routes through the log-analytics Edge Function', async () => {
    await trackEvent('page_view', { path: '/' });
    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock.mock.calls[0][0]).toBe('log-analytics');
    expect(invokeMock.mock.calls[0][1].body.eventName).toBe('page_view');
  });

  it('strips fields whose name looks like PII', async () => {
    await trackEvent('checkout_success_a', {
      email: 'user@example.com',
      orderId: 'PAY-123',
      customerEmail: 'x@y.com',
      duration_ms: 1234,
    });
    const props = invokeMock.mock.calls[0][1].body.properties;
    expect(props).not.toHaveProperty('email');
    expect(props).not.toHaveProperty('orderId');
    expect(props).not.toHaveProperty('customerEmail');
    expect(props.duration_ms).toBe(1234);
  });

  it('debounces repeated identical events within the throttle window', async () => {
    await trackEvent('debounce_test');
    await trackEvent('debounce_test');
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it('never throws when the network layer rejects', async () => {
    invokeMock.mockRejectedValueOnce(new Error('boom'));
    await expect(trackEvent('never_throws_ok')).resolves.toBeUndefined();
  });
});
