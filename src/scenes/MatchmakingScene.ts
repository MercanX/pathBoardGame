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

        this.load.image("menu_bg", "assets/bg/bg03.png")

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
            this.load.image(`avatar_${i}`, `assets/cards/avatar_${i}.png`)
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
            .setScale(0.7)

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
        this.searchingPanel.setScale(0.55)

        this.tweens.add({
            targets: this.searchingPanel,
            alpha: 1,
            scale: 0.7,
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
        const randomWaitMs = Phaser.Math.Between(5000, 10000)

        this.matchDelayEvent = this.time.delayedCall(randomWaitMs, () => {
            this.showMatchFound()
        })

        this.selectedBot = generateBot()

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
            .setScale(0.55)
            .setAlpha(0)

        this.tweens.add({
            targets: this.matchFoundPanel,
            alpha: 1,
            scale: 0.72,
            duration: 350,
            ease: "Back.easeOut"
        })

        // hafif pulse
        this.tweens.add({
            targets: this.matchFoundPanel,
            scale: { from: 0.72, to: 0.76 },
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

    // temizle
    this.children.removeAll()

    const playerData = PlayerService.get()

    
    // =========================
    // BG
    // =========================
    const overlay = this.add.rectangle(
        width/2,
        height/2,
        width,
        height,
        0x000000,
        0.7
    ).setDepth(200)

    // =========================
    // AVATARS
    // =========================
    const player = this.add.image(
        width/2 - 250,
        height/2,
        playerData.avatar
    ).setDepth(210).setScale(0.6)

    const enemy = this.add.image(
        width/2 + 250,
        height/2,
        this.selectedBot.avatar
    ).setDepth(210).setScale(0.6)

    this.add.text(
        width/2 - 250,
        height/2 + 120,
        playerData.name,
        { fontSize: "28px" }
    )
    .setOrigin(0.5)
    .setDepth(230)

    this.add.text(
        width/2 - 250,
        height/2 + 160,
        "Rating: " + playerData.rating,
        { fontSize: "20px" }
    )
    .setOrigin(0.5)
    .setDepth(230)

    this.add.text(
        width/2 - 250,
        height/2 + 200,
        `${playerData.wins}W - ${playerData.losses}L`,
        { fontSize: "20px" }
    )
    .setOrigin(0.5)
    .setDepth(230)

    this.add.text(
        width/2 + 250,
        height/2 + 120,
        this.selectedBot.name,
        { fontSize: "28px" }
    )
    .setOrigin(0.5)
    .setDepth(230)

    this.add.text(
        width/2 + 250,
        height/2 + 160,
        "Rating: " + this.selectedBot.rating,
        { fontSize: "20px" }
    )
    .setOrigin(0.5)
    .setDepth(230)

    this.add.text(
        width/2 + 250,
        height/2 + 200,
        `${this.selectedBot.wins}W - ${this.selectedBot.losses}L`,
        { fontSize: "20px" }
    )
    .setOrigin(0.5)
    .setDepth(230)



    // =========================
    // VS IMAGE
    // =========================
    const vs = this.add.image(
        width/2,
        height/2,
        "ui_vs" // 🔥 EKLEYECEKSİN
    ).setDepth(220).setScale(0.3).setAlpha(0)

    // =========================
    // ENTRY ANIMATION
    // =========================

    // player soldan girer
    player.x -= 400
    this.tweens.add({
        targets: player,
        x: width/2 - 250,
        duration: 400,
        ease: "Back.easeOut"
    })

    // enemy sağdan girer
    enemy.x += 400
    this.tweens.add({
        targets: enemy,
        x: width/2 + 250,
        duration: 400,
        ease: "Back.easeOut"
    })

    // VS pop
    this.tweens.add({
        targets: vs,
        alpha: 1,
        scale: { from: 0.2, to: 0.6 },
        duration: 300,
        delay: 300,
        ease: "Back.easeOut"
    })

    // pulse
    this.tweens.add({
        targets: vs,
        scale: { from: 0.6, to: 0.7 },
        duration: 600,
        yoyo: true,
        repeat: -1
    })

    // =========================
    // GAME START
    // =========================
    this.time.delayedCall(2000, () => {
        this.scene.start("GameScene")
    })
}

}