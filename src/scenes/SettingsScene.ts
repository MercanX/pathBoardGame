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
        this.load.image("btn_toggle_on", "assets/ui/btn_sound.png")
        this.load.image("btn_toggle_off", "assets/ui/btn_sound.png")
    }

    create()
    {
        const { width, height } = this.scale

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        SettingsService.init()
        const settings = SettingsService.get()

        // =========================
        // TITLE
        // =========================
        this.add.text(width/2, 200, "SETTINGS", {
            fontSize: "40px"
        }).setOrigin(0.5)

        // =========================
        // SOUND TOGGLE
        // =========================
        let soundOn = settings.sound

        const soundText = this.add.text(
            width/2 - 100,
            400,
            "SOUND",
            { fontSize: "28px" }
        ).setOrigin(0.5)

        const soundBtn = this.add.image(
            width/2 + 150,
            400,
            "btn_toggle_on"
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
            height - 200,
            "btn_back"
        )
        .setScale(0.5)
        .setInteractive()

        backBtn.on("pointerdown", () => {
            this.scene.start("MainMenuScene")
        })

        let musicOn = settings.music

        const musicBtn = this.add.image(
            width/2 + 150,
            500,
            "btn_toggle_on"
        )
        .setScale(0.5)
        .setInteractive()

        musicBtn.setAlpha(musicOn ? 1 : 0.4)

        this.add.text(
            width/2 - 100,
            500,
            "MUSIC",
            { fontSize: "28px" }
        ).setOrigin(0.5)


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
// MASTER VOLUME
// =========================
this.add.text(width/2 - 100, 600, "MASTER", { fontSize: "24px" }).setOrigin(0.5)

const masterBarWidth = 300
const masterMinX = width/2 - masterBarWidth/2
const masterMaxX = width/2 + masterBarWidth/2

const masterBar = this.add.rectangle(width/2, 640, masterBarWidth, 8, 0xffffff)

const masterKnob = this.add.circle(width/2, 640, 10, 0xff4444)
.setInteractive({ draggable: true })

masterKnob.x = masterMinX + (settings.masterVolume * masterBarWidth)

this.input.setDraggable(masterKnob)

masterKnob.on("drag", (pointer: any, dragX: number) => {

    masterKnob.x = Phaser.Math.Clamp(dragX, masterMinX, masterMaxX)

    const value = (masterKnob.x - masterMinX) / masterBarWidth

    SettingsService.update({ masterVolume: value })
    SoundService.updateVolumes()
})


// =========================
// SFX VOLUME
// =========================
this.add.text(width/2 - 100, 700, "SFX", { fontSize: "24px" }).setOrigin(0.5)

const sfxBarWidth = 300
const sfxMinX = width/2 - sfxBarWidth/2
const sfxMaxX = width/2 + sfxBarWidth/2

const sfxBar = this.add.rectangle(width/2, 740, sfxBarWidth, 8, 0xffffff)

const sfxKnob = this.add.circle(width/2, 740, 10, 0x44ff44)
.setInteractive({ draggable: true })

sfxKnob.x = sfxMinX + (settings.sfxVolume * sfxBarWidth)

this.input.setDraggable(sfxKnob)

sfxKnob.on("drag", (pointer: any, dragX: number) => {

    sfxKnob.x = Phaser.Math.Clamp(dragX, sfxMinX, sfxMaxX)

    const value = (sfxKnob.x - sfxMinX) / sfxBarWidth

    SettingsService.update({ sfxVolume: value })
    SoundService.updateVolumes()
})


// =========================
// MUSIC VOLUME
// =========================
this.add.text(width/2 - 100, 800, "MUSIC", { fontSize: "24px" }).setOrigin(0.5)

const musicBarWidth = 300
const musicMinX = width/2 - musicBarWidth/2
const musicMaxX = width/2 + musicBarWidth/2

const musicBar = this.add.rectangle(width/2, 840, musicBarWidth, 8, 0xffffff)

const musicKnob = this.add.circle(width/2, 840, 10, 0x4488ff)
.setInteractive({ draggable: true })

musicKnob.x = musicMinX + (settings.musicVolume * musicBarWidth)

this.input.setDraggable(musicKnob)

musicKnob.on("drag", (pointer: any, dragX: number) => {

    musicKnob.x = Phaser.Math.Clamp(dragX, musicMinX, musicMaxX)

    const value = (musicKnob.x - musicMinX) / musicBarWidth

    SettingsService.update({ musicVolume: value })
    SoundService.updateVolumes()
})


    }
}