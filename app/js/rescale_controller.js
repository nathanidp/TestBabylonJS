"use strict";

import * as BABYLON from "babylonjs";
import Controller from "./controller";
import arrowImage from "../img/arrow.png";

const RescaleController = Controller.$extend({
    __init__(scene, canvas) {
        this.$super(scene, canvas);
        this.interactObject = {
            drag: false, object: null, oldPos: null, normal: null, sprite: null,
        };
        this.draggingPlaneMath = null;
        this.draggingPlaneGeo = null;
        this.spriteManagerArrow = new BABYLON.SpriteManager("arrowManager", arrowImage, 4, 420, this.scene);
        this.spriteManagerArrow.isPickable = true;
    },

    pointerMoveAction(evt, pickResult) {
        if (this.interactObject.drag) {
            const ray = this.scene.createPickingRay(evt.clientX, evt.clientY);
            const intersect = this.intersectionRayPlane(ray, this.draggingPlaneGeo);
            let diff = intersect.subtract(this.interactObject.spriteOldPos);
            diff.z = 0;
            if (this.interactObject.sprite.name == "arrowLeft" || this.interactObject.sprite.name == "arrowRight") {
                diff.y = 0;
            } else { diff.x = 0; }
            if (this.interactObject.sprite.name == "arrowLeft" || this.interactObject.sprite.name == "arrowDown") {
                this.interactObject.object.scaling.addInPlace(diff.negate());
            } else { this.interactObject.object.scaling.addInPlace(diff); }
            if (this.interactObject.object.scaling.x < 0) {
                this.interactObject.object.scaling.x = 0;
                diff = BABYLON.Vector3.Zero();
            }
            if (this.interactObject.object.scaling.y < 0) {
                this.interactObject.object.scaling.y = 0;
                diff = BABYLON.Vector3.Zero();
            }
            this.interactObject.sprite.position.addInPlace(diff);
            this.interactObject.spriteOldPos = intersect;
            this.placeArrow();
        }
    },

    pointerDownAction(evt, pickResult) {
        const pickSpriteResult = this.scene.pickSprite(evt.clientX, evt.clientY, function (sprite) { return sprite.isPickable; });
        if (pickResult.hit && this.spriteManagerArrow.sprites.length == 0) {
            this.interactObject.object = pickResult.pickedMesh;
            this.addRescaleArrow();
        } else if (pickSpriteResult.hit) {
            this.interactObject.drag = true;
            this.interactObject.spriteOldPos = pickSpriteResult.pickedSprite.position;
            this.interactObject.sprite = pickSpriteResult.pickedSprite;
            const normal = this.scene.activeCamera.getForwardRay().direction;
            this.interactObject.normal = normal;
            this.draggingPlaneMath = new BABYLON.Plane(normal.x, normal.y, normal.z, BABYLON.Vector3.Dot(normal, pickSpriteResult.pickedSprite.position));
            this.draggingPlaneMath.normalize();
            this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane("plane1", {
                width: 7,
                height: 7,
                sourcePlane: this.draggingPlaneMath,
                sourceOrientation: BABYLON.Mesh.DOUBLESIDE,
            }, this.scene);
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
        const arrowDown = new BABYLON.Sprite("arrowDown", this.spriteManagerArrow);
        arrowDown.isPickable = true;
        arrowDown.size = 1;
        const arrowLeft = new BABYLON.Sprite("arrowLeft", this.spriteManagerArrow);
        arrowLeft.isPickable = true;
        arrowLeft.size = 1;
        const arrowRight = new BABYLON.Sprite("arrowRight", this.spriteManagerArrow);
        arrowRight.angle = Math.PI / 2;
        arrowRight.isPickable = true;
        arrowRight.size = 1;
        const arrowUp = new BABYLON.Sprite("arrowUp", this.spriteManagerArrow);
        arrowUp.isPickable = true;
        arrowUp.size = 1;
        this.placeArrow();
    },

    placeArrow() {
        const bb = this.interactObject.object.getBoundingInfo().boundingBox;
        this.spriteManagerArrow.sprites.forEach(function (arrow) {
            switch (arrow.name) {
                case "arrowDown":
                    arrow.position.x = bb.centerWorld.x;
                    arrow.position.y = bb.minimumWorld.y - 1;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowLeft":
                    arrow.angle = 3 * Math.PI / 2;
                    arrow.position.x = bb.minimumWorld.x - 1;
                    arrow.position.y = bb.centerWorld.y;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowRight":
                    arrow.angle = Math.PI / 2;
                    arrow.position.x = bb.maximumWorld.x + 1;
                    arrow.position.y = bb.centerWorld.y;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowUp":
                    arrow.angle = Math.PI;
                    arrow.position.x = bb.centerWorld.x;
                    arrow.position.y = bb.maximumWorld.y + 1;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                default:
                    console.log("Exception wirth ArrowSprites");
            }
        });
    },

    destructEvent() {
        while (this.spriteManagerArrow.sprites.length > 0) {
            const arrow = this.spriteManagerArrow.sprites.pop();
            arrow.dispose();
        }
    },
});

export default RescaleController;
