"use strict";

import * as BABYLON from "babylonjs";
import * as Class from "abitbol";

const Controller = Class.$extend({
    __init__(scene, canvas, activatedCamera) {
        this.scene = scene;
        this.canvas = canvas;
        this.interactObject = null; // The object you interact with during the mode
        this.activatedCamera = activatedCamera;
    },
    updateEvents() {
        this.scene.onPointerMove = this.pointerMoveAction;
        this.scene.onPointerDown = this.pointerDownAction;
        this.scene.onPointerUp = this.pointerUpAction;
    },
    getInteractObject() {
        return this.$data.interactObject;
    },
    setInteractObject(object) {
        this.$data.interactObject = object;
    },
    pointerMoveAction() {
    },
    pointerDownAction() {
    },
    pointerUpAction() {
    },
    destructEvent() {
    },
    // Get the intersection of a ray and a plane
    intersectionRayPlane(ray, plane) {
        const minCorners = plane.getBoundingInfo().boundingBox.minimum;
        const maxCorners = plane.getBoundingInfo().boundingBox.maximum;
        const coord = plane.position;
        // p = up-left, q = up-right, r=down-right, s=down-left (4 Points of the plane)
        const p = new BABYLON.Vector3(minCorners.x, maxCorners.y, 0).add(coord);
        const q = new BABYLON.Vector3(maxCorners.x, maxCorners.y, 0).add(coord);
        const r = new BABYLON.Vector3(minCorners.x, minCorners.y, 0).add(coord);
        // Get vectors pq, pr for cross product
        const v1v2 = q.subtract(p);
        const v2v3 = p.subtract(r);
        const planeNormal = BABYLON.Vector3.Cross(v1v2, v2v3);
        const rayStart = ray.origin;
        const rayDir = ray.direction;
        const d = (BABYLON.Vector3.Dot(rayDir.subtract(rayStart), planeNormal) / BABYLON.Vector3.Dot(rayDir, planeNormal));
        const intersect = rayDir.scale(d).add(rayStart);
        return intersect;
    },
    RotationBetweenVectors(start, dest) {
        const a = BABYLON.Vector3.Cross(start, dest);
        const w = Math.sqrt((start.length() ** 2) * (dest.length() ** 2)) + BABYLON.Vector3.Dot(start, dest);
        const quatRet = new BABYLON.Quaternion(a.x, a.y, a.z, w);
        quatRet.normalize();
        return quatRet;
    },
    _distanceToProjected(point, linePoint, lineVector) {
        const ba = point.subtract(linePoint);
        const bh = BABYLON.Vector2.Dot(ba, lineVector) / lineVector.length();
        return Math.abs(bh);
    },
    updateCamera() {
        if (this.activatedCamera) {
            this.activateCamera(false);
        } else { this.activateCamera(true); }
    },
    activateCamera(bool) {
        if (!bool) {
            this.scene.activeCamera.detachControl(this.canvas);
        } else { this.scene.activeCamera.attachControl(this.canvas, false); }
        this.activatedCamera = bool;
    },
    pointAdaptToObjectBoundingBox(point, object) {
        const bb = object.getBoundingInfo().boundingBox;
        const height = bb.maximum.y - bb.minimum.y;
        const width = bb.maximum.x - bb.minimum.x;
        const depth = bb.maximum.z - bb.minimum.z;
        const bbMesh = BABYLON.MeshBuilder.CreateBox("bbMesh", { height, width, depth }, this.scene);
        bbMesh.parent = object;
        bbMesh.visibility = 0;
        return bbMesh;
    },
});

export default Controller;
