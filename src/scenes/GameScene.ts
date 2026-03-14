/**
 * File: GameScene.ts
 * Purpose: Oyun sahnesi + ilk board grid render
 */

import Phaser from "phaser"

export default class GameScene extends Phaser.Scene
{
    boardSize = 8
    cellSize = 64

    constructor()
    {
        super("GameScene")
    }

    create()
    {
        this.drawBoard()
    }

    drawBoard()
    {
        const startX = 100
        const startY = 50

        for(let y = 0; y < this.boardSize; y++)
        {
            for(let x = 0; x < this.boardSize; x++)
            {
                const rect = this.add.rectangle(
                    startX + x * this.cellSize,
                    startY + y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                )

                rect.setStrokeStyle(2, 0xffffff)
                rect.setOrigin(0)
            }
        }
    }
}