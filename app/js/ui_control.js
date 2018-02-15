"use strict";

// import * as BABYLON from "babylonjs";
import * as photonui from "photonui";
import * as Class from "abitbol";

const UIController = Class.$extend({
    __init__(scene, canvas, manager) {
        this.scene = scene;
        this.canvas = canvas;
        this.manager = manager;
        this.modeIndicator = null;
    },
    init() {
        this.initModeIndicator();

    },
    initModeIndicator() {
        this.modeIndicator = new photonui.Window({
            padding: 10,
            title: "Current Mode",
            width: 150,
            child: new photonui.Label({}),
        });
        this.modeIndicator.getChild().setText(this.getModeName());
        this.modeIndicator.setHeight(this.modeIndicator.getChild().offsetHeight);
        this.modeIndicator.setX(0);
        this.modeIndicator.setY(0);
        this.modeIndicator.show();
    },
    showMode() {

    },

});

export default UIController;
