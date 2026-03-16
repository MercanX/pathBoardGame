/**
 * File: src/controllers/GhostController.ts
 * File Name: GhostController.ts
 * Purpose: Board üzerindeki ghost card, highlight ve path preview render işlemlerini yönetir.
 * Usage:
 * - GameScene içindeki ghost render logic buraya taşınacaktır
 * - Şimdilik sadece controller iskeleti oluşturulur
 * Notes:
 * - Bu adım mevcut sistemi bozmadan refactor hazırlığı yapar
 */

import Phaser from "phaser"
import GameScene from "../scenes/GameScene"
import { findCurrentPlayerNextCell } from "../core/PathEngine"
import { getValidMovesForPlayer } from "../core/RuleEngine"

export default class GhostController
{
    scene: GameScene

    constructor(
        scene: GameScene
    )
    {
        this.scene = scene
    }


updateGhostForSelectedCard()
{
    const state = this.scene.gameEngine.getState()
    if(!state) return

    const selectedCard = this.scene.handView.getSelectedCard()
    if(!selectedCard) return

    const player = state.players[state.currentPlayer]

    const nextCell = findCurrentPlayerNextCell(
        state,
        player.id
    )

    if(!nextCell) return

    const center = this.scene.getCellCenter(nextCell.x, nextCell.y)

    if(!this.scene.ghostCard)
    {
        this.scene.ghostCard = this.scene.add.image(
            center.x,
            center.y,
            selectedCard
        )

        this.scene.ghostCard.setDisplaySize(
            this.scene.cellSize - 4,
            this.scene.cellSize - 4
        )

        this.scene.ghostCard.setDepth(200)

        this.scene.boardLayer.add(this.scene.ghostCard)
    }
    else
    {
        this.scene.ghostCard.setTexture(selectedCard)
        this.scene.ghostCard.setPosition(center.x, center.y)
        this.scene.ghostCard.setVisible(true)
    }

    this.scene.ghostCard.setRotation(
        this.scene.currentRotation * Math.PI / 2
    )

    if(!this.scene.highlightCell)
    {
        this.scene.highlightCell = this.scene.add.rectangle(
            center.x,
            center.y,
            this.scene.cellSize - 6,
            this.scene.cellSize - 6
        )

        this.scene.highlightCell.setDepth(150)
        this.scene.boardLayer.add(this.scene.highlightCell)
    }

    this.scene.highlightCell.setPosition(center.x, center.y)
    this.scene.highlightCell.setVisible(true)

    const validMoves = getValidMovesForPlayer(
        state,
        state.currentPlayer
    )

    const isAllowedCard = validMoves.some(v =>
        v.cardId === selectedCard &&
        v.rotation === this.scene.currentRotation
    )

    if(isAllowedCard)
    {
        this.scene.highlightCell.setStrokeStyle(20, 0x22c55e, 0.5)
        this.scene.highlightCell.setFillStyle(0x22c55e, 0.5)
        this.scene.ghostCard.setAlpha(1)
    }
    else
    {
        this.scene.highlightCell.setStrokeStyle(20, 0xef4444, 0.5)
        this.scene.highlightCell.setFillStyle(0xef4444, 0.5)
        this.scene.ghostCard.setAlpha(0.5)
    }

    if(this.scene.pathPreview)
    {
        this.scene.clearGhostObjects()
    }

    if(
        state.board.board[nextCell.y][nextCell.x].cardId === null
    )
    {
        this.scene.boardView.renderGhostPath(
            selectedCard,
            this.scene.currentRotation,
            nextCell.x,
            nextCell.y
        )
    }
}


}