/**
 * File: src/scenes/ShopScene.ts
 * Purpose:
 * - Shop UI (avatar + path satın alma)
 */

import Phaser from "phaser"
import { ShopData } from "../data/ShopData"
import { PlayerService } from "../core/PlayerService"
import { SoundService } from "../core/SoundService"

export default class ShopScene extends Phaser.Scene
{
    constructor()
    {
        super("ShopScene")
    }

    create()
    {
        const { width, height } = this.scale

        const player = PlayerService.get()

        let selectedItem: any = null

        const itemUIs: {
            id: string
            type: string
            priceText: Phaser.GameObjects.Text
        }[] = []


        // ======================
        // BACKGROUND
        // ======================
        this.add.image(width/2, height/2, "menu_bg")
            .setDisplaySize(width, height)

        // ======================
        // TITLE
        // ======================
        this.add.text(width/2, 100, "SHOP", {
            fontFamily: "Cinzel",
            fontSize: "64px",
            color: "#ffffff"
        }).setOrigin(0.5)

        // ======================
        // GOLD DISPLAY
        // ======================
        const goldText = this.add.text(width - 100, 80, `${player.gold}`, {
            fontFamily: "Orbitron",
            fontSize: "40px",
            color: "#FFD700"
        }).setOrigin(1, 0.5)

        // ======================
        // GRID
        // ======================
        const cols = 3
        const size = 120
        const gap = 40

        const startX = width/2 - ((cols * size + (cols - 1) * gap) / 2)
        const startY = 200

        const borders: Phaser.GameObjects.Rectangle[] = []

        ShopData.forEach((item, index) => {

            const col = index % cols
            const row = Math.floor(index / cols)

            const x = startX + col * (size + gap)
            const y = startY + row * (size + gap)




            // BORDER (her item için)
            const border = this.add.rectangle(x, y, size + 10, size + 10)
                .setStrokeStyle(4, 0x00ffcc)
                .setAlpha(0)

            borders.push(border)

            // ITEM IMAGE
            const img = this.add.image(x, y, item.asset)
                .setDisplaySize(size, size)
                .setInteractive()

            // OWNED?
            const owned = PlayerService.hasItem(item.id)

            if(!owned)
            {
                img.setTint(0x777777)
            }

            // PRICE TEXT
            const priceText = this.add.text(
                x,
                y + 80,
                owned ? "OWNED" : `${item.price}G`,
                {
                    fontFamily: "Orbitron",
                    fontSize: "24px",
                    color: owned ? "#00ff99" : "#ffffff"
                }
            ).setOrigin(0.5)

            itemUIs.push({
                id: item.id,
                type: item.type,
                priceText
            })


            // EQUIPPED STATE
            if(
                (item.type === "path" && item.id === player.equippedPath) ||
                (item.type === "board" && item.id === player.equippedBackground)
            )
            {
                priceText.setText("EQUIPPED")
                priceText.setColor("#00ffcc")
                border.setAlpha(1)
            }

            // CLICK
            img.on("pointerdown", () => {

                SoundService.play("click")

                // CLICK ANIM
                this.tweens.add({
                    targets: img,
                    scale: 0.9,
                    duration: 80,
                    yoyo: true
                })

                // reset borders
                borders.forEach(b => b.setAlpha(0))

  
                // OWNED → direkt equip
                if(PlayerService.hasItem(item.id))
                {
                    if(item.type === "path")
                        PlayerService.equipPath(item.id)

                    if(item.type === "board")
                        PlayerService.equipBackground(item.id)

                    refreshUI()

                    borders.forEach(b => b.setAlpha(0))
                    border.setAlpha(1)

                    return
                }
                selectedItem = item

                // border reset
                borders.forEach(b => b.setAlpha(0))
                border.setAlpha(1)

                buyBtn.setAlpha(1)

            })
        })


        const refreshUI = () => {

            const player = PlayerService.get()

            itemUIs.forEach(ui => {

                if(!PlayerService.hasItem(ui.id))
                {
                    const item = ShopData.find(i => i.id === ui.id)
                    ui.priceText.setText(`${item?.price}G`)
                    ui.priceText.setColor("#ffffff")
                    return
                }

                // sahip ama seçili mi?
                if(
                    (ui.type === "path" && ui.id === player.equippedPath) ||
                    (ui.type === "background" && ui.id === player.equippedBackground)
                )
                {
                    ui.priceText.setText("EQUIPPED")
                    ui.priceText.setColor("#00ffcc")
                }
                else
                {
                    ui.priceText.setText("OWNED")
                    ui.priceText.setColor("#00ff99")
                }

            })
        }


        // ======================
        // BACK BUTTON
        // ======================
        const back = this.add.image(100, height - 100, "btn_back")
            .setScale(0.5)
            .setInteractive()

        back.on("pointerdown", () => {
            SoundService.play("click")
            this.scene.start("MainMenuScene")
        })


        const buyBtn = this.add.text(width/2, height - 150, "BUY", {
            fontFamily: "Cinzel",
            fontSize: "40px",
            color: "#ffffff",
            backgroundColor: "#222"
        })
        .setOrigin(0.5)
        .setPadding(20)
        .setInteractive()

        buyBtn.setAlpha(0.5)

        buyBtn.on("pointerdown", () => {

            if(!selectedItem) return

            SoundService.play("click")

            // zaten sahipse → equip
            if(PlayerService.hasItem(selectedItem.id))
            {
                if(selectedItem.type === "path")
                    PlayerService.equipPath(selectedItem.id)

                if(selectedItem.type === "background")
                    PlayerService.equipBackground(selectedItem.id)

                refreshUI()

                return
            }

            // satın al
            const success = PlayerService.buyItem(selectedItem)

            if(success)
            {
                goldText.setText(`${PlayerService.get().gold}`)
                refreshUI() 
            }
            else
            {
                this.tweens.add({
                    targets: goldText,
                    scale: 1.2,
                    duration: 100,
                    yoyo: true
                })
            }
        })


        const resetBtn = this.add.text(width/2, height - 80, "RESET", {
            fontFamily: "Cinzel",
            fontSize: "28px",
            color: "#ff4444",
            backgroundColor: "#220000"
        })
        .setOrigin(0.5)
        .setPadding(15)
        .setInteractive()

        resetBtn.on("pointerdown", () => {

            SoundService.play("click")

            PlayerService.resetProgress()

            // UI refresh
            this.scene.restart()
        })

    }
}