/**
 * File: src/scenes/MatchmakingScene.ts
 * File Name: MatchmakingScene.ts
 * Purpose:
 * - Multiplayer tıklanınca sahte online eşleşme akışını yönetir.
 * - "Rakip aranıyor" ekranını gösterir.
 * - Rastgele bir süre bekler.
 * - "Eşleşme bulundu" ekranını gösterir.
 * - Kısa bir bekleme sonrası GameScene'e geçer.
 *
 * Notes:
 * - Bu sürüm mevcut GameScene akışını bozmadan çalışır.
 * - Şu an gerçek socket / network sistemi yoktur.
 * - Fake matchmaking UX akışı sağlar.
 * - UI image-based olacak şekilde hazırlanmıştır.
 */

import Phaser from "phaser"
import { PlayerService } from "../core/PlayerService"
import { generateBot } from "../core/BotGenerator"
import { SoundService } from "../core/SoundService"
import { GameConfig } from "../config/GameConfig"

export default class MatchmakingScene extends Phaser.Scene
{
    searchingBg!: Phaser.GameObjects.Rectangle
    searchingPanel!: Phaser.GameObjects.Image
    searchingSpinner!: Phaser.GameObjects.Image

    matchFoundOverlay!: Phaser.GameObjects.Rectangle
    matchFoundPanel!: Phaser.GameObjects.Image

    searchingLoopEvent?: Phaser.Time.TimerEvent
    matchDelayEvent?: Phaser.Time.TimerEvent
    startGameEvent?: Phaser.Time.TimerEvent

    selectedBot: any

    constructor()
    {
        super("MatchmakingScene")
    }

    preload()
    {
        /**
         * Burada kullandığım asset isimleri örnek.
         * Eğer bu assetler sende henüz yoksa:
         * 1) aynı key ile gerçek image ekle
         * 2) ya da geçici olarak mevcut assetlerinle değiştir
         */

        // Searching ekranı için
        this.load.image("ui_searching_panel", "assets/ui/searching_panel.png")
        this.load.image("ui_searching_spinner", "assets/ui/btn_rotate.png")

        // Match found ekranı için
        this.load.image("ui_match_found_panel", "assets/ui/match_found_panel.png")


        this.load.image("avatar_player", "assets/ui/avatar_player.png")
        this.load.image("avatar_enemy", "assets/ui/avatar_enemy.png")
        this.load.image("ui_vs", "assets/ui/vs.png")

        for(let i = 1; i <= 5; i++)
        {
            this.load.image(`avatar_${i}`, `assets/ui/avatar_${i}.png`)
        }


    }

    create()
    {
        const width = this.scale.width
        const height = this.scale.height

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(
            width / 2,
            height / 2,
            "menu_bg"
        )

        bg.setDisplaySize(width, height)

        SoundService.init(this)

        // =========================
        // SEARCHING OVERLAY
        // =========================
        this.searchingBg = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.45
        )

        this.searchingBg
            .setDepth(100)
            .setScrollFactor(0)

        // =========================
        // SEARCHING PANEL
        // =========================
        this.searchingPanel = this.add.image(
            width / 2,
            height / 2 - 80,
            "ui_searching_panel"
        )

        this.searchingPanel
            .setDepth(110)
            .setScrollFactor(0)

        // =========================
        // SEARCHING SPINNER
        // =========================
        this.searchingSpinner = this.add.image(
            width / 2,
            height / 2 + 180,
            "ui_searching_spinner"
        )

        this.searchingSpinner
            .setDepth(111)
            .setScrollFactor(0)
            .setScale(0.45)

        // sonsuz dönme efekti
        this.searchingLoopEvent = this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
                if(this.searchingSpinner && this.searchingSpinner.active)
                {
                    this.searchingSpinner.angle += 3
                }
            }
        })

        // panel giriş animasyonu
        this.searchingPanel.setAlpha(0)
        this.searchingPanel.setScale(0.45)

        this.tweens.add({
            targets: this.searchingPanel,
            alpha: 1,
            scale: 0.5,
            duration: 300,
            ease: "Back.easeOut"
        })

        this.searchingSpinner.setAlpha(0)

        this.tweens.add({
            targets: this.searchingSpinner,
            alpha: 1,
            duration: 250,
            delay: 120,
            ease: "Sine.easeOut"
        })

        // =========================
        // RANDOM WAIT
        // =========================
        // Online oyuncu aranıyormuş hissi için random süre
        // İstersen bunu sonra 2-6 sn, 3-7 sn vb. değiştiririz
        const randomWaitMs = Phaser.Math.Between(
            GameConfig.MATCHMAKING.minWaitMs,
            GameConfig.MATCHMAKING.maxWaitMs
        )
        //GameConfig.BASEW

        this.matchDelayEvent = this.time.delayedCall(randomWaitMs, () => {
            this.showVSIntro()
        })

        this.selectedBot = generateBot()

        const randomAvatarIndex = Phaser.Math.Between(1, 5)
        this.selectedBot.avatar = `avatar_${randomAvatarIndex}`

    }

    showMatchFound()
    {
        const width = this.scale.width
        const height = this.scale.height

        // Searching UI kapat
        if(this.searchingLoopEvent)
        {
            this.searchingLoopEvent.remove(false)
            this.searchingLoopEvent = undefined
        }

        if(this.searchingPanel && this.searchingPanel.active)
        {
            this.searchingPanel.destroy()
        }

        if(this.searchingSpinner && this.searchingSpinner.active)
        {
            this.searchingSpinner.destroy()
        }

        // =========================
        // MATCH FOUND OVERLAY
        // =========================
        this.matchFoundOverlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.55
        )

        this.matchFoundOverlay
            .setDepth(120)
            .setScrollFactor(0)

        // =========================
        // MATCH FOUND PANEL
        // =========================
        this.matchFoundPanel = this.add.image(
            width / 2,
            height / 2,
            "ui_match_found_panel"
        )

        this.matchFoundPanel
            .setDepth(121)
            .setScrollFactor(0)
            .setScale(0.4)
            .setAlpha(0)

        this.tweens.add({
            targets: this.matchFoundPanel,
            alpha: 1,
            scale: 0.5,
            duration: 350,
            ease: "Back.easeOut"
        })

        // hafif pulse
        this.tweens.add({
            targets: this.matchFoundPanel,
            scale: { from: 0.52, to: 0.56 },
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })

        // =========================
        // START GAME AFTER DELAY
        // =========================
        this.time.delayedCall(1200, () => {
            this.showVSIntro()
        })
    }

    shutdownCleanup()
    {
        if(this.searchingLoopEvent)
        {
            this.searchingLoopEvent.remove(false)
            this.searchingLoopEvent = undefined
        }

        if(this.matchDelayEvent)
        {
            this.matchDelayEvent.remove(false)
            this.matchDelayEvent = undefined
        }

        if(this.startGameEvent)
        {
            this.startGameEvent.remove(false)
            this.startGameEvent = undefined
        }
    }

    shutdown()
    {
        this.shutdownCleanup()
    }

    destroy()
    {
        this.shutdownCleanup()
    }


showVSIntro()
{
    const width = this.scale.width
    const height = this.scale.height
    const impactTime = 350

    // temizle
    this.children.removeAll()

    const playerData = PlayerService.get()


    const createPlayerInfo = (x: number, y: number, data: any) =>
    {
        this.add.text(x, y, data.name, {
            fontSize: "52px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(230)

        this.add.text(x, y + 40, "Rating: " + data.rating, {
            fontSize: "44px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(230)

        this.add.text(x, y + 80, `${data.wins}W - ${data.losses}L`, {
            fontSize: "44px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(230)
    }

    // =========================
    // BACKGROUND IMAGE (VS BG)
    // =========================
    const bg = this.add.image(
        width / 2,
        height / 2,
        "menu_bg"
    )

    bg
        .setDisplaySize(width, height)
        .setDepth(190)

    // =========================
    // DARK OVERLAY
    // =========================
    const overlay = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.7
    )
    .setDepth(200)

    // =========================
    // AVATARS
    // =========================
    const player = this.add.image(
        width / 2 - 250,
        height / 2,
        playerData.avatar
    )
    .setDepth(210)
    .setScale(0.8)

    const enemy = this.add.image(
        width / 2 + 250,
        height / 2,
        this.selectedBot.avatar
    )
    .setDepth(210)
    .setScale(0.8)

    // =========================
    // PLAYER INFO
    // =========================

    createPlayerInfo(width / 2 - 250, height / 2 + 120, playerData)

    // =========================
    // BOT INFO
    // =========================
    createPlayerInfo(width / 2 + 250, height / 2 + 120, this.selectedBot)

    // =========================
    // VS IMAGE
    // =========================
    const vs = this.add.image(
        width / 2,
        height / 2 - 400,
        "ui_vs"
    )
    .setDepth(220)
    .setScale(0.15)
    .setAlpha(0)

    // =========================
    // FLASH EFFECT
    // =========================
    const flash = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0xffffff,
        1
    )
    .setDepth(300)
    .setAlpha(0)

    this.tweens.add({
        targets: flash,
        alpha: { from: 0.8, to: 0 },
        duration: 250,
        delay: impactTime,
        ease: "Cubic.easeOut"
    })

    // =========================
    // SOUND + CAMERA IMPACT
    // =========================
    this.time.delayedCall(impactTime, () => {
        SoundService.play("vs_impact")
        this.cameras.main.shake(250, 0.01)
        this.cameras.main.flash(150, 255, 255, 255)
    })

    // =========================
    // ENTRY ANIMATION
    // =========================

    // player soldan gelir
    player.x = width / 2 - 600
    this.tweens.add({
        targets: player,
        x: width / 2 - 250,
        duration: 400,
        ease: "Back.easeOut"
    })

    // enemy sağdan gelir
    enemy.x = width / 2 + 600
    this.tweens.add({
        targets: enemy,
        x: width / 2 + 250,
        duration: 400,
        ease: "Back.easeOut"
    })

    // VS pop
    this.tweens.add({
        targets: vs,
        alpha: 1,
        scale: { from: 0.1, to: 0.4 },
        duration: 300,
        delay: impactTime,
        ease: "Back.easeOut"
    })

    // VS pulse
    this.tweens.add({
        targets: vs,
        scale: { from: 0.4, to: 0.55 },
        duration: 600,
        yoyo: true,
        repeat: -1
    })

    // Overlay pulse
    this.tweens.add({
        targets: overlay,
        alpha: { from: 0.7, to: 0.85 },
        duration: 200,
        yoyo: true
    })
    

    // =========================
    // GAME START
    // =========================
    this.time.delayedCall(GameConfig.VS.startDelayMs, () => {
        SoundService.stopSFX()
        this.scene.start("GameScene")
    })
}

}