/**
 * File: src/ui/CellView.ts
 * Purpose: Board üzerindeki tek hücrenin görsel temsilini yönetir
 */

import Phaser from "phaser"

export default class CellView
{
    scene: Phaser.Scene
    x: number
    y: number

    rect: Phaser.GameObjects.Rectangle
    cardSprite?: Phaser.GameObjects.Image

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        px: number,
        py: number,
        size: number
    )
    {
        this.scene = scene
        this.x = x
        this.y = y

        this.rect = scene.add.rectangle(
            px,
            py,
            size,
            size
        )

        this.rect.setOrigin(0)

        // İstersen tamamen kaldırabilirsin
        this.rect.setStrokeStyle(1, 0xffffff)
    }

    setCard(cardId: string, rotation: number)
    {
        if(this.cardSprite)
        {
            this.cardSprite.destroy()
        }

        this.cardSprite = this.scene.add.image(
            this.rect.x + this.rect.width / 2,
            this.rect.y + this.rect.height / 2,
            cardId
        )

        this.cardSprite.setDisplaySize(
            this.rect.width - 4,
            this.rect.height - 4
        )

        this.cardSprite.setRotation(rotation * Math.PI / 2)
    }

    getAllObjects(): Phaser.GameObjects.GameObject[]
    {
        const objects: Phaser.GameObjects.GameObject[] = [this.rect]

        if(this.cardSprite)
        {
            objects.push(this.cardSprite)
        }

        return objects
    }
}