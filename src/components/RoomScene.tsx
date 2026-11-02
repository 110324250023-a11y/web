import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE } from '../types';
import { KeyChestInteraction } from './KeyChestInteraction';

const BOOKSHELF_GROUP_Y = -0.1;
const SHELF_LEVEL_CENTERS = [-1.2, -0.4, 0.45, 1.15];
const SHELF_SURFACES = SHELF_LEVEL_CENTERS.map((centerY) => BOOKSHELF_GROUP_Y + centerY + 0.03);

export function BookshelfBay() {
  const oakMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#7D4C27',
        roughness: 0.65,
        metalness: 0.08,
        clearcoat: 0.2,
      }),
    []
  );

  return (
    <group position={[0, BOOKSHELF_GROUP_Y, -0.6]}>
      <mesh position={[0, 0, -0.32]} receiveShadow>
        <boxGeometry args={[4.4, 3.4, 0.04]} />
        <meshPhysicalMaterial color="#543318" roughness={0.8} />
      </mesh>
      <mesh position={[-2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.42, 0.08, 0.68]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -0.37, 0.28]}>
        <boxGeometry args={[4.3, 0.012, 0.012]} />
        <meshBasicMaterial color="#FFB852" />
      </mesh>
    </group>
  );
}

export function BackgroundShelfBooks() {
  const bookColors = [
    '#3B1F17',
    '#1B2E25',
    '#252C3D',
    '#4A2E1B',
    '#5A2326',
    '#2E3321',
    '#3C3528',
    '#422918',
    '#1F3540',
  ];

  const books = useMemo(() => {
    const list = [];
    for (let i = 0; i < 9; i++) {
      list.push({
        pos: [-1.8 + i * 0.11, 0, -0.55],
        size: [0.08, 0.45 + (i % 3) * 0.05, 0.32],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[i % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.04, 0],
      });
    }
    for (let i = 0; i < 3; i++) {
      list.push({
        pos: [-0.45 + i * 0.1, 0, -0.55],
        size: [0.075, 0.44 + (i % 2) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 4) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    for (let i = 0; i < 3; i++) {
      list.push({
        pos: [0.25 + i * 0.1, 0, -0.55],
        size: [0.075, 0.46, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 1) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    for (let i = 0; i < 9; i++) {
      list.push({
        pos: [0.9 + i * 0.11, 0, -0.55],
        size: [0.08, 0.46 + (i % 4) * 0.04, 0.32],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 3) % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.04, 0],
      });
    }
    for (let i = 0; i < 11; i++) {
      list.push({
        pos: [-0.55 + i * 0.1, 0, -0.55],
        size: [0.075, 0.44 + (i % 3) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[2],
        color: bookColors[(i + 5) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {books.map((b, idx) => (
        <mesh
          key={idx}
          position={[b.pos[0], b.shelfSurfaceY + b.size[1] / 2 + 0.002, b.pos[2]]}
          rotation={b.rot as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={b.size as [number, number, number]} />
          <meshPhysicalMaterial color={b.color} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}

      <group position={[-1.25, SHELF_SURFACES[2] + 0.15, -0.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.16, 0.18, 32]} />
          <meshPhysicalMaterial
            color="#FFF4D4"
            emissive="#FFC766"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.06, 32]} />
          <meshPhysicalMaterial color="#5A3A1E" roughness={0.8} />
        </mesh>
        <pointLight color="#FFAE42" intensity={0.6} distance={1.6} decay={2} />
      </group>

      <mesh position={[1.4, SHELF_SURFACES[2] + 0.18, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.36, 24]} />
        <meshPhysicalMaterial color="#E8DAC6" roughness={0.35} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

export function HeroBookOnShelf({
  onOpenBook,
  isReading,
}: {
  onOpenBook: () => void;
  isReading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const bookGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    document.body.style.cursor = hovered && !isReading ? 'pointer' : 'default';
  }, [hovered, isReading]);

  useFrame((state, delta) => {
    if (!bookGroupRef.current) return;
    const targetZ = hovered ? -0.22 : -0.45;
    const targetRotY = hovered ? 0.16 : 0.0;
    const targetRotX = hovered ? -0.04 : 0.0;

    bookGroupRef.current.position.z = THREE.MathUtils.lerp(
      bookGroupRef.current.position.z,
      targetZ,
      delta * 6
    );
    bookGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.y,
      targetRotY,
      delta * 6
    );
    bookGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.x,
      targetRotX,
      delta * 6
    );

    if (glowLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
      const targetIntensity = hovered ? 1.4 + pulse : 0.4 + pulse * 0.1;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(
        glowLightRef.current.intensity,
        targetIntensity,
        delta * 6
      );
    }
  });

  return (
    <group
      ref={bookGroupRef}
      position={[-0.05, SHELF_SURFACES[1] + 0.54 / 2 + 0.002, -0.45]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isReading) onOpenBook();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.54, 0.38]} />
        <meshPhysicalMaterial
          color="#381D14"
          roughness={0.35}
          metalness={0.2}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
          emissive="#DDAA24"
          emissiveIntensity={hovered ? 0.2 : 0.05}
        />
      </mesh>

      <mesh position={[0, 0, 0.192]}>
        <planeGeometry args={[0.15, 0.52]} />
        <meshPhysicalMaterial
          color="#DDAA24"
          roughness={0.2}
          metalness={0.85}
          clearcoat={0.7}
          emissive="#DDAA24"
          emissiveIntensity={hovered ? 0.6 : 0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0.195]}>
        <planeGeometry args={[0.07, 0.42]} />
        <meshPhysicalMaterial
          color="#FFF8E7"
          emissive="#DDAA24"
          emissiveIntensity={hovered ? 0.9 : 0.4}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      <mesh position={[0, 0.265, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <meshPhysicalMaterial color="#F7F1E7" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.265, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <meshPhysicalMaterial color="#F7F1E7" roughness={0.9} />
      </mesh>

      <pointLight
        ref={glowLightRef}
        position={[0, 0, 0.25]}
        color="#DDAA24"
        intensity={0.4}
        distance={1.4}
        decay={2}
      />

      <Sparkles
        count={hovered ? 35 : 12}
        scale={0.8}
        size={hovered ? 2.5 : 1.5}
        speed={hovered ? 0.5 : 0.2}
        color="#DDAA24"
        opacity={hovered ? 0.75 : 0.3}
      />
    </group>
  );
}

export function CozyRoomScene({
  onOpenBook,
  isReading,
  interactionsLocked,
  clipOpen,
  onFadeStart,
  onOpenClip,
  onInteractionBusyChange,
  keyLabelRef,
  chestLabelRef,
}: {
  onOpenBook: () => void;
  isReading: boolean;
  interactionsLocked: boolean;
  clipOpen: boolean;
  onFadeStart: () => void;
  onOpenClip: () => void;
  onInteractionBusyChange: (busy: boolean) => void;
  keyLabelRef: React.RefObject<HTMLDivElement | null>;
  chestLabelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <color attach="background" args={[PALETTE.darkRoom]} />
      <ambientLight intensity={0.35} color="#FFE6CC" />
      <directionalLight
        position={[3.5, 2.8, 2.2]}
        intensity={1.1}
        color="#FFA84A"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 3.2, 1.2]} intensity={0.8} color="#FFF1DB" decay={2} distance={7} />
      <pointLight position={[0, 1.8, 1.5]} intensity={0.9} color="#FFF2DA" decay={2} distance={4} />
      <Environment resolution={128} background={false} frames={1}>
        <Lightformer form="rect" intensity={1.25} color="#FFD9A5" position={[0, 1.5, 3]} scale={[3.5, 1.8, 1]} />
        <Lightformer form="rect" intensity={0.65} color="#D99645" position={[-3, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.6, 3, 1]} />
      </Environment>

      <BookshelfBay />
      <BackgroundShelfBooks />
      <HeroBookOnShelf onOpenBook={onOpenBook} isReading={isReading || interactionsLocked} />
      <KeyChestInteraction
        isReading={isReading}
        interactionsLocked={interactionsLocked}
        clipOpen={clipOpen}
        onFadeStart={onFadeStart}
        onOpenClip={onOpenClip}
        onInteractionBusyChange={onInteractionBusyChange}
        keyLabelRef={keyLabelRef}
        chestLabelRef={chestLabelRef}
      />

      <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshPhysicalMaterial color="#2B1A11" roughness={0.4} metalness={0.15} clearcoat={0.3} />
      </mesh>

      <ContactShadows position={[0, -1.74, 0]} opacity={0.55} scale={8} blur={2.2} far={2} />
    </>
  );
}
