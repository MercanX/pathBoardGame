/**
 * File: src/core/Generator.ts
 * Purpose:
 * - Player'a göre dinamik  üretir
 */

import { PlayerService } from "./PlayerService"

export type Generated =
{
    name: string
    rating: number
    wins: number
    losses: number
    avatar: string
    difficulty: "easy" | "normal" | "hard" | "ultra"
}

const Names: string[] =
[
    "ShadowX","DarkNova","HexaMind","ZeroPulse","NightByte","CyberWolf","Ghost","QuantumX","NeuroEdge","OmegaCore",
    "AlphaStrike","Iron","PixelHunter","NovaStorm","BrnHack","VoidRunner","StormByte","LunaCore","SteelMind","Hyper",
    "DeltaX","NanoGhost","EchoStorm","RoboKnight","AstroMind","CryoByte","Turbo","PhantomCore","SkyNetix","Inferno",
    "Zenith","PulseRider","MegaBrn","CodeHunter","Titan","Flux","NebulaX","RapidMind","CyberKnight","Ultra",
    "DarkPulse","NovaHunter","CoreBreaker","BitStorm","OmegaMind","Silent","Vector","NeonCore","WarpMind","Prime"
]

export function generate(): Generated
{
    const player = PlayerService.get()

    const name =
        Names[Math.floor(Math.random() * Names.length)]

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
    let difficulty: Generated["difficulty"] = "normal"

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