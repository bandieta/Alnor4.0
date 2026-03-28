import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Billboard } from '@react-three/drei';
import * as THREE from 'three';

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
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
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

/* ===== QBa Bend Mesh — 90° symmetric bend ===== */
const BendMesh: React.FC<{ a: number; b: number; e: number; f: number; r: number }> = ({ a, b, e, f, r }) => {
  const maxDim = Math.max(a, b, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sa = a * scale;
  const sb = b * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;

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
    const edgePts: number[] = [];

    // Generate arc points for inner and outer radius
    const innerPts: [number, number][] = [];
    const outerPts: [number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      innerPts.push([sr * cos, sr * sin]);
      outerPts.push([(sr + sb) * cos, (sr + sb) * sin]);
    }

    // Helper: add a quad (two triangles)
    const addQuad = (p0: number[], p1: number[], p2: number[], p3: number[], n: number[]) => {
      verts.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      for (let i = 0; i < 6; i++) norms.push(...n);
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

    // Horizontal leg (left) — from x=0 to x=-sf at y=sr..sr+sb
    if (sf > 0.001) {
      // Front wall
      addQuad([0, sr, -hw], [0, sr + sb, -hw], [-sf, sr + sb, -hw], [-sf, sr, -hw], [0, 0, -1]);
      // Back wall
      addQuad([0, sr + sb, hw], [0, sr, hw], [-sf, sr, hw], [-sf, sr + sb, hw], [0, 0, 1]);
      // Inner wall (y=sr)
      addQuad([0, sr, -hw], [-sf, sr, -hw], [-sf, sr, hw], [0, sr, hw], [0, -1, 0]);
      // Outer wall (y=sr+sb)
      addQuad([-sf, sr + sb, -hw], [0, sr + sb, -hw], [0, sr + sb, hw], [-sf, sr + sb, hw], [0, 1, 0]);
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

      // Back face (z = +hw)
      verts.push(ox0, oy0, hw, ix0, iy0, hw, ix1, iy1, hw);
      verts.push(ox0, oy0, hw, ix1, iy1, hw, ox1, oy1, hw);
      for (let j = 0; j < 6; j++) norms.push(0, 0, 1);

      // Inner wall (radius = sr)
      const nix = -(ix0 + ix1) / 2 / sr;
      const niy = -(iy0 + iy1) / 2 / sr;
      verts.push(ix0, iy0, hw, ix0, iy0, -hw, ix1, iy1, -hw);
      verts.push(ix0, iy0, hw, ix1, iy1, -hw, ix1, iy1, hw);
      for (let j = 0; j < 6; j++) norms.push(nix, niy, 0);

      // Outer wall (radius = sr + sb)
      const nox = (ox0 + ox1) / 2 / (sr + sb);
      const noy = (oy0 + oy1) / 2 / (sr + sb);
      verts.push(ox0, oy0, -hw, ox0, oy0, hw, ox1, oy1, hw);
      verts.push(ox0, oy0, -hw, ox1, oy1, hw, ox1, oy1, -hw);
      for (let j = 0; j < 6; j++) norms.push(nox, noy, 0);
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
    // Left leg edges
    if (sf > 0.001) {
      edgePts.push(-sf, sr, -hw, -sf, sr + sb, -hw);
      edgePts.push(-sf, sr, hw, -sf, sr + sb, hw);
      edgePts.push(-sf, sr, -hw, -sf, sr, hw);
      edgePts.push(-sf, sr + sb, -hw, -sf, sr + sb, hw);
      edgePts.push(0, sr, -hw, -sf, sr, -hw);
      edgePts.push(0, sr + sb, -hw, -sf, sr + sb, -hw);
      edgePts.push(0, sr, hw, -sf, sr, hw);
      edgePts.push(0, sr + sb, hw, -sf, sr + sb, hw);
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

/* Bend dimension labels */
const BendDimensionLabels: React.FC<{ a: number; b: number; e: number; f: number; r: number }> = ({ a, b, e, f, r }) => {
  const maxDim = Math.max(a, b, e, f, r, b + r, 1);
  const scale = 2 / maxDim;
  const sb = b * scale;
  const se = e * scale;
  const sf = f * scale;
  const sr = r * scale;

  return (
    <>
      <Billboard position={[sr + sb / 2, -se - 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="top">{`b = ${Math.round(b)}`}</Text>
      </Billboard>
      <Billboard position={[sr + sb + 0.2, -se / 2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="left" anchorY="middle">{`e = ${Math.round(e)}`}</Text>
      </Billboard>
      <Billboard position={[-sf / 2, sr + sb + 0.2, 0]}>
        <Text fontSize={0.13} color="#004290" anchorX="center" anchorY="bottom">{`f = ${Math.round(f)}`}</Text>
      </Billboard>
      <Billboard position={[sr * 0.5, sr * 0.5, 0]}>
        <Text fontSize={0.12} color="#004290" anchorX="center" anchorY="middle">{`r = ${Math.round(r)}`}</Text>
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

const SUPPORTED_3D = ['QDa', 'QBa', 'QBNa'];

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
    // QBa / QBNa — symmetric bend
    const bendE = values[2] || 150;
    const bendF = values[3] || 150;
    const bendR = values[4] || 200;
    // Center the bend geometry: compute bounding box center
    const bMaxDim = Math.max(a, b, bendE, bendF, bendR, b + bendR, 1);
    const bScale = 2 / bMaxDim;
    const bsb = b * bScale, bse = bendE * bScale, bsf = bendF * bScale, bsr = bendR * bScale;
    const cx = (-bsf + bsr + bsb) / 2;
    const cy = (-bse + bsr + bsb) / 2;
    return (
      <group position={[-cx, -cy, 0]}>
        <BendMesh a={a} b={b} e={bendE} f={bendF} r={bendR} />
        {showDimensions && <BendDimensionLabels a={a} b={b} e={bendE} f={bendF} r={bendR} />}
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
          camera={{ position: [2.2, 1.6, 2.2], fov: 40, near: 0.1, far: 100 }}
          style={{ background: 'linear-gradient(180deg, #dfe3e8 0%, #f1f2f2 40%, #e8eaed 100%)', borderRadius: 8 }}
        >
          <KeepAlive />
          <ambientLight intensity={0.35} />
          <hemisphereLight args={['#c0c8d8', '#606878', 0.4]} />
          <directionalLight position={[4, 5, 4]} intensity={0.6} />
          <directionalLight position={[-3, 2, -4]} intensity={0.25} />
          <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.7} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} enablePan={false} />
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
              camera={{ position: [2.2, 1.6, 2.2], fov: 35, near: 0.1, far: 100 }}
              style={{ background: 'linear-gradient(180deg, #dfe3e8 0%, #f1f2f2 40%, #e8eaed 100%)', borderRadius: '0 0 8px 8px' }}
            >
              <KeepAlive />
              <ambientLight intensity={0.35} />
              <hemisphereLight args={['#c0c8d8', '#606878', 0.4]} />
              <directionalLight position={[4, 5, 4]} intensity={0.6} />
              <directionalLight position={[-3, 2, -4]} intensity={0.25} />
              <OrbitControls enableDamping dampingFactor={0.06} rotateSpeed={0.7} zoomSpeed={0.8} minDistance={1.2} maxDistance={8} enablePan={false} />
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
