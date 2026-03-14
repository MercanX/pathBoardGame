/**
 * File: BootScene.ts
 * Purpose: Oyunun ilk yükleme sahnesi
 */

import Phaser from "phaser"

export default class BootScene extends Phaser.Scene
{
    constructor()
    {
        super("BootScene")
    }

    preload()
    {
        console.log("BootScene preload")
    }

    create()
    {
        this.scene.start("MainMenuScene")
    }
}