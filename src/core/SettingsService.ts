/**
 * File: src/core/SettingsService.ts
 * Purpose:
 * - Oyun ayarlarını local storage ile saklar
 */

export type GameSettings =
{
    sound: boolean
    music: boolean
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
                this.settings = JSON.parse(saved)
            }
            else
            {
                this.settings = {
                    sound: true,
                    music: true
                }

                this.save()
            }
        }
        catch(e)
        {
            console.error("Settings init error", e)

            this.settings = {
                sound: true,
                music: true
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