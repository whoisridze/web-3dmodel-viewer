const VALID_EXTENSIONS = [".glb"];

const fileInput = document.getElementById("file-input");
const loadFileBtn = document.getElementById("load-file-btn");
const dropZone = document.getElementById("drop-zone");

let dragCounter = 0;

/**
 * Checks if a file has a valid 3D model extension.
 * @param {File} file - The file to validate
 * @returns {boolean} True if the file is a valid GLB
 */
function isValidModelFile(file) {
  const name = file.name.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * Shows the drop zone overlay.
 */
function showDropZone() {
  dropZone.classList.add("visible");
}

/**
 * Hides the drop zone overlay.
 */
function hideDropZone() {
  dropZone.classList.remove("visible");
}

/**
 * Initializes file input and drag-and-drop functionality.
 * @param {function} onFileSelect - Callback called with the selected File when a valid model is chosen
 * @param {function} onInvalidFile - Callback called with the filename when an invalid file is selected
 */
export function initFileInput(onFileSelect, onInvalidFile) {
  // Handle "Load Your Model" button click
  loadFileBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // Handle file selection via file picker
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      if (isValidModelFile(file)) {
        onFileSelect(file);
      } else if (onInvalidFile) {
        onInvalidFile(file.name);
      }
    }
    // Reset file input so the same file can be selected again
    fileInput.value = "";
  });

  // Drag-and-drop: track enter/leave to handle nested elements
  document.body.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragCounter++;
    if (dragCounter === 1) {
      showDropZone();
    }
  });

  document.body.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      hideDropZone();
    }
  });

  document.body.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  document.body.addEventListener("drop", (event) => {
    event.preventDefault();
    dragCounter = 0;
    hideDropZone();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidModelFile(file)) {
        onFileSelect(file);
      } else if (onInvalidFile) {
        onInvalidFile(file.name);
      }
    }
  });
}
