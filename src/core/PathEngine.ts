/**
 * File: src/core/PathEngine.ts
 * Purpose: Kart port giriş-çıkış ve yol takip işlemlerini yönetir
 */

import { Connection, Port } from "../data/CardData"
import { GameState } from "./GameState"
import { CardDefinitions } from "../data/CardDefinitions"
import { rotateConnections } from "./CardEngine"

/**
 * Giriş portuna göre çıkış portunu bul
 */
export function findExit(
    entryPort:Port,
    connections:Connection[]
):Port | null
{
    for(const c of connections)
    {
        if(c[0] === entryPort) return c[1]
        if(c[1] === entryPort) return c[0]
    }

    return null
}

/**
 * Çıkış portuna göre hangi hücreye gidileceğini hesapla
 */
export function getNextCellOffset(port:Port)
{
    if(port === 1 || port === 2)
        return {x:0, y:1}

    if(port === 3 || port === 4)
        return {x:1, y:0}

    if(port === 5 || port === 6)
        return {x:0, y:-1}

    if(port === 7 || port === 8)
        return {x:-1, y:0}

    return {x:0,y:0}
}

/**
 * Portun karşı tarafını bul
 */
export function getOppositePort(port:Port):Port
{
    switch(port)
    {
        case 1: return 6
        case 2: return 5
        case 3: return 8
        case 4: return 7
        case 5: return 2
        case 6: return 1
        case 7: return 4
        case 8: return 3
    }
}

/**
 * Player yolunu takip eder
 */
export function tracePlayerPath(
    state:GameState,
    playerId:number
)
{
    const player = state.players.find(p => p.id === playerId)

    if(!player) return

    let x = player.startX
    let y = player.startY
    let entry = player.entryPort

    while(true)
    {
        const cell = state.board.board[y][x]

        if(!cell.cardId)
        {
            return "OPEN_PATH"
        }

        const def = CardDefinitions.find(c => c.id === cell.cardId)

        if(!def) return

        const connections = rotateConnections(
            def.connections,
            cell.rotation
        )

        const exit = findExit(entry,connections)

        if(!exit)
        {
            return "DEAD_END"
        }

        const offset = getNextCellOffset(exit)

        x += offset.x
        y += offset.y

        if(
            x < 0 ||
            y < 0 ||
            x >= state.board.size ||
            y >= state.board.size
        )
        {
            return "OUT_OF_BOARD"
        }

        entry = getOppositePort(exit)
    }
}