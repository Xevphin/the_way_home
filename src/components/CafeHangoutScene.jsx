// ============================================================================
// src/components/CafeHangoutScene.jsx
// Sprint 4 Beat 1 — Cozy Evening Cafe Hangout with Amir:
// - Seated across a wooden cafe table with food plates, drinks & lantern
// - Warm storefront windows, string lights, starry sky & background patrons
// - Triggers eerie tension drone + subtle dim vignette during Amir's spooky
//   Lembah Batu wiki story, then warm GPA celebration montage, 11:25 PM phone
//   check, and walking out to the car.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAFE_HANGOUT_SCRIPT } from '../data/sprint4Data';
import { getSubtitleDurationMs } from '../data/dialogueTiming';
import ArticulatedCharacter from './ArticulatedCharacter';
import BackgroundNPCs from './BackgroundNPCs';
import NightSkyDome from './NightSkyDome';
import StalledSedan from './StalledSedan';
import ModelAsset from './ModelAsset';
import { MODELS } from '../data/modelCatalog';
import { setSpookyStoryDrone } from './MorningAudio';

const HANGOUT_PATRONS = [
  { id: 'hp_1', pos: [2.15, 0, -5.25], rotY: 1.15, shirt: '#3e6e58', talking: true },
  { id: 'hp_2', pos: [4.65, 0, -5.15], rotY: -1.25, shirt: '#b87f35', talking: true },
  { id: 'hp_3', pos: [-9.5, 0, -2.4], endPos: [9.5, 0, -2.4], speed: 0.14, shirt: '#5e4b78' },
  { id: 'hp_4', pos: [8.5, 0, -1.6], endPos: [-8.5, 0, -1.6], speed: 0.13, shirt: '#3c6787' },
];

export default function CafeHangoutScene({
  active,
  onSubtitleChange,
  onMoodChange,
  onComplete,
}) {
  const { camera } = useThree();
  const [amirTalk, setAmirTalk] = useState(true);
  const [mode, setMode] = useState('NORMAL');
  const terraceLightRef = useRef();
  const stringLightsRef = useRef();
  const elapsedRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setSpookyStoryDrone(false);
      return undefined;
    }
    elapsedRef.current = 0;
    doneRef.current = false;

    const timers = [];
    let accMs = 500;

    CAFE_HANGOUT_SCRIPT.forEach((beat) => {
      const dur = getSubtitleDurationMs(beat.text, beat.speaker);
      timers.push(
        setTimeout(() => {
          setMode(beat.mode);
          setAmirTalk(beat.amirTalk);
          onSubtitleChange({ tag: beat.speaker, text: beat.text });
          onMoodChange({
            spooky: beat.mode === 'SPOOKY',
            montage: beat.mode === 'MONTAGE',
            showPhone: beat.mode === 'PHONE',
          });
          setSpookyStoryDrone(beat.mode === 'SPOOKY');
        }, accMs)
      );
      accMs += dur;
    });

    const walkLine = 'Heading back to my car... should be home before midnight.';
    const walkDur = getSubtitleDurationMs(walkLine, '');

    // Walk out toward the parked car & finish cafe hangout
    timers.push(
      setTimeout(() => {
        setSpookyStoryDrone(false);
        setMode('WALK_OUT');
        onMoodChange({ spooky: false, montage: false, showPhone: false });
        onSubtitleChange({ tag: '', text: walkLine });
      }, accMs)
    );

    timers.push(
      setTimeout(() => {
        onSubtitleChange(null);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, accMs + walkDur)
    );

    return () => {
      setSpookyStoryDrone(false);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [active, onSubtitleChange, onMoodChange, onComplete]);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = clock.getElapsedTime();

    if (mode === 'WALK_OUT') {
      // Smoothly stand up from the cafe table and walk toward the parked car
      camera.position.lerp(new THREE.Vector3(-1.4, 1.62, 0.2), Math.min(1, dt * 1.4));
      camera.lookAt(-1.4, 1.05, 2.5);
      return;
    }

    // Subtle foreshadowing: brief eerie flicker of warm cafe string lights during Amir's wiki story
    if (terraceLightRef.current) {
      const flicker =
        mode === 'SPOOKY' && (Math.sin(t * 21) > 0.78 || Math.sin(t * 9.5) > 0.88);
      terraceLightRef.current.intensity = mode === 'SPOOKY' ? (flicker ? 1.4 : 4.6) : 7.8;
      if (stringLightsRef.current) {
        stringLightsRef.current.children.forEach((b) => {
          if (b.material) b.material.color.set(flicker ? '#8f6b47' : '#ffe49e');
        });
      }
    }

    // Seated three-quarter framing: shows Amir & table food PLUS string lights,
    // chatting background patrons on the right terrace, and starry night sky!
    const targetZ = mode === 'SPOOKY' ? -3.72 : mode === 'MONTAGE' ? -3.15 : -3.4;
    const targetX = mode === 'MONTAGE' ? -2.0 + Math.sin(t * 0.5) * 0.35 : -2.35;
    camera.position.lerp(
      new THREE.Vector3(targetX, 1.48 + Math.sin(t * 1.5) * 0.014, targetZ),
      Math.min(1, dt * 2.2)
    );
    camera.lookAt(
      mode === 'SPOOKY' ? -1.45 : -0.45,
      mode === 'PHONE' ? 1.32 : 1.56,
      -5.35
    );
  });

  if (!active) return null;

  return (
    <group>
      <NightSkyDome variant="midnight" moonPosition={[30, 32, -88]} />
      <ambientLight intensity={mode === 'SPOOKY' ? 0.42 : 0.68} color="#c9a59b" />
      <directionalLight position={[-16, 18, 12]} intensity={0.75} color="#a9c0e6" />

      {/* Cafe Terrace & Street Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 5.5]} receiveShadow>
        <planeGeometry args={[90, 14]} />
        <meshStandardMaterial color="#1f242c" roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4.5]} receiveShadow>
        <planeGeometry args={[48, 8.8]} />
        <meshStandardMaterial color="#6e6255" roughness={0.88} />
      </mesh>

      {/* Cozy Cafe Building Back Wall & Glowing Warm Storefront Windows */}
      <group position={[0, 0, -8.8]}>
        <mesh position={[0, 2.6, 0]} receiveShadow>
          <boxGeometry args={[15.5, 5.2, 5.5]} />
          <meshStandardMaterial color="#3b2a20" roughness={0.82} />
        </mesh>
        {[-4.2, 0, 4.2].map((wx, i) => (
          <mesh key={i} position={[wx, 1.9, 2.78]}>
            <planeGeometry args={[3.4, 2.5]} />
            <meshStandardMaterial
              color="#fff1c7"
              emissive="#ffae3d"
              emissiveIntensity={mode === 'SPOOKY' ? 1.15 : 2.1}
            />
          </mesh>
        ))}
        <mesh position={[0, 3.35, 3.8]} rotation={[0.22, 0, 0]}>
          <boxGeometry args={[14.5, 0.14, 2.6]} />
          <meshStandardMaterial color="#a83e2b" roughness={0.7} />
        </mesh>
      </group>

      {/* Overhead Festoon String Lights Draped Across Terrace View */}
      <group ref={stringLightsRef}>
        {[-3.2, -1.6, 0, 1.6, 3.2, 4.8].map((lx, i) => (
          <mesh key={i} position={[lx, 2.48 - Math.abs(i - 2.5) * 0.05, -4.6]}>
            <sphereGeometry args={[0.085, 8, 8]} />
            <meshBasicMaterial color="#ffe49e" />
          </mesh>
        ))}
      </group>
      <pointLight
        ref={terraceLightRef}
        position={[-1.5, 2.9, -4.3]}
        color={mode === 'SPOOKY' ? '#ff944d' : '#ffc466'}
        intensity={mode === 'SPOOKY' ? 4.2 : 7.8}
        distance={16}
      />

      {/* Real Kenney Commercial Shophouses & Second Cafe Table */}
      <ModelAsset url={MODELS.commercialA} position={[-15.5, 0, -9.2]} targetHeight={8.5} />
      <ModelAsset url={MODELS.commercialE} position={[15.5, 0, -9.2]} targetHeight={8.8} />
      <ModelAsset url={MODELS.roundTable} position={[3.4, 0, -5.1]} targetHeight={0.78} />

      {/* Foreground Wooden Cafe Table with Food Plates, Drinks & Glowing Lantern */}
      <group position={[-1.5, 0, -4.45]}>
        <ModelAsset url={MODELS.roundTable} targetHeight={0.78} />
        {/* Two Food Plates (Nasi Lemak & Sides) */}
        {[-0.36, 0.32].map((px, i) => (
          <group key={i} position={[px, 0.84, i === 0 ? 0.18 : -0.18]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.17, 0.03, 14]} />
              <meshStandardMaterial color="#f5f3ee" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <sphereGeometry args={[0.11, 10, 8]} />
              <meshStandardMaterial color="#efe6c9" roughness={0.85} />
            </mesh>
            <mesh position={[0.06, 0.05, 0.04]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#a82c1f" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Two Teh Tarik / Iced Drink Glasses */}
        {[[-0.48, -0.22], [0.48, 0.2]].map(([gx, gz], i) => (
          <mesh key={i} position={[gx, 0.92, gz]}>
            <cylinderGeometry args={[0.055, 0.048, 0.2, 12]} />
            <meshStandardMaterial color={i === 0 ? '#c98842' : '#d6a45c'} roughness={0.3} />
          </mesh>
        ))}
        {/* Warm Glass Table Lantern */}
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.065, 0.055, 0.18, 10]} />
          <meshStandardMaterial color="#fff4cc" emissive="#ffaa2b" emissiveIntensity={3.0} />
        </mesh>
      </group>

      {/* Amir Seated Across the Table (Expressive Talking & Celebration Wave) */}
      <group position={[-1.5, -0.18, -5.25]} rotation={[0, 0, 0]}>
        <ArticulatedCharacter
          shirtColor="#c45c3e"
          sleeveColor="#b55135"
          pantsColor="#2b3d54"
          isTalking={amirTalk}
          isWaving={mode === 'CELEBRATE' || mode === 'GOODBYE'}
        />
      </group>

      {/* Player's Sedan Parked Outside Ready to Drive Home */}
      <StalledSedan
        position={[-1.5, 0, 2.1]}
        rotation={[0, -Math.PI / 2, 0]}
        isDented={false}
        headlightPower={0.6}
        hazardsOn={false}
      />

      {/* Animated Background Cafe Patrons & Sidewalk Walkers */}
      <BackgroundNPCs npcs={HANGOUT_PATRONS} />
    </group>
  );
}
