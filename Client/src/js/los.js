// calculate the los and draw a line that reresents it.

export async function checkLineOfSight(points, viewer) {
    // calculate the los.
    // points - original points
    // viewer - the cesium viewer


    // Convert geographic coordinates to Cartesian3
    const start = Cesium.Cartesian3.fromDegrees(points[0].longitude, points[0].latitude, points[0].height);
    const end = Cesium.Cartesian3.fromDegrees(points[1].longitude, points[1].latitude, points[1].height);
    
    //create a ray that starts at start and points toward end.
    const direction = Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3());
    const ray = new Cesium.Ray(start, direction);
    const blockingPoint = viewer.scene.pickFromRay(ray); // Returns the first intersection with any 3D object in the scene (terrain or buildings)

    if (Cesium.defined(blockingPoint)) {
        const distanceToEnd = Cesium.Cartesian3.distance(start, end);
        const distanceToHit = Cesium.Cartesian3.distance(start, blockingPoint.position);

        if (distanceToHit < distanceToEnd) {
            drawLosLine(viewer,start, end, blockingPoint.position);
            console.log("Something blocks before the target");
        } 
        
    }
    else {
        drawLosLine(viewer, start, end, undefined);
        console.log("Target is visible");
    }

    
}




function drawLosLine(viewer,start, end, blockingPointPosition) {

    // if blockingPointPosition defined, the LOS is blocked.
    if (Cesium.defined(blockingPointPosition)){

        // draw a GREEN line from start point to the point where the LOS is blocked.
        viewer.entities.add({
            polyline: {
                positions: [start, blockingPointPosition],  // Array of Cartesian3 points
                width: 3,                     
                material: Cesium.Color.LIME
            }
        });
        
        // draw a RED line from the point where the LOS is blocked to the end point.
        viewer.entities.add({
            polyline: {
                positions: [blockingPointPosition, end],  // Array of Cartesian3 points
                width: 3,                     
                material: Cesium.Color.RED
            }
        });

    }

    // else - blockingPointPosition in NOT defined, the LOS is NOT blocked.
    else{
        // draw a GREEN line from start point to end point.
        viewer.entities.add({
            polyline: {
                positions: [start, end],  // Array of Cartesian3 points
                width: 3,                     
                material: Cesium.Color.LIME
            }
        });
    }
}