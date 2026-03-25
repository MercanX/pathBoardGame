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

    ownedItems: string[]        // ✅ sahip olunanlar
    equippedAvatar: string      // ✅ aktif avatar
    equippedPath: string        // ✅ aktif path
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
                    gold: parsed.gold ?? GameConfig.START_GOLD,

                    ownedItems: parsed.ownedItems ?? ["avatar_1"],

                    equippedAvatar: parsed.equippedAvatar ?? parsed.avatar ?? "avatar_1",

                    equippedPath: parsed.equippedPath ?? "path_blue"
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
                    gold: GameConfig.START_GOLD,

                    ownedItems: ["avatar_1"],
                    equippedAvatar: "avatar_1",
                    equippedPath: "path_blue"
                }


            }
        }
        catch(e)
        {
            console.error("PlayerService init error", e)

            this.player = {
                name: "YOU 01",
                avatar: "avatar_1",
                rating: 1200,
                wins: 0,
                losses: 0,
                gold: GameConfig.START_GOLD,

                ownedItems: ["avatar_1"],
                equippedAvatar: "avatar_1",
                equippedPath: "path_blue"
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

    // =========================
    // OWNERSHIP CHECK
    // =========================
    hasItem(itemId: string): boolean
    {
        return this.player.ownedItems.includes(itemId)
    }

    // =========================
    // ADD ITEM
    // =========================
    addItem(itemId: string)
    {
        if(!this.player.ownedItems.includes(itemId))
        {
            this.player.ownedItems.push(itemId)
            this.save()
        }
    }

    // =========================
    // EQUIP AVATAR
    // =========================
    equipAvatar(id: string)
    {
        this.player.equippedAvatar = id
        this.player.avatar = id
        this.save()
    }

    // =========================
    // EQUIP PATH
    // =========================
    equipPath(id: string)
    {
        this.player.equippedPath = id
        this.save()
    }

    // =========================
    // BUY ITEM
    // =========================
    buyItem(item: { id: string, price: number }): boolean
    {
        // zaten sahip mi
        if(this.hasItem(item.id))
        {
            return false
        }

        // gold yeterli mi
        if(this.player.gold < item.price)
        {
            return false
        }

        // gold düş
        this.player.gold -= item.price

        // item ekle
        this.player.ownedItems.push(item.id)

        // AUTO EQUIP (ilk versiyon)
        if(item.id.startsWith("avatar"))
        {
            this.player.equippedAvatar = item.id
            this.player.avatar = item.id
        }

        if(item.id.startsWith("path"))
        {
            this.player.equippedPath = item.id
        }

        this.save()

        return true
    }

    // =========================
    // RESET PROGRESS
    // =========================
    resetProgress()
    {
        this.player = {
            name: this.player.name,
            avatar: "avatar_1",
            rating: 1200,
            wins: 0,
            losses: 0,
            gold: GameConfig.START_GOLD,

            ownedItems: ["avatar_1"],
            equippedAvatar: "avatar_1",
            equippedPath: "path_blue"
        }

        this.save()
    }

}

export const PlayerService = new PlayerServiceClass()