/**
 * File: src/core/SoundService.ts
 * Purpose:
 * - Oyun içi sesleri merkezi yönetir
 */

import Phaser from "phaser"
import { SettingsService } from "./SettingsService"

class SoundServiceClass
{
    private scene!: Phaser.Scene
    private music?: Phaser.Sound.BaseSound

    // =========================
    // INIT
    // =========================
    init(scene: Phaser.Scene)
    {
        this.scene = scene
    }

    // =========================
    // PLAY SOUND
    // =========================
    play(key: string)
    {
        const settings = SettingsService.get()

        if(!settings.sound) return

        this.scene.sound.play(key)
    }

    // =========================
    // MUSIC (ileride)
    // =========================
    playMusic(key: string)
    {
        const settings = SettingsService.get()

        if(!settings.music) return

        // zaten çalıyorsa tekrar başlatma
        if(this.music && this.music.isPlaying) return

        this.music = this.scene.sound.add(key, {
            loop: true,
            volume: 0.5
        })

        this.music.play()
    }

    stopMusic()
    {
        if(this.music)
        {
            this.music.stop()
            this.music = undefined
        }
    }

}

export const SoundService = new SoundServiceClass()