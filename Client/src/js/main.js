import { createViewer } from './viewerSetup.js';
import { setupPointSelection } from './pointSelection.js';

window.addEventListener('DOMContentLoaded', async () => {
  // Create viewer in the div with id 'cesiumContainer'
  const viewer = await createViewer('cesiumContainer');

  // Setup point selection with the created viewer
  setupPointSelection(viewer);
  
});