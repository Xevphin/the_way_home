// ============================================================================
// src/components/CarCabinOverlay3D.jsx
// Full 360-degree first-person car cabin interior:
// - Mounts CarCabinShell3D (doors, side mirrors, B/C pillars, roof, backseat)
// - Dashboard gauges, steering wheel responding smoothly to road curves,
//   blinking hazard switch, glowing FM car radio unit, and Beat 2 flash figure
// ============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CarCabinShell3D from './CarCabinShell3D';

function makeRadioFaceTexture(isStatic) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = isStatic ? '#3b110d' : '#0a232b';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = isStatic ? '#ff6a4d' : '#4ce6d0';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 88);
  ctx.fillStyle = isStatic ? '#ffd4c7' : '#63f5dc';
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isStatic ? 'ERR // STATIC' : '98.4 FM', 128, 42);
  ctx.fillStyle = isStatic ? '#ff8a66' : '#ffbe55';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(isStatic ? 'NO SIGNAL' : 'KL MALAM • LIVE', 128, 74);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function CarCabinOverlay3D({
  visible = false,
  hazardsOn = false,
  showFlashFigure = false,
  radioActive = true,
  radioStatic = false,
  steerAngle = 0,
  steerAngleRef = null,
}) {
  const wheelRef = useRef();
  const hazardBtnRef = useRef();
  const eqBarsRef = useRef([]);
  const smoothSteerRef = useRef(0);
  const radioTexNormal = useMemo(() => makeRadioFaceTexture(false), []);
  const radioTexStatic = useMemo(() => makeRadioFaceTexture(true), []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (wheelRef.current) {
      const targetSteer = steerAngleRef ? steerAngleRef.current : steerAngle;
      smoothSteerRef.current = THREE.MathUtils.lerp(
        smoothSteerRef.current,
        targetSteer,
        Math.min(1, delta * 6)
      );
      wheelRef.current.rotation.z = smoothSteerRef.current + Math.sin(t * 2.1) * 0.04;
    }
    if (hazardBtnRef.current) {
      const blink = hazardsOn && Math.sin(t * 7.6) > 0;
      hazardBtnRef.current.emissiveIntensity = blink ? 3.5 : 0.2;
    }
    if (radioActive) {
      eqBarsRef.current.forEach((bar, i) => {
        if (!bar) return;
        bar.scale.y = radioStatic
          ? 0.25 + Math.random() * 1.4
          : 0.4 + Math.abs(Math.sin(t * (5.5 + i * 1.9) + i)) * 0.9;
      });
    }
  });

  return (
    <group>
      {/* Keep 360° Car Cabin Permanently Mounted (toggle visible/intensity so zero shader recompile!) */}
      <group visible={visible} position={[0, 0, 0]}>
          <CarCabinShell3D />

          {/* Dashboard Top Shelf */}
          <mesh position={[0, 0.88, -0.78]}>
            <boxGeometry args={[1.64, 0.24, 0.56]} />
            <meshStandardMaterial color="#11151c" roughness={0.85} />
          </mesh>

          {/* Gauge Cluster Backing */}
          <mesh position={[-0.36, 0.96, -0.64]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.48, 0.17, 0.08]} />
            <meshStandardMaterial color="#070a0f" roughness={0.5} />
          </mesh>

          {/* Dimly Lit Speedometer & RPM Dashboard Gauges */}
          {[-0.48, -0.24].map((xOff, idx) => (
            <group key={idx} position={[xOff, 0.96, -0.59]} rotation={[-0.2, 0, 0]}>
              <mesh>
                <ringGeometry args={[0.048, 0.064, 24]} />
                <meshBasicMaterial color="#4de8a8" />
              </mesh>
              <mesh position={[0.015, 0.01, 0.002]} rotation={[0, 0, idx === 0 ? -0.8 : -0.4]}>
                <boxGeometry args={[0.045, 0.008, 0.005]} />
                <meshBasicMaterial color="#ff7744" />
              </mesh>
            </group>
          ))}

          {/* Dim Fuel Gauge Glow */}
          <mesh position={[-0.36, 0.93, -0.59]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[0.08, 0.022]} />
            <meshBasicMaterial color="#ffaa33" />
          </mesh>

          {/* Blinking Red/Amber Hazard Switch on Center Console */}
          <mesh position={[0.04, 0.94, -0.56]}>
            <boxGeometry args={[0.06, 0.045, 0.03]} />
            <meshStandardMaterial
              ref={hazardBtnRef}
              color="#ff5522"
              emissive="#ff4400"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Glowing Late-Night FM Car Radio Unit Mounted Flush on Top of Center Dash */}
          {radioActive && (
            <group position={[-0.08, 1.055, -0.54]} rotation={[-0.08, -0.26, 0]}>
              <mesh>
                <boxGeometry args={[0.24, 0.095, 0.03]} />
                <meshStandardMaterial color="#11161f" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.004, 0.017]}>
                <planeGeometry args={[0.215, 0.076]} />
                <meshBasicMaterial map={radioStatic ? radioTexStatic : radioTexNormal} />
              </mesh>
              {[-0.08, -0.04, 0, 0.04, 0.08].map((bx, idx) => (
                <mesh
                  key={idx}
                  ref={(el) => {
                    eqBarsRef.current[idx] = el;
                  }}
                  position={[bx, -0.034, 0.02]}
                >
                  <planeGeometry args={[0.018, 0.014]} />
                  <meshBasicMaterial
                    color={radioStatic ? '#ffffff' : idx % 2 === 0 ? '#5ef2d6' : '#ffbe55'}
                  />
                </mesh>
              ))}
              <pointLight
                position={[0, 0.04, 0.16]}
                color={radioStatic ? '#ff643d' : '#4ce6d0'}
                intensity={visible ? (radioStatic ? 1.4 : 0.72) : 0}
                distance={1.6}
              />
            </group>
          )}

          {/* Subtle Dashboard Illumination Light */}
          <pointLight
            position={[-0.35, 1.05, -0.42]}
            color="#58d6a3"
            intensity={visible ? 0.45 : 0}
            distance={1.6}
          />

          {/* Steering Wheel (Turns Smoothly With Road Curves) */}
          <group ref={wheelRef} position={[-0.36, 0.93, -0.34]} rotation={[-0.28, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.17, 0.022, 10, 28]} />
              <meshStandardMaterial color="#181c22" roughness={0.65} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.055, 0.055, 0.03, 14]} />
              <meshStandardMaterial color="#12161c" roughness={0.6} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.31, 0.026, 0.02]} />
              <meshStandardMaterial color="#232933" roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.075, 0]}>
              <boxGeometry args={[0.028, 0.15, 0.02]} />
              <meshStandardMaterial color="#232933" roughness={0.6} />
            </mesh>
          </group>

          {/* Left & Right Windshield A-Pillars */}
          {[-0.78, 0.78].map((xPos, i) => (
            <mesh key={i} position={[xPos, 1.24, -0.68]} rotation={[0.42, 0, 0]}>
              <boxGeometry args={[0.07, 0.68, 0.08]} />
              <meshStandardMaterial color="#11161f" roughness={0.85} />
            </mesh>
          ))}
      </group>

      {/* Dark Supernatural Figure (permanently mounted; toggle visible/intensity so zero hitch at impact!) */}
      <group visible={showFlashFigure} position={[-0.1, 0.0, -4.6]}>
        <mesh position={[0, 1.25, 0]}>
          <coneGeometry args={[0.62, 2.5, 10]} />
          <meshStandardMaterial color="#090b10" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.22, 0.04]} scale={[1.35, 0.7, 0.8]}>
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshStandardMaterial color="#0b0d14" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.55, 0.08]}>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#161922" roughness={0.9} />
        </mesh>
        {[-0.08, 0.08].map((ex, i) => (
          <mesh key={i} position={[ex, 2.58, 0.28]}>
            <sphereGeometry args={[0.042, 8, 8]} />
            <meshBasicMaterial color="#fff1c7" />
          </mesh>
        ))}
        <pointLight
          position={[0, 1.8, 1.1]}
          color="#ffe9b8"
          intensity={showFlashFigure ? 5.5 : 0}
          distance={7}
        />
      </group>
    </group>
  );
}
