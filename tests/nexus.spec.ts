import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('six systems, repeatable activation, interruption and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  const names = ['SALES AI', 'SECURITY AI', 'OPERATIONS AI', 'FINANCE AI', 'KNOWLEDGE AI', 'CREATIVE AI'];
  for (const name of names) {
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  const activate = page.getByRole('button', { name: /ACTIVAR EMPRESA AUTÓNOMA/ });
  const reset = page.getByRole('button', { name: /RESTABLECER DEMO/ });
  await activate.click();
  await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
  await reset.click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  for (let round = 0; round < 2; round++) {
    await activate.click();
    await expect(page.getByText('SISTEMA AUTÓNOMO ACTIVO', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    await reset.click();
    await expect(activate).toBeEnabled();
  }
  expect(errors).toEqual([]);
});

test('presentation pauses, resumes, restarts, loops and restores hidden controls', async ({ page }) => {
  test.setTimeout(100000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: /MODO PRESENTACIÓN/ }).click();
  await expect(page.getByRole('heading', { name: 'SECURITY AI', exact: true })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reanudar', exact: true })).toBeVisible();
  const counter = page.locator('.presentation-controls > span');
  const pausedTime = await counter.innerText();
  const started = await page.evaluate(() => performance.now());
  await page.waitForFunction(start => performance.now() - start >= 1200, started);
  await expect(counter).toHaveText(pausedTime);
  await page.getByRole('button', { name: 'Reanudar', exact: true }).click();
  await expect(page.getByText('SISTEMA AUTÓNOMO ACTIVO', { exact: true })).toBeVisible({ timeout: 40000 });
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0', { timeout: 20000 });
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(counter).toHaveText(/0[01] \/ 48 s/);
  await page.getByRole('button', { name: /OCULTAR PANELES/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).not.toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`@sweep @a11y ${width}px, reduced motion, contrast and targets`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width >= 1440 ? 1080 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await expect(page.locator('canvas')).toBeVisible();
    await page.getByRole('button', { name: /OPERATIONS AI/ }).click();
    await expect(page.getByRole('heading', { name: 'OPERATIONS AI', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const tiny = await page.locator('button, a').evaluateAll(elements => elements.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && Math.min(rect.width, rect.height) < 24;
    }).map(element => element.textContent));
    expect(tiny).toEqual([]);
    expect(await page.locator('*').evaluateAll(elements => elements.filter(element => getComputedStyle(element).animationName !== 'none').length)).toBe(0);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    await testInfo.attach('axe', { body: JSON.stringify(scan), contentType: 'application/json' });
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: `test-results/nexus-${width}.png`, fullPage: true });
  });
}

test('keyboard focus and WebGL context recovery', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('img', { name: /Red 3D/ })).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('link', { name: 'IAcademy, inicio' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /MODO PRESENTACIÓN/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /SALES AI/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'SALES AI', exact: true })).toBeVisible();
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.getByRole('alert')).toContainText('La vista 3D no está disponible.');
  await page.getByRole('button', { name: 'Reintentar vista 3D' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('alert')).not.toBeVisible();
});
