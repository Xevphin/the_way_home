// ============================================================================
// src/components/HomeProps3D.jsx
// Uses Kenney Furniture Kit .glb models grounded flush at y = 0 for the
// bedroom & kitchen (bedDouble, cabinetBedDrawer, desk, laptop, kitchenCabinet,
// kitchenCoffeeMachine), paired with the glowing 08:15 AM bedside clock and
// interactive University Bag / Morning Coffee props.
// ============================================================================

import React, { useMemo } from 'react';
import * as THREE from 'three';
import LivingRoomFurniture from './LivingRoomFurniture';
import ModelAsset from './ModelAsset';
import { MODELS } from '../../data/shared/modelCatalog';

// Crisp glowing digital alarm clock (defaults to "08:15 AM • FRI", configurable to "08:30 AM • SAT" in Epilogue)
function DigitalAlarmClock({ position, clockText = '08:15', dayLabel = 'AM  •  FRI' }) {
  const clockTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0c1117';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#1f2d3d';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 120);
    ctx.fillStyle = '#5ef2a8';
    ctx.font = 'bold 58px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clockText, 128, 56);
    ctx.fillStyle = '#a3f7cb';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(dayLabel, 128, 102);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [clockText, dayLabel]);

  return (
    <group position={position} rotation={[0, 0.45, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.18, 0.16]} />
        <meshStandardMaterial color="#1f252e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[0.31, 0.14]} />
        <meshBasicMaterial map={clockTex} />
      </mesh>
    </group>
  );
}

export default function HomeProps3D({ completedChores = [], clockText = '08:15', dayLabel = 'AM  •  FRI' }) {
  const hasDone = (id) => completedChores.includes(id);

  return (
    <group>
      {/* ================= BEDROOM: KENNEY BED, NIGHTSTAND & 08:15 AM CLOCK ================= */}
      <ModelAsset
        url={MODELS.bedDouble}
        position={[-4.6, 0, 4.2]}
        rotation={[0, Math.PI / 2, 0]}
        targetLength={2.3}
      />

      <group position={[-5.45, 0, 2.55]}>
        <ModelAsset
          url={MODELS.nightstand}
          rotation={[0, Math.PI / 2, 0]}
          targetHeight={0.68}
        />
        <DigitalAlarmClock position={[0.04, 0.77, 0.04]} clockText={clockText} dayLabel={dayLabel} />
      </group>

      {/* ================= CHORE 1: KENNEY DESK, LAPTOP & UNIVERSITY BAG ================= */}
      <group position={[-2.2, 0, 4.95]}>
        <ModelAsset url={MODELS.desk} rotation={[0, Math.PI, 0]} targetHeight={0.76} />
        <ModelAsset
          url={MODELS.laptop}
          position={[-0.32, 0.765, 0]}
          rotation={[0, Math.PI, 0]}
          targetWidth={0.44}
        />
        {!hasDone('chore_bag') && (
          <group position={[0.4, 0.985, -0.04]} rotation={[0, -0.3, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.38, 0.44, 0.24]} />
              <meshStandardMaterial color="#2f4f73" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.06, 0.13]}>
              <boxGeometry args={[0.28, 0.22, 0.06]} />
              <meshStandardMaterial color="#243d59" roughness={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {/* ================= CHORE 2: KENNEY KITCHEN CABINETS & COFFEE MACHINE ================= */}
      <group position={[-3.2, 0, -5.1]}>
        {[-1.29, -0.43, 0.43, 1.29].map((kx, idx) => (
          <ModelAsset
            key={idx}
            url={MODELS.kitchenCabinet}
            position={[kx, 0, 0]}
            targetHeight={0.9}
          />
        ))}
        <ModelAsset
          url={MODELS.coffeeMachine}
          position={[-0.38, 0.905, 0.02]}
          targetHeight={0.38}
        />
        <mesh position={[0.08, 0.98, 0.14]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.15, 12]} />
          <meshStandardMaterial
            color={hasDone('chore_coffee') ? '#6b4226' : '#f2ede4'}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* ================= CHORE 3: REFERENCE-MATCHED LIVING ROOM ================= */}
      <LivingRoomFurniture notesChecked={hasDone('chore_notes')} />
    </group>
  );
}
