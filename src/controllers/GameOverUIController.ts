/**
 * File: src/ui/GameOverUIController.ts
 * Purpose: FULL IMAGE BASED GAME OVER UI
 */

import Phaser from "phaser"
import GameScene from "../scenes/GameScene"

export default class GameOverUIController
{
    scene: GameScene

    constructor(scene: GameScene)
    {
        this.scene = scene
    }

    show(result: any)
    {
        const width = this.scene.scale.width
        const height = this.scene.scale.height

        // =========================
        // OVERLAY
        // =========================
        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        )

        overlay
            .setScrollFactor(0)
            .setDepth(99990)

        // =========================
        // RESULT IMAGE
        // =========================

        const myPlayerId = 1 // 🔥 SEN = PLAYER 1

        let key = "ui_lost"

        if(result.type === "WIN")
        {
            if(result.winner === myPlayerId)
            {
                key = "ui_win"
            }
            else
            {
                key = "ui_lost"
            }
        }
        else if(result.type === "DRAW")
        {
            key = "ui_draw"
        }

        const img = this.scene.add.image(
            width / 2,
            height / 2 - 500,
            key
        )

        img
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(99999)
            .setScale(1)
            .setAlpha(0.8)

        // =========================
        // MENU BUTTON
        // =========================
        const menuBtn = this.scene.add.image(
            width / 2,
            height / 2 - 100,
            "btn_home"
        )

        menuBtn
            .setDepth(99999)
            .setScale(0.5)
            .setInteractive({ useHandCursor: true })

        menuBtn.on("pointerdown", () => {
            this.scene.scene.stop("GameScene")
            this.scene.scene.start("MainMenuScene")
        })

        // =========================
        // ANIMATIONS
        // =========================

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 300
        })

        // 🎯 sağa sola sallanma
        this.scene.tweens.add({
            targets: img,
            angle: { from: -3, to: 3 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })

        // ❤️ HEART BEAT BUTTON
        this.scene.tweens.add({
            targets: menuBtn,
            scale: { from: 0.45, to: 0.55 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })

        // =========================
        // EFFECT
        // =========================
        if(result.type === "WIN" && result.winner === myPlayerId)
        {
            this.scene.effectController.addConfettiExplosion(width / 2, 0)
        }
        else
        {
            this.scene.effectController.shake()
        }
    }
}