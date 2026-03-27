/**
 * File: src/services/RewardService.ts
 * Purpose:
 * - Rewarded reklam haklarını yönetir (limit + cooldown)
 */

import { GameConfig } from "../config/GameConfig"

type RewardState = {
    used: number
    timestamps: number[]
}

export default class RewardService {

    static KEY = "reward_state"

    /**
     * Mevcut state al
     */
    static getState(): RewardState {

        const raw = localStorage.getItem(this.KEY)

        if (!raw) {
            return { used: 0, timestamps: [] }
        }

        return JSON.parse(raw)
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
        state = this.cleanup(state)
        this.saveState(state)

        return GameConfig.REWARDED.maxViews - state.used
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

        state.timestamps.push(Date.now())

        state = this.cleanup(state)

        this.saveState(state)
    }
}