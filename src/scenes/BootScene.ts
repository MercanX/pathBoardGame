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


        this.load.script(
            "webfont",
            "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
        )

        // =========================
        // GLOBAL IMAGES
        // =========================
        this.load.image("menu_bg", "assets/bg/bg03.png")
        this.load.image("title", "assets/ui/logo01.png")
        this.load.image("game_bg", "assets/bg/bg03.png")
        this.load.image("board", "assets/board/board02.jpg")
        this.load.image("confetti", "assets/ui/confetti.png")
        this.load.image("ates", "assets/ui/ates.png")




        // =========================
        // GLOBAL UI
        // =========================
        this.load.image("btn_multiplayer", "assets/ui/multiplayerbtn.png")
        this.load.image("btn_playfriend", "assets/ui/playfriendbtn.png")

        this.load.image("btn_settings", "assets/ui/btn_settings.png")
        this.load.image("btn_help", "assets/ui/btn_help.png")
        this.load.image("btn_shop", "assets/ui/btn_shop.png")
        this.load.image("btn_sound", "assets/ui/btn_sound.png")
        this.load.image("btn_sound_off", "assets/ui/btn_sound_off.png")
        this.load.image("btn_music", "assets/ui/btn_music.png")
        this.load.image("btn_music_off", "assets/ui/btn_music_off.png")

        this.load.image("btn_exit", "assets/ui/btn_exit.png")
        this.load.image("btn_rotate", "assets/ui/btn_rotate.png")
        this.load.image("btn_map", "assets/ui/btn_map.png")
        this.load.image("btn_home", "assets/ui/btn_home.png")
        this.load.image("btn_change", "assets/ui/btn_shop.png")


        this.load.image("btn_back", "assets/ui/btn_exit.png")



        // =========================
        // AVATAR UI
        // =========================
        this.load.image("avatar_1", "assets/ui/avatar_1.png")
        this.load.image("avatar_2", "assets/ui/avatar_2.png")
        this.load.image("avatar_3", "assets/ui/avatar_3.png")
        this.load.image("avatar_4", "assets/ui/avatar_4.png")
        this.load.image("avatar_5", "assets/ui/avatar_5.png")
        this.load.image("avatar_6", "assets/ui/avatar_2.png")




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
        // @ts-ignore
        WebFont.load({
            custom: {
                families: ["Cinzel", "Orbitron"]
            },
            active: () => {

                SettingsService.init()
                SoundService.init(this)

                SoundService.playMusic("bg_music")

                this.scene.start("MainMenuScene")

            }
        })
    }
}