import * as BABYLON from 'babylonjs';
import * as photonui from 'photonui';
import arrowImage from '../img/arrow.png';
'use strict'

export default class ConfigController {
    
    constructor(scene, canvas){
        this.scene = scene;
        this.canvas = canvas;
        this.mode = 2; //Mode 0: drag, 1:create, 2:reshape, 3:rotate
        this.interactObject = {drag : false, object : null , oldPos : null, offset : 0, normal:null , sprite : null, spriteOldPos : null};
        this.draggingPlaneMath = null ;
        this.draggingPlaneGeo = null;
        this.spriteManagerArrow = new BABYLON.SpriteManager("arrowManager", arrowImage,4,420,this.scene);
        this.spriteManagerArrow.isPickable = true;
    }
    //Initialize the event of the scene
    changeMode(){
        return (evt) => {
            if(evt.sourceEvent.key=="k"){
                this.mode = (this.mode+1)%4;
                this.showMode();
                this.destructArrows();
            }
        }
    }
    init() {
        
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, this.changeMode()));
        this.scene.onPointerMove = (evt, pickResult) =>{
            if(this.mode==0){
                var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
                if(pickinfo.hit)
                    this.canvas.style.cursor = "move";
                if(this.interactObject.drag){
                    let ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY);
                    let intersect = this.intersectionRayPlane(ray,this.draggingPlaneGeo);
                    let diff = intersect.subtract(this.interactObject.oldPos);
                    this.interactObject.object.position.addInPlace(diff);
                    this.interactObject.oldPos = intersect;
                }
            }
            else if(this.mode==2){
                if(this.interactObject.drag){
                    var pickSpriteInfo = scene.pickSprite(evt.clientX,evt.clientY);
                    console.log(pickSpriteInfo);
                    let ray = this.scene.createPickingRay(evt.clientX,evt.clientY);
                    let intersect = this.intersectionRayPlane(ray,this.draggingPlaneGeo);
                    let diff = intersect.subtract(this.interactObject.spriteOldPos);
                    diff.z = 0;
                    if(this.interactObject.sprite.name=="arrowLeft" || this.interactObject.sprite.name=="arrowRight"){
                        diff.y = 0;
                    }
                    else
                        diff.x = 0;
                    if(this.interactObject.sprite.name=="arrowLeft" || this.interactObject.sprite.name=="arrowDown"){
                        this.interactObject.object.scaling.addInPlace(diff.negate());
                    }
                    else
                        this.interactObject.object.scaling.addInPlace(diff);                    
                    if(this.interactObject.object.scaling.x < 0) {
                        this.interactObject.object.scaling.x = 0;
                        diff = BABYLON.Vector3.Zero();
                    };
                    if(this.interactObject.object.scaling.y < 0) {
                        this.interactObject.object.scaling.y = 0 ;
                        diff = BABYLON.Vector3.Zero();
                    }
                    this.interactObject.sprite.position.addInPlace(diff);
                    this.interactObject.spriteOldPos = intersect;
                    this.placeArrow();
                }
            }
        }
        this.scene.onPointerDown = (evt, pickResult)  => {
            if(this.mode==0){
                if(pickResult.hit){
                    this.scene.activeCamera.detachControl(this.canvas);
                    this.interactObject.drag = true;
                    this.interactObject.object = pickResult.pickedMesh;
                    this.interactObject.oldPos = pickResult.pickedPoint;
                    const normal = this.scene.activeCamera.getForwardRay().direction;
                    this.interactObject.normal = normal;
                    this.draggingPlaneMath = new BABYLON.Plane(normal.x,normal.y,normal.z, BABYLON.Vector3.Dot(normal, pickResult.pickedPoint));
                    this.draggingPlaneMath.normalize();
                    this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane('plane1', {width:7, height:7,
                        sourcePlane:this.draggingPlaneMath, sourceOrientation:BABYLON.Mesh.DOUBLESIDE},this.scene);
                    this.draggingPlaneGeo.visibility = 0;
                }
            }
            else if(this.mode==2){
                var pickSpriteResult = this.scene.pickSprite(evt.clientX, evt.clientY, function (sprite) {return sprite.isPickable; });
                if(pickResult.hit && this.spriteManagerArrow.sprites.length==0){
                    this.interactObject.object = pickResult.pickedMesh;
                    this.addRescaleArrow();
                }
                else if(pickSpriteResult.hit){
                     this.interactObject.drag = true;
                     this.interactObject.spriteOldPos = pickSpriteResult.pickedSprite.position;
                     //this.interactObject.object = pickSpriteResult.pickedSprite;
                     this.interactObject.sprite = pickSpriteResult.pickedSprite;
                     const normal = this.scene.activeCamera.getForwardRay().direction;
                     this.interactObject.normal = normal;
                     this.draggingPlaneMath = new BABYLON.Plane(normal.x,normal.y,normal.z, BABYLON.Vector3.Dot(normal, pickSpriteResult.pickedSprite.position));
                     this.draggingPlaneMath.normalize();
                     this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane('plane1', {width:7, height:7,
                         sourcePlane:this.draggingPlaneMath, sourceOrientation:BABYLON.Mesh.DOUBLESIDE},this.scene);
                     this.draggingPlaneGeo.visibility = 0;
                }
                else
                    this.destructArrows();
            }
        }
        this.scene.onPointerUp = (evt, pickResult) => {
            this.reinitDragging();
            if(this.mode==0)
                this.interactObject.object = null;
        }
    }
    //Get the intersection of a ray and a plane
    intersectionRayPlane(ray,plane){
        let minCorners =  plane.getBoundingInfo().boundingBox.minimum;
        let maxCorners = plane.getBoundingInfo().boundingBox.maximum;
        let coord = plane.position;
        // p = up-left, q = up-right, r=down-right, s=down-left
        let p = new BABYLON.Vector3(minCorners.x,maxCorners.y,0).add(coord);
        let q = new BABYLON.Vector3(maxCorners.x,maxCorners.y,0).add(coord);
        let r = new BABYLON.Vector3(minCorners.x,minCorners.y,0).add(coord);
        let s = new BABYLON.Vector3(maxCorners.x,minCorners.y,0).add(coord);
        //Get vectors pq, pr for cross product
        let v1v2 = q.subtract(p);
        let v2v3 = p.subtract(r);
        let planeNormal = BABYLON.Vector3.Cross(v1v2,v2v3);
        let rayStart = ray.origin;
        let rayDir = ray.direction;
        let d = (BABYLON.Vector3.Dot(rayDir.subtract(rayStart),planeNormal)/BABYLON.Vector3.Dot(rayDir,planeNormal));
        let intersect = rayDir.scale(d).add(rayStart);
        return intersect;
    }

    reinitDragging(){
        if(this.interactObject.drag){
            this.interactObject.drag = false;
            this.interactObject.oldPos = null;
            if(this.draggingPlaneGeo)
                this.draggingPlaneGeo.dispose();
            this.draggingPlaneMath = null;
        }
    }
    showMode(){
        var myPopup = photonui.PopupWindow.$extend({
            show: function() {
                this.visible = true;
                setTimeout(this.destroy, 500);
            }
        })
        var win = new myPopup({
                padding: 10,
                height: 100,
                width:100,
                child: new photonui.Label({}),
            });
        let modeName;
        switch(this.mode){
            //Mode 0: drag, 1:create, 2:reshape, 3:rotate
            case 0:
                modeName = "drag";
                break;
            case 1:
                modeName = "create";
                break;
            case 2:
                modeName = "reshape";
                break;
            case 3:
                modeName = "rotate";
                break;
        }
        win.getChild().setText("Mode : "+ modeName);
        win.setHeight(win.getChild().offsetHeight);
        win.show();
        win.center();
    }
    addRescaleArrow(){
        const spriteManagerArrow = this.spriteManagerArrow;
        var arrowDown = new BABYLON.Sprite("arrowDown", spriteManagerArrow);
        arrowDown.isPickable = true;
        arrowDown.size = 1;
        var arrowLeft = new BABYLON.Sprite("arrowLeft", spriteManagerArrow);
        arrowLeft.isPickable = true;
        arrowLeft.size = 1;
        var arrowRight = new BABYLON.Sprite("arrowRight", spriteManagerArrow);
        arrowRight.angle = Math.PI/2;
        arrowRight.isPickable = true;
        arrowRight.size = 1;
        var arrowUp = new BABYLON.Sprite("arrowUp", spriteManagerArrow);
        arrowUp.isPickable = true;
        arrowUp.size = 1;
        this.placeArrow();
    }
    
    placeArrow(){
        const bb = this.interactObject.object.getBoundingInfo().boundingBox;
        this.spriteManagerArrow.sprites.forEach(function(arrow){
            switch(arrow.name){
                case "arrowDown" :
                    arrow.position.x = bb.centerWorld.x;
                    arrow.position.y = bb.minimumWorld.y - 1;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowLeft" :
                    arrow.angle = 3 * Math.PI/2;
                    arrow.position.x = bb.minimumWorld.x - 1;
                    arrow.position.y = bb.centerWorld.y;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowRight" :
                    arrow.angle = Math.PI/2;
                    arrow.position.x = bb.maximumWorld.x + 1;
                    arrow.position.y = bb.centerWorld.y;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
                case "arrowUp" :
                    arrow.angle = Math.PI;
                    arrow.position.x = bb.centerWorld.x;
                    arrow.position.y = bb.maximumWorld.y + 1;
                    arrow.position.z = bb.minimumWorld.z;
                    break;
            }
        })
    }
    destructArrows(){
        while(this.spriteManagerArrow.sprites.length > 0){
            var arrow = this.spriteManagerArrow.sprites.pop();
            arrow.dispose();
        }
    }
}
