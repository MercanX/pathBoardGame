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

import BoardView from "../ui/BoardView"
import HandView from "../ui/HandView"
import { getValidMovesForPlayer } from "../core/RuleEngine"
import { CardDefinitions } from "../data/CardDefinitions"

import { 
    findCurrentPlayerNextCell,
    tracePlayerPath,
    tracePlayerPathCells
} from "../core/PathEngine"

import BotController from "../controllers/BotController"
import InputController from "../controllers/InputController"
import GhostController from "../controllers/GhostController"
import GameOverController from "../controllers/GameOverController"
import GameOverUIController from "../controllers/GameOverUIController"
import EffectController from "../controllers/EffectController"
import { PlayerService } from "../core/PlayerService"

import RageAdService from "../services/RageAdService"
import AdService from "../services/AdService"
import { giveCardToPlayer } from "../core/DeckEngine"

import ChangeCardController from "../controllers/ChangeCardController"
import { GameConfig } from "../config/GameConfig"

export default class GameScene extends Phaser.Scene
{
    gameEngine!: GameEngine

    boardView!: BoardView
    handView!: HandView

    botController!: BotController
    inputController!: InputController
    ghostController!: GhostController
    gameOverController!: GameOverController
    gameOverUIController!: GameOverUIController
    effectController!: EffectController
    changeCardController!: ChangeCardController
    changePopupElements: Phaser.GameObjects.GameObject[] = []

    uiCamera!: Phaser.Cameras.Scene2D.Camera
    boardCamera!: Phaser.Cameras.Scene2D.Camera
   
    boardLayer!: Phaser.GameObjects.Container
    uiLayer!: Phaser.GameObjects.Container

    changePopup?: Phaser.GameObjects.Container
    goldText!: Phaser.GameObjects.Text

    changeBadgeCircle!: Phaser.GameObjects.Arc
    changeBadgeText!: Phaser.GameObjects.Text

    ghost =
    {
        card: undefined as Phaser.GameObjects.Image | undefined,
        highlight: undefined as Phaser.GameObjects.Rectangle | undefined,
        preview: undefined as Phaser.GameObjects.Graphics | undefined
    }

    get ghostCard()
    {
        return this.ghost.card
    }

    set ghostCard(value: Phaser.GameObjects.Image | undefined)
    {
        this.ghost.card = value
    }

    get highlightCell()
    {
        return this.ghost.highlight
    }

    set highlightCell(value: Phaser.GameObjects.Rectangle | undefined)
    {
        this.ghost.highlight = value
    }

    get pathPreview()
    {
        return this.ghost.preview
    }

    set pathPreview(value: Phaser.GameObjects.Graphics | undefined)
    {
        this.ghost.preview = value
    }

    boardSize = 8

    cellSize = 0
    boardMargin = 60

    boardWorldX = 0
    boardWorldY = 0

    boardViewportX = 0
    boardViewportY = 0
    boardViewportWidth = 0
    boardViewportHeight = 0

    topUiHeight = 175
    bottomUiHeight = 260
    sidePadding = 24

    playZoom = 2
    mapZoom = 1
    isMapMode = false

    currentRotation = 0

    selectedHandIndex: number | null = null

    isDragging = false

    bottomUI!: Phaser.GameObjects.Container

    btnExit!: Phaser.GameObjects.Image
    btnRotate!: Phaser.GameObjects.Image
    btnMap!: Phaser.GameObjects.Image

    btnChange!: Phaser.GameObjects.Image

    savedCenterX = 0
    savedCenterY = 0

    isGameOver = false
    isBotRunning = false

    // 🔥 CHANGE SYSTEM
    changeUsageCount: number = 0
    maxChangePerGame: number = 3

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



        this.load.image("ui_win", "assets/ui/win.png")
        this.load.image("ui_draw", "assets/ui/draw.png")
        this.load.image("ui_lost", "assets/ui/lost.png")

        this.load.image("ui_confirm_bg", "assets/ui/quit.png")
        this.load.image("btn_yes", "assets/ui/btn_home.png")
        this.load.image("btn_no", "assets/ui/btn_exit.png")


        /*
        this.load.image("ui_confirm_bg", "assets/ui/confirm_bg.png")
        this.load.image("btn_yes", "assets/ui/btn_yes.png")
        this.load.image("btn_no", "assets/ui/btn_no.png")
        */


    }

    create()
    {

        AdService.init()
        this.isGameOver = false
        this.isBotRunning = false
        this.isMapMode = false

        this.initGame()
        this.setupLayoutValues()
        this.setupLayers()
        this.createBackground() 
        this.setupCameras()
        this.setupViews()

        this.changeUsageCount = 0

        this.botController = new BotController(
            this,
            this.gameEngine
        )

        this.ghostController = new GhostController(this)

        this.inputController = new InputController(
            this,

            this.boardView,
            this.handView,
            this.gameEngine,

            this.boardLayer,

            (pointer)=>this.getBoardCellFromPointer(pointer),
            (x,y)=>this.getCellCenter(x,y),

            ()=>this.cellSize,

            ()=>this.currentRotation,
            (r)=>this.currentRotation = r,

            ()=>this.ghostCard,
            (g)=>this.ghostCard = g,

            ()=>this.highlightCell,
            (h)=>this.highlightCell = h,

            ()=>this.pathPreview,
            (p)=>this.pathPreview = p,

            ()=>this.isDragging,
            (x,y,animate)=>this.focusBoardCell(x,y,animate),
            ()=>this.checkBotTurn()
        )

        this.gameOverController = new GameOverController(this.gameEngine)

        this.gameOverUIController = new GameOverUIController(this)

        this.effectController = new EffectController(
            this,
            this.uiLayer
        )

        this.changeCardController = new ChangeCardController(
            this,
            this.uiLayer
        )

        this.setupInput()
        this.renderStaticUi()
        this.focusInitialPlayer()
        this.createBottomUI()

        this.updateChangeBadge()

        //this.setupMobileCameraControls()
        //this.setupZoom()

        this.events.on(
            "hand_card_selected",
            () => {

                this.ghostController.updateGhostForSelectedCard()

                // 🔥 YENİ EKLE
                this.selectedHandIndex = this.handView.selectedIndex

                console.log("Selected index:", this.selectedHandIndex)
            }
        )

    }

    initGame()
    {

        const players: PlayerState[] =
        [
            {
                id: 1,
                hand: [],
                isAlive: true,
                isBot: false,
                startX: 0,
                startY: this.boardSize-1,
                entryPort: 6
            },
            {
                id: 2,
                hand: [],
                isAlive: true,
                isBot: true,
                botLevel: "ultra",//"easy" | "normal" | "hard"
                startX: this.boardSize-1,
                startY: 0,
                entryPort: 2
            }
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
            this.boardViewportY + this.boardViewportHeight - 20,
            handWidth,
            this.bottomUiHeight - 10
        )

        const state = this.gameEngine.getState()

        let nextCellForRender

        if(state)
        {
            const nextCell = findCurrentPlayerNextCell(
                state,
                state.players[state.currentPlayer].id
            )

            nextCellForRender = nextCell
                ? { x: nextCell.x, y: nextCell.y }
                : undefined
        }

        // board render
        this.boardView.render(nextCellForRender)

        // hand render
        if(state)
        {

            const humanPlayerIndex = state.players.findIndex(p => !p.isBot)

            const validMoves = getValidMovesForPlayer(
                state,
                humanPlayerIndex
            )

            const validCardIds = new Set(
                validMoves.map(v => v.cardId)
            )

            this.handView.render(validCardIds)

        }
    }

    updateGoldUI()
    {
        if(!this.goldText) return
        this.updateChangeButtonVisual()

        this.goldText.setText(PlayerService.get().gold.toString())
    }


    renderStaticUi()
    {

        const { width, height } = this.scale
        // ======================
        // GOLD UI
        // ======================
        const goldIcon = this.add.image(width - 120, 90, "gold_icon")
        goldIcon.setScale(0.5)

        this.goldText = this.add.text(width - 70, 90, "0", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#FFD700",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0, 0.5)
   
        this.goldText.setText(PlayerService.get().gold.toString())

        const boardFrame = this.add.rectangle(
            this.boardViewportX + this.boardViewportWidth / 2,
            this.boardViewportY + this.boardViewportHeight / 2,
            this.boardViewportWidth,
            this.boardViewportHeight
        )

        boardFrame.setOrigin(0.5)
        boardFrame.setStrokeStyle(2, 0x3a4654)
        boardFrame.setFillStyle(0x111827, 0.15)

        this.uiLayer.add([goldIcon, this.goldText, boardFrame])
    }

    setupInput()
    {
        this.inputController.setupInput(
            this.inputController.handleClick.bind(this.inputController),
            this.toggleMapMode.bind(this),
            () => this.currentRotation,
            (rotation:number) => this.currentRotation = rotation,
            () => this.ghostCard
        )
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

    clearGhostObjects()
    {
        if(this.ghost.card)
        {
            this.ghost.card.destroy()
            this.ghost.card = undefined
        }

        if(this.ghost.highlight)
        {
            this.ghost.highlight.destroy()
            this.ghost.highlight = undefined
        }

        if(this.ghost.preview)
        {
            this.ghost.preview.destroy()
            this.ghost.preview = undefined
        }

        this.boardView.clearGhostOverlays()
    }

    checkBotTurn()
    {
        if(this.isGameOver) return

        // 👇 BOT LOCK
        if(this.isBotRunning) return

        this.isBotRunning = true // 👈 LOCK

        this.botController.checkBotTurn(
            this.boardLayer,
            this.uiLayer,
            this.boardView,
            this.handView,
            this.cellSize,
            this.getCellCenter.bind(this),
            this.focusBoardCell.bind(this)
        )
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

        const y =  this.boardViewportY + this.boardViewportHeight + 300

        this.bottomUI = this.add.container(0,0)
        this.uiLayer.add(this.bottomUI)

        this.btnExit   = this.add.image(width * 0.16, y, "btn_exit")
        this.btnRotate = this.add.image(width * 0.38, y, "btn_rotate")
        this.btnChange = this.add.image(width * 0.62, y, "btn_change")
        this.btnMap    = this.add.image(width * 0.84, y, "btn_map")

        const buttons = [this.btnExit, this.btnRotate, this.btnChange, this.btnMap]

        this.btnExit.setScale(0.45)
        this.btnRotate.setScale(0.45)
        this.btnChange.setScale(0.45)
        this.btnMap.setScale(0.45)

        this.bottomUI.add([
            this.btnExit,
            this.btnRotate,
            this.btnChange,
            this.btnMap
        ])

        // ======================
        // CHANGE COUNT BADGE
        // ======================
        this.changeBadgeCircle = this.add.circle(
            this.btnChange.x + 40,
            this.btnChange.y - 40,
            18,
            0x000000,
            0.9
        )

        this.changeBadgeCircle.setStrokeStyle(2, 0xffffff)

        this.changeBadgeText = this.add.text(
            this.btnChange.x + 40,
            this.btnChange.y - 40,
            "3",
            {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#ffffff"
            }
        ).setOrigin(0.5)

        this.uiLayer.add([
            this.changeBadgeCircle,
            this.changeBadgeText
        ])

        // ======================
        // BUTTON EFFECTS (BOTTOM GROUP)
        // ======================

        this.tweens.add({
            targets: buttons,
            y: "+=5",
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        })



        buttons.forEach((btn) => {

            btn.setInteractive({ useHandCursor: true })

            const baseScale = 0.45
            const pressScale = 0.38
            const releaseScale = 0.55

            // ======================
            // TAP DOWN
            // ======================
            btn.on("pointerdown", () => {

                this.tweens.killTweensOf(btn)

                this.tweens.add({
                    targets: btn,
                    scale: 0.38,
                    duration: 80,
                    ease: "Power2"
                })

                btn.setTint(0xdddddd)

                // ✅ DOĞRU PULSE
                const pulse = this.add.circle(btn.x, btn.y, 10, 0xffffff, 0.4)

                this.uiLayer.add(pulse)

                pulse.setDepth(btn.depth - 1) // butonun altında glow gibi görünür

                this.tweens.add({
                    targets: pulse,
                    scale: 3,
                    alpha: 0,
                    duration: 300,
                    ease: "Cubic.easeOut",
                    onComplete: () => pulse.destroy()
                })
            })

            // ======================
            // TAP UP
            // ======================
            btn.on("pointerup", () => {

                this.tweens.killTweensOf(btn)

                this.tweens.add({
                    targets: btn,
                    scale: releaseScale,
                    duration: 220,
                    ease: "Back.easeOut"
                })

                btn.clearTint()

                // küçük settle
                this.tweens.add({
                    targets: btn,
                    scale: baseScale,
                    duration: 120,
                    delay: 120
                })
            })

            // ======================
            // CANCEL
            // ======================
            btn.on("pointerout", () => {

                this.tweens.killTweensOf(btn)

                this.tweens.add({
                    targets: btn,
                    scale: baseScale,
                    duration: 120
                })

                btn.clearTint()
            })
        })
        // BUTTON INTERACTION

        this.btnExit.setInteractive({ useHandCursor: true })
        this.btnRotate.setInteractive({ useHandCursor: true })
        this.btnChange.setInteractive({ useHandCursor: true })
        this.btnMap.setInteractive({ useHandCursor: true })

        // RESTART BUTTON
        this.btnExit.on("pointerdown", () => {
            this.openHomeConfirmPopup()
        })

        // ROTATE BUTTON
        this.btnRotate.on("pointerdown", () => {

            this.currentRotation = (this.currentRotation + 1) % 4

            this.ghostController.updateGhostForSelectedCard()

        })

        // CHANGE BUTTON
        this.btnChange.on("pointerdown", () => {

            if (this.selectedHandIndex === null) {
                console.log("Kart seçilmedi")
                return
            }

            this.openChangePopup()




        })

        // MAP BUTTON
        this.btnMap.on("pointerdown", () => {
            this.toggleMapMode()
        })

        this.updateChangeButtonVisual()


    }

    updateChangeBadge()
    {
        const remaining = this.maxChangePerGame - this.changeUsageCount

        this.changeBadgeText.setText(remaining.toString())

        // 🔥 RENK KONTROL
        if (remaining <= 0)
        {
            this.changeBadgeCircle.setFillStyle(0xff0000)
        }
        else
        {
            this.changeBadgeCircle.setFillStyle(0x000000)
        }
    }

    updateChangeButtonVisual()
    {
        const cost = this.getChangeCost()
        const gold = PlayerService.get().gold

        if (this.changeUsageCount >= this.maxChangePerGame)
        {
            this.btnChange.setTexture("btn_change")
            this.btnChange.setAlpha(0.4)
            this.btnChange.disableInteractive()
            return
        }

        this.btnChange.setAlpha(1)

        if (gold < cost)
        {
            this.btnChange.setTexture("btn_reward")
        }
        else
        {
            this.btnChange.setTexture("btn_change")
        }
    }

    openChangePopup()
    {
        const width = this.scale.width
        const height = this.scale.height
        
        //this.input.enabled = false
        

        if(!this.isMapMode)
        {
            this.toggleMapMode()
        }

        this.changePopupElements = []

       const addEl = <T extends Phaser.GameObjects.GameObject>(el: T): T => {
            this.changePopupElements.push(el)
            return el
        }

        // =========================
        // OVERLAY
        // =========================
        const overlay = addEl(
            this.add.rectangle(
                width / 2,
                height / 2,
                width+100,
                height+100,
                0x000000,
                0.6
            )
        )

        overlay
            .setScrollFactor(0)
            .setDepth(99990)
            .setInteractive()


        overlay.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation()
        })

        // =========================
        // GRID
        // =========================
        const cols = 4
        const rows = 3
        const gap = 12
        const topSafe = 120
        const bottomSafe = 180

        const gridHeight = height - topSafe - bottomSafe
        const gridWidth  = width * 0.9

        const sizeByWidth  = (gridWidth - gap * (cols - 1)) / cols
        const sizeByHeight = (gridHeight - gap * (rows - 1)) / rows

        const cellSize = Math.min(sizeByWidth, sizeByHeight)

        const cellW = cellSize
        const cellH = cellSize

        const startX = width / 2 - gridWidth / 2
        const startY = 125

        let selectedCardId: string | null = null
        let selectedSlot: Phaser.GameObjects.Rectangle | null = null
        let selectedCardImage: Phaser.GameObjects.Image | null = null

        const state = this.gameEngine.getState()

        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < cols; c++)
            {
                const x = startX + c * (cellW + gap) + cellW / 2
                const y = startY + r * (cellH + gap) + cellH / 2

                const slot = addEl(
                    this.add.rectangle(
                        x,
                        y,
                        cellW,
                        cellH,
                        0x0b1220,
                        0.4
                    )
                )
                .setStrokeStyle(2, 0x3a4654)
                .setDepth(99998)
                .setScrollFactor(0)

                const cardId = state?.deck?.length
                    ? state.deck[Math.floor(Math.random() * state.deck.length)]
                    : null

                if (cardId)
                {
                    const card = addEl(
                        this.add.image(x, y, cardId)
                    )
                    .setDisplaySize(cellW * 0.9, cellH * 0.9)
                    .setDepth(99999)
                    .setScrollFactor(0)
                    .setInteractive({ useHandCursor: true })

                    card.on("pointerdown", () => {

                        if (selectedSlot)
                            selectedSlot.setStrokeStyle(2, 0x3a4654)

                        if (selectedCardImage)
                            selectedCardImage.setDisplaySize(cellW * 0.9, cellH * 0.9)

                        selectedCardId = cardId
                        selectedSlot = slot
                        selectedCardImage = card

                        slot.setStrokeStyle(3, 0x22d3ee)
                        card.setDisplaySize(cellW * 0.95, cellH * 0.95)
                    })
                }
            }
        }

        // =========================
        // BUTTONS
        // =========================
        const lastRowY = startY + (rows - 1) * (cellH + gap) + cellH / 2
        const buttonY = lastRowY + cellH / 2 + 50

        const confirmBtn = addEl(
            this.add.image(width / 2 - 120, buttonY, "btn_yes")
        )
        .setDepth(99999)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })

        const cancelBtn = addEl(
            this.add.image(width / 2 + 120, buttonY, "btn_no")
        )
        .setDepth(99999)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })

        const watchAdBtn = addEl(
            this.add.image(width / 2, buttonY + 90, "btn_reward")
        )
        .setDepth(99999)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true })

        const updatePopupState = () => {
            const cost = this.getChangeCost()
            const gold = PlayerService.get().gold

            if (this.changeUsageCount >= this.maxChangePerGame)
            {
                confirmBtn.disableInteractive()
                confirmBtn.setAlpha(0.3)
                watchAdBtn.setVisible(false)
                return
            }

            if (gold < cost)
            {
                confirmBtn.disableInteractive()
                confirmBtn.setAlpha(0.3)
                watchAdBtn.setVisible(true)
            }
            else
            {
                confirmBtn.setAlpha(1)
                confirmBtn.setInteractive({ useHandCursor: true })
                watchAdBtn.setVisible(false)
            }
        }



        updatePopupState()

        
        // =========================
        // ACTIONS
        // =========================

        const destroyPopup = () => {
            this.changePopupElements.forEach(el => el.destroy())
            this.changePopupElements = []

            this.input.enabled = true // 🔥 EKLE
        }

        confirmBtn.on("pointerdown", () => {

            if (this.changeUsageCount >= this.maxChangePerGame)
            {
                console.log("Change hakkı bitti")
                return
            }

            if (!selectedCardId) return

            // 🔥 NORMAL CHANGE → GOLD DÜŞECEK
            this.applyCardChange(selectedCardId, false)

            destroyPopup()
        })

        watchAdBtn.on("pointerdown", async () => {

            console.log("Watch Ad clicked")

            try {
                const success = await AdService.showRewarded()

                if (!success)
                {
                    console.log("Reklam başarısız")
                    return
                }

                console.log("Reward success")
                this.selectedHandIndex = this.handView.selectedIndex

                // 🔥 ALTIN EKLE
                PlayerService.update({
                    gold: PlayerService.get().gold +  GameConfig.REWARDED.rewardGold
                })

                this.updateGoldUI()

                updatePopupState()

                console.log("Gold verildi")

                // 🔥 POPUP KAPANMASIN
                // destroyPopup() ❌ SİL

                // 🔥 UI GÜNCELLE
                confirmBtn.setAlpha(1)
                confirmBtn.setInteractive()
                watchAdBtn.setVisible(false)


            } catch (e) {
                console.log("Ad error:", e)
            }
        })


        cancelBtn.on("pointerdown", destroyPopup)
    }



    
applyCardChange(selectedCardId: string, isReward = false)
{
    const state = this.gameEngine.getState()
    if (!state) return

    const playerIndex = state.players.findIndex(p => !p.isBot)
    if (playerIndex === -1) return

    const player = state.players[playerIndex]

    if (this.selectedHandIndex === null) return

    const CHANGE_COST = this.getChangeCost()
    const profile = PlayerService.get()

    // ❗ SADECE gold varsa düş
    if (!isReward)
    {
        if (profile.gold < CHANGE_COST)
        {
            console.log("Gold yetmiyor → işlem iptal")
            return
        }

        PlayerService.update({
            gold: profile.gold - CHANGE_COST
        })

        this.updateGoldUI()
    }

    // 🔥 kullanım sayısı
    this.changeUsageCount++
    this.updateChangeButtonState()
    this.updateChangeBadge()

    // 🔥 kart değiştir
    const removed = player.hand.splice(this.selectedHandIndex, 1)[0]
    state.discard.push(removed)

    player.hand.push(selectedCardId)

    this.selectedHandIndex = null // ❗ reset

    this.refreshHandView()
    this.clearGhostObjects() // ❗ önemli

    this.updateChangeButtonVisual()
}
    


    updateChangeButtonState()
    {
        if (this.changeUsageCount >= this.maxChangePerGame)
        {
            this.btnChange.setAlpha(0.4)
            this.btnChange.disableInteractive()
        }
    }

    getChangeCost(): number
    {
        switch (this.changeUsageCount)
        {
            case 0: return GameConfig.CHANGE.oneCard
            case 1: return GameConfig.CHANGE.twoCard
            case 2: return GameConfig.CHANGE.reroll
            default: return GameConfig.CHANGE.reroll
        }
    }

    openHomeConfirmPopup()
    {
        const width = this.scale.width
        const height = this.scale.height

        if(!this.isMapMode)
        {
            this.toggleMapMode()
        }


        // =========================
        // OVERLAY
        // =========================
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width+100,
            height+100,
            0x000000,
            0.6
        )

        overlay
            .setScrollFactor(0)
            .setDepth(99990)
            .setInteractive()

        // =========================
        // POPUP IMAGE (ARKA PLAN)
        // =========================
        const popup = this.add.image(
            width / 2,
            height / 2 - 200,
            "ui_confirm_bg" // 🔥 SEN EKLEYECEKSİN
        )

        popup
            .setDepth(99995)
            .setScale(0.7)
            .setScrollFactor(0)

        // =========================
        // YES BUTTON
        // =========================
        const yesBtn = this.add.image(
            width / 2 - 120,
            height / 2 + 80,
            "btn_yes" // 🔥 SEN EKLEYECEKSİN
        )

        yesBtn
            .setDepth(99999)
            .setScale(0.5)
            .setInteractive({ useHandCursor: true })

        // =========================
        // NO BUTTON
        // =========================
        const noBtn = this.add.image(
            width / 2 + 120,
            height / 2 + 80,
            "btn_no" // 🔥 SEN EKLEYECEKSİN
        )

        noBtn
            .setDepth(99999)
            .setScale(0.5)
            .setInteractive({ useHandCursor: true })

        // =========================
        // ACTIONS
        // =========================

        yesBtn.on("pointerdown", () => {

            // ======================
            // 🔥 EXIT = LOSS
            // ======================
            if(!this.isGameOver)
            {
                PlayerService.addLoss()
            }

            this.scene.stop("GameScene")
            this.scene.start("MainMenuScene")
        })

        noBtn.on("pointerdown", () => {
            overlay.destroy()
            popup.destroy()
            yesBtn.destroy()
            noBtn.destroy()
        })

        // =========================
        // ANIM (OPTIONAL)
        // =========================
        this.tweens.add({
            targets: popup,
            scale: { from: 0.5, to: 0.7 },
            duration: 250,
            ease: "Back.easeOut"
        })
    }


    async checkGameOver()
    {
        const result = this.gameOverController.checkGameOver()

        console.log("GAME OVER RESULT:", result)

        if(!result) return null
        if(this.isGameOver) return result

        this.isGameOver = true
        this.bottomUI.setVisible(false)
        this.handView.setVisible(false)
        this.clearGhostObjects()

        if(!this.isMapMode)
        {
            this.toggleMapMode()
        }

        console.log("SHOW UI TRIGGERED")

        const state = this.gameEngine.getState()

        let isHumanLose = false

        if(state && result)
        {
            const humanPlayer = state.players.find(p => !p.isBot)
            const botPlayer   = state.players.find(p => p.isBot)

            if(result.type === "WIN")
            {
                const winnerId = result.winner

                if(humanPlayer && botPlayer)
                {
                    if(winnerId === humanPlayer.id)
                    {
                        PlayerService.addWin()
                    }
                    else if(winnerId === botPlayer.id)
                    {
                        PlayerService.addLoss()
                        isHumanLose = true
                    }
                }
            }
        }

        // ======================
        // ✅ UI'ı HEMEN GÖSTER
        // ======================
        this.gameOverUIController.show(result)

        // ======================
        // 🔥 RAGE AD (ASYNC, UI BLOK YOK)
        // ======================
        if (isHumanLose)
        {
            setTimeout(async () => {

                try {

                    if (RageAdService.shouldShowAfterLose("OUT_OF_BOARD"))
                    {
                        await AdService.showInterstitial()
                    }

                } catch(e) {
                    console.log("Rage Ad Error:", e)
                }

            }, 300) // küçük delay = daha smooth UX
        }

        return result
    }


    refreshHandView()
    {
        const state = this.gameEngine.getState()
        if(!state) return

        const humanPlayerIndex = state.players.findIndex(p => !p.isBot)

        const validMoves = getValidMovesForPlayer(
            state,
            humanPlayerIndex
        )

        const validCardIds = new Set(
            validMoves.map(v => v.cardId)
        )

        this.handView.render(validCardIds)
    }

}