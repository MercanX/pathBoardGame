/**
 * File: src/controllers/ChangeCardController.ts
 * File Name: ChangeCardController.ts
 * Purpose:
 * - Kart değiştirme popup UI'ını yönetir
 *
 * Usage:
 * - GameScene içinde çağrılır
 * - CHANGE butonuna basıldığında popup açılır
 *
 * Notes:
 * - Sadece UI oluşturur (logic yok)
 * - 4x3 grid (12 slot) içerir
 * - Kart seçim sistemi daha sonra eklenecek
 */

import Phaser from "phaser"

export default class ChangeCardController
{
    scene: Phaser.Scene
    uiLayer: Phaser.GameObjects.Container

    popup?: Phaser.GameObjects.Container

    constructor(
        scene: Phaser.Scene,
        uiLayer: Phaser.GameObjects.Container
    )
    {
        this.scene = scene
        this.uiLayer = uiLayer
    }

    open()
    {
        const width = this.scene.scale.width
        const height = this.scene.scale.height

        // varsa eski popup kapat
        if (this.popup)
        {
            this.popup.destroy()
            this.popup = undefined
        }

        const container = this.scene.add.container(0, 0)
        this.uiLayer.add(container)
        this.popup = container

        // =========================
        // OVERLAY
        // =========================
        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width + 100,
            height + 100,
            0x000000,
            0.6
        )
        .setInteractive()
        .setDepth(1000)

        // =========================
        // PANEL
        // =========================
        const panelW = width * 0.9
        const panelH = height * 0.6

        const panel = this.scene.add.rectangle(
            width / 2,
            height / 2,
            panelW,
            panelH,
            0x111827,
            0.95
        )
        .setStrokeStyle(3, 0x3a4654)
        .setDepth(1001)

        // =========================
        // GRID (4x3)
        // =========================
        const cols = 4
        const rows = 3
        const gap = 12

        const cellW = (panelW - gap * (cols + 1)) / cols
        const cellH = (panelH - gap * (rows + 1)) / rows

        const startX = width / 2 - panelW / 2 + gap + cellW / 2
        const startY = height / 2 - panelH / 2 + gap + cellH / 2

        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < cols; c++)
            {
                const x = startX + c * (cellW + gap)
                const y = startY + r * (cellH + gap)

                const slot = this.scene.add.rectangle(
                    x,
                    y,
                    cellW,
                    cellH,
                    0x0b1220,
                    0
                )
                .setStrokeStyle(2, 0x3a4654)
                .setDepth(1002)

                container.add(slot)
            }
        }

        // =========================
        // CLOSE
        // =========================
        overlay.on("pointerdown", () => {
            container.destroy()
            this.popup = undefined
        })

        container.add([overlay, panel])
    }
}