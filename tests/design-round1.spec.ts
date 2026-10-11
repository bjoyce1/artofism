import { test, expect } from '@playwright/test';
import { allCodes } from '../src/data/bookContent';

for (const viewport of [{ width: 375, height: 812 }, { width: 360, height: 740 }, { width: 390, height: 844 }, { width: 640, height: 900 }, { width: 1440, height: 900 }]) {
  test(`hero choices remain readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const hero = page.locator('section').filter({ has: page.getByRole('heading', { level: 1 }) });
    const free = hero.getByRole('link', { name: 'Read Chapter 1 Free', exact: true });
    const paid = hero.getByRole('link', { name: 'Unlock Full Book — $9.99', exact: true });
    await expect(free).toHaveAttribute('href', '/chapter/1');
    await expect(paid).toHaveAttribute('href', '/unlock');
    await page.waitForTimeout(2200);
    for (const link of [free, paid]) {
      const box = await link.boundingBox();
      if (!box) throw new Error('Hero choice has no bounds');
      if (viewport.width < 640) expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      else expect(await link.evaluate(el => getComputedStyle(el).whiteSpace)).toBe('nowrap');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  });
}

test('public Codes exposes ten paid titles without their text', async ({ page }) => {
  await page.goto('/codes');
  await expect(page.locator('li h2')).toHaveCount(10);
  for (const code of allCodes) {
    for (const principle of code.principles) await expect(page.getByText(principle, { exact: true })).toHaveCount(0);
    await expect(page.getByText(code.closing, { exact: true })).toHaveCount(0);
  }
  await page.getByRole('link', { name: 'Read Chapter 1 Free', exact: true }).click();
  await expect(page).toHaveURL(/\/chapter\/1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('public TOC identifies Chapter 1 and ten locked chapters', async ({ page }) => {
  await page.goto('/');
  const toc = page.locator('#chapters');
  await expect(toc.locator('a[href="/chapter/1"]').getByText('Free', { exact: true })).toHaveCount(1);
  await expect(toc.locator('[aria-label="Full access required"]')).toHaveCount(10);
});

test('search shortcut remains available without its nav badge', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav kbd')).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
});