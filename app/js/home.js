import * as BABYLON from 'babylonjs';
import * as photonui from 'photonui';
//import * as controller from './config_controller.js'
import '../css/home.less';


import ConfigController from './config_controller';

'use strict'
window.addEventListener('DOMContentLoaded', function() {
    // All the following code is entered here
 var can = document.createElement('canvas');
 can.id = 'renderCanvas';
 document.body.appendChild(can);
 var canvas = document.getElementById('renderCanvas');
 var engine = new BABYLON.Engine(canvas, true);
 var configControll;

 var createScene = function() {
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 0, -10), scene);
  //  var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 4, BABYLON.Vector3.Zero(), scene);
    
    // target the camera to scene origin
   // camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    //camera.attachControl(canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
    var light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0,-0.5,-1), scene);

    // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation 
    var sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segment:16, diameter:2}, scene);
    window.sphere = sphere;
    window.scene = scene;
    var box = BABYLON.MeshBuilder.CreateBox('box1', {width:1,height:1,depth:1}, scene);
    box.position = new BABYLON.Vector3(5,0,0);
    configControll = new ConfigController(scene, canvas);
    configControll.init();
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
