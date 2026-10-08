import { Component, Suspense, lazy, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ACTIVATION_SECONDS, PRESENTATION_SECONDS, activeCount, demoReducer, initialDemo, systems } from './data';

const Scene = lazy(() => import('./Scene'));

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function useEnvironment() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return { reduced, visible };
}

function Mark() {
  return <svg aria-hidden="true" viewBox="0 0 36 36" className="brand-mark"><path d="M18 2 33 10.5v15L18 34 3 25.5v-15Z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m10 24 8-15 8 15h-5l-3-6-3 6Z" fill="currentColor" /></svg>;
}

export default function App() {
  const [demo, dispatch] = useReducer(demoReducer, initialDemo);
  const [selected, setSelected] = useState<number | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [paused, setPaused] = useState(false);
  const [clean, setClean] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const { reduced, visible } = useEnvironment();
  const playheadRef = useRef(0);
  const lastStage = useRef(-1);
  const online = activeCount(demo);
  const system = selected === null ? null : systems[selected];
  const onFailure = useCallback(() => setFailed(true), []);
  const onReady = useCallback(() => setReady(true), []);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' }); setSelected(null); setPresentation(false); setPaused(false);
    playheadRef.current = 0; setPlayhead(0); lastStage.current = -1;
  }, []);
  const startPresentation = useCallback(() => {
    reset(); setPresentation(true);
  }, [reset]);
  const selectNode = useCallback((index: number) => {
    setSelected(index); setPresentation(false); setPaused(false);
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setClean(false); setPresentation(false); setPaused(false); }
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) setClean(value => !value);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    if (!visible || paused || (!presentation && demo.phase !== 'activating')) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - previous) / 1000, 0.25);
      previous = now;
      dispatch({ type: 'tick', delta });
      if (!presentation) return;
      playheadRef.current += delta;
      if (playheadRef.current >= PRESENTATION_SECONDS) {
        playheadRef.current = 0; lastStage.current = -1; dispatch({ type: 'reset' });
      }
      const time = playheadRef.current;
      setPlayhead(time);
      const stage = time < 5 ? 0 : time < 23 ? 1 + Math.floor((time - 5) / 3) : time < 35 ? 7 : 8;
      if (stage !== lastStage.current) {
        lastStage.current = stage;
        setSelected(stage > 0 && stage < 7 ? stage - 1 : null);
        if (stage === 7) dispatch({ type: 'activate' });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [visible, paused, presentation, demo.phase]);

  const status = demo.phase === 'active' ? 'SISTEMA AUTÓNOMO ACTIVO' : demo.phase === 'activating' ? 'ACTIVANDO SISTEMAS' : 'NÚCLEO EN ESPERA';
  return <main className={`nexus ${clean ? 'is-clean' : ''}`}>
    <div className="scene" role="img" aria-busy={!ready && !failed} aria-label={`Red 3D con un núcleo y seis sistemas. ${online} sistemas activos. Usa el selector de sistemas para explorar la red.`}>
      {!failed && <SceneBoundary key={sceneKey} onError={onFailure}>
        <Suspense fallback={<div className="scene-loading">Construyendo el núcleo 3D…</div>}>
          <Scene selected={selected} online={online} reduced={reduced} visible={visible} paused={paused} presenting={presentation} clean={clean} onSelect={selectNode} onFailure={onFailure} onReady={onReady} />
        </Suspense>
      </SceneBoundary>}
    </div>
    <div className="vignette" aria-hidden="true" />
    <header className="topbar hud">
      <a className="brand" href={import.meta.env.BASE_URL} aria-label="IAcademy, inicio"><Mark /><span>IACADEMY<span className="brand-sub">INTELLIGENCE LAB</span></span></a>
      <div className="demo-badge"><span className="status-dot" /> DEMO · DATOS SIMULADOS</div>
      <button className="quiet presentation-button" onClick={presentation ? () => { setPresentation(false); setPaused(false); } : startPresentation} aria-pressed={presentation}><span aria-hidden="true">▷</span> {presentation ? 'SALIR DE PRESENTACIÓN' : 'MODO PRESENTACIÓN'}</button>
    </header>

    <section className="title hud" aria-label="AI Nexus 3D">
      <p className="eyebrow">THE AUTONOMOUS ENTERPRISE</p>
      <h1>AI NEXUS <span>3D</span></h1>
      <p className="intro">Seis sistemas. Una inteligencia conectada.</p>
    </section>

    <nav className="systems hud" aria-label="Seleccionar sistema">
      <div className="section-label">SISTEMAS CONECTADOS <span>{String(systems.length).padStart(2, '0')}</span></div>
      {systems.map((item, index) => <button className={`system-button ${selected === index ? 'selected' : ''}`} key={item.name} onClick={() => selectNode(index)} aria-pressed={selected === index}>
        <span className="system-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="system-text"><strong>{item.name}</strong><span>{item.label}</span></span>
        <span className={`node-state ${index < online ? 'online' : ''}`} aria-label={index < online ? 'Activo' : 'En espera'}>{index < online ? '●' : '○'}</span>
      </button>)}
    </nav>

    <aside className="context hud" aria-label="Panel contextual">
      <div className="section-label">{system ? `SISTEMA / ${String(selected! + 1).padStart(2, '0')}` : 'NÚCLEO CENTRAL'}<span className="cross" aria-hidden="true">+</span></div>
      <h2>{system ? system.name : 'Todo empieza\nen el núcleo.'}</h2>
      <p className="context-lead">{system ? system.role : 'Una nueva forma de imaginar la empresa.'}</p>
      <p>{system ? system.description : 'Explora la red. Conecta sus capacidades. Observa cómo seis sistemas trabajan como uno.'}</p>
      <div className="context-example"><span className="section-label">{system ? 'ESCENARIO SIMULADO' : 'EXPERIENCIA INTERACTIVA'}</span><p>{system ? system.example : 'Selecciona un sistema o activa la empresa autónoma para iniciar la simulación.'}</p></div>
      {system && <button className="text-button" onClick={() => { setSelected(null); setPresentation(false); }}>Volver al núcleo <span aria-hidden="true">↗</span></button>}
      <div className="event-log" aria-live="polite" aria-atomic="true">
        <span className="section-label">EVENTOS SIMULADOS</span>
        <p>{online ? systems[online - 1].event : 'A la espera de activación.'}</p>
      </div>
    </aside>

    <div className="core-caption hud" aria-hidden="true"><span className="caption-line" /><span>NEXUS / CENTRAL INTELLIGENCE</span><span className="caption-line" /></div>

    {failed && <section className="failure" role="alert"><h2>La vista 3D no está disponible.</h2><p>Activa la aceleración gráfica o prueba otro navegador. Puedes seguir explorando los sistemas y la simulación con los controles.</p><button onClick={() => { setFailed(false); setSceneKey(value => value + 1); }}>Reintentar vista 3D</button></section>}

    <footer className="bottom hud">
      <div className="status-block"><span className="section-label"><span className={`status-dot ${demo.phase !== 'idle' ? 'lit' : ''}`} /> {status}</span><span className="status-detail">{String(online).padStart(2, '0')} / {String(systems.length).padStart(2, '0')} sistemas sincronizados</span><div className="progress" role="progressbar" aria-label="Activación de la red" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(demo.elapsed / ACTIVATION_SECONDS * 100)}><span style={{ transform: `scaleX(${demo.elapsed / ACTIVATION_SECONDS})` }} /></div></div>
      <div className="activation-controls"><button className="activate" disabled={demo.phase !== 'idle'} onClick={() => { setPresentation(false); setPaused(false); dispatch({ type: 'activate' }); }}><span className="power" aria-hidden="true">⏻</span>{demo.phase === 'active' ? 'EMPRESA AUTÓNOMA ACTIVA' : demo.phase === 'activating' ? 'ACTIVANDO EMPRESA…' : 'ACTIVAR EMPRESA AUTÓNOMA'}<span aria-hidden="true">↗</span></button><button className="reset" onClick={reset}>RESTABLECER DEMO <span aria-hidden="true">↺</span></button></div>
    </footer>

    {presentation && <div className="presentation-controls hud" aria-label="Controles de presentación"><span>{Math.floor(playhead).toString().padStart(2, '0')} / {PRESENTATION_SECONDS} s</span><button onClick={() => setPaused(value => !value)}>{paused ? 'Reanudar' : 'Pausar'}</button><button onClick={startPresentation}>Reiniciar</button></div>}
    {!presentation && <button className="motion-toggle hud" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Reanudar movimiento' : 'Pausar movimiento'}</button>}
    <button className="clean-toggle" onClick={() => setClean(value => !value)} aria-pressed={clean}>{clean ? 'MOSTRAR CONTROLES · H' : 'OCULTAR PANELES · H'}</button>
    {presentation && playhead >= 35 && <div className="final-brand"><Mark /><span>IACADEMY</span><p>THE AUTONOMOUS ENTERPRISE</p><small>DEMO · DATOS SIMULADOS</small></div>}
  </main>;
}
