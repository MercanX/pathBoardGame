/**
 * File: src/core/PlayerService.ts
 * Purpose:
 * - Oyuncu verisini yönetir (local storage)
 * - Runtime update + persist sağlar
 * - Gelecekte Firebase'e kolay geçiş
 */

export type PlayerProfile =
{
    name: string
    avatar: string
    rating: number
    wins: number
    losses: number
}

const STORAGE_KEY = "game_player_profile"

class PlayerServiceClass
{
    private player!: PlayerProfile

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
                this.player = JSON.parse(saved)
            }
            else
            {
                this.player = {
                    name: "YOU",
                    avatar: "avatar_player",
                    rating: 1200,
                    wins: 0,
                    losses: 0
                }

                this.save()
            }
        }
        catch(e)
        {
            console.error("PlayerService init error", e)

            this.player = {
                name: "YOU",
                avatar: "avatar_player",
                rating: 1200,
                wins: 0,
                losses: 0
            }
        }
    }

    // =========================
    // GET
    // =========================
    get(): PlayerProfile
    {
        return this.player
    }

    // =========================
    // SAVE
    // =========================
    private save()
    {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.player))
    }

    // =========================
    // UPDATE
    // =========================
    update(data: Partial<PlayerProfile>)
    {
        this.player = {
            ...this.player,
            ...data
        }

        this.save()
    }

    // =========================
    // WIN / LOSS
    // =========================
    addWin()
    {
        this.player.wins++

        this.player.rating += 20

        this.save()
    }

    addLoss()
    {
        this.player.losses++

        this.player.rating = Math.max(800, this.player.rating - 15)

        this.save()
    }
}

export const PlayerService = new PlayerServiceClass()