/**
 * File: src/scenes/MainMenuScene.ts
 * Purpose: Modern ana menü UI (background + buttons + icons)
 */

import Phaser from "phaser"

import { PlayerService } from "../core/PlayerService"
import { SettingsService } from "../core/SettingsService"
import { SoundService } from "../core/SoundService"
import RewardService from "../services/RewardService"
import AdService from "../services/AdService"
import AdFlowService from "../services/AdFlowService"
import { GameConfig } from "../config/GameConfig"

export default class MainMenuScene extends Phaser.Scene
{




    constructor()
    {
        super("MainMenuScene")
    }

    preload()
    {
        // BACKGROUND


        // BUTTONS



        // ICONS
        

    }

    async create()
    {

        PlayerService.init()
        SettingsService.init()
        SoundService.init(this)

        await AdService.init()
        let isAdLoading = false
        let isNavigating = false
        AdService.showBanner()
        await AdService.preloadRewarded()
        
        const { width, height } = this.scale

        const baseW = GameConfig.BASEW
        const baseH = GameConfig.BASEH

        const scaleX = width / baseW
        const scaleY = height / baseH

        const centerX = width / 2
        const centerY = height / 2

        const iconW = 250

        // ======================
        // BACKGROUND
        // ======================
        const bg = this.add.image(centerX, height/2, "menu_bg")
        //bg.setDisplaySize(width * 1.2, height * 1.2)
        const scaleX_bg = width / bg.width
        const scaleY_bg = height / bg.height

        const scale = Math.max(scaleX_bg, scaleY_bg)

        bg.setScale(scale)


        // ======================
        // PLAYER
        // ======================

        const player = PlayerService.get()
  
        const avatar = this.add.image(150 * scaleX, 120 * scaleY, player.avatar)
            .setDisplaySize(150, 150)
            .setDepth(10)



        this.add.text(230 * scaleX, 100 * scaleY -20, player.name, {
            fontFamily: "Orbitron",
            fontSize: "59px",
            color: "#ffffff",
            fontStyle: "bold",
             stroke: "#000000",
            strokeThickness: 4
        })



        const goldText = this.add.text(width - (120 * scaleX) - 150, 100 * scaleY - 20, `${player.gold}`, {
            fontFamily: "Orbitron",
            fontSize: "69px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4
        })



        /*
        this.add.text(width - (120 * scaleX) - 140, 140 * scaleY  + 15, "GOLD", {
            fontFamily: "Orbitron",
            fontSize: "31px",
            fontStyle: "bold",
            color: "#ffffff"
        })
        */

        // ======================
        // TITLE
        // ======================
        const title = this.add.image(centerX, centerY - (350 * scaleY), "title")

        // ======================
        // BUTTONS
        // ======================

        //const btnMultiplayer = this.add.image(centerX, 666 * scaleY, "btn_arena")
        const btnArena = this.add.image(centerX, centerY, "btn_arena")
        //const btnPlayfriend  = this.add.image(centerX, 933* scaleY, "btn_playfriend")

        const btnSettings = this.add.image(centerX - iconW, centerY + (350 * scaleY), "btn_settings")
        //const btn_sound   = this.add.image(centerX, centerY + (350 * scaleY), "btn_sound")
        const btn_shop    = this.add.image(centerX + iconW, centerY + (350 * scaleY), "btn_shop")

        // ======================
        // SCALE
        // ======================
        btnSettings.setScale(0.5)
        //btn_sound.setScale(0.5)
        btn_shop.setScale(0.5)

        // ======================
        // INTERACTION
        // ======================
        btnArena.setInteractive({ useHandCursor: true })
       // btnPlayfriend.setInteractive({ useHandCursor: true })
        btnSettings.setInteractive({ useHandCursor: true })
        //btn_sound.setInteractive({ useHandCursor: true })
        btn_shop.setInteractive({ useHandCursor: true })

        //const buttons = [btnMultiplayer, btnPlayfriend]
        const buttons = [btnArena]
        const buttons02 = [btnSettings, //btn_sound,
         btn_shop]

        // ======================
        // SECONDARY BUTTON EFFECTS
        // ======================
        buttons02.forEach((btn, index) => {

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

            btn.on("pointerdown", () => {

                this.tweens.add({
                    targets: btn,
                    scale: 0.45,
                    duration: 80,
                    yoyo: true
                })

                this.cameras.main.shake(100, 0.003)
                this.addConfettiExplosion(btn.x, btn.y)
            })

            this.tweens.add({
                targets: btn,
                scale: { from: 0.5, to: 0.52 },
                duration: 2000 + index * 300,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            })

            this.tweens.add({
                targets: btn,
                alpha: { from: 1, to: 0.8 },
                duration: 1800 + index * 200,
                yoyo: true,
                repeat: -1
            })
        })

        // ======================
        // TITLE ANIMATION
        // ======================
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
                alpha: { from: 1, to: 0.9 },
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

        btnArena.on("pointerdown", async () => {

            if (isNavigating) return
            isNavigating = true

            SoundService.play("click")

            this.addConfettiExplosion(this.scale.width/2, 600)
            this.cameras.main.shake(150, 0.01)

            //AdService.hideBanner()

            try {

                if (AdFlowService.shouldShowInterstitial())
                {
                    await AdService.showInterstitial()
                    await new Promise(r => setTimeout(r, 200))
                }

            } catch(e) {
                console.log(e)
            }

            this.scene.start("MatchmakingScene")

            isNavigating = false
        })

        btnSettings.on("pointerdown", () => {
            SoundService.play("click")
            this.scene.start("SettingsScene")
        })

        btn_shop.on("pointerdown", () => {
            SoundService.play("click")
            this.scene.start("ShopScene")
        })

        /*
        btnPlayfriend.on("pointerdown", () => {

            this.addConfettiRain()
            this.cameras.main.shake(200, 0.01)

            // this.scene.start("GameScene")
        })
            */


        // ======================
        // REWARDED BUTTON
        // ======================

        const rewardText = this.add.text(width / 2, height - 350, "", {
            fontFamily: "Orbitron",
            fontSize: "49px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(20)

        rewardText.setInteractive({ useHandCursor: true })

        const cooldownText = this.add.text(width / 2, height - 275, "", {
            fontFamily: "Orbitron",
            fontSize: "29px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 2
        })
        .setOrigin(0.5)
        .setDepth(20)

        const updateRewardText = () => {

            const remaining = RewardService.getRemaining()
            const max = GameConfig.REWARDED.maxViews
            const reward = GameConfig.REWARDED.rewardGold

            rewardText.setText(`WATCH AD +${reward} (${remaining}/${max})`)

            if (remaining <= 0) {
                rewardText.setAlpha(0.4)
            } else {
                rewardText.setAlpha(1)
            }
        }

        const updateCooldown = () => {

            const state = RewardService.getState()
            const now = Date.now()

            if (state.timestamps.length === 0) {
                cooldownText.setText("")
                return
            }

            const first = state.timestamps[0]
            const remainingMs = GameConfig.REWARDED.cooldownMs - (now - first)

            if (remainingMs <= 0) {
                cooldownText.setText("")
                return
            }

            const sec = Math.floor(remainingMs / 1000)
            const min = Math.floor(sec / 60)
            const s = sec % 60

            cooldownText.setText(`NEXT IN ${min}:${s.toString().padStart(2, "0")}`)
        }


        rewardText.on("pointerdown", async () => {

            if (isAdLoading) return

            if (!RewardService.canWatch()) {
                updateRewardText()
                updateCooldown()
                return
            }

            isAdLoading = true

            rewardText.setText("LOADING...")
            rewardText.disableInteractive()

            const success = await AdService.showRewarded()

            rewardText.setInteractive({ useHandCursor: true })
            isAdLoading = false

            if (success) {

                RewardService.registerWatch()

                const player = PlayerService.get()

                PlayerService.update({
                    gold: player.gold + GameConfig.REWARDED.rewardGold
                })

                const updatedPlayer = PlayerService.get()
                goldText.setText(`${updatedPlayer.gold}`)
            }

            updateRewardText()
            updateCooldown()
        })

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                updateRewardText()
                updateCooldown()
            }
        })

        updateRewardText()
        updateCooldown()

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

        particles.setDepth(999)

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