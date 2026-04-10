import * as THREE from "three";

export function setupEnvironment(scene, r) {
  // Lighting System
  const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(10, 20, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x4466cc, 0.3);
  fillLight.position.set(0, -10, 0);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xffaa66, 0.5);
  rimLight.position.set(-5, 5, -15);
  scene.add(rimLight);

  const colorLight1 = new THREE.PointLight(0xff44aa, 0.3);
  colorLight1.position.set(5, 3, 8);
  scene.add(colorLight1);

  const colorLight2 = new THREE.PointLight(0x44ffaa, 0.3);
  colorLight2.position.set(-5, 2, 10);
  scene.add(colorLight2);

  // Background
  document.body.style.background = 'radial-gradient(circle at center, #0a0e2a 0%, #050510 100%)';
  
  // Starfield
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 400;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Floating Particles
  const particleCount = 600;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    particleVelocities.push({
      y: 0.002 + Math.random() * 0.005,
      x: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002
    });
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.06,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);


  // Fog
  scene.fog = new THREE.FogExp2(0x050b1a, 0.006);

  // Sun Light & Flare
  const sunLightSource = new THREE.PointLight(0xffaa66, 0.6);
  sunLightSource.position.set(30, 25, -20);
  scene.add(sunLightSource);

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.beginPath();
  ctx.arc(32, 32, 40, 0, 2 * Math.PI);
  ctx.fill();

  const flareTexture = new THREE.CanvasTexture(canvas);
  const flareMaterial = new THREE.SpriteMaterial({ map: flareTexture, blending: THREE.AdditiveBlending, transparent: true });
  const flare = new THREE.Sprite(flareMaterial);
  flare.scale.set(1.2, 1.2, 1);
  flare.position.copy(sunLightSource.position);
  scene.add(flare);


  return {
    stars,
    particles,
    particleVelocities,
    particleCount,
    colorLight1,
    colorLight2,
    rimLight,
    flare,
    sunLightSource
  };
}