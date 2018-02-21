"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";
import arrowDownImage from "../img/arrowDown.png";
import arrowUpImage from "../img/arrowUp.png";
import arrowLeftImage from "../img/arrowLeft.png";
import arrowRightImage from "../img/arrowRight.png";

const RescaleController = Controller.$extend({
    __init__(scene, canvas, activatedCamera) {
        this.$super(scene, canvas, activatedCamera);
        this.interactObject = {
            drag: false, object: null, oldPos: null, normal: null, sprite: null,
        };
        this.draggingPlaneMath = null;
        this.draggingPlaneGeo = null;
        this.arrowPlanes = [];
    },

    pointerMoveAction(evt, pickResult) {
        if (this.interactObject.drag) {
            const ray = this.scene.createPickingRay(evt.clientX, evt.clientY);
            const intersect = this.intersectionRayPlane(ray, this.draggingPlaneGeo);
            let diff = intersect.subtract(this.interactObject.spriteOldPos);
            diff.scaleInPlace(2);
            let currentAxis;
            if (this.interactObject.sprite.name == "planeArrowLeft" || this.interactObject.sprite.name == "planeArrowRight") {
                currentAxis = new BABYLON.Vector3(1, 0, 0);
            } else if (this.interactObject.sprite.name == "planeArrowUp" || this.interactObject.sprite.name == "planeArrowDown") {
                currentAxis = new BABYLON.Vector3(0, 1, 0);
            } else {
                currentAxis = new BABYLON.Vector3(0, 0, 1);
            }
            if (this.interactObject.sprite.name == "planeArrowLeft" || this.interactObject.sprite.name == "planeArrowDown" || this.interactObject.sprite.name == "planeArrowFront") {
                currentAxis = currentAxis.negate();
                diff = diff.negate();
            }
            const m = BABYLON.Matrix.Identity();
            if (this.interactObject.object.rotationQuaternion) {
                this.interactObject.object.rotationQuaternion.toRotationMatrix(m);
            }
            const rotatedAxis = BABYLON.Vector3.TransformCoordinates(currentAxis, m);
            const signedDistance = diff.length() * Math.sign(BABYLON.Vector3.Dot(rotatedAxis, diff));
            const diff3 = currentAxis.clone().normalize().scale(signedDistance);
            this.interactObject.object.scaling = this.interactObject.oldScale.add(diff3);
            if (this.interactObject.object.scaling.x < 0) {
                this.interactObject.object.scaling.x = 0;
            }
            if (this.interactObject.object.scaling.y < 0) {
                this.interactObject.object.scaling.y = 0;
            }
            if (this.interactObject.object.scaling.z < 0) {
                this.interactObject.object.scaling.z = 0;
            }
            this.placeArrowPlane();
        }
    },

    pointerDownAction(evt, pickResult) {
        if (pickResult.hit && this.arrowPlanes.length == 0 && this.checkArrow(pickResult.pickedMesh.name) == -1) {
            this.activateCamera(false);
            this.interactObject.object = pickResult.pickedMesh;
            this.interactObject.oldScale = this.interactObject.object.scaling;
            this.addRescaleArrow();
        } else if (pickResult.hit && this.checkArrow(pickResult.pickedMesh.name) != -1) {
            // this.scene.activeCamera.detachControl();
            this.interactObject.drag = true;
            const planPos = pickResult.pickedPoint;
            planPos.z = pickResult.pickedMesh.getBoundingInfo().boundingBox.minimumWorld.z;
            this.interactObject.sprite = pickResult.pickedMesh;
            this.interactObject.oldScale = this.interactObject.object.scaling;
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
            this.interactObject.spriteOldPos = intersect;
            this.draggingPlaneGeo.visibility = 0;
        } else { this.destructEvent(); }
    },

    pointerUpAction() {
        if (this.interactObject.drag) {
            this.interactObject.drag = false;
            this.interactObject.oldPos = null;
            if (this.draggingPlaneGeo) { this.draggingPlaneGeo.dispose(); }
            this.draggingPlaneMath = null;
        }
    },

    addRescaleArrow() {
        const arrowDownPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowDown", { width: 1, height: 1 }, this.scene);
        const mat = new BABYLON.StandardMaterial("arrowDownMat", this.scene);
        mat.diffuseTexture = new BABYLON.Texture(arrowDownImage, this.scene);
        mat.diffuseTexture.hasAlpha = true;
        mat.backFaceCulling = false;
        arrowDownPlane.material = mat;
        this.arrowPlanes.push(arrowDownPlane);
        const arrowLeftPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowLeft", { width: 1, height: 1 }, this.scene);
        const matLeft = new BABYLON.StandardMaterial("arrowLeftMat", this.scene);
        matLeft.diffuseTexture = new BABYLON.Texture(arrowLeftImage, this.scene);
        matLeft.diffuseTexture.hasAlpha = true;
        matLeft.backFaceCulling = false;
        arrowLeftPlane.material = matLeft;
        this.arrowPlanes.push(arrowLeftPlane);
        const arrowRightPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowRight", { width: 1, height: 1 }, this.scene);
        const matRight = new BABYLON.StandardMaterial("arrowRightMat", this.scene);
        matRight.diffuseTexture = new BABYLON.Texture(arrowRightImage, this.scene);
        matRight.diffuseTexture.hasAlpha = true;
        matRight.backFaceCulling = false;
        arrowRightPlane.material = matRight;
        this.arrowPlanes.push(arrowRightPlane);
        const arrowUpPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowUp", { width: 1, height: 1 }, this.scene);
        const matUp = new BABYLON.StandardMaterial("arrowUpMat", this.scene);
        matUp.diffuseTexture = new BABYLON.Texture(arrowUpImage, this.scene);
        matUp.diffuseTexture.hasAlpha = true;
        matUp.backFaceCulling = false;
        arrowUpPlane.material = matUp;
        this.arrowPlanes.push(arrowUpPlane);
        const arrowFrontPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowFront", { width: 1, height: 1 }, this.scene);
        const matFront = new BABYLON.StandardMaterial("arrowUpMat", this.scene);
        matFront.diffuseTexture = new BABYLON.Texture(arrowRightImage, this.scene);
        matFront.diffuseTexture.hasAlpha = true;
        matFront.backFaceCulling = false;
        arrowFrontPlane.material = matFront;
        arrowFrontPlane.parent = new BABYLON.Mesh("planeArrowFront", this.scene);
        arrowFrontPlane.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI / 2, 0, 0);
        this.arrowPlanes.push(arrowFrontPlane.parent);
        const arrowBackPlane = new BABYLON.MeshBuilder.CreatePlane("planeArrowBack", { width: 1, height: 1 }, this.scene);
        const matBack = new BABYLON.StandardMaterial("arrowBackMat", this.scene);
        matBack.diffuseTexture = new BABYLON.Texture(arrowLeftImage, this.scene);
        matBack.diffuseTexture.hasAlpha = true;
        matBack.backFaceCulling = false;
        arrowBackPlane.material = matBack;
        arrowBackPlane.parent = new BABYLON.Mesh("planeArrowBack", this.scene);
        arrowBackPlane.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.PI / 2, 0, 0);
        this.arrowPlanes.push(arrowBackPlane.parent);
        this.placeArrowPlane();
    },

    placeArrowPlane() {
        const bb = this.interactObject.object.getBoundingInfo().boundingBox;
        this.arrowPlanes.forEach((arrow) => {
            switch (arrow.name) {
                case "planeArrowDown":
                    arrow.position.x = bb.center.x;
                    arrow.position.y = bb.minimum.y;
                    arrow.position.z = bb.center.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.Y, -1, BABYLON.Space.LOCAL);
                    break;
                case "planeArrowLeft":
                    arrow.position.x = bb.minimum.x;
                    arrow.position.y = bb.center.y;
                    arrow.position.z = bb.center.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.X, -1, BABYLON.Space.LOCAL);
                    break;
                case "planeArrowRight":
                    arrow.position.x = bb.maximum.x;
                    arrow.position.y = bb.center.y;
                    arrow.position.z = bb.center.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.X, 1, BABYLON.Space.LOCAL);
                    break;
                case "planeArrowUp":
                    arrow.position.x = bb.center.x;
                    arrow.position.y = bb.maximum.y;
                    arrow.position.z = bb.center.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.Y, 1, BABYLON.Space.LOCAL);
                    break;
                case "planeArrowFront":
                    arrow.position.x = bb.center.x;
                    arrow.position.y = bb.center.y;
                    arrow.position.z = bb.minimum.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.Z, -1, BABYLON.Space.LOCAL);
                    break;
                case "planeArrowBack":
                    arrow.position.x = bb.center.x;
                    arrow.position.y = bb.center.y;
                    arrow.position.z = bb.maximum.z;
                    if (this.interactObject.object.rotationQuaternion) {
                        arrow.rotationQuaternion = this.interactObject.object.rotationQuaternion;
                    }
                    arrow.position = BABYLON.Vector3.TransformCoordinates(arrow.position, bb.getWorldMatrix());
                    arrow.translate(BABYLON.Axis.Z, 1, BABYLON.Space.LOCAL);
                    break;
                default:
                    console.log("Exception with ArrowPlanes");
            }
        });
    },

    checkArrow(arrowName) {
        let ret;
        switch (arrowName) {
            case "planeArrowDown":
                ret = 0;
                break;
            case "planeArrowLeft":
                ret = 1;
                break;
            case "planeArrowRight":
                ret = 2;
                break;
            case "planeArrowUp":
                ret = 3;
                break;
            case "planeArrowFront":
                ret = 4;
                break;
            case "planeArrowBack":
                ret = 5;
                break;
            default:
                ret = -1;
        }
        return ret;
    },

    destructEvent() {
        this.activateCamera(true);
        while (this.arrowPlanes.length > 0) {
            const arrow = this.arrowPlanes.pop();
            arrow.dispose();
        }
    },
});

export default RescaleController;
