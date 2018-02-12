import * as BABYLON from 'babylonjs';
import '../css/home.css';

window.addEventListener('DOMContentLoaded', function() {
    // All the following code is entered here
 var can = document.createElement('canvas');
 can.id = 'renderCanvas';
 document.body.appendChild(can);
 var canvas = document.getElementById('renderCanvas');
 var engine = new BABYLON.Engine(canvas, true);
 var draggingObject = {drag : false, object : null , oldPos : null};
 var draggingPlaneMath ;
 var draggingPlaneGeo;

var getCursorPosition = function(evt) {
    console.log(scene.pointerX , scene.pointerY);
    var ret = scene.pick(scene.pointerX, scene.pointerY) ;
    if(ret.hit)
        return ret.pickedPoint;
    else
        return null;
}

var intersectionRayPlane = function(ray,plane){
    var minCorners =  plane.getBoundingInfo().boundingBox.minimum;
    var maxCorners = plane.getBoundingInfo().boundingBox.maximum;
    var coord = plane.position;
    // p = up-left, q = up-right, r=down-right, s=down-left
    var p = new BABYLON.Vector3(minCorners.x,maxCorners.y,0).add(coord);
    var q = new BABYLON.Vector3(maxCorners.x,maxCorners.y,0).add(coord);
    var r = new BABYLON.Vector3(minCorners.x,minCorners.y,0).add(coord);
    var s = new BABYLON.Vector3(maxCorners.x,minCorners.y,0).add(coord);
    //Get vectors pq, pr for cross product
    var v1v2 = q.subtract(p);
    var v2v3 = p.subtract(r);
    var planeNormal = BABYLON.Vector3.Cross(v1v2,v2v3);
    
    var rayStart = ray.origin;
    var rayDir = ray.direction;
    var d = (BABYLON.Vector3.Dot(rayDir.subtract(rayStart),planeNormal)/BABYLON.Vector3.Dot(rayDir,planeNormal));
    var intersect = rayDir.scaleInPlace(d).add(rayStart);
    return intersect;
}
 var createScene = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 0, -10), scene);
    //var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 4, BABYLON.Vector3.Zero(), scene);
    
    // target the camera to scene origin
   // camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    //camera.attachControl(canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
    var light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0,-0.5,-1), scene);

    // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation 
    //var sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segment:16, diameter:2}, scene);

    // move the sphere upward 1/2 of its height
    //sphere.position.y = 1;

    var box = BABYLON.MeshBuilder.CreateBox('box1', {width:1,height:1,depth:1}, scene);


    scene.onPointerMove = function(evt, pickResult){
        if(draggingObject.drag){
            var ray = scene.createPickingRay(scene.pointerX, scene.pointerY);
            var intersect = intersectionRayPlane(ray,draggingPlaneGeo);
            var diff = intersect.subtract(draggingObject.oldPos);
            draggingPlaneGeo.position.addInPlace(diff);
            draggingObject.object.position = draggingPlaneGeo.position;
            draggingObject.oldPos = intersect;
            
        }
    }
    scene.onPointerDown = function(evt, pickResult) {
        if(pickResult.hit){
            draggingObject.drag = true;
            draggingObject.object = pickResult.pickedMesh;
            draggingObject.oldPos = pickResult.pickedPoint;
            draggingPlaneMath = new BABYLON.Plane(0,0,1,0);
            draggingPlaneMath.normalize();
            draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane('plane1', {width:7, height:7, sourcePlane:draggingPlaneMath, sourceOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
            draggingPlaneGeo.setPositionWithLocalVector(draggingObject.object.position);
            draggingPlaneGeo.visibility = 0;
        }
    }
    scene.onPointerUp = function(evt, pickResult){
        draggingObject.drag = false;
        draggingObject.object = null;
        draggingObject.oldPos = null;
        draggingPlaneMath = null;
        draggingPlaneGeo.dispose();
    }
    
    //window.scene = scene;
    return scene
    // return the created scene
 }

 var scene = createScene();

    engine.runRenderLoop(function() {
        scene.render();
    });

    window.addEventListener('resize', function(){
        engine.resize();
    });

});
