/**
 * File: src/ui/CellView.ts
 * Purpose: Board üzerindeki tek hücrenin görsel temsilini yönetir
 */

import Phaser from "phaser"

export default class CellView
{
    scene:Phaser.Scene
    x:number
    y:number

    rect:Phaser.GameObjects.Rectangle
    cardText?:Phaser.GameObjects.Text

    constructor(
        scene:Phaser.Scene,
        x:number,
        y:number,
        px:number,
        py:number,
        size:number
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
        this.rect.setStrokeStyle(2,0xffffff)
    }

    cardSprite?:Phaser.GameObjects.Image

setCard(cardId:string, rotation:number)
{
    if(this.cardSprite)
        this.cardSprite.destroy()

    this.cardSprite = this.scene.add.image(
        this.rect.x + this.rect.width/2,
        this.rect.y + this.rect.height/2,
        cardId
    )

    this.cardSprite.setDisplaySize(
        this.rect.width - 4,
        this.rect.height - 4
    )

    // ROTATION EKLE
    this.cardSprite.setRotation(rotation * Math.PI/2)
}
}