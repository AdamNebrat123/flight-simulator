// Export a function that creates and returns the Cesium viewer instance

export async function createViewer(containerId) {
  // Set Cesium Ion access token here
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMWJkYzIwMS0wMGRlLTQ0ODEtOGV' +
    'hYS1jZjQ2OTdkMjM1MGMiLCJpZCI6MzIyMzA1LCJpYXQiOjE3NTI3Mzg2NzV9.nmq1IMbhgSV-XMzzVyiBLuKFrCtt52Av8q2KNkIIR3I';

  // Create the viewer with terrain
  const viewer = new Cesium.Viewer(containerId, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    scene3DOnly: true,
  });

  // Enable depth test against terrain - crucial for pickPosition to work correctly
  viewer.scene.globe.depthTestAgainstTerrain = true;

  await viewer.scene.globe.tileLoadProgressEvent; // optional, wait for tiles to load

  // Fly camera to initial position
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(34.77888, 	32.02539, 250),
    orientation: {
      heading: Cesium.Math.toRadians(45.0),
      pitch: Cesium.Math.toRadians(-25.0)
    }
  });

  // Load buildings asynchronously and add them to scene
  const buildingTileset = await Cesium.createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);

  // Return the viewer instance so other modules can use it
  return viewer;
}

