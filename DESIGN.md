# Dirección visual

Experiencia de laboratorio para explicar una empresa autónoma en un directo 16:9. Cabina sci-fi cinematográfica, geometría procedural y un único acento rojo. Variación 4/10, movimiento 7/10, densidad 4/10. Una pantalla, sin landing comercial.

El brief gobierna las excepciones a las reglas genéricas: paleta hexadecimal exacta, rojo saturado, tema oscuro fijo, animación sostenida y stack Vite (las reglas exclusivas de Next.js no aplican).

Los tokens viven en `src/nexus/styles.css`: background #08090D, surface #11131A, foreground #F5F5F5 para ambas superficies, muted #9CA3AF, primary #E50914, energy #FF3344, border #30333E. El botón primary usa on-primary #FFFFFF para superar 4.5:1 de contraste; el blanco puro se limita a ese texto, no a superficies. La escena usa esos mismos colores en materiales de Three.js. Escala de espaciado de 4/8 px, radio 4 px, capas HUD 10 y overlay 20. Fuente de sistema Avenir Next con fallback Segoe UI, sin peticiones externas.

Composición: marca y controles superiores; título grande; escena central; selector izquierdo; contexto derecho; activación inferior. En móvil, escena y paneles se apilan. La rotación revela volumen, los pulsos comunican energía y las partículas señalan conexiones activas. Movimiento reducido elimina rotación y transiciones de cámara; el estado lógico sigue funcionando. Pausa manual y pestaña oculta detienen la simulación y el render continuo.
