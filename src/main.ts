import Phaser from "phaser"

import BootScene from "./scenes/BootScene"
import MainMenuScene from "./scenes/MainMenuScene"
import GameScene from "./scenes/GameScene"

const config: Phaser.Types.Core.GameConfig = {

    type: Phaser.AUTO,

    width: 800,
    height: 600,

    parent: "game",

    backgroundColor: "#1d1d1d",

    scene: [
        BootScene,
        MainMenuScene,
        GameScene
    ]

}

new Phaser.Game(config)