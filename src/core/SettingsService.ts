/**
 * File: src/core/SettingsService.ts
 * Purpose:
 * - Oyun ayarlarını local storage ile saklar
 */

export type GameSettings =
{
    sound: boolean
    music: boolean
    masterVolume: number
    sfxVolume: number
    musicVolume: number
}

const STORAGE_KEY = "game_settings"

class SettingsServiceClass
{
    private settings!: GameSettings

    // =========================
    // INIT
    // =========================
    init()
    {
        try
        {
            const saved = localStorage.getItem(STORAGE_KEY)

            if(saved)
            {
                const parsed = JSON.parse(saved)

                // eski data ile uyum
                this.settings = {
                    sound: parsed.sound ?? true,
                    music: parsed.music ?? true,
                    masterVolume: parsed.masterVolume ?? 1,
                    sfxVolume: parsed.sfxVolume ?? 1,
                    musicVolume: parsed.musicVolume ?? 0.5
                }
            }
            else
            {
                this.settings = {
                    sound: true,
                    music: true,
                    masterVolume: 1,
                    sfxVolume: 1,
                    musicVolume: 0.5
                }

                this.save()
            }
        }
        catch(e)
        {
            console.error("Settings init error", e)

            this.settings = {
                sound: true,
                music: true,
                masterVolume: 1,
                sfxVolume: 1,
                musicVolume: 0.5
            }
        }
    }

    // =========================
    // GET
    // =========================
    get(): GameSettings
    {
        return this.settings
    }

    // =========================
    // SAVE
    // =========================
    private save()
    {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    }

    // =========================
    // UPDATE
    // =========================
    update(data: Partial<GameSettings>)
    {
        this.settings = {
            ...this.settings,
            ...data
        }

        this.save()
    }
}

export const SettingsService = new SettingsServiceClass()