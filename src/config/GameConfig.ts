/**
 * File: src/config/GameConfig.ts
 * File Name: GameConfig.ts
 * Purpose:
 * - Oyun genelinde kullanılan tüm sabitleri ve ayarları merkezi olarak yönetir.
 *
 * Usage:
 * - Bot davranış süreleri
 * - Başlangıç değerleri (altın vb.)
 * - Görsel ayarlar (renkler)
 * - Debug ayarları
 * - Reklam ve ödül sistemi (Rewarded Ads)
 *
 * Notes:
 * - Tüm global config değerleri buradan kontrol edilir
 * - Hardcode kullanımını azaltmak için kullanılır
 * - Monetization (reklam) sistemi buradan yönetilir
 */

export const GameConfig =
{
    BOT_THINK_MIN: 1907,
    BOT_THINK_MID: 2907,
    BOT_THINK_MAX: 6123,

    BOT_AFTER_MOVE_DELAY: 1000,
    BOT_GHOST_DELAY: 1111,

    START_GOLD: 750,
    
    HUMAN_PATH_COLOR: 0x3399ff,
    BOT_PATH_COLOR: 0xff0000,

    DEBUG: false,

    // 🔥 EKLENDİ
    REWARDED: {
        maxViews: 5,
        cooldownMs: 5 * 60 * 1000,
        rewardGold: 50
    },

    CHANGE: {
        oneCard: 50,
        twoCard: 90,
        reroll: 120
    }
}