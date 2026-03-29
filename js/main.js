import { checkWebGLSupport, createScene } from "./scene.js";
import { loadModel, loadModelFromFile } from "./model-loader.js";
import {
  resetAnimations,
  setupAnimations,
  toggleAnimation,
  playAnimation,
  updateAnimation,
  getAnimations,
  getIsPlaying,
} from "./animation.js";
import {
  initSidebar,
  initModelButtons,
  initAnimationControls,
  showLoading,
  hideLoading,
  showModelInfo,
  showUserModelInfo,
  showError,
  showAnimationControls,
  updateAnimationUI,
  populateAnimationSelector,
  updateLoadingProgress,
  clearModelButtonsActive,
} from "./ui.js";
import { initFileInput } from "./file-input.js";
import { ANIMATION_FADE_DELAY } from "./config.js";

document.getElementById("year").textContent = new Date().getFullYear();

// ── WebGL gate ──────────────────────────────────────────────
const canvas = checkWebGLSupport();
if (!canvas) throw new Error("WebGL is not supported in this browser.");

// ── Scene bootstrap ─────────────────────────────────────────
const { scene, camera, renderer, controls, clock } = createScene(canvas);

// ── Error formatting ────────────────────────────────────────
function formatLoadError(error, modelPath) {
  if (error.message && error.message.includes("404")) {
    return `Model file "${modelPath}" was not found. Please check that the file exists.`;
  }
  if (error.message && error.message.includes("NetworkError")) {
    return "Network error occurred. Please check your connection and try again.";
  }
  if (error.message && error.message.includes("Unexpected token")) {
    return `Model file "${modelPath}" appears to be corrupted or invalid.`;
  }
  return `Failed to load model "${modelPath}". ${error.message || "Unknown error occurred."}`;
}

// ── Model loading orchestration ─────────────────────────────
function handleLoadModel(modelPath) {
  resetAnimations();
  updateAnimationUI(getAnimations(), getIsPlaying());

  loadModel(modelPath, {
    scene,
    camera,
    controls,

    onBeforeLoad() {
      showLoading();
    },

    onProgress(percent) {
      updateLoadingProgress(percent);
    },

    onLoaded(gltf) {
      if (gltf.animations && gltf.animations.length > 0) {
        setupAnimations(gltf.scene, gltf.animations);
        populateAnimationSelector(gltf.animations);
        setTimeout(() => showAnimationControls(), ANIMATION_FADE_DELAY);
      }

      hideLoading();
      setTimeout(() => {
        const anims = getAnimations();
        showModelInfo(anims.length);
        updateAnimationUI(anims, getIsPlaying());
      }, ANIMATION_FADE_DELAY);
    },

    onError(error, path) {
      showError("Loading Error", formatLoadError(error, path));
    },
  });
}

function handleToggleAnimation() {
  toggleAnimation();
  updateAnimationUI(getAnimations(), getIsPlaying());
}

function handlePlayAnimation(index) {
  playAnimation(index);
  updateAnimationUI(getAnimations(), getIsPlaying());
}

function handleFileSelect(file) {
  clearModelButtonsActive();
  resetAnimations();
  updateAnimationUI(getAnimations(), getIsPlaying());

  loadModelFromFile(file, {
    scene,
    camera,
    controls,

    onBeforeLoad() {
      showLoading();
    },

    onProgress(percent) {
      updateLoadingProgress(percent);
    },

    onLoaded(gltf) {
      if (gltf.animations && gltf.animations.length > 0) {
        setupAnimations(gltf.scene, gltf.animations);
        populateAnimationSelector(gltf.animations);
        setTimeout(() => showAnimationControls(), ANIMATION_FADE_DELAY);
      }

      hideLoading();
      setTimeout(() => {
        const anims = getAnimations();
        showUserModelInfo(file.name, anims.length);
        updateAnimationUI(anims, getIsPlaying());
      }, ANIMATION_FADE_DELAY);
    },

    onError(error) {
      showError("Loading Error", `Failed to load "${file.name}". The file may be corrupted or not a valid GLB model.`);
    },
  });
}

// ── UI wiring ───────────────────────────────────────────────
initSidebar();
initModelButtons(handleLoadModel);
initFileInput(handleFileSelect, (filename) => {
  showError("Invalid File", `"${filename}" is not a supported format. Please use .glb files.`);
});
initAnimationControls({
  onToggle: handleToggleAnimation,
  onSelect: handlePlayAnimation,
});

// ── Initial load ────────────────────────────────────────────
try {
  handleLoadModel("model1.glb");
} catch (error) {
  console.error("Failed to initiate model loading:", error);
  showError(
    "Initialization Error",
    "Failed to start loading the initial model. Please refresh the page."
  );
}

// ── Render loop ─────────────────────────────────────────────
renderer.setAnimationLoop(() => {
  updateAnimation(clock.getDelta());
  controls.update();
  renderer.render(scene, camera);
});
