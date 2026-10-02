import { test, expect } from '@playwright/test';

test('home page lists all 35 tools', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /free online file converter/i })).toBeVisible();
  // Every tool links to /tools/<id>; 35 tools expected.
  const toolLinks = page.locator('a[href^="/tools/"]');
  await expect(toolLinks.first()).toBeVisible();
  expect(await toolLinks.count()).toBe(35);
});

test('a tool page renders its converter UI', async ({ page }) => {
  await page.goto('/tools/merge-pdf');
  await expect(page.getByRole('heading', { name: /merge pdf/i }).first()).toBeVisible();
  await expect(page.locator('input[type="file"]')).toBeAttached();
  await expect(page.getByText(/how to/i).first()).toBeVisible();
});

test('blog index lists articles', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: /blog/i }).first()).toBeVisible();
  expect(await page.locator('a[href^="/blog/"]').count()).toBeGreaterThanOrEqual(15);
});

test('unknown tool shows the 404 page', async ({ page }) => {
  const res = await page.goto('/tools/does-not-exist');
  expect(res?.status()).toBe(404);
});
