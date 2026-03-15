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

    overlay?: Phaser.GameObjects.Image

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
        this.rect.setStrokeStyle(0, 0xffffff, 0.35)
        this.rect.setFillStyle(0x0f1720, 0.12)
        //this.rect.setVisible(false)

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

getPathOverlayKey(cardId: string, a: number, b: number)
{
    const min = Math.min(a,b)
    const max = Math.max(a,b)

    return `${cardId}_path_${min}_${max}`
}

setPathOverlay(cardId: string, a: number, b: number)
{
    const key = this.getPathOverlayKey(cardId, a, b)

    if(this.overlay)
    {
        this.overlay.destroy()
        this.overlay = undefined
    }

    this.overlay = this.scene.add.image(
        this.px + this.size / 2,
        this.py + this.size / 2,
        key
    )

    this.overlay.setDisplaySize(this.size, this.size)

    this.overlay.setDepth(10)

    this.overlay.setRotation(this.cardSprite?.rotation || 0)

    this.parentContainer.add(this.overlay)

    // debug glow
    this.overlay.setTint(0xff0000)

    this.scene.tweens.add({
        targets: this.overlay,
        alpha: 0.4,
        duration: 400,
        yoyo: true,
        repeat: -1
    })
}
}