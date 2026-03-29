import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import {
  FOV,
  NEAR_PLANE,
  FAR_PLANE,
  DAMPING_FACTOR,
  AUTO_ROTATE_SPEED,
  GRID_SIZE,
  GRID_DIVISIONS,
  AMBIENT_LIGHT_INTENSITY,
  DIR_LIGHT_INTENSITY,
  RIM_LIGHT_INTENSITY,
} from "./config.js";

/**
 * Tests for WebGL support and returns the canvas element if available.
 * Shows a fallback message and returns null if WebGL is not supported.
 */
export function checkWebGLSupport() {
  const canvas = document.getElementById("webgl");
  const gl =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (!gl) {
    document.getElementById("webgl-fallback").classList.add("visible");
    canvas.style.display = "none";
    document.querySelector(".loader").style.display = "none";
    return null;
  }

  return canvas;
}

/**
 * Creates the Three.js scene, camera, renderer, lights, controls, and clock.
 * Attaches a resize listener to keep the viewport in sync.
 */
export function createScene(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    NEAR_PLANE,
    FAR_PLANE
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.add(new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0x404040, 0x202020));

  scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY));

  const dirLight = new THREE.DirectionalLight(0xffffff, DIR_LIGHT_INTENSITY);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, RIM_LIGHT_INTENSITY);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = DAMPING_FACTOR;
  controls.autoRotate = true;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;

  const clock = new THREE.Clock();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
  });

  return { scene, camera, renderer, controls, clock };
}
