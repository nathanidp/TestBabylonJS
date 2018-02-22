"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";

const DragController = Controller.$extend({
    __init__(scene, canvas, activatedCamera) {
        this.$super(scene, canvas, activatedCamera);
        this.interactObject = {
            drag: false, object: null, oldPos: null, normal: null, bbMesh: null, localOrigin: null, currentAxis: null,
        };
        this.draggingPlaneMath = null;
        this.draggingPlaneGeo = null;
    },

    pointerMoveAction(evt, pickResult) {
        const pickinfo = this.scene.pick(evt.clientX, evt.clientY);
        if (pickinfo.hit) { this.canvas.style.cursor = "move"; }
        if (this.interactObject.drag) {
            const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY);
            const intersect = this.intersectionRayPlane(ray, this.draggingPlaneGeo);
            const diff = intersect.subtract(this.interactObject.oldPos);
            // console.log(diff);
            this.interactObject.object.position.addInPlace(diff);
            this.interactObject.oldPos = intersect;
        }
    },

    pointerDownAction(evt, pickResult) {
        if (pickResult.hit) {
            this.activateCamera(false);
            if (!this.interactObject.localOrigin) {
                this.interactObject.object = pickResult.pickedMesh;
                this.interactObject.localOrigin = this.localAxes(2);
                this.interactObject.localOrigin.parent = this.interactObject.object;
                console.log(this.interactObject.localOrigin.getChildren());
            } else if (this.interactObject.localOrigin && this.interactObject.object.name == this.interactObject.localOrigin.parent.name) {
                this.interactObject.drag = true;
                const normal = this.scene.activeCamera.getForwardRay().direction;
                // const normal = this.scene.createPickingRay(evt.clientX, evt.clientY).direction;
                // console.log("normal 1 :", normal, "normal 2", normal2);
                this.interactObject.bbMesh = this.pointAdaptToObjectBoundingBox(pickResult.pickedPoint, pickResult.pickedMesh);
                const pickBB = this.scene.pick(evt.clientX, evt.clientY);
                // console.log(pickBB);
                const planPos = pickBB.pickedPoint;
                // planPos.z = pickResult.pickedMesh.getBoundingInfo().boundingBox.minimumWorld.z;// <= Triche ?
                this.interactObject.normal = normal;
                this.draggingPlaneMath = new BABYLON.Plane(normal.x, normal.y, normal.z, BABYLON.Vector3.Dot(normal, planPos));
                this.draggingPlaneMath.normalize();
                this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane("plane1", {
                    width: 0.5,
                    height: 0.5,
                    sourcePlane: this.draggingPlaneMath,
                    sourceOrientation: BABYLON.Mesh.DOUBLESIDE,
                }, this.scene);
                // this.draggingPlaneGeo.position = new BABYLON.Vector3(pickResult.pickedMesh.x, pickResult.pickedMesh.y, pickResult.pickedMesh.z);
                const newRay = this.scene.createPickingRay(evt.clientX, evt.clientY);
                const intersect = this.intersectionRayPlane(newRay, this.draggingPlaneGeo);
                this.interactObject.oldPos = intersect;
                this.draggingPlaneGeo.visibility = 0;
                // console.log("HEY HEY HEEEEEEY !!");
            } else {
                this.destructEvent();
            }
        }
    },

    pointerUpAction() {
        this.activateCamera(true);
        if (this.interactObject.drag) {
            this.interactObject.drag = false;
            this.interactObject.oldPos = null;
            if (this.draggingPlaneGeo) { this.draggingPlaneGeo.dispose(); }
            this.draggingPlaneMath = null;
        }
    },

    destructEvent() {
        this.activateCamera(true);
        if (this.interactObject.drag) {
            this.interactObject.drag = false;
            this.interactObject.oldPos = null;
            if (this.draggingPlaneGeo) { this.draggingPlaneGeo.dispose(); }
            this.draggingPlaneMath = null;
            this.interactObject.bbMesh.dispose();
            this.interactObject.localOrigin.getChildren();
            while (this.interactObject.localOrigin.getChildren().length > 0) {
                const axis = this.interactObject.localOrigin.getChildren().pop();
                axis.dispose();
            }
            this.interactObject.localOrigin.dispose();
        }
        this.interactObject.object = null;
    },
    localAxes(size) {
        const pilotLocalAxisX = BABYLON.Mesh.CreateLines("pilotLocalAxisX", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
        ], this.scene);
        pilotLocalAxisX.color = new BABYLON.Color3(1, 0, 0);

        const pilotLocalAxisY = BABYLON.Mesh.CreateLines("pilotLocalAxisY", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
        ], this.scene);
        pilotLocalAxisY.color = new BABYLON.Color3(0, 1, 0);

        const pilotLocalAxisZ = BABYLON.Mesh.CreateLines("pilotLocalAxisZ", [
            new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, -size), new BABYLON.Vector3(0, -0.05 * -size, -size * 0.95),
            new BABYLON.Vector3(0, 0, -size), new BABYLON.Vector3(0, 0.05 * -size, -size * 0.95),
        ], this.scene);
        pilotLocalAxisZ.color = new BABYLON.Color3(0, 0, 1);

        const localOrigin = BABYLON.MeshBuilder.CreateBox("localOrigin", { size: 1 }, this.scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    },
});

export default DragController;
