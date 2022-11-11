import '../styles/global.css'

import CONFIG from './data.json'
import * as THREE from "three";

import React, {useEffect, useState} from 'react'

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createRoot } from 'react-dom/client'
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const container = document.getElementById('app-root')!
const root = createRoot(container)


const COUNT: number = 4269;
const SPEED: number = 20;

const POSITIONS: Float32Array = new Float32Array(COUNT * 3);
const COLORS: Float32Array = new Float32Array(COUNT * 3);


const Heart: React.FC = () => {
  let scale = false;

  useEffect(() => {
    const heart = document.getElementById('heart') as HTMLCanvasElement
    const scene = new THREE.Scene()
    
    const texture = new THREE.TextureLoader()
    const loadTexture = texture.load(CONFIG.TEXTURE)

    const particlesGeometry = new THREE.BufferGeometry();
    
    for (let i = 0; i < COUNT * 3; i += 3) {
      POSITIONS[i] = (Math.random() - 0.5) * 2 * 2.236;
      POSITIONS[i + 1] = 0;
      POSITIONS[i + 2] = (Math.random() - 0.5) * 1.5;

      COLORS[i] = Math.random();
      COLORS[i + 1] = Math.random();
      COLORS[i + 2] = Math.random();
    }


    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(POSITIONS, 3)
    );
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(COLORS, 3));
    
    const particlesMaterial = new THREE.PointsMaterial();
    
    particlesMaterial.size = 0.1;
    particlesMaterial.sizeAttenuation = true;
    
    setInterval(() => {
      particlesMaterial.color = new THREE.Color('#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'));
     
    }, 1000)
    
    particlesMaterial.transparent = true;
    particlesMaterial.alphaMap = loadTexture;
    particlesMaterial.depthWrite = false;
    particlesMaterial.blending = THREE.AdditiveBlending;
    particlesMaterial.vertexColors = true;
    const renderer = new THREE.WebGLRenderer({
      canvas: heart,
    });
    
    
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    setInterval(() => {
      const x = particles.scale.x
      const y = particles.scale.y
      const z = particles.scale.z
      if(scale) {
        particles.scale.set(x+0.1,y+0.1,z+0.1)
      } else {
        particles.scale.set(x-0.1,y-0.1,z-0.1)
        
      }

      scale = !scale
      
      
    }, Math.floor(Math.random()* (400 - 180) + 180))
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 1;
    bloomPass.radius = 0;
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    camera.position.z = 7;
    camera.position.y = 4;
    scene.add(camera);
    const controls = new OrbitControls(camera, heart);
    controls.enableDamping = true;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientlight);
    const clock = new THREE.Clock();  
    setInterval(() => {
      controls.autoRotateSpeed = SPEED
      if(SPEED==50) return SPEED-5
      if(SPEED<=20) return SPEED+5
     
    }, 100)
    controls.autoRotate = true
    function animate() {
      const elapsedTime = clock.getElapsedTime();
      for (let i = 0; i < COUNT; i++) {
        let i3 = i * 3;
        const X = particlesGeometry.attributes.position.array[i3];
        const A = (Math.sin(elapsedTime * 0.1) - 0.5) * 20 * 2 * Math.cos(elapsedTime * 0.2);
        const index = i3 + 1;
  
        (particlesGeometry.attributes.position.array as any[])[index] = Math.pow(Math.abs(X), 2 / 4) + 0.9 * Math.pow(5 - Math.pow(Math.abs(X), 2), 1 / 2) * Math.sin(A * Math.abs(X) - Math.tan(A))
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      controls.update();

      renderer.render(scene, camera);
      bloomComposer.render();
      window.requestAnimationFrame(animate);
    }

    (() => {
      animate()

    })()


    
    
  }, [scale])
  return (<>
    <canvas id='heart'></canvas>
    <h1 style={{
      position: 'fixed',
      bottom: '0',
      zIndex: '999',
      color: '#fff',
      padding: '10px 40px',
      fontFamily: 'sans-serif'
    }}>IT<span style={{
      color: '#ff084e'
    }}>One</span> <span style={{
      color: 'rgb(220, 220, 220)'
    }}>With Love</span></h1>
  </>)
}

root.render(<Heart/>)
