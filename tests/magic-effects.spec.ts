import { expect, test } from '@playwright/test';

test('gold spotlight keeps the chapter card a single navigable link', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.magic-card').first();
  await card.hover();
  await card.click();
  await expect(page).toHaveURL(/\/chapter\/1$/);
});

test('direct signed-out success visits never claim a celebration', async ({ page }) => {
  await page.goto('/unlock/success');
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('ism:purchase-celebration:')))).toEqual([]);
  await page.reload();
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('ism:purchase-celebration:')))).toEqual([]);
});