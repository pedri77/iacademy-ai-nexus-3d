# Directo · operación y recuperación

1. Antes de salir: `npm ci && npm run build`; abrir `npm run preview`, ruta `/iacademy-ai-nexus-3d/`. Si se publicó, comprobar también la URL devuelta por GitHub Pages.
2. Escritorio a 1920×1080, navegador con aceleración gráfica, zoom 100 %. Cerrar pestañas pesadas. Guardar una captura MP4 local de respaldo.
3. Mostrar apertura. Explicar que todo es geometría procedural y datos simulados.
4. Seleccionar SALES AI y SECURITY AI; enseñar los paneles en español.
5. Pulsar ACTIVAR EMPRESA AUTÓNOMA. Esperar 10 s hasta SISTEMA AUTÓNOMO ACTIVO.
6. RESTABLECER DEMO demuestra que la secuencia es repetible sin recargar.
7. MODO PRESENTACIÓN recorre los seis nodos y activa la red. Pausar, reanudar, reiniciar. H para planos limpios; Escape restaura los controles.
8. Mostrar código y workflow. Afirmar publicación solo si se comprobó la URL real.

## Recuperación

- Sin internet: el preview local no requiere servicios remotos; mantenerlo abierto. No intentar instalar dependencias durante el directo.
- WebGL/contexto perdido: pulsar Reintentar vista 3D; si persiste, otro navegador con aceleración gráfica. La selección y el texto siguen disponibles. Reproducir el MP4 de respaldo.
- Baja fluidez: reducir tamaño de ventana o resolución, cerrar otras pestañas. DPR máximo 1.5 y sin postprocesado pesado.
- Secuencia detenida: la pestaña oculta y el botón Pausar detienen el tiempo intencionalmente. Reanudar o restablecer.
- Paneles desaparecidos: pulsar H o Escape.
- GitHub sin sesión: `gh auth login -h github.com`; seguir README. No afecta a la demo local.

No se ejecutan operaciones comerciales, de seguridad ni financieras. Los eventos y escenarios son ejemplos predefinidos, no resultados de IA real.
