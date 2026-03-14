/**
 * File: src/scenes/GameScene.ts
 * Purpose: Phaser sahnesi + GameEngine + BoardView bağlantısı
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { PlayerState } from "../core/GameState"
import { tracePlayerPath } from "../core/PathEngine"

import BoardView from "../ui/BoardView"

export default class GameScene extends Phaser.Scene
{
    gameEngine!:GameEngine
    boardView!:BoardView

    boardSize = 8
    cellSize = 64

    startX = 100
    startY = 50

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

        try
        {
            this.gameEngine.playCard(
                card,
                x,
                y,
                0
            )

            this.boardView.render()

            const result = tracePlayerPath(
                state,
                player.id
            )

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

}