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

    boardLayer!: Phaser.GameObjects.Container
    uiLayer!: Phaser.GameObjects.Container

    ghostCard?: Phaser.GameObjects.Image

    pathPreview?: Phaser.GameObjects.Graphics

    boardSize = 8
    cellSize = 0

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


    savedScrollX = 0
    savedScrollY = 0

    constructor()
    {
        super("GameScene")
    }

    preload()
    {
        for(let i = 1; i <= 20; i++)
        {
            const num = i.toString().padStart(2, "0")
            this.load.image(`card_${num}`, `assets/cards/card_${num}.jpg`)
        }
    }

    create()
    {
        this.initGame()
        this.setupLayoutValues()
        this.setupLayers()
        this.setupCameras()
        this.setupViews()
        this.setupInput()
        this.renderStaticUi()
        this.focusInitialPlayer()
        //this.setupMobileCameraControls()
        this.setupZoom()
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
                startY: 7,
                entryPort: 6
            },
        ]

        this.gameEngine = new GameEngine()
        this.gameEngine.startGame(this.boardSize, players)
    }

    setupLayoutValues()
    {
        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        const usableWidth = screenWidth - (this.sidePadding * 2)

        this.cellSize = usableWidth / this.boardSize

        const boardPixelSize = this.cellSize * this.boardSize

        this.boardViewportWidth = boardPixelSize
        this.boardViewportHeight = boardPixelSize

        this.boardViewportX = (screenWidth - boardPixelSize) / 2
        this.boardViewportY = this.topUiHeight

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
            boardPixelWidth,
            boardPixelHeight
        )

        this.boardCamera.setZoom(this.playZoom)
        this.boardCamera.setRoundPixels(true)
        this.boardCamera.setBackgroundColor("#0f1720")

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
            this.boardWorldY
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

        const x = Math.floor((worldPoint.x - this.boardWorldX) / this.cellSize)
        const y = Math.floor((worldPoint.y - this.boardWorldY) / this.cellSize)

        if(x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize)
        {
            return null
        }

        return { x, y }
    }

    getCellCenter(x: number, y: number)
    {
        return {
            x: this.boardWorldX + (x * this.cellSize) + (this.cellSize / 2),
            y: this.boardWorldY + (y * this.cellSize) + (this.cellSize / 2)
        }
    }

handleMove(pointer: Phaser.Input.Pointer)
{
    const cell = this.getBoardCellFromPointer(pointer)

    if(!cell)
    {
        if(this.ghostCard)
        {
            this.ghostCard.setVisible(false)
        }
        return
    }

    const selectedCard = this.handView.getSelectedCard()

    if(!selectedCard)
    {
        if(this.ghostCard)
        {
            this.ghostCard.setVisible(false)
        }
        return
    }

    const center = this.getCellCenter(cell.x, cell.y)

    if(!this.ghostCard)
    {
        this.ghostCard = this.add.image(center.x, center.y, selectedCard)
        this.ghostCard.setDisplaySize(this.cellSize - 4, this.cellSize - 4)
        this.ghostCard.setAlpha(0.5)
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


    if(
        nextCell &&
        nextCell.x === cell.x &&
        nextCell.y === cell.y &&
        state.board.board[cell.y][cell.x].cardId === null
    )
    {
        if(isAllowedCard)
        {
            // valid placement
            this.ghostCard.setTint(0x00ff88)
        }
        else
        {
            // wrong card
            this.ghostCard.setTint(0xff4444)
        }
    }
    else
    {
        this.ghostCard.clearTint()
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

        if(newState)
        {
            const nextCellAfterMove = findCurrentPlayerNextCell(
                newState,
                newState.players[newState.currentPlayer].id
            )

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

        this.focusBoardCell(cell.x, cell.y, true)

        const result = tracePlayerPath(state, actingPlayer.id)
        console.log("PATH RESULT:", result)
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

    if(this.isMapMode)
    {
        // mevcut kamera konumunu kaydet
        this.savedScrollX = this.boardCamera.scrollX
        this.savedScrollY = this.boardCamera.scrollY

        const boardCenterX = this.boardWorldX + ((this.boardSize * this.cellSize) / 2)
        const boardCenterY = this.boardWorldY + ((this.boardSize * this.cellSize) / 2)

        this.boardCamera.setZoom(this.mapZoom)
        this.boardCamera.pan(boardCenterX, boardCenterY, 250)

        return
    }

    // map modundan çıkınca eski yere dön
    this.boardCamera.setZoom(this.playZoom)

    this.boardCamera.scrollX = this.savedScrollX
    this.boardCamera.scrollY = this.savedScrollY
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


}