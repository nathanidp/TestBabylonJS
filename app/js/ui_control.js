"use strict";

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
        document.addEventListener("keydown", this.changeMode(), false);
        this.initModeIndicator();
    },
    initModeIndicator() {
        this.modeIndicator = new photonui.Window({
            padding: 10,
            title: "Current Mode",
            width: 150,
            child: new photonui.Label({}),
        });
        this.modeIndicator.getChild().setText(this.manager.getModeName());
        this.modeIndicator.setHeight(this.modeIndicator.getChild().offsetHeight);
        this.modeIndicator.setX(0);
        this.modeIndicator.setY(0);
        this.modeIndicator.show();
    },
    showMode() {
        const myPopup = photonui.PopupWindow.$extend({
            show() {
                this.visible = true;
                setTimeout(this.destroy, 500);
            },
        });
        const win = new myPopup({
            padding: 10,
            height: 100,
            width: 100,
            child: new photonui.Label({}),
        });
        win.getChild().setText("Mode : " + this.manager.getModeName());
        win.setHeight(win.getChild().offsetHeight);
        win.show();
        win.center();
        this.modeIndicator.getChild().setText(this.manager.getModeName());
    },
    changeMode() {
        return (evt) => {
            if (evt.key == "k") {
                this.manager.updateMode();
                this.showMode();
            } else if (evt.key == "c") {
                this.manager.setNewMode(1);
                this.showMode();
            } else if (evt.key == "r") {
                this.manager.setNewMode(3);
                this.showMode();
            } else if (evt.key == "s") {
                this.manager.setNewMode(2);
                this.showMode();
            } else if (evt.key == "d") {
                this.manager.setNewMode(0);
                this.showMode();
            }
        };
    },
});

export default UIController;
