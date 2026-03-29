import * as THREE from "three";

let mixer = null;
let animations = [];
let isPlaying = false;

/**
 * Stops all actions and resets animation state.
 */
export function resetAnimations() {
  if (mixer) mixer.stopAllAction();
  mixer = null;
  animations = [];
  isPlaying = false;
}

/**
 * Creates an AnimationMixer for the model and plays the first clip.
 */
export function setupAnimations(model, gltfAnimations) {
  if (!gltfAnimations || gltfAnimations.length === 0) return;

  mixer = new THREE.AnimationMixer(model);
  animations = gltfAnimations;

  const action = mixer.clipAction(animations[0]);
  action.play();
  isPlaying = true;
}

/**
 * Toggles play/pause on the current animation.
 */
export function toggleAnimation() {
  if (!mixer || animations.length === 0) return;

  if (isPlaying) {
    mixer.timeScale = 0;
    isPlaying = false;
  } else {
    mixer.timeScale = 1;
    isPlaying = true;
  }
}

/**
 * Plays a specific animation clip by index.
 */
export function playAnimation(index) {
  if (!mixer || !animations[index]) return;

  mixer.stopAllAction();
  const action = mixer.clipAction(animations[index]);
  action.reset();
  action.play();
  isPlaying = true;
}

/**
 * Advances the mixer by delta seconds. No-op if no mixer exists.
 */
export function updateAnimation(delta) {
  if (mixer) mixer.update(delta);
}

export function getAnimations() {
  return animations;
}

export function getIsPlaying() {
  return isPlaying;
}
