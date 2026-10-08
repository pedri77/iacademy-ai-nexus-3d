import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { systems } from './data';

type SceneProps = {
  selected: number | null; online: number; reduced: boolean; paused: boolean;
  visible: boolean; presenting: boolean; clean: boolean;
  onSelect: (index: number) => void; onFailure: () => void; onReady: () => void;
};
const RED = '#FF3344';
const WHITE = '#F5F5F5';

function cloud(count: number, radius: number, shell = false) {
  const points = new Float32Array(count * 3);
  // Deterministic distribution keeps reloads and recordings reproducible.
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const angle = i * 2.39996323;
    const scale = shell ? radius : radius * (0.5 + ((i * 37) % 101) / 202);
    points.set([Math.cos(angle) * r * scale, y * scale, Math.sin(angle) * r * scale], i * 3);
  }
  return points;
}

function Core({ running, energized }: { running: boolean; energized: boolean }) {
  const group = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const dots = useMemo(() => cloud(680, 1.43, true), []);
  useFrame((_, delta) => {
    if (!running) return;
    time.current += Math.min(delta, 0.05);
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.z = Math.sin(time.current * 0.14) * 0.12;
    }
    if (heart.current) heart.current.scale.setScalar(1 + Math.sin(time.current * 1.8) * (energized ? 0.055 : 0.02));
  });
  return <group ref={group}>
    <mesh ref={heart}>
      <icosahedronGeometry args={[0.94, 2]} />
      <meshStandardMaterial color="#21090E" metalness={0.85} roughness={0.3} emissive={RED} emissiveIntensity={energized ? 0.8 : 0.18} flatShading />
    </mesh>
    <mesh rotation={[0.2, 0.4, 0.1]}>
      <icosahedronGeometry args={[1.17, 2]} />
      <meshBasicMaterial color={RED} wireframe transparent opacity={0.55} />
    </mesh>
    <mesh>
      <icosahedronGeometry args={[1.46, 1]} />
      <meshBasicMaterial color={RED} wireframe transparent opacity={0.18} />
    </mesh>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[dots, 3]} /></bufferGeometry>
      <pointsMaterial color={WHITE} size={0.028} transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
    {[0, 1, 2].map(i => <group key={i} rotation={[0.85 + i * 0.7, i * 0.65, i * 0.9]}>
      <mesh><torusGeometry args={[1.72 + i * 0.18, 0.009, 6, 160]} /><meshBasicMaterial color={i === 1 ? WHITE : RED} transparent opacity={i === 1 ? 0.65 : 0.9} /></mesh>
      <mesh position={[1.72 + i * 0.18, 0, 0]}><sphereGeometry args={[0.05, 12, 12]} /><meshBasicMaterial color={WHITE} /></mesh>
    </group>)}
    <sprite scale={[5.2, 5.2, 1]}><shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
      vertexShader={'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'}
      fragmentShader={'varying vec2 vUv; void main(){float d=length(vUv-0.5)*2.0; float a=pow(max(0.0,1.0-d),3.0)*0.25; gl_FragColor=vec4(1.0,0.015,0.045,a);}'}
    /></sprite>
  </group>;
}

function NodeShape({ index }: { index: number }) {
  switch (index) {
    case 0: return <octahedronGeometry args={[0.38]} />;
    case 1: return <icosahedronGeometry args={[0.38]} />;
    case 2: return <boxGeometry args={[0.54, 0.54, 0.54]} />;
    case 3: return <tetrahedronGeometry args={[0.44]} />;
    case 4: return <dodecahedronGeometry args={[0.38]} />;
    default: return <torusGeometry args={[0.29, 0.1, 12, 32]} />;
  }
}

function NetworkNode({ index, selected, online, running, onSelect }: {
  index: number; selected: boolean; online: boolean; running: boolean; onSelect: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const spark = useRef<THREE.Mesh>(null);
  const time = useRef(index * 0.4);
  const destination = useMemo(() => new THREE.Vector3(...systems[index].position), [index]);
  const path = useMemo(() => {
    const middle = destination.clone().multiplyScalar(0.5);
    middle.z += 0.5;
    return new THREE.QuadraticBezierCurve3(new THREE.Vector3(), middle, destination);
  }, [destination]);
  const points = useMemo(() => path.getPoints(48), [path]);
  useFrame((_, delta) => {
    if (!running) return;
    time.current += Math.min(delta, 0.05);
    if (mesh.current) { mesh.current.rotation.y += delta * 0.3; mesh.current.rotation.z += delta * 0.12; }
    if (spark.current) path.getPoint((time.current * 0.23) % 1, spark.current.position);
  });
  return <group>
    <Line points={points} color={online || selected ? RED : '#66323B'} lineWidth={online || selected ? 1.5 : 0.7} transparent opacity={online || selected ? 0.85 : 0.5} />
    {online && <mesh ref={spark} position={destination.clone().multiplyScalar(0.5)}><sphereGeometry args={[0.055, 8, 8]} /><meshBasicMaterial color={WHITE} /></mesh>}
    <group position={destination}>
      <mesh ref={mesh} scale={selected ? 1.3 : 1} onClick={event => { event.stopPropagation(); onSelect(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
        <NodeShape index={index} />
        <meshStandardMaterial color={selected ? WHITE : '#78323B'} metalness={0.6} roughness={0.25} emissive={RED} emissiveIntensity={online || selected ? 1.1 : 0.25} wireframe={index === 1 || index === 4} />
      </mesh>
      <mesh rotation={[0.3, 0.2, 0]}><torusGeometry args={[0.64, 0.006, 4, 64]} /><meshBasicMaterial color={selected ? WHITE : RED} transparent opacity={selected ? 0.9 : 0.35} /></mesh>
      {selected && <mesh><ringGeometry args={[0.76, 0.78, 64]} /><meshBasicMaterial color={RED} transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>}
    </group>
  </group>;
}

function CameraRig({ selected, running, reduced, presenting }: { selected: number | null; running: boolean; reduced: boolean; presenting: boolean }) {
  const { camera, size } = useThree();
  const time = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    if (running) time.current += Math.min(delta, 0.05);
    const distance = Math.max(11.5, 5.4 / (Math.tan(THREE.MathUtils.degToRad(43 / 2)) * size.width / size.height));
    const node = selected === null ? null : systems[selected].position;
    const orbit = presenting && !reduced ? Math.sin(time.current * 0.13) * 1.1 : 0;
    target.set((node ? node[0] * 0.12 : 0) + orbit, node ? node[1] * 0.09 : 0.25, distance + (reduced ? 0 : Math.max(0, 3 - time.current * 0.8)));
    if (reduced) camera.position.copy(target);
    else if (running) camera.position.lerp(target, 1 - Math.exp(-delta * 2));
    lookAt.set(node ? node[0] * 0.04 : 0, node ? node[1] * 0.04 : 0, 0);
    camera.lookAt(lookAt);
  });
  return null;
}

function World(props: SceneProps) {
  const running = !props.reduced && !props.paused && props.visible;
  const stars = useMemo(() => cloud(650, 15), []);
  const { gl, invalidate } = useThree();
  useEffect(() => { invalidate(); }, [props, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); props.onFailure(); };
    canvas.addEventListener('webglcontextlost', lost);
    props.onReady();
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, props.onFailure, props.onReady]);
  return <>
    <color attach="background" args={['#08090D']} />
    <ambientLight intensity={0.65} />
    <pointLight position={[0, 0, 3]} color={RED} intensity={35} distance={14} />
    <directionalLight position={[3, 4, 5]} color={WHITE} intensity={3} />
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial size={0.016} color="#9CA3AF" transparent opacity={0.55} depthWrite={false} /></points>
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, -0.12, -2]}>
      {[3, 4.5, 6].map(radius => <mesh key={radius}><torusGeometry args={[radius, 0.007, 4, 160]} /><meshBasicMaterial color={RED} transparent opacity={0.14} /></mesh>)}
    </group>
    <Core running={running} energized={props.online > 0} />
    {systems.map((s, i) => <NetworkNode key={s.name} index={i} selected={props.selected === i} online={i < props.online} running={running} onSelect={() => props.onSelect(i)} />)}
    <CameraRig selected={props.selected} running={running} reduced={props.reduced} presenting={props.presenting} />
  </>;
}

export default function Scene(props: SceneProps) {
  return <Canvas camera={{ position: [0, 0.25, 16.5], fov: 43 }} dpr={[1, 1.5]}
    frameloop={props.visible && !props.reduced && !props.paused ? 'always' : 'demand'}
    gl={{ antialias: true, powerPreference: 'low-power' }}
    onCreated={({ gl }) => { gl.setClearColor('#08090D'); }}>
    <World {...props} />
  </Canvas>;
}
