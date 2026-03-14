/**
 * File: MainMenuScene.ts
 * Purpose: Ana menü
 */

import Phaser from "phaser"

export default class MainMenuScene extends Phaser.Scene
{
    constructor()
    {
        super("MainMenuScene")
    }

    create()
    {
        const text = this.add.text(
            400,
            250,
            "PATH BOARD GAME",
            { fontSize: "42px", color: "#ffffff" }
        )

        text.setOrigin(0.5)

        const start = this.add.text(
            400,
            350,
            "CLICK TO START",
            { fontSize: "28px", color: "#00ff00" }
        )

        start.setOrigin(0.5)

        this.input.once("pointerdown", () =>
        {
            this.scene.start("GameScene")
        })
    }
}