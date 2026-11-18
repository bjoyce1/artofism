import { test, expect } from '@playwright/test';

test('homepage band links to the Flip Book promo page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'See it in action' }).click();
  await expect(page).toHaveURL(/\/flipbook-edition$/);
  await expect(page).toHaveTitle('Flip Book Edition | The Art of ISM');
});

test('promo page renders the ad video and both buy paths without overflow', async ({ page }) => {
  await page.goto('/flipbook-edition');
  await expect(page.getByRole('heading', { name: /The Flip Book Edition/ })).toBeVisible();
  const video = page.locator('video');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('controls', /.*/);
  await expect(page.getByRole('link', { name: 'Open the Flip Book' })).toHaveAttribute('href', '/flipbook');
  await expect(page.getByRole('link', { name: 'Get Lifetime Access — $9.99' })).toHaveAttribute('href', '/unlock');
  await expect(page.getByRole('link', { name: 'Unlock Full Book — $9.99' }).first()).toHaveAttribute('href', '/unlock');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(1440);
});
