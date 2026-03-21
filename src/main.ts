import Phaser from "phaser"

import BootScene from "./scenes/BootScene"
import MainMenuScene from "./scenes/MainMenuScene"
import MatchmakingScene from "./scenes/MatchmakingScene"
import GameScene from "./scenes/GameScene"

const config: Phaser.Types.Core.GameConfig = {

    type: Phaser.AUTO,

    parent: "game",

    backgroundColor: "#1d1d1d",

    scale:
    {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        width: 1080,
        height: 1920
    },

    scene:
    [
        BootScene,
        MainMenuScene,
        MatchmakingScene,
        GameScene
    ]

}

new Phaser.Game(config)