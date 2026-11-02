import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { CHEST_CONFIG, KEY_CONFIG, TREASURE_CONFIG } from '../config/treasure';

const BRASS = KEY_CONFIG.brassColor;
const HIGHLIGHT = KEY_CONFIG.highlightColor;
const DARK_BRASS = KEY_CONFIG.darkBrassColor;

function makeKeyRoughnessTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  // A restrained, non-periodic roughness field breaks up the broad studio
  // reflections without painting scratches into the brass color.
  context.fillStyle = 'rgb(78,78,78)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 0x6d2b79f5;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let index = 0; index < 460; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 2 + random() * 15;
    context.strokeStyle = random() > 0.48 ? 'rgba(220,220,220,0.18)' : 'rgba(25,25,25,0.16)';
    context.lineWidth = 0.35 + random() * 0.65;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y + (random() - 0.5) * 1.2);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function makeQuatrefoilGeometry() {
  const centerX = -0.29;
  const centerY = 0.025;
  const shape = new THREE.Shape();
  const steps = 128;
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const radius = 0.157 + 0.055 * Math.cos(angle * 4);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  for (const [offsetX, offsetY, radiusX, radiusY] of [
    [0, 0, 0.072, 0.072],
    [0, 0.12, 0.047, 0.045],
    [0.12, 0, 0.047, 0.045],
    [0, -0.12, 0.047, 0.045],
    [-0.12, 0, 0.047, 0.045],
  ]) {
    const opening = new THREE.Path();
    opening.absellipse(centerX + offsetX, centerY + offsetY, radiusX, radiusY, 0, Math.PI * 2, false, 0);
    shape.holes.push(opening);
  }
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.038,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.009,
    bevelThickness: 0.006,
    curveSegments: 24,
  });
}

function makeKeyScrolls() {
  const center = new THREE.Vector3(-0.29, 0.025, 0);
  const base = [
    [-0.096, 0.045], [-0.15, 0.092], [-0.15, 0.162], [-0.094, 0.198],
    [-0.042, 0.171], [-0.047, 0.128], [-0.078, 0.125], [-0.088, 0.145], [-0.067, 0.157],
  ];
  return Array.from({ length: 4 }, (_, index) => {
    const angle = index * Math.PI / 2;
    const points = base.map(([x, y]) => {
      const dx = x * Math.cos(angle) - y * Math.sin(angle);
      const dy = x * Math.sin(angle) + y * Math.cos(angle);
      return new THREE.Vector3(center.x + dx, center.y + dy, 0.052);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35), 42, 0.008, 8, false);
  });
}

function makeDiamondGeometry(size: number, depth: number) {
  const diamond = new THREE.Shape();
  diamond.moveTo(0, size);
  diamond.lineTo(size * 0.78, 0);
  diamond.lineTo(0, -size);
  diamond.lineTo(-size * 0.78, 0);
  diamond.closePath();
  return new THREE.ExtrudeGeometry(diamond, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.006,
    bevelThickness: 0.004,
    curveSegments: 12,
  });
}

export function TreasureKeyModel() {
  const quatrefoil = useMemo(makeQuatrefoilGeometry, []);
  const scrolls = useMemo(makeKeyScrolls, []);
  const bossBacking = useMemo(() => makeDiamondGeometry(0.091, 0.014), []);
  const bossFace = useMemo(() => makeDiamondGeometry(0.073, 0.018), []);
  const bitGeometry = useMemo(() => {
    const bit = new THREE.Shape();
    bit.moveTo(0.265, 0.05);
    bit.lineTo(0.355, 0.05);
    bit.lineTo(0.355, -0.018);
    bit.lineTo(0.38, -0.018);
    bit.lineTo(0.38, -0.064);
    bit.lineTo(0.337, -0.064);
    bit.lineTo(0.337, -0.045);
    bit.lineTo(0.303, -0.045);
    bit.lineTo(0.303, -0.092);
    bit.lineTo(0.258, -0.092);
    bit.lineTo(0.258, -0.018);
    bit.lineTo(0.265, -0.018);
    bit.closePath();
    return new THREE.ExtrudeGeometry(bit, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.004,
      bevelThickness: 0.003,
      curveSegments: 8,
    });
  }, []);
  const roughnessTexture = useMemo(makeKeyRoughnessTexture, []);
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: BRASS,
    metalness: 0.64,
    roughness: 0.285,
    roughnessMap: roughnessTexture ?? undefined,
    clearcoat: 0.035,
    clearcoatRoughness: 0.45,
  }), [roughnessTexture]);
  const brightBrass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: HIGHLIGHT,
    metalness: 0.73,
    roughness: 0.22,
    roughnessMap: roughnessTexture ?? undefined,
    clearcoat: 0.04,
    clearcoatRoughness: 0.4,
  }), [roughnessTexture]);
  const darkBrass = useMemo(() => new THREE.MeshStandardMaterial({
    color: DARK_BRASS,
    metalness: 0.76,
    roughness: 0.52,
    roughnessMap: roughnessTexture ?? undefined,
  }), [roughnessTexture]);

  useEffect(() => () => {
    quatrefoil.dispose();
    scrolls.forEach((geometry) => geometry.dispose());
    bossBacking.dispose();
    bossFace.dispose();
    bitGeometry.dispose();
    roughnessTexture?.dispose();
    brass.dispose();
    brightBrass.dispose();
    darkBrass.dispose();
  }, [quatrefoil, scrolls, bossBacking, bossFace, bitGeometry, roughnessTexture, brass, brightBrass, darkBrass]);

  return (
    <group rotation={[0, 0, 0.08]}>
      <mesh geometry={quatrefoil} material={brass} castShadow receiveShadow />
      {scrolls.map((geometry, index) => (
        <React.Fragment key={index}>
          <mesh geometry={geometry} position={[0, 0, -0.006]} material={darkBrass} castShadow />
          <mesh geometry={geometry} position={[0, 0, 0.002]} material={brightBrass} castShadow />
        </React.Fragment>
      ))}
      <mesh geometry={bossBacking} position={[-0.29, 0.025, 0.044]} material={darkBrass} castShadow />
      <mesh geometry={bossFace} position={[-0.29, 0.025, 0.061]} material={brightBrass} castShadow />
      <mesh position={[-0.29, 0.025, 0.084]} castShadow>
        <sphereGeometry args={[0.008, 16, 10]} />
        <primitive object={darkBrass} attach="material" />
      </mesh>

      {/* Turned profile keeps the shaft continuous through both collar joints. */}
      <mesh position={[-0.084, 0.025, 0.022]} rotation={[0, 0, -Math.PI / 2]} material={brass} castShadow receiveShadow>
        <latheGeometry args={[
          [
            new THREE.Vector2(0, 0), new THREE.Vector2(0.016, 0), new THREE.Vector2(0.022, 0.012),
            new THREE.Vector2(0.019, 0.025), new THREE.Vector2(0.017, 0.047), new THREE.Vector2(0.018, 0.067),
            new THREE.Vector2(0.018, 0.29), new THREE.Vector2(0.023, 0.302), new THREE.Vector2(0.019, 0.314),
            new THREE.Vector2(0.017, 0.333), new THREE.Vector2(0.017, 0.37), new THREE.Vector2(0.021, 0.383),
            new THREE.Vector2(0.018, 0.397), new THREE.Vector2(0.018, 0.425), new THREE.Vector2(0.014, 0.435),
            new THREE.Vector2(0, 0.435),
          ],
          36,
        ]} />
      </mesh>
      {[[-0.042, 0.021], [-0.027, 0.019], [0.018, 0.022], [0.245, 0.02], [0.258, 0.02], [0.273, 0.019]].map(([x, radius], index) => (
        <mesh key={`${x}:${index}`} position={[x, 0.025, 0.022]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[radius, index === 1 || index === 4 ? 0.0022 : 0.0032, 8, 32]} />
          <primitive object={index === 1 || index === 4 ? darkBrass : brightBrass} attach="material" />
        </mesh>
      ))}

      <mesh geometry={bitGeometry} position={[0, 0, 0.001]} material={brass} castShadow receiveShadow />
      <mesh position={[0.29, -0.055, 0.048]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.018, 0.012, 0.002]} />
        <primitive object={darkBrass} attach="material" />
      </mesh>
    </group>
  );
}

function makeWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#6A3218';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 82; i += 1) {
    const y = (i / 82) * canvas.height;
    const shade = i % 4 === 0 ? 'rgba(235,162,96,0.16)' : 'rgba(28,11,5,0.12)';
    context.strokeStyle = shade;
    context.lineWidth = i % 7 === 0 ? 2 : 1;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(145, y + Math.sin(i) * 4, 315, y + Math.cos(i * 0.8) * 5, 512, y + Math.sin(i * 0.4) * 3);
    context.stroke();
  }
  for (const [x, y, radius] of [[125, 92, 15], [385, 183, 11], [295, 41, 8]]) {
    context.strokeStyle = 'rgba(24,10,5,0.28)';
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(x, y, radius * 1.8, radius * 0.7, 0.04, 0, Math.PI * 2);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.25, 1);
  texture.anisotropy = 4;
  return texture;
}

function RivetInstances({ positions, radius = 0.013 }: { positions: [number, number, number][]; radius?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 12, 8), [radius]);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ color: HIGHLIGHT, metalness: 0.4, roughness: 0.34, clearcoat: 0.22 }), []);
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    positions.forEach((position, index) => {
      helper.position.set(...position);
      helper.scale.setScalar(1);
      helper.updateMatrix();
      meshRef.current!.setMatrixAt(index, helper.matrix);
    });
    meshRef.current.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [helper, positions]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <instancedMesh ref={meshRef} args={[geometry, material, positions.length]} castShadow receiveShadow />;
}

export function TreasureChestModel({
  lidRef,
  glowRef,
  hovered,
  opened,
  onHover,
}: {
  lidRef: React.RefObject<THREE.Group | null>;
  glowRef: React.RefObject<THREE.PointLight | null>;
  hovered: boolean;
  opened: boolean;
  onHover: (value: boolean) => void;
}) {
  const woodTexture = useMemo(makeWoodTexture, []);
  const wood = useMemo(() => new THREE.MeshPhysicalMaterial({ color: CHEST_CONFIG.woodColor, map: woodTexture ?? undefined, roughness: CHEST_CONFIG.woodRoughness, metalness: 0.02, clearcoat: 0.14, clearcoatRoughness: 0.44, emissive: '#210B03', emissiveIntensity: 0.07 }), [woodTexture]);
  const darkWood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3B1B0E', roughness: 0.65 }), []);
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: CHEST_CONFIG.brassColor, metalness: 0.4, roughness: 0.4, clearcoat: 0.2 }), []);
  const brightBrass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: CHEST_CONFIG.highlightColor, metalness: 0.42, roughness: 0.36, clearcoat: 0.25 }), []);
  const keyhole = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1D0D08', metalness: 0.3, roughness: 0.7 }), []);
  const lidShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, 0);
    shape.lineTo(0.3, 0);
    shape.lineTo(0.3, 0.035);
    shape.quadraticCurveTo(0.3, 0.19, 0, 0.225);
    shape.quadraticCurveTo(-0.3, 0.19, -0.3, 0.035);
    shape.closePath();
    return shape;
  }, []);
  const lidGeometry = useMemo(() => new THREE.ExtrudeGeometry(lidShape, { depth: 0.36, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.008, bevelThickness: 0.006, curveSegments: 24 }), [lidShape]);
  const bodyRivets = useMemo<[number, number, number][]>(() => [-0.205, 0, 0.205].flatMap((x) => [-0.092, -0.025, 0.1].map((y) => [x, 0.125 + y, 0.218])), []);
  const lidRivets = useMemo<[number, number, number][]>(() => [-0.205, 0, 0.205].flatMap((x) => [0.015, 0.17].map((y) => [x, y, 0.372])), []);
  const archTrim = useMemo(() => {
    const points = [
      new THREE.Vector3(-0.292, 0.035, 0.365),
      new THREE.Vector3(-0.276, 0.145, 0.365),
      new THREE.Vector3(-0.18, 0.208, 0.365),
      new THREE.Vector3(0, 0.222, 0.365),
      new THREE.Vector3(0.18, 0.208, 0.365),
      new THREE.Vector3(0.276, 0.145, 0.365),
      new THREE.Vector3(0.292, 0.035, 0.365),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.009, 8, false);
  }, []);

  useEffect(() => () => {
    woodTexture?.dispose();
    wood.dispose();
    darkWood.dispose();
    brass.dispose();
    brightBrass.dispose();
    keyhole.dispose();
    lidGeometry.dispose();
    archTrim.dispose();
  }, [woodTexture, wood, darkWood, brass, brightBrass, keyhole, lidGeometry, archTrim]);

  return (
    <group
      position={TREASURE_CONFIG.chest.position}
      onPointerOver={(event) => { event.stopPropagation(); onHover(true); }}
      onPointerOut={(event) => { event.stopPropagation(); onHover(false); }}
    >
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.035, 0.32]} />
        <primitive object={darkWood} attach="material" />
      </mesh>
      <mesh position={[0, 0.13, 0.165]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.23, 0.03]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[0, 0.13, -0.165]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.23, 0.03]} />
        <primitive object={wood} attach="material" />
      </mesh>
      {[-0.285, 0.285].map((x) => (
        <mesh key={x} position={[x, 0.13, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.03, 0.23, 0.33]} />
          <primitive object={wood} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.065, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.055, 0.25]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Lid swings about its rear X-axis hinge; the arched extrusion matches the reference silhouette. */}
      <group ref={lidRef} position={[0, 0.25, -0.18]}>
        <mesh geometry={lidGeometry} material={wood} castShadow receiveShadow />
        <mesh geometry={archTrim} material={brightBrass} castShadow />
        {[-0.205, 0, 0.205].map((x) => (
          <group key={x} position={[x, 0.095, 0.36]}>
            <mesh castShadow>
              <boxGeometry args={[0.035, 0.18, 0.018]} />
              <primitive object={brass} attach="material" />
            </mesh>
          </group>
        ))}
        <RivetInstances positions={lidRivets} />
        <mesh position={[0, 0.205, 0.36]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.075, 0.075, 0.012]} />
          <primitive object={brass} attach="material" />
        </mesh>
      </group>

      {/* Three forged bands and hand-set rivets on the front board. */}
      {[-0.205, 0, 0.205].map((x) => (
        <group key={x} position={[x, 0.125, 0.188]}>
          <mesh castShadow>
            <boxGeometry args={[0.035, 0.245, 0.018]} />
            <primitive object={brass} attach="material" />
          </mesh>
        </group>
      ))}
      <RivetInstances positions={bodyRivets} />
      <mesh position={[0, 0.15, 0.206]} castShadow>
        <boxGeometry args={[0.13, 0.16, 0.025]} />
        <primitive object={brass} attach="material" />
      </mesh>
      <mesh position={[0, 0.172, 0.222]}>
        <circleGeometry args={[0.022, 24]} />
        <primitive object={keyhole} attach="material" />
      </mesh>
      <mesh position={[0, 0.132, 0.223]}>
        <boxGeometry args={[0.015, 0.055, 0.004]} />
        <primitive object={keyhole} attach="material" />
      </mesh>
      <mesh position={[0, 0.065, 0.23]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.047, 0.009, 8, 28]} />
        <primitive object={brightBrass} attach="material" />
      </mesh>
        <mesh position={[0, 0.255, 0.36]} castShadow>
        <boxGeometry args={[0.36, 0.025, 0.025]} />
        <primitive object={brass} attach="material" />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.24, 0.34]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.036, 0.007, 8, 24]} />
          <primitive object={brightBrass} attach="material" />
        </mesh>
      ))}
      <pointLight position={[0, 0.17, 0.62]} color={CHEST_CONFIG.fillLightColor} intensity={CHEST_CONFIG.fillLightIntensity} distance={1.2} decay={2} />
      <pointLight ref={glowRef} position={[0, 0.2, 0.32]} color={CHEST_CONFIG.glowColor} intensity={hovered ? CHEST_CONFIG.hoverGlowIntensity : CHEST_CONFIG.glowIntensity} distance={1.05} decay={2} />
      <pointLight position={[0, 0.2, -0.015]} color="#FFD36A" intensity={opened ? 2.1 : 0.025} distance={1.05} decay={2} />
      {opened && <Sparkles count={10} scale={[0.5, 0.38, 0.28]} size={1.8} speed={0.22} color="#F8D581" opacity={0.72} />}
      {hovered && <Sparkles count={10} scale={[0.8, 0.65, 0.5]} size={1.4} speed={0.2} color="#E5B75E" opacity={0.55} />}
    </group>
  );
}
