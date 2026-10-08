import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-webgl', '--use-gl=angle', '--use-angle=metal'] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, recordVideo: { dir: 'artifacts/raw', size: { width: 1920, height: 1080 } } });
const page = await context.newPage();
await page.goto('http://127.0.0.1:4173/iacademy-ai-nexus-3d/');
await page.locator('canvas').waitFor();
await page.getByRole('button', { name: /MODO PRESENTACIÓN/ }).click();
// Real-time recording: intentional duration, not a test synchronization sleep.
await new Promise(resolve => setTimeout(resolve, 47000));
await page.screenshot({ path: 'artifacts/nexus-1920.png' });
const video = page.video();
await context.close();
await video.saveAs('artifacts/nexus-demo.webm');
await browser.close();
console.log('Captured artifacts/nexus-demo.webm');
