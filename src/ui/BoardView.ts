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
import { Port } from "../data/CardData"
import { tracePlayerPathDetailed } from "../core/PathEngine"
import { getRotatedConnections } from "../core/CardEngine"
import { findExit, getNextCellOffset, getOppositePort } from "../core/PathEngine"
import { CardDefinitions } from "../data/CardDefinitions"

import { rotatePort } from "../core/CardEngine"

import { GameConfig } from "../config/GameConfig"


export default class BoardView
{
    scene: Phaser.Scene
    parentContainer: Phaser.GameObjects.Container
    gameEngine: GameEngine

    cells: CellView[][] = []
    ghostOverlays: Phaser.GameObjects.Image[] = []

    nextCellHighlight?: Phaser.GameObjects.Rectangle

    //flowLight?: Phaser.GameObjects.Arc
    //flowTween?: Phaser.Tweens.Tween

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

        //this.createFlowLight()


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


    // 2️⃣ Tüm oyuncular için path çiz
    for(const player of state.players)
    {
        const path = tracePlayerPathDetailed(
            state,
            player.id
        )

        console.log("RENDER PATH PLAYER:", player.id, path)

        for(const step of path)
        {
            const x = step.x
            const y = step.y

            const cellState = board[y][x]
            if(!cellState.cardId) continue

            const cell = this.cells[y][x]

            const min = Math.min(step.entry, step.exit)
            const max = Math.max(step.entry, step.exit)

            const cellData = state.board.board[y][x]

            if(!cellData.cardId) continue

            const color = player.isBot
                ? GameConfig.BOT_PATH_COLOR
                : GameConfig.HUMAN_PATH_COLOR

            cell.setPathOverlay(
                cellData.cardId,
                min,
                max,
                cellData.rotation,
                color
            )
        }
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

/*
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
*/

clearGhostOverlays()
{
    for(const overlay of this.ghostOverlays)
    {
        overlay.destroy()
    }

    this.ghostOverlays = []
}

addGhostOverlay(
    x: number,
    y: number,
    textureKey: string,
    rotation: number
)
{
    const px =
        this.startX +
        this.boardMargin +
        (x * this.cellSize) +
        (this.cellSize / 2)

    const py =
        this.startY +
        this.boardMargin +
        (y * this.cellSize) +
        (this.cellSize / 2)

    const overlay = this.scene.add.image(
        px,
        py,
        textureKey
    )

    overlay.setDisplaySize(this.cellSize, this.cellSize)
    overlay.setDepth(30)
    overlay.setRotation(rotation * Math.PI / 2)
    overlay.setTint(0x00ffff)
    overlay.setAlpha(0.9)
    overlay.setBlendMode(Phaser.BlendModes.ADD)
    overlay.setDepth(500)

    this.parentContainer.add(overlay)
    this.ghostOverlays.push(overlay)
}


renderGhostPath(
    cardId: string,
    rotation: number,
    placeX: number,
    placeY: number
)
{
    const state = this.gameEngine.getState()
    if(!state) return

    this.clearGhostOverlays()

    const player = state.players[state.currentPlayer]

    let x = player.startX
    let y = player.startY
    let entry: Port = player.entryPort as Port

    while(true)
    {
        let cell = state.board.board[y][x]

        let useCardId = cell.cardId
        let useRotation = cell.rotation

        // hover edilen yere geçici kart koy
        if(x === placeX && y === placeY)
        {
            useCardId = cardId
            useRotation = rotation
        }

        if(!useCardId) break

        const def = CardDefinitions.find(c => c.id === useCardId)
        if(!def) break

        const connections = getRotatedConnections(
            useCardId,
            useRotation
        )

        const exit = findExit(entry, connections)
        if(!exit) break

        const min = Math.min(entry, exit)
        const max = Math.max(entry, exit)

        const reverseRotation = (4 - useRotation) % 4

        const baseA = rotatePort(min as Port, reverseRotation)
        const baseB = rotatePort(max as Port, reverseRotation)

        const baseMin = Math.min(baseA, baseB)
        const baseMax = Math.max(baseA, baseB)

        const key = `${useCardId}_path_${baseMin}_${baseMax}`


        this.addGhostOverlay(
            x,
            y,
            key,
            useRotation
        )

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
            break
        }

        entry = getOppositePort(exit)
    }
}


}