/**
 * File: src/controllers/BotController.ts
 * File Name: BotController.ts
 * Purpose: Bot oyuncunun hamle akışını yönetir.
 * Usage:
 * - GameScene içinden çağrılır
 * - Bot düşünme gecikmesi
 * - Bot ghost kart animasyonu
 * - Bot hamlesini oynatma
 * Notes:
 * - GameScene içindeki checkBotTurn fonksiyonu birebir buraya taşınmıştır
 */

import Phaser from "phaser"

import GameEngine from "../core/GameEngine"
import { GameConfig } from "../config/GameConfig"
import { findCurrentPlayerNextCell } from "../core/PathEngine"
import { getValidMovesForPlayer } from "../core/RuleEngine"

import BoardView from "../ui/BoardView"
import HandView from "../ui/HandView"

export default class BotController
{
    scene: Phaser.Scene
    gameEngine: GameEngine

    constructor(
        scene: Phaser.Scene,
        gameEngine: GameEngine
    )
    {
        this.scene = scene
        this.gameEngine = gameEngine
    }

    checkBotTurn(
        boardLayer: Phaser.GameObjects.Container,
        uiLayer: Phaser.GameObjects.Container,
        boardView: BoardView,
        handView: HandView,
        cellSize: number,
        getCellCenter:(x:number,y:number)=>{x:number,y:number},
        focusBoardCell:(x:number,y:number,animate?:boolean)=>void
    )
    {
        const state = this.gameEngine.getState()
        if(!state) return

        const nextPlayer = state.players[state.currentPlayer]

        if(!nextPlayer.isBot) return

        const botThinkingText = this.scene.add.text(
            this.scene.scale.width / 2,
            120,
            "Player THINKING...",
            {
                fontSize: "22px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        )

        botThinkingText.setOrigin(0.5)
        botThinkingText.setDepth(500)
        uiLayer.add(botThinkingText)

        const thinkDelay =
            Phaser.Math.Between(
                GameConfig.BOT_THINK_MIN,
                GameConfig.BOT_THINK_MAX
            )

        setTimeout(() => {

            const botMove = this.gameEngine.runBotTurn()

            if(!botMove) return

            const center = getCellCenter(botMove.x, botMove.y)

            const botGhost = this.scene.add.image(
                center.x,
                center.y,
                botMove.cardId
            )

            botGhost.setDisplaySize(
                cellSize - 4,
                cellSize - 4
            )

            botGhost.setRotation(botMove.rotation * Math.PI / 2)
            botGhost.setAlpha(0.6)
            botGhost.setTint(0x88ccff)
            botGhost.setDepth(210)

            boardLayer.add(botGhost)

            setTimeout(() => {

                botGhost.destroy()
                botThinkingText.destroy()

                this.gameEngine.playCard(
                    botMove.cardId,
                    botMove.x,
                    botMove.y,
                    botMove.rotation
                )

                const newState = this.gameEngine.getState()

                if(newState)
                {
                    const nextCell = findCurrentPlayerNextCell(
                        newState,
                        newState.players[newState.currentPlayer].id
                    )

                    const nextCellForRender = nextCell
                        ? { x: nextCell.x, y: nextCell.y }
                        : undefined

                    boardView.render(nextCellForRender)

                    const validMoves = getValidMovesForPlayer(
                        newState,
                        newState.currentPlayer
                    )

                    const validCardIds = new Set(
                        validMoves.map(v => v.cardId)
                    )

                    handView.render(validCardIds)

                    const focus = findCurrentPlayerNextCell(
                        newState,
                        newState.players[newState.currentPlayer].id
                    )

                    if(focus)
                    {
                        setTimeout(() => {

                            focusBoardCell(focus.x, focus.y, true)

                        }, GameConfig.BOT_AFTER_MOVE_DELAY)
                    }
                }

            }, GameConfig.BOT_GHOST_DELAY)

        }, thinkDelay)
    }
}