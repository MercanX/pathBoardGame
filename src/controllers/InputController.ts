/**
 * File: src/controllers/InputController.ts
 * File Name: InputController.ts
 * Purpose: Oyun input sistemini yönetir.
 * Usage:
 * - Mouse hareketleri
 * - Kart yerleştirme
 * - Board hover işlemleri
 * Notes:
 * - GameScene içindeki input logic buraya taşınmaktadır
 */

import Phaser from "phaser"

export default class InputController
{
    scene: Phaser.Scene

    constructor(scene: Phaser.Scene)
    {
        this.scene = scene
    }

    setupInput(
        handleClick:(pointer:Phaser.Input.Pointer)=>void,
        toggleMapMode:()=>void,
        getCurrentRotation:()=>number,
        setRotation:(rotation:number)=>void,
        getGhostCard:()=>Phaser.GameObjects.Image | undefined
    )
    {
        this.scene.input.keyboard?.on("keydown-R", () => {

            const newRotation = (getCurrentRotation() + 1) % 4
            setRotation(newRotation)

            const ghost = getGhostCard()

            if(ghost)
            {
                ghost.setRotation(newRotation * Math.PI / 2)
            }
        })

        this.scene.input.keyboard?.on("keydown-M", () => {
            toggleMapMode()
        })

        //this.scene.input.on("pointermove", this.handleMove, this)

        this.scene.input.on(
            "pointerdown",
            handleClick,
            this.scene
        )
    }
}