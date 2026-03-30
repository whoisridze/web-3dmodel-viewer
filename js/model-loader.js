import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.176.0/examples/jsm/loaders/GLTFLoader.js";
import { CAMERA_OFFSET } from "./config.js";

const loader = new GLTFLoader();
let currentModel = null;

/**
 * Disposes a 3D model and releases all GPU resources.
 * Traverses the model hierarchy and disposes geometries, materials, and textures.
 */
export function disposeModel(model) {
  if (!model) return;

  model.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (!material) return;

        const textureProps = [
          "map",
          "lightMap",
          "bumpMap",
          "normalMap",
          "specularMap",
          "envMap",
          "alphaMap",
          "aoMap",
          "displacementMap",
          "emissiveMap",
          "gradientMap",
          "metalnessMap",
          "roughnessMap",
        ];

        textureProps.forEach((prop) => {
          if (material[prop]) material[prop].dispose();
        });

        material.dispose();
      });
    }
  });
}

/**
 * Fits the camera so the entire object is visible.
 */
export function fitCameraToObject(cam, obj, offset = CAMERA_OFFSET) {
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

/**
 * Loads a GLTF model, disposing the previous one first.
 * @param {string} modelPath - Filename inside assets/
 * @param {object} deps - scene, camera, controls, and callback hooks
 */
export function loadModel(modelPath, { scene, camera, controls, onBeforeLoad, onLoaded, onError, onProgress }) {
  if (currentModel) {
    disposeModel(currentModel);
    scene.remove(currentModel);
  }
  currentModel = null;

  if (onBeforeLoad) onBeforeLoad();

  loader.load(
    `assets/${modelPath}`,
    (gltf) => {
      currentModel = gltf.scene;
      scene.add(currentModel);

      fitCameraToObject(camera, currentModel);
      controls.target.copy(currentModel.userData.center);

      if (onLoaded) onLoaded(gltf);
    },
    (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    },
    (error) => {
      console.error("GLTF loading error:", error);
      currentModel = null;
      if (onError) onError(error, modelPath);
    }
  );
}

/**
 * Loads a GLTF model from a File object using FileReader + GLTFLoader.parse().
 * This avoids blob URL resolution issues with external resources.
 * @param {File} file - The File object from file input or drag-and-drop
 * @param {object} deps - scene, camera, controls, and callback hooks
 */
export function loadModelFromFile(file, { scene, camera, controls, onBeforeLoad, onLoaded, onError, onProgress }) {
  if (currentModel) {
    disposeModel(currentModel);
    scene.remove(currentModel);
  }
  currentModel = null;

  if (onBeforeLoad) onBeforeLoad();

  const reader = new FileReader();

  reader.onprogress = (event) => {
    if (event.lengthComputable && onProgress) {
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    }
  };

  reader.onload = (event) => {
    loader.parse(
      event.target.result,
      "",
      (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);

        fitCameraToObject(camera, currentModel);
        controls.target.copy(currentModel.userData.center);

        if (onLoaded) onLoaded(gltf);
      },
      (error) => {
        console.error("GLTF parse error:", error);
        currentModel = null;
        if (onError) onError(error, file.name);
      }
    );
  };

  reader.onerror = () => {
    if (onError) onError(new Error("Failed to read file"), file.name);
  };

  reader.readAsArrayBuffer(file);
}
