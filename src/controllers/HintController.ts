/**
 * File: src/controllers/HintController.ts
 * Purpose: Lightweight guided hint system (non-blocking)
 */

import Phaser from "phaser"

export default class HintController
{
    step: number = 0

    private currentHighlight?: Phaser.GameObjects.Arc


    private arrow?: Phaser.GameObjects.Image
    private hintText?: Phaser.GameObjects.Text

    private isFirstTime: boolean = true

    private shown =
    {
        map: false,
        change: false
    }


    constructor()
    {
        const saved = localStorage.getItem("tutorial_done")

        this.isFirstTime = saved !== "1"

        console.log("Hint başladı | firstTime:", this.isFirstTime)
    }



    
    // ======================
    // STEP 1
    // ======================
    onCardSelected(btnRotate: Phaser.GameObjects.Image)
    {
        if(!this.isFirstTime) return

        if(this.step === 0)
        {
            this.clearArrow()
            console.log("👉 Rotate yap")

            this.showArrow(btnRotate, "Rotate yap")

            this.step = 1
        }
    }

    // ======================
    // STEP 2
    // ======================
    onRotate()
    {
        if(!this.isFirstTime) return
        if(this.step === 1)
        {
            console.log("👉 Kartı yerleştir")

            this.clearArrow()

            this.step = 2
        }
    }

    // ======================
    // STEP 3
    // ======================
    onPlace()
    {
        if(!this.isFirstTime) return
        if(this.step === 2)
        {
            console.log("👉 Bot oynuyor")

            this.clearArrow()

            this.step = 3
        }
    }

    // ======================
    // STEP 4
    // ======================
    onBotPlayed(btnMap: Phaser.GameObjects.Image)
    {
        if(!this.isFirstTime) return
        if(this.step === 3 && !this.shown.map)
        {
            console.log("👉 Map aç")

            this.showArrow(btnMap, "Map aç")

            this.shown.map = true
            this.step = 4
        }
    }

    // ======================
    // STEP 5
    // ======================
    onMapOpened(btnMap: Phaser.GameObjects.Image)
    {
        if(!this.isFirstTime) return

        if(this.step === 4)
        {
            console.log("👉 Map kapat")

            this.showArrow(btnMap, "Kapat")

            this.step = 5
        }
    }

    // ======================
    // STEP 6
    // ======================
    onMapClosed(btnRotate: Phaser.GameObjects.Image)
    {
        if(!this.isFirstTime) return
        if(this.step === 5)
        {
            console.log("👉 Devam et")

            this.clearArrow()

            localStorage.setItem("tutorial_done", "1")
            this.isFirstTime = false

            this.step = 0
        }
    }
    // ======================
    // OPTIONAL
    // ======================
    onChangeOpened()
    {
        if(!this.isFirstTime) return 
        if(this.shown.change) return

        console.log("👉 Kart değiştir")

        this.shown.change = true
    }

    // ======================
    // HIGHLIGHT SYSTEM
    // ======================
    showHighlight(target: Phaser.GameObjects.Image)
    {
        const scene = target.scene

        // 🔥 eski highlight temizle
        this.clearHighlight()

        const glow = scene.add.circle(
            target.x,
            target.y,
            60,
            0xffff00,
            0.25
        )

        glow.setDepth(99999)
        glow.setScrollFactor(0)

        scene.tweens.add({
            targets: glow,
            scale: 1.3,
            alpha: 0,
            duration: 800,
            repeat: -1
        })

        this.currentHighlight = glow
    }

    clearHighlight()
    {
        if(this.currentHighlight)
        {
            this.currentHighlight.destroy()
            this.currentHighlight = undefined
        }
    }

showArrow(target: Phaser.GameObjects.Image, text: string)
{
    const scene = target.scene

    // eski temizle
    this.clearArrow()

    // ARROW
    const arrow = scene.add.image(
        target.x,
        target.y - 90,
        "arrow_down" // 🔥 asset ekleyeceğiz
    )

    arrow.setDepth(99999)
    arrow.setScrollFactor(0)
    arrow.setScale(0.6)

    scene.tweens.add({
        targets: arrow,
        y: arrow.y + 10,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
    })

    // TEXT
    const hintText = scene.add.text(
        target.x,
        target.y - 140,
        text,
        {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }
    ).setOrigin(0.5)

    hintText.setDepth(99999)
    hintText.setScrollFactor(0)

    this.arrow = arrow
    this.hintText = hintText
}
clearArrow()
{
    if(this.arrow)
    {
        this.arrow.destroy()
        this.arrow = undefined
    }

    if(this.hintText)
    {
        this.hintText.destroy()
        this.hintText = undefined
    }
}

showHandHint(uiLayer: Phaser.GameObjects.Container, screenHeight: number)
{
    if(!this.isFirstTime) return
    const scene = uiLayer.scene

    this.clearArrow()

    const x = scene.scale.width / 2
    const y = screenHeight - 180 // 👈 hand bölgesi

    const arrow = scene.add.image(x, y, "arrow_down")
    arrow.setDepth(99999)
    arrow.setScrollFactor(0)
    arrow.setScale(0.6)

    scene.tweens.add({
        targets: arrow,
        y: arrow.y + 10,
        duration: 600,
        yoyo: true,
        repeat: -1
    })

    const text = scene.add.text(
        x,
        y - 50,
        "Kart seç",
        {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }
    ).setOrigin(0.5)

    text.setDepth(99999)
    text.setScrollFactor(0)

    this.arrow = arrow
    this.hintText = text
}

showBoardHint()
{
    const scene = this.arrow?.scene || null

    if(!scene) return

    this.clearArrow()

    const x = scene.scale.width / 2
    const y = scene.scale.height / 2

    const arrow = scene.add.image(x, y - 100, "arrow_down")
    arrow.setDepth(99999)
    arrow.setScrollFactor(0)
    arrow.setScale(0.7)

    scene.tweens.add({
        targets: arrow,
        y: arrow.y + 20,
        duration: 600,
        yoyo: true,
        repeat: -1
    })

    const text = scene.add.text(
        x,
        y - 150,
        "Buraya tıkla",
        {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }
    ).setOrigin(0.5)

    text.setDepth(99999)
    text.setScrollFactor(0)

    this.arrow = arrow
    this.hintText = text
}

showBoardPulse(worldX: number, worldY: number, scene: Phaser.Scene)
{
    this.clearArrow()

    const core = scene.add.circle(worldX, worldY, 20, 0xff3b3b, 0.8)
    core.setDepth(99999)

    const ring = scene.add.circle(worldX, worldY, 40, 0xff3b3b, 0.3)
    ring.setDepth(99999)

    scene.tweens.add({
        targets: ring,
        scale: 1.6,
        alpha: 0,
        duration: 800,
        repeat: -1
    })

    scene.tweens.add({
        targets: core,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: -1
    })

    this.arrow = core as any
    this.hintText = ring as any
}

}