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

    setCard(cardId:string)
    {
        if(this.cardText)
            this.cardText.destroy()

        this.cardText = this.scene.add.text(
            this.rect.x + 10,
            this.rect.y + 10,
            cardId,
            {
                fontSize:"14px",
                color:"#00ff00"
            }
        )
    }
}