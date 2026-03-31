/**
 * File: src/core/BotGenerator.ts
 * Purpose:
 * - Player'a göre dinamik bot üretir
 */

import { PlayerService } from "./PlayerService"

export type GeneratedBot =
{
    name: string
    rating: number
    wins: number
    losses: number
    avatar: string
    difficulty: "easy" | "normal" | "hard" | "ultra"
}

const BotNames: string[] =
[
    "ShadowX",
    "DarkNova",
    "HexaMind",
    "ZeroPulse",
    "NightByte",
    "CyberWolf",
    "GhostAI",
    "QuantumX",
    "NeuroEdge",
    "OmegaCore",
    "AlphaStrike",
    "IronBot",
    "PixelHunter",
    "NovaStorm",
    "BrainHack"
]

export function generateBot(): GeneratedBot
{
    const player = PlayerService.get()

    const name =
        BotNames[Math.floor(Math.random() * BotNames.length)]

    // 🎯 player’a yakın rating
    const ratingOffset = Math.floor(Math.random() * 200) - 100
    const rating = Math.max(800, player.rating + ratingOffset)


    // 🎯 player'a yakın win/loss üret
    const playerTotal = player.wins + player.losses

    // 🔥 kritik fix: düşük oyuncu için base yükselt
    let base = playerTotal

    if(base < 10)
    {
        base = Phaser.Math.Between(3, 15)
    }
    else
    {
        base = Math.floor(base * Phaser.Math.FloatBetween(0.7, 1.3))
    }

    // 🎯 varyasyon (daha stabil)
    const variation = Math.floor(base * Phaser.Math.FloatBetween(-0.2, 0.2))

    const totalGames = Math.max(1, base + variation)

    // 🎯 rating'e göre winrate (daha gerçekçi)
    let baseWinRate = 0.5

    if(rating < 1000) baseWinRate = 0.45
    else if(rating < 1300) baseWinRate = 0.5
    else if(rating < 1600) baseWinRate = 0.55
    else if(rating < 1900) baseWinRate = 0.6
    else baseWinRate = 0.65

    // küçük random sapma (±5%)
    const winRate =
        baseWinRate + (Math.random() * 0.1 - 0.05)

    // 🎯 daha stabil win dağılımı
    const wins = Phaser.Math.Clamp(
        Math.round(totalGames * winRate),
        0,
        totalGames
    )

    const losses = totalGames - wins


    // difficulty mapping
    let difficulty: GeneratedBot["difficulty"] = "normal"

    /*
    if(rating < 1100) difficulty = "easy"
    else if(rating < 1400) difficulty = "normal"
    else if(rating < 1800) difficulty = "hard"
    else difficulty = "ultra"

    difficulty="ultra"
    */

    return {
        name,
        rating,
        wins,
        losses,
        avatar: "avatar_2",
        difficulty
    }
}