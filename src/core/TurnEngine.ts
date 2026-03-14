/**
 * File: TurnEngine.ts
 * Purpose: Oyuncu sırasını ve tur ilerlemesini yönetir
 */

import { GameState } from "./GameState"

/**
 * Aktif oyuncuyu getir
 */
export function getCurrentPlayer(state:GameState)
{
    return state.players[state.currentPlayer]
}

/**
 * Sonraki oyuncuya geç
 */
export function nextPlayer(state:GameState)
{
    const total = state.players.length

    for(let i=1;i<=total;i++)
    {
        const nextIndex = (state.currentPlayer + i) % total

        if(state.players[nextIndex].isAlive)
        {
            state.currentPlayer = nextIndex
            return
        }
    }
}

/**
 * Oyuncuyu oyundan çıkar
 */
export function eliminatePlayer(
    state:GameState,
    playerId:number
)
{
    const player = state.players.find(p => p.id === playerId)

    if(player)
    {
        player.isAlive = false
    }
}