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
            const container = this.scene.add.container(center.x, center.y)

            // 🔥 ZEMİN
            const bg = this.scene.add.image(0, 0, "cardbg_04")
            bg.setDisplaySize(
                this.scene.cellSize - 4,
                this.scene.cellSize - 4
            )

            // 🔥 CARD
            const card = this.scene.add.image(0, 0, selectedCard)
            card.setDisplaySize(
                this.scene.cellSize - 4,
                this.scene.cellSize - 4
            )

            container.add(bg)
            container.add(card)

            container.setDepth(200)

            this.scene.boardLayer.add(container)

            // 🔥 ghostCard artık container
            this.scene.ghostCard = container as any

            // 🔥 gerçek card referansı (önemli)
            ;(this.scene.ghostCard as any).card = card
        }
        else
        {
            const container = this.scene.ghostCard as any

            container.setPosition(center.x, center.y)
            container.setVisible(true)

            // 🔥 içindeki card texture değiştir
            container.card.setTexture(selectedCard)
        }

        (this.scene.ghostCard as any).setRotation(
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

            // ======================
            // 🔥 BURAYA EKLE
            // ======================
            if(!this.scene.highlightCell.getData("pulse"))
            {
                this.scene.highlightCell.setData("pulse", true)

                this.scene.tweens.add({
                    targets: this.scene.highlightCell,
                    alpha: { from: 1, to: 0.4 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut"
                })
            }
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
            this.scene.highlightCell.setStrokeStyle(4, 0x22c55e, 1)
            this.scene.highlightCell.setFillStyle(0x000000, 0)
            this.scene.highlightCell.setBlendMode(Phaser.BlendModes.ADD);

            (this.scene.ghostCard as any).setAlpha(1)
        }
        else
        {
            this.scene.highlightCell.setStrokeStyle(4, 0xef4444, 1)
            this.scene.highlightCell.setFillStyle(0x000000, 0)
            this.scene.highlightCell.setBlendMode(Phaser.BlendModes.ADD);

            (this.scene.ghostCard as any).setAlpha(0.5)
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