"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";

const DrawController = Controller.$extend({
    __init__(scene, canvas, activatedCamera) {
        this.$super(scene, canvas, activatedCamera);
        const normal = this.scene.activeCamera.getForwardRay().direction;
        const planPos = new BABYLON.Vector3(0, 0, 0);
        const planeGeometry = new BABYLON.Plane(normal.x, normal.y, normal.z, BABYLON.Vector3.Dot(normal, planPos));
        planeGeometry.normalize();
        this.drawingPlane = BABYLON.MeshBuilder.CreatePlane("plane1", {
            width: 10,
            height: 10,
            sourcePlane: this.draggingPlaneMath,
            sourceOrientation: BABYLON.Mesh.DOUBLESIDE,
        }, this.scene);
        this.lastPoint = null;
        this.lastTemporaryLine = null;
        this.points = [];
        this.lines = [];
    },

    pointerMoveAction(evt, pickResult) {
        const pickinfo = this.scene.pick(evt.clientX, evt.clientY);
        if (!this.lastPoint || !pickinfo.hit) { return; }
        if (this.lastTemporaryLine) { this.lastTemporaryLine.dispose(); }
        const newPoint = pickinfo.pickedPoint;
        const points = [];
        points.push(this.lastPoint);
        points.push(newPoint);
        const lines = BABYLON.MeshBuilder.CreateLines("lines", { points, updatable: true }, this.scene);
        lines.color = new BABYLON.Color3(0, 1, 0);
        this.lastTemporaryLine = lines;
    },

    pointerDownAction(evt, pickResult) {
        if (evt.button == 0) {
            const newPoint = pickResult.pickedPoint;
            if (!this.lastPoint) { this.lastPoint = newPoint; } else {
                const points = [];
                points.push(this.lastPoint);
                points.push(newPoint);
                const lines = BABYLON.MeshBuilder.CreateLines("lines", { points, updatable: true }, this.scene);
                lines.color = new BABYLON.Color3(0, 1, 0);
                this.lines.push(lines);
                this.lastPoint = newPoint;
            }
            this.points.push(newPoint);
        } else {
            evt.preventDefault();
            this.lastPoint = null;
            this.lastTemporaryLine = null;
        }

    },

    pointerUpAction() {
    },

    destructEvent() {
    },

});

export default DrawController;
