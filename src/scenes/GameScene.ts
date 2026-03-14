/**
 * File: GameScene.ts
 * Purpose: Oyun sahnesi
 */

import Phaser from "phaser"

export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super("GameScene")
    }

    create()
    {
        const text = this.add.text(
            400,
            300,
            "GAME STARTED",
            { fontSize: "32px", color: "#ffffff" }
        )

        text.setOrigin(0.5)
    }
}