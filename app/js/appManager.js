"use strict";

import * as Class from "abitbol";
import UIController from "./ui_control";
import DragController from "./drag_controller";
import Controller from "./controller";
import RescaleController from "./rescale_controller";
import RotateController from "./rotate_controller";

const AppManager = Class.$extend({

    __init__(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.activatedCamera = true;
        this.mode = 0; // Mode 0: drag, 1:create, 2:rescale, 3:rotate
        this.uicontroller = new UIController(this.scene, this.canvas, this);
        this.controllers = []; // Array of controllers
        window.AppManager = this; // For debugging
    },
    // Initialize the event of the scene
    init() {
        this.uicontroller.init();
        this.controllers.push(new DragController(this.scene, this.canvas));
        this.controllers.push(new Controller(this.scene, this.canvas));
        this.controllers.push(new RescaleController(this.scene, this.canvas));
        this.controllers.push(new RotateController(this.scene, this.canvas));
        this.controllers[this.mode].updateEvents();
    },

    getModeName() {
        let ret;
        switch (this.mode) {
            // Mode 0: drag, 1:create, 2:reshape, 3:rotate
            case 0:
                ret = "Drag";
                break;
            case 1:
                ret = "Create";
                break;
            case 2:
                ret = "Rescale";
                break;
            case 3:
                ret = "Rotate";
                break;
            default:
                ret = "ERROR";
        }
        return ret;
    },

    updateMode() {
        this.controllers[this.mode].destructEvent();
        this.mode = (this.mode + 1) % 4;
        this.controllers[this.mode].updateEvents();
    },

    setNewMode(newMode) {
        this.controllers[this.mode].destructEvent();
        if (newMode < 5 && newMode >= 0) {
            this.mode = newMode;
        }
        this.controllers[this.mode].updateEvents();
    },
});
export default AppManager;
