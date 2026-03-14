/**
 * File: src/scenes/GameScene.ts
 * Purpose: Phaser sahnesi + GameEngine + BoardView bağlantısı
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { PlayerState } from "../core/GameState"
import { tracePlayerPath } from "../core/PathEngine"

import BoardView from "../ui/BoardView"
import { canPlace } from "../core/RuleEngine"

export default class GameScene extends Phaser.Scene
{
    gameEngine!:GameEngine
    boardView!:BoardView

    ghostCard?:Phaser.GameObjects.Image

    boardSize = 8
    cellSize = 64

    startX = 100
    startY = 50
    currentRotation = 0

    constructor()
    {
        super("GameScene")
    }

    create()
    {
        this.initGame()

        this.boardView = new BoardView(
            this,
            this.gameEngine,
            this.boardSize,
            this.cellSize,
            this.startX,
            this.startY
        )
        this.input.keyboard?.on("keydown-R", () => {

            this.currentRotation++

            if(this.currentRotation > 3)
                this.currentRotation = 0

            console.log("ROTATION:", this.currentRotation)

        })

        this.input.on("pointermove",this.handleMove,this)

        this.input.on("pointerdown",this.handleClick,this)
    }

    initGame()
    {
        const players:PlayerState[] =
        [
            {
                id:1,
                hand:[],
                isAlive:true,
                startX:0,
                startY:0,
                entryPort:7
            },
            {
                id:2,
                hand:[],
                isAlive:true,
                startX:7,
                startY:7,
                entryPort:3
            }
        ]

        this.gameEngine = new GameEngine()

        this.gameEngine.startGame(
            this.boardSize,
            players
        )
    }

    handleClick(pointer:Phaser.Input.Pointer)
    {
        const x = Math.floor(
            (pointer.x - this.startX) / this.cellSize
        )

        const y = Math.floor(
            (pointer.y - this.startY) / this.cellSize
        )

        if(x<0 || y<0 || x>=this.boardSize || y>=this.boardSize)
            return

        const state = this.gameEngine.getState()

        if(!state) return

        const player = state.players[state.currentPlayer]

        const card = player.hand[0]

        if(!card) return


        if(!canPlace(state.board.board,x,y))
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

            const result = tracePlayerPath(
                state,
                player.id
            )

            if(this.ghostCard)
            {
                this.ghostCard.destroy()
                this.ghostCard = undefined
            }

            console.log("PATH RESULT:",result)

            console.log("Card placed",x,y)
        }
        catch(e)
        {
            console.log("Invalid move")
        }
    }

preload()
{
    this.load.image("card_01","assets/cards/card_01.png")
    this.load.image("card_02","assets/cards/card_02.png")
    this.load.image("card_03","assets/cards/card_03.png")
}

handleMove(pointer:Phaser.Input.Pointer)
{
    const x = Math.floor(
        (pointer.x - this.startX) / this.cellSize
    )

    const y = Math.floor(
        (pointer.y - this.startY) / this.cellSize
    )

    if(x<0 || y<0 || x>=this.boardSize || y>=this.boardSize)
    {
        if(this.ghostCard)
            this.ghostCard.setVisible(false)

        return
    }

    const state = this.gameEngine.getState()

    if(!state) return

    const player = state.players[state.currentPlayer]
    const card = player.hand[0]

    if(!card) return

    const px = this.startX + x*this.cellSize + this.cellSize/2
    const py = this.startY + y*this.cellSize + this.cellSize/2

    if(!this.ghostCard)
    {
        this.ghostCard = this.add.image(px,py,card)

        this.ghostCard.setDisplaySize(
            this.cellSize-4,
            this.cellSize-4
        )

        this.ghostCard.setAlpha(0.5)
    }
    else
    {
        this.ghostCard.setTexture(card)
        this.ghostCard.setPosition(px,py)
        this.ghostCard.setVisible(true)
    }

    this.ghostCard.setRotation(
        this.currentRotation * Math.PI/2
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

}