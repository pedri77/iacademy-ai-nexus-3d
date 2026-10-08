import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/iacademy-ai-nexus-3d/',
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry', screenshot: 'only-on-failure',
    launchOptions: { args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173/iacademy-ai-nexus-3d/', reuseExistingServer: !process.env.CI },
});
