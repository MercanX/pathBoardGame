/**
 * File: src/scenes/ShopScene.ts
 * Purpose:
 * - SettingsScene stiline yakın, panel tabanlı temiz shop UI
 * - Path ve Board item'larını ayrı başlıklarla gösterir
 * - Owned / Equipped / Buy state'lerini tek sahnede günceller
 */

import Phaser from "phaser"
import { ShopData } from "../data/ShopData"
import { PlayerService } from "../core/PlayerService"
import { SoundService } from "../core/SoundService"

type ShopRenderUI =
{
    id: string
    type: string
    img: Phaser.GameObjects.Image
    border: Phaser.GameObjects.Rectangle
    priceText: Phaser.GameObjects.Text
}

export default class ShopScene extends Phaser.Scene
{
    constructor()
    {
        super("ShopScene")
    }

    preload()
    {
        this.load.image("settings_bg", "assets/ui/settings_bg.png")
    }

    create()
    {
        const { width, height } = this.scale

        const player = PlayerService.get()

        let selectedItem: any = null

        const itemUIs: ShopRenderUI[] = []

        // =========================
        // BACKGROUND
        // =========================
        const bg = this.add.image(width / 2, height / 2, "menu_bg")
        bg.setDisplaySize(width, height)

        // =========================
        // PANEL (SettingsScene style)
        // =========================
        const panel = this.add.image(width / 2, height / 2, "settings_bg")
        panel.setScale(1)

        // =========================
        // HOME BUTTON (SettingsScene style)
        // =========================
        const homeBtn = this.add.image(
            width / 2,
            150,
            "btn_home"
        )
        .setScale(0.5)
        .setInteractive()

        this.addButtonEffects(homeBtn)

        homeBtn.on("pointerdown", () => {
            SoundService.play("click")
            this.scene.start("MainMenuScene")
        })



        // =========================
        // GOLD UI
        // =========================

        const goldText = this.add.text(width / 2, 300, `${player.gold}`, {
            fontFamily: "Orbitron",
            fontSize: "70px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5)

        // =========================
        // DATA
        // =========================
        //const pathItems = ShopData.filter(i => i.type === "path")
        const boardItems = ShopData.filter(i => i.type === "board")

        // =========================
        // GRID SETTINGS
        // =========================
        const cols = 4
        const size = 130
        const gap = 22

        const startX = width / 2 - ((cols * size + (cols - 1) * gap) / 2) + (size / 2)
        //const pathStartY = 450
        const boardStartY = height / 2 - 150

        // =========================
        // SECTION TITLES
        // =========================

        this.add.text(width / 2, boardStartY - 125, "BOARD", {
            fontFamily: "Orbitron",
            fontSize: "50px",
            color: "#ffaa00",
            fontStyle: "bold"

        }).setOrigin(0.5)

        const clearAllBorders = () => {
            itemUIs.forEach(ui => ui.border.setAlpha(0))
        }

        const refreshUI = () => {

            const currentPlayer = PlayerService.get()
            goldText.setText(`${currentPlayer.gold}`)

            itemUIs.forEach(ui => {

                const owned = PlayerService.hasItem(ui.id)

                // her tur başta sıfırla
                ui.border.setAlpha(0)

                if(!owned)
                {
                    const item = ShopData.find(i => i.id === ui.id)

                    ui.priceText.setText(`${item?.price ?? 0}G`)
                    ui.priceText.setColor("#ffffff")
                    ui.img.setTint(0x777777)

                    if(selectedItem && selectedItem.id === ui.id)
                    {
                        ui.border.setAlpha(1)
                    }

                    return
                }

                ui.img.clearTint()

                const isEquipped =
                    ui.type === "board" &&
                    ui.id === currentPlayer.equippedBoard

                if(isEquipped)
                {
                    ui.priceText.setText("EQUIPPED")
                    ui.priceText.setColor("#00ffcc")
                    ui.border.setAlpha(1)
                    return
                }

                ui.priceText.setText("OWNED")
                ui.priceText.setColor("#00ff99")
            })

        }

        const renderGroup = (
            items: any[],
            startY: number
        ) =>
        {
            items.forEach((item, index) => {

                const col = index % cols
                const row = Math.floor(index / cols)

                const x = startX + col * (size + gap)
                const y = startY + row * (size + 95)

                const img = this.add.image(x, y, item.asset)
                    .setDisplaySize(size, size)
                    .setInteractive()

                this.addButtonEffects(img)

                const border = this.add.rectangle(
                    x,
                    y,
                    size + 20,
                    size + 20
                )
                .setStrokeStyle(6, 0xf9f213)
                .setAlpha(0)



                const owned = PlayerService.hasItem(item.id)

                if(!owned)
                {
                    img.setTint(0x777777)
                }

                const titleText = this.add.text(x, y + size / 2 + 16, item.title, {
                    fontFamily: "Cinzel",
                    fontSize: "21px",
                    color: "#ffffff",
                    align: "center",
                    fontStyle: "bold",
                    wordWrap: { width: size + 30 }
                }).setOrigin(0.5, 0)

                const priceText = this.add.text(
                    x,
                    y + size / 2 + 50,
                    owned ? "OWNED" : `${item.price}G`,
                    {
                        fontFamily: "Orbitron",
                        fontSize: "22px",
                        fontStyle: "bold",
                        color: owned ? "#00ff99" : "#dd2222"
                    }
                ).setOrigin(0.5, 0)

                itemUIs.push({
                    id: item.id,
                    type: item.type,
                    img,
                    border,
                    priceText
                })


                img.on("pointerdown", () => {

                    SoundService.play("click")

                    // 👉 önce owned kontrol
                    if(PlayerService.hasItem(item.id))
                    {
                        // SELECT YOK
                        selectedItem = null

                        clearAllBorders()

                        if(item.type === "board")
                            PlayerService.equipBoard(item.id)

                        refreshUI()
                        return
                    }

                    // 👉 sadece satın alınmamışsa select
                    selectedItem = item

                    clearAllBorders()
                    border.setAlpha(1)

                
                })
            })
        }

        //renderGroup(pathItems, pathStartY)
        renderGroup(boardItems, boardStartY)

// =========================
// BUY BUTTON (IMAGE)
// =========================
const buyBtn = this.add.image(
    width / 2 - 150,
    height - 450,
    "btn_buy" // 👉 bunu değiştirirsin
)
.setScale(0.5)
.setInteractive()

this.addButtonEffects(buyBtn)


buyBtn.on("pointerdown", () => {

    if(!selectedItem) return

    SoundService.play("click")

    if(PlayerService.hasItem(selectedItem.id))
    {
        if(selectedItem.type === "path")
            PlayerService.equipPath(selectedItem.id)

        if(selectedItem.type === "board")
            PlayerService.equipBoard(selectedItem.id)

        refreshUI()
        return
    }

    const success = PlayerService.buyItem(selectedItem)

    if(success)
    {
        if(selectedItem.type === "path")
            PlayerService.equipPath(selectedItem.id)

        if(selectedItem.type === "board")
            PlayerService.equipBoard(selectedItem.id)

        refreshUI()
    }
    else
    {
        this.tweens.add({
            targets: goldText,
            scale: 1.1,
            duration: 90,
            yoyo: true
        })
    }
})


// =========================
// RESET BUTTON (IMAGE)
// =========================
const resetBtn = this.add.image(
    width / 2 + 150,
    height - 450,
    "btn_reset" // 👉 bunu değiştirirsin
)
.setScale(0.5)
.setInteractive()




        this.addButtonEffects(resetBtn)

        resetBtn.on("pointerdown", () => {

            SoundService.play("click")

            PlayerService.resetProgress()
            localStorage.removeItem("tutorial_done")
            selectedItem = null
            refreshUI()
        })

        refreshUI()
    }

    addButtonEffects(btn: Phaser.GameObjects.Image)
    {
        btn.on("pointerover", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale * 1.1,
                duration: 120
            })
        })

        btn.on("pointerout", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale / 1.1,
                duration: 120
            })
        })

        btn.on("pointerdown", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale * 0.9,
                duration: 80
            })
        })

        btn.on("pointerup", () => {
            this.tweens.add({
                targets: btn,
                scale: btn.scale / 0.9,
                duration: 80
            })
        })
    }


}