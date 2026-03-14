import Phaser from "phaser"

const config: Phaser.Types.Core.GameConfig = {

    type: Phaser.AUTO,

    width: 800,
    height: 600,

    parent: "game",

    backgroundColor: "#1d1d1d",

    scene: {
        create()
        {
            const text = this.add.text(
                400,
                300,
                "Path Board Game",
                {fontSize:"40px", color:"#ffffff"}
            )

            text.setOrigin(0.5)
        }
    }

}

new Phaser.Game(config)