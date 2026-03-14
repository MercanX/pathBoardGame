/**
 * File: src/ui/BoardView.ts
 * Purpose: Board üzerindeki tüm hücreleri ve kart renderını yönetir
 */

import Phaser from "phaser"
import CellView from "./CellView"
import GameEngine from "../core/GameEngine"

export default class BoardView
{
    scene:Phaser.Scene
    gameEngine:GameEngine

    cells:CellView[][] = []

    boardSize:number
    cellSize:number

    startX:number
    startY:number

    constructor(
        scene:Phaser.Scene,
        gameEngine:GameEngine,
        boardSize:number,
        cellSize:number,
        startX:number,
        startY:number
    )
    {
        this.scene = scene
        this.gameEngine = gameEngine

        this.boardSize = boardSize
        this.cellSize = cellSize

        this.startX = startX
        this.startY = startY

        this.createBoard()
    }

    createBoard()
    {
        for(let y=0;y<this.boardSize;y++)
        {
            this.cells[y] = []

            for(let x=0;x<this.boardSize;x++)
            {
                const px = this.startX + x*this.cellSize
                const py = this.startY + y*this.cellSize

                const cell = new CellView(
                    this.scene,
                    x,
                    y,
                    px,
                    py,
                    this.cellSize
                )

                this.cells[y][x] = cell
            }
        }
    }

    render()
    {
        const state = this.gameEngine.getState()

        if(!state) return

        const board = state.board.board

        for(let y=0;y<this.boardSize;y++)
        {
            for(let x=0;x<this.boardSize;x++)
            {
                const cellState = board[y][x]

                if(cellState.cardId)
                {
                    this.cells[y][x].setCard(
                        cellState.cardId
                    )
                }
            }
        }
    }
}