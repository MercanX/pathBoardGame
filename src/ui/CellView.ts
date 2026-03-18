/**
 * File: src/ui/CellView.ts
 * File Name: CellView.ts
 * Purpose: Tek hücrenin board layer içindeki görsel temsilini yönetmek.
 * Usage:
 * - Rect ve kart sprite aynı parent container içine eklenir
 * - Card yoksa eski sprite temizlenir
 */

import Phaser from "phaser"
import { Port } from "../data/CardData"
import { rotatePort } from "../core/CardEngine"
import { GameConfig } from "../config/GameConfig"

export default class CellView
{
    scene: Phaser.Scene
    parentContainer: Phaser.GameObjects.Container

    overlays: Phaser.GameObjects.Image[] = []

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

    clearOverlays()
    {
        for(const overlay of this.overlays)
        {
            overlay.destroy()
        }

        this.overlays = []
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
            this.clearOverlays()
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

getPathOverlayKey(
    cardId: string,
    a: number,
    b: number,
    rotation: number
)
{
    const reverseRotation = (4 - rotation) % 4

    const baseA = rotatePort(a as Port, reverseRotation)
    const baseB = rotatePort(b as Port, reverseRotation)

    const min = Math.min(baseA, baseB)
    const max = Math.max(baseA, baseB)

    return `${cardId}_path_${min}_${max}`
}

setPathOverlay(
    cardId: string,
    a: number,
    b: number,
    rotation: number,
    color: number
)
{
    const key = this.getPathOverlayKey(cardId, a, b, rotation)
    if(GameConfig.DEBUG)
    {
        console.log("OVERLAY DEBUG", {
            cardId,
            entryExit: `${a}-${b}`,
            rotation,
            key
        })
    }

    const overlay = this.scene.add.image(
        this.px + this.size / 2,
        this.py + this.size / 2,
        key
    )

    overlay.setDisplaySize(this.size, this.size)
    overlay.setDepth(10)

    // önemli: sprite base key ile geliyor, burada döndürüyoruz
    overlay.setRotation(rotation * Math.PI / 2)

    this.parentContainer.add(overlay)

    overlay.setTint(color)

    this.scene.tweens.add({
        targets: overlay,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
    })

    this.overlays.push(overlay)
}
}