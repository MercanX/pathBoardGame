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

        return new Promise(async (resolve) => {

            let rewardEarned = false

            const rewardListener = await (AdMob as any).addListener(
                "onRewardedVideoAdReward",
                () => {
                    rewardEarned = true
                }
            )

            const closeListener = await (AdMob as any).addListener(
                "onRewardedVideoAdDismissed",
                () => {

                    rewardListener.remove()
                    closeListener.remove()

                    resolve(rewardEarned)
                }
            )

            try {

                await AdMob.prepareRewardVideoAd({
                    adId: "ca-app-pub-3940256099942544/5224354917"
                })

                await AdMob.showRewardVideoAd()

            } catch (e) {

                rewardListener.remove()
                closeListener.remove()

                resolve(false)
            }

        })
    }


    static async showInterstitial()
    {
        try {

            await AdMob.prepareInterstitial({
                adId: "ca-app-pub-3940256099942544/1033173712" // TEST ID
            })

            await AdMob.showInterstitial()

        } catch (e) {

            console.log("Interstitial error:", e)

        }
    }

    static async preloadRewarded() {
        try {
            await AdMob.prepareRewardVideoAd({
                adId: "ca-app-pub-3940256099942544/5224354917"
            })
            console.log("✅ Rewarded hazır")
        } catch (e) {
            console.log("❌ preload error", e)
        }
    }

}