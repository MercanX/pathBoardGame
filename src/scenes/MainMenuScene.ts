/**
 * File: src/scenes/MainMenuScene.ts
 * Purpose: Modern ana menü UI (background + buttons + icons)
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
        // BACKGROUND
        this.load.image("menu_bg", "assets/bg/bg03.png")
        this.load.image("title", "assets/ui/logo01.png")


        // BUTTONS
        this.load.image("btn_multiplayer", "assets/ui/multiplayerbtn.png")
        this.load.image("btn_playfriend", "assets/ui/playfriendbtn.png")
        this.load.image("btn_settings", "assets/ui/btn_settings.png")
        this.load.image("btn_help", "assets/ui/btn_help.png")
        this.load.image("btn_shop", "assets/ui/btn_shop.png")
        this.load.image("btn_sound", "assets/ui/btn_sound.png")
        this.load.image("btn_help", "assets/ui/btn_help.png")

        // ICONS
        this.load.image("confetti", "assets/ui/confetti.png")
    }

    create()
    {
        const { width, height } = this.scale
        const iconW=250

        // ======================
        // BACKGROUND
        // ======================
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        // ======================
        // TITLE
        // ======================
       const title = this.add.image(width/2, 300, "title")

        // ======================
        // BUTTONS
        // ======================

 
        const btnMultiplayer = this.add.image(width/2, 666, "btn_multiplayer")
        const btnPlayfriend  = this.add.image(width/2, 933, "btn_playfriend")

        const btnSettings = this.add.image(width/2-iconW, height-500, "btn_settings")
        const btn_sound  = this.add.image(width/2, height-500, "btn_sound")
        const btn_shop  = this.add.image(width/2+iconW, height-500, "btn_shop")

        // ======================
        // BOTTOM ICONS
        // ======================


        btnSettings.setScale(0.5)
        btn_sound.setScale(0.5)
        btn_shop.setScale(0.5)

        btnMultiplayer.setInteractive({ useHandCursor: true })
        btnPlayfriend.setInteractive({ useHandCursor: true })
        btnSettings.setInteractive({ useHandCursor: true })
        btn_sound.setInteractive({ useHandCursor: true })
        btn_shop.setInteractive({ useHandCursor: true })




        const buttons = [btnMultiplayer, btnPlayfriend]
        const buttons02 = [btnSettings,btn_sound,btn_shop]


        // ======================
        // SECONDARY BUTTON EFFECTS (BOTTOM GROUP)
        // ======================

        buttons02.forEach((btn, index) => {

            // Hover scale (mobilde pointerover çalışmayabilir ama desktop için iyi)
            btn.on("pointerover", () => {
                this.tweens.add({
                    targets: btn,
                    scale: 0.6,
                    duration: 150,
                    ease: "Back.easeOut"
                })
            })

            btn.on("pointerout", () => {
                this.tweens.add({
                    targets: btn,
                    scale: 0.5,
                    duration: 150
                })
            })

            // Click feedback (çok önemli hissiyat)
            btn.on("pointerdown", () => {

                this.tweens.add({
                    targets: btn,
                    scale: 0.45,
                    duration: 80,
                    yoyo: true
                })

                // küçük shake efekti
                this.cameras.main.shake(100, 0.003)

                // mini sparkle (confetti mini)
                this.addConfettiExplosion(btn.x, btn.y)
            })


            // Idle breathing (çok hafif)
            this.tweens.add({
                targets: btn,
                scale: { from: 0.5, to: 0.52 },
                duration: 2000 + index * 300,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            })

            // Glow pulse (alpha)
            this.tweens.add({
                targets: btn,
                alpha: { from: 1, to: 0.8 },
                duration: 1800 + index * 200,
                yoyo: true,
                repeat: -1
            })
        })

        const animateTitle = () => {

            const yOffset = Phaser.Math.Between(-100, 100)
            const xOffset = Phaser.Math.Between(-100, 100)

            this.tweens.add({
                targets: title,
                x: title.x - xOffset,
                y: title.y - yOffset,
                duration: 3500,
                scale: { from: 1, to: 1.03 },
                angle: Phaser.Math.Between(-5, 5),
                yoyo: true,
                ease: "Sine.easeInOut",
                onComplete: animateTitle
            })
        }

        animateTitle()
            
        buttons.forEach(btn => {

            this.time.addEvent({
                delay: Phaser.Math.Between(3000, 8000),
                loop: true,
                callback: () => {

                    this.tweens.add({
                        targets: btn,
                        angle: { from: 0, to: 5 },
                        duration: 200,
                        yoyo: true,
                        repeat: 3
                    })

                }
            })

        })
        
        buttons.forEach(btn => {
            this.tweens.add({
                targets: btn,
                alpha: { from: 1, to: 0.7 },
                duration: 2000,
                yoyo: true,
                repeat: -1
            })
        })

        buttons.forEach(btn => {
            this.tweens.add({
                targets: btn,
                y: btn.y - 10,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            })
        })

        // ======================
        // BUTTON ACTIONS
        // ======================

        btnMultiplayer.on("pointerdown", () => {
            this.scene.start("GameScene")
        })



        btnSettings.on("pointerdown", () => {
            console.log("OPEN SETTINGS")
        })

        btnPlayfriend.on("pointerdown", () => {

            this.addConfettiRain()

            this.cameras.main.shake(200, 0.01)

            //this.scene.start("GameScene")
        })



        //this.addConfettiExplosion(this.scale.width / 2, this.scale.height / 2)
        //this.addConfettiRain()
        //this.cameras.main.shake(1000, 0.01)

        
    }

    addConfettiRain()
    {
        const particles = this.add.particles(0, 0, "confetti", {

            x: { min: 0, max: this.scale.width },
            y: 0,

            speedY: { min: 200, max: 400 },
            speedX: { min: -100, max: 100 },

            scale: { start: 0.35, end: 0.1 },
            rotate: { min: 0, max: 360 },

            lifespan: 4000,
            gravityY: 200,

            quantity: 3,
            frequency: 100
        })

        // depth ver (UI üstünde görünsün)
        particles.setDepth(999)

        // İstersen durdurabilirsin
        this.time.delayedCall(5000, () => {
            particles.destroy()
        })
    }


    addConfettiExplosion(x: number, y: number)
    {
        const particles = this.add.particles(x, y, "confetti", {

            angle: { min: 0, max: 360 },

            speed: { min: 400, max: 900 },

            scale: { start: 0.2, end: 0.3 },

            rotate: { min: 0, max: 360 },

            gravityY: 500,

            lifespan: { min: 1500, max: 2500 },

            // 💥 EN KRİTİK KISIM
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 80)
            } as Phaser.Types.GameObjects.Particles.EmitZoneData
        })

        particles.setDepth(999)

        particles.emitParticle(150)

        this.time.delayedCall(2500, () => {
            particles.destroy()
        })
    }


}