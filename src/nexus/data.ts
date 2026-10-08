export const systems = [
  { name: 'SALES AI', label: 'Ventas', role: 'Cada oportunidad, conectada.', description: 'Agentes comerciales que investigan oportunidades, priorizan conversaciones y coordinan el seguimiento.', example: 'Una oportunidad ficticia pasa de la investigación a una propuesta personalizada.', event: 'Oportunidad de demostración priorizada', position: [-4.1, 1.8, 0] as const, shape: 'octahedron' },
  { name: 'SECURITY AI', label: 'Ciberseguridad', role: 'Una red que se anticipa.', description: 'Detección de señales, análisis de riesgo y coordinación de respuestas para proteger la operación.', example: 'Una señal sintética activa un análisis y una respuesta de contención simulada.', event: 'Señal sintética analizada y contenida', position: [0, 3.15, -0.8] as const, shape: 'icosahedron' },
  { name: 'OPERATIONS AI', label: 'Operaciones', role: 'Menos fricción. Más acción.', description: 'Procesos conectados que distribuyen tareas y coordinan flujos entre los equipos de la empresa.', example: 'Un flujo de prueba asigna tareas y sincroniza sus estados con el resto de sistemas.', event: 'Flujo de prueba sincronizado', position: [4.1, 1.8, 0] as const, shape: 'box' },
  { name: 'FINANCE AI', label: 'Finanzas', role: 'Decisiones con perspectiva.', description: 'Análisis de escenarios para comprender costes, anticipar necesidades y apoyar decisiones financieras.', example: 'Un escenario ficticio compara alternativas de asignación de recursos, sin ejecutar operaciones.', event: 'Escenario financiero de ejemplo calculado', position: [4.1, -1.8, 0.3] as const, shape: 'tetrahedron' },
  { name: 'KNOWLEDGE AI', label: 'Conocimiento', role: 'La memoria de la empresa.', description: 'Conocimiento compartido que conecta documentos, contexto y aprendizajes de todos los sistemas.', example: 'Una consulta de demostración recupera contexto local para apoyar una tarea comercial.', event: 'Contexto local de demostración recuperado', position: [0, -3.15, -0.8] as const, shape: 'dodecahedron' },
  { name: 'CREATIVE AI', label: 'Creatividad', role: 'Ideas que toman forma.', description: 'Conceptos, contenido y variaciones creativas coordinados con los objetivos de la organización.', example: 'Un brief ficticio se convierte en una propuesta de campaña previamente definida.', event: 'Propuesta creativa de muestra preparada', position: [-4.1, -1.8, 0.3] as const, shape: 'torus' },
] as const;

export const ACTIVATION_SECONDS = 10;
export const PRESENTATION_SECONDS = 48;
export type DemoState = { elapsed: number; phase: 'idle' | 'activating' | 'active' };
export type DemoAction = { type: 'reset' } | { type: 'activate' } | { type: 'tick'; delta: number };
export const initialDemo: DemoState = { elapsed: 0, phase: 'idle' };
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'reset') return initialDemo;
  if (action.type === 'activate') return state.phase === 'idle' ? { elapsed: 0, phase: 'activating' } : state;
  if (state.phase !== 'activating') return state;
  const elapsed = Math.min(ACTIVATION_SECONDS, state.elapsed + action.delta);
  return { elapsed, phase: elapsed >= ACTIVATION_SECONDS ? 'active' : 'activating' };
}
export function activeCount(state: DemoState) {
  return state.phase === 'active' ? systems.length : Math.min(systems.length, Math.floor(state.elapsed / 1.4));
}
