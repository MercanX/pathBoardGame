/**
 * File: src/ui/HandView.ts
 * File Name: HandView.ts
 * Purpose: Alt UI hand panelini 5 sabit slot (cell) mantığıyla render eder.
 * Usage:
 * - Tüm UI objeleri uiLayer içine eklenir
 * - Alt panel içinde her zaman 5 adet slot görünür
 * - Oyuncunun elindeki kartlar bu slotların içine yerleşir
 * Notes:
 * - Bu sürüm adım adım ilerlemek için önce sabit 5 slot sistemi kurar
 * - Slotlar boşsa sadece çerçeve görünür
 * - Kartlar slot içine sığacak şekilde ölçeklenir
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
    selectedIndex = 0

    panel?: Phaser.GameObjects.Rectangle

    slotRects: Phaser.GameObjects.Rectangle[] = []
    cards: Phaser.GameObjects.Image[] = []

    validCards?: Set<string>

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

    clearCards()
    {
        for(const card of this.cards)
        {
            card.destroy()
        }

        this.cards = []
    }

    clearSlots()
    {
        for(const slot of this.slotRects)
        {
            slot.destroy()
        }

        this.slotRects = []
    }

render(validCards?: Set<string>)
{

    this.validCards = validCards
    const state = this.gameEngine.getState()
    if(!state) return

    const player = state.players[state.currentPlayer]
    const handCount = player.hand.length

    for(const c of this.cards) c.destroy()
    for(const s of this.slotRects) s.destroy()

    this.cards = []
    this.slotRects = []

    if(!this.panel)
    {
        this.panel = this.scene.add.rectangle(
            this.areaX + (this.areaWidth / 2),
            this.areaY + (this.areaHeight / 2),
            this.areaWidth,
            this.areaHeight
        )

        this.panel.setVisible(false)
        this.panel.setStrokeStyle(2, 0x2a2a2a)
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

    const slotCount = 5
    const sideMargin = 25
    const gap = 20

    const usableWidth = this.areaWidth - sideMargin * 2
    const slotWidth = (usableWidth - gap * (slotCount - 1)) / slotCount
    const slotHeight = this.areaHeight - sideMargin * 2

    const centerY = this.areaY + this.areaHeight / 2

    for(let i = 0; i < slotCount; i++)
    {
        const x =
            this.areaX +
            sideMargin +
            slotWidth / 2 +
            i * (slotWidth + gap)

        const slot = this.scene.add.rectangle(
            x,
            centerY,
            slotWidth,
            slotHeight,
            0x0b1220, // slot içi dolu
            0
        )

        slot.setStrokeStyle(2, 0x3a4654)

        this.parentContainer.add(slot)
        this.slotRects.push(slot)
    }

    if(handCount <= 0) return

    this.cardWidth = slotWidth - 14
    this.cardHeight = Math.floor(this.cardWidth * 1.35)

    const maxHeight = slotHeight - 14

    if(this.cardHeight > maxHeight)
    {
        this.cardHeight = maxHeight
        this.cardWidth = Math.floor(this.cardHeight / 1.35)
    }
    
player.hand.forEach((cardId, index) => {

    if(index >= slotCount) return

    const slot = this.slotRects[index]

    const card = this.scene.add.image(
        slot.x,
        slot.y,
        cardId
    )

    card.setOrigin(0.5)

    // Kartı slot içine sığdır
    card.setDisplaySize(
        slot.width - 20,
        slot.height - 20
    )

    card.setInteractive({ useHandCursor: true })
    card.setDepth(10)

    // VALID CARD CONTROL
    if(validCards && !validCards.has(cardId))
    {
        card.setAlpha(0.35)
    }
    else
    {
        card.setAlpha(1)
    }

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
    const state = this.gameEngine.getState()
    if(!state) return

    const player = state.players[state.currentPlayer]

    for(let i = 0; i < this.cards.length; i++)
    {
        const card = this.cards[i]
        const cardId = player.hand[i]

        const isValid =
            this.validCards ?
            this.validCards.has(cardId) :
            true

        if(i === this.selectedIndex)
        {
            if(isValid)
            {
                // VALID SELECTED
                card.setTint(0xfff1a8)
            }
            else
            {
                // INVALID SELECTED
                card.setTint(0xff4444)
            }

            card.setDepth(20)
        }
        else
        {
            card.clearTint()
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