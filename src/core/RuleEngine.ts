/**
 * File: src/core/RuleEngine.ts
 * Purpose: Kart yerleştirme için temel geçerlilik kontrolünü yapar
 */

import { BoardCell } from "./BoardEngine"

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