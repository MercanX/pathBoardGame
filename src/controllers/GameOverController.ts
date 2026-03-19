/**
 * File: src/controllers/GameOverController.ts
 * File Name: GameOverController.ts
 * Purpose:
 * Oyun bitiş durumlarını kontrol eder + DEBUG içerir
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

    constructor(gameEngine:GameEngine)
    {
        this.gameEngine = gameEngine
    }

    checkGameOver(): GameOverResult | null
    {
        const state = this.gameEngine.getState()
        if(!state)
        {
            console.log("GAME OVER: state yok")
            return null
        }

        const players = state.players

        console.log("========== GAME OVER CHECK ==========")

        const results = players.map(player => {

            if(!player.isAlive)
            {
                console.log(
                    "PLAYER",
                    player.id,
                    "| DEAD (skip)"
                )

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

            console.log(
                "PLAYER CHECK",
                "id:", player.id,
                "| isAlive:", player.isAlive,
                "| nextCell:", nextCell ? "VAR" : "YOK"
            )

            return {
                player,
                hasNext: !!nextCell,
                alreadyDead: false
            }
        })

        const aliveResults = results.filter(r => !r.alreadyDead)

        console.log("---- ALIVE PLAYERS ----")

        aliveResults.forEach(r => {
            console.log(
                "Player",
                r.player.id,
                "| hasNext:", r.hasNext
            )
        })

        // 🟣 DRAW → herkes stuck
        const allNoNext = aliveResults.every(r => !r.hasNext)

        if(allNoNext)
        {
            console.log("RESULT: DRAW (HERKES STUCK)")

            aliveResults.forEach(r => {
                r.player.isAlive = false
            })

            return { type: "DRAW" }
        }

        // 🔴 LOSER / 🟢 WINNER
        const losers = aliveResults.filter(r => !r.hasNext)
        const winners = aliveResults.filter(r => r.hasNext)

        console.log("LOSERS:", losers.map(l => l.player.id))
        console.log("WINNERS:", winners.map(w => w.player.id))

        if(losers.length > 0 && winners.length > 0)
        {
            losers.forEach(r => {
                r.player.isAlive = false
            })

            console.log("RESULT: WIN →", winners[0].player.id)

            return {
                type: "WIN",
                winner: winners[0].player.id
            }
        }

        console.log("RESULT: CONTINUE (OYUN DEVAM)")

        return null
    }
}