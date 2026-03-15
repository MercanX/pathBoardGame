/**
 * File: src/ui/BoardView.ts
 * File Name: BoardView.ts
 * Purpose: Board grid ve card render objelerini board layer içine üretmek.
 * Usage:
 * - Tüm board objeleri tek ownership altında boardLayer içine eklenir
 * - Kamera ayrımı container seviyesinde yapılır
 */

import Phaser from "phaser"
import CellView from "./CellView"
import GameEngine from "../core/GameEngine"

import { findExit } from "../core/PathEngine"
import { CardDefinitions } from "../data/CardDefinitions"
import { rotateConnections } from "../core/CardEngine"
import { tracePlayerPathDetailed } from "../core/PathEngine"

export default class BoardView
{
    scene: Phaser.Scene
    parentContainer: Phaser.GameObjects.Container
    gameEngine: GameEngine

    cells: CellView[][] = []

    nextCellHighlight?: Phaser.GameObjects.Rectangle

    flowLight?: Phaser.GameObjects.Arc
    flowTween?: Phaser.Tweens.Tween

    boardSize: number
    cellSize: number
    startX: number
    startY: number
    //gridOffset = 60

    boardPadding = 0
    boardMargin: number
    //boardMargin = 60
    

    constructor(
        scene: Phaser.Scene,
        parentContainer: Phaser.GameObjects.Container,
        gameEngine: GameEngine,
        boardSize: number,
        cellSize: number,
        startX: number,
        startY: number,
        boardMargin: number
    )
    {

        this.scene = scene
        this.parentContainer = parentContainer
        this.gameEngine = gameEngine
        this.boardSize = boardSize
        this.cellSize = cellSize
        this.startX = startX
        this.startY = startY
        this.boardMargin = boardMargin

        // BOARD BACKGROUND

        const gridSize = this.boardSize * this.cellSize

        const boardPixelSize = gridSize + (this.boardMargin * 2)

        const boardBg = this.scene.add.image(
            this.startX + this.boardMargin + gridSize / 2,
            this.startY + this.boardMargin + gridSize / 2,
            "board"
        )

        boardBg.setDisplaySize(boardPixelSize, boardPixelSize)
 
        //boardBg.setDisplaySize(boardPixelSize + this.boardPadding * 2,boardPixelSize + this.boardPadding * 2)

        this.parentContainer.add(boardBg)


        boardBg.setDepth(-10)

        this.parentContainer.add(boardBg)

        this.createBoard()

        this.createFlowLight()


    }

    createBoard()
    {
        for(let y = 0; y < this.boardSize; y++)
        {
            this.cells[y] = []

            for(let x = 0; x < this.boardSize; x++)
            {




                const px = this.startX + this.boardMargin + (x * this.cellSize)
                const py = this.startY + this.boardMargin + (y * this.cellSize)

                const cell = new CellView(
                    this.scene,
                    this.parentContainer,
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

render(nextCell?: {x:number,y:number})
{
    const state = this.gameEngine.getState()
    if(!state) return


    for(let y = 0; y < this.boardSize; y++)
    {
        for(let x = 0; x < this.boardSize; x++)
        {
            this.cells[y][x].clearOverlays()
        }
    }

    const board = state.board.board

    console.log("===== BOARDVIEW STATE =====")
    console.log(state)

    // 1️⃣ Önce kart sprite'larını çiz
    for(let y = 0; y < this.boardSize; y++)
    {
        for(let x = 0; x < this.boardSize; x++)
        {
            const cellState = board[y][x]

            this.cells[y][x].setCard(
                cellState.cardId,
                cellState.rotation
            )
        }
    }

    // 2️⃣ PathEngine'den oyuncu yolunu al
    const path = tracePlayerPathDetailed(
        state,
        state.players[0].id
    )

    console.log("RENDER PATH:", path)

    // 3️⃣ Path üzerindeki kartların overlay'ini çiz
    for(const step of path)
    {
        const x = step.x
        const y = step.y

        const cellState = board[y][x]
        if(!cellState.cardId) continue

        const cell = this.cells[y][x]

        const min = Math.min(step.entry, step.exit)
        const max = Math.max(step.entry, step.exit)

        console.log(
            "DRAW OVERLAY",
            cellState.cardId,
            "PORTS:",
            min,"→",max,
            "POS:",
            x,y
        )

        const cellData = state.board.board[step.y][step.x]

        if(!cellData.cardId) continue

        cell.setPathOverlay(
            cellData.cardId,
            min,
            max,
            cellData.rotation
        )
    }

    // 4️⃣ NEXT CELL HIGHLIGHT

    if(this.nextCellHighlight)
    {
        this.nextCellHighlight.destroy()
        this.nextCellHighlight = undefined
    }

    if(nextCell)
    {
        const px = this.startX + this.boardMargin + (nextCell.x * this.cellSize)
        const py = this.startY + this.boardMargin + (nextCell.y * this.cellSize)

        this.nextCellHighlight = this.scene.add.rectangle(
            px + this.cellSize / 2,
            py + this.cellSize / 2,
            this.cellSize - 1,
            this.cellSize - 1
        )

        this.nextCellHighlight.setStrokeStyle(1,0x22d3ee)
        this.nextCellHighlight.setDepth(50)
        this.nextCellHighlight.setAlpha(0.9)

        this.parentContainer.add(this.nextCellHighlight)

        this.scene.tweens.add({
            targets: this.nextCellHighlight,
            alpha: 0.35,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })
    }
}

createFlowLight()
{
    if(this.flowLight)
    {
        this.flowLight.destroy()
    }

    const px = this.startX + this.boardMargin
    const py = this.startY + this.boardMargin

    const x = px + this.cellSize / 2
    const y = py + this.cellSize / 2

    this.flowLight = this.scene.add.circle(
        x,
        y,
        this.cellSize * 0.15,
        0x22d3ee
    )

    this.flowLight.setDepth(200)
    this.flowLight.setAlpha(0.9)

    this.parentContainer.add(this.flowLight)
}

}