/**
 * File: src/core/RuleEngine.ts
 * Purpose: Kart yerleştirme için temel geçerlilik kontrolünü yapar
 */

import { BoardCell } from "./BoardEngine"
import { GameState } from "./GameState"
import { findCurrentPlayerNextCell } from "./PathEngine"
import { getRotatedConnections } from "./CardEngine"

export function canPlace(
    board: BoardCell[][],
    x: number,
    y: number
): boolean
{
    if(y < 0 || y >= board.length) return false
    if(x < 0 || x >= board[y].length) return false

    return board[y][x].cardId === null
}


/**
 * File: src/core/RuleEngine.ts
 * Purpose: Oyuncunun elindeki kartlardan hangilerinin oynanabilir olduğunu bulur
 */



export function getValidMovesForPlayer(
    state: GameState,
    playerIndex: number
)
{
    const player = state.players[playerIndex]

    const nextCell = findCurrentPlayerNextCell(state, player.id)

    if(!nextCell)
    {
        return []
    }

    const entryPort = nextCell.entryPort

    const validMoves:any[] = []

    for(const cardId of player.hand)
    {
        for(let rot = 0; rot < 4; rot++)
        {
            const connections = getRotatedConnections(cardId, rot)

            for(const conn of connections)
            {
                if(conn[0] === entryPort || conn[1] === entryPort)
                {
                    validMoves.push({
                        cardId: cardId,
                        rotation: rot
                    })
                }
            }
        }
    }

    return validMoves
}