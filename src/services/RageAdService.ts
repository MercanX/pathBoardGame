/**
 * File: src/services/RageAdService.ts
 * File Name: RageAdService.ts
 * Purpose:
 * - Oyuncunun kaybetme sebebine göre Game Over sonrası
 *   interstitial reklam gösterilip gösterilmeyeceğini belirler
 *
 * Usage:
 * - OUT_OF_BOARD durumunda daha yüksek reklam şansı
 * - DEAD_END durumunda orta seviye reklam şansı
 * - Normal kayıplarda düşük reklam şansı
 *
 * Notes:
 * - Bu servis sadece reklam gösterim kararı verir
 * - Reklamı gerçekten gösterme işlemi AdService içinden yapılmalıdır
 * - Oranlar ileride retention / monetization testlerine göre değiştirilebilir
 */

export default class RageAdService
{
    static shouldShowAfterLose(reason: string): boolean
    {
        if (reason === "OUT_OF_BOARD")
            return Math.random() < 0.8

        if (reason === "DEAD_END")
            return Math.random() < 0.4

        return Math.random() < 0.1
    }
}