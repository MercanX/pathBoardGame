import Phaser from "phaser"

import BootScene from "./scenes/BootScene"
import MainMenuScene from "./scenes/MainMenuScene"
import MatchmakingScene from "./scenes/MatchmakingScene"
import GameScene from "./scenes/GameScene"
import SettingsScene from "./scenes/SettingsScene"
import ShopScene from "./scenes/ShopScene"

// 🔥 BURAYA (config DIŞINA)
const baseW = 1080
const baseH = 1920

const deviceRatio = window.innerHeight / window.innerWidth
const baseRatio = baseH / baseW

let newW = baseW
let newH = baseH

if (deviceRatio > baseRatio) {
    newH = baseW * deviceRatio
} else {
    newW = baseH / deviceRatio
}

// 🔥 CONFIG
const config: Phaser.Types.Core.GameConfig = {

    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#1d1d1d",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        width: newW,
        height: newH
    },

    scene: [
        BootScene,
        MainMenuScene,
        MatchmakingScene,
        GameScene,
        ShopScene,
        SettingsScene
    ]
}

new Phaser.Game(config)