/**
 * File: src/services/RewardService.ts
 * Purpose:
 * - Rewarded reklam haklarını yönetir (limit + cooldown + exploit koruma)
 */

import { GameConfig } from "../config/GameConfig"

type RewardState = {
    used: number
    timestamps: number[]
}

export default class RewardService {

    static KEY = "reward_state"

    /**
     * Mevcut state al (SAFE + EXPLOIT KORUMA)
     */
    static getState(): RewardState {

        const raw = localStorage.getItem(this.KEY)

        if (!raw) {
            return { used: 0, timestamps: [] }
        }

        let state: RewardState

        try {
            state = JSON.parse(raw)
        } catch {
            // JSON bozuksa reset
            return { used: 0, timestamps: [] }
        }

        // 🔒 structure validation
        if (
            typeof state.used !== "number" ||
            !Array.isArray(state.timestamps)
        ) {
            return { used: 0, timestamps: [] }
        }

        // 🔒 invalid timestamp temizliği
        state.timestamps = state.timestamps.filter(t =>
            typeof t === "number" && t > 0
        )

        // 🔥 cooldown temizliği
        state = this.cleanup(state)

        // 🔒 max limit clamp (exploit fix)
        if (state.used > GameConfig.REWARDED.maxViews) {
            state.used = GameConfig.REWARDED.maxViews
            state.timestamps = state.timestamps.slice(-state.used)
        }

        // temizlenmiş state’i geri kaydet
        this.saveState(state)

        return state
    }

    /**
     * State kaydet
     */
    static saveState(state: RewardState) {
        localStorage.setItem(this.KEY, JSON.stringify(state))
    }

    /**
     * Cooldown temizliği yap
     */
    static cleanup(state: RewardState): RewardState {

        const now = Date.now()

        const valid = state.timestamps.filter(t => {
            return now - t < GameConfig.REWARDED.cooldownMs
        })

        return {
            used: valid.length,
            timestamps: valid
        }
    }

    /**
     * Kaç hak kaldı
     */
    static getRemaining(): number {

        let state = this.getState()

        return Math.max(
            0,
            GameConfig.REWARDED.maxViews - state.used
        )
    }

    /**
     * Reklam izlenebilir mi
     */
    static canWatch(): boolean {
        return this.getRemaining() > 0
    }

    /**
     * Reklam izlendikten sonra çağır
     */
    static registerWatch() {

        let state = this.getState()

        const now = Date.now()

        state.timestamps.push(now)

        state = this.cleanup(state)

        // 🔒 tekrar limit clamp
        if (state.used > GameConfig.REWARDED.maxViews) {
            state.timestamps = state.timestamps.slice(
                -GameConfig.REWARDED.maxViews
            )
            state.used = GameConfig.REWARDED.maxViews
        }

        this.saveState(state)
    }

    /**
     * Debug reset (opsiyonel)
     */
    static reset() {
        localStorage.removeItem(this.KEY)
    }
}