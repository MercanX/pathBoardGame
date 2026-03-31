/**
 * File: GameState.ts
 * Purpose: Oyun sırasında tüm anlık state bilgisini tutar
 */

import BoardEngine from "./BoardEngine"

export interface PlayerState
{
    id:number
    hand:string[]
    isAlive:boolean

    isBot:boolean
    botLevel?: "easy" | "normal" | "hard" | "ultra" | "insane" | "insane02"

    startX:number
    startY:number
    entryPort:number
    equippedBoard?: string
}

export interface GameState
{
    board:BoardEngine
    players:PlayerState[]
    deck:string[]
    discard:string[]
    currentPlayer:number
}