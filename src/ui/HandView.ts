/**
 * File: src/ui/HandView.ts
 * File Name: HandView.ts
 * Purpose: Alt UI hand panelini ve seçilebilir kartları ui layer içinde render etmek.
 * Usage:
 * - Tüm UI objeleri uiLayer içine eklenir
 * - boardCamera bu container'ı tamamen ignore eder
 */

import Phaser from "phaser"
import GameEngine from "../core/GameEngine"

export default class HandView
{
    scene: Phaser.Scene
    parentContainer: Phaser.GameObjects.Container
    gameEngine: GameEngine

    areaX: number
    areaY: number
    areaWidth: number
    areaHeight: number

    cardWidth = 80
    cardHeight = 110
    spacing = 12
    selectedIndex = 0

    panel?: Phaser.GameObjects.Rectangle
    cards: Phaser.GameObjects.Image[] = []

    constructor(
        scene: Phaser.Scene,
        parentContainer: Phaser.GameObjects.Container,
        gameEngine: GameEngine,
        areaX: number,
        areaY: number,
        areaWidth: number,
        areaHeight: number
    )
    {
        this.scene = scene
        this.parentContainer = parentContainer
        this.gameEngine = gameEngine
        this.areaX = areaX
        this.areaY = areaY
        this.areaWidth = areaWidth
        this.areaHeight = areaHeight
    }

    render()
    {
        const state = this.gameEngine.getState()
        if(!state) return

        const player = state.players[state.currentPlayer]
        const handCount = player.hand.length

        for(const c of this.cards)
        {
            c.destroy()
        }

        this.cards = []

        if(!this.panel)
        {
            this.panel = this.scene.add.rectangle(
                this.areaX + (this.areaWidth / 2),
                this.areaY + (this.areaHeight / 2),
                this.areaWidth,
                this.areaHeight,
                0x111111,
                0.95
            )

            this.panel.setStrokeStyle(2, 0x2a2a2a)
            this.panel.setOrigin(0.5, 0.5)
            this.parentContainer.add(this.panel)
        }
        else
        {
            this.panel.setPosition(
                this.areaX + (this.areaWidth / 2),
                this.areaY + (this.areaHeight / 2)
            )

            this.panel.setSize(this.areaWidth, this.areaHeight)
        }

        if(handCount <= 0)
        {
            return
        }

        const innerPadding = 24
        const availableWidth = this.areaWidth - (innerPadding * 2)

        this.spacing = 12
        this.cardWidth = Math.floor(
            (availableWidth - (this.spacing * (handCount - 1))) / handCount
        )

        if(this.cardWidth > 120) this.cardWidth = 120
        if(this.cardWidth < 60) this.cardWidth = 60

        this.cardHeight = Math.floor(this.cardWidth * 1.35)

        const maxHeight = this.areaHeight - 36
        if(this.cardHeight > maxHeight)
        {
            this.cardHeight = maxHeight
            this.cardWidth = Math.floor(this.cardHeight / 1.35)
        }

        const totalWidth =
            (handCount * this.cardWidth) +
            ((handCount - 1) * this.spacing)

        const startCardX =
            this.areaX +
            ((this.areaWidth - totalWidth) / 2)

        const baseY = this.areaY + (this.areaHeight / 2)

        player.hand.forEach((cardId, index) => {

            const x =
                startCardX +
                (index * (this.cardWidth + this.spacing)) +
                (this.cardWidth / 2)

            const card = this.scene.add.image(x, baseY, cardId)

            card.setOrigin(0.5, 0.5)
            card.setDisplaySize(this.cardWidth, this.cardHeight)
            card.setInteractive({ useHandCursor: true })
            card.setDepth(10)

            card.on("pointerdown", () => {
                this.selectedIndex = index
                this.highlight()
            })

            this.parentContainer.add(card)
            this.cards.push(card)
        })

        if(this.selectedIndex >= player.hand.length)
        {
            this.selectedIndex = Math.max(0, player.hand.length - 1)
        }

        this.highlight()
    }

    highlight()
    {
        const centerY = this.areaY + (this.areaHeight / 2)

        for(let i = 0; i < this.cards.length; i++)
        {
            const card = this.cards[i]

            if(i === this.selectedIndex)
            {
                card.setScale(1.08)
                card.setTint(0xfff1a8)
                card.setY(centerY - 10)
                card.setDepth(20)
            }
            else
            {
                card.setScale(1)
                card.clearTint()
                card.setY(centerY)
                card.setDepth(10)
            }
        }
    }

    getSelectedCard(): string | null
    {
        const state = this.gameEngine.getState()
        if(!state) return null

        const player = state.players[state.currentPlayer]
        return player.hand[this.selectedIndex] || null
    }
}