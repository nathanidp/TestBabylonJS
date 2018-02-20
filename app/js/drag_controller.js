"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";

const DragController = Controller.$extend({
    __init__(scene, canvas) {
        this.$super(scene, canvas);
        this.interactObject = {
            drag: false, object: null, oldPos: null, normal: null,
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
            this.interactObject.object.position.addInPlace(diff);
            this.interactObject.oldPos = intersect;
        }
    },

    pointerDownAction(evt, pickResult) {
        if (pickResult.hit) {
            this.interactObject.drag = true;
            this.interactObject.object = pickResult.pickedMesh;
            const planPos = pickResult.pickedPoint;
            planPos.z = pickResult.pickedMesh.getBoundingInfo().boundingBox.minimumWorld.z;
            const normal = this.scene.activeCamera.getForwardRay().direction;
            this.interactObject.normal = normal;
            this.draggingPlaneMath = new BABYLON.Plane(normal.x, normal.y, normal.z, BABYLON.Vector3.Dot(normal, planPos));
            this.draggingPlaneMath.normalize();
            this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane("plane1", {
                width: 7,
                height: 7,
                sourcePlane: this.draggingPlaneMath,
                sourceOrientation: BABYLON.Mesh.DOUBLESIDE,
            }, this.scene);
            const newRay = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY);
            const intersect = this.intersectionRayPlane(newRay, this.draggingPlaneGeo);
            this.interactObject.oldPos = intersect;
            this.draggingPlaneGeo.visibility = 0;
        }
    },

    pointerUpAction() {
        this.destructEvent();
    },

    destructEvent() {
        if (this.interactObject.drag) {
            this.interactObject.drag = false;
            this.interactObject.oldPos = null;
            if (this.draggingPlaneGeo) { this.draggingPlaneGeo.dispose(); }
            this.draggingPlaneMath = null;
        }
        this.interactObject.object = null;
    },
});

export default DragController;
