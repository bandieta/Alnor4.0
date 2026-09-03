import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Text, Environment, Billboard } from '@react-three/drei';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
  t?: (text: string) => string;
}

const HIDE_POLYGON_CONNECTION_LINES = true;

/* The single sheet-metal finish shared by every 3D fitting. This is the look the
   reducers (QPR6a/QPR2a) and bends (QBa/QBNa) use and that we standardise on, so
   every shape renders identically. `preserveMetalFinish` keeps normalizeGroupAppearance
   from ever flattening it to matte grey. */
const makeStandardMetalMaterial = () => {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#8a9bae',
    roughness: 0.18,
    metalness: 0.92,
    reflectivity: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
    envMapIntensity: 1.0,
    // Neutral floor so faces angled away from the key light / HDRI never read as
    // near-black on the more enclosed fittings (elbows, crosses, tees).
    emissive: new THREE.Color('#5b6472'),
    emissiveIntensity: 0.22,
  });
  m.userData.preserveMetalFinish = true;
  return m;
};

/* Post-mount pass over a shape group. Every fitting now builds its own
   standardised material (makeStandardMetalMaterial), so this NEVER rewrites
   materials any more — that is what used to flatten shapes to matte grey on
   (re)selection. It still (a) hides the debug polygon-connection lines and
   (b) rebuilds vertex normals for meshes that did not hand-author reliable
   ones (flagged with geo.userData.preserveNormals), so their winding-derived
   normals face outward and they light correctly. */
const normalizeGroupAppearance = (root: THREE.Object3D | null) => {
  if (!root) return;
  root.traverse((obj) => {
    if (obj instanceof THREE.LineSegments) {
      if (HIDE_POLYGON_CONNECTION_LINES) obj.visible = false;
      return;
    }
    if (obj instanceof THREE.Mesh) {
      let geo = obj.geometry as THREE.BufferGeometry | undefined;
      if (!geo || geo.userData.preserveNormals) return;
      // Weld duplicated vertices so contiguous plates shade as one surface,
      // then derive normals from the triangle winding (outward-facing).
      if (!geo.index) {
        const welded = mergeVertices(geo, 1e-6);
        if (welded !== geo) {
          geo = welded;
          obj.geometry = geo;
        }
      }
      geo.deleteAttribute('normal');
      geo.computeVertexNormals();
      geo.normalizeNormals();
    }
  });
};

/* Weld a hand-built shell, derive smooth vertex normals from it, then flip them into
   the convention BendMesh (QBa) authors: normals that oppose their own triangle's
   winding.

   Under side:DoubleSide three.js negates the shading normal on back-facing fragments,
   so the normal the shader actually uses is decided purely by whether the authored
   normal agrees with the winding — the authored direction itself cancels out.
   computeVertexNormals() always produces agreeing normals, which makes a fitting
   sample the environment from the wrong hemisphere: flat, cold-blue, no reflection.
   Flipping puts it in QBa's family — warm sheet metal with real HDRI reflection.

   preserveNormals then stops normalizeGroupAppearance recomputing (and so undoing)
   this, which also means the weld has to happen here rather than there. */
const applyStandardShading = (geo: THREE.BufferGeometry) => {
  let g = geo;
  if (!g.index) {
    const welded = mergeVertices(g, 1e-6);
    if (welded !== g) g = welded;
  }
  g.deleteAttribute('normal');
  g.computeVertexNormals();
  g.normalizeNormals();
  const normal = g.getAttribute('normal') as THREE.BufferAttribute;
  const arr = normal.array as Float32Array;
  for (let i = 0; i < arr.length; i++) arr[i] = -arr[i];
  normal.needsUpdate = true;
  g.userData.preserveNormals = true;
  return g;
};

/* Duct mesh — 4 side walls only (open inlet/outlet like original) */
const DuctMesh: React.FC<{ a: number; b: number; l: number }> = ({ a, b, l }) => {
  // Normalize so the longest side = 2 units
  const maxDim = Math.max(a, b, l, 1);
  const na = (a / maxDim) * 2;
  const nb = (b / maxDim) * 2;
  const nl = (l / maxDim) * 2;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

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
    // Outward-facing normals, i.e. the same convention BendMesh (QBa) authors: the
    // normal points out of the sheet and therefore opposes the winding-derived normal
    // of its own triangle. Under side:DoubleSide three.js negates the shading normal
    // on back-facing fragments, so what the shader ends up using is decided purely by
    // whether the authored normal agrees with the winding — not by its own direction.
    // Matching QBa's disagreeing convention is what gives the duct the same warm
    // sheet-metal reflection instead of the flat cold-blue cast it had when the
    // normals agreed with the winding.
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
    geo.userData.preserveNormals = true;
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2; // half-width (a dimension, z-axis)
    // Keep a consistent angular resolution for QBNa's variable-angle curve.
    const segments = Math.max(24, Math.ceil((Math.abs(alfaRad) / (Math.PI / 2)) * 48));
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

      // Inner wall: radial normals at each arc vertex produce a smooth formed curve.
      const in0: [number, number, number] = [-ix0 / sr, -iy0 / sr, 0];
      const in1: [number, number, number] = [-ix1 / sr, -iy1 / sr, 0];
      verts.push(ix0, iy0, hw, ix0, iy0, -hw, ix1, iy1, -hw);
      verts.push(ix0, iy0, hw, ix1, iy1, -hw, ix1, iy1, hw);
      norms.push(...in0, ...in0, ...in1, ...in0, ...in1, ...in1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall: likewise retain continuous radial normals across all arc slices.
      const out0: [number, number, number] = [ox0 / (sr + sb), oy0 / (sr + sb), 0];
      const out1: [number, number, number] = [ox1 / (sr + sb), oy1 / (sr + sb), 0];
      verts.push(ox0, oy0, -hw, ox0, oy0, hw, ox1, oy1, hw);
      verts.push(ox0, oy0, -hw, ox1, oy1, hw, ox1, oy1, -hw);
      norms.push(...out0, ...out0, ...out1, ...out0, ...out1, ...out1);
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
    geo.userData.preserveNormals = true;

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
  const maxDim = Math.max(a, b, d, e, f, r, b + r, d + r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const sd = d * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;
  const alfaRad = (alfa * Math.PI) / 180;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = sa / 2;
    const segments = Math.max(64, Math.ceil((Math.abs(alfaRad) / (Math.PI / 2)) * 128));
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

      // Inner wall — per-vertex radial normals so the mirror finish doesn't band
      const in0: [number, number, number] = [-ix0 / sr, -iy0 / sr, 0];
      const in1: [number, number, number] = [-ix1 / sr, -iy1 / sr, 0];
      verts.push(ix0, iy0, hw, ix0, iy0, -hw, ix1, iy1, -hw);
      verts.push(ix0, iy0, hw, ix1, iy1, -hw, ix1, iy1, hw);
      norms.push(...in0, ...in0, ...in1, ...in0, ...in1, ...in1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall — per-vertex radial normals
      const om0 = Math.hypot(ox0, oy0) || 1;
      const om1 = Math.hypot(ox1, oy1) || 1;
      const out0: [number, number, number] = [ox0 / om0, oy0 / om0, 0];
      const out1: [number, number, number] = [ox1 / om1, oy1 / om1, 0];
      verts.push(ox0, oy0, -hw, ox0, oy0, hw, ox1, oy1, hw);
      verts.push(ox0, oy0, -hw, ox1, oy1, hw, ox1, oy1, -hw);
      norms.push(...out0, ...out0, ...out1, ...out0, ...out1, ...out1);
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
    // These normals are authored exactly as BendMesh (QBa) authors its own:
    // per-face on the flat walls, per-vertex radial on the curve, all in the
    // convention that opposes the triangle winding. Without preserveNormals the
    // normalize pass would run computeVertexNormals() over them and collapse
    // everything to the winding-agreeing direction, which under side:DoubleSide
    // is what made QBRa read colder and flatter than QBa.
    geo.userData.preserveNormals = true;

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, se, sf, sr, alfaRad]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo} visible={false}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* Reduction Bend dimension labels */
const ReductionBendLabels: React.FC<{
  a: number; b: number; d: number; e: number; f: number; r: number; alfa: number
}> = ({ a, b, d, e, f, r, alfa }) => {
  const maxDim = Math.max(a, b, d, e, f, r, b + r, d + r, 1);
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    // High angular resolution so the formed bend reads as a smooth curve, not facets.
    const segments = Math.max(48, Math.ceil((Math.abs(alfaRad) / (Math.PI / 2)) * 96));
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

      // Inner wall — per-vertex radial normals toward the arc centre → smooth curve
      const in0: [number, number, number] = [-ix0 / sr, -iy0 / sr, 0];
      const in1: [number, number, number] = [-ix1 / sr, -iy1 / sr, 0];
      verts.push(ix0, iy0, zR0, ix0, iy0, zL0, ix1, iy1, zL1);
      verts.push(ix0, iy0, zR0, ix1, iy1, zL1, ix1, iy1, zR1);
      norms.push(...in0, ...in0, ...in1, ...in0, ...in1, ...in1);
      uvArr.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);

      // Outer wall — per-vertex radial normals away from the arc centre
      const om0 = Math.hypot(ox0, oy0) || 1;
      const om1 = Math.hypot(ox1, oy1) || 1;
      const out0: [number, number, number] = [ox0 / om0, oy0 / om0, 0];
      const out1: [number, number, number] = [ox1 / om1, oy1 / om1, 0];
      verts.push(ox0, oy0, zL0, ox0, oy0, zR0, ox1, oy1, zR1);
      verts.push(ox0, oy0, zL0, ox1, oy1, zR1, ox1, oy1, zL1);
      norms.push(...out0, ...out0, ...out1, ...out0, ...out1, ...out1);
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
    geo.userData.preserveNormals = true;

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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const totalW = se + sb;
    const totalH = sd + sf;
    const x0 = -totalW / 2;
    const y0 = -totalH / 2;
    const cornerR = Math.max(0.001, Math.min(sr, se * 0.98, sf * 0.98));
    // Match the angular resolution the other rounded fittings use on their
    // curves (QBa/QBRa run 48–128 over 90°), so the inner fillet reads as a
    // formed radius rather than a low-poly chamfer.
    const arcSegments = 96;

    // 2D L-profile with an inner fillet, then extruded along Z.
    const shape = new THREE.Shape();
    shape.moveTo(x0, y0);
    shape.lineTo(x0 + totalW, y0);
    shape.lineTo(x0 + totalW, y0 + totalH);
    shape.lineTo(x0 + se, y0 + totalH);
    shape.lineTo(x0 + se, y0 + sd + cornerR);

    const arcCX = x0 + se - cornerR;
    const arcCY = y0 + sd + cornerR;
    for (let i = 1; i <= arcSegments; i++) {
      const t = i / arcSegments;
      const ang = t * (Math.PI / 2);
      shape.lineTo(
        arcCX + Math.cos(ang) * cornerR,
        arcCY - Math.sin(ang) * cornerR,
      );
    }

    shape.lineTo(x0, y0 + sd);
    shape.lineTo(x0, y0);

    const contour = shape.extractPoints(arcSegments).shape;
    const faceTriangles = THREE.ShapeUtils.triangulateShape(contour, []);
    const halfDepth = sa / 2;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const addTriangle = (p0: number[], p1: number[], p2: number[], normal: number[]) => {
      verts.push(...p0, ...p1, ...p2);
      for (let i = 0; i < 3; i++) norms.push(...normal);
      uvArr.push(0, 0, 1, 0, 1, 1);
    };
    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], normal: number[]) => {
      addTriangle(p0, p1, p2, normal);
      addTriangle(p0, p2, p3, normal);
    };

    // Keep the broad front/back sheet faces, matching QBRa's construction.
    for (const [i0, i1, i2] of faceTriangles) {
      const p0 = contour[i0];
      const p1 = contour[i1];
      const p2 = contour[i2];
      addTriangle([p2.x, p2.y, -halfDepth], [p1.x, p1.y, -halfDepth], [p0.x, p0.y, -halfDepth], [0, 0, -1]);
      addTriangle([p0.x, p0.y, halfDepth], [p1.x, p1.y, halfDepth], [p2.x, p2.y, halfDepth], [0, 0, 1]);
    }

    // A contour vertex sits on the inner fillet if it is cornerR from the arc centre.
    const onArc = (p: THREE.Vector2) =>
      Math.abs(Math.hypot(p.x - arcCX, p.y - arcCY) - cornerR) < cornerR * 0.02 + 1e-6;
    // Radial normal at an arc vertex, authored in the SAME pre-negate sense as
    // the flat wall normals ([dy,-dx] = tangent rotated -90°, which on this arc
    // works out to point toward the centre). The global negate below then flips
    // the whole shell — flats and fillet alike — into QBa's convention.
    const radial = (p: THREE.Vector2): [number, number, number] => {
      const rx = arcCX - p.x, ry = arcCY - p.y;
      const rl = Math.hypot(rx, ry) || 1;
      return [rx / rl, ry / rl, 0];
    };

    // Add perimeter walls except at the left d×a and bottom b×a duct openings.
    for (let i = 0; i < contour.length; i++) {
      const p0 = contour[i];
      const p1 = contour[(i + 1) % contour.length];
      const isLeftOpening = Math.abs(p0.x - x0) < 1e-6 && Math.abs(p1.x - x0) < 1e-6;
      const isBottomOpening = Math.abs(p0.y - (y0 + totalH)) < 1e-6
        && Math.abs(p1.y - (y0 + totalH)) < 1e-6;
      if (isLeftOpening || isBottomOpening) continue;

      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const length = Math.hypot(dx, dy);
      if (length < 1e-6) continue;

      const q0 = [p0.x, p0.y, -halfDepth];
      const q1 = [p1.x, p1.y, -halfDepth];
      const q2 = [p1.x, p1.y, halfDepth];
      const q3 = [p0.x, p0.y, halfDepth];

      if (onArc(p0) && onArc(p1)) {
        // Per-vertex radial normals so the fillet shades as one smooth surface
        // instead of a fan of flats (the same trick QBa/QBRa use on their curves).
        const n0 = radial(p0);
        const n1 = radial(p1);
        verts.push(...q0, ...q1, ...q2, ...q0, ...q2, ...q3);
        norms.push(...n0, ...n1, ...n1, ...n0, ...n1, ...n0);
        uvArr.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      } else {
        addQuad(q0, q1, q2, q3, [dy / length, -dx / length, 0]);
      }
    }

    // These per-face normals were authored pointing out of the sheet, which means
    // they AGREE with their triangle's winding. QBa's BendMesh authors the opposite
    // convention, and under side:DoubleSide it is that winding-agreement (not the
    // normal's own direction) that picks the shading normal — so an agreeing shell
    // samples the environment from the wrong hemisphere and reads flat and cold.
    // Negate to land in QBa's family: warm sheet metal with real HDRI reflection.
    for (let i = 0; i < norms.length; i++) norms[i] = -norms[i];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    geo.userData.preserveNormals = true;

    // 30° threshold so the wireframe marks the real folds only, not every
    // fillet facet (matches QBFa).
    const eGeo = new THREE.EdgesGeometry(geo, 30);
    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, se, sf, sr]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo} visible={false}>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hL = sl / 2, hb = sb / 2, ha = sa / 2;

    // Keep branch footprint inside the main duct opening to prevent invalid/self-intersecting meshes.
    const swSafe = Math.min(sw, Math.max(0.001, sl * 0.98));
    const sdSafe = Math.min(sd, Math.max(0.001, sa * 0.98));
    const seSafe = Math.min(sl - swSafe / 2, Math.max(swSafe / 2, se));
    const sfSafe = Math.min(sa - sdSafe / 2, Math.max(sdSafe / 2, sf));

    // Branch reference offsets (C# dx, dy, dz)
    const brDX = -hL + seSafe;           // branch center x
    const brTopY = -hb;              // branch top y = main duct bottom
    const brBotY = -hb - sl3;        // branch bottom y
    const brFrtZ = -ha + sfSafe - sdSafe / 2; // branch front z
    const brBckZ = -ha + sfSafe + sdSafe / 2; // branch back z
    const brLftX = brDX - swSafe / 2;    // branch left x
    const brRgtX = brDX + swSafe / 2;    // branch right x

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
      uvArr.push(0,0, 0,0, 1,1, 0,0, 1,1, 0,1);
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

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rawGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    rawGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    // The hand-authored per-face normals here were an inconsistent mix — some
    // agreeing with their triangle winding, some opposing — so the tee lit
    // unevenly and, on the agreeing faces, flat and cold. Re-derive from the
    // winding and flip into QBa's uniform opposing convention. The weld only
    // fuses genuine duplicates (same position AND normal AND uv), so the box
    // and branch edges stay crisp.
    const geo = applyStandardShading(rawGeo);

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
}> = ({ a, b, d, w, L, e, f, l3 }) => {
  const maxDim = Math.max(a, b, d, w, L, e, l3, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = d * scale, sl = L * scale, sw = w * scale, sl3 = l3 * scale;
  const hb = sb / 2, hL = sl / 2;

  const swSafe = Math.min(sw, Math.max(0.001, sl * 0.98));
  const sdSafe = Math.min(sd, Math.max(0.001, sa * 0.98));
  const seSafe = Math.min(sl - swSafe / 2, Math.max(swSafe / 2, e * scale));
  const sfSafe = Math.min(sa - sdSafe / 2, Math.max(sdSafe / 2, f * scale));

  const brDX = -hL + seSafe;
  const brTopY = -hb;
  const brBotY = -hb - sl3;
  const branchCenterZ = -sa / 2 + sfSafe;

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
      {/* d — branch depth in z */}
      <Billboard position={[brDX, brTopY + 0.1, branchCenterZ]}>
        <Text fontSize={0.10} color="#666666" anchorX="center" anchorY="bottom">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      {/* f — branch offset from front face */}
      <Billboard position={[-hL - 0.16, brTopY - 0.02, branchCenterZ]}>
        <Text fontSize={0.10} color="#666666" anchorX="right" anchorY="middle">{`f = ${Math.round(f)}`}</Text>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hL = sl / 2, hb = sb / 2, ha = sa / 2;

    // Keep branch placement valid inside main duct footprint.
    const sdSafe = Math.min(sd, Math.max(0.001, sa * 0.98));
    const hr = sdSafe / 2; // branch radius
    const seSafe = Math.min(sl - hr, Math.max(hr, se));
    const sfSafe = Math.min(sa - hr, Math.max(hr, sf));

    // Branch center (matching C#)
    const brX = -hL + seSafe;
    const brZ = -ha + sfSafe; // circle center z
    const brTopY = hb;
    const brBotY = hb + sl3;

    // Main duct corners (p0-p7)
    const p0: number[] = [-hL,  hb, -ha];
    const p1: number[] = [ hL,  hb, -ha];
    const p2: number[] = [ hL, -hb, -ha];
    const p3: number[] = [-hL, -hb, -ha];
    const p4: number[] = [-hL,  hb,  ha];
    const p5: number[] = [ hL,  hb,  ha];
    const p6: number[] = [ hL, -hb,  ha];
    const p7: number[] = [-hL, -hb,  ha];

    // Rectangular collar corners at duct top (y = +hb)
    const rcFL: number[] = [brX - hr, hb, brZ - hr]; // front-left
    const rcFR: number[] = [brX + hr, hb, brZ - hr]; // front-right
    const rcBR: number[] = [brX + hr, hb, brZ + hr]; // back-right
    const rcBL: number[] = [brX - hr, hb, brZ + hr]; // back-left

    // Generate circle + rectangle perimeter using angular correspondence
    // This ensures the transition quads don't twist
    const segs = 64;
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
    const norms: number[] = [];
    const edgePts: number[] = [];

    const addTri = (a: number[], b: number[], c: number[], na: number[], nb = na, nc = na) => {
      verts.push(...a, ...b, ...c);
      norms.push(...na, ...nb, ...nc);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[], normal: number[]) => {
      addTri(q0, q1, q2, normal);
      addTri(q0, q2, q3, normal);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    // ── Main duct walls (3 walls, open at both x-ends) ──────────────────────
    addQuad(p3, p0, p1, p2, [0, 0, -1]);       // Front face (z=-ha)
    addQuad(p4, p7, p6, p5, [0, 0, 1]);         // Back face (z=ha)
    addQuad(p3, p2, p6, p7, [0, -1, 0]);        // Bottom face (y=-hb)

    // ── Top face with branch hole (4 strips from duct corners to rectangular collar) ─
    addQuad(p0, p1, rcFR, rcFL, [0, 1, 0]);   // front strip
    addQuad(p1, p5, rcBR, rcFR, [0, 1, 0]);   // right strip
    addQuad(p5, p4, rcBL, rcBR, [0, 1, 0]);   // back strip
    addQuad(p4, p0, rcFL, rcBL, [0, 1, 0]);   // left strip

    // ── Flat transition from rectangular collar to circle (at y=+hb) ────────
    for (let i = 0; i < segs; i++) {
      addQuad(rectPerim[i], rectPerim[i + 1], topCircle[i + 1], topCircle[i], [0, 1, 0]);
    }

    // ── Round branch tube ───────────────────────────────────────────────────
    for (let i = 0; i < segs; i++) {
      const normal0 = [(topCircle[i][0] - brX) / hr, 0, (topCircle[i][2] - brZ) / hr];
      const normal1 = [(topCircle[i + 1][0] - brX) / hr, 0, (topCircle[i + 1][2] - brZ) / hr];
      addTri(topCircle[i], topCircle[i + 1], botCircle[i + 1], normal0, normal1, normal1);
      addTri(topCircle[i], botCircle[i + 1], botCircle[i], normal0, normal1, normal0);
    }

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rawGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // The three main-duct walls were authored pointing physically outward, which
    // makes them AGREE with their triangle winding, while the top strips, the
    // collar transition and the branch tube all OPPOSE theirs. That split lit the
    // tee unevenly and, on the agreeing walls, flat and cold. Re-derive from the
    // winding and flip into QBa's uniform opposing convention. The weld fuses the
    // branch tube's shared radial-normal verts (keeping it smooth) but not the
    // box corners (keeping them crisp).
    const geo = applyStandardShading(rawGeo);

    // ── Edge wireframe ──────────────────────────────────────────────────────
    // Main duct edges
    seg(p0, p1); seg(p1, p2); seg(p2, p3); seg(p3, p0);
    seg(p4, p5); seg(p5, p6); seg(p6, p7); seg(p7, p4);
    seg(p0, p4); seg(p1, p5); seg(p2, p6); seg(p3, p7);
    // Hole edges on top face
    seg(rcFL, rcFR); seg(rcFR, rcBR); seg(rcBR, rcBL); seg(rcBL, rcFL);
    // Top strips connections
    seg(p1, rcFR); seg(p0, rcFL); seg(p5, rcBR); seg(p4, rcBL);
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
}> = ({ a, b, d, L, l3, e, f }) => {
  const maxDim = Math.max(a, b, d, L, l3, e, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sd = d * scale, sb = b * scale, sl = L * scale, sl3 = l3 * scale;
  const hb = sb / 2, hL = sl / 2;

  const sdSafe = Math.min(sd, Math.max(0.001, sa * 0.98));
  const hr = sdSafe / 2;
  const seSafe = Math.min(sl - hr, Math.max(hr, e * scale));
  const sfSafe = Math.min(sa - hr, Math.max(hr, f * scale));

  const brDX = -hL + seSafe;
  const brTopY = hb;
  const brBotY = hb + sl3;
  const branchCenterZ = -sa / 2 + sfSafe;

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
      <Billboard position={[brDX + sdSafe / 2 + 0.18, (brTopY + brBotY) / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`l3 = ${Math.round(l3)}`}</Text>
      </Billboard>
      <Billboard position={[-hL - 0.16, brTopY - 0.02, branchCenterZ]}>
        <Text fontSize={0.10} color="#666666" anchorX="right" anchorY="middle">{`f = ${Math.round(f)}`}</Text>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

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
    const arcStepsR = 32;
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
    const norms: number[] = [];
    const edgePts: number[] = [];

    const addTri = (a: number[], b: number[], c: number[], normal: number[]) => {
      verts.push(...a, ...b, ...c);
      for (let vertex = 0; vertex < 3; vertex++) norms.push(...normal);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[], normal: number[]) => {
      addTri(q0, q1, q2, normal);
      addTri(q0, q2, q3, normal);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    // ── Side walls (skip opening segments) ──────────────────────────────────
    for (let k = 0; k < N; k++) {
      if (openSegments.has(k)) continue;
      const k1 = (k + 1) % N;
      const edgeX = profile[k1][0] - profile[k][0];
      const edgeY = profile[k1][1] - profile[k][1];
      const edgeLength = Math.hypot(edgeX, edgeY) || 1;
      addQuad(
        frontPts[k], frontPts[k1], backPts[k1], backPts[k],
        [-edgeY / edgeLength, edgeX / edgeLength, 0],
      );
    }

    // ── Front/back sheet faces — triangulate the concave profile without overlaps ──
    const faceTriangles = THREE.ShapeUtils.triangulateShape(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      [],
    );
    for (const [i0, i1, i2] of faceTriangles) {
      addTri(frontPts[i2], frontPts[i1], frontPts[i0], [0, 0, -1]);
      addTri(backPts[i0], backPts[i1], backPts[i2], [0, 0, 1]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.userData.preserveNormals = true;

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

/* ===== QPR3a Symmetric Offset (Odsadzka sym.) ===== */
const QPR3aMesh: React.FC<{
  a: number; b: number; e: number; L: number; m: number; h: number;
}> = ({ a, b, e, L, m, h }) => {
  const maxDim = Math.max(a, b, e, L, m, h, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, se = e * scale;
  const sl = L * scale, sm = m * scale, sh = h * scale;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const ha = sa / 2;
    const alfa = Math.atan(se / sl);
    const beta = alfa / 2;
    const m1 = Math.tan(beta) * sb;

    // d = b for symmetric offset
    const sd_val = sb;

    // 16 vertices: 0-7 on left face (x=-ha), 8-15 on right face (x=+ha)
    // Upper section is shifted up by e/2, lower section shifted down by e/2
    const p = [
      // Left face (x = -ha)
      [-ha,  se/2 + sd_val/2,  -sl/2],                // 0: upper top-front
      [-ha,  se/2 + sd_val/2,  -sl/2 + sm + m1],      // 1: upper top, diagonal start
      [-ha, -se/2 - sd_val/2 + sb,  sl/2 - sh],       // 2: lower top, diagonal end
      [-ha, -se/2 - sd_val/2 + sb,  sl/2],            // 3: lower top-back
      [-ha, -se/2 - sd_val/2,  sl/2],                 // 4: lower bottom-back
      [-ha, -se/2 - sd_val/2,  sl/2 - sh - m1],       // 5: lower bottom, diagonal start
      [-ha,  se/2 - sd_val/2,  -sl/2 + sm],           // 6: upper bottom, diagonal end
      [-ha,  se/2 - sd_val/2,  -sl/2],                // 7: upper bottom-front
      // Right face (x = +ha)
      [ ha,  se/2 + sd_val/2,  -sl/2],                // 8
      [ ha,  se/2 + sd_val/2,  -sl/2 + sm + m1],      // 9
      [ ha, -se/2 - sd_val/2 + sb,  sl/2 - sh],       // 10
      [ ha, -se/2 - sd_val/2 + sb,  sl/2],            // 11
      [ ha, -se/2 - sd_val/2,  sl/2],                 // 12
      [ ha, -se/2 - sd_val/2,  sl/2 - sh - m1],       // 13
      [ ha,  se/2 - sd_val/2,  -sl/2 + sm],           // 14
      [ ha,  se/2 - sd_val/2,  -sl/2],                // 15
    ];

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

    // Left face walls (3 sections)
    addQuad(p[0], p[1], p[6], p[7]);   // upper straight
    addQuad(p[1], p[2], p[5], p[6]);   // diagonal
    addQuad(p[2], p[3], p[4], p[5]);   // lower straight

    // Right face walls (3 sections)
    addQuad(p[15], p[14], p[9], p[8]);  // upper straight
    addQuad(p[14], p[13], p[10], p[9]); // diagonal
    addQuad(p[13], p[12], p[11], p[10]); // lower straight

    // Top walls (connecting left to right)
    addQuad(p[0], p[1], p[9], p[8]);   // upper straight top
    addQuad(p[1], p[2], p[10], p[9]);  // diagonal top
    addQuad(p[2], p[3], p[11], p[10]); // lower straight top

    // Bottom walls (connecting left to right)
    addQuad(p[7], p[6], p[14], p[15]); // upper straight bottom
    addQuad(p[6], p[5], p[13], p[14]); // diagonal bottom
    addQuad(p[5], p[4], p[12], p[13]); // lower straight bottom

    // NO end caps (open inlet and outlet)

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    // computeVertexNormals() alone yields normals that agree with the triangle
    // winding, which under side:DoubleSide reads flat and cold — QBa's BendMesh
    // authors the opposing convention. applyStandardShading welds, recomputes,
    // and flips into that convention so the offset shades as warm sheet metal.
    const geo = applyStandardShading(rawGeo);

    // Edge wireframe
    // Left face outline
    seg(p[0], p[1]); seg(p[1], p[2]); seg(p[2], p[3]);
    seg(p[3], p[4]); seg(p[4], p[5]); seg(p[5], p[6]);
    seg(p[6], p[7]); seg(p[7], p[0]);
    // Right face outline
    seg(p[8], p[9]); seg(p[9], p[10]); seg(p[10], p[11]);
    seg(p[11], p[12]); seg(p[12], p[13]); seg(p[13], p[14]);
    seg(p[14], p[15]); seg(p[15], p[8]);
    // Depth edges (connecting left to right at key points)
    seg(p[0], p[8]); seg(p[1], p[9]); seg(p[2], p[10]);
    seg(p[3], p[11]); seg(p[4], p[12]); seg(p[5], p[13]);
    seg(p[6], p[14]); seg(p[7], p[15]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, se, sl, sm, sh]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* QPR3a dimension labels */
const QPR3aLabels: React.FC<{
  a: number; b: number; e: number; L: number; m: number; h: number;
}> = ({ a, b, e, L, m: _m, h: _h }) => {
  const maxDim = Math.max(a, b, e, L, 1);
  const scale = 2 / maxDim;
  const sb = b * scale, se = e * scale, sl = L * scale;
  const hL = sl / 2;
  const topY = se / 2 + sb / 2;

  return (
    <>
      <Billboard position={[0, topY + 0.18, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="bottom">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[-hL - 0.15, se / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="right" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[hL + 0.15, -se / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, hL + 0.15]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="middle">{`a=${Math.round(a)} e=${Math.round(e)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== QPR4a Asymmetric Offset (Odsadzka asym.) ===== */
const QPR4aMesh: React.FC<{
  a: number; b: number; d: number; e: number; L: number; m: number; h: number;
}> = ({ a, b, d, e, L, m, h }) => {
  const maxDim = Math.max(a, b, d, e, L, m, h, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, sb = b * scale, sd = d * scale, se = e * scale;
  const sl = L * scale, sm = m * scale, sh = h * scale;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const ha = sa / 2;
    const alfa = Math.atan(se / sl);
    const beta = alfa / 2;
    const m1 = Math.tan(beta) * sb;

    // C# vertex layout: d=inlet height, b=outlet height
    // 0-7 left face (x=-ha), 8-15 right face (x=+ha)
    const p = [
      // Left face
      [-ha,  se/2 + sd/2,           -sl/2],                // 0: inlet top-front
      [-ha,  se/2 + sd/2,           -sl/2 + sm + m1],      // 1: inlet top, diagonal start
      [-ha, -se/2 - sd/2 + sb,       sl/2 - sh],           // 2: outlet top, diagonal end
      [-ha, -se/2 - sd/2 + sb,       sl/2],                // 3: outlet top-back
      [-ha, -se/2 - sd/2,            sl/2],                // 4: outlet bottom-back
      [-ha, -se/2 - sd/2,            sl/2 - sh - m1],      // 5: outlet bottom, diagonal start
      [-ha,  se/2 + sd/2 - sd,      -sl/2 + sm],           // 6: inlet bottom, diagonal end
      [-ha,  se/2 + sd/2 - sd,      -sl/2],                // 7: inlet bottom-front
      // Right face
      [ ha,  se/2 + sd/2,           -sl/2],                // 8
      [ ha,  se/2 + sd/2,           -sl/2 + sm + m1],      // 9
      [ ha, -se/2 - sd/2 + sb,       sl/2 - sh],           // 10
      [ ha, -se/2 - sd/2 + sb,       sl/2],                // 11
      [ ha, -se/2 - sd/2,            sl/2],                // 12
      [ ha, -se/2 - sd/2,            sl/2 - sh - m1],      // 13
      [ ha,  se/2 + sd/2 - sd,      -sl/2 + sm],           // 14
      [ ha,  se/2 + sd/2 - sd,      -sl/2],                // 15
    ];

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

    // Left face walls (3 sections)
    addQuad(p[0], p[1], p[6], p[7]);   // inlet straight
    addQuad(p[1], p[2], p[5], p[6]);   // diagonal
    addQuad(p[2], p[3], p[4], p[5]);   // outlet straight

    // Right face walls (3 sections)
    addQuad(p[15], p[14], p[9], p[8]);
    addQuad(p[14], p[13], p[10], p[9]);
    addQuad(p[13], p[12], p[11], p[10]);

    // Top walls
    addQuad(p[0], p[1], p[9], p[8]);
    addQuad(p[1], p[2], p[10], p[9]);
    addQuad(p[2], p[3], p[11], p[10]);

    // Bottom walls
    addQuad(p[7], p[6], p[14], p[15]);
    addQuad(p[6], p[5], p[13], p[14]);
    addQuad(p[5], p[4], p[12], p[13]);

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    // computeVertexNormals() alone agrees with the triangle winding, which under
    // side:DoubleSide reads flat and cold; QBa's BendMesh authors the opposing
    // convention. applyStandardShading welds, recomputes, and flips into it so
    // the offset shades as warm sheet metal (same fix as QPR3a).
    const geo = applyStandardShading(rawGeo);

    // Edge wireframe
    seg(p[0], p[1]); seg(p[1], p[2]); seg(p[2], p[3]);
    seg(p[3], p[4]); seg(p[4], p[5]); seg(p[5], p[6]);
    seg(p[6], p[7]); seg(p[7], p[0]);
    seg(p[8], p[9]); seg(p[9], p[10]); seg(p[10], p[11]);
    seg(p[11], p[12]); seg(p[12], p[13]); seg(p[13], p[14]);
    seg(p[14], p[15]); seg(p[15], p[8]);
    seg(p[0], p[8]); seg(p[1], p[9]); seg(p[2], p[10]);
    seg(p[3], p[11]); seg(p[4], p[12]); seg(p[5], p[13]);
    seg(p[6], p[14]); seg(p[7], p[15]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, se, sl, sm, sh]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* QPR4a dimension labels */
const QPR4aLabels: React.FC<{
  a: number; b: number; d: number; e: number; L: number; m: number; h: number;
}> = ({ a, b, d, e, L }) => {
  const maxDim = Math.max(a, b, d, e, L, 1);
  const scale = 2 / maxDim;
  const sd = d * scale, se = e * scale, sl = L * scale;
  const hL = sl / 2;
  const topY = se / 2 + sd / 2;

  return (
    <>
      <Billboard position={[0, topY + 0.18, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="bottom">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[-hL - 0.15, se / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="right" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[hL + 0.15, -se / 2, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, hL + 0.15]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="middle">{`a=${Math.round(a)} e=${Math.round(e)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== TR6a Pipe Saddle (Nakładka na rurę) ===== */
const TR6aMesh: React.FC<{
  a: number; e: number; f: number; L: number; g: number;
}> = ({ a, e, f, L: _L, g }) => {
  const maxDim = Math.max(a, e, f, g, 1);
  const scale = 2 / maxDim;
  const sa = a * scale, seRaw = e * scale, sfRaw = f * scale, sgRaw = g * scale;
  const se = Math.max(0.02, seRaw);
  const sf = Math.min(Math.max(0.02, sfRaw), Math.max(0.02, sa));
  const sg = Math.max(0.02, sgRaw);
  const sr = sa / 2; // pipe radius

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const he = se / 2;
    // y(x, r) = sqrt(r² - x²) — circle
    const yCirc = (x: number) => Math.sqrt(Math.max(0, sr * sr - x * x));

    // Legacy TR6a uses 9 fixed sample bands across z:
    // -f/2, -3f/8, -f/4, -f/8, 0, f/8, f/4, 3f/8, f/2
    const zBands = [
      -sf / 2,
      -3 * sf / 8,
      -sf / 4,
      -sf / 8,
      0,
      sf / 8,
      sf / 4,
      3 * sf / 8,
      sf / 2,
    ];
    const N = zBands.length;

    // Build left face (x=-he) and right face (x=+he)
    // Top ring follows pipe surface, bottom ring is flat at y=-sg
    const leftTop: number[][] = [];
    const leftBot: number[][] = [];
    const rightTop: number[][] = [];
    const rightBot: number[][] = [];

    for (let i = 0; i < N; i++) {
      const z = zBands[i];
      const yTop = -yCirc(z) + sr; // C# formula: -y(z, r) + r
      leftTop.push([-he, yTop, z]);
      leftBot.push([-he, -sg, z]);
      rightTop.push([he, yTop, z]);
      rightBot.push([he, -sg, z]);
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

    // Left face: 8 quads from top[i]→top[i+1] to bot[i+1]→bot[i]
    for (let i = 0; i < N - 1; i++) {
      addQuad(leftTop[i], leftTop[i + 1], leftBot[i + 1], leftBot[i]);
    }
    // Right face: 8 quads
    for (let i = 0; i < N - 1; i++) {
      addQuad(rightTop[i + 1], rightTop[i], rightBot[i], rightBot[i + 1]);
    }
    // Front side (z=-sf/2): left[0] to right[0], top to bottom
    addQuad(leftTop[0], rightTop[0], rightBot[0], leftBot[0]);
    // Back side (z=+sf/2): left[N-1] to right[N-1], top to bottom
    addQuad(rightTop[N - 1], leftTop[N - 1], leftBot[N - 1], rightBot[N - 1]);

    // Intentionally keep top and bottom open: this matches legacy TR6a,
    // which is modeled as a saddle shell (side walls + two end caps).

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    // computeVertexNormals() alone agrees with the triangle winding, which under
    // side:DoubleSide reads flat and cold; QBa's BendMesh authors the opposing
    // convention. applyStandardShading welds (keeping the saddle curve smooth),
    // recomputes, and flips into it so the shell shades as warm sheet metal.
    const geo = applyStandardShading(rawGeo);

    // Edge wireframe
    // Left face outline (top curve + bottom + verticals)
    for (let i = 0; i < N - 1; i++) seg(leftTop[i], leftTop[i + 1]);
    seg(leftBot[0], leftBot[N - 1]);
    seg(leftTop[0], leftBot[0]);
    seg(leftTop[N - 1], leftBot[N - 1]);
    // Right face outline
    for (let i = 0; i < N - 1; i++) seg(rightTop[i], rightTop[i + 1]);
    seg(rightBot[0], rightBot[N - 1]);
    seg(rightTop[0], rightBot[0]);
    seg(rightTop[N - 1], rightBot[N - 1]);
    // Depth edges at profile endpoints and apex
    seg(leftTop[0], rightTop[0]);
    seg(leftTop[N - 1], rightTop[N - 1]);
    seg(leftBot[0], rightBot[0]);
    seg(leftBot[N - 1], rightBot[N - 1]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [se, sf, sg, sr]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* TR6a dimension labels */
const TR6aLabels: React.FC<{
  a: number; e: number; f: number; L: number; g: number;
}> = ({ a, e, f, g }) => {
  const maxDim = Math.max(a, e, f, g, 1);
  const scale = 2 / maxDim;
  const se = Math.max(0.02, e * scale);
  const sf = Math.min(Math.max(0.02, f * scale), Math.max(0.02, a * scale * 0.98));
  const sg = g * scale;

  return (
    <>
      <Billboard position={[0, -sg - 0.15, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="top">{`a = ${Math.round(a)}`}</Text>
      </Billboard>
      <Billboard position={[se / 2 + 0.15, 0, 0]}>
        <Text fontSize={0.11} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0.15, sf / 2 + 0.1]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="bottom">{`f=${Math.round(f)} g=${Math.round(g)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== CZ1a — Cross-junction with rectangular branches ===== */
const CZ1aMesh: React.FC<{
  a: number; b: number; d: number; w: number; L: number;
  d1: number; w1: number; e1: number; f1: number;
  e: number; f: number; l3: number; l4: number;
}> = ({ a, b, d, w, L, d1, w1, e1, f1, e, f, l3, l4 }) => {
  const maxDim = Math.max(a, b, d, w, L, d1, w1, e1, f1, e, f, l3, l4, 1);
  const sc = 2 / maxDim;
  const sa = a * sc, sb = b * sc, sd = d * sc, sw = w * sc;
  const sL = L * sc, sd1 = d1 * sc, sw1 = w1 * sc;
  const se = e * sc, se1 = e1 * sc, sf1 = f1 * sc;
  const sf = f * sc, sl3 = l3 * sc, sl4 = l4 * sc;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    // Keep branch widths and depth centers inside the main duct span (Z axis).
    const swEff = Math.min(sw, sL);
    const sw1Eff = Math.min(sw1, sL);

    const topCzTarget = -sL / 2 + se1;
    const topRange = Math.max(0, sL / 2 - sw1Eff / 2);
    const topCz = clamp(topCzTarget, -topRange, topRange);

    const botCzTarget = -sL / 2 + se;
    const botRange = Math.max(0, sL / 2 - swEff / 2);
    const botCz = clamp(botCzTarget, -botRange, botRange);

    // Main duct box (pts 0-7)
    const P: number[][] = [
      [-sa / 2,  sb / 2, -sL / 2],  // 0
      [-sa / 2,  sb / 2,  sL / 2],  // 1
      [-sa / 2, -sb / 2,  sL / 2],  // 2
      [-sa / 2, -sb / 2, -sL / 2],  // 3
      [ sa / 2,  sb / 2, -sL / 2],  // 4
      [ sa / 2,  sb / 2,  sL / 2],  // 5
      [ sa / 2, -sb / 2,  sL / 2],  // 6
      [ sa / 2, -sb / 2, -sL / 2],  // 7
    ];

    // .NET points 8-15: top branch uses d1, w1, e1, f1 and l4.
    const tdx = -sa / 2 + sf1;
    const tdy = sb / 2 + sl4 / 2;
    P.push(
      [-sd1 / 2 + tdx,  sl4 / 2 + tdy, -sw1Eff / 2 + topCz],  // 8
      [-sd1 / 2 + tdx,  sl4 / 2 + tdy,  sw1Eff / 2 + topCz],  // 9
      [-sd1 / 2 + tdx, -sl4 / 2 + tdy,  sw1Eff / 2 + topCz],  // 10
      [-sd1 / 2 + tdx, -sl4 / 2 + tdy, -sw1Eff / 2 + topCz],  // 11
      [ sd1 / 2 + tdx,  sl4 / 2 + tdy, -sw1Eff / 2 + topCz],  // 12
      [ sd1 / 2 + tdx,  sl4 / 2 + tdy,  sw1Eff / 2 + topCz],  // 13
      [ sd1 / 2 + tdx, -sl4 / 2 + tdy,  sw1Eff / 2 + topCz],  // 14
      [ sd1 / 2 + tdx, -sl4 / 2 + tdy, -sw1Eff / 2 + topCz],  // 15
    );

    // .NET points 16-23: bottom branch uses d, w, e, f and l3.
    const bdx = -sa / 2 + sf;
    const bdy = -sb / 2 - sl3 / 2;
    P.push(
      [-sd / 2 + bdx,  sl3 / 2 + bdy, -swEff / 2 + botCz],  // 16
      [-sd / 2 + bdx,  sl3 / 2 + bdy,  swEff / 2 + botCz],  // 17
      [-sd / 2 + bdx, -sl3 / 2 + bdy,  swEff / 2 + botCz],  // 18
      [-sd / 2 + bdx, -sl3 / 2 + bdy, -swEff / 2 + botCz],  // 19
      [ sd / 2 + bdx,  sl3 / 2 + bdy, -swEff / 2 + botCz],  // 20
      [ sd / 2 + bdx,  sl3 / 2 + bdy,  swEff / 2 + botCz],  // 21
      [ sd / 2 + bdx, -sl3 / 2 + bdy,  swEff / 2 + botCz],  // 22
      [ sd / 2 + bdx, -sl3 / 2 + bdy, -swEff / 2 + botCz],  // 23
    );

    const verts: number[] = [];
    const norms: number[] = [];
    const edgePts: number[] = [];
    const addTri = (a: number[], b: number[], c: number[], normal: number[]) => {
      verts.push(...a, ...b, ...c);
      for (let vertex = 0; vertex < 3; vertex++) norms.push(...normal);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[], normal: number[]) => {
      addTri(q0, q1, q2, normal); addTri(q0, q2, q3, normal);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    // Left wall of main duct
    addQuad(P[0], P[1], P[2], P[3], [-1, 0, 0]);
    // Top face around top‑branch hole
    addQuad(P[0], P[11], P[15], P[4], [0, 1, 0]);
    addQuad(P[1], P[10], P[11], P[0], [0, 1, 0]);
    addQuad(P[5], P[14], P[10], P[1], [0, 1, 0]);
    addQuad(P[4], P[15], P[14], P[5], [0, 1, 0]);
    // Right wall of main duct
    addQuad(P[4], P[5], P[6], P[7], [1, 0, 0]);
    // Bottom face around bottom‑branch hole
    addQuad(P[3], P[16], P[20], P[7], [0, -1, 0]);
    addQuad(P[2], P[17], P[16], P[3], [0, -1, 0]);
    addQuad(P[6], P[21], P[17], P[2], [0, -1, 0]);
    addQuad(P[7], P[20], P[21], P[6], [0, -1, 0]);
    // Bottom branch walls (4 sides)
    addQuad(P[16], P[17], P[18], P[19], [-1, 0, 0]);
    addQuad(P[17], P[21], P[22], P[18], [0, 0, 1]);
    addQuad(P[21], P[20], P[23], P[22], [1, 0, 0]);
    addQuad(P[20], P[16], P[19], P[23], [0, 0, -1]);
    // Top branch walls (4 sides)
    addQuad(P[8], P[9], P[10], P[11], [-1, 0, 0]);
    addQuad(P[9], P[13], P[14], P[10], [0, 0, 1]);
    addQuad(P[13], P[12], P[15], P[14], [1, 0, 0]);
    addQuad(P[12], P[8], P[11], P[15], [0, 0, -1]);

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rawGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // The hand-authored per-face normals were an inconsistent mix — some agreeing
    // with their triangle winding, some opposing — so the cross-junction lit
    // unevenly and, on the agreeing faces, flat and cold under side:DoubleSide.
    // Re-derive from the winding and flip into QBa's uniform opposing convention.
    // The weld keeps every box corner crisp (differing normals never fuse).
    const geo = applyStandardShading(rawGeo);

    // Edge wireframe
    // Main duct
    seg(P[0], P[1]); seg(P[1], P[2]); seg(P[2], P[3]); seg(P[3], P[0]);
    seg(P[4], P[5]); seg(P[5], P[6]); seg(P[6], P[7]); seg(P[7], P[4]);
    seg(P[0], P[4]); seg(P[1], P[5]); seg(P[2], P[6]); seg(P[3], P[7]);
    // Top branch
    seg(P[8], P[9]); seg(P[9], P[13]); seg(P[13], P[12]); seg(P[12], P[8]);
    seg(P[11], P[10]); seg(P[10], P[14]); seg(P[14], P[15]); seg(P[15], P[11]);
    seg(P[8], P[11]); seg(P[9], P[10]); seg(P[12], P[15]); seg(P[13], P[14]);
    // Bottom branch
    seg(P[16], P[17]); seg(P[17], P[21]); seg(P[21], P[20]); seg(P[20], P[16]);
    seg(P[19], P[18]); seg(P[18], P[22]); seg(P[22], P[23]); seg(P[23], P[19]);
    seg(P[16], P[19]); seg(P[17], P[18]); seg(P[20], P[23]); seg(P[21], P[22]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, sw, sL, sd1, sw1, se, se1, sf1, sf, sl3, sl4]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* CZ1a dimension labels */
const CZ1aLabels: React.FC<{
  a: number; b: number; d: number; w: number; L: number;
  d1: number; w1: number; l3: number; l4: number;
}> = ({ a, b, L, l3, l4 }) => {
  const maxDim = Math.max(a, b, L, l3, l4, 1);
  const sc = 2 / maxDim;
  const sb = b * sc, sL = L * sc, sl3 = l3 * sc, sl4 = l4 * sc;

  return (
    <>
      <Billboard position={[0, 0, -sL / 2 - 0.15]}>
        <Text fontSize={0.11} color="#004290" anchorX="center" anchorY="middle">{`a×b = ${Math.round(a)}×${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, sL / 2 + 0.15]}>
        <Text fontSize={0.10} color="#888888" anchorX="center" anchorY="middle">{`L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[0, sb / 2 + sl4 + 0.12, 0]}>
        <Text fontSize={0.09} color="#004290" anchorX="center" anchorY="bottom">{`l4 = ${Math.round(l4)}`}</Text>
      </Billboard>
      <Billboard position={[0, -sb / 2 - sl3 - 0.12, 0]}>
        <Text fontSize={0.09} color="#004290" anchorX="center" anchorY="top">{`l3 = ${Math.round(l3)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== CZ2a — Cross-junction with round branches ===== */
const CZ2aMesh: React.FC<{
  a: number; b: number; d: number; d1: number; L: number; l3: number; l4: number;
}> = ({ a, b, d, d1, L, l3, l4 }) => {
  const maxDim = Math.max(a, b, d, d1, L, l3, l4, 1);
  const sc = 2 / maxDim;
  const sa = a * sc, sb = b * sc, sd = d * sc, sd1 = d1 * sc;
  const sL = L * sc, sl3 = l3 * sc, sl4 = l4 * sc;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const segments = 64;
    const N = segments + 1;

    const circleAngle = (i: number) => (330 * Math.PI / 180) - (i / segments) * Math.PI * 2;
    const cX = (diam: number, i: number) => Math.cos(circleAngle(i)) * diam / 2;
    const cY = (diam: number, i: number) => Math.sin(circleAngle(i)) * diam / 2;

    const makeRect = (): [number, number][] => {
      const points: [number, number][] = [];
      const halfWidth = sL / 2;
      const halfHeight = sa / 2;
      for (let i = 0; i <= segments; i++) {
        if (i <= 8) points.push([halfWidth, -(i / 8) * halfHeight]);
        else if (i <= 24) points.push([halfWidth - ((i - 8) / 16) * sL, -halfHeight]);
        else if (i <= 40) points.push([-halfWidth, -halfHeight + ((i - 24) / 16) * sa]);
        else if (i <= 56) points.push([-halfWidth + ((i - 40) / 16) * sL, halfHeight]);
        else points.push([halfWidth, halfHeight - ((i - 56) / 8) * halfHeight]);
      }
      return points;
    };
    const rect = makeRect();

    const verts: number[] = [];
    const norms: number[] = [];
    const edgePts: number[] = [];
    const addTri = (a: number[], b: number[], c: number[], na: number[], nb = na, nc = na) => {
      verts.push(...a, ...b, ...c);
      norms.push(...na, ...nb, ...nc);
    };
    const addQuad = (q0: number[], q1: number[], q2: number[], q3: number[], normal: number[]) => {
      addTri(q0, q1, q2, normal); addTri(q0, q2, q3, normal);
    };
    const seg = (A: number[], B: number[]) =>
      edgePts.push(A[0], A[1], A[2], B[0], B[1], B[2]);

    const zFront = -sb / 2;
    const zBack = sb / 2;

    // --- Front face (z = zFront): circle d → rect transition ---
    for (let i = 0; i < N - 1; i++) {
      const c0: number[] = [cX(sd, i), cY(sd, i), zFront];
      const c1: number[] = [cX(sd, i + 1), cY(sd, i + 1), zFront];
      const r0: number[] = [rect[i][0], rect[i][1], zFront];
      const r1: number[] = [rect[i + 1][0], rect[i + 1][1], zFront];
      addQuad(c0, r0, r1, c1, [0, 0, -1]);
    }

    // --- Front tube (extending from z=zFront to z=zFront-sl3) ---
    for (let i = 0; i < N - 1; i++) {
      const c0: number[] = [cX(sd, i), cY(sd, i), zFront];
      const c0e: number[] = [cX(sd, i), cY(sd, i), zFront - sl3];
      const c1: number[] = [cX(sd, i + 1), cY(sd, i + 1), zFront];
      const c1e: number[] = [cX(sd, i + 1), cY(sd, i + 1), zFront - sl3];
      const n0 = [cX(sd, i) / (sd / 2), cY(sd, i) / (sd / 2), 0];
      const n1 = [cX(sd, i + 1) / (sd / 2), cY(sd, i + 1) / (sd / 2), 0];
      addTri(c0, c0e, c1e, n0, n0, n1);
      addTri(c0, c1e, c1, n0, n1, n1);
    }

    // --- Back face (z = zBack): circle d1 → rect transition ---
    for (let i = 0; i < N - 1; i++) {
      const c0: number[] = [cX(sd1, i), cY(sd1, i), zBack];
      const c1: number[] = [cX(sd1, i + 1), cY(sd1, i + 1), zBack];
      const r0: number[] = [rect[i][0], rect[i][1], zBack];
      const r1: number[] = [rect[i + 1][0], rect[i + 1][1], zBack];
      addQuad(c0, c1, r1, r0, [0, 0, 1]);
    }

    // --- Back tube (extending from z=zBack to z=zBack+sl4) ---
    for (let i = 0; i < N - 1; i++) {
      const c0: number[] = [cX(sd1, i), cY(sd1, i), zBack];
      const c0e: number[] = [cX(sd1, i), cY(sd1, i), zBack + sl4];
      const c1: number[] = [cX(sd1, i + 1), cY(sd1, i + 1), zBack];
      const c1e: number[] = [cX(sd1, i + 1), cY(sd1, i + 1), zBack + sl4];
      const n0 = [cX(sd1, i) / (sd1 / 2), cY(sd1, i) / (sd1 / 2), 0];
      const n1 = [cX(sd1, i + 1) / (sd1 / 2), cY(sd1, i + 1) / (sd1 / 2), 0];
      addTri(c0, c1, c1e, n0, n1, n1);
      addTri(c0, c1e, c0e, n0, n1, n0);
    }

    // --- Bottom wall between the two open main-duct ends ---
    addQuad(
      [rect[24][0], rect[24][1], zFront],
      [rect[8][0], rect[8][1], zFront],
      [rect[8][0], rect[8][1], zBack],
      [rect[24][0], rect[24][1], zBack],
      [0, -1, 0],
    );

    // --- Top wall between the two open main-duct ends ---
    addQuad(
      [rect[40][0], rect[40][1], zFront],
      [rect[56][0], rect[56][1], zFront],
      [rect[56][0], rect[56][1], zBack],
      [rect[40][0], rect[40][1], zBack],
      [0, 1, 0],
    );

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rawGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // The front half (face + tube) was authored opposing its winding while the
    // back half agreed with its own — an exact 50/50 split that lit the two
    // round ends of the cross differently and, on the agreeing half, flat and
    // cold under side:DoubleSide. Re-derive from the winding and flip into QBa's
    // uniform opposing convention. The weld fuses each tube's shared radial-
    // normal verts (tubes stay smooth) but not the box walls or transitions.
    const geo = applyStandardShading(rawGeo);

    // Edge wireframe
    // Front circle
    for (let i = 0; i < N - 1; i++)
      seg([cX(sd, i), cY(sd, i), zFront], [cX(sd, i + 1), cY(sd, i + 1), zFront]);
    // Front tube end circle
    for (let i = 0; i < N - 1; i++)
      seg([cX(sd, i), cY(sd, i), zFront - sl3], [cX(sd, i + 1), cY(sd, i + 1), zFront - sl3]);
    // Back circle
    for (let i = 0; i < N - 1; i++)
      seg([cX(sd1, i), cY(sd1, i), zBack], [cX(sd1, i + 1), cY(sd1, i + 1), zBack]);
    // Back tube end circle
    for (let i = 0; i < N - 1; i++)
      seg([cX(sd1, i), cY(sd1, i), zBack + sl4], [cX(sd1, i + 1), cY(sd1, i + 1), zBack + sl4]);
    // Front face rect outline
    for (let i = 0; i < N - 1; i++)
      seg([rect[i][0], rect[i][1], zFront], [rect[i + 1][0], rect[i + 1][1], zFront]);
    // Back face rect outline
    for (let i = 0; i < N - 1; i++)
      seg([rect[i][0], rect[i][1], zBack], [rect[i + 1][0], rect[i + 1][1], zBack]);
    // Top/bottom wall edges (connecting front↔back)
    seg([rect[8][0], rect[8][1], zFront], [rect[8][0], rect[8][1], zBack]);
    seg([rect[24][0], rect[24][1], zFront], [rect[24][0], rect[24][1], zBack]);
    seg([rect[40][0], rect[40][1], zFront], [rect[40][0], rect[40][1], zBack]);
    seg([rect[56][0], rect[56][1], zFront], [rect[56][0], rect[56][1], zBack]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, sd, sd1, sL, sl3, sl4]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#7a7e85" />
      </lineSegments>
    </group>
  );
};

/* CZ2a dimension labels */
const CZ2aLabels: React.FC<{
  a: number; b: number; d: number; d1: number; L: number; l3: number; l4: number;
}> = ({ a, b, d, d1, L, l3, l4 }) => {
  const maxDim = Math.max(a, b, d, d1, L, l3, l4, 1);
  const sc = 2 / maxDim;
  const sb = b * sc, sl3 = l3 * sc, sl4 = l4 * sc;

  return (
    <>
      <Billboard position={[0, 0, -sb / 2 - sl3 - 0.12]}>
        <Text fontSize={0.10} color="#004290" anchorX="center" anchorY="middle">{`d = ${Math.round(d)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, sb / 2 + sl4 + 0.12]}>
        <Text fontSize={0.10} color="#004290" anchorX="center" anchorY="middle">{`d1 = ${Math.round(d1)}`}</Text>
      </Billboard>
      <Billboard position={[0, 0, 0]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom"
          position={[0, 0.15, 0]}>{`a×b = ${Math.round(a)}×${Math.round(b)}  L = ${Math.round(L)}`}</Text>
      </Billboard>
      <Billboard position={[0, -0.15, -sb / 2 - sl3 / 2]}>
        <Text fontSize={0.08} color="#888888" anchorX="center" anchorY="top">{`l3 = ${Math.round(l3)}`}</Text>
      </Billboard>
      <Billboard position={[0, -0.15, sb / 2 + sl4 / 2]}>
        <Text fontSize={0.08} color="#888888" anchorX="center" anchorY="top">{`l4 = ${Math.round(l4)}`}</Text>
      </Billboard>
    </>
  );
};

/* ===== TR4a — Tee with curved branch (Trójnik z od. łukowym) =====
   A prism of depth `a`: one 2-D profile extruded along Z. The main duct runs
   vertically — top mouth `b` wide, bottom mouth `c` wide (a reducing tee) — and
   a branch `d` tall leaves the left face and sweeps up to meet it through a
   formed elbow: inner throat radius `g` about `cg`, outer radius `d` about `cd`,
   the outer run tilted by `alfa` (from the .NET `dbc`/`Acos` construction).

   Ported from the .NET app's licz_punkty()/paint "TR4a" region — the corner
   points p0…p9, the two arc centres, `pytajnik` and `alfa` all match. The old
   React port copied the .NET quad list face-by-face and collapsed into a weird
   knot; this rebuilds it as the extrusion it actually is: fill the front/back
   sheet, wall every profile edge except the three mouths. */
const TR4aMesh: React.FC<{
  a: number; b: number; c: number; d: number; L: number; g: number; i: number; j: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, L: lR, g: gR, i: iR, j: jR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry } = useMemo(() => {
    const max = Math.max(aR, bR, cR, dR, iR, jR, lR, gR, 1);
    const sa = aR / max, sb = bR / max, scc = cR / max, sd = dR / max;
    const si = iR / max, sj = jR / max, sl = lR / max, sg = Math.max(gR / max, 1e-3);

    const dbc = Math.min(1, Math.max(-1, (sb - scc + sg) / (sd + sg)));
    const alfa = Math.PI / 2 - Math.acos(dbc);
    const pyt = Math.sqrt(Math.max(0, sd * sd - (sb - scc) * (sb - scc)));

    const dxv = sj + sg + sb;
    const dyv = sl;
    const hd = sa / 2;
    const maxX = dxv / 2, minX = -dxv / 2, maxY = dyv / 2, minY = -dyv / 2;

    type P = [number, number];
    type V3 = [number, number, number];

    // Branch corner points (.NET `punkty[]`, seen on the front face)
    const p0: P = [maxX - sb,        maxY];
    const p1: P = [maxX,             maxY];
    const p2: P = [maxX,             minY];
    const p3: P = [maxX - scc,       minY];
    const p4: P = [maxX - scc,       maxY - pyt - si];
    // p5 ≡ outer-arc endpoint (straight down from cd): [minX + sj, maxY - si - sg - sd]
    const p6: P = [minX,             maxY - si - sg - sd];
    const p7: P = [minX,             maxY - si - sg];
    const p8: P = [minX + sj,        maxY - si - sg];
    // p9 ≡ inner-arc endpoint (straight right from cg): [minX + sj + sg, maxY - si]

    const cg: P = [p8[0], p8[1] + sg];   // inner throat: radius sg, p8 → p9
    const cd: P = [p8[0], p8[1]];        // outer radius:  radius sd, p5 → (θ = alfa)

    // arc points c + r·(sinθ, −cosθ); segment count scales with arc length.
    const arc = (c: P, r: number, a0: number, a1: number, skipFirst: boolean): P[] => {
      const span = Math.abs(a1 - a0);
      const segs = Math.max(20, Math.min(160, Math.round(span * r * 130)));
      const out: P[] = [];
      for (let t = skipFirst ? 1 : 0; t <= segs; t++) {
        const th = a0 + (a1 - a0) * (t / segs);
        out.push([c[0] + Math.sin(th) * r, c[1] - Math.cos(th) * r]);
      }
      return out;
    };

    // Closed profile, listed clockwise (reversed to CCW for triangulation).
    const cw: P[] = [
      p0, p1, p2, p3, p4,
      ...arc(cd, sd, alfa, 0, false),          // outer radius: p4 → (chord) → θ=alfa … θ=0 (=p5)
      p6, p7, p8,
      ...arc(cg, sg, 0, Math.PI / 2, true),    // inner throat: p8 → p9
    ];
    const contour = cw.map(([x, y]) => new THREE.Vector2(x, y)).reverse();
    const N = contour.length;

    const verts: number[] = [];
    const norms: number[] = [];
    const addTri = (A: V3, B: V3, C: V3, na: V3, nb: V3 = na, nc: V3 = na) => {
      verts.push(...A, ...B, ...C);
      norms.push(...na, ...nb, ...nc);
    };

    // Front (z = −hd) and back (z = +hd) sheet-metal faces.
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const [i0, i1, i2] of tris) {
      const A = contour[i0], B = contour[i1], C = contour[i2];
      addTri([C.x, C.y, -hd], [B.x, B.y, -hd], [A.x, A.y, -hd], [0, 0, -1]);
      addTri([A.x, A.y, hd], [B.x, B.y, hd], [C.x, C.y, hd], [0, 0, 1]);
    }

    // Per-edge outward normal + crease-aware blend (smooth curves, crisp folds).
    const eN: P[] = [];
    for (let k = 0; k < N; k++) {
      const A = contour[k], B = contour[(k + 1) % N];
      const ex = B.x - A.x, ey = B.y - A.y;
      const L = Math.hypot(ex, ey) || 1;
      eN.push([ey / L, -ex / L]);
    }
    const CREASE = Math.cos(22 * Math.PI / 180);
    const blend = (u: P, v: P): P => {
      if (u[0] * v[0] + u[1] * v[1] < CREASE) return v;
      const x = u[0] + v[0], y = u[1] + v[1], l = Math.hypot(x, y) || 1;
      return [x / l, y / l];
    };

    // Perimeter wall — every edge except the three mouths (top b, bottom c, branch d).
    const near = (u: number, v: number) => Math.abs(u - v) < 1e-4;
    for (let k = 0; k < N; k++) {
      const A = contour[k], B = contour[(k + 1) % N];
      const isTop = near(A.y, maxY) && near(B.y, maxY);
      const isBottom = near(A.y, minY) && near(B.y, minY);
      const isBranch = near(A.x, minX) && near(B.x, minX);
      if (isTop || isBottom || isBranch) continue;
      if (Math.hypot(B.x - A.x, B.y - A.y) < 1e-6) continue;
      const nA = blend(eN[(k - 1 + N) % N], eN[k]);
      const nB = blend(eN[(k + 1) % N], eN[k]);
      const nA3: V3 = [nA[0], nA[1], 0], nB3: V3 = [nB[0], nB[1], 0];
      addTri([A.x, A.y, -hd], [B.x, B.y, -hd], [B.x, B.y, hd], nA3, nB3, nB3);
      addTri([A.x, A.y, -hd], [B.x, B.y, hd], [A.x, A.y, hd], nA3, nB3, nA3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // Authored outward, flipped into QBa's opposing convention (QBFa/DuctMesh
    // trick — agreeing normals read flat and cold under side:DoubleSide). No
    // weld: the elbow walls carry crease-blended smooth normals already.
    const nArr = geo.getAttribute('normal').array as Float32Array;
    for (let n = 0; n < nArr.length; n++) nArr[n] = -nArr[n];
    geo.userData.preserveNormals = true;

    return { geometry: geo };
  }, [aR, bR, cR, dR, lR, gR, iR, jR]);

  return <mesh geometry={geometry} material={material} />;
};

/* TR4a dimension labels */
const TR4aLabels: React.FC<{
  a: number; b: number; c: number; d: number; L: number; g: number; i: number; j: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, L: lR, g: gR, i: iR, j: jR }) => {
  const max = Math.max(aR, bR, cR, dR, iR, jR, lR, gR, 1);
  const b = bR/max, d = dR/max;
  const ii = iR/max, j = jR/max, l = lR/max, g = gR/max;
  const dx = j + g + b;
  const dy = l;
  return (
    <>
      <Billboard position={[0, dy/2 + 0.12, 0]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom">
          {`b = ${Math.round(bR)}  a = ${Math.round(aR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-dx/2, dy/2 - ii - g - d/2, 0]}>
        <Text fontSize={0.08} color="#004290" anchorX="right" anchorY="middle" position={[-0.08, 0, 0]}>
          {`d = ${Math.round(dR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-dx/2 + j/2, -(dy/2) - 0.1, 0]}>
        <Text fontSize={0.07} color="#888888" anchorX="center" anchorY="top">
          {`j = ${Math.round(jR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, -(dy/2) - 0.1, 0]}>
        <Text fontSize={0.07} color="#888888" anchorX="center" anchorY="top">
          {`L = ${Math.round(lR)}`}
        </Text>
      </Billboard>
    </>
  );
};

/* ===== TR5a — Breeches / Port Tee (Trójnik portkowy) =====
   A genuine 3-D wye: one rectangular inlet (b × a, stub length j) at the +Z end
   splits into two rectangular outlets side-by-side in Y — branch c below and
   branch d above, gap g between, each e × (c|d) with stub length k — at the −Z
   end, offset h in Y and i in X (both negated, as in the .NET code). p24/p25 are
   the crotch points where the divider meets the two side skins.

   Ported face-for-face from the .NET app's licz_punkty()/paint "TR5a" region:
   3 four-wall stubs + top/bottom skins + the crotch divider + the two 7-sided
   side transition panels. The old React port guessed the connecting faces and
   collapsed into a knot. */
const TR5aMesh: React.FC<{
  a: number; b: number; c: number; d: number; e: number; L: number;
  h: number; g: number; i: number; j: number; k: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, e: eR, L: lR,
        h: hR, g: gR, i: iR, j: jR, k: kR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const geometry = useMemo(() => {
    const max = Math.max(aR, bR, cR, dR, eR, jR, kR, lR, Math.abs(hR), Math.abs(iR), gR, 1);
    const a = aR / max, b = bR / max, c = cR / max, d = dR / max, e = eR / max;
    const j = jR / max, k = kR / max, l = lR / max, g = gR / max;
    const h = -hR / max;   // .NET: h = -h
    const i = -iR / max;   // .NET: i = -i

    type V3 = [number, number, number];
    const p: V3[] = [];

    // Inlet stub (b × a), open at z = l/2 and z = l/2 − j
    p[0] = [-(b + i) / 2,     -a / 2, l / 2];
    p[1] = [-(b + i) / 2,      a / 2, l / 2];
    p[2] = [-(b + i) / 2 + b,  a / 2, l / 2];
    p[3] = [-(b + i) / 2 + b, -a / 2, l / 2];
    p[4] = [p[0][0], p[0][1], l / 2 - j];
    p[5] = [p[1][0], p[1][1], l / 2 - j];
    p[6] = [p[2][0], p[2][1], l / 2 - j];
    p[7] = [p[3][0], p[3][1], l / 2 - j];

    // Branch c stub (e × c), open at z = −l/2 and z = −l/2 + k
    const bcx0 = (b + i) / 2 - e, bcx1 = (b + i) / 2;
    const cy0 = -a / 2 + h, cy1 = -a / 2 + h + c;
    p[8]  = [bcx0, cy0, -l / 2 + k];
    p[9]  = [bcx0, cy1, -l / 2 + k];
    p[10] = [bcx1, cy1, -l / 2 + k];
    p[11] = [bcx1, cy0, -l / 2 + k];
    p[12] = [bcx0, cy0, -l / 2];
    p[13] = [bcx0, cy1, -l / 2];
    p[14] = [bcx1, cy1, -l / 2];
    p[15] = [bcx1, cy0, -l / 2];

    // Branch d stub (e × d), gap g above branch c
    const dy0 = -a / 2 + h + c + g, dy1 = dy0 + d;
    p[16] = [bcx0, dy0, -l / 2 + k];
    p[17] = [bcx0, dy1, -l / 2 + k];
    p[18] = [bcx1, dy1, -l / 2 + k];
    p[19] = [bcx1, dy0, -l / 2 + k];
    p[20] = [bcx0, dy0, -l / 2];
    p[21] = [bcx0, dy1, -l / 2];
    p[22] = [bcx1, dy1, -l / 2];
    p[23] = [bcx1, dy0, -l / 2];

    // Crotch points (divider meets the side skins)
    p[24] = [p[9][0] - (b + i - e) / 2, p[9][1] + g / 2, p[9][2] + (l - k - j) / 2];
    p[25] = [p[9][0] + e - i / 2,       p[9][1] + g / 2, p[9][2] + (l - k - j) / 2];

    const verts: number[] = [];
    const tri = (A: V3, B: V3, C: V3) => { verts.push(...A, ...B, ...C); };
    const quad = (i0: number, i1: number, i2: number, i3: number) => {
      tri(p[i0], p[i1], p[i2]); tri(p[i0], p[i2], p[i3]);
    };
    const poly = (idx: number[]) => {
      for (let n = 1; n < idx.length - 1; n++) tri(p[idx[0]], p[idx[n]], p[idx[n + 1]]);
    };

    // inlet stub — 4 walls
    quad(0, 1, 5, 4); quad(1, 2, 6, 5); quad(2, 3, 7, 6); quad(3, 0, 4, 7);
    // branch c stub — 4 walls
    quad(8, 9, 13, 12); quad(9, 10, 14, 13); quad(10, 11, 15, 14); quad(11, 8, 12, 15);
    // branch d stub — 4 walls
    quad(16, 17, 21, 20); quad(17, 18, 22, 21); quad(18, 19, 23, 22); quad(19, 16, 20, 23);
    // body — bottom skin, top skin, crotch divider (toward c, toward d)
    quad(7, 4, 8, 11); quad(5, 6, 18, 17); quad(9, 24, 25, 10); quad(24, 16, 19, 25);
    // 7-sided side transition panels (−X side, then +X side)
    poly([24, 9, 8, 4, 5, 17, 16]);
    poly([25, 10, 11, 7, 6, 18, 19]);

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    // applyStandardShading welds the shell, recomputes vertex normals and flips
    // them into QBa's opposing convention so it reads as warm sheet metal.
    return applyStandardShading(rawGeo);
  }, [aR, bR, cR, dR, eR, lR, hR, gR, iR, jR, kR]);

  return <mesh geometry={geometry} material={material} />;
};

/* TR5a dimension labels */
const TR5aLabels: React.FC<{
  a: number; b: number; c: number; d: number; e: number; L: number;
  h: number; g: number; i: number; j: number; k: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, e: eR, L: lR, h: hR, g: gR, i: iR, j: jR, k: kR }) => {
  const max = Math.max(aR, bR, cR, dR, eR, jR, kR, lR, Math.abs(hR), Math.abs(iR), gR, 1);
  const a = aR/max, b = bR/max, l = lR/max;
  const i = -iR/max;
  return (
    <>
      <Billboard position={[-(b+i)/2, a/2 + 0.1, l/2]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom">
          {`a = ${Math.round(aR)}  b = ${Math.round(bR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, 0, l/2 + 0.1]}>
        <Text fontSize={0.08} color="#888888" anchorX="center" anchorY="middle">
          {`L = ${Math.round(lR)}`}
        </Text>
      </Billboard>
    </>
  );
};

/* ===== TR3a — Eagle Tee (Trójnik Orłowy) =====
   A prism of depth `a`: one 2-D profile extruded along Z. Three rectangular
   mouths — top (b wide), left branch (d tall, m long) and right branch
   (c tall, i long) — joined through two formed elbows whose throat radii are
   g (left) and f (right). Like the .NET form, the mouths are plain open ends —
   no flanges.

   Ported from the .NET app's licz_punkty()/paint "TR3a" region: the branch
   corner points p0…p12 are the .NET `punkty[]`, and the elbow centres and radii
   match. The one deliberate change is the outer bottom skin — .NET sweeps each
   outer radius a fixed ~45° and papers over the gap with a fan of fudge
   polygons, which is what made the old React port (a face-by-face copy of those
   quads) self-intersect. Here the two outer arcs are swept to the true
   intersection of their circles (the "beak"), so the profile closes on its own
   and every arc joins its neighbour tangentially.

   The four formed runs (two inner throat fillets, two outer radii) are sampled
   densely — segment count scales with arc length — so the rounded areas read as
   real curved sheet rather than a coarse polygon. */
const TR3aMesh: React.FC<{
  a: number; b: number; c: number; d: number;
  m: number; k: number; i: number; j: number;
  g: number; f: number;
}> = ({ a, b, c, d, m, k, i: iVal, j, g, f }) => {
  const maxDim = Math.max(a, b, c, d, m, k, iVal, j, g, f, m + g + b + f + iVal, 1);
  const sc = 2 / maxDim;

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry } = useMemo(() => {
    const sa = a * sc, sb = b * sc, scc = c * sc, sd = d * sc;
    const sm = m * sc, sk = k * sc, si = iVal * sc, sj = j * sc;
    const sg = Math.max(g * sc, 1e-3), sf = Math.max(f * sc, 1e-3);

    const dxv = sm + sg + sb + sf + si;
    const dyv = Math.max(sd + sg + sk, scc + sf + sj);
    const hd = sa / 2;                        // half depth (Z)
    const maxY = dyv / 2, minX = -dxv / 2, maxX = dxv / 2;

    type P = [number, number];
    type V3 = [number, number, number];

    // Branch corner points (.NET `punkty[]`, seen on the front face)
    const p0: P  = [maxX - sb - sf - si, maxY];
    const p1: P  = [maxX - sf - si,      maxY];
    const p2: P  = [maxX - sf - si,      maxY - sj];
    const p3: P  = [maxX - si,           maxY - sj - sf];
    const p4: P  = [maxX,                maxY - sj - sf];
    const p5: P  = [maxX,                maxY - sj - sf - scc];
    const p6: P  = [maxX - si,           maxY - sj - sf - scc];
    const p9: P  = [minX,                maxY - sk - sg - sd];
    const p10: P = [minX,                maxY - sk - sg];
    const p11: P = [minX + sm,           maxY - sk - sg];

    // Elbow centres — each shared by its inner throat arc and its outer radius arc.
    const cl: P = [p11[0], p11[1] + sg];       // left  : inner r = sg, outer r = sg + sd
    const cr: P = [p3[0],  p3[1]  + sf];       // right : inner r = sf, outer r = sf + scc
    const rlo = sg + sd, rro = sf + scc;

    // "beak" — lower intersection of the two outer-radius circles.
    const beak = ((): P => {
      const vx = cr[0] - cl[0], vy = cr[1] - cl[1];
      const dist = Math.hypot(vx, vy) || 1e-6;
      const dd = Math.min(dist, rlo + rro - 1e-4);       // keep the circles intersecting
      const aa = (dd * dd + rlo * rlo - rro * rro) / (2 * dd);
      const hh = Math.sqrt(Math.max(0, rlo * rlo - aa * aa));
      const ux = vx / dist, uy = vy / dist;
      const bx = cl[0] + aa * ux, by = cl[1] + aa * uy;
      const c1: P = [bx + hh * uy, by - hh * ux];
      const c2: P = [bx - hh * uy, by + hh * ux];
      return c1[1] <= c2[1] ? c1 : c2;
    })();

    // angle of `pt` about centre `c`, measured from straight-down (0,-1), +ve toward +x
    const ang = (c: P, pt: P) => Math.atan2(pt[0] - c[0], -(pt[1] - c[1]));
    // arc points c + r·(sinθ, −cosθ), θ: a0→a1. Segment count scales with the arc
    // length (r·span) — roughly one primitive per 0.0075 units of sheet — so even
    // the tight throat fillets carry ~90 facets and the wide outer radii ~200.
    // `skipFirst` drops the point shared with the previous run.
    const arc = (c: P, r: number, a0: number, a1: number, skipFirst: boolean): P[] => {
      const span = Math.abs(a1 - a0);
      const segs = Math.max(24, Math.min(224, Math.round(span * r * 130)));
      const out: P[] = [];
      for (let t = skipFirst ? 1 : 0; t <= segs; t++) {
        const th = a0 + (a1 - a0) * (t / segs);
        out.push([c[0] + Math.sin(th) * r, c[1] - Math.cos(th) * r]);
      }
      return out;
    };

    // Closed profile, listed clockwise (reversed to CCW for triangulation below).
    const cw: P[] = [
      p0, p1, p2,
      ...arc(cr, sf, -Math.PI / 2, 0, true),               // f fillet:  p2 → p3
      p4, p5, p6,
      ...arc(cr, rro, 0, ang(cr, beak), true),             // right outer: p6 → beak
      ...arc(cl, rlo, ang(cl, beak), 0, true),             // left outer:  beak → p8
      p9, p10, p11,
      ...arc(cl, sg, 0, Math.PI / 2, true),                // g fillet:  p11 → p12 → p0
    ];
    const contour = cw.map(([x, y]) => new THREE.Vector2(x, y)).reverse();
    const M = contour.length;

    const verts: number[] = [];
    const norms: number[] = [];
    const addTri = (A: V3, B: V3, C: V3, na: V3, nb: V3 = na, nc: V3 = na) => {
      verts.push(...A, ...B, ...C);
      norms.push(...na, ...nb, ...nc);
    };

    // Front (z = −hd) and back (z = +hd) sheet-metal faces.
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const [i0, i1, i2] of tris) {
      const A = contour[i0], B = contour[i1], C = contour[i2];
      addTri([C.x, C.y, -hd], [B.x, B.y, -hd], [A.x, A.y, -hd], [0, 0, -1]);
      addTri([A.x, A.y, hd], [B.x, B.y, hd], [C.x, C.y, hd], [0, 0, 1]);
    }

    // Per-edge outward flat normal, and a crease-aware blend so the formed runs
    // shade as one smooth curved surface while the folds between flats stay crisp.
    const eN: P[] = [];
    for (let i = 0; i < M; i++) {
      const A = contour[i], B = contour[(i + 1) % M];
      const ex = B.x - A.x, ey = B.y - A.y;
      const L = Math.hypot(ex, ey) || 1;
      eN.push([ey / L, -ex / L]);
    }
    const CREASE = Math.cos(22 * Math.PI / 180);
    const blend = (u: P, v: P): P => {
      if (u[0] * v[0] + u[1] * v[1] < CREASE) return v;   // sharp fold → keep this edge's own normal
      const x = u[0] + v[0], y = u[1] + v[1], l = Math.hypot(x, y) || 1;
      return [x / l, y / l];
    };

    // Perimeter wall — every edge except the three open mouths (top / left / right).
    const near = (u: number, v: number) => Math.abs(u - v) < 1e-4;
    for (let i = 0; i < M; i++) {
      const A = contour[i], B = contour[(i + 1) % M];
      const isTop = near(A.y, maxY) && near(B.y, maxY);
      const isLeft = near(A.x, minX) && near(B.x, minX);
      const isRight = near(A.x, maxX) && near(B.x, maxX);
      if (isTop || isLeft || isRight) continue;
      if (Math.hypot(B.x - A.x, B.y - A.y) < 1e-6) continue;
      const nA = blend(eN[(i - 1 + M) % M], eN[i]);        // smoothed normal at A
      const nB = blend(eN[(i + 1) % M], eN[i]);            // smoothed normal at B
      const nA3: V3 = [nA[0], nA[1], 0], nB3: V3 = [nB[0], nB[1], 0];
      addTri([A.x, A.y, -hd], [B.x, B.y, -hd], [B.x, B.y, hd], nA3, nB3, nB3);
      addTri([A.x, A.y, -hd], [B.x, B.y, hd], [A.x, A.y, hd], nA3, nB3, nA3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // Normals are authored pointing out of the sheet (agreeing with the winding);
    // under side:DoubleSide that reads flat and cold, so flip into QBa's opposing
    // convention — same trick as QBFa/DuctMesh. No weld: the wall runs already
    // carry crease-blended smooth normals and the flats/folds stay crisp.
    const nArr = geo.getAttribute('normal').array as Float32Array;
    for (let n = 0; n < nArr.length; n++) nArr[n] = -nArr[n];
    geo.userData.preserveNormals = true;

    return { geometry: geo };
  }, [a, b, c, d, m, k, iVal, j, g, f, sc]);

  // No wireframe overlay and no flanges — the .NET form draws only the shaded
  // sheet, so its inlets/outlets are plain open ends with no frame around them.
  return <mesh geometry={geometry} material={material} />;
};

/* TR3a dimension labels */
const TR3aLabels: React.FC<{
  a: number; b: number; c: number; d: number;
  m: number; k: number; i: number; j: number;
  g: number; f: number;
}> = ({ a, b, c, d, m, k, i: iVal, j, g, f }) => {
  const maxDim = Math.max(a, b, c, d, m, k, iVal, j, g, f, m + g + b + f + iVal, 1);
  const sc = 2 / maxDim;
  const dx = (m + g + b + f + iVal) * sc;
  const dy = Math.max((d + g + k) * sc, (c + f + j) * sc);

  return (
    <>
      <Billboard position={[0, dy / 2 + 0.15, 0]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom">
          {`b = ${Math.round(b)}  a = ${Math.round(a)}`}
        </Text>
      </Billboard>
      <Billboard position={[dx / 2, (dy / 2 - j * sc - f * sc - c * sc / 2), 0]}>
        <Text fontSize={0.08} color="#004290" anchorX="left" anchorY="middle" position={[0.08, 0, 0]}>
          {`c = ${Math.round(c)}`}
        </Text>
      </Billboard>
      <Billboard position={[-dx / 2, (dy / 2 - k * sc - g * sc - d * sc / 2), 0]}>
        <Text fontSize={0.08} color="#004290" anchorX="right" anchorY="middle" position={[-0.08, 0, 0]}>
          {`d = ${Math.round(d)}`}
        </Text>
      </Billboard>
      <Billboard position={[dx / 2 - iVal * sc / 2, -(dy / 2) - 0.12, 0]}>
        <Text fontSize={0.07} color="#888888" anchorX="center" anchorY="top">
          {`i = ${Math.round(iVal)}`}
        </Text>
      </Billboard>
      <Billboard position={[-dx / 2 + m * sc / 2, -(dy / 2) - 0.12, 0]}>
        <Text fontSize={0.07} color="#888888" anchorX="center" anchorY="top">
          {`m = ${Math.round(m)}`}
        </Text>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

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
    // Per-face normals in the same convention BendMesh (QBa) authors: each opposes
    // its own triangle winding. Under side:DoubleSide that winding-agreement — not
    // the normal's direction — is what selects the shading normal, so matching QBa
    // here is what gives the plate the same warm reflective finish instead of the
    // flat cold cast it had when normalizeGroupAppearance recomputed these to agree.
    // The four walls repeat DuctMesh's vectors; the back cap is +z (was 1,0,0 with
    // two zero vectors before).
    const normals = new Float32Array([
       0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,  0,1,0,
       0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
       1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,  1,0,0,
       0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,  0,0,1,
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
    geo.userData.preserveNormals = true;

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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const totalW = se + sb;
    const totalH = sd + sf;
    const x0 = -totalW / 2;
    const y0 = -totalH / 2;
    const cornerR = Math.max(0.001, Math.min(sr, se * 0.98, sf * 0.98));
    const arcSegments = 64;
    const halfDepth = sa / 2;
    const verts: number[] = [];
    const norms: number[] = [];
    const uvArr: number[] = [];
    const addTriangle = (p0: number[], p1: number[], p2: number[], normal: number[]) => {
      verts.push(...p0, ...p1, ...p2);
      for (let i = 0; i < 3; i++) norms.push(...normal);
      uvArr.push(0, 0, 1, 0, 1, 1);
    };
    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], normal: number[]) => {
      addTriangle(p0, p1, p2, normal);
      addTriangle(p0, p2, p3, normal);
    };

    const shape = new THREE.Shape();
    shape.moveTo(x0, y0);
    shape.lineTo(x0 + totalW, y0);
    shape.lineTo(x0 + totalW, y0 + totalH);
    shape.lineTo(x0 + se, y0 + totalH);
    shape.lineTo(x0 + se, y0 + sd + cornerR);
    const arcCX = x0 + se - cornerR;
    const arcCY = y0 + sd + cornerR;
    for (let i = 1; i <= arcSegments; i++) {
      const angle = (i / arcSegments) * (Math.PI / 2);
      shape.lineTo(arcCX + Math.cos(angle) * cornerR, arcCY - Math.sin(angle) * cornerR);
    }
    shape.lineTo(x0, y0 + sd);
    shape.closePath();

    const contour = shape.extractPoints(arcSegments).shape;
    const faceTriangles = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const [i0, i1, i2] of faceTriangles) {
      const p0 = contour[i0], p1 = contour[i1], p2 = contour[i2];
      addTriangle([p2.x, p2.y, -halfDepth], [p1.x, p1.y, -halfDepth], [p0.x, p0.y, -halfDepth], [0, 0, -1]);
      addTriangle([p0.x, p0.y, halfDepth], [p1.x, p1.y, halfDepth], [p2.x, p2.y, halfDepth], [0, 0, 1]);
    }

    for (let i = 0; i < contour.length; i++) {
      const p0 = contour[i], p1 = contour[(i + 1) % contour.length];
      const isLeftOpening = Math.abs(p0.x - x0) < 1e-6 && Math.abs(p1.x - x0) < 1e-6;
      const isBottomOpening = Math.abs(p0.y - (y0 + totalH)) < 1e-6
        && Math.abs(p1.y - (y0 + totalH)) < 1e-6;
      if (isLeftOpening || isBottomOpening) continue;
      const dx = p1.x - p0.x, dy = p1.y - p0.y;
      const length = Math.hypot(dx, dy);
      if (length < 1e-6) continue;
      addQuad(
        [p0.x, p0.y, -halfDepth], [p1.x, p1.y, -halfDepth],
        [p1.x, p1.y, halfDepth], [p0.x, p0.y, halfDepth],
        [dy / length, -dx / length, 0],
      );
    }

    // Authored pointing out of the sheet, i.e. AGREEING with the triangle winding.
    // QBa's BendMesh authors the opposite, and under side:DoubleSide that
    // winding-agreement is what selects the shading normal — so as authored this
    // elbow samples the environment from the wrong hemisphere and reads flat and
    // cold. Negate to land in QBa's family (same fix as QBFRa).
    for (let i = 0; i < norms.length; i++) norms[i] = -norms[i];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    geo.userData.preserveNormals = true;

    const eGeo = new THREE.EdgesGeometry(geo, 30);

    return { geometry: geo, edgeGeo: eGeo };
  }, [sa, sb, se, sf, sr]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo} visible={false}>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

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
    geo.userData.preserveNormals = true;

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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

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
    geo.userData.preserveNormals = true;

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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = na / 2, hh = nb / 2;
    const z0 = -nl / 2;        // front face
    const z1 = -nl / 2 + nh;   // end of front straight
    const z2 = nl / 2 - nm;    // start of rear cylinder
    const z3 = nl / 2;         // rear face
    const segments = 256;
    const transitionRings = 128;

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

    // Section 2: a curved, formed transition from the rectangular collar to the round outlet.
    const transitionPoint = (theta: number, progress: number): [number, number, number] => {
      const [rectX, rectY] = rectPoint(theta);
      const circleX = nr * Math.cos(theta);
      const circleY = nr * Math.sin(theta);
      const blend = progress * progress * (3 - 2 * progress);
      return [
        THREE.MathUtils.lerp(rectX, circleX, blend),
        THREE.MathUtils.lerp(rectY, circleY, blend),
        THREE.MathUtils.lerp(z1, z2, progress),
      ];
    };

    for (let ring = 0; ring < transitionRings; ring++) {
      const startProgress = ring / transitionRings;
      const endProgress = (ring + 1) / transitionRings;
      for (let i = 0; i < segments; i++) {
        const theta0 = (i / segments) * 2 * Math.PI;
        const theta1 = ((i + 1) / segments) * 2 * Math.PI;
        const p0t = transitionPoint(theta0, startProgress);
        const p1t = transitionPoint(theta1, startProgress);
        const p2t = transitionPoint(theta1, endProgress);
        const p3t = transitionPoint(theta0, endProgress);
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

        if (ring === 0 && (i === 0 || i === segments / 4 || i === segments / 2 || i === (3 * segments) / 4)) {
          edgePts.push(...p0t, ...transitionPoint(theta0, 1));
        }
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
    return { geometry: applyStandardShading(geo), edgeGeo: eGeo };
  }, [na, nb, nr, nl, nh, nm]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo} visible={false}>
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

  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const hw = na / 2, hh = nb / 2;
    const z0 = -nl / 2;
    const z1 = -nl / 2 + nh;
    const z2 = nl / 2 - nm;
    const z3 = nl / 2;
    const segments = 256;
    const transitionRings = 128;

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

    // Formed transition from the rectangular collar to the offset circular outlet.
    const transitionPoint = (theta: number, progress: number): [number, number, number] => {
      const [rectX, rectY] = rectPoint(theta);
      const circleX = ccx + nr * Math.cos(theta);
      const circleY = ccy + nr * Math.sin(theta);
      const blend = progress * progress * (3 - 2 * progress);
      return [
        THREE.MathUtils.lerp(rectX, circleX, blend),
        THREE.MathUtils.lerp(rectY, circleY, blend),
        THREE.MathUtils.lerp(z1, z2, progress),
      ];
    };

    for (let ring = 0; ring < transitionRings; ring++) {
      const startProgress = ring / transitionRings;
      const endProgress = (ring + 1) / transitionRings;
      for (let i = 0; i < segments; i++) {
        const theta0 = (i / segments) * 2 * Math.PI;
        const theta1 = ((i + 1) / segments) * 2 * Math.PI;
        const p0t = transitionPoint(theta0, startProgress);
        const p1t = transitionPoint(theta1, startProgress);
        const p2t = transitionPoint(theta1, endProgress);
        const p3t = transitionPoint(theta0, endProgress);
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

        if (ring === 0 && (i === 0 || i === segments / 4 || i === segments / 2 || i === (3 * segments) / 4)) {
          edgePts.push(...p0t, ...transitionPoint(theta0, 1));
        }
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
    return { geometry: applyStandardShading(geo), edgeGeo: eGeo };
  }, [na, nb, nr, nl, nh, nm, ccx, ccy]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo} visible={false}>
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

// ── QD1a — Angled rectangular duct ──
const QD1aMesh: React.FC<{
  a: number; b: number; L: number; alfa: number; e: number; f: number;
}> = ({ a: aR, b: bR, L: lR, alfa: alfaDeg, e: eR, f: fR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const max = Math.max(aR, bR, eR, fR, lR, 1);
    const a = aR / max, b = bR / max, e = eR / max, f = fR / max, l = lR / max;
    const alfaRad = alfaDeg * Math.PI / 180;
    const sinA = Math.sin(alfaRad), cosA = Math.cos(alfaRad);
    const h1 = sinA * l;
    const h2 = cosA * b;
    const b1 = b / sinA;
    const zOff = (h1 + h2) / 2;

    // plate outer corners (e × f)
    const plate: [number, number, number][] = [
      [ f/2, -e/2, zOff],  // 0
      [ f/2,  e/2, zOff],  // 1
      [-f/2,  e/2, zOff],  // 2
      [-f/2, -e/2, zOff],  // 3
    ];
    // duct opening in plate (a × b1)
    const opening: [number, number, number][] = [
      [ a/2, -b1/2, zOff], // 4
      [ a/2,  b1/2, zOff], // 5
      [-a/2,  b1/2, zOff], // 6
      [-a/2, -b1/2, zOff], // 7
    ];
    // duct far end
    const ductEnd: [number, number, number][] = [
      [ a/2, -b1/2 - cosA*l,              zOff - h1],        // 8
      [ a/2, -b1/2 - cosA*l + sinA*b,     zOff - h1 - h2],  // 9
      [-a/2, -b1/2 - cosA*l + sinA*b,     zOff - h1 - h2],  // 10
      [-a/2, -b1/2 - cosA*l,              zOff - h1],        // 11
    ];

    // Center everything
    const allPts = [...plate, ...opening, ...ductEnd];
    let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const [, py, pz] of allPts) {
      if (py < minY) minY = py; if (py > maxY) maxY = py;
      if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
    }
    const cyOff = (minY + maxY) / 2;
    const czOff = (minZ + maxZ) / 2;
    for (const pt of allPts) { pt[1] -= cyOff; pt[2] -= czOff; }

    // .NET QD1a uses exactly 8 quads (0-3 -> 4-7 and 4-7 -> 8-11).
    const quads: [number, number, number, number][] = [
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
      [4, 5, 9, 8],
      [5, 6, 10, 9],
      [6, 7, 11, 10],
      [7, 4, 8, 11],
    ];

    // Per-quad flat normals in QBa's convention (each opposes its own winding).
    // These panels only share the four opening-edge corners, and the mounting
    // plate meets the angled duct there at a sharp fold — welding those verts and
    // running computeVertexNormals() averages the plate's ±z with the duct-wall
    // direction and turns half the shell inside-out. Authoring per-face and
    // marking preserveNormals keeps every panel crisp and correctly lit.
    const verts: number[] = [];
    const norms: number[] = [];
    for (const [q0, q1, q2, q3] of quads) {
      const A = allPts[q0], B = allPts[q1], C = allPts[q2], D = allPts[q3];
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
      const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      const n: [number, number, number] = [-nx / nl, -ny / nl, -nz / nl];
      verts.push(...A, ...B, ...C, ...A, ...C, ...D);
      for (let k = 0; k < 6; k++) norms.push(...n);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.userData.preserveNormals = true;

    // Edges
    const edgePts: number[] = [];
    const addEdge = (p1: [number, number, number], p2: [number, number, number]) => {
      edgePts.push(...p1, ...p2);
    };
    // Plate outer edges
    for (let i = 0; i < 4; i++) addEdge(allPts[i], allPts[(i+1)%4]);
    // Opening edges
    for (let i = 4; i < 8; i++) addEdge(allPts[i], allPts[i === 7 ? 4 : i+1]);
    // Duct body edges
    for (let i = 8; i < 12; i++) addEdge(allPts[i], allPts[i === 11 ? 8 : i+1]);
    // Connecting plate to opening
    for (let i = 0; i < 4; i++) addEdge(allPts[i], allPts[i+4]);
    // Connecting opening to duct end
    for (let i = 4; i < 8; i++) addEdge(allPts[i], allPts[i+4]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [aR, bR, lR, alfaDeg, eR, fR]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#222222" linewidth={1} />
      </lineSegments>
    </group>
  );
};

const QD1aLabels: React.FC<{
  a: number; b: number; L: number; alfa: number; e: number; f: number;
}> = ({ a: aR, b: bR, L: lR, alfa: alfaDeg, e: eR, f: fR }) => {
  const max = Math.max(aR, bR, eR, fR, lR, 1);
  const a = aR/max, b = bR/max, e = eR/max, f = fR/max, l = lR/max;
  const alfaRad = alfaDeg * Math.PI / 180;
  const sinA = Math.sin(alfaRad), cosA = Math.cos(alfaRad);
  const h1 = sinA * l;
  const h2 = cosA * b;
  const b1 = b / sinA;
  const zOff = (h1 + h2) / 2;

  const pts: [number, number, number][] = [
    [ f/2, -e/2, zOff], [ f/2, e/2, zOff], [-f/2, e/2, zOff], [-f/2, -e/2, zOff],
    [ a/2, -b1/2, zOff], [ a/2, b1/2, zOff], [-a/2, b1/2, zOff], [-a/2, -b1/2, zOff],
    [ a/2, -b1/2-cosA*l, zOff-h1], [ a/2, -b1/2-cosA*l+sinA*b, zOff-h1-h2],
    [-a/2, -b1/2-cosA*l+sinA*b, zOff-h1-h2], [-a/2, -b1/2-cosA*l, zOff-h1],
  ];
  let minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [, py, pz] of pts) {
    if (py < minY) minY = py; if (py > maxY) maxY = py;
    if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
  }
  const cyOff = (minY + maxY) / 2;
  const czOff = (minZ + maxZ) / 2;
  for (const pt of pts) { pt[1] -= cyOff; pt[2] -= czOff; }

  const topCy = (pts[0][1] + pts[1][1]) / 2;
  const topCz = pts[0][2];
  const botCy = (pts[8][1] + pts[9][1] + pts[10][1] + pts[11][1]) / 4;
  const botCz = (pts[8][2] + pts[9][2]) / 2;
  const midLY = (pts[4][1] + pts[8][1]) / 2;
  const midLZ = (pts[4][2] + pts[8][2]) / 2;
  const midAY = (pts[7][1] + pts[11][1]) / 2;
  const midAZ = (pts[7][2] + pts[11][2]) / 2;

  return (
    <>
      <Billboard position={[0, topCy, topCz + 0.12]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom">
          {`e = ${Math.round(eR)}  f = ${Math.round(fR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, botCy - 0.12, botCz]}>
        <Text fontSize={0.09} color="#004290" anchorX="center" anchorY="top">
          {`a = ${Math.round(aR)}  b = ${Math.round(bR)}`}
        </Text>
      </Billboard>
      <Billboard position={[a/2 + 0.12, midLY, midLZ]}>
        <Text fontSize={0.08} color="#333333" anchorX="left" anchorY="middle">
          {`L = ${Math.round(lR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-a/2 - 0.12, midAY, midAZ]}>
        <Text fontSize={0.08} color="#333333" anchorX="right" anchorY="middle">
          {`α = ${Math.round(alfaDeg)}°`}
        </Text>
      </Billboard>
    </>
  );
};

// ── QD2a — Perpendicular rectangular duct ──
const QD2aMesh: React.FC<{
  a: number; b: number; L: number; e: number; f: number;
}> = ({ a: aR, b: bR, L: lR, e: eR, f: fR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const max = Math.max(aR, bR, eR, fR, lR, 1);
    const a = aR / max, b = bR / max, e = eR / max, f = fR / max, l = lR / max;

    // 12 vertices: 0-3 top face (f×e at z=+l/2), 4-7 transition (a×b at z=+l/2), 8-11 bottom (a×b at z=-l/2)
    const pts: [number, number, number][] = [
      [ f/2, -e/2,  l/2],   // 0
      [ f/2,  e/2,  l/2],   // 1
      [-f/2,  e/2,  l/2],   // 2
      [-f/2, -e/2,  l/2],   // 3
      [ a/2, -b/2,  l/2],   // 4
      [ a/2,  b/2,  l/2],   // 5
      [-a/2,  b/2,  l/2],   // 6
      [-a/2, -b/2,  l/2],   // 7
      [ a/2, -b/2, -l/2],   // 8
      [ a/2,  b/2, -l/2],   // 9
      [-a/2,  b/2, -l/2],   // 10
      [-a/2, -b/2, -l/2],   // 11
    ];

    const quads: [number, number, number, number][] = [
      [0,1,5,4], [1,2,6,5], [2,3,7,6], [3,0,4,7],
      [4,5,9,8], [5,6,10,9], [6,7,11,10], [7,4,8,11],
    ];
    // Per-quad flat normals in QBa's convention (each opposes its own winding).
    // Like QD1a, welding this shell (mergeVertices collapses it to 12 shared
    // corners) makes computeVertexNormals() average the coplanar top frame with
    // the perpendicular duct walls and flip half of it inside-out. Author
    // per-face and mark preserveNormals so every panel stays crisp.
    const verts: number[] = [];
    const norms: number[] = [];
    for (const [q0, q1, q2, q3] of quads) {
      const A = pts[q0], B = pts[q1], C = pts[q2], D = pts[q3];
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
      const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      const n: [number, number, number] = [-nx / nl, -ny / nl, -nz / nl];
      verts.push(...A, ...B, ...C, ...A, ...C, ...D);
      for (let k = 0; k < 6; k++) norms.push(...n);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.userData.preserveNormals = true;

    const edgePts: number[] = [];
    const addEdge = (i: number, j: number) => { edgePts.push(...pts[i], ...pts[j]); };
    addEdge(0,1); addEdge(1,2); addEdge(2,3); addEdge(3,0);
    addEdge(4,5); addEdge(5,6); addEdge(6,7); addEdge(7,4);
    addEdge(8,9); addEdge(9,10); addEdge(10,11); addEdge(11,8);
    addEdge(0,4); addEdge(1,5); addEdge(2,6); addEdge(3,7);
    addEdge(4,8); addEdge(5,9); addEdge(6,10); addEdge(7,11);
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [aR, bR, lR, eR, fR]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#222222" linewidth={1} />
      </lineSegments>
    </group>
  );
};

const QD2aLabels: React.FC<{
  a: number; b: number; L: number; e: number; f: number;
}> = ({ a: aR, b: bR, L: lR, e: eR, f: fR }) => {
  const max = Math.max(aR, bR, eR, fR, lR, 1);
  const a = aR/max, l = lR/max;

  return (
    <>
      <Billboard position={[0, 0, l/2 + 0.12]}>
        <Text fontSize={0.09} color="#888888" anchorX="center" anchorY="bottom">
          {`e = ${Math.round(eR)}  f = ${Math.round(fR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, 0, -l/2 - 0.12]}>
        <Text fontSize={0.09} color="#004290" anchorX="center" anchorY="top">
          {`a = ${Math.round(aR)}  b = ${Math.round(bR)}`}
        </Text>
      </Billboard>
      <Billboard position={[a/2 + 0.12, 0, 0]}>
        <Text fontSize={0.08} color="#333333" anchorX="left" anchorY="middle">
          {`L = ${Math.round(lR)}`}
        </Text>
      </Billboard>
    </>
  );
};

// ── TR7a — Skew tee (Trójnik skośny) ──
const TR7aMesh: React.FC<{
  a: number; b: number; d: number; h: number; e: number;
  r: number; q: number; i: number; j: number; p: number;
}> = ({ a: aR, b: bR, d: dR, h: hR, e: eR, r: rR, q: qR, i: iR, j: jR, p: pR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    const max = Math.max(aR, bR, dR, hR, eR, rR, qR, iR, jR, pR, 1);
    const a = aR/max, b = bR/max, d = dR/max, h = hR/max, e = eR/max;
    const r = rR/max, q = qR/max, ii = iR/max, j = jR/max, p = pR/max;

    const dx = p + r + b + e;
    const dy = ii + r + h + q + j;

    // 24 main vertices (0-11 at z=-a/2, 12-23 at z=+a/2)
    const pts: Record<number, [number, number, number]> = {};
    // Front face (z = -a/2)
    pts[0]  = [-dx/2 + p + q,       dy/2,               -a/2];
    pts[1]  = [-dx/2 + p + q + d,   dy/2,               -a/2];
    pts[2]  = [-dx/2 + p + q + d,   dy/2 - j,           -a/2];
    pts[3]  = [ dx/2 - e,           -dy/2 + ii,          -a/2];
    pts[4]  = [ dx/2 - e,           -dy/2,               -a/2];
    pts[5]  = [ dx/2 - e - b,       -dy/2,               -a/2];
    pts[6]  = [ dx/2 - e - b,       -dy/2 + ii,          -a/2];
    pts[7]  = [ dx/2 - e - b - r,   -dy/2 + ii + r,      -a/2];
    pts[8]  = [-dx/2,               -dy/2 + ii + r,      -a/2];
    pts[9]  = [-dx/2,               -dy/2 + ii + r + h,  -a/2];
    pts[10] = [-dx/2 + p,           -dy/2 + ii + r + h,  -a/2];
    pts[11] = [-dx/2 + p + q,       -dy/2 + ii + r + h + q, -a/2];
    // Back face (z = +a/2)
    for (let n = 0; n <= 11; n++) {
      pts[12 + n] = [pts[n][0], pts[n][1], a/2];
    }
    // Helper vertices for fill quads
    pts[30] = [pts[0][0],  pts[10][1], -a/2];
    pts[31] = [pts[0][0],  pts[10][1],  a/2];
    pts[32] = [pts[6][0],  pts[7][1],  -a/2];
    pts[33] = [pts[6][0],  pts[7][1],   a/2];

    // Arc vertices (r-radius between pts 7→6→18→19, q-radius between pts 10→11→23→22)
    const ARC_STEPS = 5;
    for (let n = 0; n < ARC_STEPS; n++) {
      const ang = 15.0 * (n + 1) * Math.PI / 180;
      const rdx = Math.sin(ang) * r;
      const rdy = Math.cos(ang) * r;
      pts[40 + n] = [pts[7][0] + rdx, pts[7][1] - r + rdy, a/2];
      pts[50 + n] = [pts[7][0] + rdx, pts[7][1] - r + rdy, -a/2];
    }
    for (let n = 0; n < ARC_STEPS; n++) {
      const ang = 15.0 * (n + 1) * Math.PI / 180;
      const qdx = Math.sin(ang) * q;
      const qdy = q - Math.cos(ang) * q;
      pts[45 + n] = [pts[10][0] + qdx, pts[10][1] + qdy, a/2];
      pts[55 + n] = [pts[10][0] + qdx, pts[10][1] + qdy, -a/2];
    }

    // Quads from C# GL code
    const quads: [number, number, number, number][] = [
      // Horizontal duct walls (8→9→10→7 region)
      [8, 9, 10, 7], [9, 21, 22, 10], [21, 20, 19, 22], [20, 8, 7, 19],
      // Top branch walls (0→1→2→11)
      [0, 1, 2, 11], [1, 13, 14, 2], [13, 12, 23, 14], [12, 0, 11, 23],
      // Bottom branch walls (6→3→4→5)
      [6, 3, 4, 5], [3, 15, 16, 4], [15, 18, 17, 16], [18, 6, 5, 17],
      // Diagonal connecting wall (between branch and horizontal)
      [3, 2, 14, 15],
    ];

    // Interior fill quads (two sets for z=+a/2 and z=-a/2)
    const fillQuadsFront: [number, number, number, number][] = [
      [32, 6, 3, 2], [32, 2, 11, 30], [32, 30, 10, 7],
    ];

    const verts: number[] = [];
    const addQuad = (a0: number, a1: number, a2: number, a3: number) => {
      verts.push(...pts[a0], ...pts[a1], ...pts[a2], ...pts[a0], ...pts[a2], ...pts[a3]);
    };
    for (const [q0, q1, q2, q3] of quads) addQuad(q0, q1, q2, q3);

    // Fill quads at z=+a/2 (using pts with z=a/2 i.e. pts[33].z)
    for (const [q0, q1, q2, q3] of fillQuadsFront) {
      const p0: [number,number,number] = [pts[q0][0], pts[q0][1], a/2];
      const p1: [number,number,number] = [pts[q1][0], pts[q1][1], a/2];
      const p2: [number,number,number] = [pts[q2][0], pts[q2][1], a/2];
      const p3: [number,number,number] = [pts[q3][0], pts[q3][1], a/2];
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    }
    // Fill quads at z=-a/2
    for (const [q0, q1, q2, q3] of fillQuadsFront) {
      const p0: [number,number,number] = [pts[q0][0], pts[q0][1], -a/2];
      const p1: [number,number,number] = [pts[q1][0], pts[q1][1], -a/2];
      const p2: [number,number,number] = [pts[q2][0], pts[q2][1], -a/2];
      const p3: [number,number,number] = [pts[q3][0], pts[q3][1], -a/2];
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    }

    // Radius arc quads (r-radius: 7 segments between pt 7→18/6)
    const rArcFront = [7, 50, 51, 52, 53, 54, 6];
    const rArcBack  = [19, 40, 41, 42, 43, 44, 18];
    for (let n = 0; n < rArcFront.length - 1; n++) {
      addQuad(rArcFront[n], rArcBack[n], rArcBack[n+1], rArcFront[n+1]);
    }
    // q-radius arc quads (q-radius: 7 segments between pt 10→11/23→22)
    const qArcFront = [10, 55, 56, 57, 58, 59, 11];
    const qArcBack  = [22, 45, 46, 47, 48, 49, 23];
    for (let n = 0; n < qArcFront.length - 1; n++) {
      addQuad(qArcFront[n], qArcBack[n], qArcBack[n+1], qArcFront[n+1]);
    }

    // Triangle fans filling arc regions at z=±a/2
    const addTri = (v0: [number,number,number], v1: [number,number,number], v2: [number,number,number]) => {
      verts.push(...v0, ...v1, ...v2);
    };
    // R-arc fan at z=+a/2 (center=pt33, sequence: 7,40,41,42,43,44,18→6 mapped to back z)
    const rFanBack = [7, 40, 41, 42, 43, 44, 6];
    for (let n = 0; n < rFanBack.length - 1; n++) {
      addTri(
        [pts[rFanBack[n]][0], pts[rFanBack[n]][1], a/2],
        [pts[rFanBack[n+1]][0], pts[rFanBack[n+1]][1], a/2],
        [pts[33][0], pts[33][1], a/2]
      );
    }
    // R-arc fan at z=-a/2 (center=pt32)
    for (let n = 0; n < rFanBack.length - 1; n++) {
      addTri(
        [pts[rFanBack[n]][0], pts[rFanBack[n]][1], -a/2],
        [pts[rFanBack[n+1]][0], pts[rFanBack[n+1]][1], -a/2],
        [pts[32][0], pts[32][1], -a/2]
      );
    }
    // Q-arc fan at z=+a/2 (center=pt31, sequence: 10,45,46,47,48,49,11→23 mapped to back z)
    const qFanBack = [10, 45, 46, 47, 48, 49, 11];
    for (let n = 0; n < qFanBack.length - 1; n++) {
      addTri(
        [pts[qFanBack[n]][0], pts[qFanBack[n]][1], a/2],
        [pts[qFanBack[n+1]][0], pts[qFanBack[n+1]][1], a/2],
        [pts[31][0], pts[31][1], a/2]
      );
    }
    // Q-arc fan at z=-a/2 (center=pt30)
    for (let n = 0; n < qFanBack.length - 1; n++) {
      addTri(
        [pts[qFanBack[n]][0], pts[qFanBack[n]][1], -a/2],
        [pts[qFanBack[n+1]][0], pts[qFanBack[n+1]][1], -a/2],
        [pts[30][0], pts[30][1], -a/2]
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();

    // Edge lines
    const edgePts: number[] = [];
    const addEdge = (i0: number, i1: number) => { edgePts.push(...pts[i0], ...pts[i1]); };
    // Front face outline (z=-a/2)
    const frontLoop = [0, 1, 2, 3, 4, 5, 6];
    for (let n = 0; n < frontLoop.length - 1; n++) addEdge(frontLoop[n], frontLoop[n+1]);
    addEdge(8, 9); addEdge(9, 10);
    addEdge(0, 11);
    // Back face outline (z=+a/2)
    const backLoop = [12, 13, 14, 15, 16, 17, 18];
    for (let n = 0; n < backLoop.length - 1; n++) addEdge(backLoop[n], backLoop[n+1]);
    addEdge(20, 21); addEdge(21, 22);
    addEdge(12, 23);
    // Connecting front-to-back edges
    for (let n = 0; n <= 11; n++) addEdge(n, n + 12);
    // R-arc edges front
    const rEdgeFront = [7, 50, 51, 52, 53, 54, 6];
    for (let n = 0; n < rEdgeFront.length - 1; n++) addEdge(rEdgeFront[n], rEdgeFront[n+1]);
    // R-arc edges back
    const rEdgeBack = [19, 40, 41, 42, 43, 44, 18];
    for (let n = 0; n < rEdgeBack.length - 1; n++) addEdge(rEdgeBack[n], rEdgeBack[n+1]);
    // Q-arc edges front
    const qEdgeFront = [10, 55, 56, 57, 58, 59, 11];
    for (let n = 0; n < qEdgeFront.length - 1; n++) addEdge(qEdgeFront[n], qEdgeFront[n+1]);
    // Q-arc edges back
    const qEdgeBack = [22, 45, 46, 47, 48, 49, 23];
    for (let n = 0; n < qEdgeBack.length - 1; n++) addEdge(qEdgeBack[n], qEdgeBack[n+1]);
    // Horizontal duct edges
    addEdge(7, 8); addEdge(19, 20);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [aR, bR, dR, hR, eR, rR, qR, iR, jR, pR]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#222222" linewidth={1} />
      </lineSegments>
    </group>
  );
};

const TR7aLabels: React.FC<{
  a: number; b: number; d: number; h: number; e: number;
  r: number; q: number; i: number; j: number; p: number;
}> = ({ a: aR, b: bR, d: dR, h: hR, e: eR, r: rR, q: qR, i: iR, j: jR, p: pR }) => {
  const max = Math.max(aR, bR, dR, hR, eR, rR, qR, iR, jR, pR, 1);
  const a = aR/max, b = bR/max, d = dR/max, h = hR/max, e = eR/max;
  const r = rR/max, q = qR/max, ii = iR/max, j = jR/max, p = pR/max;
  const dx = p + r + b + e;
  const dy = ii + r + h + q + j;

  // Branch top center
  const brTopX = (-dx/2 + p + q + d/2);
  const brTopY = dy/2;
  // Horizontal duct center
  const hDuctX = -dx/2 + p/2;
  const hDuctY = -dy/2 + ii + r + h/2;
  // Bottom branch center
  const bBrX = dx/2 - e - b/2;
  const bBrY = -dy/2 + ii/2;

  return (
    <>
      <Billboard position={[brTopX, brTopY + 0.1, 0]}>
        <Text fontSize={0.07} color="#004290" anchorX="center" anchorY="bottom">
          {`d=${Math.round(dR)} j=${Math.round(jR)}`}
        </Text>
      </Billboard>
      <Billboard position={[hDuctX - 0.15, hDuctY, 0]}>
        <Text fontSize={0.07} color="#333333" anchorX="right" anchorY="middle">
          {`h=${Math.round(hR)} p=${Math.round(pR)}`}
        </Text>
      </Billboard>
      <Billboard position={[bBrX, bBrY - 0.1, 0]}>
        <Text fontSize={0.07} color="#333333" anchorX="center" anchorY="top">
          {`b=${Math.round(bR)} i=${Math.round(iR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, 0, a/2 + 0.1]}>
        <Text fontSize={0.07} color="#888888" anchorX="center" anchorY="bottom">
          {`a=${Math.round(aR)} e=${Math.round(eR)}`}
        </Text>
      </Billboard>
      <Billboard position={[dx/2 - e - b - r/2, -dy/2 + ii + r/2, 0]}>
        <Text fontSize={0.06} color="#666" anchorX="center" anchorY="middle">
          {`r=${Math.round(rR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-dx/2 + p + q/2, -dy/2 + ii + r + h + q/2, 0]}>
        <Text fontSize={0.06} color="#666" anchorX="center" anchorY="middle">
          {`q=${Math.round(qR)}`}
        </Text>
      </Billboard>
    </>
  );
};

// ── TR9a — Coaxial skew tee with round branch — strict 1:1 C# port ──
const TR9aMesh: React.FC<{
  a: number; b: number; c: number; d: number; d1: number;
  l: number; l3: number; m: number; n: number; e: number; f: number; i: number; j: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, d1: d1R, l: lR, l3: l3R, m: mR, n: nR, e: eR, f: fR, i: iR, j: jR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    // ── C# normalization (Form1.cs lines 5083-5100) ──
    let max = Math.max(aR, bR);
    max = Math.max(max, lR);
    max = Math.max(max, cR);
    max = Math.max(max, dR + l3R);
    if (max === 0) max = 1;

    const a = aR / max, b = bR / max, c = cR / max, d = dR / max;
    let d1 = d1R / max;
    const l = lR / max, l3 = l3R / max, m = mR / max, n = nR / max;
    const e = eR / max, f = fR / max, i = iR / max, j = jR / max;

    // ── C# alfa, w1 (line 5102) ──
    const alfa = Math.atan((c - a + m) / (l - i - j));
    const w1 = Math.cos(alfa) * d1;

    // ── punkty[0..7]: Main duct vertices (lines 5104-5134) ──
    // punkty[dim, index]: dim 0=x, 1=y, 2=z
    const p: [number, number, number][] = [];

    // Front face 0-3 (c×b at z=l/2-j)
    p[0] = [-c / 2, b / 2, l / 2 - j];
    p[1] = [c / 2, b / 2, l / 2 - j];
    p[2] = [c / 2, -b / 2, l / 2 - j];
    p[3] = [-c / 2, -b / 2, l / 2 - j];

    // Back face 4-7 (a×d at z=-l/2+i)
    const nnn = -n / 2 - (d - b) / 2;
    const xx_back = c / 2 - a / 2 + m;
    p[4] = [-a / 2 + xx_back, d / 2 - nnn, -l / 2 + i];
    p[5] = [a / 2 + xx_back, d / 2 - nnn, -l / 2 + i];
    p[6] = [a / 2 + xx_back, -d / 2 - nnn, -l / 2 + i];
    p[7] = [-a / 2 + xx_back, -d / 2 - nnn, -l / 2 + i];

    // ── Branch rect vertices 8-15 (lines 5136-5170) ──
    // C#: xx = punkty[1, 4] - f + d1/2.0;
    const xx = p[4][1] - f + d1 / 2;
    // C#: double yy = punkty[2, 0] - e - i;
    const yy = p[0][2] - e - i;
    // C#: double dd = e - w1 / 2.0;
    const dd = e - w1 / 2;

    p[8]  = [p[0][0] + Math.tan(alfa) * dd - Math.cos(alfa) * l3, xx, yy + w1 / 2 - Math.sin(alfa) * l3];
    p[9]  = [p[0][0] + Math.tan(alfa) * dd, xx, yy + w1 / 2];
    p[10] = [p[0][0] + Math.tan(alfa) * dd, xx - d1, yy + w1 / 2];
    p[11] = [p[0][0] + Math.tan(alfa) * dd - Math.cos(alfa) * l3, xx - d1, yy + w1 / 2 - Math.sin(alfa) * l3];

    p[12] = [p[8][0] + Math.sin(alfa) * d1, xx, yy - w1 / 2 - Math.sin(alfa) * l3];
    p[13] = [p[9][0] + Math.sin(alfa) * d1, xx, yy - w1 / 2];
    p[14] = [p[9][0] + Math.sin(alfa) * d1, xx - d1, yy - w1 / 2];
    p[15] = [p[8][0] + Math.sin(alfa) * d1, xx - d1, yy - w1 / 2 - Math.sin(alfa) * l3];

    // ── Flanges 16-23 (line 5173-5178) ──
    for (let ii = 0; ii < 8; ii++) {
      p[16 + ii] = [p[ii][0], p[ii][1], p[ii][2] + (ii < 4 ? j : -i)];
    }

    // ── Circular branch profile (lines 5180-5205) ──
    // C#: dx = punkty[0, 8] + (d1/2.0)*Math.Cos(alfa);
    const dx = p[8][0] + (d1 / 2) * Math.cos(alfa);
    // C#: dy = punkty[1, 13] - d1 / 2.0;
    const dy = p[13][1] - d1 / 2;
    // C#: dz = yy;
    const dz = yy;

    const ddx_l3 = Math.cos(alfa) * l3;
    const ddy_l3 = Math.sin(alfa) * l3;

    const calcDX = (y0: number, y1: number, alf: number) => (y0 - y1) * Math.tan(alf);

    // Near ring: circ[0..24], Far ring: circ2[0..24]
    const circ: [number, number, number][] = new Array(25);
    const circ2: [number, number, number][] = new Array(25);

    for (let ii = 0; ii < 25; ii++) {
      const alf = 15 * ii;
      let cx = dx;
      const cy = dy + Math.sin(alf * Math.PI / 180) * (d1 / 2);
      const cz = dz - Math.cos(alf * Math.PI / 180) * (d1 / 2);

      // C# uses punkty[1, 30 + aaa] with deferred initialization
      // For correctness, precompute the Y value for aaa
      const aaa = (ii + 18) % 25;
      const cy_aaa = dy + Math.sin(15 * aaa * Math.PI / 180) * (d1 / 2);
      cx -= calcDX(p[9][1], cy_aaa, -alfa);

      circ[ii] = [cx, cy, cz];
      circ2[ii] = [cx - ddx_l3, cy, cz - ddy_l3];
    }

    // C# mirror fix for first 12 points (line 5207-5211)
    for (let ii = 0; ii < 12; ii++) {
      circ[ii][0] = circ[24 - ii][0];
      circ2[ii][0] = circ[24 - ii][0] - ddx_l3;
    }

    // ── Bridge vertices (square-to-circle transition, lines 5213-5242) ──
    // C#: d1/=6.0;
    d1 /= 6;

    const bridge: [number, number, number][] = new Array(25);

    // C# left column 0-6: from p[9] stepping -d1 in Y
    // C# right column 12-18: from p[14] stepping +d1 in Y
    for (let ii = 0; ii < 7; ii++) {
      bridge[ii]      = [p[9][0],  p[9][1] - d1 * ii,  p[9][2]];
      bridge[ii + 12] = [p[14][0], p[14][1] + d1 * ii, p[14][2]];
    }

    // C# diagonal columns 6-12 and 18-24
    const bdx = (p[9][0] - p[13][0]) / 6;
    const bdy = (p[9][1] - p[13][1]) / 6;
    const bdz = (p[9][2] - p[13][2]) / 6;

    for (let ii = 0; ii < 7; ii++) {
      bridge[ii + 6]  = [p[10][0] - bdx * ii, p[10][1] - bdy * ii, p[10][2] - bdz * ii];
      bridge[ii + 18] = [p[13][0] + bdx * ii, p[13][1] + bdy * ii, p[13][2] + bdz * ii];
    }

    // ── Build geometry ──
    // Explicit per-face normals for the flat sheet-metal panels (so each panel
    // shades as one surface with no visible triangulation seam) and smooth
    // radial normals around the round branch sleeve — the same approach QBa uses.
    const verts: number[] = [];
    const norms: number[] = [];
    type V3 = [number, number, number];
    const sub = (u: V3, v: V3): V3 => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
    const cross = (u: V3, v: V3): V3 => [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const norm = (v: V3): V3 => {
      const L = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / L, v[1] / L, v[2] / L];
    };
    // Newell's method — robust for the slightly non-planar skew-tee panels.
    const quadNormal = (v0: V3, v1: V3, v2: V3, v3: V3): V3 => {
      const vs = [v0, v1, v2, v3];
      let nx = 0, ny = 0, nz = 0;
      for (let k = 0; k < 4; k++) {
        const c = vs[k], n = vs[(k + 1) % 4];
        nx += (c[1] - n[1]) * (c[2] + n[2]);
        ny += (c[2] - n[2]) * (c[0] + n[0]);
        nz += (c[0] - n[0]) * (c[1] + n[1]);
      }
      return norm([nx, ny, nz]);
    };
    const addFlat = (v0: V3, v1: V3, v2: V3, v3: V3) => {
      const n = quadNormal(v0, v1, v2, v3);
      verts.push(...v0, ...v1, ...v2, ...v0, ...v2, ...v3);
      for (let k = 0; k < 6; k++) norms.push(...n);
    };
    const addSmooth = (v0: V3, v1: V3, v2: V3, v3: V3, n0: V3, n1: V3, n2: V3, n3: V3) => {
      verts.push(...v0, ...v1, ...v2, ...v0, ...v2, ...v3);
      norms.push(...n0, ...n1, ...n2, ...n0, ...n2, ...n3);
    };
    const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    // A large skew-tee panel is a warped (non-planar) quad. Subdivide it into a
    // bilinear patch with exact analytic normals so it shades as one smooth sheet
    // with no visible triangulation crease.
    const addPanel = (v0: V3, v1: V3, v2: V3, v3: V3, res = 8) => {
      const P = (s: number, t: number): V3 => lerp3(lerp3(v0, v1, s), lerp3(v3, v2, s), t);
      const N = (s: number, t: number): V3 => {
        const ds: V3 = [
          (1 - t) * (v1[0] - v0[0]) + t * (v2[0] - v3[0]),
          (1 - t) * (v1[1] - v0[1]) + t * (v2[1] - v3[1]),
          (1 - t) * (v1[2] - v0[2]) + t * (v2[2] - v3[2]),
        ];
        const dt: V3 = [
          (1 - s) * (v3[0] - v0[0]) + s * (v2[0] - v1[0]),
          (1 - s) * (v3[1] - v0[1]) + s * (v2[1] - v1[1]),
          (1 - s) * (v3[2] - v0[2]) + s * (v2[2] - v1[2]),
        ];
        return norm(cross(ds, dt));
      };
      for (let si = 0; si < res; si++) {
        for (let ti = 0; ti < res; ti++) {
          const s0 = si / res, s1 = (si + 1) / res, t0 = ti / res, t1 = (ti + 1) / res;
          addSmooth(
            P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1),
            N(s0, t0), N(s1, t0), N(s1, t1), N(s0, t1),
          );
        }
      }
    };

    // Main duct walls (C# GL quads lines 489-544)
    addPanel(p[0], p[4], p[5], p[1]);   // top wall
    addPanel(p[1], p[5], p[6], p[2]);   // right wall
    addPanel(p[2], p[6], p[7], p[3]);   // bottom wall
    // End cap walls with branch opening (lines 531-544)
    addPanel(p[3], p[0], p[9], p[10]);  // front-to-branch top
    addPanel(p[7], p[3], p[10], p[14]); // bottom-to-branch
    addPanel(p[4], p[7], p[14], p[13]); // back-to-branch
    addPanel(p[0], p[4], p[13], p[9]);  // left-to-branch

    // Front flanges 0-3 → 16-19 (lines 547-566)
    addFlat(p[0], p[1], p[17], p[16]);
    addFlat(p[1], p[2], p[18], p[17]);
    addFlat(p[2], p[3], p[19], p[18]);
    addFlat(p[3], p[0], p[16], p[19]);

    // Back flanges 4-7 → 20-23 (lines 568-596)
    addFlat(p[5], p[4], p[20], p[21]);
    addFlat(p[4], p[7], p[23], p[20]);
    addFlat(p[7], p[6], p[22], p[23]);
    addFlat(p[6], p[5], p[21], p[22]);

    // Smooth the legacy 24-sided branch profile into a 96-sided sleeve while
    // retaining its exact square-to-round transition at the connection ring.
    const BRANCH_SEGMENTS = 96;
    const interpolateRing = (ring: V3[], position: number): V3 => {
      const base = Math.floor(position);
      const t = position - base;
      const sample = (offset: number) => ring[(base + offset + 24) % 24];
      const previous = sample(-1);
      const current = sample(0);
      const next = sample(1);
      const afterNext = sample(2);
      const t2 = t * t;
      const t3 = t2 * t;
      const spline = (p0: number, p1: number, p2: number, p3: number) => 0.5 * (
        2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
      return [
        spline(previous[0], current[0], next[0], afterNext[0]),
        spline(previous[1], current[1], next[1], afterNext[1]),
        spline(previous[2], current[2], next[2], afterNext[2]),
      ];
    };
    // Ring centre, for orienting the sleeve normals outward.
    const ringCentre: V3 = [0, 0, 0];
    for (let ii = 0; ii < 24; ii++) { ringCentre[0] += circ[ii][0]; ringCentre[1] += circ[ii][1]; ringCentre[2] += circ[ii][2]; }
    ringCentre[0] /= 24; ringCentre[1] /= 24; ringCentre[2] /= 24;
    const sleeveNormal = (pos: number): V3 => {
      const a = interpolateRing(circ, pos);
      const ahead = interpolateRing(circ, pos + 0.05);
      const behind = interpolateRing(circ, pos - 0.05);
      const axis = sub(interpolateRing(circ2, pos), a);
      let n = norm(cross(sub(ahead, behind), axis));
      if ((n[0] * (a[0] - ringCentre[0]) + n[1] * (a[1] - ringCentre[1]) + n[2] * (a[2] - ringCentre[2])) < 0) {
        n = [-n[0], -n[1], -n[2]];
      }
      return n;
    };

    for (let ii = 0; ii < BRANCH_SEGMENTS; ii++) {
      const cur = ii * 24 / BRANCH_SEGMENTS;
      const nxt = (ii + 1) * 24 / BRANCH_SEGMENTS;
      const nCur = sleeveNormal(cur);
      const nNxt = sleeveNormal(nxt);
      addSmooth(
        interpolateRing(circ, cur),
        interpolateRing(circ, nxt),
        interpolateRing(circ2, nxt),
        interpolateRing(circ2, cur),
        nCur, nNxt, nNxt, nCur,
      );
    }

    // Square-to-circle transition (lines 615-632)
    const at = [16, 17, 18, 19, 20, 21, 22, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    for (let ii = 0; ii < 24; ii++) {
      const ac = at[ii] + 1;
      const ad = at[ii];
      addFlat(circ[ii], circ[ii + 1], bridge[ac], bridge[ad]);
    }

    const rawGeo = new THREE.BufferGeometry();
    rawGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    rawGeo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    // The panel/flange normals agreed with their winding while the branch sleeve
    // (oriented outward from its ring centre) opposed its own — a 944/205 split
    // that lit the skew-tee unevenly and, on the agreeing majority, flat and cold.
    // Re-derive from the winding and flip into QBa's uniform opposing convention.
    // The panels are subdivided 8×8 so the recomputed normals track the original
    // bilinear-patch ones; the weld fuses each smooth run (panel interior, sleeve)
    // but not the folds between walls or the flange edges.
    const geo = applyStandardShading(rawGeo);

    // ── Edge lines ──
    const edgePts: number[] = [];
    const addE = (p0: [number,number,number], p1: [number,number,number]) => { edgePts.push(...p0, ...p1); };
    // Front face
    addE(p[0], p[1]); addE(p[1], p[2]); addE(p[2], p[3]); addE(p[3], p[0]);
    // Back face
    addE(p[4], p[5]); addE(p[5], p[6]); addE(p[6], p[7]); addE(p[7], p[4]);
    // Connecting walls
    addE(p[0], p[4]); addE(p[1], p[5]); addE(p[2], p[6]); addE(p[3], p[7]);
    // Branch opening on duct wall
    addE(p[9], p[0]); addE(p[10], p[3]); addE(p[13], p[4]); addE(p[14], p[7]);
    // Flanges front
    addE(p[16], p[17]); addE(p[17], p[18]); addE(p[18], p[19]); addE(p[19], p[16]);
    addE(p[0], p[16]); addE(p[1], p[17]); addE(p[2], p[18]); addE(p[3], p[19]);
    // Flanges back
    addE(p[20], p[21]); addE(p[21], p[22]); addE(p[22], p[23]); addE(p[23], p[20]);
    addE(p[4], p[20]); addE(p[5], p[21]); addE(p[6], p[22]); addE(p[7], p[23]);
    // Near circle outline
    for (let ii = 0; ii < 24; ii++) addE(circ[ii], circ[ii + 1]);
    // Far circle outline
    for (let ii = 0; ii < 24; ii++) addE(circ2[ii], circ2[ii + 1]);
    // Branch axial lines
    addE(circ[0], circ2[0]); addE(circ[6], circ2[6]);
    addE(circ[12], circ2[12]); addE(circ[18], circ2[18]);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [aR, bR, cR, dR, d1R, lR, l3R, mR, nR, eR, fR, iR, jR]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      {!HIDE_POLYGON_CONNECTION_LINES && (
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial color="#7a7e85" linewidth={1} />
        </lineSegments>
      )}
    </group>
  );
};

const TR9aLabels: React.FC<{
  a: number; b: number; c: number; d: number; d1: number;
  l: number; l3: number; m: number; n: number; e: number; f: number; i: number; j: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, d1: d1R, l: lR, l3: _l3R, m: mR, n: nR, e: _eR, f: _fR, i: iR, j: jR }) => {
  let max = Math.max(aR, bR);
  max = Math.max(max, lR);
  max = Math.max(max, cR);
  max = Math.max(max, dR + _l3R);
  if (max === 0) max = 1;
  const b = bR / max, c = cR / max, d = dR / max, l = lR / max, i = iR / max, j = jR / max;

  return (
    <>
      <Billboard position={[0, b / 2 + 0.08, l / 2 - j]}>
        <Text fontSize={0.06} color="#004290" anchorX="center" anchorY="bottom">
          {`c=${Math.round(cR)}×b=${Math.round(bR)}`}
        </Text>
      </Billboard>
      <Billboard position={[c / 2 - aR / (2 * max) + mR / max, d / 2 + nR / (2 * max) + (d - b) / 2 + 0.08, -l / 2 + i]}>
        <Text fontSize={0.06} color="#004290" anchorX="center" anchorY="bottom">
          {`a=${Math.round(aR)}×d=${Math.round(dR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, 0, 0]}>
        <Text fontSize={0.055} color="#333333" anchorX="center" anchorY="middle">
          {`l=${Math.round(lR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-c / 2 - 0.1, 0, 0]}>
        <Text fontSize={0.05} color="#666" anchorX="right" anchorY="middle">
          {`d1=${Math.round(d1R)}`}
        </Text>
      </Billboard>
    </>
  );
};

// ── TR8a — Coaxial skew tee (Trójnik sk.współosiowy) ──
const TR8aMesh: React.FC<{
  a: number; b: number; c: number; d: number; w: number; g: number;
  l: number; l3: number; m: number; n: number; e: number; f: number; i: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, w: wR, g: gR, l: lR, l3: l3R, m: mR, n: nR, e: eR, f: fR, i: iR }) => {
  const material = useMemo(() => makeStandardMetalMaterial(), []);

  const { geometry, edgeGeo } = useMemo(() => {
    // C# max: max(a,b,l,c,d+l3)
    const maxV = Math.max(aR, bR, lR, cR, dR + l3R, 1);
    const a = aR/maxV, b = bR/maxV, c = cR/maxV, d = dR/maxV, w = wR/maxV, g = gR/maxV;
    const l = lR/maxV, l3 = l3R/maxV, m = mR/maxV, n = nR/maxV, e = eR/maxV, f = fR/maxV, i = iR/maxV;

    const alfa = Math.atan((c - a + m) / (l - i - i));
    const w1 = Math.cos(alfa) * w;

    const pts: [number, number, number][] = [];
    // Front face 0-3 (c×b at z=l/2-i)
    pts[0] = [-c/2, b/2, l/2 - i];
    pts[1] = [c/2, b/2, l/2 - i];
    pts[2] = [c/2, -b/2, l/2 - i];
    pts[3] = [-c/2, -b/2, l/2 - i];

    // Back face 4-7 (a×d at z=-l/2+i, offset by xx and nnn)
    const nnn = -n/2 - (d - b)/2;
    const xx = c/2 - a/2 + m;
    pts[4] = [-a/2 + xx, d/2 - nnn, -l/2 + i];
    pts[5] = [a/2 + xx, d/2 - nnn, -l/2 + i];
    pts[6] = [a/2 + xx, -d/2 - nnn, -l/2 + i];
    pts[7] = [-a/2 + xx, -d/2 - nnn, -l/2 + i];

    // Branch vertices 8-15
    const bxx = pts[4][1] - f + g/2;
    const byy = pts[0][2] - e + i;
    const bdd = e - w1/2;

    pts[8] = [pts[0][0] + Math.tan(alfa)*bdd - Math.cos(alfa)*l3, bxx, byy + w1/2 - Math.sin(alfa)*l3];
    pts[9] = [pts[0][0] + Math.tan(alfa)*bdd, bxx, byy + w1/2];
    pts[10] = [pts[0][0] + Math.tan(alfa)*bdd, bxx - g, byy + w1/2];
    pts[11] = [pts[0][0] + Math.tan(alfa)*bdd - Math.cos(alfa)*l3, bxx - g, byy + w1/2 - Math.sin(alfa)*l3];

    pts[12] = [pts[8][0] + Math.sin(alfa)*w, bxx, byy - w1/2 - Math.sin(alfa)*l3];
    pts[13] = [pts[9][0] + Math.sin(alfa)*w, bxx, byy - w1/2];
    pts[14] = [pts[9][0] + Math.sin(alfa)*w, bxx - g, byy - w1/2];
    pts[15] = [pts[8][0] + Math.sin(alfa)*w, bxx - g, byy - w1/2 - Math.sin(alfa)*l3];

    // Flange copies 16-23
    for (let ii = 0; ii < 8; ii++) {
      pts[16 + ii] = [pts[ii][0], pts[ii][1], pts[ii][2] + (ii < 4 ? i : -i)];
    }

    const verts: number[] = [];
    const addQuad = (a0: number, a1: number, a2: number, a3: number) => {
      verts.push(...pts[a0], ...pts[a1], ...pts[a2], ...pts[a0], ...pts[a2], ...pts[a3]);
    };

    // Main duct walls
    addQuad(0, 4, 5, 1);
    addQuad(1, 5, 6, 2);
    addQuad(2, 6, 7, 3);
    // End cap walls connecting main duct to branch openings
    addQuad(3, 0, 9, 10);
    addQuad(7, 3, 10, 14);
    addQuad(4, 7, 14, 13);
    addQuad(0, 4, 13, 9);
    // Branch inner walls
    addQuad(9, 13, 12, 8);
    addQuad(13, 14, 15, 12);
    addQuad(14, 10, 11, 15);
    addQuad(10, 9, 8, 11);
    // Front flanges (0-3 → 16-19)
    addQuad(0, 1, 17, 16);
    addQuad(1, 2, 18, 17);
    addQuad(2, 3, 19, 18);
    addQuad(3, 0, 16, 19);
    // Back flanges (4-7 → 20-23)
    addQuad(5, 4, 20, 21);
    addQuad(4, 7, 23, 20);
    addQuad(7, 6, 22, 23);
    addQuad(6, 5, 21, 22);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();

    // Edge lines
    const edgePts: number[] = [];
    const addEdge = (i0: number, i1: number) => { edgePts.push(...pts[i0], ...pts[i1]); };
    // Front face
    addEdge(0, 1); addEdge(1, 2); addEdge(2, 3); addEdge(3, 0);
    // Back face
    addEdge(4, 5); addEdge(5, 6); addEdge(6, 7); addEdge(7, 4);
    // Connecting main duct
    addEdge(0, 4); addEdge(1, 5); addEdge(2, 6); addEdge(3, 7);
    // Branch outer
    addEdge(8, 9); addEdge(9, 10); addEdge(10, 11); addEdge(11, 8);
    addEdge(12, 13); addEdge(13, 14); addEdge(14, 15); addEdge(15, 12);
    addEdge(8, 12); addEdge(9, 13); addEdge(10, 14); addEdge(11, 15);
    // End caps (branch openings on duct wall)
    addEdge(9, 0); addEdge(10, 3); addEdge(13, 4); addEdge(14, 7);
    // Flanges front
    addEdge(16, 17); addEdge(17, 18); addEdge(18, 19); addEdge(19, 16);
    addEdge(0, 16); addEdge(1, 17); addEdge(2, 18); addEdge(3, 19);
    // Flanges back
    addEdge(20, 21); addEdge(21, 22); addEdge(22, 23); addEdge(23, 20);
    addEdge(4, 20); addEdge(5, 21); addEdge(6, 22); addEdge(7, 23);

    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));

    return { geometry: geo, edgeGeo: eGeo };
  }, [aR, bR, cR, dR, wR, gR, lR, l3R, mR, nR, eR, fR, iR]);

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#222222" linewidth={1} />
      </lineSegments>
    </group>
  );
};

const TR8aLabels: React.FC<{
  a: number; b: number; c: number; d: number; w: number; g: number;
  l: number; l3: number; m: number; n: number; e: number; f: number; i: number;
}> = ({ a: aR, b: bR, c: cR, d: dR, w: wR, g: gR, l: lR, l3: l3R, m: mR, n: nR, e: _eR, f: _fR, i: iR }) => {
  const maxV = Math.max(aR, bR, lR, cR, dR + l3R, 1);
  const a = aR/maxV, b = bR/maxV, c = cR/maxV, d = dR/maxV, l = lR/maxV, i = iR/maxV;

  return (
    <>
      <Billboard position={[0, b/2 + 0.08, l/2 - i]}>
        <Text fontSize={0.06} color="#004290" anchorX="center" anchorY="bottom">
          {`c=${Math.round(cR)}×b=${Math.round(bR)}`}
        </Text>
      </Billboard>
      <Billboard position={[c/2 - a/2 + mR/maxV, d/2 + nR/maxV/2 + (d-b)/2/1 + 0.08, -l/2 + i]}>
        <Text fontSize={0.06} color="#004290" anchorX="center" anchorY="bottom">
          {`a=${Math.round(aR)}×d=${Math.round(dR)}`}
        </Text>
      </Billboard>
      <Billboard position={[0, 0, 0]}>
        <Text fontSize={0.055} color="#333333" anchorX="center" anchorY="middle">
          {`l=${Math.round(lR)}`}
        </Text>
      </Billboard>
      <Billboard position={[-c/2 - 0.1, 0, 0]}>
        <Text fontSize={0.05} color="#666" anchorX="right" anchorY="middle">
          {`w=${Math.round(wR)} g=${Math.round(gR)}`}
        </Text>
      </Billboard>
    </>
  );
};

/* Force continuous rendering — prevents canvas from going blank */
const KeepAlive = () => {
  useFrame(() => {
    // no-op: keeps the R3F render loop active
  });
  return null;
};

/* DEV-only: expose the live scene for automated visual inspection (Playwright).
   Compiled out of production builds. */
const SceneDebug = () => {
  const { scene } = useThree();
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __r3fScene?: unknown }).__r3fScene = scene;
  }, [scene]);
  return null;
};

const SUPPORTED_3D = ['QDa', 'QBa', 'QBNa', 'QPR6a', 'QPR2a', 'PR1a', 'PR7a', 'QBRa', 'QBR1a', 'QBFRa', 'QBFa', 'QESa', 'TR1a', 'TR2a', 'TRa', 'QPR3a', 'QPR4a', 'TR6a', 'CZ1a', 'CZ2a', 'TR3a', 'TR4a', 'TR5a', 'QD1a', 'QD2a', 'TR7a', 'TR8a', 'TR9a'];

const ShapeDiagram3D: React.FC<ShapeDiagram3DProps> = ({ symbol, values, t = (text) => text }) => {
  const groupRef = useRef<THREE.Group>(null);
  const modalGroupRef = useRef<THREE.Group>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Child meshes/geometries are (re)built in their own useMemo hooks and can
    // commit a frame after this effect on the first render for a symbol. Running
    // the appearance pass again on the next few frames makes the very first
    // render match what you'd otherwise only get on a second click.
    const run = () => {
      normalizeGroupAppearance(groupRef.current);
      normalizeGroupAppearance(modalGroupRef.current);
    };
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      run();
      // react-three-fiber may attach the freshly-built child meshes/lines a few
      // frames after this effect fires. Keep re-applying for a short window so
      // the first render lands on the same result as a re-selection.
      if (performance.now() - start < 900) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [symbol, values, showDimensions, expanded]);

  if (!SUPPORTED_3D.includes(symbol)) {
    return (
      <div className="shape-3d-container">
        <div className="shape-3d-header">
          <span className="shape-3d-title">{t('Widok 3D')}</span>
        </div>
        <div className="shape-3d-placeholder">{t('Widok 3D niedostępny dla tego kształtu')}</div>
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
          const tf  = values[6] || (a / 2);
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
          const tf  = values[6] || (a / 2);
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
        // QPR3a — symmetric offset
        if (symbol === 'QPR3a') {
          const e_val = values[2] || 100;
          const tL  = values[3] || 500;
          const m_val = values[4] || 80;
          const h_val = values[5] || 80;
          return (
            <>
              <QPR3aMesh a={a} b={b} e={e_val} L={tL} m={m_val} h={h_val} />
              {showDimensions && <QPR3aLabels a={a} b={b} e={e_val} L={tL} m={m_val} h={h_val} />}
            </>
          );
        }
        // QPR4a — asymmetric offset
        if (symbol === 'QPR4a') {
          const d_val = values[2] || 150;
          const e_val = values[3] || 100;
          const tL  = values[4] || 500;
          const m_val = values[5] || 80;
          const h_val = values[6] || 80;
          return (
            <>
              <QPR4aMesh a={a} b={b} d={d_val} e={e_val} L={tL} m={m_val} h={h_val} />
              {showDimensions && <QPR4aLabels a={a} b={b} d={d_val} e={e_val} L={tL} m={m_val} h={h_val} />}
            </>
          );
        }
        // TR6a — pipe saddle
        if (symbol === 'TR6a') {
          const a_val = values[0] || 300;
          const e_val = values[1] || 150;
          const f_val = values[2] || 100;
          const tL    = values[3] || 500;
          const g_val = values[4] || 80;
          return (
            <>
              <TR6aMesh a={a_val} e={e_val} f={f_val} L={tL} g={g_val} />
              {showDimensions && <TR6aLabels a={a_val} e={e_val} f={f_val} L={tL} g={g_val} />}
            </>
          );
        }
        // CZ1a — cross-junction with rectangular branches
        if (symbol === 'CZ1a') {
          // Defaults mirror the .NET app's built-in CZ1a sample (Form1.cs): a symmetric
          // czwórnik with small rectangular branches centred on each face. The old
          // fallbacks made every branch as wide as the duct and shoved it f = a off the
          // left face, so each branch hung half off the duct's edge and the top/bottom
          // face panels folded through themselves.
          const d_val  = values[2] || 70;
          const w_val  = values[3] || 90;
          const tL     = values[4] || 500;
          const d1_val = values[5] || 70;
          const w1_val = values[6] || 90;
          const e1_val = values[7] || 250;
          const f1_val = values[8] || 110;
          const e_val  = values[9] || 250;
          const f_val  = values[10] || 110;
          const l3_val = values[11] || 80;
          const l4_val = values[12] || 80;
          return (
            <>
              <CZ1aMesh a={a} b={b} d={d_val} w={w_val} L={tL}
                d1={d1_val} w1={w1_val} e1={e1_val} f1={f1_val}
                e={e_val} f={f_val} l3={l3_val} l4={l4_val} />
              {showDimensions && <CZ1aLabels a={a} b={b} d={d_val} w={w_val} L={tL}
                d1={d1_val} w1={w1_val} l3={l3_val} l4={l4_val} />}
            </>
          );
        }
        // CZ2a — cross-junction with round branches
        if (symbol === 'CZ2a') {
          // Defaults mirror the .NET app's built-in CZ2a sample (Form1.cs): a symmetric
          // czwórnik with small round branches centred on each end face. The old
          // fallbacks made each branch d = a (as tall as the duct cross-section), so the
          // circle→rectangle end transition collapsed to zero width top and bottom.
          const d_val  = values[2] || 70;
          const tL     = values[3] || 500;
          const d1_val = values[4] || 70;
          const l3_val = values[9] || 80;
          const l4_val = values[10] || 80;
          return (
            <>
              <CZ2aMesh a={a} b={b} d={d_val} d1={d1_val} L={tL} l3={l3_val} l4={l4_val} />
              {showDimensions && <CZ2aLabels a={a} b={b} d={d_val} d1={d1_val} L={tL} l3={l3_val} l4={l4_val} />}
            </>
          );
        }
        // TR3a — eagle tee
        if (symbol === 'TR3a') {
          // Defaults mirror the .NET app's built-in TR3a sample (Form1.cs).
          const a_val = values[0] || 500;
          const b_val = values[1] || 300;
          const c_val = values[2] || 300;
          const d_val = values[3] || 200;
          const m_val = values[4] || 100;
          const k_val = values[5] || 100;
          const i_val = values[6] || 100;
          const j_val = values[7] || 100;
          const g_val = values[8] || 150;
          const f_val = values[9] || 150;
          return (
            <>
              <TR3aMesh a={a_val} b={b_val} c={c_val} d={d_val} m={m_val} k={k_val}
                i={i_val} j={j_val} g={g_val} f={f_val} />
              {showDimensions && <TR3aLabels a={a_val} b={b_val} c={c_val} d={d_val} m={m_val} k={k_val}
                i={i_val} j={j_val} g={g_val} f={f_val} />}
            </>
          );
        }
        // TR4a — tee with curved branch
        if (symbol === 'TR4a') {
          // Defaults mirror the .NET app's built-in TR4a sample (Form1.cs).
          const a_val = values[0] || 100;
          const b_val = values[1] || 300;
          const c_val = values[2] || 200;
          const d_val = values[3] || 200;
          const tL = values[4] || 550;
          const g_val = values[5] || 100;
          const i_val = values[6] || 100;
          const j_val = values[7] || 100;
          return (
            <>
              <TR4aMesh a={a_val} b={b_val} c={c_val} d={d_val} L={tL} g={g_val} i={i_val} j={j_val} />
              {showDimensions && <TR4aLabels a={a_val} b={b_val} c={c_val} d={d_val} L={tL} g={g_val} i={i_val} j={j_val} />}
            </>
          );
        }
        // TR5a — breeches / port tee
        if (symbol === 'TR5a') {
          // Defaults mirror the .NET app's built-in TR5a sample (Form1.cs) —
          // h and i are the raw (negative) textbox values; the mesh negates them.
          const a_val = values[0] || 460;
          const b_val = values[1] || 200;
          const c_val = values[2] || 100;
          const d_val = values[3] || 150;
          const e_val = values[4] || 100;
          const tL = values[5] || 300;
          const h_val = values[6] || -50;
          const g_val = values[7] || 100;
          const i_val = values[8] || -100;
          const j_val = values[9] || 50;
          const k_val = values[10] || 50;
          return (
            <>
              <TR5aMesh a={a_val} b={b_val} c={c_val} d={d_val} e={e_val} L={tL}
                h={h_val} g={g_val} i={i_val} j={j_val} k={k_val} />
              {showDimensions && <TR5aLabels a={a_val} b={b_val} c={c_val} d={d_val} e={e_val} L={tL}
                h={h_val} g={g_val} i={i_val} j={j_val} k={k_val} />}
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
      return (
        <>
          <DuctMesh a={a} b={b} l={l} />
          {showDimensions && <DimensionLabels a={a} b={b} l={l} />}
        </>
      );
    }
    // QD1a — angled rectangular duct
    if (symbol === 'QD1a') {
      const qL = values[2] || 500;
      const qAlfa = values[3] || 30;
      const qE = values[4] || (3 * b);
      const qF = values[5] || (2 * a);
      return (
        <>
          <QD1aMesh a={a} b={b} L={qL} alfa={qAlfa} e={qE} f={qF} />
          {showDimensions && <QD1aLabels a={a} b={b} L={qL} alfa={qAlfa} e={qE} f={qF} />}
        </>
      );
    }
    // QD2a — perpendicular rectangular duct
    if (symbol === 'QD2a') {
      const qL = values[2] || 150;
      const qE = values[3] || (2 * b);
      const qF = values[4] || (2 * a);
      return (
        <>
          <QD2aMesh a={a} b={b} L={qL} e={qE} f={qF} />
          {showDimensions && <QD2aLabels a={a} b={b} L={qL} e={qE} f={qF} />}
        </>
      );
    }
    // TR7a — skew tee
    if (symbol === 'TR7a') {
      const ta = values[0] || 100;
      const tb = values[1] || 300;
      const td = values[2] || 400;
      const th = values[3] || 200;
      const te = values[4] || 100;
      const tr = values[5] || 100;
      const tq = values[6] || 100;
      const ti = values[7] || 50;
      const tj = values[8] || 50;
      const tp = values[9] || 50;
      return (
        <>
          <TR7aMesh a={ta} b={tb} d={td} h={th} e={te} r={tr} q={tq} i={ti} j={tj} p={tp} />
          {showDimensions && <TR7aLabels a={ta} b={tb} d={td} h={th} e={te} r={tr} q={tq} i={ti} j={tj} p={tp} />}
        </>
      );
    }
    // TR8a — coaxial skew tee
    if (symbol === 'TR8a') {
      // C# mapping: a=tb4→v[0], b=tb6→v[3](d label), c=tb15→v[2], d=tb5→v[1](b label),
      // w=tb7→v[4], g=tb8→v[5], l=tb9→v[6], l3=tb18→v[7], m=tb20→v[8], n=tb14→v[9],
      // e=tb13→v[10], f=tb10→v[11], i=tb17→v[12]
      const ta = values[0] || 200;
      const td_cs = values[1] || 400;  // "b" in labels = d in C# 3D code
      const tc = values[2] || 400;
      const tb_cs = values[3] || 200;  // "d" in labels = b in C# 3D code
      const tw = values[4] || 200;
      const tg = values[5] || 100;
      const tl = values[6] || 500;
      const tl3 = values[7] || 100;
      const tm = values[8] || -100;
      const tn = values[9] || -150;
      const te = values[10] || Math.trunc(tl / 2);
      const tf = values[11] || Math.trunc(td_cs / 2);
      const ti = Math.max(values[12] || 30, 30);
      return (
        <>
          <TR8aMesh a={ta} b={tb_cs} c={tc} d={td_cs} w={tw} g={tg} l={tl} l3={tl3} m={tm} n={tn} e={te} f={tf} i={ti} />
          {showDimensions && <TR8aLabels a={ta} b={tb_cs} c={tc} d={td_cs} w={tw} g={tg} l={tl} l3={tl3} m={tm} n={tn} e={te} f={tf} i={ti} />}
        </>
      );
    }
    // TR9a — coaxial skew tee with round branch
    if (symbol === 'TR9a') {
      // C# 3D mapping: a=tb4→v[0], b=tb6→v[3]("d" label), c=tb15→v[2], d=tb5→v[1]("b" label),
      // d1=tb7→v[4], l=tb8→v[5], l3=tb9→v[6], m=tb18→v[7], n=tb20→v[8],
      // e=tb14→v[9], f=tb13→v[10], i=tb10→v[11], j=tb17→v[12]
      const ta = values[0] || 400;
      const td_cs = values[1] || 400;  // "b" label = d in C# 3D code
      const tc = values[2] || 250;
      const tb_cs = values[3] || 250;  // "d" label = b in C# 3D code
      const td1 = values[4] || 200;
      const tl = values[5] || 600;
      const tl3 = values[6] || 100;
      const tm = values[7] || 0;
      const tn = values[8] || 0;
      const te = values[9] || Math.trunc(tl / 2);
      const tf = values[10] || Math.trunc(td_cs / 2);
      const ti = Math.max(values[11] || 30, 30);
      const tj = Math.max(values[12] || 30, 30);
      return (
        <>
          <TR9aMesh a={ta} b={tb_cs} c={tc} d={td_cs} d1={td1} l={tl} l3={tl3} m={tm} n={tn} e={te} f={tf} i={ti} j={tj} />
          {showDimensions && <TR9aLabels a={ta} b={tb_cs} c={tc} d={td_cs} d1={td1} l={tl} l3={tl3} m={tm} n={tn} e={te} f={tf} i={ti} j={tj} />}
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
      const bMaxDim = Math.max(a, rb, rd, re, rf, rr, rb + rr, rd + rr, 1);
      const bScale = 2 / bMaxDim;
      const bsb = rb * bScale, bsd = rd * bScale, bse = re * bScale, bsf = rf * bScale, bsr = rr * bScale;
      const bAlfaRad = (rAlfa * Math.PI) / 180;
      const eDirX = -Math.sin(bAlfaRad);
      const eDirY = Math.cos(bAlfaRad);
      const eEndIx = bsr * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndIy = bsr * Math.sin(bAlfaRad) + eDirY * bse;
      const eEndOx = (bsr + bsd) * Math.cos(bAlfaRad) + eDirX * bse;
      const eEndOy = (bsr + bsd) * Math.sin(bAlfaRad) + eDirY * bse;
      const bendBounds = [
        [bsr, 0], [bsr + bsb, 0], [bsr, -bsf], [bsr + bsb, -bsf],
        [eEndIx, eEndIy], [eEndOx, eEndOy],
      ];
      for (let i = 0; i <= 128; i++) {
        const progress = i / 128;
        const angle = progress * bAlfaRad;
        const outerRadius = bsr + bsb + (bsd - bsb) * progress;
        bendBounds.push(
          [bsr * Math.cos(angle), bsr * Math.sin(angle)],
          [outerRadius * Math.cos(angle), outerRadius * Math.sin(angle)],
        );
      }
      const minX = Math.min(...bendBounds.map(([x]) => x));
      const maxX = Math.max(...bendBounds.map(([x]) => x));
      const minY = Math.min(...bendBounds.map(([, y]) => y));
      const maxY = Math.max(...bendBounds.map(([, y]) => y));
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
    const bendAlfa = symbol === 'QBNa' ? (values[5] || 60) : 90;
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
        <span className="shape-3d-title">{t('Widok 3D')}</span>
        <span className="shape-3d-hint">{t('Obracaj · Scroll = zoom')}</span>
        <button className="btn-3d-expand" onClick={() => setExpanded(true)} title={t('Powiększ')}>
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
          <SceneDebug />
          <ambientLight intensity={0.5} />
          <hemisphereLight args={['#dfe6f0', '#8a909c', 0.75]} />
          <directionalLight position={[4, 5, 4]} intensity={0.65} />
          <directionalLight position={[-3, 2, -4]} intensity={0.35} />
          <directionalLight position={[0, 1, 6]} intensity={0.25} />
          <FreeControls rotateSpeed={1.5} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} />
          <group ref={groupRef}>
            {renderShapeMesh()}
          </group>
          <AutoRotate groupRef={groupRef} enabled={autoRotate} />
          <Environment preset="warehouse" />
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
          <span className="toggle-label">{t('Wymiary')}</span>
        </label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">{t('Ruch')}</span>
        </label>
      </div>
    </div>

    {/* Modal overlay with larger 3D view */}
    {expanded && (
      <div className="shape-3d-modal-overlay" onClick={() => setExpanded(false)}>
        <div className="shape-3d-modal" onClick={(e) => e.stopPropagation()}>
          <div className="shape-3d-modal-header">
            <span className="shape-3d-title">{t('Widok 3D')}</span>
            <span className="shape-3d-hint">{t('Obracaj · Scroll = zoom')}</span>
            <div className="shape-3d-toggles" style={{ margin: 0 }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                />
                <span className="toggle-slider" />
                <span className="toggle-label">{t('Wymiary')}</span>
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                />
                <span className="toggle-slider" />
                <span className="toggle-label">{t('Ruch')}</span>
              </label>
            </div>
            <button className="btn-3d-expand" onClick={() => setExpanded(false)} title={t('Zamknij')}>
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
              <ambientLight intensity={0.5} />
              <hemisphereLight args={['#dfe6f0', '#8a909c', 0.75]} />
              <directionalLight position={[4, 5, 4]} intensity={0.65} />
              <directionalLight position={[-3, 2, -4]} intensity={0.35} />
              <directionalLight position={[0, 1, 6]} intensity={0.25} />
              <FreeControls rotateSpeed={1.5} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} />
              <group ref={modalGroupRef}>
                {renderShapeMesh()}
              </group>
              <AutoRotate groupRef={modalGroupRef} enabled={autoRotate} />
              <Environment preset="warehouse" />
            </Canvas>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ShapeDiagram3D;
