import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Canvas camera={{position:[0,0,50],fov:10}}  shadows style={{ backgroundColor: "white" }}>
      <App />
    
      </Canvas>
  
  </React.StrictMode>,
)
