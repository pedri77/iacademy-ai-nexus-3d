# IAcademy · AI NEXUS 3D

Demo interactiva de una empresa autónoma: núcleo procedural, seis sistemas, activación de 10 segundos y presentación automática de 48 segundos en bucle. Todos los eventos son locales y simulados. No hay agentes reales, backend, claves ni servicios externos.

## Ejecutar

Node.js 22.12 o posterior.

```bash
npm ci
npm run dev
```

Abrir la dirección que imprime Vite con la ruta `/iacademy-ai-nexus-3d/`.

```bash
npm run build
npm run preview
npx playwright install chromium
npm test
```

El build está en `dist/`. Preview sirve el build bajo la misma ruta que Pages. Dependencias resueltas en `package-lock.json`. Compatibilidad basada en la [documentación de React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/installation) y configuración de subdirectorio conforme a [Vite Pages](https://vite.dev/guide/static-deploy.html#github-pages).

## Controles

- Seleccionar los seis sistemas mediante ratón o Tab + Enter.
- Activar: secuencia progresiva de 10 segundos. Restablecer cancela cualquier secuencia.
- Presentación: núcleo, seis nodos, activación y cierre de marca; bucle de 48 segundos, con pausa y reinicio.
- H: ocultar/mostrar paneles. Escape: mostrar paneles y salir de presentación.
- Pausar movimiento detiene también el avance de la simulación. La pestaña oculta no consume render continuo.
- Se respeta movimiento reducido. Si falla WebGL, siguen disponibles paneles y simulación textual, con botón de reintento.

## GitHub Pages

Workflow preparado en `.github/workflows/deploy.yml`: build, tests y publicación desde `main`; las PR solo verifican. La base fija exige un repositorio llamado `iacademy-ai-nexus-3d` (actualiza `vite.config.ts` y la URL de tests si cambias el nombre).

Repositorio público autorizado: https://github.com/pedri77/iacademy-ai-nexus-3d. GitHub Actions verifica el proyecto y publica GitHub Pages desde `main`. La URL del despliegue aparece en el entorno `github-pages` del repositorio.

La publicación requiere una cuenta GitHub autenticada. Para crear un despliegue nuevo desde una copia local sin remoto:

```bash
gh auth login -h github.com
git init -b main
git add .
git commit -m "Build IAcademy AI Nexus 3D"
gh repo create iacademy-ai-nexus-3d --public --source=. --remote=origin
gh api --method POST repos/{owner}/iacademy-ai-nexus-3d/pages -f build_type=workflow
git push -u origin main
gh run watch
gh api repos/{owner}/iacademy-ai-nexus-3d/pages --jq .html_url
```

Si Pages ya está configurado, omite el POST. La última orden devuelve la URL real; abrirla y verificar la carga antes del directo.

Documentación: [guion de vídeo](docs/VIDEO-STORYBOARD.md), [runbook](docs/DEMO-RUNBOOK.md), [dirección visual](DESIGN.md).

## Vídeo de respaldo

Captura real del recorrido automático en `artifacts/nexus-demo.mp4`, 1920×1080, sin audio, menos de un minuto. El guion de 2:40 permite preparar una versión narrada más extensa. Los vídeos están excluidos de Git para mantener ligero el repositorio. Para repetir la captura, con preview abierto: `node scripts/record-demo.mjs` (requiere Chromium de Playwright); convertir el WebM a MP4 con FFmpeg.
