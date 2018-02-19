"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";

const RotateController = Controller.$extend({
    __init__(scene, canvas) {
        this.$super(scene, canvas);
        this.interactObject = {
            rotate: false, object: null, oldPos: null, normal: null, axisRotate: 0, // 0 axis X, 1 axis Y, 2 axis Z
        }; // The object you interact with during the mode
        this.draggingPlaneMath = null;
        this.draggingPlaneGeo = null;
        this.guizmos = [];
    },

    pointerMoveAction(evt, pickResult) {
        if (this.interactObject.rotate) {
            console.log("MOOVE");
            const ray = this.scene.createPickingRay(evt.clientX, evt.clientY);
            const intersect = this.intersectionRayPlane(ray, this.draggingPlaneGeo);
            // The vector between center of object and start of dragging
            const oToStart = this.interactObject.oldPos.subtract(this.interactObject.object.position);
            // The vector between center of object and end of dragging
            const oToEnd = intersect.subtract(this.interactObject.object.position);
            oToStart.normalize();

            oToStart.normalize();
            let aTanOEnd;
            let aTanOStart;
            let diff;
            switch (this.interactObject.axisRotate) {
                case 0:
                    aTanOStart = Math.atan2(oToStart.z, oToStart.y);
                    aTanOEnd = Math.atan2(oToEnd.z, oToEnd.y);
                    diff = aTanOEnd - aTanOStart;
                    console.log(diff);
                    this.interactObject.object.addRotation(diff, 0.0, 0.0);
                    this.guizmos.forEach(function (guizmo) {
                        if (guizmo && guizmo.name != "guizmoX") {
                            guizmo.addRotation(diff, 0.0, 0.0);
                        }
                    });
                    this.interactObject.oldPos = intersect;
                    break;
                case 1:
                    aTanOStart = Math.atan2(oToStart.z, oToStart.x);
                    aTanOEnd = Math.atan2(oToEnd.z, oToEnd.x);
                    diff = aTanOEnd - aTanOStart;
                    this.interactObject.object.addRotation(0.0, diff, 0.0);
                    this.guizmos.forEach(function (guizmo) {
                        if (guizmo && guizmo.name != "guizmoY") {
                            guizmo.addRotation(0.0, 0.0, diff);
                        }
                    });
                    this.interactObject.oldPos = intersect;
                    break;
                case 2:
                    break;
                default:
                    break;
            }

        }
    },

    pointerDownAction(evt, pickResult) {
        if (pickResult.hit) {
            const checkGuizmo = this.checkGuizmoAxis(pickResult.pickedMesh.name);
            if (this.interactObject.object == null) {
                const blueMat = new BABYLON.StandardMaterial("blueMat", this.scene);
                const redMat = new BABYLON.StandardMaterial("redMat", this.scene);
                blueMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
                redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
                const guizmoZ = null;
                const guizmoXDiameter = pickResult.pickedMesh.getBoundingInfo().maximum.y - pickResult.pickedMesh.getBoundingInfo().minimum.y + 2; // checking max and min y for the guizmo x diameter
                const guizmoYDiameter = pickResult.pickedMesh.getBoundingInfo().maximum.y - pickResult.pickedMesh.getBoundingInfo().minimum.y + 2; // checking max and min x for the guizmo y diameter
                const guizmoY = BABYLON.MeshBuilder.CreateTorus("guizmoY", { diameter: guizmoYDiameter, thickness: 0.1 }, this.scene);
                const guizmoX = BABYLON.MeshBuilder.CreateTorus("guizmoX", { diameter: guizmoXDiameter, thickness: 0.1 }, this.scene);
                guizmoY.position = guizmoX.position = pickResult.pickedMesh.position;
                guizmoY.material = redMat;
                guizmoY.rotation = new BABYLON.Vector3(pickResult.pickedMesh.rotation.x, pickResult.pickedMesh.rotation.y, pickResult.pickedMesh.rotation.z);
                guizmoX.rotation = new BABYLON.Vector3(pickResult.pickedMesh.rotation.x, pickResult.pickedMesh.rotation.y, pickResult.pickedMesh.rotation.z);
                guizmoX.material = blueMat;
                guizmoX.addRotation(Math.PI / 2, Math.PI / 2, 0.0);
                this.guizmos.push(guizmoX);
                this.guizmos.push(guizmoY);
                this.guizmos.push(guizmoZ);
                this.interactObject.object = pickResult.pickedMesh;
            } else if (checkGuizmo != -1) {
                this.interactObject.rotate = true;
                this.interactObject.axisRotate = checkGuizmo;
                this.interactObject.oldPos = pickResult.pickedPoint;
                const normal = this.scene.activeCamera.getForwardRay().direction;
                this.interactObject.normal = normal;
                this.draggingPlaneMath = new BABYLON.Plane(normal.x, normal.y, normal.z, BABYLON.Vector3.Dot(normal, pickResult.pickedPoint));
                this.draggingPlaneMath.normalize();
                this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane("plane", {
                    width: 7,
                    height: 7,
                    sourcePlane: this.draggingPlaneMath,
                }, this.scene);
                this.draggingPlaneGeo.visibility = 0;
            }
        } else {
            this.destructEvent();
        }
    },

    pointerUpAction() {
        if (this.interactObject.rotate) {
            this.interactObject.rotate = false;
        }
    },
    checkGuizmoAxis(name) {
        let ret;
        switch (name) {
            case "guizmoX":
                ret = 0;
                break;
            case "guizmoY":
                ret = 1;
                break;
            case "guizmoZ":
                ret = 2;
                break;
            default:
                ret = -1;
                break;
        }
        return ret;
    },
    destructEvent() {
        while (this.guizmos.length > 0) {
            const toDestroy = this.guizmos.pop();
            if (toDestroy != null) { toDestroy.dispose(); }
        }
        this.interactObject = {
            rotate: false, object: null, oldPos: null, normal: null, axisRotate: 0, // 0 axis X, 1 axis Y, 2 axis Z
        };
        this.draggingPlaneMath = null;
        if (this.draggingPlaneGeo) { this.draggingPlaneGeo.dispose(); }
    },
});

export default RotateController;
