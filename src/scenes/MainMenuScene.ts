/**
 * File: MainMenuScene.ts
 * Purpose: Ana menü (styled)
 */

import Phaser from "phaser"

export default class MainMenuScene extends Phaser.Scene
{
    constructor()
    {
        super("MainMenuScene")
    }

    preload()
    {
        // 👇 BURAYA EKLİYORUZ
        this.load.image("menu_bg", "assets/bg/bg00.png")
    }

    create()
    {
        const width = this.scale.width
        const height = this.scale.height

        // 🌄 BACKGROUND
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        // 🎯 TITLE
        const title = this.add.text(
            width/2,
            height/2 - 120,
            "PATH BOARD GAME",
            {
                fontSize: "54px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 6
            }
        ).setOrigin(0.5)

        // 🎮 PLAY BUTTON
        const playBtn = this.add.text(
            width/2,
            height/2,
            "PLAY",
            {
                fontSize: "36px",
                color: "#00ffcc",
                backgroundColor: "#111",
                padding: { x: 30, y: 15 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })

        // 🟢 HOVER
        playBtn.on("pointerover", () => playBtn.setScale(1.1))
        playBtn.on("pointerout", () => playBtn.setScale(1))

        // 🎬 CLICK
        playBtn.on("pointerdown", () => {

            this.tweens.add({
                targets: playBtn,
                scale: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.start("GameScene")
                }
            })

        })

        // ✨ FADE
        this.cameras.main.fadeIn(400)
    }
}