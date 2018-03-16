"use strict";

import * as BABYLON from "babylonjs";
import * as photonui from "photonui";
// import * as Class from "abitbol";
import "../css/home.less";


import AppManager from "./appManager";


window.addEventListener("DOMContentLoaded", function () {
    const can = document.createElement("canvas");
    can.id = "renderCanvas";
    document.body.appendChild(can);
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    let appManager;
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    const createScene = function () {
    // create a basic BJS Scene object
        const scene = new BABYLON.Scene(engine);
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        // const camera = new
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -10), scene); // eslint-disable-line
        //  var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 4, BABYLON.Vector3.Zero(), scene);

        // target the camera to scene origin
        // camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        // const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene); // eslint-disable-line
        // const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, -0.5, -1), scene); // eslint-disable-line

        // create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
        // const sphere = BABYLON.MeshBuilder.CreateSphere("sphere1", { segment: 16, diameter: 2 }, scene);
        // window.sphere = sphere;
        window.scene = scene;
        window.photonui = photonui;
        window.canvas = canvas;
        window.camera = camera;
        // const box = BABYLON.MeshBuilder.CreateBox("box1", { width: 1, height: 1, depth: 1 }, scene);
        // box.position = new BABYLON.Vector3(5, 0, 0);
        // window.box = box;
        appManager = new AppManager(scene, canvas);
        appManager.init();
        return scene;
    // return the created scene
    };

    const scene = createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });

});
