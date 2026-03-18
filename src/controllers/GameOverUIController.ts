import Phaser from "phaser"
import GameScene from "../scenes/GameScene"

export default class GameOverUIController
{
    scene: GameScene

    constructor(scene: GameScene)
    {
        this.scene = scene
    }

    show(result:any)
    {

        const width = this.scene.scale.width
        const height = this.scene.scale.height

        // BACKGROUND
        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width+200,
            height+200,
            0x000000,
            0.6
        )

        overlay.setDepth(99990)

        // TEXT
        let text = "GAME OVER"
        console.log(text)

        if(result.type === "WIN")
        {
            text = `PLAYER ${result.winner} WINS`
        }
        else if(result.type === "DRAW")
        {
            text = "DRAW"
        }

        const label = this.scene.add.text(
            width / 2,
            height / 2 - 40,
            text,
            {
                fontSize: "42px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        )

        label.setOrigin(0.5)
        label.setDepth(99991)
        label.setScale(0)

        // BUTTON
        const btn = this.scene.add.text(
            width / 2,
            height / 2 + 50,
            "RESTART",
            {
                fontSize: "28px",
                color: "#00ffcc",
                backgroundColor: "#111",
                padding: { x: 16, y: 8 }
            }
        )

        btn.setOrigin(0.5)
        btn.setDepth(99991)
        btn.setInteractive({ useHandCursor: true })
        btn.setScale(0)

        btn.on("pointerdown", () => {

            this.scene.scene.stop("GameScene")
            this.scene.scene.start("MainMenuScene")

        })

        // LAYER
        this.scene.add.existing(overlay)
        this.scene.add.existing(label)
        this.scene.add.existing(btn)

        overlay.setScrollFactor(0)
        label.setScrollFactor(0)
        btn.setScrollFactor(0)

        // 🎬 ANIMATIONS

        // overlay fade
        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 300,
            ease: "Power2"
        })

        // label pop-in
        this.scene.tweens.add({
            targets: label,
            scale: 1,
            duration: 400,
            ease: "Back.Out"
        })

        // button pop-in (delay ile)
        this.scene.tweens.add({
            targets: btn,
            scale: 1,
            duration: 400,
            delay: 150,
            ease: "Back.Out"
        })

         console.log(text)
    }

}