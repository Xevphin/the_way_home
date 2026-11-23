// ============================================================================
// src/components/CafeArrivalScene.jsx
// Sprint 3 Beat 3 — Arrival at the Evening Roadside Cafe ("KAFE TASIK PERMAI"):
// - Glowing storefront windows, outdoor tables, warm string lights,
//   commercial shophouses, passing street traffic, and animated patrons/friends
//   walking and chatting outside as the player's car pulls up and parks.
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from './StalledSedan';
import TrafficCarModel from './TrafficCarModel';
import BackgroundNPCs from './BackgroundNPCs';
import NightSkyDome from './NightSkyDome';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';
import { getSubtitleDurationMs } from '../data/dialogueTiming';

function makeCafeSignTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#261810';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#f5be58';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);
  ctx.fillStyle = '#fff3d1';
  ctx.font = 'bold 40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('KAFE TASIK PERMAI', 256, 56);
  ctx.fillStyle = '#f5be58';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('KOPI • NASI LEMAK • LEPAK MALAM', 256, 94);
  return new THREE.CanvasTexture(c);
}

const CAFE_NPCS = [
  // Amir & friends waving/chatting at the front outdoor table
  { id: 'c_amir', pos: [-2.2, 0, -4.6], rotY: 0.4, shirt: '#c45c3e', waving: true, talking: true },
  { id: 'c_f2', pos: [-0.9, 0, -4.5], rotY: -0.6, shirt: '#39638c', talking: true },
  // Second outdoor table patrons chatting
  { id: 'c_p1', pos: [2.4, 0, -4.7], rotY: 1.1, shirt: '#497a58', talking: true },
  { id: 'c_p2', pos: [3.6, 0, -4.6], rotY: -1.2, shirt: '#b88332', talking: true },
  // Sidewalk pedestrians strolling past the cafe
  { id: 'c_w1', pos: [-11, 0, -2.2], endPos: [11, 0, -2.2], speed: 0.16, shirt: '#7a4b6e' },
  { id: 'c_w2', pos: [10, 0, -1.5], endPos: [-10, 0, -1.5], speed: 0.14, shirt: '#3b6e75' },
];

export default function CafeArrivalScene({
  active,
  holdParked = false,
  onSubtitleChange,
  onComplete,
}) {
  const { camera } = useThree();
  const carRef = useRef();
  const streetCarsRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);
  const signTex = useMemo(() => makeCafeSignTexture(), []);

  useEffect(() => {
    if (!active) return undefined;
    elapsedRef.current = 0;
    doneRef.current = false;

    const line1 = "Made it to Kafe Tasik Permai. Looks like Amir and the others already grabbed a table outside.";
    const line2 = 'Warm lights, good coffee, and plenty of people around... time to unwind for a few hours.';
    const d1 = getSubtitleDurationMs(line1, '07:18 PM • TAMAN PERMAI');
    const d2 = getSubtitleDurationMs(line2, '');

    const t1 = setTimeout(() => {
      onSubtitleChange({ tag: '07:18 PM • TAMAN PERMAI', text: line1 });
    }, 600);

    const t2 = setTimeout(() => {
      onSubtitleChange({ tag: '', text: line2 });
    }, 600 + d1);

    const t3 = setTimeout(() => {
      onSubtitleChange(null);
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
    }, 600 + d1 + d2);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, onSubtitleChange, onComplete]);

  useFrame(({ clock }, delta) => {
    if (!active && !holdParked) return;
    const dt = Math.min(delta, 0.1);
    const t = clock.getElapsedTime();

    // Passing evening street cars along the avenue behind the parked sedan
    if (streetCarsRef.current) {
      streetCarsRef.current.children.forEach((c, idx) => {
        const dir = idx === 0 ? 1 : -1;
        let x = ((t * 7.5 * dir + idx * 18) % 52) - 26;
        c.position.x = x;
      });
    }

    if (holdParked) {
      if (carRef.current) carRef.current.position.set(-1.5, 0, 1.8);
      camera.position.set(
        -5.8 + Math.sin(t * 0.3) * 0.4,
        2.15,
        3.8 + Math.cos(t * 0.25) * 0.3
      );
      camera.lookAt(0.4, 1.55, -5.2);
      return;
    }

    elapsedRef.current += dt;
    const e = elapsedRef.current;

    // Player car glides into the cafe curb parking spot (-10 -> -1.5)
    const parkP = Math.min(1, e / 4.5);
    const smoothCar = 1 - Math.pow(1 - parkP, 3);
    const carX = THREE.MathUtils.lerp(-12.5, -1.5, smoothCar);
    if (carRef.current) {
      carRef.current.position.set(carX, 0, 1.8);
    }

    // Cinematic camera pans from the arriving car toward the warm bustling cafe terrace
    const camP = Math.min(1, e / 7.5);
    const s = camP * camP * (3 - 2 * camP);
    camera.position.set(
      THREE.MathUtils.lerp(-8.2, -4.6, s),
      THREE.MathUtils.lerp(1.75, 2.05, s),
      THREE.MathUtils.lerp(6.4, 3.6, s)
    );
    camera.lookAt(
      THREE.MathUtils.lerp(carX, 0.2, s),
      THREE.MathUtils.lerp(1.1, 1.55, s),
      THREE.MathUtils.lerp(0.5, -5.2, s)
    );
  });

  if (!active && !holdParked) return null;

  return (
    <group>
      <NightSkyDome variant="dusk" moonPosition={[34, 30, -88]} />
      <ambientLight intensity={0.65} color="#b58fa8" />
      <directionalLight position={[-18, 16, 12]} intensity={0.9} color="#ff9d5c" />

      {/* Street Asphalt & Cafe Terrace Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 5.5]} receiveShadow>
        <planeGeometry args={[90, 14]} />
        <meshStandardMaterial color="#232830" roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4.5]} receiveShadow>
        <planeGeometry args={[48, 8.5]} />
        <meshStandardMaterial color="#73685b" roughness={0.88} />
      </mesh>

      {/* Main Roadside Cafe Building ("KAFE TASIK PERMAI") */}
      <group position={[0, 0, -8.8]}>
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[14.5, 5.2, 5.5]} />
          <meshStandardMaterial color="#3d2c22" roughness={0.8} />
        </mesh>
        {/* Glowing Warm Glass Storefront Windows */}
        {[-4.2, 0, 4.2].map((wx, i) => (
          <mesh key={i} position={[wx, 1.85, 2.78]}>
            <planeGeometry args={[3.4, 2.5]} />
            <meshStandardMaterial
              color="#fff1c7"
              emissive="#ffae3d"
              emissiveIntensity={2.1}
            />
          </mesh>
        ))}
        {/* Striped Cafe Awning & Rooftop Signboard */}
        <mesh position={[0, 3.35, 3.8]} rotation={[0.22, 0, 0]} castShadow>
          <boxGeometry args={[14.2, 0.14, 2.6]} />
          <meshStandardMaterial color="#a83e2b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 4.45, 2.82]}>
          <planeGeometry args={[7.2, 1.8]} />
          <meshStandardMaterial
            map={signTex}
            emissive="#ffffff"
            emissiveMap={signTex}
            emissiveIntensity={0.65}
          />
        </mesh>
      </group>

      {/* Real Kenney Commercial Shophouses Flanking the Cafe */}
      <ModelAsset url={MODELS.commercialA} position={[-15.5, 0, -9.2]} targetHeight={8.5} />
      <ModelAsset url={MODELS.commercialE} position={[15.5, 0, -9.2]} targetHeight={8.8} />

      {/* Real Kenney Outdoor Cafe Tables & Glowing Lanterns */}
      {[-1.5, 3.0].map((tx, i) => (
        <group key={i} position={[tx, 0, -4.6]}>
          <ModelAsset url={MODELS.roundTable} targetHeight={0.78} />
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.16, 10]} />
            <meshStandardMaterial color="#fff4cc" emissive="#ffae34" emissiveIntensity={3.0} />
          </mesh>
        </group>
      ))}

      {/* Festoon String Light Bulbs & Warm Terrace PointLights */}
      {[-5, -2.5, 0, 2.5, 5].map((lx, i) => (
        <mesh key={i} position={[lx, 3.15, -3.5]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#ffe49e" />
        </mesh>
      ))}
      <pointLight position={[-1.5, 3.1, -4.2]} color="#ffbe57" intensity={7.5} distance={18} />
      <pointLight position={[3.2, 3.1, -4.2]} color="#ffc86b" intensity={6.8} distance={18} />

      {/* Player's Arriving Sedan (Facing East Along the Curb) */}
      <group ref={carRef} position={[-10, 0, 1.8]} rotation={[0, -Math.PI / 2, 0]}>
        <StalledSedan
          position={[0, 0, 0]}
          isDented={false}
          headlightPower={0.75}
          hazardsOn={false}
        />
      </group>

      {/* Passing Real Kenney Street Traffic Cars */}
      <group ref={streetCarsRef}>
        <TrafficCarModel variantIndex={0} position={[0, 0, 5.2]} rotation={[0, -Math.PI / 2, 0]} lightsOn />
        <TrafficCarModel variantIndex={2} position={[0, 0, 8.4]} rotation={[0, Math.PI / 2, 0]} lightsOn />
      </group>

      {/* Animated Cafe Patrons, Sidewalk Walkers & Amir Waving at Table */}
      <BackgroundNPCs npcs={CAFE_NPCS} />
    </group>
  );
}
