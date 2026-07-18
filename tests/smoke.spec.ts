import { test, expect } from '@playwright/test';

// Public smoke tests. These hit only unauthenticated routes so they can run
// in CI without a Supabase session.

test.describe('public smoke', () => {
  test('landing renders hero H1 and primary CTA', async ({ page }) => {
    await page.goto('/');
    // sr-only H1 for SEO/a11y
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /begin the book/i })).toBeVisible();
  });

  test('landing has unique title and description meta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/art of ism/i);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
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

  test('free chapter 1 is readable without auth', async ({ page }) => {
    await page.goto('/chapter/1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('paid chapter renders lock screen when signed out', async ({ page }) => {
    await page.goto('/chapter/2');
    await expect(page.getByText(/unlock|sign in|locked/i).first()).toBeVisible();
  });

  test('mobile nav is visible and within viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box && box.width).toBeLessThanOrEqual(375);
  });
});
