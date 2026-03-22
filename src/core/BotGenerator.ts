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

    const variation = Math.floor(Math.random() * 20) - 10
    const totalGames = Math.max(10, playerTotal + variation)

    const playerWinRate =
        playerTotal > 0 ? player.wins / playerTotal : 0.5

    const winRate =
        playerWinRate + (Math.random() * 0.2 - 0.1)

    const wins = Math.max(0, Math.floor(totalGames * winRate))
    const losses = totalGames - wins


    // difficulty mapping
    let difficulty: GeneratedBot["difficulty"] = "normal"

    if(rating < 1100) difficulty = "easy"
    else if(rating < 1400) difficulty = "normal"
    else if(rating < 1800) difficulty = "hard"
    else difficulty = "ultra"

    return {
        name,
        rating,
        wins,
        losses,
        avatar: "avatar_2",
        difficulty
    }
}