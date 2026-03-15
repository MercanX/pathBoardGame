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
    // üst kenar
    if(port === 1 || port === 2)
        return {x:0, y:-1}

    // sağ kenar
    if(port === 3 || port === 4)
        return {x:1, y:0}

    // alt kenar
    if(port === 5 || port === 6)
        return {x:0, y:1}

    // sol kenar
    if(port === 7 || port === 8)
        return {x:-1, y:0}

    return {x:0, y:0}
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
    state: GameState,
    playerId: number
)
{
    const player = state.players.find(p => p.id === playerId)

    if(!player) return

    let x = player.startX
    let y = player.startY
    let entry = player.entryPort as Port

    console.log("PLAYER START")
    console.log("start cell:", x, y)
    console.log("entry port:", entry)

    while(true)
    {
        const cell = state.board.board[y][x]

        console.log("CURRENT CELL:", x, y)
        console.log("CARD:", cell.cardId, "ROT:", cell.rotation)

        if(!cell.cardId)
        {
            console.log("OPEN PATH")
            return "OPEN_PATH"
        }

        const def = CardDefinitions.find(c => c.id === cell.cardId)
        if(!def) return

        const connections = rotateConnections(
            def.connections,
            cell.rotation
        )

        console.log("ROTATED CONNECTIONS:", connections)

        const exit = findExit(entry, connections)

        console.log("ENTRY:", entry, "EXIT:", exit)

        if(!exit)
        {
            console.log("DEAD END")
            return "DEAD_END"
        }

        const offset = getNextCellOffset(exit)

        console.log("OFFSET:", offset)

        x += offset.x
        y += offset.y

        console.log("NEXT CELL:", x, y)

        if(
            x < 0 ||
            y < 0 ||
            x >= state.board.size ||
            y >= state.board.size
        )
        {
            console.log("OUT OF BOARD")
            return "OUT_OF_BOARD"
        }

        entry = getOppositePort(exit)

        console.log("NEXT ENTRY:", entry)
    }
}

export function tracePlayerPathCells(
    state: GameState,
    playerId: number
)
{
    const player = state.players.find(p => p.id === playerId)
    if(!player) return []

    let x = player.startX
    let y = player.startY
    let entry = player.entryPort as Port

    const visitedCells:{x:number,y:number}[] = []

    while(true)
    {
        visitedCells.push({ x, y })

        const cell = state.board.board[y][x]

        if(!cell.cardId)
        {
            return visitedCells
        }

        const def = CardDefinitions.find(c => c.id === cell.cardId)
        if(!def) return visitedCells

        const connections = rotateConnections(
            def.connections,
            cell.rotation
        )

        const exit = findExit(entry, connections)
        if(!exit)
        {
            return visitedCells
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
            return visitedCells
        }

        entry = getOppositePort(exit)
    }
}


export function tracePlayerPathDetailed(
    state: GameState,
    playerId: number
)
{
    const player = state.players.find(p => p.id === playerId)
    if(!player) return []

    let x = player.startX
    let y = player.startY
    let entry = player.entryPort as Port

    const path:{
        x:number
        y:number
        entry:Port
        exit:Port
    }[] = []

    while(true)
    {
        const cell = state.board.board[y][x]

        if(!cell.cardId)
        {
            return path
        }

        const def = CardDefinitions.find(c => c.id === cell.cardId)
        if(!def) return path

        const connections = rotateConnections(
            def.connections,
            cell.rotation
        )

        const exit = findExit(entry, connections)

        if(!exit)
        {
            return path
        }

        // Path step kaydet
        path.push({
            x,
            y,
            entry,
            exit
        })

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
            return path
        }

        entry = getOppositePort(exit)
    }
}


/**
 * Board üzerindeki flow uçlarını bulur
 */
export function findFlowEnds(state:GameState)
{
    const board = state.board.board
    const size = state.board.size

    const results:{
        x:number
        y:number
        fromPort:Port
    }[] = []

    for(let y=0;y<size;y++)
    {
        for(let x=0;x<size;x++)
        {
            const cell = board[y][x]

            if(!cell.cardId) continue

            const def = CardDefinitions.find(c=>c.id===cell.cardId)
            if(!def) continue

            const connections = rotateConnections(
                def.connections,
                cell.rotation
            )

            for(const conn of connections)
            {
                const ports = [conn[0], conn[1]]

                for(const port of ports)
                {
                    const offset = getNextCellOffset(port)

                    const nx = x + offset.x
                    const ny = y + offset.y

                    if(
                        nx < 0 ||
                        ny < 0 ||
                        nx >= size ||
                        ny >= size
                    )
                        continue

                    const nextCell = board[ny][nx]

                    if(!nextCell.cardId)
                    {
                        results.push({
                            x:nx,
                            y:ny,
                            fromPort:getOppositePort(port)
                        })
                    }
                }
            }
        }
    }

    return results
}


/**
 * Oyuncunun mevcut yolunu takip eder ve ilk boş kareyi döndürür
 */
export function findCurrentPlayerNextCell(
    state: GameState,
    playerId: number
)
{
    const player = state.players.find(p => p.id === playerId)
    if(!player) return null

    let x = player.startX
    let y = player.startY
    let entry = player.entryPort as Port

    while(true)
    {
        const cell = state.board.board[y][x]

        if(!cell.cardId)
        {
            return {
                x,
                y,
                entryPort: entry
            }
        }

        const def = CardDefinitions.find(c => c.id === cell.cardId)
        if(!def) return null

        const connections = rotateConnections(
            def.connections,
            cell.rotation
        )

        const exit = findExit(entry, connections)
        if(!exit) return null

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
            return null
        }

        entry = getOppositePort(exit)
    }
}