import { MOBILE_BREAKPOINT } from "./config.js";

const modelInfo = document.querySelector(".model-info");
const loadingIndicator = document.querySelector(".loader");
const animControlsEl = document.getElementById("animation-controls");
const playPauseBtn = document.getElementById("play-pause-btn");
const animSelector = document.getElementById("animation-selector");
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const toggleIcon = document.querySelector(".toggle-icon");
const infoTitle = document.querySelector(".model-info h3");
const infoText = document.querySelector(".model-info p");

const progressText = document.createElement("div");
progressText.className = "loader-progress";
loadingIndicator.parentNode.insertBefore(progressText, loadingIndicator.nextSibling);

/**
 * Sets up the sidebar toggle button and click-outside-to-close behaviour.
 */
export function initSidebar() {
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    const isOpen = sidebar.classList.contains("open");
    toggleIcon.textContent = isOpen ? "\u25B2" : "\u25BC";
    toggleSidebarBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !toggleSidebarBtn.contains(event.target)
    ) {
      sidebar.classList.remove("open");
      toggleIcon.textContent = "\u25BC";
      toggleSidebarBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      toggleIcon.textContent = "\u25BC";
      toggleSidebarBtn.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Binds click handlers to model selection buttons.
 * @param {function} onSelect - Called with the model filename when a button is clicked
 */
export function initModelButtons(onSelect) {
  const modelButtons = document.querySelectorAll(".model-btn");
  modelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modelButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      onSelect(btn.dataset.model);

      if (window.innerWidth < MOBILE_BREAKPOINT) {
        sidebar.classList.remove("open");
        toggleIcon.textContent = "\u25BC";
        toggleSidebarBtn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/**
 * Binds play/pause and animation selector handlers.
 */
export function initAnimationControls({ onToggle, onSelect }) {
  playPauseBtn.addEventListener("click", onToggle);
  animSelector.addEventListener("change", (e) =>
    onSelect(parseInt(e.target.value))
  );
}

export function showLoading() {
  loadingIndicator.classList.add("visible");
  modelInfo.classList.remove("visible");
  animControlsEl.classList.remove("visible");
  progressText.textContent = "";
  progressText.style.display = "none";
}

export function hideLoading() {
  loadingIndicator.classList.remove("visible");
  progressText.textContent = "";
  progressText.style.display = "none";
}

export function showModelInfo(animCount) {
  modelInfo.classList.add("visible");
  if (animCount > 0) {
    infoText.textContent = `This model contains ${animCount} animation${
      animCount > 1 ? "s" : ""
    }. Use the controls on the right to play/pause.`;
  } else {
    infoText.textContent =
      "Click the models in the sidebar to switch between different 3D models.";
  }
}

export function showError(title, message) {
  infoTitle.textContent = title;
  infoText.textContent = message;
  loadingIndicator.classList.remove("visible");
  modelInfo.classList.add("visible");
  animControlsEl.classList.remove("visible");
}

export function showAnimationControls() {
  animControlsEl.classList.remove("hidden");
  animControlsEl.classList.add("visible");
}

/**
 * Syncs the animation controls UI with current state.
 */
export function updateAnimationUI(animations, isPlaying) {
  if (animations.length > 0) {
    animControlsEl.classList.remove("hidden");
    playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
  } else {
    animControlsEl.classList.add("hidden");
  }
}

export function updateLoadingProgress(percent) {
  progressText.textContent = `${percent}%`;
  progressText.style.display = percent > 0 ? "block" : "none";
}

/**
 * Populates the animation dropdown selector.
 */
export function populateAnimationSelector(animations) {
  animSelector.innerHTML = "";
  animations.forEach((anim, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = anim.name || `Animation ${index + 1}`;
    animSelector.appendChild(option);
  });

  if (animations.length > 1) {
    animSelector.classList.remove("hidden");
  } else {
    animSelector.classList.add("hidden");
  }
}

/**
 * Clears the active state from all model buttons.
 * Used when loading a user-provided model file.
 */
export function clearModelButtonsActive() {
  const modelButtons = document.querySelectorAll(".model-list .model-btn");
  modelButtons.forEach((btn) => btn.classList.remove("active"));
}

/**
 * Shows info text for a user-loaded model.
 * @param {string} filename - The name of the loaded file
 * @param {number} animCount - Number of animations in the model
 */
export function showUserModelInfo(filename, animCount) {
  modelInfo.classList.add("visible");
  infoTitle.textContent = filename;
  if (animCount > 0) {
    infoText.textContent = `Your model contains ${animCount} animation${
      animCount > 1 ? "s" : ""
    }. Use the controls on the right to play/pause.`;
  } else {
    infoText.textContent = "Your model is loaded. Use the mouse to rotate, zoom, and pan.";
  }
}
