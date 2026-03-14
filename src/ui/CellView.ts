/**
 * File: src/ui/CellView.ts
 * File Name: CellView.ts
 * Purpose: Tek hücrenin board layer içindeki görsel temsilini yönetmek.
 * Usage:
 * - Rect ve kart sprite aynı parent container içine eklenir
 * - Card yoksa eski sprite temizlenir
 */

import Phaser from "phaser"

export default class CellView
{
    scene: Phaser.Scene
    parentContainer: Phaser.GameObjects.Container

    x: number
    y: number

    rect: Phaser.GameObjects.Rectangle
    cardSprite?: Phaser.GameObjects.Image

    px: number
    py: number
    size: number

    constructor(
        scene: Phaser.Scene,
        parentContainer: Phaser.GameObjects.Container,
        x: number,
        y: number,
        px: number,
        py: number,
        size: number
    )
    {
        this.scene = scene
        this.parentContainer = parentContainer
        this.x = x
        this.y = y
        this.px = px
        this.py = py
        this.size = size

        this.rect = this.scene.add.rectangle(
            px,
            py,
            size,
            size
        )

        this.rect.setOrigin(0)
        this.rect.setStrokeStyle(1, 0xffffff, 0.35)
        this.rect.setFillStyle(0x0f1720, 0.12)

        this.parentContainer.add(this.rect)
    }

    setCard(cardId: string | null, rotation: number)
    {
        if(this.cardSprite)
        {
            this.cardSprite.destroy()
            this.cardSprite = undefined
        }

        if(!cardId)
        {
            return
        }

        this.cardSprite = this.scene.add.image(
            this.px + (this.size / 2),
            this.py + (this.size / 2),
            cardId
        )

        this.cardSprite.setDisplaySize(
            this.size - 0,
            this.size - 0
        )

        this.cardSprite.setRotation(rotation * Math.PI / 2)
        this.parentContainer.add(this.cardSprite)
    }
}