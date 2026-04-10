import * as THREE from "three";
import { OrbitControls } from "three/addons";
import { setupEnvironment } from "./scene/environment.js";
import { createGallery } from "./scene/gallery.js";
import { createModal } from "./components/modal.js";

const TRANSLATION_FILE = new URL("./lang.json", import.meta.url);
const defaultLang = "en";
let translations = {};

async function loadTranslations() {
  const response = await fetch(TRANSLATION_FILE);
  if (!response.ok) {
    console.error("Failed to load translations:", response.status, response.statusText);
    return;
  }
  translations = await response.json();

  const savedLang = localStorage.getItem("preferredLang") || defaultLang;
  const languageRadios = document.querySelectorAll('input[name="language"]');
  const translatable = document.querySelectorAll("[data-i18n-key]");
  const langSlider = document.querySelector('.lang-slider');

  function translatePage(lang) {
    if (!translations.translations[lang]) {
      lang = defaultLang;
    }

    translatable.forEach((node) => {
      const key = node.dataset.i18nKey;
      const value = translations.translations[lang]?.[key];
      if (value) {
        node.textContent = value;
      }
    });

    document.documentElement.lang = lang;
    languageRadios.forEach((radio) => {
      radio.checked = radio.value === lang;
    });
    
    updateSliderPosition(lang);
    
    localStorage.setItem("preferredLang", lang);
  }

  function updateSliderPosition(lang) {
    if (!langSlider) return;
    
    if (lang === 'de') {
      langSlider.style.transform = 'translateX(100%)';
    } else {
      langSlider.style.transform = 'translateX(0)';
    }
  }

  languageRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const newLang = event.target.value;
      translatePage(newLang);
    });
  });

  translatePage(savedLang);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(-15, 12, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x050b1a);
document.body.appendChild(renderer.domElement);

const r = 30;
const environment = setupEnvironment(scene, r);

const modal = createModal();
const { group } = createGallery(scene, r, (data, videoElement) => {
  modal.open(
    data.videoSrc,
    data.title,
    data.description,
    data.link,
    videoElement,
  );
});

loadTranslations();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;
let targetRotation = 0;

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(group.children);

  if (intersects.length > 0) {
    hovered = intersects[0].object;
  } else {
    hovered = null;
  }
});

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(group.children);

  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    const projectData = clicked.userData;
    modal.open(
      projectData.videoSrc,
      projectData.title,
      projectData.description,
      projectData.link,
      projectData.videoElement,
    );
  }
});

window.addEventListener("wheel", (event) => {
  targetRotation += event.deltaY * 0.001;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  group.rotation.y += (targetRotation - group.rotation.y) * 0.1;

  group.children.forEach((mesh) => {
    if (mesh.material) {
      mesh.material.transparent = true;

      const targetOpacity = hovered === null || mesh === hovered ? 1 : 0.4;

      mesh.material.opacity += (targetOpacity - mesh.material.opacity) * 0.1;
    }
  });

  const time = Date.now() * 0.002;

  environment.stars.rotation.y += 0.0003;
  environment.stars.rotation.x += 0.0002;

  const positions = environment.particles.geometry.attributes.position.array;
  for (let i = 0; i < environment.particleCount; i++) {
    positions[i * 3 + 1] += environment.particleVelocities[i].y;
    positions[i * 3] += environment.particleVelocities[i].x;
    positions[i * 3 + 2] += environment.particleVelocities[i].z;

    if (positions[i * 3 + 1] > 15) {
      positions[i * 3 + 1] = -15;
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
  }
  environment.particles.geometry.attributes.position.needsUpdate = true;

  environment.colorLight1.intensity = 0.25 + Math.sin(time) * 0.15;
  environment.colorLight2.intensity = 0.25 + Math.cos(time * 1.3) * 0.15;
  environment.colorLight1.position.x = 5 + Math.sin(time) * 1.5;
  environment.colorLight2.position.z = 10 + Math.cos(time * 0.8) * 2;

  environment.rimLight.intensity = 0.4 + Math.sin(time * 1.8) * 0.15;

  if (environment.flare) {
    environment.flare.lookAt(camera.position);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();