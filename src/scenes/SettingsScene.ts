/**
 * File: src/scenes/SettingsScene.ts
 * Purpose:
 * - Oyun ayarlarını yönetir (animasyonlu + toggle icon)
 */

import Phaser from "phaser"

import { SettingsService } from "../core/SettingsService"
import { SoundService } from "../core/SoundService"
import { PlayerService } from "../core/PlayerService"

export default class SettingsScene extends Phaser.Scene
{
    constructor()
    {
        super("SettingsScene")
    }

    preload()
    {
        this.load.image("settings_bg", "assets/ui/settings_bg.png")

        // SOUND ICONS
        this.load.image("btn_sound_on", "assets/ui/btn_sound.png")
        this.load.image("btn_sound_off", "assets/ui/btn_sound_off.png")

        // MUSIC ICONS
        this.load.image("btn_music_on", "assets/ui/btn_music.png")
        this.load.image("btn_music_off", "assets/ui/btn_music_off.png")

        // SLIDER
        this.load.image("slider_bg", "assets/ui/slider_bg.png")
        this.load.image("slider_knob", "assets/ui/slider_knob.png")
        this.load.image("slider_fill", "assets/ui/slider_fill.png")
    }

    create()
    {
        const { width, height } = this.scale

        SoundService.init(this)

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(width/2, height/2, "menu_bg")
        bg.setDisplaySize(width, height)

        const panel = this.add.image(width/2, height/2, "settings_bg")
        panel.setScale(0.9)

        SettingsService.init()
        const settings = SettingsService.get()

        // =========================
        // BACK BUTTON
        // =========================
        const backBtn = this.add.image(
            width/2,
            250,
            "btn_home"
        )
        .setScale(0.5)
        .setInteractive()

        this.addButtonEffects(backBtn)

        backBtn.on("pointerdown", () => {
            SoundService.play("click")
            this.scene.start("MainMenuScene")
        })



        // =========================
        // SOUND BUTTON
        // =========================
        let soundOn = settings.sound

        const soundBtn = this.add.image(
            width/2 - 150,
            height/2 - 200,
            soundOn ? "btn_sound_on" : "btn_sound_off"
        )
        .setScale(0.5)
        .setInteractive()

        this.addButtonEffects(soundBtn)
        soundBtn.setAlpha(soundOn ? 1 : 0.4)

        soundBtn.on("pointerdown", () => {

            SoundService.play("click")

            soundOn = !soundOn

            SettingsService.update({ sound: soundOn })

            soundBtn.setTexture(soundOn ? "btn_sound_on" : "btn_sound_off")
            soundBtn.setAlpha(soundOn ? 1 : 0.4)

            if(!soundOn)
            {
                SoundService.stopSFX()
            }
        })

        // =========================
        // MUSIC BUTTON
        // =========================
        let musicOn = settings.music

        const musicBtn = this.add.image(
            width/2 + 150,
            height/2 - 200,
            musicOn ? "btn_music_on" : "btn_music_off"
        )
        .setScale(0.5)
        .setInteractive()

        this.addButtonEffects(musicBtn)
        musicBtn.setAlpha(musicOn ? 1 : 0.4)

        musicBtn.on("pointerdown", () => {

            SoundService.play("click")

            musicOn = !musicOn

            SettingsService.update({ music: musicOn })

            musicBtn.setTexture(musicOn ? "btn_music_on" : "btn_music_off")
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


        // =========================
        // MASTER SLIDER
        // =========================
        const barWidth = 450
        const barHeight = 70

        const barX = width/2 - 10
        const barY = height/2 - 40

        const minX = barX - barWidth/2
        const maxX = barX + barWidth/2

        const sliderBg = this.add.image(barX, barY, "slider_bg")
        .setDisplaySize(barWidth, barHeight)

        const fill = this.add.image(minX + 30, barY, "slider_fill")
        .setOrigin(0, 0.55)

        const knob = this.add.image(minX, barY, "slider_knob")
        .setScale(0.4)
        .setInteractive({ draggable: true })

        // knob hover anim
        knob.on("pointerover", () => {
            this.tweens.add({
                targets: knob,
                scale: 0.45,
                duration: 100
            })
        })

        knob.on("pointerout", () => {
            this.tweens.add({
                targets: knob,
                scale: 0.4,
                duration: 100
            })
        })

        const value = settings.masterVolume ?? 1

        fill.setDisplaySize(barWidth * value, 35)
        knob.x = minX + (value * barWidth)

        this.input.setDraggable(knob)

        knob.on("drag", (pointer: any, dragX: number) => {

            knob.x = Phaser.Math.Clamp(dragX, minX, maxX)

            const value = (knob.x - minX) / barWidth

            fill.setDisplaySize(barWidth * value, 35)

            SettingsService.update({
                masterVolume: value
            })

            SoundService.updateVolumes()
        })

        // =========================
        // AVATAR GRID
        // =========================
        const avatars = [
            "avatar_1",
            "avatar_2",
            "avatar_3",
            "avatar_4",
            "avatar_5",
            "avatar_6",
        ]

        const player = PlayerService.get()
        let selectedAvatar = player.avatar

        const avatarButtons: {
            img: Phaser.GameObjects.Image,
            border: Phaser.GameObjects.Arc
        }[] = []

        const cols = 3
        const size = 220
        const gap = 10

        const startX = width/2 - ((cols * size + (cols - 1) * gap) / 2) + 100
        const startY = height/2 + 125

        avatars.forEach((key, index) => {

            const col = index % cols
            const row = Math.floor(index / cols)

            const x = startX + col * (size + gap)
            const y = startY + row * (size + gap)

            const avatarBtn = this.add.image(x, y, key)
                .setDisplaySize(size, size)
                .setInteractive()

            this.addButtonEffects(avatarBtn)

            // BORDER
            const border = this.add.circle(x, y, size/2-10)
                .setStrokeStyle(6, 0xf9f213)
                .setAlpha(0)

            // ARRAY PUSH (DOĞRU)
            avatarButtons.push({
                img: avatarBtn,
                border: border
            })

            // INITIAL STATE
            if(key === selectedAvatar)
            {
                     border.setAlpha(1)
            }
 

            // CLICK
            avatarBtn.on("pointerdown", () => {

                SoundService.play("click")

                selectedAvatar = key

                // RESET ALL
                avatarButtons.forEach(item => {
                     item.border.setAlpha(0)
                })
                // APPLY SELECTED
                border.setAlpha(1)

                // SAVE
                PlayerService.update({
                    avatar: key
                })
            })
        })

// =========================
// NAME EDIT (FIXED)
// =========================

// LABEL
const nameLabel = this.add.text(width / 2, height - 250, "PLAYER NAME", {
    fontFamily: "Orbitron",
    fontSize: "28px",
    color: "#ffaa00",
    fontStyle: "bold"
}).setOrigin(0.5)

// EDIT ICON
const editIcon = this.add.text(width / 2 + 150, height - 190, "✎", {
    fontFamily: "Arial",
    fontSize: "38px",
    color: "#ffaa00",
    fontStyle: "bold"
})
.setOrigin(0.5)
.setInteractive()

// ⚠️ addButtonEffects kaldırıyoruz (text için yazılmamış)

// NAME TEXT
const nameText = this.add.text(width / 2, height - 190, player.name, {
    fontFamily: "Orbitron",
    fontSize: "42px",
    color: "#ffffff",
    fontStyle: "bold",
    backgroundColor: "#00000088",
    padding: { x: 20, y: 10 }
}).setOrigin(0.5)


// =========================
// DOM INPUT (DOĞRU KULLANIM)
// =========================
const inputElement = document.createElement("input")

inputElement.type = "text"
inputElement.value = player.name
inputElement.maxLength = 16

inputElement.style.width = "300px"
inputElement.style.height = "60px"
inputElement.style.fontSize = "32px"
inputElement.style.fontFamily = "Orbitron"
inputElement.style.textAlign = "center"
inputElement.style.backgroundColor = "#222"
inputElement.style.color = "#fff"
inputElement.style.border = "3px solid #ffaa00"
inputElement.style.borderRadius = "8px"
inputElement.style.outline = "none"

// Phaser içine bağla
const nameInput = this.add.dom(width / 2, height - 190, inputElement)
nameInput.setVisible(false)


// =========================
// EDIT CLICK
// =========================
editIcon.on("pointerdown", () => {

    SoundService.play("click")

    nameText.setVisible(false)
    nameInput.setVisible(true)

    inputElement.focus()
    inputElement.select()
})


// =========================
// BLUR (EN KRİTİK FIX)
// =========================
inputElement.addEventListener("blur", () => {

    const newName = inputElement.value.trim()

    if(newName.length > 0)
    {
        PlayerService.update({ name: newName })
        nameText.setText(newName)
    }

    nameText.setVisible(true)
    nameInput.setVisible(false)
})


// =========================
// ENTER
// =========================
inputElement.addEventListener("keydown", (e) => {

    if(e.key === "Enter")
    {
        inputElement.blur()
    }
})


    }

    // =========================
    // BUTTON EFFECT SYSTEM
    // =========================
    addButtonEffects(btn: Phaser.GameObjects.Image)
    {
        btn.on("pointerover", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale * 1.1,
                duration: 120
            })
        })

        btn.on("pointerout", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale / 1.1,
                duration: 120
            })
        })

        btn.on("pointerdown", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale * 0.9,
                duration: 80
            })
        })

        btn.on("pointerup", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale / 0.9,
                duration: 80
            })
        })
    }
}