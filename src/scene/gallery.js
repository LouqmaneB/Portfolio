import * as THREE from "three";
import projectsData from "../projects.json";

export function createGallery(scene, r, onVideoClick) {
  const ide = new THREE.PlaneGeometry(r * 0.795, r * 0.795, 32, 32);

  const angles = projectsData.angles.map((item) => ({
    ...item,
    img: import.meta.env.BASE_URL + item.img,
  }));

  const group = new THREE.Group();

  angles.forEach((ele) => {
    const video = document.createElement("video");
    video.src = ele.img;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.play().catch((e) => console.log("Video play failed:", e));

    const texture = new THREE.VideoTexture(video);
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    const videoMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const planeGeo = ide.clone();
    const pln1 = new THREE.Mesh(planeGeo, videoMaterial);

    video.addEventListener("loadedmetadata", () => {
      const planeWidth = r * 0.795;
      const planeHeight = planeWidth * 0.6;
      pln1.scale.set(1, planeHeight / (r * 0.795), 1);
    });

    const x1 = r * Math.sin((Math.PI * ele.angl) / 180);
    const y1 = 0;
    const z1 = r * Math.cos((Math.PI * ele.angl) / 180);

    pln1.renderOrder = 1;
    pln1.position.set(x1, y1, z1);
    pln1.lookAt(0, 0, 0);

    pln1.userData = {
      link: ele.link,
      title: ele.title,
      description: ele.description,
      videoSrc: ele.img,
      basePosition: pln1.position.clone(),
      videoElement: video,
    };

    // Curve the plane
    const vertices = pln1.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const z = -Math.sqrt(Math.max(0, r * r - x * x));
      vertices.setZ(i, z);
    }
    vertices.needsUpdate = true;
    pln1.geometry.computeBoundingBox();
    pln1.geometry.center();

    group.add(pln1);
  });

  document.body.addEventListener(
    "click",
    () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((v) => v.play().catch((e) => console.log(e)));
    },
    { once: true },
  );

  scene.add(group);

  group.position.set(25, -5, -10);
  group.scale.set(1.6, 1.6, 1.6);
  group.rotation.x = -Math.PI * 0.1;
  group.rotation.z = Math.PI * -0.05;

  return { group };
}
