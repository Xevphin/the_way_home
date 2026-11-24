// ============================================================================
// src/components/ModelAsset.jsx
// Reusable GLTF/GLB loader component with:
// - Automatic bounding-box scale normalization (targetHeight / Width / Length)
// - Exact ground alignment (y = 0 flush with floor/road, zero floating/sinking)
// - Safe deep clone per instance so repeated props never share transforms
// - Shadow casting/receiving enabled automatically + ErrorBoundary safety
// ============================================================================

import React, { Component, Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function LoadedModel({
  url,
  targetHeight,
  targetWidth,
  targetLength,
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  tint,
}) {
  const { scene } = useGLTF(url);

  const { cloned, normScale, offset } = useMemo(() => {
    const copy = scene.clone(true);
    copy.updateMatrixWorld(true);

    copy.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        child.frustumCulled = false;
        if (tint && child.material) {
          child.material = child.material.clone();
          child.material.color.multiply(new THREE.Color(tint));
        }
      }
    });

    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    let s = typeof scale === 'number' ? scale : 1;
    if (targetHeight && size.y > 0.001) {
      s = targetHeight / size.y;
    } else if (targetLength && size.z > 0.001) {
      s = targetLength / size.z;
    } else if (targetWidth && size.x > 0.001) {
      s = targetWidth / size.x;
    }

    // Center on X/Z and place bottom face flush on y = 0
    return {
      cloned: copy,
      normScale: s,
      offset: [-center.x * s, -box.min.y * s, -center.z * s],
    };
  }, [scene, targetHeight, targetWidth, targetLength, scale, castShadow, receiveShadow, tint]);

  return (
    <primitive
      object={cloned}
      position={offset}
      scale={[normScale, normScale, normScale]}
    />
  );
}

export default function ModelAsset({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  targetHeight,
  targetWidth,
  targetLength,
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  tint,
}) {
  return (
    <group position={position} rotation={rotation}>
      <ModelErrorBoundary>
        <Suspense fallback={null}>
          <LoadedModel
            url={url}
            targetHeight={targetHeight}
            targetWidth={targetWidth}
            targetLength={targetLength}
            scale={scale}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            tint={tint}
          />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}
