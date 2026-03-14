/**
 * File: GameScene.ts
 * Purpose: Board render + hücre tıklama + kart koyma
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { PlayerState } from "../core/GameState"

export default class GameScene extends Phaser.Scene
{
    gameEngine!:GameEngine

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
        this.drawBoard()

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

    drawBoard()
    {
        for(let y=0;y<this.boardSize;y++)
        {
            for(let x=0;x<this.boardSize;x++)
            {
                const rect = this.add.rectangle(
                    this.startX + x*this.cellSize,
                    this.startY + y*this.cellSize,
                    this.cellSize,
                    this.cellSize
                )

                rect.setOrigin(0)
                rect.setStrokeStyle(2,0xffffff)
            }
        }
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
            
            this.renderCards()

            console.log("Card placed",x,y)

        }
        catch(e)
        {
            console.log("Invalid move")
        }
    }

    renderCards()
    {
        const state = this.gameEngine.getState()

        if(!state) return

        const board = state.board.board

        for(let y=0;y<this.boardSize;y++)
        {
            for(let x=0;x<this.boardSize;x++)
            {
                const cell = board[y][x]

                if(cell.cardId)
                {
                    this.add.text(
                        this.startX + x*this.cellSize + 20,
                        this.startY + y*this.cellSize + 20,
                        cell.cardId,
                        {fontSize:"14px",color:"#00ff00"}
                    )
                }
            }
        }
    }


}