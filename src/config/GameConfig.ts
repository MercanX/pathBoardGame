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
    BASEW: 1080,
    BASEH: 1920,

    BOT_THINK_MIN: 1907,
    BOT_THINK_MID: 2907,
    BOT_THINK_MAX: 6123,

    BOT_AFTER_MOVE_DELAY: 1000,
    BOT_GHOST_DELAY: 1111,

    START_GOLD: 3500,
    
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
    },

    CARD_POOLS:
    {
        default:
        [
            "card_01",
            "card_02",
            "card_03",
            "card_04",
            "card_05",
            "card_06",

            "card_07",
            "card_08",
            "card_09",

            "card_11",
            "card_13",
            "card_14",

            "card_15",
            "card_16",
            "card_17",
            "card_18",
            "card_19",

            "card_20",
            "card_21",
            "card_22",
            "card_23",
            "card_24",

            "card_25",
            "card_26",
            "card_27",

            "card_29",
            "card_30",
            "card_31",

            "card_35",
            "card_38",

            "card_48",
            "card_55",
            "card_57",


        ],

        balance:
        [
            "card_02",
            "card_03",
            "card_04",
            "card_05",
            "card_07",
            "card_08",
            "card_10",
            "card_11",
            "card_15",
            "card_20",
            "card_21",
            "card_25",
            "card_26",
            "card_27",
            "card_30",
            "card_32",
            "card_33",
            "card_36",
            "card_37",
            "card_39",
            "card_41",
            "card_44",
            "card_46",
            "card_51",
            "card_55",
            "card_56",
            "card_57",
            "card_61"
        ],
        old:
        [
            "card_04",
            "card_07",
            "card_08",
            "card_11",
            "card_25",
            "card_27",
            "card_30",
            "card_32",
            "card_33",
            "card_36",
            "card_37",
            "card_39",
            "card_41",
            "card_44",
            "card_46",
            "card_51",
            "card_55",
            "card_56",
            "card_57",
            "card_61"
        ]
    }

    
}