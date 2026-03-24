/**
 * File: src/scenes/SettingsScene.ts
 * Purpose:
 * - Oyun ayarlarını yönetir
 */

import Phaser from "phaser"

import { SettingsService } from "../core/SettingsService"
import { SoundService } from "../core/SoundService"


export default class SettingsScene extends Phaser.Scene
{
    constructor()
    {
        super("SettingsScene")
    }

    preload()
    {
        this.load.image("settings_bg", "assets/ui/settings_bg.png")
        this.load.image("btn_toggle_on", "assets/ui/btn_sound.png")
        this.load.image("btn_toggle_off", "assets/ui/btn_sound.png")

        this.load.image("slider_bg", "assets/ui/slider_bg.png")
        this.load.image("slider_knob", "assets/ui/slider_knob.png")
        this.load.image("slider_fill", "assets/ui/slider_fill.png")
    }

    create()
    {
        const { width, height } = this.scale

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        const slider_bg = this.add.image(width/2, height/2, "settings_bg")
        bg.setDisplaySize(width, height)

        SettingsService.init()
        const settings = SettingsService.get()



        // =========================
        // SOUND TOGGLE
        // =========================
        let soundOn = settings.sound


        const soundBtn = this.add.image(
            width/2 - 150,
            height/2 - 100,
            "btn_sound"
        )
        .setScale(0.5)
        .setInteractive()

        soundBtn.on("pointerdown", () => {

            soundOn = !soundOn

            SettingsService.update({
                sound: soundOn
            })

            soundBtn.setAlpha(soundOn ? 1 : 0.4)

            console.log("Sound:", soundOn)
        })

        soundBtn.setAlpha(soundOn ? 1 : 0.4)

        // =========================
        // BACK BUTTON
        // =========================
        const backBtn = this.add.image(
            width/2,
            height/2 + 350,
            "btn_home"
        )
        .setScale(0.5)
        .setInteractive()

        backBtn.on("pointerdown", () => {
            this.scene.start("MainMenuScene")
        })

        let musicOn = settings.music

        const musicBtn = this.add.image(
            width/2 + 150,
            height/2 - 100,
            "btn_music"
        )
        .setScale(0.5)
        .setInteractive()

        musicBtn.setAlpha(musicOn ? 1 : 0.4)


        musicBtn.on("pointerdown", () => {

            musicOn = !musicOn

            SettingsService.update({
                music: musicOn
            })

            musicBtn.setAlpha(musicOn ? 1 : 0.4)

            if(musicOn)
            {
                SoundService.playMusic("bg_music")
            }
            else
            {
                SoundService.stopMusic()
            }
        })

        if(musicOn)
        {
            SoundService.playMusic("bg_music")
        }
        
        // =========================
        // MASTER SLIDER (FIXED)
        // =========================

        const barWidth = 450
        const barHeight = 70

        const barX = width/2-20
        const barY = height/2 + 125

        const minX = barX - barWidth/2
        const maxX = barX + barWidth/2

        // BG
        const sliderBg = this.add.image(barX, barY, "slider_bg")
        .setDisplaySize(barWidth, barHeight)

        // FILL
        const fill = this.add.image(minX+30, barY, "slider_fill")
        .setOrigin(0, 0.55)

        // KNOB
        const knob = this.add.image(minX, barY, "slider_knob")
        .setScale(0.4)
        .setInteractive({ draggable: true })

        // INITIAL
        const value = settings.masterVolume ?? 1

        fill.setDisplaySize(barWidth * value, 35)
        knob.x = minX + (value * barWidth)

        this.input.setDraggable(knob)

        // DRAG
        knob.on("drag", (pointer: any, dragX: number) => {

            knob.x = Phaser.Math.Clamp(dragX, minX, maxX)

            const value = (knob.x - minX) / barWidth

            fill.setDisplaySize(barWidth * value, 35)

            SettingsService.update({
                masterVolume: value
            })

            SoundService.updateVolumes()
        })

    }
}