/**
 * File: src/core/PlayerService.ts
 * Purpose:
 * - Oyuncu verisini yönetir (local storage)
 * - Runtime update + persist sağlar
 * - Gelecekte Firebase'e kolay geçiş
 */

import { GameConfig } from "../config/GameConfig"

export type PlayerProfile =
{
    name: string
    avatar: string
    rating: number
    wins: number
    losses: number
    gold: number
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
                const parsed = JSON.parse(saved)

                this.player = {
                    name: parsed.name ?? "YOU 01",
                    avatar: parsed.avatar ?? "avatar_1",
                    rating: parsed.rating ?? 1200,
                    wins: parsed.wins ?? 0,
                    losses: parsed.losses ?? 0,
                    gold: parsed.gold ?? GameConfig.START_GOLD
                }
            }
            else
            {
                this.player = {
                    name: "YOU 01",
                    avatar: "avatar_1",
                    rating: 1200,
                    wins: 0,
                    losses: 0,
                    gold: GameConfig.START_GOLD
                }
            }
        }
        catch(e)
        {
            console.error("PlayerService init error", e)

            this.player = {
                name: "YOU 03",
                avatar: "avatar_2",
                rating: 1200,
                wins: 0,
                losses: 0,
                gold: GameConfig.START_GOLD
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