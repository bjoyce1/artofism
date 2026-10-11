import { test, expect } from '@playwright/test';
import { introduction } from '../src/data/bookContent';

for (const width of [375, 1440]) {
  test(`homepage fits the height budget including the short text reveal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const dimensions = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth }));
    expect(dimensions.height).toBeLessThan(width === 375 ? 9600 : 8100);
    expect(dimensions.width).toBeLessThanOrEqual(width);
  });
}

test('Introduction expands and collapses inline with all paragraphs retained', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator('#introduction');
  const originalHeight = await intro.evaluate(el => el.clientHeight);
  for (const paragraph of introduction.paragraphs) await expect(intro.getByText(paragraph, { exact: true })).toHaveCount(1);
  const expand = intro.getByRole('button', { name: 'Keep reading the Introduction' });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await expand.click();
  const collapse = intro.getByRole('button', { name: 'Collapse', exact: true });
  await expect(collapse).toHaveAttribute('aria-expanded', 'true');
  await collapse.click();
  await expect(expand).toBeVisible();
  await page.waitForTimeout(600);
  expect(await intro.evaluate(el => el.clientHeight)).toBeLessThanOrEqual(originalHeight + 1);
  await expect(page).toHaveURL(/\/$/);
});

test('full acknowledgments are linked from the compact homepage', async ({ page }) => {
  await page.goto('/');
  await page.locator('#acknowledgments').getByRole('link', { name: 'Read the full acknowledgments →' }).click();
  await expect(page).toHaveURL(/\/acknowledgments$/);
  await expect(page).toHaveTitle('Acknowledgments | The Art of ISM');
  await expect(page.getByRole('heading', { name: 'Mentors, Influence, and Foundation' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Download the Art of ISM Album' })).toHaveCount(1);
});