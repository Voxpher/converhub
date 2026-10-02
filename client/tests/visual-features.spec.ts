import { test, expect } from '@playwright/test';

const pdfBytes = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>',
);

// 1x1 transparent PNG
const pngBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

// 1s mono 8kHz 16-bit silent WAV
function wavBytes(): Buffer {
  const samples = 8000;
  const data = Buffer.alloc(44 + samples * 2);
  data.write('RIFF', 0); data.writeUInt32LE(36 + samples * 2, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22); data.writeUInt32LE(8000, 24); data.writeUInt32LE(16000, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36);
  data.writeUInt32LE(samples * 2, 40);
  return data;
}

test('BUG1: pdf upload is accepted (no "not supported" error)', async ({ page }) => {
  await page.goto('/tools/merge-pdf');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'doc.pdf', mimeType: 'application/pdf', buffer: pdfBytes,
  });
  await expect(page.getByText('is not supported here')).toHaveCount(0);
  await expect(page.getByText('doc.pdf', { exact: true })).toBeVisible();
  const accept = await page.locator('input[type="file"]').getAttribute('accept');
  expect(accept).toContain('.pdf');
});

test('BUG1: mp4 upload accepted on video-to-mp3 with preview', async ({ page }) => {
  await page.goto('/tools/video-to-mp3');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'clip.mp4', mimeType: 'video/mp4', buffer: Buffer.from('fake'),
  });
  await expect(page.getByText('is not supported here')).toHaveCount(0);
  await expect(page.getByText('clip.mp4', { exact: true })).toBeVisible();
});

test('FEATURE4: image-crop shows the visual crop editor', async ({ page }) => {
  await page.goto('/tools/image-crop');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'pic.png', mimeType: 'image/png', buffer: pngBytes,
  });
  await expect(page.getByText('Draw your crop area on the image')).toBeVisible();
  // raw x/y fields must be replaced by the editor
  await expect(page.locator('#opt-x')).toHaveCount(0);
  await expect(page.locator('#opt-width')).toHaveCount(0);
  // aspect select stays visible
  await expect(page.locator('#opt-aspect')).toBeVisible();
});

test('FEATURE5: trim-audio shows the visual trim range', async ({ page }) => {
  await page.goto('/tools/trim-audio');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'tone.wav', mimeType: 'audio/wav', buffer: wavBytes(),
  });
  await expect(page.getByText('Select the part to keep')).toBeVisible();
  await expect(page.locator('#opt-start')).toHaveCount(0);
  await expect(page.locator('#trim-start')).toBeVisible();
});

test('FEATURE6: header has grouped Tools dropdown', async ({ page }) => {
  await page.goto('/');
  const btn = page.getByRole('button', { name: /^Tools/ });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByText('PDF Tools').first()).toBeVisible();
  await expect(page.getByText('Audio & Video').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('FEATURE2: word-counter page declares text result kind', async ({ page }) => {
  await page.goto('/tools/word-counter');
  await expect(page.getByRole('heading', { name: /word counter/i }).first()).toBeVisible();
});
