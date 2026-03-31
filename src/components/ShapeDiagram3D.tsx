import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Text, Environment, Billboard } from '@react-three/drei';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import * as THREE from 'three';

extend({ TrackballControls });

/* Trackball controls wrapper — allows full rotation without gimbal lock */
const FreeControls: React.FC<{ rotateSpeed?: number; zoomSpeed?: number; minDistance?: number; maxDistance?: number }> = ({
  rotateSpeed = 1.5, zoomSpeed = 0.8, minDistance = 1.2, maxDistance = 8,
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<TrackballControls | null>(null);

  useEffect(() => {
    const controls = new TrackballControls(camera, gl.domElement);
    controls.rotateSpeed = rotateSpeed;
    controls.zoomSpeed = zoomSpeed;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.noPan = true;
    controls.noZoom = false;
    controls.dynamicDampingFactor = 0.08;
    controls.staticMoving = false;
    controlsRef.current = controls;
    return () => controls.dispose();
  }, [camera, gl, rotateSpeed, zoomSpeed, minDistance, maxDistance]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
};

interface ShapeDiagram3DProps {
  symbol: string;
  values: number[];
}

/* Duct mesh — 4 side walls only (open inlet/outlet like original) */
const DuctMesh: React.FC<{ a: number; b: number; l: number }> = ({ a, b, l }) => {
  // Normalize so the longest side = 2 units
  const maxDim = Math.max(a, b, l, 1);
  const na = (a / maxDim) * 2;
  const nb = (b / maxDim) * 2;
  const nl = (l / maxDim) * 2;

  // Shiny sheet metal material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#8a9bae',
      roughness: 0.18,
      metalness: 0.92,
      reflectivity: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
      envMapIntensity: 1.0,
    });
  }, []);

  // Build geometry with only the 4 side walls (no front/back caps)
  const geometry = useMemo(() => {
    const hw = na / 2, hh = nb / 2, hd = nl / 2;
    const vertices = new Float32Array([
      // Top wall (y = +hh)
      -hw, hh, -hd,   hw, hh, -hd,   hw, hh, hd,
      -hw, hh, -hd,   hw, hh, hd,  -hw, hh, hd,
      // Bottom wall (y = -hh)
      -hw, -hh, hd,   hw, -hh, hd,   hw, -hh, -hd,
      -hw, -hh, hd,   hw, -hh, -hd, -hw, -hh, -hd,
      // Left wall (x = -hw)
      -hw, -hh, -hd, -hw, hh, -hd, -hw, hh, hd,
      -hw, -hh, -hd, -hw, hh, hd,  -hw, -hh, hd,
      // Right wall (x = +hw)
       hw, -hh, hd,   hw, hh, hd,   hw, hh, -hd,
       hw, -hh, hd,   hw, hh, -hd,  hw, -hh, -hd,
    ]);
    const normals = new Float32Array([
      // Top
      0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
      // Bottom
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      // Left
      -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      // Right
      1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
    ]);
    const uvs = new Float32Array([
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [na, nb, nl]);

  // Edge lines for the open duct (12 edges of a box minus the 4 internal cap diagonals)
  const edges = useMemo(() => {
    const hw = na / 2, hh = nb / 2, hd = nl / 2;
    const pts = [
      // Front rect
      [-hw, -hh, -hd], [hw, -hh, -hd],
      [hw, -hh, -hd], [hw, hh, -hd],
      [hw, hh, -hd], [-hw, hh, -hd],
      [-hw, hh, -hd], [-hw, -hh, -hd],
      // Back rect
      [-hw, -hh, hd], [hw, -hh, hd],
      [hw, -hh, hd], [hw, hh, hd],
      [hw, hh, hd], [-hw, hh, hd],
      [-hw, hh, hd], [-hw, -hh, hd],
      // Connecting edges
      [-hw, -hh, -hd], [-hw, -hh, hd],
      [hw, -hh, -hd], [hw, -hh, hd],
      [hw, hh, -hd], [hw, hh, hd],
      [-hw, hh, -hd], [-hw, hh, hd],
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
    return geo;
  }, [na, nb, nl]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Flange ring at each end of the duct */
const Flange: React.FC<{ a: number; b: number; l: number; maxDim: number; side: 'front' | 'back' }> = ({
  a, b, l, maxDim, side,
}) => {
  const na = (a / maxDim) * 2;
  const nb = (b / maxDim) * 2;
  const nl = (l / maxDim) * 2;
  const flangeExtra = 0.08;
  const flangeThickness = 0.04;
  const zPos = side === 'front' ? -nl / 2 : nl / 2;

  // Build a frame shape (outer rect minus inner rect)
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const hw = (na + flangeExtra * 2) / 2;
    const hh = (nb + flangeExtra * 2) / 2;
    s.moveTo(-hw, -hh);
    s.lineTo(hw, -hh);
    s.lineTo(hw, hh);
    s.lineTo(-hw, hh);
    s.closePath();

    const hole = new THREE.Path();
    const ihw = na / 2;
    const ihh = nb / 2;
    hole.moveTo(-ihw, -ihh);
    hole.lineTo(ihw, -ihh);
    hole.lineTo(ihw, ihh);
    hole.lineTo(-ihw, ihh);
    hole.closePath();
    s.holes.push(hole);
    return s;
  }, [na, nb]);

  return (
    <mesh position={[0, 0, zPos]} rotation={[0, 0, 0]}>
      <extrudeGeometry args={[shape, { depth: flangeThickness, bevelEnabled: false }]} />
      <meshPhysicalMaterial
        color="#b0b8c8"
        roughness={0.18}
        metalness={0.9}
        reflectivity={1.0}
        clearcoat={0.4}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/* Dimension labels — always face camera via Billboard */
const DimensionLabels: React.FC<{ a: number; b: number; l: number }> = ({ a, b, l }) => {
  const maxDim = Math.max(a, b, l, 1);
  const na = (a / maxDim) * 2;
  const nb = (b / maxDim) * 2;
  const nl = (l / maxDim) * 2;

  return (
    <>
      {/* a label — bottom front edge */}
      <Billboard position={[0, -nb / 2 - 0.22, -nl / 2]}>
        <Text
          fontSize={0.15}
          color="#004290"
          anchorX="center"
          anchorY="top"
        >{`a = ${Math.round(a)}`}</Text>
      </Billboard>

      {/* b label — right front edge */}
      <Billboard position={[na / 2 + 0.25, 0, -nl / 2]}>
        <Text
          fontSize={0.15}
          color="#004290"
          anchorX="left"
          anchorY="middle"
        >{`b = ${Math.round(b)}`}</Text>
      </Billboard>

      {/* L label — bottom right edge going back */}
      <Billboard position={[na / 2 + 0.25, -nb / 2 - 0.1, 0]}>
        <Text
          fontSize={0.15}
          color="#004290"
          anchorX="left"
          anchorY="top"
        >{`L = ${Math.round(l)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== Bend Mesh — variable angle symmetric bend ===== */
const BendMesh: React.FC<{ a: number; b: number; e: number; f: number; r: number; alfa: number }> = ({ a, b, e, f, r, alfa }) => {
  const maxDim = Math.max(a, b, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
    flatShading: false,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2; // half-width (a dimension, z-axis)
    const segments = 16;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    // Generate arc points for inner and outer radius
    const innerPts: [number, number][] = [];
    const outerPts: [number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * alfaRad;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerPts.push([sr * cos, sr * sin]);
      outerPts.push([(sr + sb) * cos, (sr + sb) * sin]);
    }

    // Helper: add a quad (two triangles)
    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], n: number[]) => {
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      for (let i = 0; i < 6; i++) norms.push(...n);
      // Standard quad UV winding: (0,0)-(1,0)-(1,1)-(0,1)
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Vertical leg (top) — from y=0 to y=-se at x=sr..sr+sb
    // Four walls: front (z=-hw), back (z=+hw), inner (x=sr), outer (x=sr+sb)
    if (se > 0.001) {
      // Front wall (z=-hw, normal -z)
      addQuad([sr, 0, -hw], [sr, -se, -hw], [sr + sb, -se, -hw], [sr + sb, 0, -hw], [0, 0, -1]);
      // Back wall (z=+hw, normal +z)
      addQuad([sr, 0, hw], [sr + sb, 0, hw], [sr + sb, -se, hw], [sr, -se, hw], [0, 0, 1]);
      // Inner wall (x=sr, normal -x)
      addQuad([sr, 0, -hw], [sr, 0, hw], [sr, -se, hw], [sr, -se, -hw], [-1, 0, 0]);
      // Outer wall (x=sr+sb, normal +x)
      addQuad([sr + sb, 0, hw], [sr + sb, 0, -hw], [sr + sb, -se, -hw], [sr + sb, -se, hw], [1, 0, 0]);
    }

    // Horizontal leg (left) — extends from arc end in the direction of alfa
    // End-of-arc direction: tangent at angle=alfa points in (-sin(alfa), cos(alfa))
    const fDirX = -Math.sin(alfaRad);
    const fDirY = Math.cos(alfaRad);
    // Arc end points (inner and outer)
    const fInnerStartX = sr * Math.cos(alfaRad);
    const fInnerStartY = sr * Math.sin(alfaRad);
    const fOuterStartX = (sr + sb) * Math.cos(alfaRad);
    const fOuterStartY = (sr + sb) * Math.sin(alfaRad);
    if (sf > 0.001) {
      // Inner end and outer end of f-leg
      const fiEndX = fInnerStartX + fDirX * sf;
      const fiEndY = fInnerStartY + fDirY * sf;
      const foEndX = fOuterStartX + fDirX * sf;
      const foEndY = fOuterStartY + fDirY * sf;
      // Normal for front/back walls: (0,0,-1) and (0,0,1)
      // Front wall
      addQuad(
        [fInnerStartX, fInnerStartY, -hw], [fOuterStartX, fOuterStartY, -hw],
        [foEndX, foEndY, -hw], [fiEndX, fiEndY, -hw], [0, 0, -1]);
      // Back wall
      addQuad(
        [fOuterStartX, fOuterStartY, hw], [fInnerStartX, fInnerStartY, hw],
        [fiEndX, fiEndY, hw], [foEndX, foEndY, hw], [0, 0, 1]);
      // Inner wall — normal points inward (toward center)
      const fInNx = -Math.cos(alfaRad);
      const fInNy = -Math.sin(alfaRad);
      addQuad(
        [fInnerStartX, fInnerStartY, -hw], [fiEndX, fiEndY, -hw],
        [fiEndX, fiEndY, hw], [fInnerStartX, fInnerStartY, hw], [fInNx, fInNy, 0]);
      // Outer wall — normal points outward
      addQuad(
        [foEndX, foEndY, -hw], [fOuterStartX, fOuterStartY, -hw],
        [fOuterStartX, fOuterStartY, hw], [foEndX, foEndY, hw], [-fInNx, -fInNy, 0]);
    }

    // Curved section — inner and outer walls, front and back faces
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];

      // Front face (z = -hw)
      verts.push(ix0, iy0, -hw, ox0, oy0, -hw, ox1, oy1, -hw);
      verts.push(ix0, iy0, -hw, ox1, oy1, -hw, ix1, iy1, -hw);
      for (let j = 0; j < 6; j++) norms.push(0, 0, -1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Back face (z = +hw)
      verts.push(ox0, oy0, hw, ix0, iy0, hw, ix1, iy1, hw);
      verts.push(ox0, oy0, hw, ix1, iy1, hw, ox1, oy1, hw);
      for (let j = 0; j < 6; j++) norms.push(0, 0, 1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Inner wall (radius = sr)
      const nix = -(ix0 + ix1) / 2 / sr;
      const niy = -(iy0 + iy1) / 2 / sr;
      verts.push(ix0, iy0, hw, ix0, iy0, -hw, ix1, iy1, -hw);
      verts.push(ix0, iy0, hw, ix1, iy1, -hw, ix1, iy1, hw);
      for (let j = 0; j < 6; j++) norms.push(nix, niy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall (radius = sr + sb)
      const nox = (ox0 + ox1) / 2 / (sr + sb);
      const noy = (oy0 + oy1) / 2 / (sr + sb);
      verts.push(ox0, oy0, -hw, ox0, oy0, hw, ox1, oy1, hw);
      verts.push(ox0, oy0, -hw, ox1, oy1, hw, ox1, oy1, -hw);
      for (let j = 0; j < 6; j++) norms.push(nox, noy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    }

    // Edge lines
    // Top leg edges
    if (se > 0.001) {
      edgePts.push(sr, -se, -hw, sr + sb, -se, -hw);
      edgePts.push(sr, -se, hw, sr + sb, -se, hw);
      edgePts.push(sr, -se, -hw, sr, -se, hw);
      edgePts.push(sr + sb, -se, -hw, sr + sb, -se, hw);
      edgePts.push(sr, 0, -hw, sr, -se, -hw);
      edgePts.push(sr + sb, 0, -hw, sr + sb, -se, -hw);
      edgePts.push(sr, 0, hw, sr, -se, hw);
      edgePts.push(sr + sb, 0, hw, sr + sb, -se, hw);
    }
    // Left leg edges (f-leg along alfa direction)
    if (sf > 0.001) {
      const fiEndX = fInnerStartX + fDirX * sf;
      const fiEndY = fInnerStartY + fDirY * sf;
      const foEndX = fOuterStartX + fDirX * sf;
      const foEndY = fOuterStartY + fDirY * sf;
      edgePts.push(fiEndX, fiEndY, -hw, foEndX, foEndY, -hw);
      edgePts.push(fiEndX, fiEndY, hw, foEndX, foEndY, hw);
      edgePts.push(fiEndX, fiEndY, -hw, fiEndX, fiEndY, hw);
      edgePts.push(foEndX, foEndY, -hw, foEndX, foEndY, hw);
      edgePts.push(fInnerStartX, fInnerStartY, -hw, fiEndX, fiEndY, -hw);
      edgePts.push(fOuterStartX, fOuterStartY, -hw, foEndX, foEndY, -hw);
      edgePts.push(fInnerStartX, fInnerStartY, hw, fiEndX, fiEndY, hw);
      edgePts.push(fOuterStartX, fOuterStartY, hw, foEndX, foEndY, hw);
    }
    // Arc edges (front and back for inner and outer)
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];
      edgePts.push(ix0, iy0, -hw, ix1, iy1, -hw);
      edgePts.push(ox0, oy0, -hw, ox1, oy1, -hw);
      edgePts.push(ix0, iy0, hw, ix1, iy1, hw);
      edgePts.push(ox0, oy0, hw, ox1, oy1, hw);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, se, sf, sr, alfaRad]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Bend dimension labels */
const BendDimensionLabels: React.FC<{ a: number; b: number; e: number; f: number; r: number; alfa: number }> = ({ a, b, e, f, r, alfa }) => {
  const maxDim = Math.max(a, b, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sb = b * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;
  // f-leg direction
  const fDirX = -Math.sin(alfaRad);
  const fDirY = Math.cos(alfaRad);
  const fMidX = (sr + sb / 2) * Math.cos(alfaRad) + fDirX * sf / 2;
  const fMidY = (sr + sb / 2) * Math.sin(alfaRad) + fDirY * sf / 2;

  return (
    <>
      <Billboard position={[sr + sb / 2, -se - 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[sr + sb + 0.2, -se / 2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      <Billboard position={[fMidX, fMidY + 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="bottom">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      <Billboard position={[sr * 0.5, sr * 0.5, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
      </Billboard>
      {alfa !== 90 && (
        <Billboard position={[(sr + sb / 2) * Math.cos(alfaRad / 2) * 0.6, (sr + sb / 2) * Math.sin(alfaRad / 2) * 0.6, 0]}>
          <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`α = ${Math.round(alfa)}°`}</Text>
        </Billboard>
      )}
    </>
  );
};

/* ===== Reduction Bend Mesh — QBRa ===== */
const ReductionBendMesh: React.FC<{
  a: number; b: number; d: number; e: number; f: number; r: number; alfa: number
}> = ({ a, b, d, e, f, r, alfa }) => {
  const maxDim = Math.max(a, b, d, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const sd = d * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
    flatShading: false,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2;
    const segments = 16;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    // Inner arc: constant radius sr
    // Outer arc: interpolates from sr+sb at angle 0 to sr+sd at angle alfa
    const innerPts: [number, number][] = [];
    const outerPts: [number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * alfaRad;
      const t = i / segments;
      const outerR = sr + sb + (sd - sb) * t;
      innerPts.push([sr * Math.cos(angle), sr * Math.sin(angle)]);
      outerPts.push([outerR * Math.cos(angle), outerR * Math.sin(angle)]);
    }

    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], n: number[]) => {
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      for (let i = 0; i < 6; i++) norms.push(...n);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // E-leg direction and start points
    const eDirX = -Math.sin(alfaRad);
    const eDirY = Math.cos(alfaRad);
    const eInnerStartX = sr * Math.cos(alfaRad);
    const eInnerStartY = sr * Math.sin(alfaRad);
    const eOuterStartX = (sr + sd) * Math.cos(alfaRad);
    const eOuterStartY = (sr + sd) * Math.sin(alfaRad);

    // F-leg (bottom, at angle 0, width b, length f)
    if (sf > 0.001) {
      addQuad([sr, 0, -hw], [sr, -sf, -hw], [sr + sb, -sf, -hw], [sr + sb, 0, -hw], [0, 0, -1]);
      addQuad([sr, 0, hw], [sr + sb, 0, hw], [sr + sb, -sf, hw], [sr, -sf, hw], [0, 0, 1]);
      addQuad([sr, 0, -hw], [sr, 0, hw], [sr, -sf, hw], [sr, -sf, -hw], [-1, 0, 0]);
      addQuad([sr + sb, 0, hw], [sr + sb, 0, -hw], [sr + sb, -sf, -hw], [sr + sb, -sf, hw], [1, 0, 0]);
    }

    // E-leg (tangent at angle alfa, width d, length e)
    if (se > 0.001) {
      const eiEndX = eInnerStartX + eDirX * se;
      const eiEndY = eInnerStartY + eDirY * se;
      const eoEndX = eOuterStartX + eDirX * se;
      const eoEndY = eOuterStartY + eDirY * se;
      addQuad(
        [eInnerStartX, eInnerStartY, -hw], [eOuterStartX, eOuterStartY, -hw],
        [eoEndX, eoEndY, -hw], [eiEndX, eiEndY, -hw], [0, 0, -1]);
      addQuad(
        [eOuterStartX, eOuterStartY, hw], [eInnerStartX, eInnerStartY, hw],
        [eiEndX, eiEndY, hw], [eoEndX, eoEndY, hw], [0, 0, 1]);
      const eInNx = -Math.cos(alfaRad);
      const eInNy = -Math.sin(alfaRad);
      addQuad(
        [eInnerStartX, eInnerStartY, -hw], [eiEndX, eiEndY, -hw],
        [eiEndX, eiEndY, hw], [eInnerStartX, eInnerStartY, hw], [eInNx, eInNy, 0]);
      addQuad(
        [eoEndX, eoEndY, -hw], [eOuterStartX, eOuterStartY, -hw],
        [eOuterStartX, eOuterStartY, hw], [eoEndX, eoEndY, hw], [-eInNx, -eInNy, 0]);
    }

    // Curved section
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];
      const t = (i + 0.5) / segments;
      const outerR = sr + sb + (sd - sb) * t;

      // Front face (z = -hw)
      verts.push(ix0, iy0, -hw, ox0, oy0, -hw, ox1, oy1, -hw);
      verts.push(ix0, iy0, -hw, ox1, oy1, -hw, ix1, iy1, -hw);
      for (let j = 0; j < 6; j++) norms.push(0, 0, -1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Back face (z = +hw)
      verts.push(ox0, oy0, hw, ix0, iy0, hw, ix1, iy1, hw);
      verts.push(ox0, oy0, hw, ix1, iy1, hw, ox1, oy1, hw);
      for (let j = 0; j < 6; j++) norms.push(0, 0, 1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Inner wall (constant radius sr)
      const nix = -(ix0 + ix1) / 2 / sr;
      const niy = -(iy0 + iy1) / 2 / sr;
      verts.push(ix0, iy0, hw, ix0, iy0, -hw, ix1, iy1, -hw);
      verts.push(ix0, iy0, hw, ix1, iy1, -hw, ix1, iy1, hw);
      for (let j = 0; j < 6; j++) norms.push(nix, niy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall (interpolated radius)
      const nox = (ox0 + ox1) / 2 / outerR;
      const noy = (oy0 + oy1) / 2 / outerR;
      verts.push(ox0, oy0, -hw, ox0, oy0, hw, ox1, oy1, hw);
      verts.push(ox0, oy0, -hw, ox1, oy1, hw, ox1, oy1, -hw);
      for (let j = 0; j < 6; j++) norms.push(nox, noy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    }

    // Edge lines
    if (sf > 0.001) {
      edgePts.push(sr, -sf, -hw, sr + sb, -sf, -hw);
      edgePts.push(sr, -sf, hw, sr + sb, -sf, hw);
      edgePts.push(sr, -sf, -hw, sr, -sf, hw);
      edgePts.push(sr + sb, -sf, -hw, sr + sb, -sf, hw);
      edgePts.push(sr, 0, -hw, sr, -sf, -hw);
      edgePts.push(sr + sb, 0, -hw, sr + sb, -sf, -hw);
      edgePts.push(sr, 0, hw, sr, -sf, hw);
      edgePts.push(sr + sb, 0, hw, sr + sb, -sf, hw);
    }
    if (se > 0.001) {
      const eiEndX = eInnerStartX + eDirX * se;
      const eiEndY = eInnerStartY + eDirY * se;
      const eoEndX = eOuterStartX + eDirX * se;
      const eoEndY = eOuterStartY + eDirY * se;
      edgePts.push(eiEndX, eiEndY, -hw, eoEndX, eoEndY, -hw);
      edgePts.push(eiEndX, eiEndY, hw, eoEndX, eoEndY, hw);
      edgePts.push(eiEndX, eiEndY, -hw, eiEndX, eiEndY, hw);
      edgePts.push(eoEndX, eoEndY, -hw, eoEndX, eoEndY, hw);
      edgePts.push(eInnerStartX, eInnerStartY, -hw, eiEndX, eiEndY, -hw);
      edgePts.push(eOuterStartX, eOuterStartY, -hw, eoEndX, eoEndY, -hw);
      edgePts.push(eInnerStartX, eInnerStartY, hw, eiEndX, eiEndY, hw);
      edgePts.push(eOuterStartX, eOuterStartY, hw, eoEndX, eoEndY, hw);
    }
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];
      edgePts.push(ix0, iy0, -hw, ix1, iy1, -hw);
      edgePts.push(ox0, oy0, -hw, ox1, oy1, -hw);
      edgePts.push(ix0, iy0, hw, ix1, iy1, hw);
      edgePts.push(ox0, oy0, hw, ox1, oy1, hw);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, se, sf, sr, alfaRad]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Reduction Bend dimension labels */
const ReductionBendLabels: React.FC<{
  a: number; b: number; d: number; e: number; f: number; r: number; alfa: number
}> = ({ a, b, d, e, f, r, alfa }) => {
  const maxDim = Math.max(a, b, d, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sb = b * scale;
  const sd = d * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const eDirX = -Math.sin(alfaRad);
  const eDirY = Math.cos(alfaRad);
  const eOuterStartX = (sr + sd) * Math.cos(alfaRad);
  const eOuterStartY = (sr + sd) * Math.sin(alfaRad);
  const eMidX = (sr + sd / 2) * Math.cos(alfaRad) + eDirX * se / 2;
  const eMidY = (sr + sd / 2) * Math.sin(alfaRad) + eDirY * se / 2;

  return (
    <>
      <Billboard position={[(sr + sb / 2), -sf - 0.15, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[eMidX + Math.cos(alfaRad) * 0.2, eMidY + Math.sin(alfaRad) * 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[sr + sb + 0.2, -sf / 2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      <Billboard position={[eOuterStartX + eDirX * se / 2 + Math.cos(alfaRad) * 0.2, eOuterStartY + eDirY * se / 2 + Math.sin(alfaRad) * 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      <Billboard position={[sr * 0.5, sr * 0.5, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
      </Billboard>
      {alfa !== 90 && (
        <Billboard position={[(sr + sb / 2) * Math.cos(alfaRad / 2) * 0.6, (sr + sb / 2) * Math.sin(alfaRad / 2) * 0.6, 0]}>
          <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`α = ${Math.round(alfa)}°`}</Text>
        </Billboard>
      )}
    </>
  );
};

/* ===== Diffuser Bend Mesh — QBR1a ===== */
const DiffuserBendMesh: React.FC<{
  a: number; dVal: number; c: number; bVal: number; e: number; f: number; r: number; g: number; alfa: number
}> = ({ a, dVal, c, bVal, e, f, r, g, alfa }) => {
  const maxDim = Math.max(a, c, dVal, bVal, e, f, r, dVal + r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sc = c * scale;
  const sd = dVal * scale;
  const sb = bVal * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const sg = g * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
    flatShading: false,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const segments = 16;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    // Z-offset computation (from C# gg formula)
    let gg: number;
    if (sc <= sa) {
      gg = (sa - sc) / 2 - sg;
    } else {
      gg = (sc - sa) / 2 + sg;
    }

    // Z-boundary interpolation totals
    const absDiff = Math.abs(sa / 2 - sc / 2);
    const difflTotal = absDiff - gg;  // left boundary total shift
    const diffpTotal = absDiff + gg;  // right boundary total shift

    // For each arc segment, compute z-boundaries and outer radius
    const innerPts: [number, number][] = [];
    const outerPts: [number, number][] = [];
    const zLeftArr: number[] = [];
    const zRightArr: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * alfaRad;
      const t = i / segments;
      const outerR = sr + sd + (sb - sd) * t;
      innerPts.push([sr * Math.cos(angle), sr * Math.sin(angle)]);
      outerPts.push([outerR * Math.cos(angle), outerR * Math.sin(angle)]);
      zLeftArr.push(-sa / 2 + difflTotal * t);
      zRightArr.push(sa / 2 - diffpTotal * t);
    }

    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], n: number[]) => {
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      for (let i = 0; i < 6; i++) norms.push(...n);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // E-leg direction
    const eDirX = -Math.sin(alfaRad);
    const eDirY = Math.cos(alfaRad);
    const eInnerStartX = sr * Math.cos(alfaRad);
    const eInnerStartY = sr * Math.sin(alfaRad);
    const eOuterStartX = (sr + sb) * Math.cos(alfaRad);
    const eOuterStartY = (sr + sb) * Math.sin(alfaRad);
    const exitZL = zLeftArr[segments];
    const exitZR = zRightArr[segments];

    // F-leg (bottom, at angle 0, radial depth dVal, z-width a)
    const fHw = sa / 2;
    if (sf > 0.001) {
      addQuad([sr, 0, -fHw], [sr, -sf, -fHw], [sr + sd, -sf, -fHw], [sr + sd, 0, -fHw], [0, 0, -1]);
      addQuad([sr, 0, fHw], [sr + sd, 0, fHw], [sr + sd, -sf, fHw], [sr, -sf, fHw], [0, 0, 1]);
      addQuad([sr, 0, -fHw], [sr, 0, fHw], [sr, -sf, fHw], [sr, -sf, -fHw], [-1, 0, 0]);
      addQuad([sr + sd, 0, fHw], [sr + sd, 0, -fHw], [sr + sd, -sf, -fHw], [sr + sd, -sf, fHw], [1, 0, 0]);
    }

    // E-leg (tangent at angle alfa, radial depth bVal, z-width c)
    if (se > 0.001) {
      const eiEndX = eInnerStartX + eDirX * se;
      const eiEndY = eInnerStartY + eDirY * se;
      const eoEndX = eOuterStartX + eDirX * se;
      const eoEndY = eOuterStartY + eDirY * se;
      addQuad(
        [eInnerStartX, eInnerStartY, exitZL], [eOuterStartX, eOuterStartY, exitZL],
        [eoEndX, eoEndY, exitZL], [eiEndX, eiEndY, exitZL], [0, 0, -1]);
      addQuad(
        [eOuterStartX, eOuterStartY, exitZR], [eInnerStartX, eInnerStartY, exitZR],
        [eiEndX, eiEndY, exitZR], [eoEndX, eoEndY, exitZR], [0, 0, 1]);
      const eInNx = -Math.cos(alfaRad);
      const eInNy = -Math.sin(alfaRad);
      addQuad(
        [eInnerStartX, eInnerStartY, exitZL], [eiEndX, eiEndY, exitZL],
        [eiEndX, eiEndY, exitZR], [eInnerStartX, eInnerStartY, exitZR], [eInNx, eInNy, 0]);
      addQuad(
        [eoEndX, eoEndY, exitZL], [eOuterStartX, eOuterStartY, exitZL],
        [eOuterStartX, eOuterStartY, exitZR], [eoEndX, eoEndY, exitZR], [-eInNx, -eInNy, 0]);
    }

    // Curved section — all 4 walls with interpolated z-width and radial depth
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];
      const zL0 = zLeftArr[i], zL1 = zLeftArr[i + 1];
      const zR0 = zRightArr[i], zR1 = zRightArr[i + 1];
      const t = (i + 0.5) / segments;
      const outerR = sr + sd + (sb - sd) * t;

      // Front face (z = zLeft)
      verts.push(ix0, iy0, zL0, ox0, oy0, zL0, ox1, oy1, zL1);
      verts.push(ix0, iy0, zL0, ox1, oy1, zL1, ix1, iy1, zL1);
      for (let j = 0; j < 6; j++) norms.push(0, 0, -1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
      
      // Back face (z = zRight)
      verts.push(ox0, oy0, zR0, ix0, iy0, zR0, ix1, iy1, zR1);
      verts.push(ox0, oy0, zR0, ix1, iy1, zR1, ox1, oy1, zR1);
      for (let j = 0; j < 6; j++) norms.push(0, 0, 1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Inner wall
      const nix = -(ix0 + ix1) / 2 / sr;
      const niy = -(iy0 + iy1) / 2 / sr;
      verts.push(ix0, iy0, zR0, ix0, iy0, zL0, ix1, iy1, zL1);
      verts.push(ix0, iy0, zR0, ix1, iy1, zL1, ix1, iy1, zR1);
      for (let j = 0; j < 6; j++) norms.push(nix, niy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall
      const nox = (ox0 + ox1) / 2 / outerR;
      const noy = (oy0 + oy1) / 2 / outerR;
      verts.push(ox0, oy0, zL0, ox0, oy0, zR0, ox1, oy1, zR1);
      verts.push(ox0, oy0, zL0, ox1, oy1, zR1, ox1, oy1, zL1);
      for (let j = 0; j < 6; j++) norms.push(nox, noy, 0);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    }

    // Edge lines
    if (sf > 0.001) {
      edgePts.push(sr, -sf, -fHw, sr + sd, -sf, -fHw);
      edgePts.push(sr, -sf, fHw, sr + sd, -sf, fHw);
      edgePts.push(sr, -sf, -fHw, sr, -sf, fHw);
      edgePts.push(sr + sd, -sf, -fHw, sr + sd, -sf, fHw);
      edgePts.push(sr, 0, -fHw, sr, -sf, -fHw);
      edgePts.push(sr + sd, 0, -fHw, sr + sd, -sf, -fHw);
      edgePts.push(sr, 0, fHw, sr, -sf, fHw);
      edgePts.push(sr + sd, 0, fHw, sr + sd, -sf, fHw);
    }
    if (se > 0.001) {
      const eiEndX = eInnerStartX + eDirX * se;
      const eiEndY = eInnerStartY + eDirY * se;
      const eoEndX = eOuterStartX + eDirX * se;
      const eoEndY = eOuterStartY + eDirY * se;
      edgePts.push(eiEndX, eiEndY, exitZL, eoEndX, eoEndY, exitZL);
      edgePts.push(eiEndX, eiEndY, exitZR, eoEndX, eoEndY, exitZR);
      edgePts.push(eiEndX, eiEndY, exitZL, eiEndX, eiEndY, exitZR);
      edgePts.push(eoEndX, eoEndY, exitZL, eoEndX, eoEndY, exitZR);
      edgePts.push(eInnerStartX, eInnerStartY, exitZL, eiEndX, eiEndY, exitZL);
      edgePts.push(eOuterStartX, eOuterStartY, exitZL, eoEndX, eoEndY, exitZL);
      edgePts.push(eInnerStartX, eInnerStartY, exitZR, eiEndX, eiEndY, exitZR);
      edgePts.push(eOuterStartX, eOuterStartY, exitZR, eoEndX, eoEndY, exitZR);
    }
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerPts[i];
      const [ix1, iy1] = innerPts[i + 1];
      const [ox0, oy0] = outerPts[i];
      const [ox1, oy1] = outerPts[i + 1];
      const zL0 = zLeftArr[i], zL1 = zLeftArr[i + 1];
      const zR0 = zRightArr[i], zR1 = zRightArr[i + 1];
      edgePts.push(ix0, iy0, zL0, ix1, iy1, zL1);
      edgePts.push(ox0, oy0, zL0, ox1, oy1, zL1);
      edgePts.push(ix0, iy0, zR0, ix1, iy1, zR1);
      edgePts.push(ox0, oy0, zR0, ox1, oy1, zR1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sc, sd, sb, se, sf, sr, sg, alfaRad]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Diffuser Bend dimension labels */
const DiffuserBendLabels: React.FC<{
  a: number; dVal: number; c: number; bVal: number; e: number; f: number; r: number; alfa: number
}> = ({ a, dVal, c, bVal, e, f, r, alfa }) => {
  const maxDim = Math.max(a, c, dVal, bVal, e, f, r, dVal + r, 1);
  const scale = 2 / maxDim;
  const sd = dVal * scale;
  const sb = bVal * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const eDirX = -Math.sin(alfaRad);
  const eDirY = Math.cos(alfaRad);
  const eOuterStartX = (sr + sb) * Math.cos(alfaRad);
  const eOuterStartY = (sr + sb) * Math.sin(alfaRad);

  return (
    <>
      <Billboard position={[(sr + sd / 2), -sf - 0.15, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`d = ${Math.round(dVal)}`}</Text>
      </Billboard>
      <Billboard position={[(sr + sb / 2) * Math.cos(alfaRad) + eDirX * se / 2 + Math.cos(alfaRad) * 0.2, (sr + sb / 2) * Math.sin(alfaRad) + eDirY * se / 2 + Math.sin(alfaRad) * 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="middle">{`b = ${Math.round(bVal)}`}</Text>
      </Billboard>
      <Billboard position={[sr + sd + 0.2, -sf / 2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      <Billboard position={[eOuterStartX + eDirX * se / 2 + Math.cos(alfaRad) * 0.2, eOuterStartY + eDirY * se / 2 + Math.sin(alfaRad) * 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      <Billboard position={[sr * 0.5, sr * 0.5, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
      </Billboard>
      {alfa !== 90 && (
        <Billboard position={[(sr + sd / 2) * Math.cos(alfaRad / 2) * 0.6, (sr + sd / 2) * Math.sin(alfaRad / 2) * 0.6, 0]}>
          <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`α = ${Math.round(alfa)}°`}</Text>
        </Billboard>
      )}
    </>
  );
};

/* ===== Reduction Elbow Mesh — QBFRa (90° L-shaped) ===== */
const ReductionElbowMesh: React.FC<{
  a: number; b: number; d: number; e: number; f: number; r: number
}> = ({ a, b, d, e, f, r }) => {
  const maxDim = Math.max(a, b + e, d + f, r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const sd = d * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
    flatShading: false,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2; // half z-width
    const segments = 12;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], n: number[]) => {
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      for (let i = 0; i < 6; i++) norms.push(...n);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Geometry: L-shape in XY plane, z=±hw
    // Vertical leg: from y=0 (bottom) to y=se+sb (top of vertical section)
    //   inner wall at x=0, outer wall at x=sb
    // Corner: 90° arc connecting vertical (inner x=0) to horizontal (inner y=se+sb)
    //   inner arc center at (sr, se+sb-sr)? No...
    //
    // Following C# layout (translated):
    // The vertical leg goes from bottom (y=0) up to y=se (where e-section ends)
    // Then width b continues up to y=se+sb
    // Horizontal leg: from x=0 going +x, from y=se+sb going up by sd
    //
    // Actually, let me use a clean coordinate system:
    // Bottom-left corner style:
    // Vertical: x from 0 to sb, y from 0 upward to se+sb
    //   bottom flange at y=0
    // Horizontal: x from 0 to sf+sr, y from se+sb to se+sb+sd
    //   right flange at x=sf+sr
    // Corner: quarter-circle connecting inner walls
    //   Inner walls: vertical at x=0, horizontal at y=se+sb
    //   Inner arc center: (sr, se+sb-sr)... that doesn't work either
    //
    // Let me think about this differently using the C# vertex data:
    // In C#: dx = (e+b)/2, dy = (d+f)/2 — centering offsets
    // After centering:
    //   p0-3: top of vertical leg at (e-dx, d+f-dy, ±a/2) inner and (e+b-dx, d+f-dy, ±a/2) outer
    //   p4-7: bottom flange at (-dx, -dy, ±a/2) inner and (e+b-dx, -dy, ±a/2) outer
    //   p8-11: inner corner top at (e-dx, d+r-dy, ±a/2) and outer at (e+b-dx, d+r-dy, ±a/2)
    //   p12-13: inner corner left at (e-r-dx, d-dy, ±a/2)
    //   p14-15: outer corner left at (e-r-dx, -dy, ±a/2)
    //   p16-17: bottom-left at (-dx, d-dy, ±a/2)
    //
    // So the L has:
    //   - Vertical right section: x from e to e+b, y from 0 to d+f (outer right wall)
    //   - Vertical inner wall: x=e, y from d+r to d+f (only above the arc)
    //   - Horizontal section: x from 0 to e-r, y from 0 to d (bottom part)
    //   - Corner arc: from (e, d+r) to (e-r, d), quarter circle radius r, inner wall
    //   - Bottom: x from 0 to e+b, y=0

    // Let me use C# coordinate system directly (centered):
    const dx = (se + sb) / 2;
    const dy = (sd + sf) / 2;

    // Arc center for inner corner: (se-sr-dx, sd+sr-dy)
    // arcCenter = (arcLeftInner[0] + sr, arcLeftInner[1] + sr) = (se-dx, sd-dy+sr) = (se-dx, sd+sr-dy)
    // At angle 0 (right): center + (sr, 0) = (se-dx+sr, sd+sr-dy) — that's NOT a vertex
    // At angle π (left): center + (-sr, 0) = (se-sr-dx, sd+sr-dy) — that's NOT p12 either
    // p12 = (se-sr-dx, sd-dy) = center + (−sr, −sr) → angle = 5π/4? No, (−sr, −sr) is at angle 225°

    // Actually, the arc center should be at (se-dx, sd-dy) with radius sr
    // Then: going from (se-dx, sd-dy-sr) [below center, not useful] ... hmm

    // Let me re-examine C# vertices:
    // p12 = (e-r-dx, d-dy) = (e-r-dx, d-dy)
    // p8 = (e-dx, d+r-dy) = (e-dx, d+r-dy)
    //
    // Arc points (25-29 for z=-a/2):
    // p25: p12 + (cos(15°)*r, r - sin(15°)*r)
    // p26: p12 + (cos(30°)*r, r - sin(30°)*r)
    // ...
    // p29: p12 + (cos(75°)*r, r - sin(75°)*r)
    //
    // So arc center = (p12[0], p12[1] + r) = (e-r-dx, d-dy+r) = (e-r-dx, d+r-dy)
    // Hmm: at angle 0° (cos0=1,sin0=0): p12 + (r, r-0) = (e-dx, d+r-dy) = p8 ✓
    // at angle 90° (cos90=0,sin90=1): p12 + (0, r-r) = (e-r-dx, d-dy) = p12 ✓✓ (identity)
    // Wait that means at 90° we get p12 itself, which means the parametric goes FROM p8 (angle 0) TO p12 (angle 90)
    //
    // So: arc center = (e-r-dx, d+r-dy)
    // At parametric angle θ (0 to 90°):
    //   x = center_x + cos(θ)*r = (e-r-dx) + cos(θ)*r
    //   y = center_y - sin(θ)*r = (d+r-dy) - sin(θ)*r
    // At θ=0: x=e-dx, y=d+r-dy → p8 ✓
    // At θ=90: x=e-r-dx, y=d-dy → p12 ✓

    const innerArcCX = se - sr - dx;
    const innerArcCY = sd + sr - dy;

    // Generate inner arc points (front and back z)
    const innerArcPtsF: [number, number][] = []; // front z=-hw
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * (Math.PI / 2);
      const px = innerArcCX + Math.cos(angle) * sr;
      const py = innerArcCY - Math.sin(angle) * sr;
      innerArcPtsF.push([px, py]);
    }
    // innerArcPtsF[0] = near p8 (se-dx, sd+sr-dy) — top of arc
    // innerArcPtsF[last] = near p12 (se-sr-dx, sd-dy) — left of arc

    // Outer wall approximation: the outer corner uses interpolated pts (21,22 from bottom, 23,24 from right) + arc 25-29
    // For the 3D mesh: the outer wall in the corner connects:
    //   bottom side: from p15(e-r-dx, -dy) through p21,p22 to p5(e+b-dx, -dy)
    //   right side: from p5(e+b-dx, -dy) through p23,p24 to p9(e+b-dx, d+r-dy)
    //   arc: p24→p27→p26→p25→p29→p12 — but these are specific interpolation points
    //
    // For simplicity, I'll model the outer corner as quads connecting inner arc points to outer interpolated points.
    // The outer boundary in the corner goes from (e+b-dx, -dy) [p5] up to (e+b-dx, d+r-dy) [p9]
    // This is actually the outer wall of the vertical section continuing through the corner.

    // Simplified approach for the 3D mesh:
    // 1. Vertical leg: 4 walls from bottom flange to top flange
    // 2. Horizontal leg: 4 walls from left end to right flange
    // 3. Corner: connect vertical inner wall to horizontal inner wall via arc
    //    The corner "fills" the space between the inner arc and an outer reference

    // Even simpler: model as a continuous L with a rounded inner corner
    // The shape has 3 sections:
    //   Bottom section (horizontal part): from x=-dx..e-r-dx (width), y=-dy..sd-dy (height d)
    //   Vertical section: from x=se-dx..se+sb-dx (width b), y=-dy..sd+sf-dy (height d+f)
    //   Corner section: connects bottom inner top edge to vertical inner left edge via arc

    // Let me build this more directly:

    // SECTION 1: Bottom horizontal leg
    // From x=-dx to x=se-sr-dx, y from -dy to sd-dy, z=±hw
    const hx0 = -dx;
    const hx1 = se - sr - dx;
    const hy0 = -dy;
    const hy1 = sd - dy;

    // Bottom wall (y=hy0, facing -y)
    addQuad([hx0, hy0, hw], [hx0, hy0, -hw], [hx1, hy0, -hw], [hx1, hy0, hw], [0, -1, 0]);
    // Top wall (y=hy1, facing +y)
    addQuad([hx0, hy1, hw], [hx0, hy1, -hw], [hx1, hy1, -hw], [hx1, hy1, hw], [0, 1, 0]);
    // Front face (z=-hw)
    addQuad([hx0, hy0, -hw], [hx0, hy1, -hw], [hx1, hy1, -hw], [hx1, hy0, -hw], [0, 0, -1]);
    // Back face (z=+hw)
    addQuad([hx0, hy0, hw], [hx1, hy0, hw], [hx1, hy1, hw], [hx0, hy1, hw], [0, 0, 1]);

    // SECTION 2: Vertical right section
    // From x=se-dx to x=se+sb-dx, y from -dy to sd+sf-dy
    const vx0 = se - dx;
    const vx1 = se + sb - dx;
    const vy0 = -dy;
    const vy1 = sd + sf - dy;

    // Right wall (x=vx1, facing +x)
    addQuad([vx1, vy0, hw], [vx1, vy0, -hw], [vx1, vy1, -hw], [vx1, vy1, hw], [1, 0, 0]);
    // Bottom wall (y=vy0, facing -y) — from hx1 to vx0 already covered, from vx0 to vx1
    addQuad([vx0, vy0, hw], [vx0, vy0, -hw], [vx1, vy0, -hw], [vx1, vy0, hw], [0, -1, 0]);
    // Left wall (x=vx0, facing -x) — only from sd+sr-dy up to vy1
    const vLeftStart = sd + sr - dy;
    addQuad([vx0, vLeftStart, hw], [vx0, vLeftStart, -hw], [vx0, vy1, -hw], [vx0, vy1, hw], [-1, 0, 0]);
    // Front face (z=-hw)
    addQuad([vx0, vy0, -hw], [vx0, vy1, -hw], [vx1, vy1, -hw], [vx1, vy0, -hw], [0, 0, -1]);
    // Back face (z=+hw)
    addQuad([vx0, vy0, hw], [vx1, vy0, hw], [vx1, vy1, hw], [vx0, vy1, hw], [0, 0, 1]);

    // SECTION 3: Corner — fill the bottom part connecting horizontal to vertical
    // Inner arc: from (vx0, sd+sr-dy) [top, = p8] sweeping to (se-sr-dx, sd-dy) [left, = p12]
    // This area is bounded by:
    //   Inner: arc
    //   Bottom: y=-dy
    //   Right: vertical section left edge at x=vx0=se-dx (above arcTop), continuing along arc below
    //   
    // The corner region: x from hx1 to vx0, y from hy0 to vLeftStart
    // with the inner arc cutting through

    // Bottom strip of corner (below arc): x from hx1 to vx0, y from -dy to sd-dy
    // This connects the bottom of horizontal leg to the bottom of vertical leg
    addQuad([hx1, hy0, hw], [hx1, hy0, -hw], [vx0, hy0, -hw], [vx0, hy0, hw], [0, -1, 0]);
    // Front face of bottom strip
    addQuad([hx1, hy0, -hw], [hx1, hy1, -hw], [vx0, hy0, -hw], [vx0, hy0, -hw], [0, 0, -1]); // degenerate, skip
    // Actually this region is complex. Let me use arc segments instead:

    // Restore original arc/fillet mesh construction for QBFRa
    // Inner arc wall: curved surface from arc top to arc left
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * (Math.PI / 2);
      const a1 = ((i + 1) / segments) * (Math.PI / 2);
      const [ix0, iy0] = innerArcPtsF[i];
      const [ix1, iy1] = innerArcPtsF[i + 1];
      // Normal points inward (toward center)
      const midAngle = (a0 + a1) / 2;
      const nx = -Math.cos(midAngle);
      const ny = Math.sin(midAngle);

      addQuad(
        [ix0, iy0, hw], [ix0, iy0, -hw], [ix1, iy1, -hw], [ix1, iy1, hw],
        [nx, ny, 0]
      );
    }

    // Front and back faces of corner region (triangle fan from arc)
    // Front (z=-hw): fill the area bounded by arc and the straight edges
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerArcPtsF[i];
      const [ix1, iy1] = innerArcPtsF[i + 1];
      // Triangle connecting arc segment to bottom-right corner of the corner region
      verts.push(vx0, vy0, -hw, ix0, iy0, -hw, ix1, iy1, -hw);
      for (let j = 0; j < 3; j++) norms.push(0, 0, -1);
      uvArr.push(0,0, 1,0, 0,1);
    }
    // Additional triangles to fill horizontal part
    verts.push(hx1, hy0, -hw, hx1, hy1, -hw, innerArcPtsF[segments][0], innerArcPtsF[segments][1], -hw);
    for (let j = 0; j < 3; j++) norms.push(0, 0, -1);
    uvArr.push(0,0, 1,0, 0,1);
    verts.push(hx1, hy0, -hw, innerArcPtsF[segments][0], innerArcPtsF[segments][1], -hw, vx0, vy0, -hw);
    for (let j = 0; j < 3; j++) norms.push(0, 0, -1);
    uvArr.push(0,0, 1,0, 0,1);

    // Back (z=+hw): mirror
    for (let i = 0; i < segments; i++) {
      const [ix0, iy0] = innerArcPtsF[i];
      const [ix1, iy1] = innerArcPtsF[i + 1];
      verts.push(ix0, iy0, hw, vx0, vy0, hw, ix1, iy1, hw);
      for (let j = 0; j < 3; j++) norms.push(0, 0, 1);
      uvArr.push(0,0, 1,0, 0,1);
    }
    verts.push(hx1, hy1, hw, hx1, hy0, hw, innerArcPtsF[segments][0], innerArcPtsF[segments][1], hw);
    for (let j = 0; j < 3; j++) norms.push(0, 0, 1);
    uvArr.push(0,0, 1,0, 0,1);
    verts.push(innerArcPtsF[segments][0], innerArcPtsF[segments][1], hw, hx1, hy0, hw, vx0, vy0, hw);
    for (let j = 0; j < 3; j++) norms.push(0, 0, 1);
    uvArr.push(0,0, 1,0, 0,1);

    // Edge lines
    // Keep the same wall-edge node order as inner arc: front (-z) first, then back (+z)
    const pushWallEdgePair = (x0: number, y0: number, x1: number, y1: number) => {
      edgePts.push(x0, y0, -hw, x1, y1, -hw);
      edgePts.push(x0, y0, hw, x1, y1, hw);
    };

    // Bottom flange
    pushWallEdgePair(hx0, hy0, vx1, hy0);
    edgePts.push(hx0, hy0, -hw, hx0, hy0, hw);
    edgePts.push(vx1, hy0, -hw, vx1, hy0, hw);
    // Top flange (vertical)
    pushWallEdgePair(vx0, vy1, vx1, vy1);
    edgePts.push(vx0, vy1, -hw, vx0, vy1, hw);
    edgePts.push(vx1, vy1, -hw, vx1, vy1, hw);
    // Left wall of horizontal
    pushWallEdgePair(hx0, hy0, hx0, hy1);
    edgePts.push(hx0, hy1, -hw, hx0, hy1, hw);
    // Horizontal top wall
    pushWallEdgePair(hx0, hy1, hx1, hy1);
    // Right wall of vertical
    pushWallEdgePair(vx1, hy0, vx1, vy1);
    // Vertical left wall (above arc)
    pushWallEdgePair(vx0, vLeftStart, vx0, vy1);
    // Inner arc edges
    for (let i = 0; i < segments; i++) {
      const [ax0, ay0] = innerArcPtsF[i];
      const [ax1, ay1] = innerArcPtsF[i + 1];
      edgePts.push(ax0, ay0, -hw, ax1, ay1, -hw);
      edgePts.push(ax0, ay0, hw, ax1, ay1, hw);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, se, sf, sr]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* ===== TR1a Tee — rectangular branch off bottom of main duct ===== */
// Params: a (main z-depth), b (main y-height), d (branch z-depth), w (branch x-width),
//         L (main x-length), e (branch x-offset from left), f (branch z-offset from front), l3 (branch y-length)
const TR1aMesh: React.FC<{
  a: number; b: number; d: number; w: number; L: number;
  e: number; f: number; l3: number;
}> = ({ a, b, d, w, L, e, f, l3 }) => {
  const maxDim = Math.max(a, b, d, w, L, e, f, l3, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = d * scale;
  const sw = w * scale, sl = L * scale;
  const se = e * scale, sf = f * scale, sl3 = l3 * scale;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
    flatShading: false,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hL = sl / 2, hb = sb / 2, ha = sa / 2;

    // Branch reference offsets (C# dx, dy, dz)
    const brDX = -hL + se;           // branch center x
    const brTopY = -hb;              // branch top y = main duct bottom
    const brBotY = -hb - sl3;        // branch bottom y
    const brFrtZ = -ha + sf - sd / 2; // branch front z
    const brBckZ = -ha + sf + sd / 2; // branch back z
    const brLftX = brDX - sw / 2;    // branch left x
    const brRgtX = brDX + sw / 2;    // branch right x

    // Main duct corners (p0-p7)
    const p0 = [-hL,  hb, -ha];
    const p1 = [ hL,  hb, -ha];
    const p2 = [ hL, -hb, -ha];
    const p3 = [-hL, -hb, -ha];
    const p4 = [-hL,  hb,  ha];
    const p5 = [ hL,  hb,  ha];
    const p6 = [ hL, -hb,  ha];
    const p7 = [-hL, -hb,  ha];

    // Branch corners (p8-p15, mirroring C# punkty)
    const p8  = [brLftX, brTopY, brFrtZ];
    const p9  = [brRgtX, brTopY, brFrtZ];
    const p10 = [brRgtX, brBotY, brFrtZ];
    const p11 = [brLftX, brBotY, brFrtZ];
    const p12 = [brLftX, brTopY, brBckZ];
    const p13 = [brRgtX, brTopY, brBckZ];
    const p14 = [brRgtX, brBotY, brBckZ];
    const p15 = [brLftX, brBotY, brBckZ];

    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[], n: number[]) => {
      verts.push(...q0, ...q1, ...q2, ...q0, ...q2, ...q3);
      for (let i = 0; i < 6; i++) norms.push(...n);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // ── Main duct walls ───────────────────────────────────────────────────────
    // Front face (z=-ha, facing -z)
    addQuad(p3, p0, p1, p2, [0, 0, -1]);
    // Top face (y=hb, facing +y)
    addQuad(p0, p1, p5, p4, [0, 1, 0]);
    // Back face (z=ha, facing +z)
    addQuad(p6, p5, p4, p7, [0, 0, 1]);

    // ── Bottom face with branch hole (4 sections, all y=-hb, normal [0,-1,0]) ─
    // Front strip: full z width of main duct narrowing to branch front z at (brLftX..brRgtX)
    addQuad(p2, p3, p8, p9, [0, -1, 0]);
    // Right strip: from branch right x to main duct right end (hL)
    addQuad(p2, p9, p13, p6, [0, -1, 0]);
    // Back strip: from branch back z to main duct back
    addQuad(p13, p12, p7, p6, [0, -1, 0]);
    // Left strip: from main duct left to branch left x
    addQuad(p3, p7, p12, p8, [0, -1, 0]);

    // ── Branch walls (open top = hole in main duct, open bottom = outlet) ─────
    // Branch front (z=brFrtZ, facing -z)
    addQuad(p11, p8,  p9,  p10, [0, 0, -1]);
    // Branch right (x=brRgtX, facing +x)
    addQuad(p10, p9,  p13, p14, [1, 0,  0]);
    // Branch back (z=brBckZ, facing +z)
    addQuad(p14, p13, p12, p15, [0, 0,  1]);
    // Branch left (x=brLftX, facing -x)
    addQuad(p15, p12, p8,  p11, [-1, 0, 0]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    // ── Edge wireframe ────────────────────────────────────────────────────────
    const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) =>
      edgePts.push(ax, ay, az, bx, by, bz);

    // Main duct front face edges
    seg(p0[0],p0[1],p0[2], p1[0],p1[1],p1[2]);
    seg(p1[0],p1[1],p1[2], p2[0],p2[1],p2[2]);
    seg(p2[0],p2[1],p2[2], p3[0],p3[1],p3[2]);
    seg(p3[0],p3[1],p3[2], p0[0],p0[1],p0[2]);
    // Main duct back face edges
    seg(p4[0],p4[1],p4[2], p5[0],p5[1],p5[2]);
    seg(p5[0],p5[1],p5[2], p6[0],p6[1],p6[2]);
    seg(p6[0],p6[1],p6[2], p7[0],p7[1],p7[2]);
    seg(p7[0],p7[1],p7[2], p4[0],p4[1],p4[2]);
    // Depth edges (connecting front to back)
    seg(p0[0],p0[1],p0[2], p4[0],p4[1],p4[2]);
    seg(p1[0],p1[1],p1[2], p5[0],p5[1],p5[2]);
    // Bottom perimeter (excluding the hole opening)
    seg(p2[0],p2[1],p2[2], p9[0],p9[1],p9[2]);  // right front to branch front-right
    seg(p3[0],p3[1],p3[2], p8[0],p8[1],p8[2]);  // left front to branch front-left
    seg(p6[0],p6[1],p6[2], p13[0],p13[1],p13[2]); // right back to branch back-right
    seg(p7[0],p7[1],p7[2], p12[0],p12[1],p12[2]); // left back to branch back-left
    // Branch vertical edges
    seg(p8[0],p8[1],p8[2],   p11[0],p11[1],p11[2]);
    seg(p9[0],p9[1],p9[2],   p10[0],p10[1],p10[2]);
    seg(p12[0],p12[1],p12[2], p15[0],p15[1],p15[2]);
    seg(p13[0],p13[1],p13[2], p14[0],p14[1],p14[2]);
    // Branch bottom edges
    seg(p10[0],p10[1],p10[2], p11[0],p11[1],p11[2]);
    seg(p10[0],p10[1],p10[2], p14[0],p14[1],p14[2]);
    seg(p11[0],p11[1],p11[2], p15[0],p15[1],p15[2]);
    seg(p14[0],p14[1],p14[2], p15[0],p15[1],p15[2]);
    // Branch top opening edges (where branch meets main duct)
    seg(p8[0],p8[1],p8[2],   p9[0],p9[1],p9[2]);
    seg(p9[0],p9[1],p9[2],   p13[0],p13[1],p13[2]);
    seg(p13[0],p13[1],p13[2], p12[0],p12[1],p12[2]);
    seg(p12[0],p12[1],p12[2], p8[0],p8[1],p8[2]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, sw, sl, se, sf, sl3]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* TR1a dimension labels */
const TR1aLabels: React.FC<{
  a: number; b: number; d: number; w: number; L: number;
  e: number; f: number; l3: number;
}> = ({ a, b, d, w, L, e, f: _f, l3 }) => {
  const maxDim = Math.max(a, b, d, w, L, e, l3, 1);
  const scale = 2 / maxDim;
  const sb = b * scale, sl = L * scale, sw = w * scale, sl3 = l3 * scale;
  const hb = sb / 2, hL = sl / 2;
  const brDX = -hL + e * scale;
  const brTopY = -hb;
  const brBotY = -hb - sl3;

  return (
    <>
      {/* L — main duct length */}
      <Billboard position={[0, hb + 0.2, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="bottom">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      {/* b — main duct height */}
      <Billboard position={[hL + 0.2, 0, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      {/* w — branch width */}
      <Billboard position={[brDX, brBotY - 0.18, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="top">{`w = ${Math.round(w)}`}</Text>
      </Billboard>
      {/* l3 — branch length */}
      <Billboard position={[brDX + sw / 2 + 0.18, (brTopY + brBotY) / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`l3 = ${Math.round(l3)}`}</Text>
      </Billboard>
      {/* a label */}
      <Billboard position={[0, -hb - sl3 / 2, 0]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="middle">{`a=${Math.round(a)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== TR2a Tee — rectangular main duct with round branch ===== */
// Params: a (main z-depth), b (main y-height), d (branch diameter),
//         L (main x-length), l3 (branch y-length), e (branch x-offset from left), f (branch z-offset from front)
const TR2aMesh: React.FC<{
  a: number; b: number; d: number; L: number;
  l3: number; e: number; f: number;
}> = ({ a, b, d, L, l3, e, f }) => {
  const maxDim = Math.max(a, b, d, L, l3, e, f, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = d * scale;
  const sl = L * scale, sl3 = l3 * scale;
  const se = e * scale, sf = f * scale;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hL = sl / 2, hb = sb / 2, ha = sa / 2;
    const hr = sd / 2; // branch radius

    // Branch center (matching C#)
    const brX = -hL + se;
    const brZ = -ha + sf; // circle center z
    const brTopY = -hb;
    const brBotY = -hb - sl3;

    // Main duct corners (p0-p7)
    const p0: number[] = [-hL,  hb, -ha];
    const p1: number[] = [ hL,  hb, -ha];
    const p2: number[] = [ hL, -hb, -ha];
    const p3: number[] = [-hL, -hb, -ha];
    const p4: number[] = [-hL,  hb,  ha];
    const p5: number[] = [ hL,  hb,  ha];
    const p6: number[] = [ hL, -hb,  ha];
    const p7: number[] = [-hL, -hb,  ha];

    // Rectangular collar corners at duct bottom (y = -hb)
    const rcFL: number[] = [brX - hr, -hb, brZ - hr]; // front-left
    const rcFR: number[] = [brX + hr, -hb, brZ - hr]; // front-right
    const rcBR: number[] = [brX + hr, -hb, brZ + hr]; // back-right
    const rcBL: number[] = [brX - hr, -hb, brZ + hr]; // back-left

    // Generate circle + rectangle perimeter using angular correspondence
    // This ensures the transition quads don't twist
    const segs = 24;
    const topCircle: number[][] = [];
    const botCircle: number[][] = [];
    const rectPerim: number[][] = [];

    for (let i = 0; i <= segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      const sx = Math.sin(ang);
      const cz = -Math.cos(ang);

      // Circle points
      topCircle.push([brX + sx * hr, brTopY, brZ + cz * hr]);
      botCircle.push([brX + sx * hr, brBotY, brZ + cz * hr]);

      // Rectangle perimeter: project the same direction onto the square boundary
      const absSx = Math.abs(sx), absCz = Math.abs(cz);
      const t = Math.min(
        absSx > 1e-9 ? hr / absSx : 1e9,
        absCz > 1e-9 ? hr / absCz : 1e9
      );
      rectPerim.push([brX + sx * t, brTopY, brZ + cz * t]);
    }

    const verts: number[] = [];
    const edgePts: number[] = [];

    const addTri = (a: number[], b: number[], c: number[]) => {
      verts.push(...a, ...b, ...c);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[]) => {
      addTri(q0, q1, q2);
      addTri(q0, q2, q3);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    // ── Main duct walls (3 walls, open at both x-ends) ──────────────────────
    addQuad(p3, p0, p1, p2);       // Front face (z=-ha)
    addQuad(p0, p4, p5, p1);       // Top face (y=hb)
    addQuad(p4, p7, p6, p5);       // Back face (z=ha)

    // ── Bottom face with hole (4 strips from duct corners to rectangular collar) ─
    addQuad(p2, rcFR, rcFL, p3);   // front strip
    addQuad(p2, p6, rcBR, rcFR);   // right strip
    addQuad(rcBR, p6, p7, rcBL);   // back strip
    addQuad(p3, rcFL, rcBL, p7);   // left strip

    // ── Flat transition from rectangular collar to circle (at y=-hb) ────────
    for (let i = 0; i < segs; i++) {
      addQuad(rectPerim[i], rectPerim[i + 1], topCircle[i + 1], topCircle[i]);
    }

    // ── Round branch tube ───────────────────────────────────────────────────
    for (let i = 0; i < segs; i++) {
      addQuad(topCircle[i], topCircle[i + 1], botCircle[i + 1], botCircle[i]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();

    // ── Edge wireframe ──────────────────────────────────────────────────────
    // Main duct edges
    seg(p0, p1); seg(p1, p2); seg(p2, p3); seg(p3, p0);
    seg(p4, p5); seg(p5, p6); seg(p6, p7); seg(p7, p4);
    seg(p0, p4); seg(p1, p5); seg(p2, p6); seg(p3, p7);
    // Hole edges on bottom face
    seg(rcFL, rcFR); seg(rcFR, rcBR); seg(rcBR, rcBL); seg(rcBL, rcFL);
    // Bottom strips connections
    seg(p2, rcFR); seg(p3, rcFL); seg(p6, rcBR); seg(p7, rcBL);
    // Top circle outline
    for (let i = 0; i < segs; i++) seg(topCircle[i], topCircle[i + 1]);
    // Bottom circle outline
    for (let i = 0; i < segs; i++) seg(botCircle[i], botCircle[i + 1]);
    // A few vertical branch lines
    for (let i = 0; i < segs; i += 6) seg(topCircle[i], botCircle[i]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, sl, sl3, se, sf]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* TR2a dimension labels */
const TR2aLabels: React.FC<{
  a: number; b: number; d: number; L: number;
  l3: number; e: number; f: number;
}> = ({ a, b, d, L, l3, e, f: _f }) => {
  const maxDim = Math.max(a, b, d, L, l3, e, 1);
  const scale = 2 / maxDim;
  const sb = b * scale, sl = L * scale, sl3 = l3 * scale;
  const hb = sb / 2, hL = sl / 2;
  const brDX = -hL + e * scale;
  const brTopY = -hb;
  const brBotY = -hb - sl3;

  return (
    <>
      <Billboard position={[0, hb + 0.2, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="bottom">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[hL + 0.2, 0, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[brDX, brBotY - 0.18, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="top">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[brDX + d * scale / 2 + 0.18, (brTopY + brBotY) / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`l3 = ${Math.round(l3)}`}</Text>
      </Billboard>
      <Billboard position={[0, -hb - sl3 / 2, 0]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="middle">{`a=${Math.round(a)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== TRa Symmetric Tee — main duct with rectangular branch ===== */
// C# params: a (z-depth), b (main y-height), d (total y-height incl branch),
//   h (branch x-width), L (main x-length), q (lower curve radius), r (upper curve radius),
//   i (right straight section at junction), p (vertical straight between curves)
// Profile (front face, z=-a/2):
//   p0=(0, dy)  p1=(l, dy)  — top of main duct
//   p2=(l, dy-b)  p3=(l-i, dy-b) — right side drops to b, horizontal by i
//   p4=(l-i-r, dy-b-r) — upper curve center → corner
//   p5=(l-i-r, dy-b-r-p) — vertical straight p
//   p6=(l-i-r-h, dy-b-r-p) — branch bottom left
//   p7=(l-i-r-h, dy-q-d) — diagonal to lower curve
//   p8=(l-i-r-h-q, dy-d) — lower curve end
//   p9=(0, dy-d) — bottom left
const TRaMesh: React.FC<{
  a: number; b: number; d: number; h: number; L: number;
  q: number; r: number; i: number; p: number;
}> = ({ a, b, d, h, L, q, r, i: iVal, p: pVal }) => {
  const maxDim = Math.max(a, b, d, h, L, q, r, iVal, pVal, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = d * scale;
  const sh = h * scale, sl = L * scale;
  const sq = q * scale, sr = r * scale;
  const si = iVal * scale, sp = pVal * scale;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const ha = sa / 2;
    const dx = sl / 2;
    const dy = (sb + sr + sp) / 2;

    // Build 2D profile points matching C# (x, y) at z = -ha (front face)
    // Then duplicate at z = +ha (back face)
    const profile: [number, number][] = [];

    // p0-p1: top edge
    profile.push([-dx, dy]);                              // 0
    profile.push([-dx + sl, dy]);                         // 1
    // p2-p3: right drop + horizontal
    profile.push([-dx + sl, dy - sb]);                    // 2
    profile.push([-dx + sl - si, dy - sb]);               // 3
    // Upper curve (r): from p3 sweeping 90° CCW to p4 vertical
    const rCenterX = -dx + sl - si;
    const rCenterY = dy - sb - sr;
    const arcStepsR = 6;
    for (let k = 1; k < arcStepsR; k++) {
      const ang = (k / arcStepsR) * (Math.PI / 2);
      profile.push([rCenterX - Math.sin(ang) * sr, rCenterY + Math.cos(ang) * sr]);
    }
    // p4: bottom of upper curve
    profile.push([rCenterX - sr, rCenterY]);              // ~4
    // p5: vertical straight down by p
    profile.push([rCenterX - sr, rCenterY - sp]);          // ~5
    // p6: branch bottom-left
    profile.push([rCenterX - sr - sh, rCenterY - sp]);     // ~6
    // p7: diagonal to lower curve
    profile.push([rCenterX - sr - sh, dy - sq - sd]);      // ~7
    // Lower curve (q): from p7 sweeping 90° CW to p8 horizontal
    const qCenterX = rCenterX - sr - sh - sq;
    const qCenterY = dy - sq - sd;
    // Arc from p7 (top of curve, angle=0) to p8 (left of curve, angle=90°)
    for (let k = 1; k < arcStepsR; k++) {
      const ang = (k / arcStepsR) * (Math.PI / 2);
      profile.push([qCenterX + Math.cos(ang) * sq, qCenterY + Math.sin(ang) * sq]);
    }
    // p8: end of lower curve
    profile.push([qCenterX, dy - sd]);                     // ~8
    // p9: bottom-left corner
    profile.push([-dx, dy - sd]);                          // ~9

    const N = profile.length;

    // Opening segment indices (no wall quads — these are duct openings)
    const p5idx = 3 + arcStepsR + 1;
    const p6idx = p5idx + 1;
    const openSegments = new Set([N - 1, 1, p5idx]); // left, right, branch

    // Build front and back face points
    const frontPts = profile.map(([x, y]) => [x, y, -ha]);
    const backPts = profile.map(([x, y]) => [x, y, ha]);

    const verts: number[] = [];
    const edgePts: number[] = [];

    const addTri = (a: number[], b: number[], c: number[]) => {
      verts.push(...a, ...b, ...c);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[]) => {
      addTri(q0, q1, q2);
      addTri(q0, q2, q3);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    // ── Side walls (skip opening segments) ──────────────────────────────────
    for (let k = 0; k < N; k++) {
      if (openSegments.has(k)) continue;
      const k1 = (k + 1) % N;
      addQuad(frontPts[k], frontPts[k1], backPts[k1], backPts[k]);
    }

    // ── Front face (z=-ha) — fan triangulation from centroid ────────────────
    const cx = profile.reduce((s, p) => s + p[0], 0) / N;
    const cy = profile.reduce((s, p) => s + p[1], 0) / N;
    const centroidF = [cx, cy, -ha];
    const centroidB = [cx, cy, ha];
    for (let k = 0; k < N; k++) {
      const k1 = (k + 1) % N;
      addTri(centroidF, frontPts[k], frontPts[k1]);
      addTri(centroidB, backPts[k1], backPts[k]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();

    // ── Edge wireframe ──────────────────────────────────────────────────────
    for (let k = 0; k < N; k++) {
      const k1 = (k + 1) % N;
      seg(frontPts[k], frontPts[k1]);
      seg(backPts[k], backPts[k1]);
    }
    // Depth edges at key profile vertices
    const p4idx = 3 + arcStepsR;
    const p7idx = p6idx + 1;
    const keyIdx = [0, 1, 2, 3, N - 1, N - 2, p4idx, p5idx, p6idx, p7idx];
    for (const idx of keyIdx) {
      if (idx < N) seg(frontPts[idx], backPts[idx]);
    }

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, sh, sl, sq, sr, si, sp]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* TRa dimension labels */
const TRaLabels: React.FC<{
  a: number; b: number; d: number; h: number; L: number;
  q: number; r: number; i: number; p: number;
}> = ({ a, b, d, h, L, q, r, i: iVal, p: pVal }) => {
  const maxDim = Math.max(a, b, d, h, L, q, r, iVal, pVal, 1);
  const scale = 2 / maxDim;
  const sb = b * scale, sd = d * scale, sl = L * scale;
  const sr = r * scale, sp = pVal * scale;
  const hL = sl / 2;
  const dy = (sb + sr + sp) / 2;

  return (
    <>
      <Billboard position={[0, dy + 0.15, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="bottom">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[hL + 0.15, dy - sb / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[-hL - 0.15, dy - sd / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="right" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[0, dy - sd - 0.15, 0]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="top">{`a=${Math.round(a)} h=${Math.round(h)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== QESa End Cap — rectangular blank-off plate ===== */
const QESaMesh: React.FC<{ a: number; b: number; e: number }> = ({ a, b, e }) => {
  const maxDim = Math.max(a, b, e, 1);
  const na = (a / maxDim) * 2;
  const nb = (b / maxDim) * 2;
  const ne = (e / maxDim) * 2;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = na / 2, hb = nb / 2, he = ne / 2;

    // Vertex order matches DuctMesh pattern (CCW winding viewed from outside = correct outward normals)
    const vertices = new Float32Array([
      // Top (y=+hb)
      -hw, hb, -he,   hw, hb, -he,   hw, hb,  he,
      -hw, hb, -he,   hw, hb,  he,  -hw, hb,  he,
      // Bottom (y=-hb)
      -hw,-hb,  he,   hw,-hb,  he,   hw,-hb, -he,
      -hw,-hb,  he,   hw,-hb, -he,  -hw,-hb, -he,
      // Left (x=-hw)
      -hw,-hb, -he,  -hw, hb, -he,  -hw, hb,  he,
      -hw,-hb, -he,  -hw, hb,  he,  -hw,-hb,  he,
      // Right (x=+hw)
       hw,-hb,  he,   hw, hb,  he,   hw, hb, -he,
       hw,-hb,  he,   hw, hb, -he,   hw,-hb, -he,
      // Back cap (z=+he) — sealed plate, normal toward -z (visible through open front)
       hw,-hb,  he,  -hw,-hb,  he,  -hw, hb,  he,
       hw,-hb,  he,  -hw, hb,  he,   hw, hb,  he,
    ]);
    const normals = new Float32Array([
       0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,
       0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
       1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,
       1,0,0,  1,0,0,  0,0,0,  0,0,0,  1,0,0,  1,0,0,
    ]);
 

    const uvs = new Float32Array([
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
      0,0, 1,0, 1,1, 0,0, 1,1, 0,1,
    ]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // 12 wireframe edges
    const edgePts: number[] = [];
    const seg = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) =>
      edgePts.push(ax,ay,az, bx,by,bz);
    seg(-hw,-hb,-he,  hw,-hb,-he); seg( hw,-hb,-he,  hw, hb,-he);
    seg( hw, hb,-he, -hw, hb,-he); seg(-hw, hb,-he, -hw,-hb,-he);
    seg(-hw,-hb, he,  hw,-hb, he); seg( hw,-hb, he,  hw, hb, he);
    seg( hw, hb, he, -hw, hb, he); seg(-hw, hb, he, -hw,-hb, he);
    seg(-hw,-hb,-he, -hw,-hb, he); seg( hw,-hb,-he,  hw,-hb, he);
    seg( hw, hb,-he,  hw, hb, he); seg(-hw, hb,-he, -hw, hb, he);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [na, nb, ne]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* QESa dimension labels */
const QESaLabels: React.FC<{ a: number; b: number; e: number }> = ({ a, b, e }) => {
  const maxDim = Math.max(a, b, e, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const se = e * scale;

  return (
    <>
      {/* a = horizontal width, labeled below (matching DuctMesh convention) */}
      <Billboard position={[0, -sb / 2 - 0.22, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      {/* b = vertical height, labeled to the right */}
      <Billboard position={[sa / 2 + 0.25, 0, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, se / 2 + 0.22]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== QBFa Elbow Mesh — symmetric 90° L-shaped elbow (d = b) ===== */
const QBFaElbowMesh: React.FC<{ a: number; b: number; e: number; f: number; r: number }> = ({ a, b, e, f, r }) => {
  const maxDim = Math.max(a, b + e, b + f, e, f, r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = sb; // d = b symmetric
  const se = e * scale, sf = f * scale, sr = r * scale;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2;
    const dx = (se + sb) / 2;
    const dy = (sd + sf) / 2;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    // addQuad: auto-compute normal from cross(v1-v0, v2-v0); flip winding if needed
    const addQuad = (v0: number[], v1: number[], v2: number[], v3: number[], outDir: number[]) => {
      const e1x=v1[0]-v0[0], e1y=v1[1]-v0[1], e1z=v1[2]-v0[2];
      const e2x=v2[0]-v0[0], e2y=v2[1]-v0[1], e2z=v2[2]-v0[2];
      let nx=e1y*e2z-e1z*e2y, ny=e1z*e2x-e1x*e2z, nz=e1x*e2y-e1y*e2x;
      const dot = nx*outDir[0]+ny*outDir[1]+nz*outDir[2];
      let a0=v0,a1=v1,a2=v2,a3=v3;
      if (dot < 0) { a1=v3; a2=v2; a3=v1; nx=-nx; ny=-ny; nz=-nz; }
      const len = Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
      nx/=len; ny/=len; nz/=len;
      verts.push(...a0,...a1,...a2,...a0,...a2,...a3);
      for (let i=0;i<6;i++) norms.push(nx,ny,nz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // ═══ Vertices matching C# punkty[] exactly (d = b) ═══
    const p0=[se-dx, sd+sf-dy, -hw], p1=[se+sb-dx, sd+sf-dy, -hw];
    const p2=[se+sb-dx, sd+sf-dy, hw], p3=[se-dx, sd+sf-dy, hw];
    const p4=[-dx, -dy, -hw], p5=[se+sb-dx, -dy, -hw];
    const p6=[se+sb-dx, -dy, hw], p7=[-dx, -dy, hw];
    const p8=[se-dx, sd+sr-dy, -hw], p9=[se+sb-dx, sd+sr-dy, -hw];
    const p10=[se+sb-dx, sd+sr-dy, hw], p11=[se-dx, sd+sr-dy, hw];
    const p12=[se-sr-dx, sd-dy, -hw], p13=[se-sr-dx, sd-dy, hw];
    const p14=[se-sr-dx, -dy, hw], p15=[se-sr-dx, -dy, -hw];
    const p16=[-dx, sd-dy, -hw], p17=[-dx, sd-dy, hw];

    // Outer corner interpolation (front)
    const p21=[p15[0]+(sb+sr)/3, p15[1], -hw];
    const p22=[p15[0]+2*(sb+sr)/3, p15[1], -hw];
    const p23=[p5[0], p5[1]+(sd+sr)/3, -hw];
    const p24=[p5[0], p5[1]+2*(sd+sr)/3, -hw];
    // Back mirrors
    const p31=[p21[0],p21[1],hw], p32=[p22[0],p22[1],hw];
    const p33=[p23[0],p23[1],hw], p34=[p24[0],p24[1],hw];

    // Inner arc: center = (se-sr-dx, sd+sr-dy)
    // θ from 0° (connects to p8) to 90° (connects to p12)
    const arcCX=se-sr-dx, arcCY=sd+sr-dy;
    const arcPt = (deg: number, z: number) => [
      arcCX+Math.cos(deg*Math.PI/180)*sr, arcCY-Math.sin(deg*Math.PI/180)*sr, z
    ];
    // C# front: p25=15°, p26=30°, p27=45°, p28=60°, p29=75°
    const p25F=arcPt(15,-hw), p26F=arcPt(30,-hw), p27F=arcPt(45,-hw), p28F=arcPt(60,-hw), p29F=arcPt(75,-hw);
    // C# back: p35=15°, p36=30°, p37=45°, p38=60°, p39=75°
    const p35B=arcPt(15,hw), p36B=arcPt(30,hw), p37B=arcPt(45,hw), p38B=arcPt(60,hw), p39B=arcPt(75,hw);

    // ═══ 4 wall surfaces (z-spanning, matching C# exactly) ═══
    addQuad(p4, p7, p6, p5, [0,-1,0]);              // bottom (y=-dy)
    addQuad(p5, p6, p2, p1, [1,0,0]);               // right outer (x=e+b-dx)
    addQuad(p12, p13, p17, p16, [0,1,0]);            // horizontal leg top (y=d-dy)
    addQuad(p8, p11, p3, p0, [-1,0,0]);              // vertical leg inner (x=e-dx)

    // ═══ Front face (z=-hw) — 8 quads ═══
    addQuad(p4, p15, p12, p16, [0,0,-1]);            // horizontal section
    addQuad(p8, p9, p1, p0, [0,0,-1]);               // vertical section top
    addQuad(p15, p21, p29F, p12, [0,0,-1]);           // outer corner 1
    addQuad(p21, p22, p28F, p29F, [0,0,-1]);          // outer corner 2
    addQuad(p22, p5, p27F, p28F, [0,0,-1]);           // outer corner 3
    addQuad(p5, p23, p26F, p27F, [0,0,-1]);           // outer corner 4
    addQuad(p23, p24, p25F, p26F, [0,0,-1]);          // outer corner 5
    addQuad(p24, p9, p8, p25F, [0,0,-1]);             // outer corner 6

    // ═══ Back face (z=+hw) — 8 quads ═══
    addQuad(p7, p14, p13, p17, [0,0,1]);             // horizontal section
    addQuad(p11, p10, p2, p3, [0,0,1]);              // vertical section top
    addQuad(p14, p31, p39B, p13, [0,0,1]);            // outer corner 1
    addQuad(p31, p32, p38B, p39B, [0,0,1]);           // outer corner 2
    addQuad(p32, p6, p37B, p38B, [0,0,1]);            // outer corner 3
    addQuad(p6, p33, p36B, p37B, [0,0,1]);            // outer corner 4
    addQuad(p33, p34, p35B, p36B, [0,0,1]);           // outer corner 5
    addQuad(p34, p10, p11, p35B, [0,0,1]);            // outer corner 6

    // ═══ Inner arc wall (z-spanning, 6 segments) ═══
    // C# quads: (12,29,39,13), (29,28,38,39), ..., (25,8,11,35)
    // Normal points away from arc center (into duct channel)
    const iaF=[p12,p29F,p28F,p27F,p26F,p25F,p8];
    const iaB=[p13,p39B,p38B,p37B,p36B,p35B,p11];
    for (let i=0; i<6; i++) {
      const f0=iaF[i], f1=iaF[i+1], b0=iaB[i], b1=iaB[i+1];
      const mx=(f0[0]+f1[0])/2, my=(f0[1]+f1[1])/2;
      addQuad(f0, f1, b1, b0, [mx-arcCX, my-arcCY, 0]);
    }

    // ═══ Edge wireframe ═══
    const seg = (x0:number,y0:number,z0:number,x1:number,y1:number,z1:number) =>
      edgePts.push(x0,y0,z0, x1,y1,z1);

    // Front face outline (z=-hw)
    seg(p4[0],p4[1],-hw, p15[0],p15[1],-hw);
    seg(p15[0],p15[1],-hw, p5[0],p5[1],-hw);
    seg(p5[0],p5[1],-hw, p9[0],p9[1],-hw);
    seg(p9[0],p9[1],-hw, p1[0],p1[1],-hw);
    seg(p1[0],p1[1],-hw, p0[0],p0[1],-hw);
    seg(p0[0],p0[1],-hw, p8[0],p8[1],-hw);
    seg(p12[0],p12[1],-hw, p16[0],p16[1],-hw);
    seg(p16[0],p16[1],-hw, p4[0],p4[1],-hw);
    // Front inner arc
    const arcDegs=[0,15,30,45,60,75,90];
    for (let i=0;i<arcDegs.length-1;i++) {
      const a0=arcDegs[i]*Math.PI/180, a1=arcDegs[i+1]*Math.PI/180;
      seg(arcCX+Math.cos(a0)*sr,arcCY-Math.sin(a0)*sr,-hw,
          arcCX+Math.cos(a1)*sr,arcCY-Math.sin(a1)*sr,-hw);
    }

    // Back face outline (z=+hw)
    seg(p7[0],p7[1],hw, p14[0],p14[1],hw);
    seg(p14[0],p14[1],hw, p6[0],p6[1],hw);
    seg(p6[0],p6[1],hw, p10[0],p10[1],hw);
    seg(p10[0],p10[1],hw, p2[0],p2[1],hw);
    seg(p2[0],p2[1],hw, p3[0],p3[1],hw);
    seg(p3[0],p3[1],hw, p11[0],p11[1],hw);
    seg(p13[0],p13[1],hw, p17[0],p17[1],hw);
    seg(p17[0],p17[1],hw, p7[0],p7[1],hw);
    // Back inner arc
    for (let i=0;i<arcDegs.length-1;i++) {
      const a0=arcDegs[i]*Math.PI/180, a1=arcDegs[i+1]*Math.PI/180;
      seg(arcCX+Math.cos(a0)*sr,arcCY-Math.sin(a0)*sr,hw,
          arcCX+Math.cos(a1)*sr,arcCY-Math.sin(a1)*sr,hw);
    }

    // Z-spanning edges (connecting front to back at key vertices)
    seg(p4[0],p4[1],-hw, p7[0],p7[1],hw);
    seg(p5[0],p5[1],-hw, p6[0],p6[1],hw);
    seg(p1[0],p1[1],-hw, p2[0],p2[1],hw);
    seg(p0[0],p0[1],-hw, p3[0],p3[1],hw);
    seg(p9[0],p9[1],-hw, p10[0],p10[1],hw);
    seg(p8[0],p8[1],-hw, p11[0],p11[1],hw);
    seg(p12[0],p12[1],-hw, p13[0],p13[1],hw);
    seg(p15[0],p15[1],-hw, p14[0],p14[1],hw);
    seg(p16[0],p16[1],-hw, p17[0],p17[1],hw);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, se, sf, sr]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* QBFa dimension labels */
const QBFaLabels: React.FC<{ a: number; b: number; e: number; f: number; r: number }> = ({ a, b, e, f, r }) => {
  const maxDim = Math.max(a, b + e, b + f, e, f, r, 1);
  const scale = 2 / maxDim;
  const sb = b * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const dx = (se + sb) / 2;
  const dy = (sb + sf) / 2;

  return (
    <>
      {/* b — section depth (vertical) */}
      <Billboard position={[se + sb / 2 - dx, -dy - 0.15, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      {/* e — vertical straight leg */}
      <Billboard position={[se + sb - dx + 0.2, (sb + sr - dy + sb + sf - dy) / 2, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      {/* f — horizontal straight leg */}
      <Billboard position={[(-dx + se - sr - dx) / 2, sb - dy - 0.15, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="top">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      {/* r — inner bend radius */}
      <Billboard position={[se - sr - dx - sr * 0.3, sb + sr - dy - sr * 0.3, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
      </Billboard>
      {/* a — duct depth */}
      <Billboard position={[se + sb - dx + 0.2, -dy - 0.15, 0]}>
        <Text fontSize={0.11} color="#888888" anchorX="left" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
    </>
  );
};

/* Reduction Elbow dimension labels */
const ReductionElbowLabels: React.FC<{
  a: number; b: number; d: number; e: number; f: number; r: number
}> = ({ a, b, d, e, f, r }) => {
  const maxDim = Math.max(a, b + e, d + f, r, 1);
  const scale = 2 / maxDim;
  const sb = b * scale;
  const sd = d * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const dx = (se + sb) / 2;
  const dy = (sd + sf) / 2;

  return (
    <>
      {/* b label — vertical section width */}
      <Billboard position={[se + sb / 2 - dx, -dy - 0.15, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      {/* d label — horizontal section depth */}
      <Billboard position={[-dx - 0.2, sd / 2 - dy, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="right" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      {/* e label — vertical leg */}
      <Billboard position={[se + sb - dx + 0.2, (sd + sf - dy + sd + sr - dy) / 2, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      {/* f label — horizontal leg */}
      <Billboard position={[(-dx + se - sr - dx) / 2, sd - dy - 0.15, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="top">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      {/* r label */}
      <Billboard position={[se - dx - sr * 0.3, sd + sr - dy - sr * 0.3, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== Reducer Mesh — symmetric reducer (QPR6a) ===== */
const ReducerMesh: React.FC<{ a: number; b: number; c: number; d: number; l: number; h: number; m: number }> = ({ a, b, c, d, l, h, m }) => {
  const maxDim = Math.max(a, b, c, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nc = c * s, nd = d * s, nl = l * s, nh = h * s, nm = m * s;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    // 16 vertices defining 4 cross-section planes along z-axis
    const ha = na / 2, hb = nb / 2, hc = nc / 2, hd = nd / 2;
    const z0 = -nl / 2;          // front face
    const z1 = -nl / 2 + nh;     // end of front straight
    const z2 = nl / 2 - nm;      // start of rear straight
    const z3 = nl / 2;           // rear face

    // Vertices: [x, y, z] for each of the 4 planes
    // Plane 0 (z0): front face a×b
    const p0 = [-ha, hb, z0], p1 = [-ha, -hb, z0], p2 = [ha, -hb, z0], p3 = [ha, hb, z0];
    // Plane 1 (z1): end of front straight (same a×b)
    const p4 = [-ha, hb, z1], p5 = [-ha, -hb, z1], p6 = [ha, -hb, z1], p7 = [ha, hb, z1];
    // Plane 2 (z2): start of rear straight (c×d)
    const p8 = [-hc, hd, z2], p9 = [-hc, -hd, z2], p10 = [hc, -hd, z2], p11 = [hc, hd, z2];
    // Plane 3 (z3): rear face (same c×d)
    const p12 = [-hc, hd, z3], p13 = [-hc, -hd, z3], p14 = [hc, -hd, z3], p15 = [hc, hd, z3];

    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];

    // Helper: push quad as 2 triangles with consistent CCW winding
    const quad = (a: number[], b: number[], c: number[], d: number[], nx: number, ny: number, nz: number) => {
      verts.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) norms.push(nx, ny, nz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Section 1: Front straight (z0→z1), a×b constant
    // Left wall (x = -ha, normal -x)
    quad(p0, p4, p5, p1, -1, 0, 0);
    // Bottom wall (y = -hb, normal -y)
    quad(p1, p5, p6, p2, 0, -1, 0);
    // Right wall (x = +ha, normal +x)
    quad(p2, p6, p7, p3, 1, 0, 0);
    // Top wall (y = +hb, normal +y)
    quad(p3, p7, p4, p0, 0, 1, 0);

    // Section 2: Taper (z1→z2), a×b → c×d
    // Compute approximate normals for trapezoidal walls
    const taperLen = z2 - z1;
    // Left wall: from x=-ha to x=-hc
    const lNx = -taperLen, lNz = -(hc - ha);
    const lNLen = Math.sqrt(lNx * lNx + lNz * lNz) || 1;
    quad(p4, p8, p9, p5, lNx / lNLen, 0, lNz / lNLen);
    // Bottom wall: from y=-hb to y=-hd
    const bNy = -taperLen, bNz = -(hd - hb);
    const bNLen = Math.sqrt(bNy * bNy + bNz * bNz) || 1;
    quad(p5, p9, p10, p6, 0, bNy / bNLen, bNz / bNLen);
    // Right wall: from x=+ha to x=+hc
    quad(p6, p10, p11, p7, -lNx / lNLen, 0, -lNz / lNLen);
    // Top wall: from y=+hb to y=+hd
    quad(p7, p11, p8, p4, 0, -bNy / bNLen, -bNz / bNLen);

    // Section 3: Rear straight (z2→z3), c×d constant
    // Left wall (x = -hc)
    quad(p8, p12, p13, p9, -1, 0, 0);
    // Bottom wall (y = -hd)
    quad(p9, p13, p14, p10, 0, -1, 0);
    // Right wall (x = +hc)
    quad(p10, p14, p15, p11, 1, 0, 0);
    // Top wall (y = +hd)
    quad(p11, p15, p12, p8, 0, 1, 0);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    // Edge lines: 4 cross-section rects + longitudinal connections
    const edgePts: number[] = [];
    const planes = [
      [p0, p1, p2, p3],
      [p4, p5, p6, p7],
      [p8, p9, p10, p11],
      [p12, p13, p14, p15],
    ];
    // Cross-section rectangles
    for (const pl of planes) {
      for (let i = 0; i < 4; i++) {
        edgePts.push(...pl[i], ...pl[(i + 1) % 4]);
      }
    }
    // Longitudinal edges between adjacent planes
    const adjPairs = [[0, 1], [1, 2], [2, 3]];
    for (const [pi, pj] of adjPairs) {
      for (let i = 0; i < 4; i++) {
        edgePts.push(...planes[pi][i], ...planes[pj][i]);
      }
    }

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [na, nb, nc, nd, nl, nh, nm]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Reducer dimension labels */
const ReducerDimensionLabels: React.FC<{ a: number; b: number; c: number; d: number; l: number }> = ({ a, b, c, d, l }) => {
  const maxDim = Math.max(a, b, c, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nc = c * s, nd = d * s, nl = l * s;

  return (
    <>
      {/* a label — front bottom edge */}
      <Billboard position={[0, -nb / 2 - 0.22, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      {/* b label — front right edge */}
      <Billboard position={[na / 2 + 0.25, 0, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      {/* c label — rear bottom edge */}
      <Billboard position={[0, -nd / 2 - 0.22, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`c = ${Math.round(c)}`}</Text>
      </Billboard>
      {/* d label — rear right edge */}
      <Billboard position={[nc / 2 + 0.25, 0, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      {/* L label — along the side */}
      <Billboard position={[na / 2 + 0.25, -nb / 2 - 0.1, 0]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="top">{`L = ${Math.round(l)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== Asymmetric Reducer Mesh — QPR2a ===== */
const AsymReducerMesh: React.FC<{ a: number; b: number; c: number; d: number; l: number; h: number; m: number; e: number; f: number }> = ({ a, b, c, d, l, h, m, e, f }) => {
  const maxDim = Math.max(a, b, c, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nc = c * s, nd = d * s, nl = l * s, nh = h * s, nm = m * s;
  const ne = e * s, nf = f * s;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const ha = na / 2, hb = nb / 2;
    const z0 = -nl / 2;
    const z1 = -nl / 2 + nh;
    const z2 = nl / 2 - nm;
    const z3 = nl / 2;

    // Front rect a×b centered
    const p0 = [-ha, hb, z0], p1 = [-ha, -hb, z0], p2 = [ha, -hb, z0], p3 = [ha, hb, z0];
    const p4 = [-ha, hb, z1], p5 = [-ha, -hb, z1], p6 = [ha, -hb, z1], p7 = [ha, hb, z1];
    // Rear rect c×d offset: x from -ha+nf to -ha+nf+nc, y from hb-ne down to hb-ne-nd
    const rx0 = -ha + nf, rx1 = -ha + nf + nc;
    const ry0 = hb - ne, ry1 = hb - ne - nd;
    const p8  = [rx0, ry0, z2], p9  = [rx0, ry1, z2], p10 = [rx1, ry1, z2], p11 = [rx1, ry0, z2];
    const p12 = [rx0, ry0, z3], p13 = [rx0, ry1, z3], p14 = [rx1, ry1, z3], p15 = [rx1, ry0, z3];

    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];

    const quad = (a: number[], b: number[], c: number[], d: number[], nx: number, ny: number, nz: number) => {
      verts.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) norms.push(nx, ny, nz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Section 1: Front straight (z0→z1)
    quad(p0, p4, p5, p1, -1, 0, 0);
    quad(p1, p5, p6, p2, 0, -1, 0);
    quad(p2, p6, p7, p3, 1, 0, 0);
    quad(p3, p7, p4, p0, 0, 1, 0);

    // Section 2: Taper (z1→z2) — asymmetric transition
    const taperLen = z2 - z1;
    // Left wall
    const lDx = rx0 - (-ha);
    const lNx = -taperLen, lNz = -lDx;
    const lNLen = Math.sqrt(lNx * lNx + lNz * lNz) || 1;
    quad(p4, p8, p9, p5, lNx / lNLen, 0, lNz / lNLen);
    // Bottom wall
    const bDy = ry1 - (-hb);
    const bNy = -taperLen, bNz = -bDy;
    const bNLen = Math.sqrt(bNy * bNy + bNz * bNz) || 1;
    quad(p5, p9, p10, p6, 0, bNy / bNLen, bNz / bNLen);
    // Right wall
    const rDx = rx1 - ha;
    const rNx = taperLen, rNz = rDx;
    const rNLen = Math.sqrt(rNx * rNx + rNz * rNz) || 1;
    quad(p6, p10, p11, p7, rNx / rNLen, 0, rNz / rNLen);
    // Top wall
    const tDy = ry0 - hb;
    const tNy = taperLen, tNz = tDy;
    const tNLen = Math.sqrt(tNy * tNy + tNz * tNz) || 1;
    quad(p7, p11, p8, p4, 0, tNy / tNLen, tNz / tNLen);

    // Section 3: Rear straight (z2→z3)
    quad(p8, p12, p13, p9, -1, 0, 0);
    quad(p9, p13, p14, p10, 0, -1, 0);
    quad(p10, p14, p15, p11, 1, 0, 0);
    quad(p11, p15, p12, p8, 0, 1, 0);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));

    const edgePts: number[] = [];
    const planes = [
      [p0, p1, p2, p3], [p4, p5, p6, p7],
      [p8, p9, p10, p11], [p12, p13, p14, p15],
    ];
    for (const pl of planes) {
      for (let i = 0; i < 4; i++) edgePts.push(...pl[i], ...pl[(i + 1) % 4]);
    }
    for (const [pi, pj] of [[0,1],[1,2],[2,3]] as [number,number][]) {
      for (let i = 0; i < 4; i++) edgePts.push(...planes[pi][i], ...planes[pj][i]);
    }

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [na, nb, nc, nd, nl, nh, nm, ne, nf]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Asymmetric Reducer dimension labels */
const AsymReducerLabels: React.FC<{ a: number; b: number; c: number; d: number; l: number; e: number; f: number }> = ({ a, b, c, d, l, e, f }) => {
  const maxDim = Math.max(a, b, c, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nc = c * s, nd = d * s, nl = l * s;
  const ne = e * s, nf = f * s;
  const ha = na / 2, hb = nb / 2;
  const rx0 = -ha + nf, rx1 = -ha + nf + nc;
  const ry0 = hb - ne, ry1 = hb - ne - nd;

  return (
    <>
      <Billboard position={[0, -hb - 0.22, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      <Billboard position={[ha + 0.25, 0, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[(rx0 + rx1) / 2, ry1 - 0.22, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`c = ${Math.round(c)}`}</Text>
      </Billboard>
      <Billboard position={[rx1 + 0.25, (ry0 + ry1) / 2, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[ha + 0.25, -hb - 0.1, 0]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="top">{`L = ${Math.round(l)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== Square-to-Round Mesh — PR1a symmetric square-to-circle reducer ===== */
const SquareToRoundMesh: React.FC<{ a: number; b: number; d: number; l: number; h: number; m: number }> = ({ a, b, d, l, h, m }) => {
  const maxDim = Math.max(a, b, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nd = d * s, nl = l * s, nh = h * s, nm = m * s;
  const nr = nd / 2;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = na / 2, hh = nb / 2;
    const z0 = -nl / 2;        // front face
    const z1 = -nl / 2 + nh;   // end of front straight
    const z2 = nl / 2 - nm;    // start of rear cylinder
    const z3 = nl / 2;         // rear face
    const segments = 32;

    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    // Helper: add quad (two triangles, CCW winding)
    const quad = (a: number[], b: number[], c: number[], d: number[], nx: number, ny: number, nz: number) => {
      verts.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) norms.push(nx, ny, nz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Front rectangle vertices
    const fp0 = [-hw, hh, z0], fp1 = [-hw, -hh, z0], fp2 = [hw, -hh, z0], fp3 = [hw, hh, z0];
    const fp4 = [-hw, hh, z1], fp5 = [-hw, -hh, z1], fp6 = [hw, -hh, z1], fp7 = [hw, hh, z1];

    // Section 1: Front straight (4 walls, z0→z1)
    quad(fp0, fp4, fp5, fp1, -1, 0, 0); // left
    quad(fp1, fp5, fp6, fp2, 0, -1, 0); // bottom
    quad(fp2, fp6, fp7, fp3, 1, 0, 0);  // right
    quad(fp3, fp7, fp4, fp0, 0, 1, 0);  // top

    // Front rect edges
    const frontPlanes = [[fp0, fp1, fp2, fp3], [fp4, fp5, fp6, fp7]];
    for (const pl of frontPlanes) {
      for (let i = 0; i < 4; i++) edgePts.push(...pl[i], ...pl[(i + 1) % 4]);
    }
    for (let i = 0; i < 4; i++) edgePts.push(...frontPlanes[0][i], ...frontPlanes[1][i]);

    // Rectangle point at angle theta (ray from center intersecting rectangle)
    const rectPoint = (theta: number): [number, number] => {
      const ct = Math.cos(theta), st = Math.sin(theta);
      const tx = ct !== 0 ? hw / Math.abs(ct) : 1e9;
      const ty = st !== 0 ? hh / Math.abs(st) : 1e9;
      const t = Math.min(tx, ty);
      return [t * ct, t * st];
    };

    // Section 2: Transition (rect a×b → circle d), z1→z2
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;

      const [rx0, ry0] = rectPoint(theta0);
      const [rx1, ry1] = rectPoint(theta1);
      const cx0 = nr * Math.cos(theta0), cy0 = nr * Math.sin(theta0);
      const cx1 = nr * Math.cos(theta1), cy1 = nr * Math.sin(theta1);

      const p0t = [rx0, ry0, z1];
      const p1t = [rx1, ry1, z1];
      const p2t = [cx1, cy1, z2];
      const p3t = [cx0, cy0, z2];

      // Compute face normal via cross product
      const e1 = [p1t[0] - p0t[0], p1t[1] - p0t[1], p1t[2] - p0t[2]];
      const e2 = [p3t[0] - p0t[0], p3t[1] - p0t[1], p3t[2] - p0t[2]];
      let fnx = e1[1] * e2[2] - e1[2] * e2[1];
      let fny = e1[2] * e2[0] - e1[0] * e2[2];
      let fnz = e1[0] * e2[1] - e1[1] * e2[0];
      const flen = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1;
      fnx /= flen; fny /= flen; fnz /= flen;

      verts.push(...p0t, ...p3t, ...p2t, ...p0t, ...p2t, ...p1t);
      for (let j = 0; j < 6; j++) norms.push(fnx, fny, fnz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Transition edges
      if (i === 0 || i === segments / 4 || i === segments / 2 || i === (3 * segments) / 4) {
        edgePts.push(rx0, ry0, z1, cx0, cy0, z2);
      }
    }

    // Section 3: Rear cylinder (z2→z3)
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;
      const cx0 = nr * Math.cos(theta0), cy0 = nr * Math.sin(theta0);
      const cx1 = nr * Math.cos(theta1), cy1 = nr * Math.sin(theta1);
      // Outward normal
      const mx = (Math.cos(theta0) + Math.cos(theta1)) / 2;
      const my = (Math.sin(theta0) + Math.sin(theta1)) / 2;
      const mlen = Math.sqrt(mx * mx + my * my) || 1;

      quad([cx0, cy0, z2], [cx0, cy0, z3], [cx1, cy1, z3], [cx1, cy1, z2], mx / mlen, my / mlen, 0);
    }

    // Circle edges at z2 and z3
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;
      const cx0 = nr * Math.cos(theta0), cy0 = nr * Math.sin(theta0);
      const cx1 = nr * Math.cos(theta1), cy1 = nr * Math.sin(theta1);
      edgePts.push(cx0, cy0, z2, cx1, cy1, z2);
      edgePts.push(cx0, cy0, z3, cx1, cy1, z3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [na, nb, nr, nl, nh, nm]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Square-to-round dimension labels */
const SquareToRoundLabels: React.FC<{ a: number; b: number; d: number; l: number }> = ({ a, b, d, l }) => {
  const maxDim = Math.max(a, b, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nd = d * s, nl = l * s;

  return (
    <>
      <Billboard position={[0, -nb / 2 - 0.22, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      <Billboard position={[na / 2 + 0.25, 0, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, -nd / 2 - 0.22, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[na / 2 + 0.25, -nb / 2 - 0.1, 0]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="top">{`L = ${Math.round(l)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== Asymmetric Square-to-Round Mesh — PR7a ===== */
const AsymSquareToRoundMesh: React.FC<{ a: number; b: number; d: number; l: number; e: number; f: number; h: number; m: number }> = ({ a, b, d, l, e, f, h, m }) => {
  const maxDim = Math.max(a, b, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nd = d * s, nl = l * s, nh = h * s, nm = m * s;
  const ne = e * s, nf = f * s;
  const nr = nd / 2;
  // Circle center offset from rectangle center: rect center is at (0,0)
  // e = distance from top edge to circle edge, f = distance from left edge to circle edge
  // Circle center: x = -na/2 + nf + nr, y = nb/2 - ne - nr
  const ccx = -na / 2 + nf + nr;
  const ccy = nb / 2 - ne - nr;

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8a9bae', roughness: 0.18, metalness: 0.92, reflectivity: 1.0,
    clearcoat: 0.5, clearcoatRoughness: 0.08, side: THREE.DoubleSide, envMapIntensity: 1.0,
  }), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = na / 2, hh = nb / 2;
    const z0 = -nl / 2;
    const z1 = -nl / 2 + nh;
    const z2 = nl / 2 - nm;
    const z3 = nl / 2;
    const segments = 32;

    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const edgePts: number[] = [];

    const quad = (a: number[], b: number[], c: number[], d: number[], nx: number, ny: number, nz: number) => {
      verts.push(...a, ...b, ...c, ...a, ...c, ...d);
      for (let i = 0; i < 6; i++) norms.push(nx, ny, nz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    };

    // Front straight section (z0→z1)
    const fp0 = [-hw, hh, z0], fp1 = [-hw, -hh, z0], fp2 = [hw, -hh, z0], fp3 = [hw, hh, z0];
    const fp4 = [-hw, hh, z1], fp5 = [-hw, -hh, z1], fp6 = [hw, -hh, z1], fp7 = [hw, hh, z1];
    quad(fp0, fp4, fp5, fp1, -1, 0, 0);
    quad(fp1, fp5, fp6, fp2, 0, -1, 0);
    quad(fp2, fp6, fp7, fp3, 1, 0, 0);
    quad(fp3, fp7, fp4, fp0, 0, 1, 0);

    const frontPlanes = [[fp0, fp1, fp2, fp3], [fp4, fp5, fp6, fp7]];
    for (const pl of frontPlanes) {
      for (let i = 0; i < 4; i++) edgePts.push(...pl[i], ...pl[(i + 1) % 4]);
    }
    for (let i = 0; i < 4; i++) edgePts.push(...frontPlanes[0][i], ...frontPlanes[1][i]);

    // Rectangle point at angle theta (ray from center intersecting rectangle)
    const rectPoint = (theta: number): [number, number] => {
      const ct = Math.cos(theta), st = Math.sin(theta);
      const tx = ct !== 0 ? hw / Math.abs(ct) : 1e9;
      const ty = st !== 0 ? hh / Math.abs(st) : 1e9;
      const t = Math.min(tx, ty);
      return [t * ct, t * st];
    };

    // Transition (rect → offset circle), z1→z2
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;

      const [rx0, ry0] = rectPoint(theta0);
      const [rx1, ry1] = rectPoint(theta1);
      const cx0 = ccx + nr * Math.cos(theta0), cy0 = ccy + nr * Math.sin(theta0);
      const cx1 = ccx + nr * Math.cos(theta1), cy1 = ccy + nr * Math.sin(theta1);

      const p0t = [rx0, ry0, z1];
      const p1t = [rx1, ry1, z1];
      const p2t = [cx1, cy1, z2];
      const p3t = [cx0, cy0, z2];

      const e1 = [p1t[0] - p0t[0], p1t[1] - p0t[1], p1t[2] - p0t[2]];
      const e2 = [p3t[0] - p0t[0], p3t[1] - p0t[1], p3t[2] - p0t[2]];
      let fnx = e1[1] * e2[2] - e1[2] * e2[1];
      let fny = e1[2] * e2[0] - e1[0] * e2[2];
      let fnz = e1[0] * e2[1] - e1[1] * e2[0];
      const flen = Math.sqrt(fnx * fnx + fny * fny + fnz * fnz) || 1;
      fnx /= flen; fny /= flen; fnz /= flen;

      verts.push(...p0t, ...p3t, ...p2t, ...p0t, ...p2t, ...p1t);
      for (let j = 0; j < 6; j++) norms.push(fnx, fny, fnz);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      if (i === 0 || i === segments / 4 || i === segments / 2 || i === (3 * segments) / 4) {
        edgePts.push(rx0, ry0, z1, cx0, cy0, z2);
      }
    }

    // Rear cylinder (z2→z3), centered at (ccx, ccy)
    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;
      const cx0 = ccx + nr * Math.cos(theta0), cy0 = ccy + nr * Math.sin(theta0);
      const cx1 = ccx + nr * Math.cos(theta1), cy1 = ccy + nr * Math.sin(theta1);
      const mx = (Math.cos(theta0) + Math.cos(theta1)) / 2;
      const my = (Math.sin(theta0) + Math.sin(theta1)) / 2;
      const mlen = Math.sqrt(mx * mx + my * my) || 1;
      quad([cx0, cy0, z2], [cx0, cy0, z3], [cx1, cy1, z3], [cx1, cy1, z2], mx / mlen, my / mlen, 0);
    }

    for (let i = 0; i < segments; i++) {
      const theta0 = (i / segments) * 2 * Math.PI;
      const theta1 = ((i + 1) / segments) * 2 * Math.PI;
      const cx0 = ccx + nr * Math.cos(theta0), cy0 = ccy + nr * Math.sin(theta0);
      const cx1 = ccx + nr * Math.cos(theta1), cy1 = ccy + nr * Math.sin(theta1);
      edgePts.push(cx0, cy0, z2, cx1, cy1, z2);
      edgePts.push(cx0, cy0, z3, cx1, cy1, z3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [na, nb, nr, nl, nh, nm, ccx, ccy]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Asymmetric square-to-round dimension labels */
const AsymSquareToRoundLabels: React.FC<{ a: number; b: number; d: number; l: number }> = ({ a, b, d, l }) => {
  const maxDim = Math.max(a, b, d, l, 1);
  const s = 2 / maxDim;
  const na = a * s, nb = b * s, nd = d * s, nl = l * s;
  return (
    <>
      <Billboard position={[0, -nb / 2 - 0.22, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      <Billboard position={[na / 2 + 0.25, 0, -nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, -nd / 2 - 0.22, nl / 2]}>
        <Text fontSize={0.14} color="#004290" anchorX="center" anchorY="top">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[na / 2 + 0.25, -nb / 2 - 0.1, 0]}>
        <Text fontSize={0.14} color="#004290" anchorX="left" anchorY="top">{`L = ${Math.round(l)}`}</Text>
      </Billboard>
    </>
  );
};

/* Slowly auto-rotate when enabled */
const AutoRotate: React.FC<{ groupRef: React.RefObject<THREE.Group | null>; enabled: boolean }> = ({ groupRef, enabled }) => {
  useFrame((_, delta) => {
    if (!groupRef.current || !enabled) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  return null;
};

/* Force continuous rendering — prevents canvas from going blank */
const KeepAlive = () => {
  useFrame(() => {
    // no-op: keeps the R3F render loop active
  });
  return null;
};

const SUPPORTED_3D = ['QDa', 'QBa', 'QBNa', 'QPR6a', 'QPR2a', 'PR1a', 'PR7a', 'QBRa', 'QBR1a', 'QBFRa', 'QBFa', 'QESa', 'TR1a', 'TR2a', 'TRa'];

const ShapeDiagram3D: React.FC<ShapeDiagram3DProps> = ({ symbol, values }) => {
  const groupRef = useRef<THREE.Group>(null);
  const modalGroupRef = useRef<THREE.Group>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expanded, setExpanded] = useState(false);

  if (!SUPPORTED_3D.includes(symbol)) {
    return (
      <div className="shape-3d-container">
        <div className="shape-3d-header">
          <span className="shape-3d-title">Widok 3D</span>
        </div>
        <div className="shape-3d-placeholder">Widok 3D niedostępny dla tego kształtu</div>
      </div>
    );
  }

  // QDa parameters
  const a = values[0] || 200;
  const b = values[1] || 200;

  // Render scene objects based on shape
  const renderShapeMesh = () => {
        // TR1a — rectangular branch tee
        if (symbol === 'TR1a') {
          const d   = values[2] || 200;
          const w   = values[3] || 200;
          const tL  = values[4] || 500;
          const te  = values[5] || 150;
          const tf  = values[6] || 0;
          const tl3 = values[7] || 200;
          return (
            <>
              <TR1aMesh a={a} b={b} d={d} w={w} L={tL} e={te} f={tf} l3={tl3} />
              {showDimensions && <TR1aLabels a={a} b={b} d={d} w={w} L={tL} e={te} f={tf} l3={tl3} />}
            </>
          );
        }
        // TR2a — tee with round branch
        if (symbol === 'TR2a') {
          const d   = values[2] || 200;
          const tL  = values[3] || 500;
          const tl3 = values[4] || 200;
          const te  = values[5] || 150;
          const tf  = values[6] || 0;
          return (
            <>
              <TR2aMesh a={a} b={b} d={d} L={tL} l3={tl3} e={te} f={tf} />
              {showDimensions && <TR2aLabels a={a} b={b} d={d} L={tL} l3={tl3} e={te} f={tf} />}
            </>
          );
        }
        // TRa — symmetric tee
        if (symbol === 'TRa') {
          const d   = values[2] || 200;
          const h   = values[3] || 150;
          const tL  = values[4] || 500;
          const q   = values[5] || 50;
          const r   = values[6] || 50;
          const iV  = values[7] || 50;
          const pV  = values[8] || 100;
          return (
            <>
              <TRaMesh a={a} b={b} d={d} h={h} L={tL} q={q} r={r} i={iV} p={pV} />
              {showDimensions && <TRaLabels a={a} b={b} d={d} h={h} L={tL} q={q} r={r} i={iV} p={pV} />}
            </>
          );
        }
        // QESa — rectangular end cap
        if (symbol === 'QESa') {
          const e = values[2] || 30;
          return (
            <>
              <QESaMesh a={a} b={b} e={e} />
              {showDimensions && <QESaLabels a={a} b={b} e={e} />}
            </>
          );
        }
        // QBFa — symmetric 90° L-shaped elbow (d = b)
        if (symbol === 'QBFa') {
          const e = values[2] || 150;
          const f = values[3] || 150;
          const r = values[4] || 100;
          return (
            <>
              <QBFaElbowMesh a={a} b={b} e={e} f={f} r={r} />
              {showDimensions && <QBFaLabels a={a} b={b} e={e} f={f} r={r} />}
            </>
          );
        }
    if (symbol === 'QDa') {
      const l = values[2] || 500;
      const maxDim = Math.max(a, b, l, 1);
      return (
        <>
          <DuctMesh a={a} b={b} l={l} />
          <Flange a={a} b={b} l={l} maxDim={maxDim} side="front" />
          <Flange a={a} b={b} l={l} maxDim={maxDim} side="back" />
          {showDimensions && <DimensionLabels a={a} b={b} l={l} />}
        </>
      );
    }
    // QPR6a — symmetric reducer
    if (symbol === 'QPR6a') {
      const rc = values[2] || 150;
      const rd = values[3] || 150;
      const rl = values[4] || 500;
      const rh = values[5] || 80;
      const rm = values[6] || 80;
      return (
        <>
          <ReducerMesh a={a} b={b} c={rc} d={rd} l={rl} h={rh} m={rm} />
          {showDimensions && <ReducerDimensionLabels a={a} b={b} c={rc} d={rd} l={rl} />}
        </>
      );
    }
    // QPR2a — asymmetric reducer
    if (symbol === 'QPR2a') {
      const rc = values[2] || 150;
      const rd = values[3] || 150;
      const rl = values[4] || 500;
      const rh = values[5] || 80;
      const rm = values[6] || 80;
      const re = values[7] || 20;
      const rf = values[8] || 20;
      return (
        <>
          <AsymReducerMesh a={a} b={b} c={rc} d={rd} l={rl} h={rh} m={rm} e={re} f={rf} />
          {showDimensions && <AsymReducerLabels a={a} b={b} c={rc} d={rd} l={rl} e={re} f={rf} />}
        </>
      );
    }
    // PR1a — square-to-round symmetric reducer
    if (symbol === 'PR1a') {
      const pd = values[2] || 150;
      const pl = values[3] || 500;
      const ph = values[4] || 80;
      const pm = values[5] || 80;
      return (
        <>
          <SquareToRoundMesh a={a} b={b} d={pd} l={pl} h={ph} m={pm} />
          {showDimensions && <SquareToRoundLabels a={a} b={b} d={pd} l={pl} />}
        </>
      );
    }
    // PR7a — asymmetric square-to-round reducer
    if (symbol === 'PR7a') {
      const pd = values[2] || 150;
      const pl = values[3] || 500;
      const pe = values[4] || 30;
      const pf = values[5] || 30;
      const ph = values[6] || 80;
      const pm = values[7] || 80;
      return (
        <>
          <AsymSquareToRoundMesh a={a} b={b} d={pd} l={pl} e={pe} f={pf} h={ph} m={pm} />
          {showDimensions && <AsymSquareToRoundLabels a={a} b={b} d={pd} l={pl} />}
        </>
      );
    }
    // QBRa — reduction bend
    if (symbol === 'QBRa') {
      const rd = values[1] || 150;
      const rb = values[2] || 200;
      const re = values[3] || 150;
      const rf = values[4] || 150;
      const rr = values[5] || 200;
      const rAlfa = values[6] || 90;
      // Center the geometry
      const bMaxDim = Math.max(a, rb, rd, re, rf, rr, rb + rr, 1);
      const bScale = 2 / bMaxDim;
      const bsb = rb * bScale, bsd = rd * bScale, bse = re * bScale, bsf = rf * bScale, bsr = rr * bScale;
      const bAlfaRad = (rAlfa * Math.PI) / 180;
      const eDirX = -Math.sin(bAlfaRad);
      const eDirY = Math.cos(bAlfaRad);
      const eEndIx = bsr * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndIy = bsr * Math.sin(bAlfaRad) + eDirY * bse;
      const eEndOx = (bsr + bsd) * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndOy = (bsr + bsd) * Math.sin(bAlfaRad) + eDirY * bse;
      const minX = Math.min(0, eEndIx, eEndOx);
      const maxX = Math.max(bsr + bsb, eEndIx, eEndOx);
      const minY = Math.min(-bsf, eEndIy, eEndOy);
      const maxY = Math.max(bsr + bsb, eEndIy, eEndOy);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return (
        <group position={[-cx, -cy, 0]}>
          <ReductionBendMesh a={a} b={rb} d={rd} e={re} f={rf} r={rr} alfa={rAlfa} />
          {showDimensions && <ReductionBendLabels a={a} b={rb} d={rd} e={re} f={rf} r={rr} alfa={rAlfa} />}
        </group>
      );
    }
    // QBR1a — diffuser bend
    if (symbol === 'QBR1a') {
      const rdVal = values[1] || 200;  // inlet radial depth (label 'd')
      const rc = values[2] || 250;     // outlet z-width
      const rbVal = values[3] || 150;  // outlet radial depth (label 'b')
      const re = values[4] || 150;
      const rf = values[5] || 150;
      const rr = values[6] || 200;
      const rg = values[7] || 0;
      const rAlfa = values[8] || 90;
      // Center the geometry
      const bMaxDim = Math.max(a, rc, rdVal, rbVal, re, rf, rr, rdVal + rr, 1);
      const bScale = 2 / bMaxDim;
      const bsd = rdVal * bScale, bsb = rbVal * bScale, bse = re * bScale, bsf = rf * bScale, bsr = rr * bScale;
      const bAlfaRad = (rAlfa * Math.PI) / 180;
      const eDirX = -Math.sin(bAlfaRad);
      const eDirY = Math.cos(bAlfaRad);
      const eEndIx = bsr * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndIy = bsr * Math.sin(bAlfaRad) + eDirY * bse;
      const eEndOx = (bsr + bsb) * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndOy = (bsr + bsb) * Math.sin(bAlfaRad) + eDirY * bse;
      const minX = Math.min(0, eEndIx, eEndOx);
      const maxX = Math.max(bsr + bsd, eEndIx, eEndOx);
      const minY = Math.min(-bsf, eEndIy, eEndOy);
      const maxY = Math.max(bsr + bsd, eEndIy, eEndOy);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return (
        <group position={[-cx, -cy, 0]}>
          <DiffuserBendMesh a={a} dVal={rdVal} c={rc} bVal={rbVal} e={re} f={rf} r={rr} g={rg} alfa={rAlfa} />
          {showDimensions && <DiffuserBendLabels a={a} dVal={rdVal} c={rc} bVal={rbVal} e={re} f={rf} r={rr} alfa={rAlfa} />}
        </group>
      );
    }
    // QBFRa — reduction elbow (90° L-shape)
    if (symbol === 'QBFRa') {
      const rb = values[1] || 200;
      const rd = values[2] || 150;
      const re = values[3] || 150;
      const rf = values[4] || 150;
      const rr = values[5] || 100;
      return (
        <>
          <ReductionElbowMesh a={a} b={rb} d={rd} e={re} f={rf} r={rr} />
          {showDimensions && <ReductionElbowLabels a={a} b={rb} d={rd} e={re} f={rf} r={rr} />}
        </>
      );
    }
    // QBa / QBNa — symmetric bend
    const bendE = values[2] || 150;
    const bendF = values[3] || 150;
    const bendR = values[4] || 200;
    const bendAlfa = (symbol === 'QBNa' && values[5]) ? values[5] : 90;
    // Center the bend geometry: compute bounding box center
    const bMaxDim = Math.max(a, b, bendE, bendF, bendR, b + bendR, 1);
    const bScale = 2 / bMaxDim;
    const bsb = b * bScale, bse = bendE * bScale, bsf = bendF * bScale, bsr = bendR * bScale;
    const bAlfaRad = (bendAlfa * Math.PI) / 180;
    // Bounding box for centering
    const fDirX = -Math.sin(bAlfaRad);
    const fDirY = Math.cos(bAlfaRad);
    const fEndX = (bsr + bsb) * Math.cos(bAlfaRad) + fDirX * bsf;
    const fEndY = (bsr + bsb) * Math.sin(bAlfaRad) + fDirY * bsf;
    const minX = Math.min(-bsf * (bendAlfa >= 90 ? 1 : 0), fEndX, 0);
    const maxX = bsr + bsb;
    const minY = -bse;
    const maxY = Math.max(bsr + bsb, fEndY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return (
      <group position={[-cx, -cy, 0]}>
        <BendMesh a={a} b={b} e={bendE} f={bendF} r={bendR} alfa={bendAlfa} />
        {showDimensions && <BendDimensionLabels a={a} b={b} e={bendE} f={bendF} r={bendR} alfa={bendAlfa} />}
      </group>
    );
  };

  return (
    <>
    <div className="shape-3d-container">
      <div className="shape-3d-header">
        <span className="shape-3d-title">Widok 3D</span>
        <span className="shape-3d-hint">Obracaj · Scroll = zoom</span>
        <button className="btn-3d-expand" onClick={() => setExpanded(true)} title="Powiększ">
          ⊕
        </button>
      </div>
      <div className="shape-3d-canvas-wrapper">
        <Canvas
          frameloop="always"
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [3.2, 2.4, 3.2], fov: 45, near: 0.1, far: 100 }}
          style={{ background: 'linear-gradient(180deg, #dfe3e8 0%, #f1f2f2 40%, #e8eaed 100%)', borderRadius: 8 }}
        >
          <KeepAlive />
          <ambientLight intensity={0.35} />
          <hemisphereLight args={['#c0c8d8', '#606878', 0.4]} />
          <directionalLight position={[4, 5, 4]} intensity={0.6} />
          <directionalLight position={[-3, 2, -4]} intensity={0.25} />
          <FreeControls rotateSpeed={1.5} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} />
          <group ref={groupRef}>
            {renderShapeMesh()}
          </group>
          <AutoRotate groupRef={groupRef} enabled={autoRotate} />
          <Environment preset="city" />
        </Canvas>
      </div>
      <div className="shape-3d-toggles">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showDimensions}
            onChange={(e) => setShowDimensions(e.target.checked)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">Wymiary</span>
        </label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">Ruch</span>
        </label>
      </div>
    </div>

    {/* Modal overlay with larger 3D view */}
    {expanded && (
      <div className="shape-3d-modal-overlay" onClick={() => setExpanded(false)}>
        <div className="shape-3d-modal" onClick={(e) => e.stopPropagation()}>
          <div className="shape-3d-modal-header">
            <span className="shape-3d-title">Widok 3D</span>
            <span className="shape-3d-hint">Obracaj · Scroll = zoom</span>
            <div className="shape-3d-toggles" style={{ margin: 0 }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                />
                <span className="toggle-slider" />
                <span className="toggle-label">Wymiary</span>
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
                <span className="toggle-slider" />
                <span className="toggle-label">Ruch</span>
              </label>
            </div>
            <button className="btn-3d-expand" onClick={() => setExpanded(false)} title="Zamknij">
              ✕
            </button>
          </div>
          <div className="shape-3d-modal-canvas">
            <Canvas
              frameloop="always"
              gl={{ preserveDrawingBuffer: true, antialias: true }}
              camera={{ position: [3.2, 2.4, 3.2], fov: 40, near: 0.1, far: 100 }}
              style={{ background: 'linear-gradient(180deg, #dfe3e8 0%, #f1f2f2 40%, #e8eaed 100%)', borderRadius: '0 0 8px 8px' }}
            >
              <KeepAlive />
              <ambientLight intensity={0.35} />
              <hemisphereLight args={['#c0c8d8', '#606878', 0.4]} />
              <directionalLight position={[4, 5, 4]} intensity={0.6} />
              <directionalLight position={[-3, 2, -4]} intensity={0.25} />
              <FreeControls rotateSpeed={1.5} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} />
              <group ref={modalGroupRef}>
                {renderShapeMesh()}
              </group>
              <AutoRotate groupRef={modalGroupRef} enabled={autoRotate} />
              <Environment preset="city" />
            </Canvas>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ShapeDiagram3D;
