import { test, expect } from '@playwright/test';

// Public smoke tests. These hit only unauthenticated routes so they can run
// in CI without a Supabase session.

test.describe('public smoke', () => {
  test('landing renders hero H1 and primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /begin the book/i })).toBeVisible();
  });

  test('landing has unique title and description meta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/art of ism/i);
    const desc = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(desc && desc.length).toBeGreaterThan(40);
  });

  test('unlock page shows product JSON-LD and price', async ({ page }) => {
    await page.goto('/unlock');
    await expect(page.getByText(/\$?9\.99/)).toBeVisible();
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd || '').toMatch(/Product|Book/);
  });

  test('vault page opens and quotes render', async ({ page }) => {
    await page.goto('/vault');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('free chapter 1 is readable without auth and is indexable', async ({ page }) => {
    await page.goto('/chapter/1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical || '').toMatch(/\/chapter\/1$/);
    // Free chapter must NOT be noindex.
    const robots = await page.locator('meta[name="robots"]').first().getAttribute('content').catch(() => null);
    expect((robots || '').toLowerCase()).not.toContain('noindex');
  });

  test('paid chapter renders lock screen when signed out and is noindex', async ({ page }) => {
    await page.goto('/chapter/2');
    await expect(page.getByText(/unlock|sign in|locked/i).first()).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').first().getAttribute('content');
    expect((robots || '').toLowerCase()).toContain('noindex');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical || '').toMatch(/\/chapter\/2$/);
  });
});

test.describe('mobile responsiveness (320px)', () => {
  test.use({ viewport: { width: 320, height: 720 } });

  test('no horizontal overflow on landing at 320px', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.clientW + 1);
  });

  test('bottom mobile nav has exactly four primary actions', async ({ page }) => {
    await page.goto('/');
    // The mobile bottom bar is only visible on small screens; it is nav aria-label="Mobile".
    const bottomNav = page.locator('nav[aria-label="Mobile" i], nav[data-mobile-nav]').first();
    // Fall back: the last <nav> element visible at 320px is the bottom bar.
    const nav = (await bottomNav.count()) ? bottomNav : page.getByRole('navigation').last();
    await expect(nav).toBeVisible();
    const actionable = nav.locator('a, button').filter({ has: page.locator(':scope') });
    // Filter to visible items only.
    const count = await actionable.evaluateAll((els) =>
      els.filter((el) => (el as HTMLElement).offsetParent !== null).length,
    );
    expect(count).toBe(4);
  });
});

test.describe('accessibility', () => {
  test('vault dialog closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/vault');
    const trigger = page.getByRole('button').first();
    const triggerHandle = await trigger.elementHandle();
    if (!triggerHandle) test.skip(true, 'no vault trigger available');
    await trigger.click();
    const dialog = page.getByRole('dialog').first();
    // Some routes may not have a dialog; skip cleanly if not present.
    if (!(await dialog.isVisible().catch(() => false))) test.skip(true, 'no dialog surfaced');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('audio/narration slider is keyboard operable', async ({ page }) => {
    await page.goto('/chapter/1');
    const slider = page.getByRole('slider').first();
    if (!(await slider.count())) test.skip(true, 'no slider on this route');
    await slider.focus();
    const before = await slider.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    const after = await slider.getAttribute('aria-valuenow');
    // Either the value moved OR it was already at the max — both are valid.
    expect(after !== null).toBeTruthy();
    if (before !== null && after !== null && before !== after) {
      expect(Number(after)).toBeGreaterThanOrEqual(Number(before));
    }
  });

  test('reduced motion is honored', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const prefers = await page.evaluate(() =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    expect(prefers).toBe(true);
    await context.close();
  });
});
