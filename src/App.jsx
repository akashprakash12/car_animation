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

import { useControls } from "leva";

function Model(props) {
  const { scene, nodes, materials } = useGLTF("car.glb");
  useLayoutEffect(() => {
    Object.values(nodes).forEach(
      (node) => node.isMesh && (node.receiveShadow = node.castShadow = true)
    );
  }, [nodes, materials]);
  return <primitive object={scene} {...props} />;
}
const fragmentShader = `

varying vec2 vUv;

vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  // "Normalizing" with an arbitrary value
  // We'll see a cleaner technique later :)   
  vec2 normalizedPixel = gl_FragCoord.xy/600.0;
  vec3 color = mix(colorA, colorB, normalizedPixel.x);

  gl_FragColor = vec4(color,1.0);
}
`;
const vertexShader = `
uniform float u_time;

varying vec2 vUv;

void main() {

 vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(modelPosition.x * 4.0 + u_time * 2.0) * 0.2;
  
  // Uncomment the code and hit the refresh button below for a more complex effect 🪄
  // modelPosition.y += sin(modelPosition.z * 6.0 + u_time * 2.0) * 0.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}`;

function App() {
  const mesh = useRef();
  const hover = useRef(false);

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_intensity: {
        value: 0.3,
      },
      u_mouse: { value: new Vector2(0, 0) },
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
      <Environment preset="night" background />
      <OrbitControls />
      <ambientLight />
      <directionalLight
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <group position={[0, -1, 0]}>
        <Suspense fallback={null}>
          {/* <Butterfly position={[4, 0, 0]} rotation={[0, 1, 0]} />
            <Butterfly position={[0, 4, 0]} /> */}
          {/* <Model /> */}
          <EffectComposer smaa enableNormalPass>
            <Bloom />
            <Autofocus bokehScale={0.2} blur={0.5} focalLength={0.01} />
            <SSAO />
          </EffectComposer>
        </Suspense>
      </group>

      <mesh
        rotation={[-0.5 * Math.PI, 0, 0]}
        position={[0, -1, 0]}
        ref={mesh}
        scale={1.5}
        receiveShadow
        onPointerOver={() => (hover.current = true)}
        onPointerOut={() => (hover.current = false)}
      >
        <planeGeometry args={[50, 25, 50, 42]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe
        ></shaderMaterial>
      </mesh>
      <Stars />
    </>
  );
}

export default App;
