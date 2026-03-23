/**
 * File: src/scenes/BootScene.ts
 * Purpose:
 * - Global asset preload
 * - Oyun başlangıç noktası
 */

import Phaser from "phaser"
import { SoundService } from "../core/SoundService"
import { SettingsService } from "../core/SettingsService"

export default class BootScene extends Phaser.Scene
{
    constructor()
    {
        super("BootScene")
    }

    preload()
    {
        // =========================
        // GLOBAL IMAGES
        // =========================
        this.load.image("menu_bg", "assets/bg/bg03.png")
        this.load.image("title", "assets/ui/logo01.png")
        this.load.image("game_bg", "assets/bg/bg03.png")
        this.load.image("board", "assets/board/board02.jpg")
        this.load.image("confetti", "assets/ui/confetti.png")




        // =========================
        // GLOBAL UI
        // =========================
        this.load.image("btn_multiplayer", "assets/ui/multiplayerbtn.png")
        this.load.image("btn_playfriend", "assets/ui/playfriendbtn.png")

        this.load.image("btn_settings", "assets/ui/btn_settings.png")
        this.load.image("btn_help", "assets/ui/btn_help.png")
        this.load.image("btn_shop", "assets/ui/btn_shop.png")
        this.load.image("btn_sound", "assets/ui/btn_sound.png")

        this.load.image("btn_exit", "assets/ui/btn_exit.png")
        this.load.image("btn_rotate", "assets/ui/btn_rotate.png")
        this.load.image("btn_map", "assets/ui/btn_map.png")
        this.load.image("btn_home", "assets/ui/btn_home.png")



        this.load.image("btn_back", "assets/ui/btn_exit.png")


        // =========================
        // SOUND (GLOBAL)
        // =========================
        this.load.audio("click", "assets/sounds/click.mp3")
        this.load.audio("vs_impact", "assets/sounds/vs.mp3")

        this.load.audio("bg_music", "assets/sounds/bg01.mp3")



        // =========================
        // LOADING TEXT (opsiyonel)
        // =========================
        this.add.text(100, 100, "Loading...", { fontSize: "20px" })
    }

    create()
    {
        // 🔥 ORDER ÇOK KRİTİK
        SettingsService.init()
        SoundService.init(this)

        SoundService.playMusic("bg_music")

        this.scene.start("MainMenuScene")
    }
}