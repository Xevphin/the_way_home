// ============================================================================
// src/components/CampusWorld3D.jsx
// Renders the University Campus entrance, Academic Hall, signboard, walkway,
// student parking lot with parked cars, benches, trees, and lampposts.
// Smoothly transitions sky, fog, sun angle, and lampposts from bright morning
// (sunsetProgress = 0) into a warm orange-purple evening sunset (1.0).
// ============================================================================

import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import StalledSedan from './StalledSedan';
import TrafficCarModel from './TrafficCarModel';
import BackgroundNPCs from './BackgroundNPCs';
import ModelAsset from './ModelAsset';
import { CampusArchBanner, CampusWelcomeBoard } from './UniversitiAlamSignage';
import { MODELS } from '../data/modelCatalog';

export default function CampusWorld3D({ sunsetProgress = 0 }) {
  const { scene } = useThree();

  // Blend morning sky blue (#9ac6f0) -> warm orange-purple sunset (#5b355e / #d97348)
  const { skyColor, fogColor, sunColor, ambColor, sunY, lampsOn } = useMemo(() => {
    const p = THREE.MathUtils.clamp(sunsetProgress, 0, 1);
    const sky = new THREE.Color('#9ac6f0').lerp(new THREE.Color('#4a2a54'), p);
    const fog = new THREE.Color('#c8e1f7').lerp(new THREE.Color('#d97043'), p);
    const sun = new THREE.Color('#fff2d6').lerp(new THREE.Color('#ff6e30'), p);
    const amb = new THREE.Color('#fff8ec').lerp(new THREE.Color('#c97a96'), p);
    return {
      skyColor: `#${sky.getHexString()}`,
      fogColor: `#${fog.getHexString()}`,
      sunColor: `#${sun.getHexString()}`,
      ambColor: `#${amb.getHexString()}`,
      sunY: THREE.MathUtils.lerp(32, 4.5, p),
      lampsOn: p > 0.45,
    };
  }, [sunsetProgress]);

  scene.background = new THREE.Color(skyColor);

  return (
    <group>
      <fog attach="fog" args={[fogColor, 24, 92]} />
      <ambientLight intensity={THREE.MathUtils.lerp(0.8, 0.52, sunsetProgress)} color={ambColor} />
      <hemisphereLight
        args={[skyColor, sunsetProgress > 0.5 ? '#5e3b40' : '#61874e', 0.55]}
      />
      <directionalLight
        position={[-26, sunY, -28]}
        intensity={THREE.MathUtils.lerp(1.72, 1.95, sunsetProgress)}
        color={sunColor}
        castShadow
      />
      <directionalLight position={[24, 14, 20]} intensity={0.42} color="#ffd9b3" />

      {/* Glowing Sunset Orb Low on the Horizon During Evening */}
      {sunsetProgress > 0.15 && (
        <mesh position={[-32, sunY * 0.72 + 2.5, -52]}>
          <sphereGeometry args={[5.2, 20, 20]} />
          <meshBasicMaterial color="#ff8547" />
        </mesh>
      )}

      {/* Campus Lawn, Parking Lot Asphalt & Main Concrete Plaza Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -10]} receiveShadow>
        <planeGeometry args={[140, 130]} />
        <meshStandardMaterial color="#557d47" roughness={0.95} />
      </mesh>
      {/* Parking Lot Asphalt with Subtle Specular Sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial color="#383e47" roughness={0.56} metalness={0.12} />
      </mesh>
      {/* Parking Stall Stripes */}
      {[-9, -5.5, -2, 2, 5.5, 9].map((px, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[px, 0.015, 6]}>
          <planeGeometry args={[0.12, 5.2]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
      ))}
      {/* Main Paved Campus Walkway Leading Up to Academic Hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -9]} receiveShadow>
        <planeGeometry args={[8.5, 16]} />
        <meshStandardMaterial color="#c4bfb6" roughness={0.86} />
      </mesh>

      {/* Academic Hall Building & Pillared Entrance Portico */}
      <group position={[0, 0, -23]}>
        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 11, 11]} />
          <meshStandardMaterial color="#ded5c6" roughness={0.82} />
        </mesh>
        {/* Warm Terracotta Roof Trim */}
        <mesh position={[0, 11.4, 0]}>
          <boxGeometry args={[27.2, 0.9, 12.2]} />
          <meshStandardMaterial color="#7d422d" roughness={0.78} />
        </mesh>
        {/* Entrance Portico Roof & 4 Grand Columns */}
        <mesh position={[0, 4.4, 6.8]} castShadow>
          <boxGeometry args={[11.2, 0.7, 3.6]} />
          <meshStandardMaterial color="#ebe4d8" roughness={0.75} />
        </mesh>
        {[-4.4, -1.8, 1.8, 4.4].map((cx, i) => (
          <mesh key={i} position={[cx, 2.2, 7.8]} castShadow>
            <cylinderGeometry args={[0.26, 0.3, 4.4, 12]} />
            <meshStandardMaterial color="#f2ede4" roughness={0.7} />
          </mesh>
        ))}
        {/* University Welcome Signboard Above Portico */}
        <CampusWelcomeBoard position={[0, 5.4, 8.65]} />
        {/* Glass Double Entrance Doors & Upper Floor Windows */}
        <mesh position={[0, 1.5, 5.55]}>
          <planeGeometry args={[3.4, 2.8]} />
          <meshStandardMaterial
            color={lampsOn ? '#ffd891' : '#587894'}
            emissive={lampsOn ? '#ffaa44' : '#000000'}
            emissiveIntensity={lampsOn ? 0.8 : 0}
            roughness={0.2}
          />
        </mesh>
        {[-8, -4, 4, 8].map((wx, i) => (
          <mesh key={i} position={[wx, 7.8, 5.55]}>
            <planeGeometry args={[2.4, 2.0]} />
            <meshStandardMaterial
              color={lampsOn ? '#ffcf80' : '#6485a3'}
              emissive={lampsOn ? '#ff9f33' : '#000000'}
              emissiveIntensity={lampsOn ? 0.6 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Real Kenney Curved Campus Lampposts (Curving Inward Over Walkway) */}
      {[-5.2, 5.2].map((lx, i) => (
        <group key={i} position={[lx, 0, -5.5]}>
          <ModelAsset
            url={MODELS.streetlight}
            rotation={[0, lx < 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
            targetHeight={5.6}
          />
          {lampsOn && (
            <>
              <mesh position={[lx < 0 ? 1.15 : -1.15, 5.35, 0]}>
                <sphereGeometry args={[0.16, 10, 10]} />
                <meshBasicMaterial color="#ffe29c" />
              </mesh>
              <pointLight position={[lx < 0 ? 1.1 : -1.1, 5.1, 0]} color="#ffb84d" intensity={7.5} distance={22} />
            </>
          )}
        </group>
      ))}

      {/* Player's Arrived Sedan.glb & Real Kenney Student Cars */}
      <StalledSedan
        position={[3.8, 0, 5.8]}
        rotation={[0, 0, 0]}
        isDented={false}
        headlightPower={lampsOn ? 0.55 : 0}
        hazardsOn={false}
      />
      {[
        { x: -7.2, z: 6.0, idx: 0 },
        { x: -3.7, z: 6.0, idx: 2 },
        { x: 7.3, z: 6.0, idx: 4 },
      ].map((c, i) => (
        <TrafficCarModel
          key={i}
          variantIndex={c.idx}
          position={[c.x, 0, c.z]}
          lightsOn={false}
        />
      ))}

      {/* Real Kenney Oak Trees Framing the Campus Plaza */}
      {[[-14, -8], [14, -8], [-16, 4], [16, 4], [-13, -18], [13, -18]].map(([tx, tz], i) => (
        <ModelAsset
          key={i}
          url={i % 2 === 0 ? MODELS.oakTree : MODELS.detailedTree}
          position={[tx, 0, tz]}
          targetHeight={6.2}
        />
      ))}
      {/* Entrance Arch Framing Campus Parking Entrance */}
      <group position={[0, 0, 15.5]}>
        {[-6.4, 6.4].map((gx, i) => (
          <mesh key={i} position={[gx, 2.8, 0]} castShadow>
            <boxGeometry args={[1.1, 5.6, 1.1]} />
            <meshStandardMaterial color="#d8cfc0" roughness={0.8} />
          </mesh>
        ))}
        <CampusArchBanner position={[0, 5.3, 0]} />
      </group>

      {/* Living Background Campus Students Walking & Chatting */}
      <BackgroundNPCs
        npcs={[
          { id: 'cp_1', pos: [-8.5, 0, -12], endPos: [-8.5, 0, 1], speed: 0.16, shirt: '#3b6e8c' },
          { id: 'cp_2', pos: [6.8, 0, -2], endPos: [6.8, 0, -14], speed: 0.15, shirt: '#9c4b3b' },
          { id: 'cp_3', pos: [-3.6, 0, -14.2], rotY: 1.3, shirt: '#49755a', talking: true },
          { id: 'cp_4', pos: [-2.4, 0, -14.0], rotY: -1.6, shirt: '#c78d38', talking: true },
        ]}
      />
    </group>
  );
}
