/**
 * File: src/scenes/GameScene.ts
 * Purpose: Phaser sahnesi + GameEngine + BoardView bağlantısı
 * Usage:
 * - Board için ayrı bir viewport mantığı kurar
 * - Üst UI boşluğu ve yan padding her zaman korunur
 * - Zoom sadece board alanında çalışır
 * - Map mode ile tüm board gösterilir
 * - Play mode ile son kare / başlangıç noktası odakta tutulur
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { PlayerState } from "../core/GameState"
import { tracePlayerPath } from "../core/PathEngine"

import BoardView from "../ui/BoardView"
import { canPlace } from "../core/RuleEngine"

export default class GameScene extends Phaser.Scene
{
    gameEngine!: GameEngine
    boardView!: BoardView

    ghostCard?: Phaser.GameObjects.Image

    boardCamera!: Phaser.Cameras.Scene2D.Camera

    boardSize = 8
    cellSize: number = 0

    startX: number = 0
    startY: number = 0

    isMapMode: boolean = false
    currentRotation = 0

    // Layout sabitleri
    topUiHeight: number = 300
    bottomUiHeight: number = 260
    sidePadding: number = 24

    // Zoom değerleri
    playZoom: number = 3
    mapZoom: number = 1

    constructor()
    {
        super("GameScene")
    }

    preload()
    {
        this.load.image("card_01", "assets/cards/card_01.jpg")
        this.load.image("card_02", "assets/cards/card_02.jpg")
        this.load.image("card_03", "assets/cards/card_03.jpg")
        this.load.image("card_04", "assets/cards/card_04.jpg")
        this.load.image("card_05", "assets/cards/card_05.jpg")
        this.load.image("card_06", "assets/cards/card_06.jpg")
        this.load.image("card_07", "assets/cards/card_07.jpg")
        this.load.image("card_08", "assets/cards/card_08.jpg")
        this.load.image("card_09", "assets/cards/card_09.jpg")
        this.load.image("card_10", "assets/cards/card_10.jpg")
        this.load.image("card_11", "assets/cards/card_11.jpg")
        this.load.image("card_12", "assets/cards/card_12.jpg")
        this.load.image("card_13", "assets/cards/card_13.jpg")
        this.load.image("card_14", "assets/cards/card_14.jpg")
        this.load.image("card_15", "assets/cards/card_15.jpg")
        this.load.image("card_16", "assets/cards/card_16.jpg")
        this.load.image("card_17", "assets/cards/card_17.jpg")
        this.load.image("card_18", "assets/cards/card_18.jpg")
        this.load.image("card_19", "assets/cards/card_19.jpg")
        this.load.image("card_20", "assets/cards/card_20.jpg")
    }

    create()
    {
        this.initGame()

        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        // Board'ın gösterileceği sabit viewport alanı
        const boardViewportX = this.sidePadding
        const boardViewportY = this.topUiHeight
        const boardViewportWidth = screenWidth - (this.sidePadding * 2)
        const boardViewportHeight = screenHeight - this.topUiHeight - this.bottomUiHeight

        // Board'un tamamı map mode'da viewport içine sığsın
        this.cellSize = Math.min(
            boardViewportWidth / this.boardSize,
            boardViewportHeight / this.boardSize
        )

        const boardPixelWidth = this.boardSize * this.cellSize
        const boardPixelHeight = this.boardSize * this.cellSize

        // World içinde board 0,0'dan başlasın
        this.startX = 0
        this.startY = 0

        // Board render
        this.boardView = new BoardView(
            this,
            this.gameEngine,
            this.boardSize,
            this.cellSize,
            this.startX,
            this.startY
        )

        // Ana kamerayı board kamerası gibi kullanıyoruz
        this.boardCamera = this.cameras.main
        this.boardCamera.setViewport(
            boardViewportX,
            boardViewportY,
            boardViewportWidth,
            boardViewportHeight
        )

        // Kamera sadece board world içinde hareket etsin
        this.boardCamera.setBounds(
            this.startX,
            this.startY,
            boardPixelWidth,
            boardPixelHeight
        )

        this.boardCamera.setZoom(this.playZoom)
        this.boardCamera.roundPixels = true

        // Başlangıç oyuncusuna odaklan
        const player = this.gameEngine.getState()?.players[0]
        if(player)
        {
            this.focusBoardCell(player.startX, player.startY, false)
        }

        // Kart döndürme
        this.input.keyboard?.on("keydown-R", () => {

            this.currentRotation++

            if(this.currentRotation > 3)
            {
                this.currentRotation = 0
            }

            if(this.ghostCard)
            {
                this.ghostCard.setRotation(this.currentRotation * Math.PI / 2)
            }

            console.log("ROTATION:", this.currentRotation)
        })

        // Map mode toggle
        this.input.keyboard?.on("keydown-M", () => {
            this.toggleMapMode()
        })

        this.input.on("pointermove", this.handleMove, this)
        this.input.on("pointerdown", this.handleClick, this)
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
                entryPort: 7
            },
            {
                id: 2,
                hand: [],
                isAlive: true,
                startX: 7,
                startY: 7,
                entryPort: 3
            }
        ]

        this.gameEngine = new GameEngine()

        this.gameEngine.startGame(
            this.boardSize,
            players
        )
    }

    handleClick(pointer: Phaser.Input.Pointer)
    {
        const worldPoint = this.boardCamera.getWorldPoint(pointer.x, pointer.y)

        const x = Math.floor(
            (worldPoint.x - this.startX) / this.cellSize
        )

        const y = Math.floor(
            (worldPoint.y - this.startY) / this.cellSize
        )

        if(x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize)
        {
            return
        }

        const state = this.gameEngine.getState()
        if(!state) return

        const player = state.players[state.currentPlayer]
        const card = player.hand[0]

        if(!card) return

        if(!canPlace(state.board.board, x, y))
        {
            console.log("INVALID MOVE")
            return
        }

        try
        {
            this.gameEngine.playCard(
                card,
                x,
                y,
                this.currentRotation
            )

            this.boardView.render()
            this.focusBoardCell(x, y, true)

            const result = tracePlayerPath(
                state,
                player.id
            )

            if(this.ghostCard)
            {
                this.ghostCard.destroy()
                this.ghostCard = undefined
            }

            console.log("PATH RESULT:", result)
            console.log("Card placed", x, y)
        }
        catch(error)
        {
            console.log("Invalid move", error)
        }
    }

    handleMove(pointer: Phaser.Input.Pointer)
    {
        const worldPoint = this.boardCamera.getWorldPoint(pointer.x, pointer.y)

        const x = Math.floor(
            (worldPoint.x - this.startX) / this.cellSize
        )

        const y = Math.floor(
            (worldPoint.y - this.startY) / this.cellSize
        )

        if(x < 0 || y < 0 || x >= this.boardSize || y >= this.boardSize)
        {
            if(this.ghostCard)
            {
                this.ghostCard.setVisible(false)
            }
            return
        }

        const state = this.gameEngine.getState()
        if(!state) return

        const player = state.players[state.currentPlayer]
        const card = player.hand[0]

        if(!card) return

        const px = this.startX + (x * this.cellSize) + (this.cellSize / 2)
        const py = this.startY + (y * this.cellSize) + (this.cellSize / 2)

        if(!this.ghostCard)
        {
            this.ghostCard = this.add.image(px, py, card)

            this.ghostCard.setDisplaySize(
                this.cellSize - 4,
                this.cellSize - 4
            )

            this.ghostCard.setAlpha(0.5)
        }
        else
        {
            this.ghostCard.setTexture(card)
            this.ghostCard.setPosition(px, py)
            this.ghostCard.setVisible(true)
        }

        this.ghostCard.setRotation(
            this.currentRotation * Math.PI / 2
        )

        const valid = canPlace(
            state.board.board,
            x,
            y
        )

        if(valid)
        {
            this.ghostCard.setTint(0x00ff00)
        }
        else
        {
            this.ghostCard.setTint(0xff0000)
        }
    }

    toggleMapMode()
    {
        this.isMapMode = !this.isMapMode

        if(this.isMapMode)
        {
            this.boardCamera.setZoom(this.mapZoom)

            const boardCenterX = this.startX + (this.boardSize * this.cellSize / 2)
            const boardCenterY = this.startY + (this.boardSize * this.cellSize / 2)

            this.boardCamera.pan(boardCenterX, boardCenterY, 250)

            console.log("MAP MODE")
        }
        else
        {
            this.boardCamera.setZoom(this.playZoom)

            const state = this.gameEngine.getState()
            if(!state) return

            const currentPlayer = state.players[state.currentPlayer]
            this.focusBoardCell(currentPlayer.startX, currentPlayer.startY, true)

            console.log("PLAY MODE")
        }
    }

    focusBoardCell(x: number, y: number, animate: boolean = true)
    {
        const px = this.startX + (x * this.cellSize) + (this.cellSize / 2)
        const py = this.startY + (y * this.cellSize) + (this.cellSize / 2)

        if(animate)
        {
            this.boardCamera.pan(px, py, 300)
        }
        else
        {
            this.boardCamera.centerOn(px, py)
        }
    }
}