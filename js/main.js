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
let currentModel = null;

function loadModel(modelPath) {
  if (currentModel) {
    scene.remove(currentModel);
  }

  loadingIndicator.classList.add("visible");
  modelInfo.classList.remove("visible");

  loader.load(
    `/assets/${modelPath}`,
    (gltf) => {
      currentModel = gltf.scene;
      scene.add(currentModel);

      fitCameraToObject(camera, currentModel, 1.2);
      controls.target.copy(currentModel.userData.center);

      loadingIndicator.classList.remove("visible");
      setTimeout(() => {
        modelInfo.classList.add("visible");
      }, 500);
    },
    undefined,
    (err) => console.error("GLTF error:", err)
  );
}

const modelButtons = document.querySelectorAll(".model-btn");
modelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modelButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadModel(btn.dataset.model);
  });
});

loadModel("model123456789.glb");

renderer.setAnimationLoop(() => {
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
