import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Color, DirectionalLightHelper, MathUtils, Vector2 } from "three";

import "./App.css";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Effects,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Stars,
  useGLTF,
  useHelper,
} from "@react-three/drei";
import Butterfly from "./Butter";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {
  Autofocus,
  Bloom,
  EffectComposer,
  SSAO,
} from "@react-three/postprocessing";
import * as THREE from 'three';
import { useControls,Leva } from "leva";

import vertexShader from "./assets/vert.js";
import fragmentShader from "./assets/frag.js";

function Model(props) {
  const { scene, nodes, materials } = useGLTF("pagani.glb");
  const { color, aNumber } = useControls({ color: "#f00"})
  const bodyMeshRef = useRef();
  const bodyMesh2Ref = useRef();

 
  useLayoutEffect(() => {
    Object.values(nodes).forEach(
      (node) =>{
        if (node.isMesh) {
          node.receiveShadow = node.castShadow = true;
        }
      }
    );

    const body = 'Object_42'; 
    const body2='Object_43'
    const bodyMesh = nodes[body];
    const bodyMesh2=nodes[body2];

    if (bodyMesh && body2) {
      const headlightMaterial = new THREE.MeshPhysicalMaterial({
        color: color,  
      });
      bodyMesh.material = headlightMaterial;
      bodyMesh2.material=headlightMaterial
      bodyMeshRef.current = bodyMesh;
      bodyMesh2Ref.current = bodyMesh2;
    }
   
  }, [nodes, materials]);
  useFrame(()=>{
     
      if (bodyMeshRef.current && bodyMesh2Ref.current) {
        const updatedColor = new THREE.Color(color);
        const updaterugn= new THREE.MeshPhysicalMaterial({
          color:updatedColor
        })
        bodyMeshRef.current.material=updaterugn
        bodyMesh2Ref.current.material=updaterugn
      }
  })
  return <primitive object={scene} {...props} />;
}

function App() {
  const mesh = useRef();
  const hover = useRef(false);
  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0,
      },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_intensity: {
        value: 0.03,
      },
      u_mouse: { value: new Vector2() },
      u_bg: {
        value: new Color("#A1A3F7"),
      },
      u_colorA: { value: new Color("#9FBAF9") },
      u_colorB: { value: new Color("#FEB3D9") },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
    mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
      mesh.current.material.uniforms.u_intensity.value,
      hover.current ? 0.85 : 0.15,
      0.02
    );
  });

  return (
    <>
      <Environment preset="forest" background />
      <OrbitControls />
      <ambientLight />
      <directionalLight
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        position={[10, 10,15]}
        intensity={1}
        castShadow
      />

      <group position={[0, -1, 0]}>
        <Suspense fallback={null}>
          {/* <Butterfly position={[4, 0, 0]} rotation={[0, 1, 0]} />
            <Butterfly position={[0, 4, 0]} /> */}
          <Model />
          <EffectComposer smaa enableNormalPass>
            <Bloom />
            <Autofocus bokehScale={0.2} blur={0.5} focalLength={0.01} />
            <SSAO />
          </EffectComposer>
        </Suspense>
      </group>

      <mesh
        rotation={[-0.5 * Math.PI, 0, 0]}
        position={[-1, -1.5, 0]}
        ref={mesh}
        scale={1.5}
        castShadow
        receiveShadow
        onPointerOver={() => (hover.current = true)}
        onPointerOut={() => (hover.current = false)}
      >
         <planeGeometry args={[25, 20,25]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        ></shaderMaterial>
      </mesh>
      <Stars />
    </>
  );
}

export default App;
