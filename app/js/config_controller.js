import * as BABYLON from 'babylonjs';


export default class ConfigController {
    constructor(scene, canvas){
        this.scene = scene;
        this.canvas = canvas;
        this.mode = 0; //Mode 0: drag, 1:create, 2:reshape, 3:rotate
        this.draggingObject = {drag : false, object : null , oldPos : null};
        this.draggingPlaneMath = null ;
        this.draggingPlaneGeo = null;
    }
    //Initialize the event of the scene
    init() {
        this.scene.onPointerMove = (evt, pickResult) =>{
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
            if(pickinfo.hit)
                this.canvas.style.cursor = "move";
            if(this.draggingObject.drag){
                let ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY);
                let intersect = this.intersectionRayPlane(ray,this.draggingPlaneGeo);
                let diff = intersect.subtract(this.draggingObject.oldPos);
                diff.z=0;
                this.draggingPlaneGeo.position.addInPlace(diff);
                this.draggingObject.object.position.addInPlace(diff);
                this.draggingObject.oldPos = intersect;
            }
        }
        this.scene.onPointerDown = (evt, pickResult)  => {
            if(pickResult.hit){
                this.scene.activeCamera.detachControl(this.canvas);
                this.draggingObject.drag = true;
                this.draggingObject.object = pickResult.pickedMesh;
                this.draggingObject.oldPos = pickResult.pickedMesh.position;
                const normal = this.scene.activeCamera.getForwardRay().direction;
                this.draggingPlaneMath = new BABYLON.Plane(normal.x,normal.y,normal.z, - BABYLON.Vector3.Dot(normal, this.draggingObject.object.position));
                this.draggingPlaneMath.normalize();
                this.draggingPlaneGeo = BABYLON.MeshBuilder.CreatePlane('plane1', {width:7, height:7,
                     sourcePlane:this.draggingPlaneMath, sourceOrientation:BABYLON.Mesh.DOUBLESIDE},this.scene);
                this.draggingPlaneGeo.setPositionWithLocalVector(this.draggingObject.object.position);
                this.draggingPlaneGeo.visibility = 0;
            }
        }
        this.scene.onPointerUp = (evt, pickResult) => {
            if(this.draggingObject.drag){
                this.draggingObject.drag = false;
                this.draggingObject.object = null;
                this.draggingObject.oldPos = null;
                this.draggingPlaneGeo.dispose();
                this.draggingPlaneMath = null;
            }
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
        let intersect = rayDir.scaleInPlace(d).add(rayStart);
        return intersect;
    }
}
