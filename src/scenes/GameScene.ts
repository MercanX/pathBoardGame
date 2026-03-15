/**
 * File: src/scenes/GameScene.ts
 * File Name: GameScene.ts
 * Purpose: Oyun sahnesinin profesyonel kamera/container mimarisiyle yönetilmesi.
 * Usage:
 * - uiCamera sadece UI layer'ı render eder
 * - boardCamera sadece board layer'ı render eder
 * - zoom / pan yalnızca board viewport içinde çalışır
 * - ghost card board layer içinde yaşar
 * Notes:
 * - Bu sürüm mevcut core engine yapını bozmadan sadece render mimarisini düzeltir
 * - Board ve UI ownership artık container tabanlıdır
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { PlayerState } from "../core/GameState"
//import { tracePlayerPath } from "../core/PathEngine"
import { canPlace,getValidMovesForPlayer  } from "../core/RuleEngine"

import BoardView from "../ui/BoardView"
import HandView from "../ui/HandView"

import { CardDefinitions } from "../data/CardDefinitions"

import { 
    findCurrentPlayerNextCell,
    tracePlayerPath,
    tracePlayerPathCells
} from "../core/PathEngine"

export default class GameScene extends Phaser.Scene
{
    gameEngine!: GameEngine

    boardView!: BoardView
    handView!: HandView

    uiCamera!: Phaser.Cameras.Scene2D.Camera
    boardCamera!: Phaser.Cameras.Scene2D.Camera
    highlightCell?: Phaser.GameObjects.Rectangle

    boardLayer!: Phaser.GameObjects.Container
    uiLayer!: Phaser.GameObjects.Container

    ghostCard?: Phaser.GameObjects.Image

    pathPreview?: Phaser.GameObjects.Graphics

    boardSize = 8

    cellSize = 0
    boardMargin = 60

    boardWorldX = 0
    boardWorldY = 0

    boardViewportX = 0
    boardViewportY = 0
    boardViewportWidth = 0
    boardViewportHeight = 0

    topUiHeight = 300
    bottomUiHeight = 260
    sidePadding = 24

    playZoom = 2
    mapZoom = 1
    isMapMode = false

    currentRotation = 0

    dragStartX = 0
    dragStartY = 0
    isDragging = false

    bottomUI!: Phaser.GameObjects.Container

    btnRestart!: Phaser.GameObjects.Image
    btnRotate!: Phaser.GameObjects.Image
    btnMap!: Phaser.GameObjects.Image


    savedScrollX = 0
    savedScrollY = 0
    savedCenterX = 0
    savedCenterY = 0

    constructor()
    {
        super("GameScene")
    }

    

    preload()
    {
        this.load.image("game_bg", "/assets/bg/bg01.png")
        this.load.image("board", "/assets/board/board.png")
        for(let i = 1; i <= 20; i++)
        {
            const num = i.toString().padStart(2, "0")
            this.load.image(`card_${num}`, `assets/cards/card_${num}.jpg`)
        }

        for(const card of CardDefinitions)
        {
            for(const conn of card.connections)
            {
                const a = conn[0]
                const b = conn[1]

                const min = Math.min(a,b)
                const max = Math.max(a,b)

                const key = `${card.id}_path_${min}_${max}`

                this.load.image(
                    key,
                    `assets/cards/${key}.png`
                )
            }
        }

        this.load.image("ui_restart", "assets/ui/restart.png")
        this.load.image("ui_rotate", "assets/ui/rotate.png")
        this.load.image("ui_map", "assets/ui/map.png")

    }

    create()
    {



        this.initGame()
        this.setupLayoutValues()
        this.setupLayers()
        this.createBackground() 
        this.setupCameras()
        this.setupViews()
        this.setupInput()
        this.renderStaticUi()
        this.focusInitialPlayer()
        this.createBottomUI()
        //this.setupMobileCameraControls()
        //this.setupZoom()
    }

    initGame()
    {
        const players: PlayerState[] =
        [
            {
                id: 1,
                hand: [],
                isAlive: true,
                startX: 0,
                startY: this.boardSize-1,
                entryPort: 6
            },
        ]

        this.gameEngine = new GameEngine()
        this.gameEngine.startGame(this.boardSize, players)
    }

createBackground()
{
    const bg = this.add.image(
        this.scale.width / 2,
        this.scale.height / 2,
        "game_bg"
    )

    bg.setDisplaySize(
        this.scale.width,
        this.scale.height
    )

    bg.setDepth(-1000)
}

    setupLayoutValues()
    {
        const screenWidth = this.scale.width
        //const screenHeight = this.scale.height

        const usableWidth = screenWidth - (this.sidePadding * 2)


        this.cellSize = Math.floor(usableWidth / this.boardSize)

        const boardPixelSize = this.cellSize * this.boardSize + (this.boardMargin*2)

        this.boardViewportWidth = boardPixelSize
        this.boardViewportHeight = boardPixelSize

        this.boardViewportX = Math.floor((screenWidth - boardPixelSize) / 2)
        this.boardViewportY = Math.floor(this.topUiHeight)

        console.log('boardPixelSize '+ boardPixelSize)
        console.log('boardViewportWidth '+ this.boardViewportWidth)
        console.log('boardViewportHeight '+ this.boardViewportHeight)
        console.log('boardViewportX '+ this.boardViewportX)
        console.log('boardViewportY '+ this.boardViewportY)

        console.log("cellSize", this.cellSize)
        console.log("grid width", this.cellSize * this.boardSize)
        console.log("grid remainder", usableWidth % this.boardSize)

        this.boardWorldX = 0
        this.boardWorldY = 0
    }

    setupLayers()
    {
        this.boardLayer = this.add.container(0, 0)
        this.uiLayer = this.add.container(0, 0)
    }

    setupCameras()
    {
        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        const boardPixelWidth = this.boardSize * this.cellSize
        const boardPixelHeight = this.boardSize * this.cellSize

        this.uiCamera = this.cameras.main
        this.uiCamera.setViewport(0, 0, screenWidth, screenHeight)
        this.uiCamera.setZoom(1)
        this.uiCamera.setRoundPixels(true)

        this.boardCamera = this.cameras.add(
            this.boardViewportX,
            this.boardViewportY,
            this.boardViewportWidth,
            this.boardViewportHeight
        )

        this.boardCamera.setBounds(
            this.boardWorldX,
            this.boardWorldY,
            boardPixelWidth + (this.boardMargin * 2),
            boardPixelHeight + (this.boardMargin * 2)
        )

        this.boardCamera.setZoom(this.playZoom)
        this.boardCamera.setRoundPixels(true)
        //this.boardCamera.setBackgroundColor("#0f1720")

        this.uiCamera.ignore(this.boardLayer)
        this.boardCamera.ignore(this.uiLayer)
    }

    setupViews()
    {
        this.boardView = new BoardView(
            this,
            this.boardLayer,
            this.gameEngine,
            this.boardSize,
            this.cellSize,
            this.boardWorldX,
            this.boardWorldY,
            this.boardMargin
        )

        const handWidth = this.scale.width
        const handX = 0

        this.handView = new HandView(
            this,
            this.uiLayer,
            this.gameEngine,
            handX,
            this.boardViewportY + this.boardViewportHeight + 50, // board altından 50px
            handWidth,
            this.bottomUiHeight - 40
        )

        //this.handView.render()

        this.boardView.render()

const state = this.gameEngine.getState()

if(state)
{
    const nextCell = findCurrentPlayerNextCell(
        state,
        state.players[state.currentPlayer].id
    )

    const nextCellForRender = nextCell
        ? { x: nextCell.x, y: nextCell.y }
        : undefined

    this.boardView.render(nextCellForRender)

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    const validCardIds = new Set(
        validMoves.map(v => v.cardId)
    )

    this.handView.render(validCardIds)
}

    }

    renderStaticUi()
    {
        const title = this.add.text(
            24,
            24,
            "PATH BOARD GAME",
            {
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        )

        const help = this.add.text(
            24,
            72,
            "R = Rotate | M = Map Mode",
            {
                fontSize: "18px",
                color: "#9ca3af"
            }
        )

        const boardFrame = this.add.rectangle(
            this.boardViewportX + this.boardViewportWidth / 2,
            this.boardViewportY + this.boardViewportHeight / 2,
            this.boardViewportWidth,
            this.boardViewportHeight
        )

        boardFrame.setOrigin(0.5)
        boardFrame.setStrokeStyle(2, 0x3a4654)
        boardFrame.setFillStyle(0x111827, 0.15)

        this.uiLayer.add([title, help, boardFrame])
    }

    setupInput()
    {
        this.input.keyboard?.on("keydown-R", () => {
            this.currentRotation = (this.currentRotation + 1) % 4

            if(this.ghostCard)
            {
                this.ghostCard.setRotation(this.currentRotation * Math.PI / 2)
            }
        })

        this.input.keyboard?.on("keydown-M", () => {
            this.toggleMapMode()
        })

        this.input.on("pointermove", this.handleMove, this)
        this.input.on("pointerdown", this.handleClick, this)
    }

    focusInitialPlayer()
    {
        const firstPlayer = this.gameEngine.getState()?.players[0]

        if(firstPlayer)
        {
            this.focusBoardCell(firstPlayer.startX, firstPlayer.startY, false)
        }
    }

    isPointerInsideBoardViewport(pointer: Phaser.Input.Pointer): boolean
    {
        return Phaser.Geom.Rectangle.Contains(
            new Phaser.Geom.Rectangle(
                this.boardViewportX,
                this.boardViewportY,
                this.boardViewportWidth,
                this.boardViewportHeight
            ),
            pointer.x,
            pointer.y
        )
    }

    getBoardCellFromPointer(pointer: Phaser.Input.Pointer)
    {
        if(!this.isPointerInsideBoardViewport(pointer))
        {
            return null
        }

        const worldPoint = this.boardCamera.getWorldPoint(pointer.x, pointer.y)

        const x = Math.floor(
            (worldPoint.x - this.boardWorldX - this.boardMargin) / this.cellSize
        )

        const y = Math.floor(
            (worldPoint.y - this.boardWorldY - this.boardMargin) / this.cellSize
        )

        if(x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize)
        {
            return null
        }

        return { x, y }
    }

    getCellCenter(x: number, y: number)
    {
        return {
            x: this.boardWorldX + this.boardMargin + (x * this.cellSize) + (this.cellSize / 2),
            y: this.boardWorldY + this.boardMargin + (y * this.cellSize) + (this.cellSize / 2)
        }
    }

handleMove(pointer: Phaser.Input.Pointer)
{
    const cell = this.getBoardCellFromPointer(pointer)

    if(!cell)
    {
        this.boardView.clearGhostOverlays()

        if(this.ghostCard)
        {
            this.ghostCard.setVisible(false)
        }

        if(this.highlightCell)
        {
            this.highlightCell.setVisible(false)
        }
        return
    }

    const selectedCard = this.handView.getSelectedCard()

    if(!selectedCard)
    {
        this.boardView.clearGhostOverlays()

        if(this.ghostCard)
        {
            this.ghostCard.setVisible(false)
        }
        if(this.highlightCell)
        {
            this.highlightCell.setVisible(false)
        }
        return
    }

    const center = this.getCellCenter(cell.x, cell.y)

    if(!this.highlightCell)
    {
        this.highlightCell = this.add.rectangle(
            center.x,
            center.y,
            this.cellSize - 6,
            this.cellSize - 6
        )

        this.highlightCell.setStrokeStyle(4, 0xffffff, 0.9)
        this.highlightCell.setFillStyle(0x000000, 0)
        this.highlightCell.setDepth(150)
        this.highlightCell.setVisible(false)

        this.boardLayer.add(this.highlightCell)
    }
    else
    {
        this.highlightCell.setPosition(center.x, center.y)
    }

    if(!this.ghostCard)
    {
        this.ghostCard = this.add.image(center.x, center.y, selectedCard)
        this.ghostCard.setDisplaySize(this.cellSize - 4, this.cellSize - 4)
        //this.ghostCard.setAlpha(0.9)
        this.ghostCard.setDepth(200)
        this.boardLayer.add(this.ghostCard)
    }
    else
    {
        this.ghostCard.setTexture(selectedCard)
        this.ghostCard.setPosition(center.x, center.y)
        this.ghostCard.setVisible(true)
    }

    this.ghostCard.setRotation(this.currentRotation * Math.PI / 2)

    this.ghostCard.clearTint()

    const state = this.gameEngine.getState()
    if(!state) return

    const player = state.players[state.currentPlayer]

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    const isAllowedCard = validMoves.some(v =>
        v.cardId === selectedCard &&
        v.rotation === this.currentRotation
    )

    const nextCell = findCurrentPlayerNextCell(state, player.id)
    // PATH PREVIEW RESET
    if(this.pathPreview)
    {
        this.pathPreview.destroy()
        this.pathPreview = undefined
    }

    //this.boardView.clearGhostOverlays()

    if(
        nextCell &&
        nextCell.x === cell.x &&
        nextCell.y === cell.y &&
        state.board.board[cell.y][cell.x].cardId === null
    )
    {
        this.boardView.renderGhostPath(
            selectedCard,
            this.currentRotation,
            cell.x,
            cell.y
        )
    }
    else
    {
        this.boardView.clearGhostOverlays()
    }


    if(
        nextCell &&
        nextCell.x === cell.x &&
        nextCell.y === cell.y &&
        state.board.board[cell.y][cell.x].cardId === null
    )
    {
        this.highlightCell.setVisible(true)
        this.ghostCard.setAlpha(1)

        if(isAllowedCard)
        {
            this.highlightCell.setStrokeStyle(20, 0x22c55e, 0.5)
            this.highlightCell.setFillStyle(0x22c55e, 0.5)
        }
        else
        {
            this.highlightCell.setStrokeStyle(20, 0xef4444, 0.5)
            this.highlightCell.setFillStyle(0xef4444, 0.5)
        }
    }
    else
    {
        this.highlightCell.setVisible(false)
        this.ghostCard.setAlpha(0.5)
    }


}



handleClick(pointer: Phaser.Input.Pointer)
{
    if(this.isDragging) return

    const cell = this.getBoardCellFromPointer(pointer)
    if(!cell) return

    const state = this.gameEngine.getState()
    if(!state) return

    const actingPlayer = state.players[state.currentPlayer]

    const selectedCard = this.handView.getSelectedCard()
    if(!selectedCard) return

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    console.log("VALID MOVES:", validMoves)
    console.log("SELECTED CARD:", selectedCard)
    console.log("ROTATION:", this.currentRotation)

    if(validMoves.length === 0)
    {
        console.log("NO VALID CARDS")
        return
    }

    // 1) önce kart + rotasyon doğru mu?
    const isAllowedCard = validMoves.some(v =>
        v.cardId === selectedCard &&
        v.rotation === this.currentRotation
    )

    if(!isAllowedCard)
    {
        console.log("CARD DOES NOT MATCH PATH")
        return
    }

    // 2) sonra doğru next cell mi?
    const nextCell = findCurrentPlayerNextCell(state, actingPlayer.id)

    if(!nextCell)
    {
        console.log("NO NEXT CELL")
        return
    }

    const isCorrectCell =
        cell.x === nextCell.x &&
        cell.y === nextCell.y

    if(!isCorrectCell)
    {
        console.log("NOT NEXT CELL")
        return
    }

    // 3) hücre boş mu?
    if(!canPlace(state.board.board, cell.x, cell.y))
    {
        console.log("INVALID MOVE")
        return
    }

    try
    {
        this.gameEngine.playCard(
            selectedCard,
            cell.x,
            cell.y,
            this.currentRotation
        )

        //this.boardView.render()
        //this.handView.render()

        const newState = this.gameEngine.getState()

        let focusX = cell.x
        let focusY = cell.y

        if(newState)
        {
            const nextCellAfterMove = findCurrentPlayerNextCell(
                newState,
                newState.players[newState.currentPlayer].id
            )

            if(nextCellAfterMove)
            {
                focusX = nextCellAfterMove.x
                focusY = nextCellAfterMove.y
            }

            const nextCellForRender = nextCellAfterMove
                ? { x: nextCellAfterMove.x, y: nextCellAfterMove.y }
                : undefined


            this.boardView.render(nextCellForRender)

            const validMoves = getValidMovesForPlayer(
                newState,
                newState.currentPlayer
            )

            const validCardIds = new Set(
                validMoves.map(v => v.cardId)
            )

            this.handView.render(validCardIds)
        }

        if(this.ghostCard)
        {
            this.ghostCard.destroy()
            this.ghostCard = undefined
        }

        this.focusBoardCell(focusX, focusY, true)


        if(newState)
        {
            const flows = tracePlayerPathCells(
                newState,
                actingPlayer.id
            )

            console.log("===== TRACE AFTER MOVE =====")
            console.table(flows)
        }



    }
    catch(error)
    {
        console.log("Invalid move", error)
    }
}

drawFlowDebug(flows:any[])
{
    for(const f of flows)
    {
        const center = this.getCellCenter(f.x,f.y)

        const r = this.add.rectangle(
            center.x,
            center.y,
            this.cellSize - 6,
            this.cellSize - 6
        )

        r.setStrokeStyle(3,0xffff00)
        r.setDepth(300)

        this.boardLayer.add(r)
    }
}


toggleMapMode()
{
    this.isMapMode = !this.isMapMode

    const gridWidth = this.boardSize * this.cellSize
    const gridHeight = this.boardSize * this.cellSize

    const boardCenterX =
        this.boardWorldX +
        this.boardMargin +
        (gridWidth / 2)

    const boardCenterY =
        this.boardWorldY +
        this.boardMargin +
        (gridHeight / 2)

    if(this.isMapMode)
    {
        this.savedCenterX = this.boardCamera.midPoint.x
        this.savedCenterY = this.boardCamera.midPoint.y

        this.boardCamera.setZoom(this.mapZoom)
        this.boardCamera.pan(boardCenterX, boardCenterY, 250, "Sine.easeInOut")

        return
    }

    this.boardCamera.setZoom(this.playZoom)
    this.boardCamera.centerOn(this.savedCenterX, this.savedCenterY)
}


    focusBoardCell(x: number, y: number, animate = true)
    {
        const center = this.getCellCenter(x, y)

        if(animate)
        {
            this.boardCamera.pan(center.x, center.y, 300, "Sine.easeInOut")
        }
        else
        {
            this.boardCamera.centerOn(center.x, center.y)
        }
    }




setupZoom()
{
    this.input.on(
        "wheel",
        (
            _pointer: Phaser.Input.Pointer,
            _gameObjects: Phaser.GameObjects.GameObject[],
            _deltaX: number,
            deltaY: number
        ) => {

            const newZoom = Phaser.Math.Clamp(
                this.boardCamera.zoom - deltaY * 0.001,
                0.7,
                3
            )

            this.boardCamera.setZoom(newZoom)

            this.clampCamera()
        }
    )
}

clampCamera()
{
    const cam = this.boardCamera

    const maxX = this.boardSize * this.cellSize - cam.width / cam.zoom
    const maxY = this.boardSize * this.cellSize - cam.height / cam.zoom

    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, maxX)
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, maxY)
}


createBottomUI()
{
    const width = this.scale.width
    const height = this.scale.height

    const y = height - 160

    this.bottomUI = this.add.container(0,0)

    this.uiLayer.add(this.bottomUI)

    this.btnRestart = this.add.image(width * 0.20, y, "ui_restart")
    this.btnRotate  = this.add.image(width * 0.50, y, "ui_rotate")
    this.btnMap     = this.add.image(width * 0.80, y, "ui_map")

    // SCALE FIX
    this.btnRestart.setScale(0.45)
    this.btnRotate.setScale(0.45)
    this.btnMap.setScale(0.45)

    this.bottomUI.add([
        this.btnRestart,
        this.btnRotate,
        this.btnMap
    ])
}

}