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

        this.scene.sound.play(key, {
            loop: true,
            volume: 0.5
        })
    }
}

export const SoundService = new SoundServiceClass()