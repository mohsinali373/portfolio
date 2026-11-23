import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motionStore, STAGE_SECTIONS } from '../../lib/motionStore';
import { applyLiquidShader } from './liquidShader';
import { blendFrames, scrollSegment, stageFaces, stageFrames } from './keyframes';
import { buildFaceplates } from './faceplates';

const MAX_DT = 1 / 20; // clamp long frames (tab switches)
const OFFSCREEN_NDC = 1.3; // a slot scrolled away pins the form just past the viewport edge
const FLIGHT_SHRINK = 0.2; // mid-flight the form recedes a little…
const FLIGHT_DIM = 0.35; // …and dims, so it never fights the copy it crosses
const FLIGHT_DIM_NARROW = 0.75; // phones have no side margins, so the flight crosses text — fade harder
const NARROW_WIDTH = 768;
const SETTLE_RATE = 9; // ~110 ms settle onto the scroll-driven target
const FACE_FADE = 0.28; // share of the flight over which a faceplate fades
const RING_RADIUS = 1.78;
const RING_TUBE = 0.0075;
const FACE_INSET_X = 0.86;
const FACE_INSET_Y = 0.84;
const FACE_LIFT = 1.07;

const PALETTE = {
  dark: { core: '#d9d3c9', roughness: 0.15, ring: '#c9a36b' },
  light: { core: '#c4bdb1', roughness: 0.17, ring: '#8c5d1f' },
};

/** Measure a slot in world units on the z = 0 plane. */
function measureSlot(rect, camera, viewport, out) {
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const halfW = halfH * (viewport.width / viewport.height);
  const ndcX = ((rect.left + rect.width / 2) / viewport.width) * 2 - 1;
  const ndcY = -(((rect.top + rect.height / 2) / viewport.height) * 2 - 1);
  out.x = ndcX * halfW;
  out.y = THREE.MathUtils.clamp(ndcY, -OFFSCREEN_NDC, OFFSCREEN_NDC) * halfH;
  out.w = (rect.width / viewport.width) * 2 * halfW;
  out.h = (rect.height / viewport.height) * 2 * halfH;
  return out;
}

/** Uniform scale that fits a frame's shape inside a slot. */
function fitScale(frame, slot) {
  const reach = 1 + frame.amp;
  const ringReach = frame.rings > 0.05 ? RING_RADIUS * frame.rings * 0.9 : 0;
  const halfW = Math.max((1 + (frame.shape[0] - 1) * frame.morph) * reach, ringReach);
  const halfH = (1 + (frame.shape[1] - 1) * frame.morph) * reach;
  return frame.fill * Math.min(slot.w / (2 * halfW), slot.h / (2 * halfH));
}

/** Faceplate of whichever slot the form is nearer; fully on while it rides a slot. */
function updateFace(face, material, textures, from, to, t) {
  const index = t < 0.5 ? from : to;
  const key = textures ? stageFaces[index] : null;
  const texture = key ? textures[key] : null;
  if (material.map !== texture) {
    material.map = texture;
    material.needsUpdate = true;
  }
  const edge = Math.min(t, 1 - t);
  const alpha = from === to ? 1 : THREE.MathUtils.clamp(1 - edge / FACE_FADE, 0, 1);
  material.opacity = texture ? alpha : 0;
  face.visible = material.opacity > 0.01;
  const shape = stageFrames[index].shape;
  face.scale.set(2 * shape[0] * FACE_INSET_X, 2 * shape[1] * FACE_INSET_Y, 1);
  face.position.set(0, 0, shape[2] * FACE_LIFT + 0.015);
}

/** Orbit rings around the drop, rack bands around the server, hidden elsewhere. */
function updateRings(ringA, ringB, frame, elapsed) {
  const isVisible = frame.rings > 0.03;
  ringA.visible = isVisible;
  ringB.visible = isVisible;
  const ringScale = Math.max(frame.rings, 0.0001);
  ringA.scale.setScalar(ringScale);
  ringB.scale.setScalar(ringScale * 1.06);
  ringA.position.y = frame.ringSpread;
  ringB.position.y = -frame.ringSpread;
  ringA.rotation.set(Math.PI / 2 + frame.ringTilt * 0.55, elapsed * 0.12, 0);
  ringB.rotation.set(Math.PI / 2 - frame.ringTilt, 0, -elapsed * 0.09);
}

/**
 * The liquid form. Every section owns an empty `[data-stage-slot]` box. The
 * form's position is a pure function of scroll: it rides the current slot,
 * flies to the next one as you scroll (and stops when you stop), morphing into
 * that section's object: drop → screen → module → server → core → pool.
 * @param {{ theme: 'dark' | 'light', isLowPower: boolean, isReduced: boolean }} props
 */
export function LiquidCore({ theme, isLowPower, isReduced }) {
  const groupRef = useRef(/** @type {THREE.Group | null} */ (null));
  const coreRef = useRef(/** @type {THREE.Mesh | null} */ (null));
  const ringARef = useRef(/** @type {THREE.Mesh | null} */ (null));
  const ringBRef = useRef(/** @type {THREE.Mesh | null} */ (null));
  const faceRef = useRef(/** @type {THREE.Mesh | null} */ (null));
  const [faceTextures, setFaceTextures] = useState(/** @type {Record<string, THREE.Texture> | null} */ (null));

  useEffect(() => {
    let isActive = true;
    let built = null;
    buildFaceplates().then((textures) => {
      built = textures;
      if (isActive) setFaceTextures(textures);
      else Object.values(textures).forEach((t) => t.dispose());
    });
    return () => {
      isActive = false;
      if (built) Object.values(built).forEach((t) => t.dispose());
    };
  }, []);

  const live = useRef({
    frame: structuredClone(stageFrames[0]),
    velocityBoost: 0,
    x: 0,
    y: 0,
    scale: 1,
    isPlaced: false,
    presence: -1,
    slotEls: /** @type {(Element | null)[]} */ ([]),
    centres: STAGE_SECTIONS.map(() => 0),
    rects: /** @type {DOMRect[]} */ ([]),
    slotA: { x: 0, y: 0, w: 1, h: 1 },
    slotB: { x: 0, y: 0, w: 1, h: 1 },
    quat: new THREE.Quaternion(),
    dir: new THREE.Vector3(),
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: stageFrames[0].amp },
      uFreq: { value: stageFrames[0].freq },
      uPointerDir: { value: new THREE.Vector3(0, 0, 1) },
      uPointerStrength: { value: 0 },
      uShape: { value: new THREE.Vector3(1, 1, 1) },
      uExp: { value: 2 },
      uMorph: { value: 0 },
    }),
    [],
  );

  const materials = useMemo(() => {
    const core = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.25 });
    applyLiquidShader(core, uniforms);
    const ring = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.32, envMapIntensity: 1.3 });
    const face = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
    return { core, ring, face };
  }, [uniforms]);

  useEffect(() => {
    const colors = PALETTE[theme];
    materials.core.color.set(colors.core);
    materials.core.roughness = colors.roughness;
    materials.ring.color.set(colors.ring);
  }, [theme, materials]);

  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  // Fewer segments on phones: ~9k vs ~50k vertices.
  const segments = isLowPower ? 96 : 224;

  useFrame((state, rawDelta) => {
    const group = groupRef.current;
    const core = coreRef.current;
    const face = faceRef.current;
    if (!group || !core || !face || !ringARef.current || !ringBRef.current) return;
    const L = live.current;
    const dt = Math.min(rawDelta, MAX_DT);

    // 1 · Where is every slot right now? (positions follow the page 1:1)
    if (L.slotEls.length === 0 || L.slotEls.some((el) => !el?.isConnected)) {
      L.slotEls = STAGE_SECTIONS.map((id) => document.querySelector(`[data-stage-slot="${id}"]`));
    }
    const viewportMid = state.size.height / 2;
    for (let i = 0; i < L.slotEls.length; i++) {
      const el = L.slotEls[i];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      L.rects[i] = rect;
      L.centres[i] = rect.top + rect.height / 2 - viewportMid;
    }

    // 2 · Scroll decides everything: which two slots, and how far between them.
    const { from, to, t } = scrollSegment(L.centres);
    const a = measureSlot(L.rects[from], state.camera, state.size, L.slotA);
    const b = measureSlot(L.rects[to], state.camera, state.size, L.slotB);
    const flight = Math.sin(Math.PI * t); // 0 on a slot, 1 mid-flight
    const targetScale = (fitScale(stageFrames[from], a) * (1 - t) + fitScale(stageFrames[to], b) * t) * (1 - FLIGHT_SHRINK * flight);
    const targetX = a.x + (b.x - a.x) * t;
    const targetY = a.y + (b.y - a.y) * t;
    // A short settle on top of the scroll-driven target: still tied to scroll,
    // but quick flicks of the wheel are smoothed instead of snapping.
    const settle = isReduced || !L.isPlaced ? 1 : 1 - Math.exp(-SETTLE_RATE * dt);
    L.x += (targetX - L.x) * settle;
    L.y += (targetY - L.y) * settle;
    L.scale += (targetScale - L.scale) * settle;
    L.isPlaced = true;
    blendFrames(stageFrames[from], stageFrames[to], t, L.frame);
    const f = L.frame;

    const canTilt = !isLowPower && !isReduced;
    group.position.set(L.x, L.y, 0);
    group.rotation.set(f.rx + (canTilt ? motionStore.pointerY * -0.1 : 0), f.ry + (canTilt ? motionStore.pointerX * 0.18 : 0), f.rz);
    group.scale.setScalar(L.scale);

    // 3 · Surface: shape, scroll-velocity agitation, pointer bulge.
    uniforms.uShape.value.set(f.shape[0], f.shape[1], f.shape[2]);
    uniforms.uExp.value = f.exp;
    uniforms.uMorph.value = f.morph;
    uniforms.uFreq.value = f.freq;
    const liquidity = 1 - f.morph * 0.7;
    const velocityTarget = isReduced ? 0 : Math.min(Math.abs(motionStore.velocity) * 0.004, 0.1) * liquidity;
    L.velocityBoost = THREE.MathUtils.damp(L.velocityBoost, velocityTarget, 4, dt);
    motionStore.pointerEnergy = THREE.MathUtils.damp(motionStore.pointerEnergy, 0, 1.4, dt);
    uniforms.uAmp.value = f.amp + L.velocityBoost;
    if (!isReduced) uniforms.uTime.value += dt * (1 + L.velocityBoost * 5);

    L.dir.set(motionStore.pointerX * 1.4, motionStore.pointerY * 1.4, 1).normalize();
    core.getWorldQuaternion(L.quat).invert();
    L.dir.applyQuaternion(L.quat);
    uniforms.uPointerDir.value.lerp(L.dir, 1 - Math.exp(-6 * dt)).normalize();
    uniforms.uPointerStrength.value = isReduced ? 0 : Math.min(motionStore.pointerEnergy, 1) * 0.2 * liquidity;

    // The free drop slowly spins; shaped objects sit square to their slot.
    core.rotation.y = isReduced || f.morph > 0.9 ? THREE.MathUtils.damp(core.rotation.y, 0, 6, dt) : core.rotation.y + dt * 0.05;

    updateFace(face, materials.face, faceTextures, from, to, t);
    updateRings(ringARef.current, ringBRef.current, f, isReduced ? 0 : state.clock.elapsedTime);

    // Presence lives on the canvas element (compositor-only), written only when it changes.
    const dim = state.size.width < NARROW_WIDTH ? FLIGHT_DIM_NARROW : FLIGHT_DIM;
    const presence = Math.round(f.presence * (1 - dim * flight) * 100) / 100;
    if (presence !== L.presence) {
      L.presence = presence;
      state.gl.domElement.style.opacity = String(presence);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef} material={materials.core}>
        <sphereGeometry args={[1, segments, segments]} />
        <mesh ref={faceRef} material={materials.face} visible={false} renderOrder={1}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </mesh>
      <mesh ref={ringARef} material={materials.ring}>
        <torusGeometry args={[RING_RADIUS, RING_TUBE, 12, isLowPower ? 160 : 320]} />
      </mesh>
      <mesh ref={ringBRef} material={materials.ring}>
        <torusGeometry args={[RING_RADIUS, RING_TUBE * 0.7, 12, isLowPower ? 160 : 320]} />
      </mesh>
    </group>
  );
}
