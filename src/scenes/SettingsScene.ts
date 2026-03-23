/**
 * File: src/scenes/SettingsScene.ts
 * Purpose:
 * - Oyun ayarlarını yönetir
 */

import Phaser from "phaser"

export default class SettingsScene extends Phaser.Scene
{
    constructor()
    {
        super("SettingsScene")
    }

    preload()
    {
        this.load.image("menu_bg", "assets/bg/bg03.png")

        this.load.image("btn_back", "assets/ui/btn_exit.png")
        this.load.image("btn_toggle_on", "assets/ui/btn_sound.png")
        this.load.image("btn_toggle_off", "assets/ui/btn_sound.png")
    }

    create()
    {
        const { width, height } = this.scale

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        // =========================
        // TITLE
        // =========================
        this.add.text(width/2, 200, "SETTINGS", {
            fontSize: "40px"
        }).setOrigin(0.5)

        // =========================
        // SOUND TOGGLE
        // =========================
        let soundOn = true

        const soundText = this.add.text(
            width/2 - 100,
            400,
            "SOUND",
            { fontSize: "28px" }
        ).setOrigin(0.5)

        const soundBtn = this.add.image(
            width/2 + 150,
            400,
            "btn_toggle_on"
        )
        .setScale(0.5)
        .setInteractive()

        soundBtn.on("pointerdown", () => {

            soundOn = !soundOn

            soundBtn.setAlpha(soundOn ? 1 : 0.4)

            console.log("Sound:", soundOn)
        })

        // =========================
        // BACK BUTTON
        // =========================
        const backBtn = this.add.image(
            width/2,
            height - 200,
            "btn_back"
        )
        .setScale(0.5)
        .setInteractive()

        backBtn.on("pointerdown", () => {
            this.scene.start("MainMenuScene")
        })
    }
}