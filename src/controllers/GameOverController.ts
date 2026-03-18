/**
 * File: src/controllers/GameOverController.ts
 * File Name: GameOverController.ts
 * Purpose:
 * Oyun bitiş durumlarını kontrol eden controller.
 *
 * Kurallar:
 *
 * LOSE
 * Bir oyuncunun nextCell'i yoksa kaybeder.
 *
 * WIN
 * Eğer sadece bir oyuncunun nextCell'i varsa o kazanır.
 *
 * DRAW
 * Eğer tüm oyuncuların nextCell'i yoksa oyun berabere biter.
 *
 * Notes:
 * - Render yapmaz
 * - UI üretmez
 * - Sadece state analiz eder
 */

import GameEngine from "../core/GameEngine"
import { findCurrentPlayerNextCell } from "../core/PathEngine"

export type GameOverResult =
{
    type: "WIN"
    winner:number
}
|
{
    type:"DRAW"
}

export default class GameOverController
{
    gameEngine:GameEngine

    constructor(
        gameEngine:GameEngine
    )
    {
        this.gameEngine = gameEngine
    }

    checkGameOver():GameOverResult | null
    {
        const state = this.gameEngine.getState()

        if(!state) return null

        const alivePlayers =
            state.players.filter(p => p.isAlive)

        if(alivePlayers.length === 0)
        {
            return { type:"DRAW" }
        }

        const results =
            alivePlayers.map(player => {

                const nextCell =
                    findCurrentPlayerNextCell(
                        state,
                        player.id
                    )

                return {
                    playerId:player.id,
                    nextCell
                }
            })

        const noPathPlayers =
            results.filter(r => r.nextCell === null)

        // DRAW
        if(noPathPlayers.length === results.length)
        {
            return { type:"DRAW" }
        }

        // WIN
        if(noPathPlayers.length === 1)
        {
            const loser = noPathPlayers[0].playerId

            const winner =
                results.find(r => r.playerId !== loser)

            if(winner)
            {
                return {
                    type:"WIN",
                    winner:winner.playerId
                }
            }
        }

        return null
    }
}