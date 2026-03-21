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
        this.load.image("ui_searching_panel", "assets/ui/btn_map.png")
        this.load.image("ui_searching_spinner", "assets/ui/btn_map.png")

        // Match found ekranı için
        this.load.image("ui_match_found_panel", "assets/ui/btn_rotate.png")
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
        const randomWaitMs = Phaser.Math.Between(2500, 5500)

        this.matchDelayEvent = this.time.delayedCall(randomWaitMs, () => {
            this.showMatchFound()
        })
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
        this.startGameEvent = this.time.delayedCall(1800, () => {
            this.scene.start("GameScene")
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
}