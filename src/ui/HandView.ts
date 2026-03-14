/**
 * File: src/ui/HandView.ts
 * Purpose: Oyuncunun elindeki kartları alt UI panelinde ortalı şekilde gösterir ve seçim yapmayı sağlar
 */

import Phaser from "phaser"
import GameEngine from "../core/GameEngine"

export default class HandView
{
    scene: Phaser.Scene
    gameEngine: GameEngine

    areaX: number
    areaY: number
    areaWidth: number
    areaHeight: number

    cardWidth: number = 80
    cardHeight: number = 110
    spacing: number = 12

    selectedIndex: number = 0

    panel?: Phaser.GameObjects.Rectangle
    cards: Phaser.GameObjects.Image[] = []

    constructor(
        scene: Phaser.Scene,
        gameEngine: GameEngine,
        areaX: number,
        areaY: number,
        areaWidth: number,
        areaHeight: number
    )
    {
        this.scene = scene
        this.gameEngine = gameEngine

        this.areaX = areaX
        this.areaY = areaY
        this.areaWidth = areaWidth
        this.areaHeight = areaHeight

        this.render()
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

        if(handCount <= 0)
        {
            return
        }

        // Panel oluştur / güncelle
        if(!this.panel)
        {
            this.panel = this.scene.add.rectangle(
                this.areaX + this.areaWidth / 2,
                this.areaY + this.areaHeight / 2,
                this.areaWidth,
                this.areaHeight,
                0x111111,
                0.95
            )

            this.panel.setStrokeStyle(2, 0x2a2a2a)
            this.panel.setOrigin(0.5, 0.5)
        }
        else
        {
            this.panel.setPosition(
                this.areaX + this.areaWidth / 2,
                this.areaY + this.areaHeight / 2
            )

            this.panel.setSize(this.areaWidth, this.areaHeight)
        }

        // Kullanılabilir genişlik
        const innerPadding = 24
        const availableWidth = this.areaWidth - (innerPadding * 2)

        // 5 karta göre otomatik boyut
        this.spacing = 12
        this.cardWidth = Math.floor((availableWidth - (this.spacing * (handCount - 1))) / handCount)

        // Min / max sınır
        if(this.cardWidth > 120) this.cardWidth = 120
        if(this.cardWidth < 60) this.cardWidth = 60

        this.cardHeight = Math.floor(this.cardWidth * 1.35)

        // Kartlar alt panele sığsın
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
            (this.areaWidth - totalWidth) / 2

        const baseY =
            this.areaY +
            (this.areaHeight / 2)

        player.hand.forEach((cardId, index) => {

            const x =
                startCardX +
                (index * (this.cardWidth + this.spacing)) +
                (this.cardWidth / 2)

            const y = baseY

            const card = this.scene.add.image(x, y, cardId)

            card.setOrigin(0.5, 0.5)
            card.setDisplaySize(this.cardWidth, this.cardHeight)
            card.setInteractive({ useHandCursor: true })

            card.on("pointerdown", () => {
                this.selectedIndex = index
                this.highlight()
            })

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
        for(let i = 0; i < this.cards.length; i++)
        {
            const card = this.cards[i]

            if(i === this.selectedIndex)
            {
                card.setScale(1.08)
                card.setTint(0xfff1a8)
                card.setY((this.areaY + this.areaHeight / 2) - 10)
                card.setDepth(20)
            }
            else
            {
                card.setScale(1)
                card.clearTint()
                card.setY(this.areaY + this.areaHeight / 2)
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

getAllObjects(): Phaser.GameObjects.GameObject[]
{
    const objects: Phaser.GameObjects.GameObject[] = []

    if(this.panel)
    {
        objects.push(this.panel)
    }

    for(const card of this.cards)
    {
        objects.push(card)
    }

    return objects
}
}