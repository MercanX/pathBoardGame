/**
 * File: src/controllers/EffectController.ts
 * Purpose: Oyun içi tüm visual efektleri yönetir
 * Usage:
 * - Confetti
 * - Shake
 * - Flash
 * - Future effects
 */

import Phaser from "phaser"
import GameScene from "../scenes/GameScene"

export default class EffectController
{
    scene: GameScene
    uiLayer: Phaser.GameObjects.Container

constructor(
    scene: GameScene,
    uiLayer: Phaser.GameObjects.Container
)
    {
        this.scene = scene
        this.uiLayer = uiLayer
    }


    addConfettiExplosion(x: number, y: number)
    {
        const particles = this.scene.add.particles(x, y, "confetti", {

            angle: { min: 0, max: 360 },

            speed: { min: 400, max: 900 },

            scale: { start: 0.2, end: 0.3 },

            rotate: { min: 0, max: 360 },

            gravityY: 500,

            lifespan: { min: 1500, max: 2500 },

            // 💥 EN KRİTİK KISIM
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 80)
            } as Phaser.Types.GameObjects.Particles.EmitZoneData
        })

        particles.setDepth(999)

        particles.emitParticle(150)

        this.scene.time.delayedCall(5000, () => {
            particles.destroy()
        })
    }


    /**
     * 🎉 CONFETTI RAIN
     */
confetti()
{
    const particles = this.scene.add.particles(0, 0, "confetti", {

        x: { min: 0, max: this.scene.scale.width },
        y: 0,

        speedY: { min: 200, max: 400 },
        speedX: { min: -120, max: 120 },

        scale: { start: 0.6, end: 0.2 },
        rotate: { min: 0, max: 360 },

        lifespan: 4000,
        gravityY: 200,

        quantity: 3,
        frequency: 80,

        alpha: { start: 1, end: 0.6 }
    })

    particles.setDepth(999999)        // UI'nin üstünde garanti
    particles.setScrollFactor(0)      // kamera bağımsız

    // 👇 CRITICAL
   // this.scene.boardCamera.ignore(particles)

    this.scene.time.delayedCall(5000, () => {
        particles.destroy()
    })
}
    /**
     * 💥 SHAKE (LOSE)
     */
    shake(duration:number = 300)
    {
        this.scene.cameras.main.shake(duration, 0.01)
    }

    /**
     * ⚡ FLASH
     */
    flash(color:number = 0xffffff, duration:number = 200)
    {
        this.scene.cameras.main.flash(duration, 
            (color >> 16) & 255,
            (color >> 8) & 255,
            color & 255
        )
    }
}