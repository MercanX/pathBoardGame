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

    checkGameOver(): GameOverResult | null
    {
        const state = this.gameEngine.getState()
        if(!state) return null

        const players = state.players

        const results = players.map(player => {

            if(!player.isAlive)
            {
                return {
                    player,
                    hasNext: false,
                    alreadyDead: true
                }
            }

            const nextCell = findCurrentPlayerNextCell(
                state,
                player.id
            )

            return {
                player,
                hasNext: !!nextCell,
                alreadyDead: false
            }
        })

        const aliveResults = results.filter(r => !r.alreadyDead)

        // 🟣 DRAW → herkes stuck
        const allNoNext = aliveResults.every(r => !r.hasNext)

        if(allNoNext)
        {
            aliveResults.forEach(r => {
                r.player.isAlive = false
            })

            return { type: "DRAW" }
        }

        // 🔴 LOSER / 🟢 WINNER
        const losers = aliveResults.filter(r => !r.hasNext)
        const winners = aliveResults.filter(r => r.hasNext)

        if(losers.length > 0 && winners.length > 0)
        {
            losers.forEach(r => {
                r.player.isAlive = false
            })

            return {
                type: "WIN",
                winner: winners[0].player.id
            }
        }

        return null
    }
}