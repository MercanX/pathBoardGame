/**
 * File: src/core/SoundService.ts
 * Purpose:
 * - Oyun içi sesleri merkezi yönetir
 * - SFX ve MUSIC ayrı yönetilir
 * - Volume sistemi entegredir
 */

import Phaser from "phaser"
import { SettingsService } from "./SettingsService"

class SoundServiceClass
{
    private scene!: Phaser.Scene

    private music?: Phaser.Sound.WebAudioSound
    private currentSfx?: Phaser.Sound.WebAudioSound
     private musicFadeInterval?: ReturnType<typeof setInterval>

    // =========================
    // INIT
    // =========================
    init(scene: Phaser.Scene)
    {
        this.scene = scene
    }

    // =========================
    // PLAY SFX
    // =========================
    play(key: string)
    {
        const settings = SettingsService.get?.()
        if(!settings) return
        if(!settings.sound) return

        // eski SFX varsa durdur (overlap engelle)
        if(this.currentSfx && this.currentSfx.isPlaying)
        {
            this.currentSfx.stop()
        }

        const volume =
            settings.masterVolume * settings.sfxVolume

        this.currentSfx = this.scene.sound.add(key, {
            volume
        }) as Phaser.Sound.WebAudioSound

        this.currentSfx.play()
    }

    // =========================
    // PLAY MUSIC
    // =========================
    playMusic(key: string)
    {
        const settings = SettingsService.get?.()
        if(!settings) return
        if(!settings.music) return

        // zaten çalıyorsa tekrar başlatma
        if(this.music && this.music.isPlaying) return

        const volume =
            settings.masterVolume * settings.musicVolume

        this.music = this.scene.sound.add(key, {
            loop: true,
            volume
        }) as Phaser.Sound.WebAudioSound

        this.music.play()
    }

    // =========================
    // STOP MUSIC
    // =========================
    stopMusic()
    {
        if(this.music)
        {
            this.music.stop()
            this.music = undefined
        }
    }

    // =========================
    // STOP SFX
    // =========================
    stopSFX()
    {
        if(this.currentSfx)
        {
            this.currentSfx.stop()
            this.currentSfx = undefined
        }
    }

    // =========================
    // UPDATE VOLUMES (REAL-TIME)
    // =========================
    updateVolumes()
    {
        const settings = SettingsService.get?.()
        if(!settings) return

        // MUSIC volume güncelle
        if(this.music)
        {
            const musicVolume =
                settings.masterVolume * settings.musicVolume

            this.fadeMusicVolume(musicVolume, 200)
        }

        // SFX volume güncelle
        if(this.currentSfx)
        {
            const sfxVolume =
                settings.masterVolume * settings.sfxVolume

            this.currentSfx.setVolume(sfxVolume)
        }
    }

    // =========================
    // FORCE REAPPLY SETTINGS
    // =========================
    refresh()
    {
        const settings = SettingsService.get?.()
        if(!settings) return

        if(!settings.music)
        {
            this.stopMusic()
        }
        else if(this.music && !this.music.isPlaying)
        {
            this.music.play()
        }

        this.updateVolumes()
    }


    fadeMusicVolume(targetVolume: number, duration: number = 300)
    {
        if(!this.music) return

        if(this.musicFadeInterval)
        {
            clearInterval(this.musicFadeInterval)
            this.musicFadeInterval = undefined
        }

        const startVolume = this.music.volume
        const diff = targetVolume - startVolume

        const steps = 20
        const stepTime = duration / steps

        let currentStep = 0

        this.musicFadeInterval = setInterval(() => {

            currentStep++

            const progress = currentStep / steps
            const newVolume = startVolume + diff * progress

            this.music?.setVolume(newVolume)

            if(currentStep >= steps)
            {
                if(this.musicFadeInterval)
                {
                    clearInterval(this.musicFadeInterval)
                    this.musicFadeInterval = undefined
                }
            }

        }, stepTime)
    }

    
}

export const SoundService = new SoundServiceClass()