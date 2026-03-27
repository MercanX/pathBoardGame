/**
 * File: src/services/AdService.ts
 * File Name: AdService.ts
 * Purpose:
 * - AdMob reklam yönetimini merkezi olarak kontrol eder
 *
 * Usage:
 * - Banner reklam gösterme / gizleme
 * - Rewarded (ödüllü video) reklam oynatma
 *
 * Notes:
 * - Test Ad ID'ler kullanılmaktadır (ban yememek için)
 * - Production’da gerçek AdMob ID ile değiştirilmelidir
 * - Bu servis sadece reklamı gösterir, ödül mantığı burada değildir
 */

import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    RewardAdOptions
} from '@capacitor-community/admob'

export default class AdService {

    /**
     * AdMob başlatılır
     * Uygulama açılırken 1 kere çağrılması yeterlidir
     */
    static async init() {
        await AdMob.initialize()
    }

    /**
     * Alt banner reklamı gösterir
     * Genelde ana menü veya sabit ekranlarda kullanılır
     */
    static async showBanner() {

        const options: BannerAdOptions = {
            adId: "ca-app-pub-3940256099942544/6300978111", // TEST Banner ID
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER
        }

        await AdMob.showBanner(options)
    }

    /**
     * Banner reklamı gizler
     * Örneğin gameplay sırasında kaldırmak için kullanılır
     */
    static async hideBanner() {
        await AdMob.hideBanner()
    }

    /**
     * Rewarded (ödüllü video reklam) gösterir
     *
     * @returns boolean → reklam başarıyla izlendiyse true döner
     *
     * Kullanım:
     * const success = await AdService.showRewarded()
     * if(success) → ödül ver
     */
    static async showRewarded(): Promise<boolean> {

        try {

            const options: RewardAdOptions = {
                adId: "ca-app-pub-3940256099942544/5224354917" // TEST Rewarded ID
            }

            // Reklamı hazırla
            await AdMob.prepareRewardVideoAd(options)

            // Reklamı göster
            await AdMob.showRewardVideoAd()

            return true

        } catch (error) {

            console.log("Rewarded Ad Error:", error)

            return false
        }
    }
}