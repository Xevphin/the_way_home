// ============================================================================
// src/components/CarCabinShell3D.jsx
// Complete 360-degree enclosed car cabin interior around the driver camera:
// - Left & right doors with window frames, armrests, and exterior side mirrors
// - B-pillars, C-pillars, roof headliner, dome light & rear windshield frame
// - Front passenger seat, center console armrest & full rear backseat bench
// - Subtle translucent windshield & side-window glass reflection panes
// ============================================================================

import React from 'react';

export default function CarCabinShell3D() {
  return (
    <group>
      {/* Left & Right Car Doors (Lower Panels, Armrests, Window Frames & Side Mirrors) */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Lower Door Interior Panel */}
          <mesh position={[side * 0.84, 0.62, 0.25]}>
            <boxGeometry args={[0.09, 0.64, 2.25]} />
            <meshStandardMaterial color="#151922" roughness={0.85} />
          </mesh>
          {/* Door Armrest Bolster */}
          <mesh position={[side * 0.77, 0.76, 0.08]}>
            <boxGeometry args={[0.08, 0.08, 0.92]} />
            <meshStandardMaterial color="#1e2430" roughness={0.75} />
          </mesh>
          {/* Upper Door Frame Rail */}
          <mesh position={[side * 0.82, 1.48, 0.26]}>
            <boxGeometry args={[0.08, 0.08, 2.1]} />
            <meshStandardMaterial color="#11161f" roughness={0.85} />
          </mesh>
          {/* B-Pillar (Between Front & Rear Windows) */}
          <mesh position={[side * 0.82, 1.18, 0.42]}>
            <boxGeometry args={[0.09, 0.64, 0.14]} />
            <meshStandardMaterial color="#121720" roughness={0.85} />
          </mesh>
          {/* C-Pillar (Rear Cabin Corner Support) */}
          <mesh position={[side * 0.8, 1.18, 1.32]} rotation={[-0.28, 0, 0]}>
            <boxGeometry args={[0.1, 0.66, 0.18]} />
            <meshStandardMaterial color="#121720" roughness={0.85} />
          </mesh>
          {/* Subtle Side Window Glass Sheen */}
          <mesh position={[side * 0.83, 1.18, -0.08]} rotation={[0, side * Math.PI / 2, 0]}>
            <planeGeometry args={[1.05, 0.56]} />
            <meshStandardMaterial
              color="#7da0c4"
              transparent
              opacity={0.055}
              roughness={0.12}
              metalness={0.5}
              depthWrite={false}
            />
          </mesh>
          {/* Exterior Side-View Wing Mirror */}
          <group position={[side * 0.98, 0.98, -0.52]}>
            <mesh position={[-side * 0.08, -0.02, 0]}>
              <boxGeometry args={[0.14, 0.05, 0.06]} />
              <meshStandardMaterial color="#19202b" roughness={0.5} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.17, 0.11, 0.07]} />
              <meshStandardMaterial color="#273140" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.038]}>
              <planeGeometry args={[0.14, 0.085]} />
              <meshStandardMaterial color="#8fa8c2" roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Subtle Angled Windshield Glass Reflection + Rearview Mirror */}
      <mesh position={[0, 1.24, -0.7]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[1.52, 0.66]} />
        <meshStandardMaterial
          color="#9ab8d9"
          transparent
          opacity={0.045}
          roughness={0.08}
          metalness={0.6}
          depthWrite={false}
        />
      </mesh>
      <group position={[0, 1.4, -0.56]}>
        <mesh position={[0, 0.07, -0.02]}>
          <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
          <meshStandardMaterial color="#10141c" roughness={0.7} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.24, 0.065, 0.03]} />
          <meshStandardMaterial color="#141a24" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[0.21, 0.048]} />
          <meshStandardMaterial color="#5c728a" roughness={0.12} metalness={0.85} />
        </mesh>
      </group>

      {/* Full Cabin Roof Headliner, Cabin Floor & Interior Dome Light */}
      <mesh position={[0, 1.53, 0.34]}>
        <boxGeometry args={[1.68, 0.07, 2.28]} />
        <meshStandardMaterial color="#191e28" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.3, 0.32]}>
        <boxGeometry args={[1.66, 0.06, 2.24]} />
        <meshStandardMaterial color="#0d1016" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.49, 0.25]}>
        <boxGeometry args={[0.18, 0.02, 0.1]} />
        <meshStandardMaterial color="#3c434f" emissive="#ffe1a8" emissiveIntensity={0.22} />
      </mesh>

      {/* Center Console Tunnel, Gear Shifter & Front Passenger Seat */}
      <mesh position={[0, 0.54, -0.1]}>
        <boxGeometry args={[0.28, 0.38, 1.15]} />
        <meshStandardMaterial color="#131720" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.78, -0.26]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.2, 8]} />
        <meshStandardMaterial color="#252c38" metalness={0.5} />
      </mesh>
      <group position={[0.38, 0, 0.12]}>
        <mesh position={[0, 0.56, -0.05]}>
          <boxGeometry args={[0.52, 0.14, 0.52]} />
          <meshStandardMaterial color="#1c222e" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.94, 0.18]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[0.5, 0.64, 0.13]} />
          <meshStandardMaterial color="#1c222e" roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.32, 0.22]}>
          <boxGeometry args={[0.22, 0.18, 0.1]} />
          <meshStandardMaterial color="#222a38" roughness={0.85} />
        </mesh>
      </group>

      {/* Driver Seatback Behind Camera (Visible if Looking Straight Down/Back) */}
      <mesh position={[-0.36, 0.88, 0.32]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.5, 0.58, 0.12]} />
        <meshStandardMaterial color="#1c222e" roughness={0.88} />
      </mesh>

      {/* Full Rear Backseat Bench, Backrest, Headrests & Rear Parcel Shelf */}
      <group position={[0, 0, 1.05]}>
        <mesh position={[0, 0.55, -0.08]}>
          <boxGeometry args={[1.52, 0.18, 0.56]} />
          <meshStandardMaterial color="#1b212c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.92, 0.2]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[1.52, 0.64, 0.16]} />
          <meshStandardMaterial color="#1a202b" roughness={0.9} />
        </mesh>
        {[-0.46, 0.46].map((hx, idx) => (
          <mesh key={idx} position={[hx, 1.28, 0.26]}>
            <boxGeometry args={[0.24, 0.18, 0.1]} />
            <meshStandardMaterial color="#222936" roughness={0.85} />
          </mesh>
        ))}
        {/* Rear Deck Shelf & Lower Rear Trunk Bulkhead */}
        <mesh position={[0, 0.96, 0.42]}>
          <boxGeometry args={[1.56, 0.08, 0.34]} />
          <meshStandardMaterial color="#11151d" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.6, 0.46]}>
          <boxGeometry args={[1.58, 0.72, 0.12]} />
          <meshStandardMaterial color="#0e1219" roughness={0.92} />
        </mesh>
      </group>
    </group>
  );
}
