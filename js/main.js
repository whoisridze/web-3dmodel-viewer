import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "https://unpkg.com/three@0.176.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("webgl"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const gridHelper = new THREE.GridHelper(20, 20, 0x404040, 0x202020);
scene.add(gridHelper);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(5, 10, 7);
scene.add(dir);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

const loader = new GLTFLoader();
const modelInfo = document.querySelector(".model-info");
const loadingIndicator = document.querySelector(".loader");
const animControls = document.getElementById("animation-controls");
let currentModel = null;
let mixer = null;
let animations = [];
let isPlaying = false;
let clock = new THREE.Clock();

const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const toggleIcon = document.querySelector(".toggle-icon");

toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  if (sidebar.classList.contains("open")) {
    toggleIcon.textContent = "▲";
  } else {
    toggleIcon.textContent = "▼";
  }
});

function loadModel(modelPath) {
  if (currentModel) {
    scene.remove(currentModel);
  }

  if (mixer) {
    mixer = null;
  }
  animations = [];
  isPlaying = false;
  updateAnimationControls();

  loadingIndicator.classList.add("visible");
  modelInfo.classList.remove("visible");
  document.getElementById("animation-controls").classList.remove("visible");

  loader.load(
    `assets/${modelPath}`,
    (gltf) => {
      currentModel = gltf.scene;
      scene.add(currentModel);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(currentModel);
        animations = gltf.animations;

        if (animations.length > 0) {
          const action = mixer.clipAction(animations[0]);
          action.play();
          isPlaying = true;
        }

        populateAnimationSelector(animations);

        setTimeout(() => {
          document
            .getElementById("animation-controls")
            .classList.add("visible");
        }, 500);
      }

      fitCameraToObject(camera, currentModel, 1.2);
      controls.target.copy(currentModel.userData.center);

      loadingIndicator.classList.remove("visible");
      setTimeout(() => {
        modelInfo.classList.add("visible");
        updateAnimationControls();
        updateModelInfo(modelPath, animations.length);
      }, 500);
    },
    undefined,
    (err) => console.error("GLTF error:", err)
  );
}

function populateAnimationSelector(animations) {
  const selector = document.getElementById("animation-selector");
  selector.innerHTML = "";

  animations.forEach((anim, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = anim.name || `Animation ${index + 1}`;
    selector.appendChild(option);
  });

  if (animations.length > 1) {
    selector.classList.remove("hidden");
  } else {
    selector.classList.add("hidden");
  }
}

function toggleAnimation() {
  if (!mixer || animations.length === 0) return;

  if (isPlaying) {
    mixer.timeScale = 0;
    isPlaying = false;
  } else {
    mixer.timeScale = 1;
    isPlaying = true;
  }

  updateAnimationControls();
}

function playAnimation(index) {
  if (!mixer || !animations[index]) return;

  mixer.stopAllAction();

  const action = mixer.clipAction(animations[index]);
  action.reset();
  action.play();
  isPlaying = true;
  updateAnimationControls();
}

function updateAnimationControls() {
  const playPauseBtn = document.getElementById("play-pause-btn");

  if (animations.length > 0) {
    document.getElementById("animation-controls").classList.remove("hidden");
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  } else {
    document.getElementById("animation-controls").classList.add("hidden");
  }
}

function updateModelInfo(modelPath, animCount) {
  const infoTitle = document.querySelector(".model-info h3");
  const infoText = document.querySelector(".model-info p");

  if (animCount > 0) {
    infoText.textContent = `This model contains ${animCount} animation${
      animCount > 1 ? "s" : ""
    }. Use the controls on the right to play/pause.`;
  } else {
    infoText.textContent =
      "Click the models in the sidebar to switch between different 3D models.";
  }
}

const modelButtons = document.querySelectorAll(".model-btn");
modelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modelButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadModel(btn.dataset.model);

    if (window.innerWidth < 768) {
      sidebar.classList.remove("open");
      toggleIcon.textContent = "▼";
    }
  });
});

document
  .getElementById("play-pause-btn")
  .addEventListener("click", toggleAnimation);
document
  .getElementById("animation-selector")
  .addEventListener("change", (e) => {
    playAnimation(parseInt(e.target.value));
  });

loadModel("model1.glb");

renderer.setAnimationLoop(() => {
  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }

  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function fitCameraToObject(cam, obj, offset = 1.25) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  obj.userData.center = center.clone();

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = cam.fov * (Math.PI / 180);
  let distance = maxDim / 2 / Math.tan(fov / 2);

  distance *= offset;
  cam.position
    .copy(center)
    .add(new THREE.Vector3(distance, distance, distance));
  cam.near = distance / 100;
  cam.far = distance * 100;
  cam.updateProjectionMatrix();
}

document.addEventListener("click", (event) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !toggleSidebarBtn.contains(event.target)
  ) {
    sidebar.classList.remove("open");
    toggleIcon.textContent = "▼";
  }
});
